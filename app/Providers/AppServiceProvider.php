<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api-v1', function (Request $request) {
            $merchant = $request->attributes->get('merchant');
            $key = $merchant ? 'merchant:' . $merchant->id : 'ip:' . $request->ip();

            return Limit::perMinute(120)->by($key)->response(function (Request $request, array $headers) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Too many API requests. Please slow down.',
                ], 429, $headers);
            });
        });

        RateLimiter::for('payment-init', function (Request $request) {
            $token = (string) $request->route('token', '');

            return [
                Limit::perMinute(6)->by($token . '|' . $request->ip()),
                Limit::perMinute(25)->by($request->ip()),
            ];
        });

        RateLimiter::for('status-poll', function (Request $request) {
            $token = (string) $request->route('token', '');

            return Limit::perMinute(60)->by($token . '|' . $request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            $email = strtolower(trim((string) $request->input('email', '')));

            return Limit::perMinute(10)->by($email . '|' . $request->ip());
        });

        RateLimiter::for('public-api', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });
    }
}