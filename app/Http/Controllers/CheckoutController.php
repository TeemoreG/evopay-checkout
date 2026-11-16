<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MpgsService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function process(Request $request, MpgsService $mpgs)
    {
        $data = $request->validate([
            'items' => 'required|array',
            'subtotal' => 'required|numeric',
            'delivery_fee' => 'required|numeric',
            'total' => 'required|numeric',
            'payment_method' => 'required|string',
            'delivery_method' => 'required|string',
            'customer' => 'nullable|array',
            'delivery' => 'nullable|array',
        ]);

        // Create the Order dynamically with the new Delivery logic
        $order = Order::create([
            'order_number' => 'ORD-' . strtoupper(Str::random(8)),
            'total_amount' => $data['total'], // Includes delivery fee
            'status' => 'pending',
            'payment_method' => $data['payment_method'],
            'items' => $data['items'],
            'customer' => $data['customer'],
            'delivery' => array_merge($data['delivery'] ?? [], [
                'method' => $data['delivery_method'],
                'fee' => $data['delivery_fee']
            ]),
        ]);

        // Handle Card (MPGS)
        if ($data['payment_method'] === 'card') {
            try {
                $session = $mpgs->createSession($data['total'], $order->order_number);
                $order->update(['mpgs_session_id' => $session['session']['id']]);

                return response()->json([
                    'status' => 'redirect',
                    'url' => "https://ap-gateway.mastercard.com/checkout/pay/" . $session['session']['id']
                ]);
            } catch (\Exception $e) {
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        // Handle M-Pesa
        if ($data['payment_method'] === 'mpesa') {
            return response()->json([
                'status' => 'pending',
                'message' => 'M-Pesa STK push will be triggered here.',
                'order' => $order
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Invalid payment method'], 400);
    }
}