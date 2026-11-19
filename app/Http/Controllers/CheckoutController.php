<?php

namespace App\Http\Controllers;

use App\Jobs\DispatchMerchantWebhook;
use App\Models\CheckoutSession;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index()
    {
        return Inertia::render('Checkout/Index', [
            'price_per_kg' => (float) Setting::get('price_per_kg', 20),
            'price_per_km' => (float) Setting::get('price_per_km', 50),
        ]);
    }

    /**
     * Shop Checkout: Creates local Order, then calls Evopay Gateway API via Secret Key
     * just like any external merchant store.
     */
    public function process(Request $request)
    {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'subtotal' => 'required|numeric',
            'delivery_method' => 'required|string',
            'customer' => 'required|array',
            'customer.name' => 'required|string|max:255',
            'customer.phone' => 'required|string|max:20',
            'customer.email' => 'nullable|email|max:255',
            'delivery' => 'nullable|array',
        ], [
            'items.required' => 'Your cart is empty. Please add items before checking out.',
            'items.min' => 'Your cart is empty. Please add items before checking out.',
            'customer.name.required' => 'Please enter your full name.',
            'customer.phone.required' => 'Please enter your phone number.',
            'customer.email.email' => 'Please enter a valid email address.',
            'delivery_method.required' => 'Please select a delivery method.',
        ]);

        $secretKey = env('EVOPAY_SHOP_SECRET_KEY');
        if (!$secretKey) {
            return response()->json([
                'error' => 'Shop payment gateway is not configured (missing EVOPAY_SHOP_SECRET_KEY in .env).',
            ], 500);
        }

        $deliveryFee = 0;
        $distanceKm = 0;
        $weightFee = 0;
        $distanceFee = 0;

        if ($data['delivery_method'] === 'standard' && !empty($data['delivery']['lat'])) {
            $hqLat = (float) Setting::get('hq_lat', -1.2674);
            $hqLng = (float) Setting::get('hq_lng', 36.7704);
            $pricePerKg = (float) Setting::get('price_per_kg', 20);
            $pricePerKm = (float) Setting::get('price_per_km', 50);

            $distanceKm = $this->calculateDistance(
                $hqLat, $hqLng,
                (float) $data['delivery']['lat'],
                (float) $data['delivery']['lng']
            );

            $totalWeight = collect($data['items'])->reduce(function ($acc, $item) {
                return $acc + ($item['qty'] * (float) ($item['weight'] ?? 0));
            }, 0);

            $weightFee = $totalWeight * $pricePerKg;
            $distanceFee = ceil($distanceKm) * $pricePerKm;

            $deliveryFee = $weightFee + $distanceFee;
        }

        $total = $data['subtotal'] + $deliveryFee;

        // 1. Create Shop Order locally
        $order = Order::create([
            'order_number' => 'ORD-' . strtoupper(Str::random(8)),
            'total_amount' => $total,
            'status' => 'pending',
            'payment_method' => 'evopay_gateway',
            'items' => $data['items'],
            'customer' => $data['customer'],
            'delivery' => array_merge($data['delivery'] ?? [], [
                'method' => $data['delivery_method'],
                'fee' => $deliveryFee,
                'distance_km' => round($distanceKm, 2),
                'weight_fee' => $weightFee,
                'distance_fee' => $distanceFee,
            ]),
        ]);

        // 2. Call Evopay Payment Provider API (/api/v1/checkout/sessions)
        $gatewayUrl = rtrim(env('EVOPAY_GATEWAY_URL', url('/')), '/');

        try {
            $response = Http::withToken($secretKey)
                ->acceptJson()
                ->timeout(15)
                ->post("{$gatewayUrl}/api/v1/checkout/sessions", [
                    'amount' => $total,
                    'currency' => 'KES',
                    'merchant_reference' => $order->order_number,
                    'customer' => [
                        'name' => $data['customer']['name'],
                        'phone' => $data['customer']['phone'],
                        'email' => $data['customer']['email'] ?? null,
                    ],
                    'return_url' => route('checkout.return'),
                    'cancel_url' => route('checkout.index', ['error' => 'Payment was cancelled. You can try again.']),
                    'webhook_url' => route('shop.evopay.webhook'),
                    'metadata' => [
                        'source' => 'nyumba_cement_shop',
                        'delivery_method' => $data['delivery_method'],
                    ],
                ]);

            if ($response->failed() || empty($response->json('data.checkout_url'))) {
                $errMsg = $response->json('message') ?? 'Could not connect to Evopay Payment Gateway.';
                $order->update([
                    'status' => 'failed',
                    'failure_reason' => $errMsg,
                ]);

                return response()->json(['error' => $errMsg], 502);
            }

            // Store the gateway session token on the order for reference
            $order->update([
                'mpesa_request_id' => $response->json('data.token'),
            ]);

            return response()->json([
                'status' => 'redirect',
                'url' => $response->json('data.checkout_url'),
                'order_number' => $order->order_number,
            ]);
        } catch (\Throwable $e) {
            \Log::error("Shop -> Evopay API Error: " . $e->getMessage());
            $order->update([
                'status' => 'failed',
                'failure_reason' => 'Gateway connection error. Please try again.',
            ]);

            return response()->json([
                'error' => 'Unable to reach Evopay Payment Gateway. Please try again.',
            ], 502);
        }
    }

    /**
     * Shop Return URL: Server-to-server verification against Evopay Gateway API
     */
    public function gatewayReturn(Request $request)
    {
        $token = $request->query('session_token');
        $reference = $request->query('reference');

        if (!$token || !$reference) {
            return redirect()->route('checkout.index', ['error' => 'Missing payment verification details.']);
        }

        $order = Order::where('order_number', $reference)->first();
        if (!$order) {
            return redirect()->route('checkout.index', ['error' => 'Order not found.']);
        }

        if ($order->status === 'paid') {
            return redirect()->route('checkout.success', ['order' => $order->order_number]);
        }

        $gatewayUrl = rtrim(env('EVOPAY_GATEWAY_URL', url('/')), '/');
        $secretKey = env('EVOPAY_SHOP_SECRET_KEY');

        try {
            $res = Http::withToken($secretKey)
                ->acceptJson()
                ->timeout(15)
                ->get("{$gatewayUrl}/api/v1/checkout/sessions/{$token}");

            $data = $res->json('data');

            if ($res->successful() && ($data['status'] ?? null) === 'paid') {
                $order->update([
                    'status' => 'paid',
                    'payment_method' => $data['payment_method'] ?? 'evopay',
                    'mpesa_receipt' => $data['mpesa_receipt'] ?? null,
                    'failure_reason' => null,
                ]);

                return redirect()->route('checkout.success', ['order' => $order->order_number]);
            }

            $reason = $data['failure_reason'] ?? 'Payment has not been confirmed yet.';
            return redirect()->route('checkout.index', ['error' => $reason]);
        } catch (\Throwable $e) {
            \Log::error("Shop return verification error: " . $e->getMessage());
            return redirect()->route('checkout.index', ['error' => 'Could not verify payment status.']);
        }
    }

    /**
     * Shop Outbound Webhook Receiver (Evopay -> Shop)
     */
    public function shopWebhook(Request $request)
    {
        $webhookSecret = env('EVOPAY_SHOP_WEBHOOK_SECRET');
        if ($webhookSecret) {
            $signature = (string) $request->header('X-Evopay-Signature', '');
            $expected = 'sha256=' . hash_hmac('sha256', $request->getContent(), $webhookSecret);

            if (!hash_equals($expected, $signature)) {
                \Log::warning('Shop Webhook: Invalid signature received.');
                return response()->json(['message' => 'Invalid signature'], 401);
            }
        }

        $event = $request->input('event');
        $data = $request->input('data', []);
        $reference = $data['merchant_reference'] ?? null;

        if (!$reference) {
            return response()->json(['message' => 'Missing reference'], 400);
        }

        $order = Order::where('order_number', $reference)->first();
        if ($order && $order->status !== 'paid') {
            if ($event === 'payment.succeeded' && ($data['status'] ?? null) === 'paid') {
                $order->update([
                    'status' => 'paid',
                    'payment_method' => $data['payment_method'] ?? 'evopay',
                    'mpesa_receipt' => $data['mpesa_receipt'] ?? null,
                    'failure_reason' => null,
                ]);
                \Log::info("Shop Order {$order->order_number} marked PAID via Evopay webhook.");
            } elseif ($event === 'payment.failed') {
                $order->update([
                    'status' => 'failed',
                    'failure_reason' => $data['failure_reason'] ?? 'Payment failed.',
                ]);
            }
        }

        return response()->json(['status' => 'ok']);
    }

    // Order Receipt Success Page
    public function success(Request $request)
    {
        $orderNumber = $request->query('order');
        $order = $orderNumber ? Order::where('order_number', $orderNumber)->first() : null;

        return Inertia::render('Checkout/Success', [
            'order' => $order ? [
                'order_number' => $order->order_number,
                'total_amount' => (float) $order->total_amount,
                'status' => $order->status,
                'payment_method' => $order->payment_method,
                'mpesa_receipt' => $order->mpesa_receipt,
                'customer' => $order->customer,
                'delivery' => $order->delivery,
                'items' => $order->items,
                'created_at' => $order->created_at?->toIso8601String(),
            ] : null,
        ]);
    }

    // Live distance calculation endpoint for the frontend
    public function getDistance(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $hqLat = (float) Setting::get('hq_lat', -1.2674);
        $hqLng = (float) Setting::get('hq_lng', 36.7704);

        $distanceKm = $this->calculateDistance(
            $hqLat, $hqLng,
            (float) $request->lat,
            (float) $request->lng
        );

        return response()->json([
            'distance_km' => round($distanceKm, 1)
        ]);
    }

    // Safaricom Callback endpoint for Gateway CheckoutSessions
    public function mpesaCallback(Request $request)
    {
        \Log::info('M-Pesa Callback Received:', $request->all());

        $callbackData = $request->input('Body.stkCallback');

        if (!$callbackData || empty($callbackData['CheckoutRequestID'])) {
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Invalid payload']);
        }

        $checkoutRequestId = $callbackData['CheckoutRequestID'];
        $resultCode = (int) ($callbackData['ResultCode'] ?? 1);
        $resultDesc = $callbackData['ResultDesc'] ?? 'Payment failed.';

        $session = CheckoutSession::where('mpesa_request_id', $checkoutRequestId)->first();
        if ($session && $session->status !== 'paid') {
            if ($resultCode === 0) {
                $items = $callbackData['CallbackMetadata']['Item'] ?? [];
                $receipt = collect($items)->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? null;

                $session->markAsPaid('mpesa', $receipt);
                \Log::info("CheckoutSession {$session->token} paid successfully. Receipt: {$receipt}");

                DispatchMerchantWebhook::dispatch($session, 'payment.succeeded');
            } else {
                $session->markAsFailed($this->mapMpesaError($resultCode, $resultDesc));
                \Log::warning("CheckoutSession {$session->token} failed ({$resultCode}): {$resultDesc}");

                DispatchMerchantWebhook::dispatch($session, 'payment.failed');
            }
        }

        return response()->json([
            'ResultCode' => 0,
            'ResultDesc' => 'Callback received successfully'
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

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $apiKey = env('GOOGLE_MAPS_API_KEY');
        $url = "https://routes.googleapis.com/directions/v2:computeRoutes";

        $payload = [
            "origin" => [
                "location" => [
                    "latLng" => ["latitude" => (float) $lat1, "longitude" => (float) $lon1]
                ]
            ],
            "destination" => [
                "location" => [
                    "latLng" => ["latitude" => (float) $lat2, "longitude" => (float) $lon2]
                ]
            ],
            "travelMode" => "DRIVE",
            "routingPreference" => "TRAFFIC_AWARE"
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Goog-Api-Key' => $apiKey,
            'X-Goog-FieldMask' => 'routes.distanceMeters'
        ])->post($url, $payload);

        if ($response->successful()) {
            $data = $response->json();
            if (isset($data['routes'][0]['distanceMeters'])) {
                return $data['routes'][0]['distanceMeters'] / 1000;
            }
        }

        \Log::error('Google Routes API Error: ' . $response->body());
        return 0;
    }
}