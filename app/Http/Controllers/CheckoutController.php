<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MpgsService;
use App\Services\MpesaService;
use Illuminate\Http\Request;
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
            'delivery' => 'nullable|array',
        ]);

        $deliveryFee = 0;
        $distanceKm = 0;
        $weightFee = 0;
        $distanceFee = 0;

        // 1. Calculate Real Distance & Delivery Fee
        if ($data['delivery_method'] === 'standard' && !empty($data['delivery']['lat'])) {
            $distanceKm = $this->calculateDistance(
                -1.2673, 36.7623, // Evopay HQ (Kabarsiran Gardens)
                $data['delivery']['lat'], 
                $data['delivery']['lng']
            );

            // Dynamic Weight Math: KSh 20 per KG + KSh 50 per KM
            $totalWeight = collect($data['items'])->reduce(function($acc, $item) {
                return $acc + ($item['qty'] * (float)($item['weight'] ?? 0));
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
                $session = $mpgs->createSession($total, $order->order_number);
                $order->update(['mpgs_session_id' => $session['session']['id']]);

                return response()->json([
                    'status' => 'redirect',
                    'url' => "https://ap-gateway.mastercard.com/checkout/pay/" . $session['session']['id']
                ]);
            } catch (\Exception $e) {
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        // 4. Handle M-Pesa (STK PUSH)
        if ($data['payment_method'] === 'mpesa') {
            try {
                $response = $mpesa->stkPush($data['customer']['phone'], $total, $order->order_number);
                $order->update(['mpesa_request_id' => $response['CheckoutRequestID']]); 

                return response()->json([
                    'status' => 'pending',
                    'message' => 'STK Push sent! Please enter your M-Pesa PIN.',
                    'order_id' => $order->id 
                ]);
            } catch (\Exception $e) {
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        return response()->json(['status' => 'error', 'message' => 'Invalid payment method'], 400);
    }

    // Live distance calculation endpoint for the frontend
    public function getDistance(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $distanceKm = $this->calculateDistance(
            -1.2673, 36.7623, // Evopay HQ (Kabarsiran Gardens)
            $request->lat, 
            $request->lng
        );

        return response()->json([
            'distance_km' => round($distanceKm, 1)
        ]);
    }

    // Polling endpoint for the frontend (M-Pesa)
    public function checkStatus(Order $order)
    {
        return response()->json([
            'status' => $order->status
        ]);
    }

    // Safaricom Callback endpoint
    public function mpesaCallback(Request $request)
    {
        \Log::info('M-Pesa Callback Received:', $request->all());

        $callbackData = $request->input('Body.stkCallback');
        
        if (!$callbackData) {
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Invalid payload']);
        }

        $checkoutRequestId = $callbackData['CheckoutRequestID'];
        $resultCode = $callbackData['ResultCode'];
        $resultDesc = $callbackData['ResultDesc'];

        $order = Order::where('mpesa_request_id', $checkoutRequestId)->first();

        if ($order) {
            if ($resultCode == 0) {
                $order->update(['status' => 'paid']);
                \Log::info("Order {$order->order_number} paid successfully.");
            } else {
                $order->update(['status' => 'failed']);
                \Log::warning("Order {$order->order_number} failed: {$resultDesc}");
            }
        }

        return response()->json([
            'ResultCode' => 0,
            'ResultDesc' => 'Callback received successfully'
        ]);
    }

    /**
     * Calculate straight-line distance using Haversine Formula
     * (Accurate for short local deliveries without API costs)
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        // Radius of the Earth in kilometers
        $earthRadius = 6371;

        // Convert degrees to radians
        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        // Haversine formula math
        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) + cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        $distance = $angle * $earthRadius;

        // Add a 20% buffer to account for actual road driving
        return $distance * 1.2; 
    }
}