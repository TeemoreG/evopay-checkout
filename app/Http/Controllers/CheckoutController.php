<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Setting;
use App\Services\MpgsService;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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

    public function process(Request $request)
    {
        $data = $request->validate([
            'items' => 'required|array',
            'subtotal' => 'required|numeric',
            'delivery_method' => 'required|string',
            'customer' => 'required|array',
            'customer.name' => 'required|string',
            'customer.phone' => 'required|string',
            'delivery' => 'nullable|array',
        ]);

        $deliveryFee = 0;
        $distanceKm = 0;
        $weightFee = 0;
        $distanceFee = 0;

        // 1. Calculate Real Distance & Dynamic Delivery Fee
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

        // Recalculate total securely on the backend
        $total = $data['subtotal'] + $deliveryFee;

        // 2. Create the Order (payment method selected on /pay/{order_number})
        $order = Order::create([
            'order_number' => 'ORD-' . strtoupper(Str::random(8)),
            'total_amount' => $total,
            'status' => 'pending',
            'payment_method' => 'pending',
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

        return response()->json([
            'status' => 'redirect',
            'url' => route('checkout.pay', ['order' => $order->order_number]),
            'order_number' => $order->order_number,
        ]);
    }

    // Secluded Payment Method Selector Page
    public function pay(Order $order)
    {
        if ($order->status === 'paid') {
            return redirect()->route('checkout.success', ['order' => $order->order_number]);
        }

        return Inertia::render('Checkout/Pay', [
            'order' => [
                'order_number' => $order->order_number,
                'total_amount' => (float) $order->total_amount,
                'status' => $order->status,
                'failure_reason' => $order->failure_reason,
                'customer_name' => $order->customer['name'] ?? '',
                'items_count' => collect($order->items ?? [])->sum('qty'),
            ],
        ]);
    }

    // Hosted M-Pesa Payment Page
    public function mpesaPay(Order $order)
    {
        if ($order->status === 'paid') {
            return redirect()->route('checkout.success', ['order' => $order->order_number]);
        }

        return Inertia::render('Checkout/MpesaPay', [
            'order' => [
                'order_number' => $order->order_number,
                'total_amount' => (float) $order->total_amount,
                'status' => $order->status,
                'customer_name' => $order->customer['name'] ?? '',
                'contact_phone' => $order->customer['phone'] ?? '',
            ],
        ]);
    }

    // Reusable API Endpoint: Initiate M-Pesa STK Push for an Order
    public function mpesaStkPush(Request $request, MpesaService $mpesa)
    {
        $data = $request->validate([
            'order_number' => 'required|string|exists:orders,order_number',
            'phone' => 'required|string|min:9|max:15',
        ]);

        $order = Order::where('order_number', $data['order_number'])->firstOrFail();

        if ($order->status === 'paid') {
            return response()->json([
                'status' => 'paid',
                'order_number' => $order->order_number,
                'message' => 'This order is already paid.',
            ]);
        }

        $phone = preg_replace('/[\s\-]+/', '', trim($data['phone']));

        try {
            $response = $mpesa->stkPush($phone, $order->total_amount, $order->order_number);

            if (empty($response['CheckoutRequestID']) || ($response['ResponseCode'] ?? null) !== '0') {
                $reason = $response['ResponseDescription'] ?? $response['errorMessage'] ?? 'Failed to initiate M-Pesa prompt.';
                $order->update([
                    'payment_method' => 'mpesa',
                    'status' => 'failed',
                    'failure_reason' => $reason,
                ]);

                return response()->json(['error' => $reason], 422);
            }

            $order->update([
                'payment_method' => 'mpesa',
                'status' => 'pending',
                'failure_reason' => null,
                'mpesa_request_id' => $response['CheckoutRequestID'],
            ]);

            return response()->json([
                'status' => 'pending',
                'order_number' => $order->order_number,
                'message' => 'STK Push sent! Please enter your M-Pesa PIN.',
            ]);
        } catch (\Exception $e) {
            $order->update([
                'payment_method' => 'mpesa',
                'status' => 'failed',
                'failure_reason' => $e->getMessage(),
            ]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Reusable API Endpoint: Initialize MPGS Card Session for an Order
    public function mpgsInit(Request $request, MpgsService $mpgs)
    {
        $data = $request->validate([
            'order_number' => 'required|string|exists:orders,order_number',
        ]);

        $order = Order::where('order_number', $data['order_number'])->firstOrFail();

        if ($order->status === 'paid') {
            return response()->json([
                'status' => 'redirect',
                'url' => route('checkout.success', ['order' => $order->order_number]),
            ]);
        }

        try {
            $returnUrl = route('checkout.mpgs.callback', $order);
            $cancelUrl = route('checkout.mpgs.cancel', $order);

            $session = $mpgs->createSession(
                $order->total_amount,
                $order->order_number,
                'KES',
                $returnUrl,
                $cancelUrl
            );

            if (empty($session['session']['id'])) {
                throw new \Exception('MPGS did not return a valid session ID.');
            }

            $order->update([
                'payment_method' => 'card',
                'status' => 'pending',
                'failure_reason' => null,
                'mpgs_session_id' => $session['session']['id'],
            ]);

            if (!empty($session['successIndicator'])) {
                Cache::put("mpgs_indicator_{$order->order_number}", $session['successIndicator'], now()->addHours(2));
            }

            return response()->json([
                'status' => 'redirect',
                'url' => route('checkout.mpgs.pay', $order),
            ]);
        } catch (\Exception $e) {
            $order->update([
                'payment_method' => 'card',
                'status' => 'failed',
                'failure_reason' => $e->getMessage(),
            ]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // MPGS Hosted Checkout Launcher
    public function mpgsPay(Order $order, MpgsService $mpgs)
    {
        if ($order->status === 'paid') {
            return redirect()->route('checkout.success', ['order' => $order->order_number]);
        }

        if (empty($order->mpgs_session_id)) {
            return redirect()->route('checkout.pay', [
                'order' => $order->order_number,
                'error' => 'Card session not found. Please try again.',
            ]);
        }

        return view('checkout.mpgs', [
            'order' => $order,
            'sessionId' => $order->mpgs_session_id,
            'checkoutJsUrl' => $mpgs->getCheckoutJsUrl(),
            'cancelUrl' => route('checkout.mpgs.cancel', $order),
        ]);
    }

    // MPGS Return Callback
    public function mpgsCallback(Request $request, Order $order, MpgsService $mpgs)
    {
        if ($order->status === 'paid') {
            return redirect()->route('checkout.success', ['order' => $order->order_number]);
        }

        $resultIndicator = (string) $request->query('resultIndicator', '');
        $expectedIndicator = Cache::get("mpgs_indicator_{$order->order_number}");

        try {
            $mpgsOrder = $mpgs->retrieveOrder($order->order_number);
            \Log::info("MPGS Order Verification ({$order->order_number}):", $mpgsOrder);

            $gatewaySuccess = ($mpgsOrder['result'] ?? null) === 'SUCCESS'
                && in_array($mpgsOrder['status'] ?? '', ['CAPTURED', 'AUTHORIZED', 'PARTIALLY_CAPTURED'], true);

            $indicatorMatches = $expectedIndicator && $resultIndicator !== ''
                && hash_equals((string) $expectedIndicator, $resultIndicator);

            if ($gatewaySuccess || $indicatorMatches) {
                $order->update([
                    'status' => 'paid',
                    'payment_method' => 'card',
                    'failure_reason' => null,
                ]);
                Cache::forget("mpgs_indicator_{$order->order_number}");
                $this->sendEmailReceiptPlaceholder($order);

                return redirect()->route('checkout.success', ['order' => $order->order_number]);
            }

            $reason = $mpgsOrder['error']['explanation']
                ?? 'Card payment was declined or could not be verified.';

            $order->update([
                'status' => 'failed',
                'failure_reason' => $reason,
            ]);

            return redirect()->route('checkout.pay', [
                'order' => $order->order_number,
                'error' => $reason,
            ]);
        } catch (\Exception $e) {
            \Log::error("MPGS Callback Error ({$order->order_number}): " . $e->getMessage());

            $order->update([
                'status' => 'failed',
                'failure_reason' => 'Could not verify card payment. Please try again.',
            ]);

            return redirect()->route('checkout.pay', [
                'order' => $order->order_number,
                'error' => 'Could not verify card payment. Please try again.',
            ]);
        }
    }

    // MPGS Cancelled Handler
    public function mpgsCancel(Order $order)
    {
        if ($order->status !== 'paid') {
            $order->update([
                'status' => 'failed',
                'failure_reason' => 'Card payment was cancelled.',
            ]);
        }

        return redirect()->route('checkout.pay', [
            'order' => $order->order_number,
            'error' => 'Card payment was cancelled. You can try again or choose M-Pesa.',
        ]);
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

    // Polling endpoint for the frontend (M-Pesa / Payment Gateway)
    public function checkStatus(Order $order)
    {
        return response()->json([
            'status' => $order->status,
            'message' => $order->failure_reason,
            'order_number' => $order->order_number,
            'receipt' => $order->mpesa_receipt,
        ]);
    }

    // Safaricom Callback endpoint
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

        $order = Order::where('mpesa_request_id', $checkoutRequestId)->first();

        if (!$order) {
            \Log::warning("M-Pesa Callback: No order found for CheckoutRequestID {$checkoutRequestId}");
        } elseif ($order->status !== 'paid') {
            if ($resultCode === 0) {
                $items = $callbackData['CallbackMetadata']['Item'] ?? [];
                $receipt = collect($items)->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? null;

                $order->update([
                    'status' => 'paid',
                    'payment_method' => 'mpesa',
                    'mpesa_receipt' => $receipt,
                    'failure_reason' => null,
                ]);

                \Log::info("Order {$order->order_number} paid successfully. Receipt: {$receipt}");
                $this->sendEmailReceiptPlaceholder($order);
            } else {
                $order->update([
                    'status' => 'failed',
                    'failure_reason' => $this->mapMpesaError($resultCode, $resultDesc),
                ]);

                \Log::warning("Order {$order->order_number} failed ({$resultCode}): {$resultDesc}");
            }
        }

        return response()->json([
            'ResultCode' => 0,
            'ResultDesc' => 'Callback received successfully'
        ]);
    }

    private function sendEmailReceiptPlaceholder(Order $order): void
    {
        $email = $order->customer['email'] ?? null;
        if (!$email) {
            return;
        }

        // Email Receipt Placeholder (enable once SMTP credentials are configured in .env)
        // Mail::to($email)->send(new \App\Mail\OrderReceiptMail($order));
        \Log::info("Email receipt placeholder triggered for {$order->order_number} ({$email})");
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

    /**
     * Calculate driving distance using Google Routes API
     * This gives real driving distance (like Bolt/Uber)
     */
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