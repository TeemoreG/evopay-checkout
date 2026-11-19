<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HostedCheckoutController;
use App\Http\Controllers\MerchantPortalController;
use Illuminate\Support\Facades\Route;

// Auth Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

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

// Evopay Hosted Checkout Gateway Routes (/c/{token})
Route::prefix('c/{token}')->name('gateway.')->group(function () {
    Route::get('/', [HostedCheckoutController::class, 'show'])->name('show');
    Route::get('/mpesa', [HostedCheckoutController::class, 'mpesaShow'])->name('mpesa');
    Route::post('/mpesa/stk-push', [HostedCheckoutController::class, 'mpesaStkPush'])->name('mpesa.push');
    Route::get('/status', [HostedCheckoutController::class, 'checkStatus'])->name('status');

    Route::post('/mpgs/init', [HostedCheckoutController::class, 'mpgsInit'])->name('mpgs.init');
    Route::get('/mpgs/pay', [HostedCheckoutController::class, 'mpgsPay'])->name('mpgs.pay');
    Route::get('/mpgs/callback', [HostedCheckoutController::class, 'mpgsCallback'])->name('mpgs.callback');
    Route::get('/mpgs/cancel', [HostedCheckoutController::class, 'mpgsCancel'])->name('mpgs.cancel');
    Route::get('/success', [HostedCheckoutController::class, 'success'])->name('success');
});

// Provider Inbound Callbacks (CSRF excluded in bootstrap/app.php)
Route::post('/api/mpesa/callback', [CheckoutController::class, 'mpesaCallback']);

// Merchant Portal Routes (Protected)
Route::prefix('merchant')->middleware(['auth', 'role:merchant'])->name('merchant.')->group(function () {
    Route::get('/', [MerchantPortalController::class, 'dashboard'])->name('dashboard');
    Route::get('/developers', [MerchantPortalController::class, 'developers'])->name('developers');
    Route::post('/settings', [MerchantPortalController::class, 'updateSettings'])->name('settings.update');
    Route::post('/api-keys', [MerchantPortalController::class, 'createApiKey'])->name('api-keys.create');
    Route::delete('/api-keys/{apiKey}', [MerchantPortalController::class, 'revokeApiKey'])->name('api-keys.revoke');
    Route::post('/webhook-secret', [MerchantPortalController::class, 'rotateWebhookSecret'])->name('webhook-secret.rotate');
    Route::post('/webhooks/{delivery}/retry', [MerchantPortalController::class, 'retryWebhook'])->name('webhooks.retry');
});

// Admin Routes (Protected)
Route::prefix('admin')->middleware(['auth', 'role:admin'])->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('index');
    Route::get('/orders', [AdminController::class, 'orders'])->name('orders');
    Route::get('/merchants', [AdminController::class, 'merchants'])->name('merchants');
    Route::post('/merchants', [AdminController::class, 'storeMerchant'])->name('merchants.store');
    Route::post('/merchants/{merchant}/toggle', [AdminController::class, 'toggleMerchantStatus'])->name('merchants.toggle');

    // Settings
    Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
    Route::post('/settings', [AdminController::class, 'updateSettings'])->name('settings.update');

    // Products
    Route::post('/products', [AdminController::class, 'storeProduct'])->name('products.store');
    Route::put('/products/{product}', [AdminController::class, 'updateProduct'])->name('products.update');
    Route::delete('/products/{product}', [AdminController::class, 'destroyProduct'])->name('products.destroy');
});