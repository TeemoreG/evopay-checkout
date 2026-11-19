<?php

use App\Http\Controllers\Api\CheckoutSessionController;
use App\Http\Controllers\CheckoutController;
use Illuminate\Support\Facades\Route;

// Public utility endpoints
Route::post('/distance', [CheckoutController::class, 'getDistance']);

// Internal POC payment endpoints
Route::post('/payments/mpesa/stk-push', [CheckoutController::class, 'mpesaStkPush']);
Route::post('/payments/mpgs/init', [CheckoutController::class, 'mpgsInit']);
Route::get('/payments/{order:order_number}/status', [CheckoutController::class, 'checkStatus']);

// Merchant v1 API (Authenticated via Bearer sk_live_... / sk_test_...)
Route::prefix('v1')->middleware('auth.api_key')->group(function () {
    Route::post('/checkout/sessions', [CheckoutSessionController::class, 'store']);
    Route::get('/checkout/sessions/{token}', [CheckoutSessionController::class, 'show']);
    Route::get('/checkout/sessions/reference/{reference}', [CheckoutSessionController::class, 'showByReference']);
});