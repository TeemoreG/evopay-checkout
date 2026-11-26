<?php

namespace App\Http\Controllers;

use App\Jobs\DispatchMerchantWebhook;
use App\Models\CheckoutSession;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Setting;
use App\Models\Transporter;
use App\Services\PricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'free_radius_km' => (float) Setting::get('free_radius_km', 3),
            'transporters' => Transporter::available()
                ->latest()
                ->get([
                    'id',
                    'name',
                    'phone',
                    'vehicle_type',
                    'area',
                    'plate_number',
                    'base_fare',
                    'rate_per_kg',
                    'rate_per_km',
                ]),
        ]);
    }

    /**
     * Shop Checkout: Verifies item pricing/weights from DB, checks transporter availability,
     * creates local pending Order (without locking the rider until paid), and requests an Evopay session.
     */
    public function process(Request $request, PricingService $pricing)
    {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|integer|exists:products,id',
            'items.*.unitId' => 'required',
            'items.*.qty' => 'required|integer|min:1',
            'subtotal' => 'nullable|numeric',
            'delivery_method' => 'required|in:pickup,transporter',
            'customer' => 'required|array',
            'customer.name' => 'required|string|max:255',
            'customer.phone' => 'required|string|max:20',
            'customer.email' => 'nullable|email|max:255',
            'delivery' => 'nullable|array',
            'delivery.lat' => 'nullable|numeric',
            'delivery.lng' => 'nullable|numeric',
            'delivery.formatted' => 'nullable|string|max:500',
            'delivery.transporter_id' => 'nullable|integer',
        ], [
            'items.required' => 'Your cart is empty. Please add items before checking out.',
            'items.min' => 'Your cart is empty. Please add items before checking out.',
            'customer.name.required' => 'Please enter your full name.',
            'customer.phone.required' => 'Please enter your phone number.',
            'customer.email.email' => 'Please enter a valid email address.',
            'delivery_method.required' => 'Please select a delivery method.',
        ]);

        $secretKey = config('services.evopay_shop.secret_key');
        if (!$secretKey) {
            return response()->json([
                'error' => 'Shop payment gateway is not configured (missing EVOPAY_SHOP_SECRET_KEY in .env).',
            ], 500);
        }

        if ($data['delivery_method'] === 'transporter') {
            if (empty($data['delivery']['formatted'])) {
                return response()->json([
                    'error' => 'Please search and select a valid delivery address.',
                ], 422);
            }

            if (empty($data['delivery']['transporter_id'])) {
                return response()->json([
                    'error' => 'Please select an available transporter for your delivery.',
                ], 422);
            }
        }

        // Recalculate subtotal and total weight strictly from DB
        $verifiedSubtotal = 0.0;
        $totalWeight = 0.0;
        $verifiedItems = [];

        foreach ($data['items'] as $item) {
            $product = Product::where('id', (int) $item['productId'])
                ->where('is_active', true)
                ->first();

            if (!$product) {
                return response()->json([
                    'error' => 'One of the products in your cart is no longer available.',
                ], 422);
            }

            $unitId = $item['unitId'];
            if (is_numeric($unitId)) {
                $unit = ProductUnit::where('id', (int) $unitId)
                    ->where('product_id', $product->id)
                    ->where('is_active', true)
                    ->first();
            } else {
                $unit = ProductUnit::where('product_id', $product->id)
                    ->where('is_active', true)
                    ->orderBy('id')
                    ->first();
            }

            if (!$unit) {
                return response()->json([
                    'error' => "Invalid unit selected for {$product->name}.",
                ], 422);
            }

            $qty = (int) $item['qty'];

            try {
                $calc = $pricing->calculate($unit, $qty);
            } catch (\InvalidArgumentException $e) {
                return response()->json(['error' => $e->getMessage()], 422);
            }

            if ($calc['requires_quote']) {
                return response()->json([
                    'error' => "{$product->name} ({$unit->label}) requires a custom quote.",
                ], 422);
            }

            $weight = (float) ($product->weight ?? 0);
            $verifiedSubtotal += (float) $calc['total'];
            $totalWeight += ($qty * $weight);

            $verifiedItems[] = [
                'productId' => $product->id,
                'productName' => $product->name,
                'image_url' => $product->image_url,
                'weight' => $weight,
                'unitId' => $unit->id,
                'unitLabel' => $unit->label,
                'qty' => $qty,
                'unitPrice' => (float) $calc['unit_price'],
                'lineTotal' => (float) $calc['total'],
            ];
        }

        $distanceKm = 0.0;
        $estimatedTransportFee = 0.0;
        $chosenTransporter = null;

        // If customer chooses transporter, verify availability (locked only after payment succeeds)
        if ($data['delivery_method'] === 'transporter') {
            if (!empty($data['delivery']['lat']) && !empty($data['delivery']['lng'])) {
                $hqLat = (float) Setting::get('hq_lat', -1.2674);
                $hqLng = (float) Setting::get('hq_lng', 36.7704);

                $distanceKm = $this->calculateDistance(
                    $hqLat,
                    $hqLng,
                    (float) $data['delivery']['lat'],
                    (float) $data['delivery']['lng']
                );
            }

            $transporterId = (int) $data['delivery']['transporter_id'];
            $chosenTransporter = Transporter::where('id', $transporterId)
                ->where('status', 'approved')
                ->where('is_available', true)
                ->first();

            if (!$chosenTransporter) {
                return response()->json([
                    'error' => 'The selected transporter is currently unavailable. Please pick another driver.',
                ], 422);
            }

            $estimatedTransportFee = $this->computeTransportFee($chosenTransporter, $totalWeight, $distanceKm);
        }

        // Customer pays for materials online; transport fee is paid to the driver on site
        $total = round($verifiedSubtotal, 2);

        // 1. Create Shop Order locally
        $order = Order::create([
            'order_number' => 'ORD-' . strtoupper(Str::random(8)),
            'total_amount' => $total,
            'status' => 'pending',
            'payment_method' => 'evopay_gateway',
            'items' => $verifiedItems,
            'customer' => $data['customer'],
            'delivery' => array_merge($data['delivery'] ?? [], [
                'method' => $data['delivery_method'],
                'fee' => 0.00, // Transport fee paid on arrival
                'distance_km' => round($distanceKm, 2),
                'total_weight_kg' => round($totalWeight, 2),
                'estimated_transport_fee' => $estimatedTransportFee,
                'transporter_id' => $chosenTransporter?->id,
                'transporter_name' => $chosenTransporter?->name,
                'transporter_phone' => $chosenTransporter?->phone,
                'transporter_vehicle' => $chosenTransporter?->vehicle_type,
                'transporter_plate' => $chosenTransporter?->plate_number,
            ]),
        ]);

        // 2. Call Evopay Payment Provider API (/api/v1/checkout/sessions)
        $gatewayUrl = rtrim((string) (config('services.evopay_shop.gateway_url') ?: url('/')), '/');

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
                    'cancel_url' => route('checkout.cancel', ['order' => $order->order_number]),
                    'webhook_url' => route('shop.evopay.webhook'),
                    'metadata' => [
                        'source' => 'nyumba_cement_shop',
                        'delivery_method' => $data['delivery_method'],
                        'transporter_id' => $chosenTransporter?->id,
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

            // Store gateway session token on order
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

        $gatewayUrl = rtrim((string) (config('services.evopay_shop.gateway_url') ?: url('/')), '/');
        $secretKey = config('services.evopay_shop.secret_key');

        try {
            $res = Http::withToken($secretKey)
                ->acceptJson()
                ->timeout(15)
                ->get("{$gatewayUrl}/api/v1/checkout/sessions/{$token}");

            $data = $res->json('data');

            if ($res->successful() && ($data['status'] ?? null) === 'paid') {
                $this->finalizePaidOrder($order, $data);

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
     * Shop Cancel URL: Cancel pending order cleanly.
     */
    public function gatewayCancel(Request $request)
    {
        $orderNumber = $request->query('order');
        if ($orderNumber) {
            $order = Order::where('order_number', $orderNumber)->first();
            if ($order && $order->status === 'pending') {
                $order->update([
                    'status' => 'cancelled',
                    'failure_reason' => 'Payment was cancelled by customer.',
                ]);
            }
        }

        return redirect()->route('checkout.index', ['error' => 'Payment was cancelled. You can try again.']);
    }

    /**
     * Shop Outbound Webhook Receiver (Evopay -> Shop)
     */
    public function shopWebhook(Request $request)
    {
        $webhookSecret = config('services.evopay_shop.webhook_secret');
        $signature = (string) $request->header('X-Evopay-Signature', '');
        $expected = $webhookSecret ? 'sha256=' . hash_hmac('sha256', $request->getContent(), $webhookSecret) : '';

        if (empty($webhookSecret) || !hash_equals($expected, $signature)) {
            \Log::warning('Shop Webhook: Missing secret or invalid signature received.');
            return response()->json(['message' => 'Invalid signature'], 401);
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
                $this->finalizePaidOrder($order, $data);
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

    /**
     * Atomically mark an order paid, claim the selected rider (first-to-pay wins),
     * or auto-reassign to another available relevant rider if the first one was already taken.
     */
    private function finalizePaidOrder(Order $order, array $data): void
    {
        DB::transaction(function () use ($order, $data) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();
            if (!$lockedOrder || $lockedOrder->status === 'paid') {
                return;
            }

            $delivery = $lockedOrder->delivery ?? [];

            if (($delivery['method'] ?? null) === 'transporter') {
                $requestedId = (int) ($delivery['transporter_id'] ?? 0);
                $assigned = null;

                if ($requestedId > 0) {
                    $preferred = Transporter::where('id', $requestedId)->lockForUpdate()->first();
                    if ($preferred && $preferred->status === 'approved' && $preferred->is_available) {
                        $assigned = $preferred;
                    }
                }

                // If chosen rider was already claimed by an earlier payer, find a relevant available rider
                if (!$assigned) {
                    $preferredVehicle = (string) ($delivery['transporter_vehicle'] ?? '');

                    $assigned = Transporter::where('status', 'approved')
                        ->where('is_available', true)
                        ->when($preferredVehicle !== '', function ($q) use ($preferredVehicle) {
                            $q->orderByRaw('CASE WHEN vehicle_type = ? THEN 0 ELSE 1 END', [$preferredVehicle]);
                        })
                        ->orderBy('id')
                        ->lockForUpdate()
                        ->first();
                }

                if ($assigned) {
                    $assigned->update(['is_available' => false]);

                    if ((int) $assigned->id !== $requestedId) {
                        $totalWeight = (float) ($delivery['total_weight_kg'] ?? 0);
                        $distanceKm = (float) ($delivery['distance_km'] ?? 0);

                        $delivery['transporter_id'] = $assigned->id;
                        $delivery['transporter_name'] = $assigned->name;
                        $delivery['transporter_phone'] = $assigned->phone;
                        $delivery['transporter_vehicle'] = $assigned->vehicle_type;
                        $delivery['transporter_plate'] = $assigned->plate_number;
                        $delivery['estimated_transport_fee'] = $this->computeTransportFee($assigned, $totalWeight, $distanceKm);
                    }
                } else {
                    $delivery['transporter_id'] = null;
                    $delivery['transporter_name'] = null;
                    $delivery['transporter_phone'] = null;
                    $delivery['transporter_vehicle'] = null;
                    $delivery['transporter_plate'] = null;
                }
            }

            $lockedOrder->update([
                'status' => 'paid',
                'payment_method' => $data['payment_method'] ?? 'evopay',
                'mpesa_receipt' => $data['mpesa_receipt'] ?? null,
                'failure_reason' => null,
                'delivery' => $delivery,
            ]);
        });
    }

    private function computeTransportFee(Transporter $transporter, float $totalWeight, float $distanceKm): float
    {
        $freeRadiusKm = (float) Setting::get('free_radius_km', 3);
        $billableKm = $distanceKm > $freeRadiusKm ? ceil($distanceKm - $freeRadiusKm) : 0;

        $base = (float) $transporter->base_fare;
        $wFee = $totalWeight * (float) $transporter->rate_per_kg;
        $dFee = $billableKm * (float) $transporter->rate_per_km;

        return round($base + $wFee + $dFee, 2);
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
            $hqLat,
            $hqLng,
            (float) $request->lat,
            (float) $request->lng
        );

        return response()->json([
            'distance_km' => round($distanceKm, 1),
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

        if ($session) {
            $items = $callbackData['CallbackMetadata']['Item'] ?? [];
            $receipt = collect($items)->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? null;

            $dispatchedEvent = DB::transaction(function () use ($session, $resultCode, $resultDesc, $receipt) {
                $locked = CheckoutSession::where('id', $session->id)->lockForUpdate()->first();

                if (!$locked) {
                    return null;
                }

                if ($resultCode === 0) {
                    if ($locked->status !== 'paid') {
                        $locked->markAsPaid('mpesa', $receipt);
                        \Log::info("CheckoutSession {$locked->token} paid successfully. Receipt: {$receipt}");
                        return 'payment.succeeded';
                    }

                    if (empty($locked->mpesa_receipt) && !empty($receipt)) {
                        $locked->update(['mpesa_receipt' => $receipt]);
                        \Log::info("CheckoutSession {$locked->token} backfilled M-Pesa receipt after STK Query: {$receipt}");
                    }

                    return null;
                }

                if ($locked->status === 'pending') {
                    $locked->markAsFailed($this->mapMpesaError($resultCode, $resultDesc));
                    \Log::warning("CheckoutSession {$locked->token} failed ({$resultCode}): {$resultDesc}");
                    return 'payment.failed';
                }

                return null;
            });

            if ($dispatchedEvent) {
                $session->refresh();
                DispatchMerchantWebhook::dispatch($session, $dispatchedEvent);
            }
        }

        return response()->json([
            'ResultCode' => 0,
            'ResultDesc' => 'Callback received successfully',
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
        $apiKey = config('services.google_maps.api_key');
        $url = "https://routes.googleapis.com/directions/v2:computeRoutes";

        $payload = [
            "origin" => [
                "location" => [
                    "latLng" => ["latitude" => (float) $lat1, "longitude" => (float) $lon1],
                ],
            ],
            "destination" => [
                "location" => [
                    "latLng" => ["latitude" => (float) $lat2, "longitude" => (float) $lon2],
                ],
            ],
            "travelMode" => "DRIVE",
            "routingPreference" => "TRAFFIC_AWARE",
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Goog-Api-Key' => $apiKey,
            'X-Goog-FieldMask' => 'routes.distanceMeters',
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