<?php

namespace App\Http\Controllers;

use App\Models\Transporter;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
     * Handle public transporter registration with credentials and National ID upload.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'phone' => 'required|string|max:25',
            'email' => 'nullable|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'vehicle_type' => 'required|string|max:50',
            'area' => 'required|string|max:120',
            'plate_number' => 'nullable|string|max:30',
            'id_number' => 'required|string|max:30',
            'id_document' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
            'base_fare' => 'required|numeric|min:0',
            'rate_per_kg' => 'required|numeric|min:0',
            'rate_per_km' => 'required|numeric|min:0',
            'max_weight_kg' => 'nullable|numeric|min:50',
        ], [
            'name.required' => 'Please enter your full name or fleet name.',
            'phone.required' => 'Please enter your direct mobile phone number.',
            'password.required' => 'Please enter a password to log into your driver portal.',
            'password.min' => 'Password must be at least 8 characters.',
            'vehicle_type.required' => 'Please select your vehicle type.',
            'area.required' => 'Please enter your primary operating town or base.',
            'id_number.required' => 'Please enter your National ID number.',
            'id_document.required' => 'Please upload a photo or PDF of your National ID.',
            'id_document.mimes' => 'National ID must be a JPG, PNG, WEBP, or PDF file.',
            'id_document.max' => 'National ID must not exceed 5 MB.',
        ]);

        $phone = preg_replace('/[\s\-]+/', '', trim($data['phone']));
        $digitsOnly = preg_replace('/\D/', '', $phone);

        // Generate fallback unique login email if phone-only is provided
        $loginEmail = !empty($data['email']) ? strtolower(trim($data['email'])) : "driver.{$digitsOnly}@driver.evopay.africa";

        if (empty($data['email']) && User::where('email', $loginEmail)->exists()) {
            $loginEmail = "driver.{$digitsOnly}." . rand(100, 999) . "@driver.evopay.africa";
        }

        $idDocumentPath = $request->file('id_document')->store('transporter-ids', 'local');

        $result = DB::transaction(function () use ($data, $phone, $idDocumentPath, $loginEmail) {
            $transporter = Transporter::create([
                'name' => trim($data['name']),
                'phone' => $phone,
                'vehicle_type' => trim($data['vehicle_type']),
                'area' => trim($data['area']),
                'plate_number' => !empty($data['plate_number']) ? strtoupper(trim($data['plate_number'])) : null,
                'id_number' => trim($data['id_number']),
                'id_document_path' => $idDocumentPath,
                'status' => 'pending',
                'is_available' => false,
                'base_fare' => $data['base_fare'],
                'rate_per_kg' => $data['rate_per_kg'],
                'rate_per_km' => $data['rate_per_km'],
                'max_weight_kg' => $data['max_weight_kg'] ?? 3000,
            ]);

            User::create([
                'name' => $transporter->name,
                'email' => $loginEmail,
                'password' => $data['password'],
                'role' => 'transporter',
                'transporter_id' => $transporter->id,
            ]);

            return [
                'transporter' => $transporter,
                'login_identifier' => !empty($data['email']) ? $data['email'] : $phone,
            ];
        });

        return redirect()->back()->with('success', 'Application submitted! Please contact the safety desk for fast approval.');
    }
}