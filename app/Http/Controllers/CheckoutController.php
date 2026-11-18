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

class CheckoutController extends Controller
{
    public function process(Request $request, MpgsService $mpgs, MpesaService $mpesa)
    {
        $data = $request->validate([
            'items' => 'required|array',
            'subtotal' => 'required|numeric',
            'payment_method' => 'required|string',
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

        // 1. Calculate Real Distance & Delivery Fee
        if ($data['delivery_method'] === 'standard' && !empty($data['delivery']['lat'])) {
            // Fetch dynamic HQ coordinates from DB
            $hqLat = (float) Setting::get('hq_lat', -1.2674);
            $hqLng = (float) Setting::get('hq_lng', 36.7704);

            $distanceKm = $this->calculateDistance(
                $hqLat, $hqLng,
                (float) $data['delivery']['lat'],
                (float) $data['delivery']['lng']
            );

            // Dynamic Weight Math: KSh 20 per KG + KSh 50 per KM
            $totalWeight = collect($data['items'])->reduce(function ($acc, $item) {
                return $acc + ($item['qty'] * (float) ($item['weight'] ?? 0));
            }, 0);

            $weightFee = $totalWeight * 20;
            $distanceFee = ceil($distanceKm) * 50;

            $deliveryFee = $weightFee + $distanceFee;
        }

        // Recalculate total securely on the backend
        $total = $data['subtotal'] + $deliveryFee;

        // 2. Create the Order
        $order = Order::create([
            'order_number' => 'ORD-' . strtoupper(Str::random(8)),
            'total_amount' => $total,
            'status' => 'pending',
            'payment_method' => $data['payment_method'],
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

        // 3. Handle Card (MPGS)
        if ($data['payment_method'] === 'card') {
            try {
                $returnUrl = route('checkout.mpgs.callback', $order);
                $cancelUrl = route('checkout.mpgs.cancel', $order);

                $session = $mpgs->createSession(
                    $total,
                    $order->order_number,
                    'KES',
                    $returnUrl,
                    $cancelUrl
                );

                if (empty($session['session']['id'])) {
                    throw new \Exception('MPGS did not return a valid session ID.');
                }

                $order->update(['mpgs_session_id' => $session['session']['id']]);

                if (!empty($session['successIndicator'])) {
                    Cache::put("mpgs_indicator_{$order->order_number}", $session['successIndicator'], now()->addHours(2));
                }

                return response()->json([
                    'status' => 'redirect',
                    'url' => route('checkout.mpgs.pay', $order),
                ]);
            } catch (\Exception $e) {
                $order->update([
                    'status' => 'failed',
                    'failure_reason' => $e->getMessage(),
                ]);

                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        // 4. Handle M-Pesa (STK PUSH)
        if ($data['payment_method'] === 'mpesa') {
            try {
                $response = $mpesa->stkPush($data['customer']['phone'], $total, $order->order_number);

                if (empty($response['CheckoutRequestID']) || ($response['ResponseCode'] ?? null) !== '0') {
                    $reason = $response['ResponseDescription'] ?? $response['errorMessage'] ?? 'Failed to initiate M-Pesa prompt.';
                    $order->update([
                        'status' => 'failed',
                        'failure_reason' => $reason,
                    ]);

                    return response()->json(['error' => $reason], 422);
                }

                $order->update(['mpesa_request_id' => $response['CheckoutRequestID']]);

                return response()->json([
                    'status' => 'pending',
                    'message' => 'STK Push sent! Please enter your M-Pesa PIN.',
                    'order_id' => $order->id
                ]);
            } catch (\Exception $e) {
                $order->update([
                    'status' => 'failed',
                    'failure_reason' => $e->getMessage(),
                ]);

                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        return response()->json(['status' => 'error', 'message' => 'Invalid payment method'], 400);
    }

    // MPGS Hosted Checkout Launcher
    public function mpgsPay(Order $order, MpgsService $mpgs)
    {
        if ($order->status === 'paid') {
            return redirect()->route('checkout.success', ['order' => $order->order_number]);
        }

        if (empty($order->mpgs_session_id)) {
            return redirect()->route('checkout.index', ['error' => 'Card session not found. Please try again.']);
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
                    'failure_reason' => null,
                ]);
                Cache::forget("mpgs_indicator_{$order->order_number}");

                return redirect()->route('checkout.success', ['order' => $order->order_number]);
            }

            $reason = $mpgsOrder['error']['explanation']
                ?? 'Card payment was declined or could not be verified.';

            $order->update([
                'status' => 'failed',
                'failure_reason' => $reason,
            ]);

            return redirect()->route('checkout.index', ['error' => $reason]);
        } catch (\Exception $e) {
            \Log::error("MPGS Callback Error ({$order->order_number}): " . $e->getMessage());

            $order->update([
                'status' => 'failed',
                'failure_reason' => 'Could not verify card payment. Please try again.',
            ]);

            return redirect()->route('checkout.index', ['error' => 'Could not verify card payment. Please try again.']);
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

        return redirect()->route('checkout.index', [
            'error' => 'Card payment was cancelled. You can try again or choose M-Pesa.',
        ]);
    }

    // Live distance calculation endpoint for the frontend
    public function getDistance(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        // Fetch dynamic HQ coordinates from DB
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

    // Polling endpoint for the frontend (M-Pesa)
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
                    'mpesa_receipt' => $receipt,
                    'failure_reason' => null,
                ]);

                \Log::info("Order {$order->order_number} paid successfully. Receipt: {$receipt}");
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