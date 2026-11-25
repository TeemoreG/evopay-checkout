<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransporterPortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $transporter = $request->user()->transporter;

        if (!$transporter) {
            abort(403, 'No transporter profile attached to this account.');
        }

        $orders = Order::where('delivery->transporter_id', $transporter->id)
            ->latest()
            ->limit(50)
            ->get()
            ->map(function ($o) {
                $delivery = $o->delivery ?? [];

                return [
                    'id' => $o->id,
                    'order_number' => $o->order_number,
                    'total_amount' => (float) $o->total_amount,
                    'status' => $o->status,
                    'payment_method' => $o->payment_method,
                    'customer' => $o->customer ?? [],
                    'delivery' => array_merge($delivery, [
                        'estimated_transport_fee' => (float) ($delivery['estimated_transport_fee'] ?? $delivery['estimated_fee'] ?? 0),
                        'distance_km' => (float) ($delivery['distance_km'] ?? 0),
                        'total_weight_kg' => (float) ($delivery['total_weight_kg'] ?? 0),
                    ]),
                    'items' => $o->items ?? [],
                    'created_at' => $o->created_at?->toIso8601String(),
                ];
            });

        $activeJobs = $orders->whereIn('status', ['paid', 'pending'])->count();
        $completedJobs = $orders->where('status', 'delivered')->count();
        $estimatedEarnings = (float) $orders
            ->whereIn('status', ['paid', 'delivered'])
            ->sum(fn ($o) => (float) ($o['delivery']['estimated_transport_fee'] ?? 0));
        $totalWeightHauled = (float) $orders
            ->where('status', 'delivered')
            ->sum(fn ($o) => (float) ($o['delivery']['total_weight_kg'] ?? 0));

        return Inertia::render('Transporter/Dashboard', [
            'transporter' => [
                'id' => $transporter->id,
                'name' => $transporter->name,
                'phone' => $transporter->phone,
                'vehicle_type' => $transporter->vehicle_type,
                'area' => $transporter->area,
                'plate_number' => $transporter->plate_number,
                'id_number' => $transporter->id_number,
                'has_id_document' => (bool) $transporter->id_document_path,
                'status' => $transporter->status,
                'is_available' => (bool) $transporter->is_available,
                'base_fare' => (float) $transporter->base_fare,
                'rate_per_kg' => (float) $transporter->rate_per_kg,
                'rate_per_km' => (float) $transporter->rate_per_km,
            ],
            'stats' => [
                'active_jobs' => $activeJobs,
                'completed_jobs' => $completedJobs,
                'estimated_earnings' => $estimatedEarnings,
                'total_weight_kg' => round($totalWeightHauled, 1),
            ],
            'orders' => $orders->values(),
        ]);
    }

    public function toggleAvailability(Request $request)
    {
        $transporter = $request->user()->transporter;
        if (!$transporter) {
            abort(403);
        }

        if ($transporter->status !== 'approved') {
            $transporter->update(['is_available' => false]);
            return redirect()->back()->withErrors([
                'availability' => 'Only approved transporters can go online.',
            ]);
        }

        $transporter->update([
            'is_available' => !$transporter->is_available,
        ]);

        return redirect()->back();
    }

    public function updateRates(Request $request)
    {
        $transporter = $request->user()->transporter;
        if (!$transporter) {
            abort(403);
        }

        $data = $request->validate([
            'vehicle_type' => 'required|string|max:50',
            'base_fare' => 'required|numeric|min:0',
            'rate_per_kg' => 'required|numeric|min:0',
            'rate_per_km' => 'required|numeric|min:0',
            'area' => 'nullable|string|max:120',
            'plate_number' => 'nullable|string|max:30',
        ]);

        $transporter->update([
            'vehicle_type' => trim($data['vehicle_type']),
            'base_fare' => $data['base_fare'],
            'rate_per_kg' => $data['rate_per_kg'],
            'rate_per_km' => $data['rate_per_km'],
            'area' => $data['area'] ? trim($data['area']) : $transporter->area,
            'plate_number' => !empty($data['plate_number']) ? strtoupper(trim($data['plate_number'])) : $transporter->plate_number,
        ]);

        return redirect()->back()->with('success', 'Rate card updated successfully.');
    }

    public function markOrderDelivered(Request $request, Order $order)
    {
        $transporter = $request->user()->transporter;
        if (!$transporter || (int) ($order->delivery['transporter_id'] ?? 0) !== (int) $transporter->id) {
            abort(403);
        }

        if ($order->status !== 'paid') {
            return redirect()->back()->withErrors([
                'order' => 'Only paid orders can be marked as delivered.',
            ]);
        }

        DB::transaction(function () use ($order, $transporter) {
            $order->update(['status' => 'delivered']);
            $transporter->update(['is_available' => true]);
        });

        return redirect()->back()->with('success', "Order {$order->order_number} marked delivered and your status is back Online.");
    }
}