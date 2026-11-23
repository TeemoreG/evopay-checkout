<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class GatewayController extends Controller
{
    public function home()
    {
        return Inertia::render('Gateway/Home');
    }

    public function requestAccess(Request $request)
    {
        $data = $request->validate([
            'business_name' => 'required|string|max:255',
            'contact_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'expected_volume' => 'nullable|string|max:100',
        ]);

        $targetEmail = 'devops2@evopay.africa';

        try {
            // Send email if mail is configured, otherwise fallback to log
            Mail::raw(
                "New Merchant Access Request:\n\n" .
                "Business Name: {$data['business_name']}\n" .
                "Contact Person: {$data['contact_name']}\n" .
                "Email: {$data['email']}\n" .
                "Phone: {$data['phone']}\n" .
                "Expected Volume: " . ($data['expected_volume'] ?? 'Not specified') . "\n",
                function ($message) use ($targetEmail, $data) {
                    $message->to($targetEmail)
                        ->subject("New API Access Request: {$data['business_name']}")
                        ->replyTo($data['email'], $data['contact_name']);
                }
            );
        } catch (\Throwable $e) {
            \Log::info("Merchant Access Request (Mail fallback): " . json_encode($data));
        }

        return redirect()->back()->with('success', 'Your access request has been submitted successfully! Our team will email your API credentials to ' . $data['email'] . ' shortly.');
    }
}