<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (!$user) {
            return $request->expectsJson()
                ? response()->json(['message' => 'Unauthenticated.'], 401)
                : redirect()->route('login');
        }

        if ($user->role !== $role) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }

            if ($user->isAdmin()) {
                return redirect()->route('admin.index');
            }

            if ($user->isTransporter()) {
                return redirect()->route('transporter.dashboard');
            }

            return redirect()->route('merchant.dashboard');
        }

        if ($user->isMerchant()) {
            $merchant = $user->merchant;
            if (!$merchant || $merchant->status !== 'active') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'email' => 'Your merchant account is inactive or suspended.',
                ]);
            }
        }

        if ($user->isTransporter()) {
            $transporter = $user->transporter;
            if (!$transporter || $transporter->status !== 'approved') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'email' => 'Your transporter account is pending review or suspended.',
                ]);
            }
        }

        return $next($request);
    }
}