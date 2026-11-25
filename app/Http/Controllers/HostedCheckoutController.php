<?php

namespace App\Http\Controllers;

use App\Jobs\DispatchMerchantWebhook;
use App\Models\CheckoutSession;
use App\Services\MpgsService;
use App\Services\MpesaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class HostedCheckoutController extends Controller
{
    /**
     * GET /c/{token}
     * Render the hosted payment method selector branded with the merchant.
     */
    public function show(string $token): Response|\Illuminate\Http\RedirectResponse
    {
        $session = CheckoutSession::with('merchant')->where('token', $token)->firstOrFail();

        if ($session->isPaid()) {
            return $this->redirectToMerchantSuccess($session);
        }

        if ($session->isExpired()) {
            return Inertia::render('Gateway/Expired', [
                'session' => [
                    'token' => $session->token,
                    'merchant_reference' => $session->merchant_reference,
                    'cancel_url' => $session->cancel_url,
                ],
                'merchant' => [
                    'name' => $session->merchant->name,
                    'logo_url' => $session->merchant->logo_url,
                ],
            ]);
        }

        return Inertia::render('Gateway/Pay', [
            'session' => [
                'token' => $session->token,
                'merchant_reference' => $session->merchant_reference,
                'amount' => (float) $session->amount,
                'currency' => $session->currency,
                'status' => $session->status,
                'failure_reason' => $session->failure_reason,
                'customer' => $session->customer ?? [],
                'cancel_url' => $session->cancel_url,
            ],
            'merchant' => [
                'name' => $session->merchant->name,
                'logo_url' => $session->merchant->logo_url,
            ],
        ]);
    }

    /**
     * GET /c/{token}/mpesa
     * Render the hosted M-Pesa phone prompt screen.
     */
    public function mpesaShow(string $token): Response|\Illuminate\Http\RedirectResponse
    {
        $session = CheckoutSession::with('merchant')->where('token', $token)->firstOrFail();

        if ($session->isPaid()) {
            return $this->redirectToMerchantSuccess($session);
        }

        if ($session->isExpired()) {
            return redirect()->route('gateway.show', $token);
        }

        return Inertia::render('Gateway/MpesaPay', [
            'session' => [
                'token' => $session->token,
                'merchant_reference' => $session->merchant_reference,
                'amount' => (float) $session->amount,
                'currency' => $session->currency,
                'status' => $session->status,
                'customer_phone' => $session->customer['phone'] ?? '',
                'customer_name' => $session->customer['name'] ?? '',
            ],
            'merchant' => [
                'name' => $session->merchant->name,
                'logo_url' => $session->merchant->logo_url,
            ],
        ]);
    }

    /**
     * POST /c/{token}/mpesa/stk-push
     * Trigger M-Pesa STK Push for this session.
     */
    public function mpesaStkPush(Request $request, string $token, MpesaService $mpesa): JsonResponse
    {
        $session = CheckoutSession::where('token', $token)->firstOrFail();

        if ($session->isPaid()) {
            return response()->json([
                'status' => 'paid',
                'message' => 'Payment already completed.',
            ]);
        }

        if ($session->isExpired()) {
            return response()->json([
                'status' => 'expired',
                'error' => 'Checkout session has expired.',
            ], 410);
        }

        $request->validate([
            'phone' => 'required|string|min:9|max:15',
        ]);

        $phone = preg_replace('/[\s\-]+/', '', trim($request->input('phone')));
        $accountRef = substr(preg_replace('/[^a-zA-Z0-9]/', '', $session->merchant_reference), 0, 12) ?: 'EVOPAY';

        try {
            $response = $mpesa->stkPush($phone, $session->amount, $accountRef);

            if (empty($response['CheckoutRequestID']) || ($response['ResponseCode'] ?? null) !== '0') {
                $reason = $response['ResponseDescription'] ?? $response['errorMessage'] ?? 'Failed to send M-Pesa prompt.';
                $session->markAsFailed($reason);

                return response()->json(['error' => $reason], 422);
            }

            $session->update([
                'payment_method' => 'mpesa',
                'status' => 'pending',
                'failure_reason' => null,
                'mpesa_request_id' => $response['CheckoutRequestID'],
            ]);

            Cache::forget("mpesa_query_lock_{$session->token}");

            return response()->json([
                'status' => 'pending',
                'message' => 'STK Push sent! Please enter your M-Pesa PIN.',
            ]);
        } catch (\Exception $e) {
            $session->markAsFailed($e->getMessage());

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /c/{token}/status
     * Polling endpoint with throttled Safaricom STK Query fallback if callback is delayed.
     */
    public function checkStatus(Request $request, string $token, MpesaService $mpesa): JsonResponse
    {
        $session = CheckoutSession::where('token', $token)->firstOrFail();

        if (
            $session->status === 'pending'
            && $session->payment_method === 'mpesa'
            && !empty($session->mpesa_request_id)
        ) {
            $force = $request->boolean('force');
            $secondsSincePrompt = $session->updated_at ? $session->updated_at->diffInSeconds(now()) : 0;
            $shouldQuery = $force || $secondsSincePrompt >= 20;

            if ($shouldQuery && Cache::add("mpesa_query_lock_{$session->token}", true, $force ? 4 : 10)) {
                try {
                    $query = $mpesa->stkQuery($session->mpesa_request_id);

                    $dispatchedEvent = DB::transaction(function () use ($session, $query) {
                        $locked = CheckoutSession::where('id', $session->id)->lockForUpdate()->first();

                        if (!$locked || $locked->status !== 'pending') {
                            return null;
                        }

                        if ($query['state'] === 'paid') {
                            $locked->markAsPaid('mpesa');
                            Log::info("CheckoutSession {$locked->token} confirmed paid via STK Query fallback.");
                            return 'payment.succeeded';
                        }

                        if ($query['state'] === 'failed') {
                            $reason = $this->mapMpesaError(
                                (int) ($query['result_code'] ?? 1),
                                $query['result_desc'] ?? 'M-Pesa payment failed.'
                            );
                            $locked->markAsFailed($reason);
                            Log::warning("CheckoutSession {$locked->token} failed via STK Query ({$query['result_code']}): {$reason}");
                            return 'payment.failed';
                        }

                        return null;
                    });

                    $session->refresh();

                    if ($dispatchedEvent) {
                        DispatchMerchantWebhook::dispatch($session, $dispatchedEvent);
                    }
                } catch (\Throwable $e) {
                    Log::warning("STK Query fallback error for {$session->token}: " . $e->getMessage());
                }
            }
        }

        return response()->json([
            'status' => $session->status,
            'message' => $session->failure_reason,
            'receipt' => $session->mpesa_receipt,
            'redirect_url' => $session->isPaid() ? $this->buildReturnUrl($session) : null,
        ]);
    }

    /**
     * POST /c/{token}/mpgs/init
     * Initialize Mastercard MPGS Hosted Checkout session.
     */
    public function mpgsInit(string $token, MpgsService $mpgs): JsonResponse
    {
        $session = CheckoutSession::with('merchant')->where('token', $token)->firstOrFail();

        if ($session->isPaid()) {
            return response()->json([
                'status' => 'redirect',
                'url' => $this->buildReturnUrl($session),
            ]);
        }

        if ($session->isExpired()) {
            return response()->json([
                'status' => 'expired',
                'error' => 'Checkout session has expired.',
            ], 410);
        }

        try {
            $returnUrl = route('gateway.mpgs.callback', $token);
            $cancelUrl = route('gateway.mpgs.cancel', $token);

            $mpgsSession = $mpgs->createSession(
                $session->amount,
                $session->token,
                $session->currency,
                $returnUrl,
                $cancelUrl
            );

            if (empty($mpgsSession['session']['id'])) {
                throw new \Exception('Card gateway did not return a valid session.');
            }

            $session->update([
                'payment_method' => 'card',
                'status' => 'pending',
                'failure_reason' => null,
                'mpgs_session_id' => $mpgsSession['session']['id'],
            ]);

            if (!empty($mpgsSession['successIndicator'])) {
                Cache::put("mpgs_indicator_{$session->token}", $mpgsSession['successIndicator'], now()->addHours(2));
            }

            return response()->json([
                'status' => 'redirect',
                'url' => route('gateway.mpgs.pay', $token),
            ]);
        } catch (\Exception $e) {
            $session->markAsFailed($e->getMessage());

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /c/{token}/mpgs/pay
     * Render the Blade launcher with Mastercard checkout.min.js.
     */
    public function mpgsPay(string $token, MpgsService $mpgs)
    {
        $session = CheckoutSession::with('merchant')->where('token', $token)->firstOrFail();

        if ($session->isPaid()) {
            return $this->redirectToMerchantSuccess($session);
        }

        if ($session->isExpired()) {
            return redirect()->route('gateway.show', $token);
        }

        if (empty($session->mpgs_session_id)) {
            return redirect()->route('gateway.show', [
                'token' => $token,
                'error' => 'Card session not found. Please try again.',
            ]);
        }

        return view('gateway.mpgs', [
            'session' => $session,
            'merchant' => $session->merchant,
            'sessionId' => $session->mpgs_session_id,
            'checkoutJsUrl' => $mpgs->getCheckoutJsUrl(),
            'cancelUrl' => route('gateway.mpgs.cancel', $token),
        ]);
    }

    /**
     * GET /c/{token}/mpgs/callback
     * Mastercard return URL callback.
     */
    public function mpgsCallback(Request $request, string $token, MpgsService $mpgs)
    {
        $session = CheckoutSession::with('merchant')->where('token', $token)->firstOrFail();

        if ($session->isPaid()) {
            return $this->redirectToMerchantSuccess($session);
        }

        $resultIndicator = (string) $request->query('resultIndicator', '');
        $expectedIndicator = Cache::get("mpgs_indicator_{$session->token}");

        try {
            $mpgsOrder = $mpgs->retrieveOrder($session->token);
            Log::info("MPGS Verification for Session {$session->token}:", $mpgsOrder);

            $gatewaySuccess = ($mpgsOrder['result'] ?? null) === 'SUCCESS'
                && in_array($mpgsOrder['status'] ?? '', ['CAPTURED', 'AUTHORIZED', 'PARTIALLY_CAPTURED'], true);

            $indicatorMatches = $expectedIndicator && $resultIndicator !== ''
                && hash_equals((string) $expectedIndicator, $resultIndicator);

            if ($gatewaySuccess || $indicatorMatches) {
                $shouldDispatch = DB::transaction(function () use ($session) {
                    $locked = CheckoutSession::where('id', $session->id)->lockForUpdate()->first();
                    if (!$locked || $locked->isPaid()) {
                        return false;
                    }
                    $locked->markAsPaid('card');
                    return true;
                });

                Cache::forget("mpgs_indicator_{$session->token}");
                $session->refresh();

                if ($shouldDispatch) {
                    DispatchMerchantWebhook::dispatch($session, 'payment.succeeded');
                }

                return $this->redirectToMerchantSuccess($session);
            }

            $reason = $mpgsOrder['error']['explanation'] ?? 'Card payment was declined.';
            $shouldDispatch = DB::transaction(function () use ($session, $reason) {
                $locked = CheckoutSession::where('id', $session->id)->lockForUpdate()->first();
                if (!$locked || $locked->isPaid()) {
                    return false;
                }
                $locked->markAsFailed($reason);
                return true;
            });

            if ($shouldDispatch) {
                $session->refresh();
                DispatchMerchantWebhook::dispatch($session, 'payment.failed');
            }

            return redirect()->route('gateway.show', [
                'token' => $token,
                'error' => $reason,
            ]);
        } catch (\Exception $e) {
            Log::error("MPGS Callback Error for Session {$session->token}: " . $e->getMessage());
            $shouldDispatch = DB::transaction(function () use ($session) {
                $locked = CheckoutSession::where('id', $session->id)->lockForUpdate()->first();
                if (!$locked || $locked->isPaid()) {
                    return false;
                }
                $locked->markAsFailed('Could not verify card payment.');
                return true;
            });

            if ($shouldDispatch) {
                $session->refresh();
                DispatchMerchantWebhook::dispatch($session, 'payment.failed');
            }

            return redirect()->route('gateway.show', [
                'token' => $token,
                'error' => 'Could not verify card payment. Please try again.',
            ]);
        }
    }

    /**
     * POST /api/webhooks/mpgs
     * Server-to-server webhook from Mastercard MPGS (confirms payments even if customer closes browser).
     */
    public function mpgsWebhook(Request $request): JsonResponse
    {
        $expectedSecret = env('MPGS_WEBHOOK_SECRET');
        $incomingSecret = (string) $request->header('X-Notification-Secret', '');

        if (empty($expectedSecret) || !hash_equals((string) $expectedSecret, $incomingSecret)) {
            Log::warning('MPGS Webhook rejected: Missing or invalid X-Notification-Secret header.');
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        Log::info('MPGS Webhook Received:', $request->all());

        $orderId = $request->input('order.id');
        if (!$orderId) {
            return response()->json(['status' => 'ignored'], 200);
        }

        $session = CheckoutSession::with('merchant')->where('token', $orderId)->first();
        if (!$session || $session->isPaid()) {
            return response()->json(['status' => 'ok'], 200);
        }

        $result = strtoupper((string) $request->input('result', ''));
        $orderStatus = strtoupper((string) $request->input('order.status', ''));

        if (
            $result === 'SUCCESS'
            && in_array($orderStatus, ['CAPTURED', 'AUTHORIZED', 'PARTIALLY_CAPTURED'], true)
        ) {
            $shouldDispatch = DB::transaction(function () use ($session) {
                $locked = CheckoutSession::where('id', $session->id)->lockForUpdate()->first();
                if (!$locked || $locked->isPaid()) {
                    return false;
                }
                $locked->markAsPaid('card');
                return true;
            });

            Cache::forget("mpgs_indicator_{$session->token}");

            if ($shouldDispatch) {
                $session->refresh();
                Log::info("CheckoutSession {$session->token} marked PAID via MPGS Webhook.");
                DispatchMerchantWebhook::dispatch($session, 'payment.succeeded');
            }
        } elseif (
            in_array($result, ['FAILURE', 'ERROR'], true)
            || in_array($orderStatus, ['FAILED', 'CANCELLED'], true)
        ) {
            $reason = $request->input('response.acquirerMessage')
                ?? $request->input('error.explanation')
                ?? 'Card payment was declined.';

            $shouldDispatch = DB::transaction(function () use ($session, $reason) {
                $locked = CheckoutSession::where('id', $session->id)->lockForUpdate()->first();
                if (!$locked || $locked->isPaid()) {
                    return false;
                }
                $locked->markAsFailed($reason);
                return true;
            });

            if ($shouldDispatch) {
                $session->refresh();
                Log::warning("CheckoutSession {$session->token} marked FAILED via MPGS Webhook: {$reason}");
                DispatchMerchantWebhook::dispatch($session, 'payment.failed');
            }
        }

        return response()->json(['status' => 'ok'], 200);
    }

    /**
     * GET /c/{token}/mpgs/cancel
     */
    public function mpgsCancel(string $token)
    {
        $session = CheckoutSession::where('token', $token)->firstOrFail();

        if (!$session->isPaid()) {
            $session->markAsFailed('Card payment was cancelled.');
        }

        if ($session->cancel_url) {
            return redirect()->away($session->cancel_url);
        }

        return redirect()->route('gateway.show', [
            'token' => $token,
            'error' => 'Card payment was cancelled.',
        ]);
    }

    /**
     * GET /c/{token}/success
     * Default receipt page if the merchant did not provide a return_url.
     */
    public function success(string $token): Response
    {
        $session = CheckoutSession::with('merchant')->where('token', $token)->firstOrFail();

        return Inertia::render('Gateway/Success', [
            'session' => [
                'token' => $session->token,
                'merchant_reference' => $session->merchant_reference,
                'amount' => (float) $session->amount,
                'currency' => $session->currency,
                'payment_method' => $session->payment_method,
                'mpesa_receipt' => $session->mpesa_receipt,
                'customer' => $session->customer ?? [],
                'paid_at' => $session->paid_at?->toIso8601String(),
            ],
            'merchant' => [
                'name' => $session->merchant->name,
                'logo_url' => $session->merchant->logo_url,
            ],
        ]);
    }

    private function mapMpesaError(int $code, string $fallback): string
    {
        return match ($code) {
            1 => 'Insufficient M-Pesa balance. Please top up and try again.',
            1032 => 'Payment cancelled. You dismissed the M-Pesa prompt.',
            1037 => 'Your phone could not be reached for the M-Pesa prompt (1037). Ensure your phone is unlocked with cellular signal, then try again.',
            2001 => 'Incorrect M-Pesa PIN entered. Please try again.',
            1019, 1025 => 'M-Pesa request timed out. Please try again.',
            default => $fallback,
        };
    }

    private function buildReturnUrl(CheckoutSession $session): string
    {
        if ($session->return_url) {
            $separator = str_contains($session->return_url, '?') ? '&' : '?';
            return $session->return_url . $separator . http_build_query([
                'session_token' => $session->token,
                'reference' => $session->merchant_reference,
                'status' => 'paid',
            ]);
        }

        return route('gateway.success', $session->token);
    }

    private function redirectToMerchantSuccess(CheckoutSession $session)
    {
        return redirect()->away($this->buildReturnUrl($session));
    }
}