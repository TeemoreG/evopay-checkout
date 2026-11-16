<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MpgsService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class CheckoutController extends Controller
{
    public function process(Request $request, MpgsService $mpgs)
    {
        $data = $request->validate([
            'items' => 'required|array',
            'subtotal' => 'required|numeric',
            'payment_method' => 'required|string',
            'delivery_method' => 'required|string',
            'customer' => 'nullable|array',
            'delivery' => 'nullable|array',
        ]);

        $deliveryFee = 0;
        $distanceKm = 0;

        // 1. Calculate Real Distance & Delivery Fee
        if ($data['delivery_method'] === 'standard' && !empty($data['delivery']['lat'])) {
            $distanceKm = $this->calculateDistance(
                -1.2664, 36.7657, // Evopay HQ (Kabarsiran Ave)
                $data['delivery']['lat'], 
                $data['delivery']['lng']
            );

            // Delivery Math: KSh 40 per 50KG + KSh 100 per KM
            $totalWeight = collect($data['items'])->reduce(fn($acc, $item) => $acc + ($item['qty'] * 50), 0);
            $weightFee = ceil($totalWeight / 50) * 40;
            $distanceFee = ceil($distanceKm) * 100;
            
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
                'weight_fee' => $weightFee ?? 0,
                'distance_fee' => $distanceFee ?? 0,
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

        // 4. Handle M-Pesa
        if ($data['payment_method'] === 'mpesa') {
            return response()->json([
                'status' => 'pending',
                'message' => 'M-Pesa STK push will be triggered here.',
                'order' => $order
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Invalid payment method'], 400);
    }

    /**
     * Calculate driving distance using the new Google Routes API
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $apiKey = env('GOOGLE_MAPS_API_KEY');
        
        $url = "https://routes.googleapis.com/directions/v2:computeRoutes";

        $payload = [
            "origin" => [
                "location" => [
                    "latLng" => ["latitude" => $lat1, "longitude" => $lon1]
                ]
            ],
            "destination" => [
                "location" => [
                    "latLng" => ["latitude" => $lat2, "longitude" => $lon2]
                ]
            ],
            "travelMode" => "DRIVE",
            "routingPreference" => "TRAFFIC_AWARE"
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Goog-Api-Key' => $apiKey,
            'X-Goog-FieldMask' => 'routes.distanceMeters' // Only ask for distance to save bandwidth
        ])->post($url, $payload);

        if ($response->successful()) {
            $data = $response->json();
            if (isset($data['routes'][0]['distanceMeters'])) {
                // Convert meters to kilometers
                return $data['routes'][0]['distanceMeters'] / 1000;
            }
        }

        // Log the error for debugging if it fails
        \Log::error('Google Routes API Error: ' . $response->body());

        return 0; // Fallback
    }
}