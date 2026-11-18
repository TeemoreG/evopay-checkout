<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Storefront Routes
Route::get('/', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/products/{slug}', [CatalogController::class, 'show'])->name('product.show');

// Checkout Routes
Route::get('/checkout', fn () => Inertia::render('Checkout/Index'))->name('checkout.index');
Route::post('/checkout/process', [CheckoutController::class, 'process'])->name('checkout.process');
Route::post('/checkout/distance', [CheckoutController::class, 'getDistance'])->withoutMiddleware(['csrf'])->name('checkout.distance');
Route::get('/checkout/status/{order}', [CheckoutController::class, 'checkStatus'])->name('checkout.status');
Route::get('/checkout/success', fn () => Inertia::render('Checkout/Success'))->name('checkout.success');

// M-Pesa Callback Route (Bypasses CSRF so Safaricom can POST to it)
Route::post('/api/mpesa/callback', [CheckoutController::class, 'mpesaCallback'])->withoutMiddleware(['csrf']);

// Admin Routes
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('index');
    
    // Settings
    Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
    Route::post('/settings', [AdminController::class, 'updateSettings'])->name('settings.update');
    
    // Products
    Route::post('/products', [AdminController::class, 'storeProduct'])->name('products.store');
    Route::put('/products/{product}', [AdminController::class, 'updateProduct'])->name('products.update');
    Route::delete('/products/{product}', [AdminController::class, 'destroyProduct'])->name('products.destroy');
    
    // Units/Variants
    Route::post('/products/{product}/units', [AdminController::class, 'storeUnit'])->name('units.store');
    Route::put('/products/{product}/units/{unit}', [AdminController::class, 'updateUnit'])->name('units.update');
    Route::delete('/products/{product}/units/{unit}', [AdminController::class, 'destroyUnit'])->name('units.destroy');
});