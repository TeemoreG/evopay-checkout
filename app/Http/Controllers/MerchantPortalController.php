<?php

namespace App\Http\Controllers;

use App\Jobs\DispatchMerchantWebhook;
use App\Models\ApiKey;
use App\Models\CheckoutSession;
use App\Models\WebhookDelivery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MerchantPortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $merchant = $request->user()->merchant;

        $sessions = CheckoutSession::where('merchant_id', $merchant->id)
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'token' => $s->token,
                'merchant_reference' => $s->merchant_reference,
                'amount' => (float) $s->amount,
                'currency' => $s->currency,
                'status' => $s->status,
                'payment_method' => $s->payment_method,
                'mpesa_receipt' => $s->mpesa_receipt,
                'failure_reason' => $s->failure_reason,
                'customer' => $s->customer ?? [],
                'paid_at' => $s->paid_at?->toIso8601String(),
                'created_at' => $s->created_at->toIso8601String(),
            ]);

        $paidQuery = CheckoutSession::where('merchant_id', $merchant->id)->where('status', 'paid');
        $grossPaid = (float) (clone $paidQuery)->sum('amount');
        $feePercent = (float) $merchant->fee_percent;
        $totalFees = round(($grossPaid * $feePercent) / 100, 2);

        // Calculate withdrawals
        $withdrawn = (float) DB::table('settlements')
            ->where('merchant_id', $merchant->id)
            ->whereIn('status', ['pending', 'processing', 'completed'])
            ->sum('amount');

        // Calculate refunds
        $refunded = (float) DB::table('refunds')
            ->where('merchant_id', $merchant->id)
            ->where('status', 'completed')
            ->sum('amount');

        $availableBalance = max(0, round($grossPaid - $totalFees - $withdrawn - $refunded, 2));

        $settlements = DB::table('settlements')
            ->where('merchant_id', $merchant->id)
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Merchant/Dashboard', [
            'merchant' => [
                'name' => $merchant->name,
                'slug' => $merchant->slug,
                'logo_url' => $merchant->logo_url,
                'fee_percent' => $feePercent,
                'settlement_details' => $merchant->settlement_details ?? [],
            ],
            'wallet' => [
                'available_balance' => $availableBalance,
                'gross_volume' => $grossPaid,
                'total_fees' => $totalFees,
                'total_withdrawn' => $withdrawn,
                'total_refunded' => $refunded,
            ],
            'stats' => [
                'total_volume' => $grossPaid,
                'paid_count' => (clone $paidQuery)->count(),
                'total_count' => CheckoutSession::where('merchant_id', $merchant->id)->count(),
            ],
            'sessions' => $sessions,
            'settlements' => $settlements,
        ]);
    }

    public function withdraw(Request $request)
    {
        $merchant = $request->user()->merchant;

        $data = $request->validate([
            'amount' => 'required|numeric|min:100',
            'channel' => 'required|in:mpesa,bank',
            'phone' => 'required_if:channel,mpesa|nullable|string|max:20',
            'bank_name' => 'required_if:channel,bank|nullable|string|max:100',
            'account_number' => 'required_if:channel,bank|nullable|string|max:50',
        ]);

        // Compute live available balance atomically
        $grossPaid = (float) CheckoutSession::where('merchant_id', $merchant->id)->where('status', 'paid')->sum('amount');
        $totalFees = round(($grossPaid * (float) $merchant->fee_percent) / 100, 2);
        $withdrawn = (float) DB::table('settlements')
            ->where('merchant_id', $merchant->id)
            ->whereIn('status', ['pending', 'processing', 'completed'])
            ->sum('amount');
        $refunded = (float) DB::table('refunds')
            ->where('merchant_id', $merchant->id)
            ->where('status', 'completed')
            ->sum('amount');

        $available = max(0, round($grossPaid - $totalFees - $withdrawn - $refunded, 2));

        if ((float) $data['amount'] > $available) {
            return back()->withErrors([
                'amount' => 'Requested withdrawal exceeds your available wallet balance of KES ' . number_format($available, 2),
            ]);
        }

        $destination = $data['channel'] === 'mpesa'
            ? ['phone' => preg_replace('/[\s\-]+/', '', $data['phone'])]
            : ['bank_name' => $data['bank_name'], 'account_number' => $data['account_number']];

        DB::table('settlements')->insert([
            'merchant_id' => $merchant->id,
            'amount' => round((float) $data['amount'], 2),
            'currency' => 'KES',
            'channel' => $data['channel'],
            'destination' => json_encode($destination),
            'status' => 'pending',
            'reference' => 'SET-' . strtoupper(Str::random(8)),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Withdrawal request submitted for settlement.');
    }

    public function refund(Request $request, CheckoutSession $session)
    {
        $merchant = $request->user()->merchant;

        if ($session->merchant_id !== $merchant->id) {
            abort(403);
        }

        if ($session->status !== 'paid') {
            return back()->withErrors(['refund' => 'Only fully paid sessions can be refunded.']);
        }

        $data = $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($merchant, $session, $data) {
            $session->update([
                'status' => 'refunded',
                'failure_reason' => $data['reason'] ?? 'Refund issued by merchant.',
            ]);

            DB::table('refunds')->insert([
                'merchant_id' => $merchant->id,
                'checkout_session_id' => $session->id,
                'amount' => $session->amount,
                'currency' => $session->currency,
                'reason' => $data['reason'] ?? 'Merchant initiated refund',
                'status' => 'completed',
                'reference' => 'REF-' . strtoupper(Str::random(8)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DispatchMerchantWebhook::dispatch($session, 'payment.refunded');
        });

        return redirect()->back()->with('success', "Session {$session->merchant_reference} has been refunded.");
    }

    public function developers(Request $request)
    {
        $merchant = $request->user()->merchant;

        $apiKeys = $merchant->apiKeys()
            ->latest()
            ->get()
            ->map(fn ($k) => [
                'id' => $k->id,
                'name' => $k->name,
                'public_key' => $k->public_key,
                'secret_key_prefix' => $k->secret_key_prefix,
                'mode' => $k->mode,
                'is_active' => $k->is_active,
                'last_used_at' => $k->last_used_at?->toIso8601String(),
                'created_at' => $k->created_at->toIso8601String(),
            ]);

        $deliveries = WebhookDelivery::with('checkoutSession:id,token,merchant_reference')
            ->where('merchant_id', $merchant->id)
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'event' => $d->event,
                'url' => $d->url,
                'response_code' => $d->response_code,
                'error' => $d->error,
                'attempts' => $d->attempts,
                'delivered_at' => $d->delivered_at?->toIso8601String(),
                'created_at' => $d->created_at->toIso8601String(),
                'merchant_reference' => $d->checkoutSession?->merchant_reference,
                'session_token' => $d->checkoutSession?->token,
            ]);

        return Inertia::render('Merchant/Developers', [
            'merchant' => [
                'name' => $merchant->name,
                'email' => $merchant->email,
                'logo_url' => $merchant->logo_url,
                'webhook_url' => $merchant->webhook_url,
                'webhook_secret' => $merchant->webhook_secret,
                'default_return_url' => $merchant->default_return_url,
                'default_cancel_url' => $merchant->default_cancel_url,
            ],
            'apiKeys' => $apiKeys,
            'deliveries' => $deliveries,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $merchant = $request->user()->merchant;

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'logo_url' => 'nullable|url|max:2048',
            'webhook_url' => 'nullable|url|max:2048',
            'default_return_url' => 'nullable|url|max:2048',
            'default_cancel_url' => 'nullable|url|max:2048',
        ]);

        $merchant->update($data);

        return redirect()->back()->with('success', 'Merchant settings updated.');
    }

    public function createApiKey(Request $request)
    {
        $merchant = $request->user()->merchant;

        $data = $request->validate([
            'name' => 'required|string|max:100',
            'mode' => 'required|in:live,test',
        ]);

        $keys = $merchant->createApiKey($data['name'], $data['mode']);

        return response()->json([
            'status' => 'success',
            'public_key' => $keys['public_key'],
            'secret_key' => $keys['secret_key'],
        ]);
    }

    public function revokeApiKey(Request $request, ApiKey $apiKey)
    {
        $merchant = $request->user()->merchant;

        if ($apiKey->merchant_id !== $merchant->id) {
            abort(403);
        }

        $apiKey->update(['is_active' => false]);

        return redirect()->back();
    }

    public function rotateWebhookSecret(Request $request)
    {
        $merchant = $request->user()->merchant;
        $newSecret = 'whsec_' . Str::random(32);
        $merchant->update(['webhook_secret' => $newSecret]);

        return response()->json([
            'status' => 'success',
            'webhook_secret' => $newSecret,
        ]);
    }

    public function retryWebhook(Request $request, WebhookDelivery $delivery)
    {
        $merchant = $request->user()->merchant;

        if ($delivery->merchant_id !== $merchant->id || !$delivery->checkoutSession) {
            abort(403);
        }

        DispatchMerchantWebhook::dispatch($delivery->checkoutSession, $delivery->event);

        return redirect()->back();
    }
}