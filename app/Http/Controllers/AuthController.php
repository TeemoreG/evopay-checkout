<?php

namespace App\Http\Controllers;

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
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'Invalid email or password.',
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
                'email' => 'Your transporter account is currently pending review or suspended.',
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