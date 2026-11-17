<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CheckoutController;

// This route is CSRF-free and perfect for API calls
Route::post('/distance', [CheckoutController::class, 'getDistance']);