<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CheckoutController;

// This route is CSRF-free and perfect for API calls
Route::post('/distance', [CheckoutController::class, 'getDistance']);

// Reusable Payment Gateway Endpoints
Route::post('/payments/mpesa/stk-push', [CheckoutController::class, 'mpesaStkPush']);
Route::get('/payments/{order:order_number}/status', [CheckoutController::class, 'checkStatus']);