<?php

namespace App\Http\Controllers;

use App\Models\Transporter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransporterController extends Controller
{
    /**
     * Show the public transporter registration page.
     */
    public function create()
    {
        return Inertia::render('Transporter/Register');
    }

    /**
     * Handle public transporter registration submission.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'phone' => 'required|string|max:25',
            'vehicle_type' => 'required|string|max:50',
            'area' => 'required|string|max:120',
            'plate_number' => 'nullable|string|max:30',
            'base_fare' => 'required|numeric|min:0',
            'rate_per_kg' => 'required|numeric|min:0',
            'rate_per_km' => 'required|numeric|min:0',
        ], [
            'name.required' => 'Please enter your full name or business name.',
            'phone.required' => 'Please enter your direct phone number.',
            'vehicle_type.required' => 'Please select your vehicle type.',
            'area.required' => 'Please enter your primary operating town or area.',
        ]);

        $phone = preg_replace('/[\s\-]+/', '', trim($data['phone']));

        Transporter::create([
            'name' => trim($data['name']),
            'phone' => $phone,
            'vehicle_type' => trim($data['vehicle_type']),
            'area' => trim($data['area']),
            'plate_number' => !empty($data['plate_number']) ? strtoupper(trim($data['plate_number'])) : null,
            'status' => 'pending',
            'is_available' => false,
            'base_fare' => $data['base_fare'],
            'rate_per_kg' => $data['rate_per_kg'],
            'rate_per_km' => $data['rate_per_km'],
        ]);

        return redirect()->back()->with('success', 'Thank you! Your details have been submitted. Our team will review and list your number shortly.');
    }
}