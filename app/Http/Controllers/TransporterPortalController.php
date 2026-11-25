<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransporterPortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $transporter = $request->user()->transporter;

        if (!$transporter) {
            abort(403, 'No transporter profile attached to this account.');
        }

        // Assigned orders where this transporter is booked
        $orders = Order::where('delivery->transporter_id', $transporter->id)
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'total_amount' => (float) $o->total_amount,
                'status' => $o->status,
                'payment_method' => $o->payment_method,
                'customer' => $o->customer ?? [],
                'delivery' => $o->delivery ?? [],
                'items' => $o->items ?? [],
                'created_at' => $o->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Transporter/Dashboard', [
            'transporter' => [
                'id' => $transporter->id,
                'name' => $transporter->name,
                'phone' => $transporter->phone,
                'vehicle_type' => $transporter->vehicle_type,
                'area' => $transporter->area,
                'plate_number' => $transporter->plate_number,
                'is_available' => (bool) $transporter->is_available,
                'base_fare' => (float) $transporter->base_fare,
                'rate_per_kg' => (float) $transporter->rate_per_kg,
                'rate_per_km' => (float) $transporter->rate_per_km,
            ],
            'orders' => $orders,
        ]);
    }

    public function toggleAvailability(Request $request)
    {
        $transporter = $request->user()->transporter;
        if (!$transporter) abort(403);

        $transporter->update([
            'is_available' => !$transporter->is_available,
        ]);

        return redirect()->back();
    }

    public function updateRates(Request $request)
    {
        $transporter = $request->user()->transporter;
        if (!$transporter) abort(403);

        $data = $request->validate([
            'base_fare' => 'required|numeric|min:0',
            'rate_per_kg' => 'required|numeric|min:0',
            'rate_per_km' => 'required|numeric|min:0',
            'area' => 'nullable|string|max:120',
            'plate_number' => 'nullable|string|max:30',
        ]);

        $transporter->update([
            'base_fare' => $data['base_fare'],
            'rate_per_kg' => $data['rate_per_kg'],
            'rate_per_km' => $data['rate_per_km'],
            'area' => $data['area'] ?? $transporter->area,
            'plate_number' => $data['plate_number'] ? strtoupper(trim($data['plate_number'])) : $transporter->plate_number,
        ]);

        return redirect()->back()->with('success', 'Rate card updated successfully.');
    }
}