<?php

namespace App\Http\Controllers;

use App\Models\Transporter;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    private function redirectForUser($user)
    {
        if ($user->isAdmin()) {
            return redirect()->intended(route('admin.index'));
        }

        if ($user->isTransporter()) {
            return redirect()->intended(route('transporter.dashboard'));
        }

        return redirect()->intended(route('merchant.dashboard'));
    }

    public function showLogin()
    {
        if (Auth::check()) {
            return $this->redirectForUser(Auth::user());
        }

        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ], [
            'email.required' => 'Please enter your email or phone number.',
        ]);

        $input = trim($data['email']);
        $password = $data['password'];
        $resolvedEmail = null;

        // 1. Try finding user directly by email
        if (filter_var($input, FILTER_VALIDATE_EMAIL)) {
            $resolvedEmail = $input;
        } else {
            // 2. Try matching phone number on transporters
            $cleanedPhone = preg_replace('/[\s\-]+/', '', $input);
            $digitsOnly = preg_replace('/\D/', '', $cleanedPhone);

            $transporter = Transporter::with('user')
                ->where('phone', $cleanedPhone)
                ->orWhere('phone', $digitsOnly)
                ->orWhere('phone', 'like', '%' . substr($digitsOnly, -9))
                ->first();

            if ($transporter && $transporter->user) {
                $resolvedEmail = $transporter->user->email;
            } elseif ($transporter && !$transporter->user) {
                return back()->withErrors([
                    'email' => 'Your driver registration is still pending review. Please contact admin for approval.',
                ])->onlyInput('email');
            }
        }

        if (!$resolvedEmail) {
            return back()->withErrors([
                'email' => 'No account found with that email or phone number.',
            ])->onlyInput('email');
        }

        if (!Auth::attempt(['email' => $resolvedEmail, 'password' => $password], $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'Invalid email/phone or password.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();
        $user = Auth::user();

        if ($user->isMerchant() && (!$user->merchant || $user->merchant->status !== 'active')) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'Your merchant account is currently inactive or suspended.',
            ])->onlyInput('email');
        }

        if ($user->isTransporter() && (!$user->transporter || $user->transporter->status !== 'approved')) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'Your driver account is pending admin approval. Please contact the safety desk.',
            ])->onlyInput('email');
        }

        return $this->redirectForUser($user);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}