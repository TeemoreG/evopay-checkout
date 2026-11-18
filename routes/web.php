<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Storefront Routes
Route::get('/', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/products/{slug}', [CatalogController::class, 'show'])->name('product.show');

// Checkout Routes
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout/process', [CheckoutController::class, 'process'])->name('checkout.process');
Route::post('/checkout/distance', [CheckoutController::class, 'getDistance'])->name('checkout.distance');
Route::get('/checkout/status/{order}', [CheckoutController::class, 'checkStatus'])->name('checkout.status');
Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');

// Hosted Payment Pages
Route::get('/pay/{order:order_number}', [CheckoutController::class, 'pay'])->name('checkout.pay');
Route::get('/pay/mpesa/{order:order_number}', [CheckoutController::class, 'mpesaPay'])->name('checkout.mpesa.pay');

// MPGS Card Checkout Routes
Route::get('/checkout/mpgs/pay/{order}', [CheckoutController::class, 'mpgsPay'])->name('checkout.mpgs.pay');
Route::get('/checkout/mpgs/callback/{order}', [CheckoutController::class, 'mpgsCallback'])->name('checkout.mpgs.callback');
Route::get('/checkout/mpgs/cancel/{order}', [CheckoutController::class, 'mpgsCancel'])->name('checkout.mpgs.cancel');

// M-Pesa Callback Route (CSRF excluded in bootstrap/app.php)
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

    // Units/Variants
    Route::post('/products/{product}/units', [AdminController::class, 'storeUnit'])->name('units.store');
    Route::put('/products/{product}/units/{unit}', [AdminController::class, 'updateUnit'])->name('units.update');
    Route::delete('/products/{product}/units/{unit}', [AdminController::class, 'destroyUnit'])->name('units.destroy');
});