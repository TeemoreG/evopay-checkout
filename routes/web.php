<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HostedCheckoutController;
use Illuminate\Support\Facades\Route;

// Storefront Routes (Nyumba Cement POC)
Route::get('/', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/products/{slug}', [CatalogController::class, 'show'])->name('product.show');

// Internal Demo Store Checkout Routes
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout/process', [CheckoutController::class, 'process'])->name('checkout.process');
Route::post('/checkout/distance', [CheckoutController::class, 'getDistance'])->name('checkout.distance');
Route::get('/checkout/status/{order}', [CheckoutController::class, 'checkStatus'])->name('checkout.status');
Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
Route::get('/pay/{order:order_number}', [CheckoutController::class, 'pay'])->name('checkout.pay');
Route::get('/pay/mpesa/{order:order_number}', [CheckoutController::class, 'mpesaPay'])->name('checkout.mpesa.pay');

// Internal Demo Card Routes
Route::get('/checkout/mpgs/pay/{order}', [CheckoutController::class, 'mpgsPay'])->name('checkout.mpgs.pay');
Route::get('/checkout/mpgs/callback/{order}', [CheckoutController::class, 'mpgsCallback'])->name('checkout.mpgs.callback');
Route::get('/checkout/mpgs/cancel/{order}', [CheckoutController::class, 'mpgsCancel'])->name('checkout.mpgs.cancel');

// ============================================================================
// Evopay Hosted Checkout Gateway Routes (/c/{token})
// ============================================================================
Route::prefix('c/{token}')->name('gateway.')->group(function () {
    Route::get('/', [HostedCheckoutController::class, 'show'])->name('show');
    Route::get('/mpesa', [HostedCheckoutController::class, 'mpesaShow'])->name('mpesa');
    Route::post('/mpesa/stk-push', [HostedCheckoutController::class, 'mpesaStkPush'])->name('mpesa.push');
    Route::get('/status', [HostedCheckoutController::class, 'checkStatus'])->name('status');

    // Card (MPGS) Hosted Gateway
    Route::post('/mpgs/init', [HostedCheckoutController::class, 'mpgsInit'])->name('mpgs.init');
    Route::get('/mpgs/pay', [HostedCheckoutController::class, 'mpgsPay'])->name('mpgs.pay');
    Route::get('/mpgs/callback', [HostedCheckoutController::class, 'mpgsCallback'])->name('mpgs.callback');
    Route::get('/mpgs/cancel', [HostedCheckoutController::class, 'mpgsCancel'])->name('mpgs.cancel');

    // Fallback receipt if merchant has no return_url
    Route::get('/success', [HostedCheckoutController::class, 'success'])->name('success');
});

// Provider Inbound Callbacks (CSRF excluded in bootstrap/app.php)
Route::post('/api/mpesa/callback', [CheckoutController::class, 'mpesaCallback']);

// Admin Routes
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('index');
    Route::get('/orders', [AdminController::class, 'orders'])->name('orders');

    // Settings
    Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
    Route::post('/settings', [AdminController::class, 'updateSettings'])->name('settings.update');

    // Products
    Route::post('/products', [AdminController::class, 'storeProduct'])->name('products.store');
    Route::put('/products/{product}', [AdminController::class, 'updateProduct'])->name('products.update');
    Route::delete('/products/{product}', [AdminController::class, 'destroyProduct'])->name('products.destroy');

    // Units
    Route::post('/products/{product}/units', [AdminController::class, 'storeUnit'])->name('units.store');
    Route::put('/products/{product}/units/{unit}', [AdminController::class, 'updateUnit'])->name('units.update');
    Route::delete('/products/{product}/units/{unit}', [AdminController::class, 'destroyUnit'])->name('units.destroy');
});