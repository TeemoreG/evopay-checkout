<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckoutSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CheckoutSessionController extends Controller
{
    /**
     * POST /api/v1/checkout/sessions
     * Create a new hosted checkout session for an authenticated merchant.
     */
    public function store(Request $request): JsonResponse
    {
        $merchant = $request->attributes->get('merchant');
        $apiKey = $request->attributes->get('api_key');

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1',
            'currency' => 'nullable|string|size:3',
            'merchant_reference' => 'required|string|max:100',
            'customer' => 'nullable|array',
            'customer.name' => 'nullable|string|max:255',
            'customer.email' => 'nullable|email|max:255',
            'customer.phone' => 'nullable|string|max:20',
            'return_url' => 'nullable|url|max:2048',
            'cancel_url' => 'nullable|url|max:2048',
            'webhook_url' => 'nullable|url|max:2048',
            'metadata' => 'nullable|array',
            'expires_in_minutes' => 'nullable|integer|min:5|max:1440',
        ], [
            'amount.required' => 'Payment amount is required.',
            'amount.min' => 'Payment amount must be at least 1.00.',
            'merchant_reference.required' => 'A unique order/invoice reference from your system is required.',
            'customer.email.email' => 'Customer email format is invalid.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $mode = $apiKey->mode ?? 'live';
        $token = CheckoutSession::generateToken($mode);
        $expiresInMinutes = (int) ($request->input('expires_in_minutes', 120)); // default 2 hours

        $session = CheckoutSession::create([
            'token' => $token,
            'merchant_id' => $merchant->id,
            'merchant_reference' => (string) $request->input('merchant_reference'),
            'amount' => round((float) $request->input('amount'), 2),
            'currency' => strtoupper($request->input('currency', 'KES')),
            'customer' => $request->input('customer', []),
            'return_url' => $request->input('return_url', $merchant->default_return_url),
            'cancel_url' => $request->input('cancel_url', $merchant->default_cancel_url),
            'webhook_url' => $request->input('webhook_url', $merchant->webhook_url),
            'status' => 'pending',
            'metadata' => $request->input('metadata', []),
            'expires_at' => now()->addMinutes($expiresInMinutes),
        ]);

        $checkoutUrl = url("/c/{$token}");

        return response()->json([
            'status' => 'success',
            'message' => 'Checkout session initialized successfully.',
            'data' => [
                'token' => $session->token,
                'checkout_url' => $checkoutUrl,
                'merchant_reference' => $session->merchant_reference,
                'amount' => $session->amount,
                'currency' => $session->currency,
                'status' => $session->status,
                'expires_at' => $session->expires_at?->toIso8601String(),
                'created_at' => $session->created_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * GET /api/v1/checkout/sessions/{token}
     * Verify payment status using the session token.
     */
    public function show(Request $request, string $token): JsonResponse
    {
        $merchant = $request->attributes->get('merchant');

        $session = CheckoutSession::where('token', $token)
            ->where('merchant_id', $merchant->id)
            ->first();

        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Checkout session not found.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'token' => $session->token,
                'merchant_reference' => $session->merchant_reference,
                'amount' => $session->amount,
                'currency' => $session->currency,
                'status' => $session->status,
                'payment_method' => $session->payment_method,
                'mpesa_receipt' => $session->mpesa_receipt,
                'failure_reason' => $session->failure_reason,
                'customer' => $session->customer,
                'metadata' => $session->metadata,
                'paid_at' => $session->paid_at?->toIso8601String(),
                'created_at' => $session->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * GET /api/v1/checkout/sessions/reference/{reference}
     * Verify payment status using the merchant's internal order reference.
     */
    public function showByReference(Request $request, string $reference): JsonResponse
    {
        $merchant = $request->attributes->get('merchant');

        $session = CheckoutSession::where('merchant_reference', $reference)
            ->where('merchant_id', $merchant->id)
            ->latest()
            ->first();

        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'No session found for this reference.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'token' => $session->token,
                'merchant_reference' => $session->merchant_reference,
                'amount' => $session->amount,
                'currency' => $session->currency,
                'status' => $session->status,
                'payment_method' => $session->payment_method,
                'mpesa_receipt' => $session->mpesa_receipt,
                'failure_reason' => $session->failure_reason,
                'customer' => $session->customer,
                'metadata' => $session->metadata,
                'paid_at' => $session->paid_at?->toIso8601String(),
                'created_at' => $session->created_at->toIso8601String(),
            ],
        ]);
    }
}