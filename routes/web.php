<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\GatewayController;
use App\Http\Controllers\HostedCheckoutController;
use App\Http\Controllers\MerchantPortalController;
use App\Http\Controllers\TransporterController;
use App\Http\Controllers\TransporterPortalController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ============================================================================
// Evopay Payment Provider Public Pages
// ============================================================================
Route::get('/', [GatewayController::class, 'home'])->name('home');
Route::post('/request-access', [GatewayController::class, 'requestAccess'])
    ->middleware('throttle:public-api')
    ->name('request-access');
Route::get('/developers', fn () => Inertia::render('Gateway/Developers'))->name('developers');
Route::get('/pricing', fn () => Inertia::render('Gateway/Pricing'))->name('pricing');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login')
    ->name('login.attempt');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

// ============================================================================
// Evopay Hosted Checkout Gateway (/c/{token})
// ============================================================================
Route::prefix('c/{token}')->name('gateway.')->group(function () {
    Route::get('/', [HostedCheckoutController::class, 'show'])->name('show');
    Route::get('/mpesa', [HostedCheckoutController::class, 'mpesaShow'])->name('mpesa');
    Route::post('/mpesa/stk-push', [HostedCheckoutController::class, 'mpesaStkPush'])
        ->middleware('throttle:payment-init')
        ->name('mpesa.push');
    Route::get('/status', [HostedCheckoutController::class, 'checkStatus'])
        ->middleware('throttle:status-poll')
        ->name('status');

    Route::post('/mpgs/init', [HostedCheckoutController::class, 'mpgsInit'])
        ->middleware('throttle:payment-init')
        ->name('mpgs.init');
    Route::get('/mpgs/pay', [HostedCheckoutController::class, 'mpgsPay'])->name('mpgs.pay');
    Route::get('/mpgs/callback', [HostedCheckoutController::class, 'mpgsCallback'])->name('mpgs.callback');
    Route::get('/mpgs/cancel', [HostedCheckoutController::class, 'mpgsCancel'])->name('mpgs.cancel');
    Route::get('/success', [HostedCheckoutController::class, 'success'])->name('success');
});

// Provider Inbound Callbacks (CSRF excluded in bootstrap/app.php)
Route::post('/api/mpesa/callback', [CheckoutController::class, 'mpesaCallback']);

// ============================================================================
// Merchant Portal (Protected)
// ============================================================================
Route::prefix('merchant')->middleware(['auth', 'role:merchant'])->name('merchant.')->group(function () {
    Route::get('/', [MerchantPortalController::class, 'dashboard'])->name('dashboard');
    Route::get('/developers', [MerchantPortalController::class, 'developers'])->name('developers');
    Route::post('/settings', [MerchantPortalController::class, 'updateSettings'])->name('settings.update');
    Route::post('/api-keys', [MerchantPortalController::class, 'createApiKey'])->name('api-keys.create');
    Route::delete('/api-keys/{apiKey}', [MerchantPortalController::class, 'revokeApiKey'])->name('api-keys.revoke');
    Route::post('/webhook-secret', [MerchantPortalController::class, 'rotateWebhookSecret'])->name('webhook-secret.rotate');
    Route::post('/webhooks/{delivery}/retry', [MerchantPortalController::class, 'retryWebhook'])->name('webhooks.retry');
});

// ============================================================================
// Transporter Portal (Protected)
// ============================================================================
Route::prefix('transporter')->middleware(['auth', 'role:transporter'])->name('transporter.')->group(function () {
    Route::get('/', [TransporterPortalController::class, 'dashboard'])->name('dashboard');
    Route::post('/availability', [TransporterPortalController::class, 'toggleAvailability'])->name('availability');
    Route::post('/rates', [TransporterPortalController::class, 'updateRates'])->name('rates');
    Route::post('/orders/{order}/delivered', [TransporterPortalController::class, 'markOrderDelivered'])->name('orders.delivered');
});

// ============================================================================
// Platform Admin — Purely Merchant & Gateway Management (Protected)
// ============================================================================
Route::prefix('admin')->middleware(['auth', 'role:admin'])->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'merchants'])->name('index');
    Route::get('/merchants', [AdminController::class, 'merchants'])->name('merchants');
    Route::post('/merchants', [AdminController::class, 'storeMerchant'])->name('merchants.store');
    Route::post('/merchants/{merchant}/login', [AdminController::class, 'createMerchantLogin'])->name('merchants.login');
    Route::post('/merchants/{merchant}/toggle', [AdminController::class, 'toggleMerchantStatus'])->name('merchants.toggle');
    Route::get('/transactions', [AdminController::class, 'transactions'])->name('transactions');

    // Transition Demo Shop Admin (Separate from main Gateway Admin)
    Route::get('/demo-shop', [AdminController::class, 'index'])->name('demo-shop');
    Route::get('/orders', [AdminController::class, 'orders'])->name('orders');
    Route::post('/orders/{order}/status', [AdminController::class, 'updateOrderStatus'])->name('orders.status');
    Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
    Route::post('/settings', [AdminController::class, 'updateSettings'])->name('settings.update');
    Route::post('/products', [AdminController::class, 'storeProduct'])->name('products.store');
    Route::put('/products/{product}', [AdminController::class, 'updateProduct'])->name('products.update');
    Route::delete('/products/{product}', [AdminController::class, 'destroyProduct'])->name('products.destroy');

    // Transporter Management (Admin)
    Route::get('/transporters', [AdminController::class, 'transporters'])->name('transporters');
    Route::post('/transporters', [AdminController::class, 'storeTransporter'])->name('transporters.store');
    Route::put('/transporters/{transporter}', [AdminController::class, 'updateTransporter'])->name('transporters.update');
    Route::get('/transporters/{transporter}/id-document', [AdminController::class, 'viewTransporterIdDocument'])->name('transporters.id-document');
    Route::post('/transporters/{transporter}/login', [AdminController::class, 'createTransporterLogin'])->name('transporters.login');
    Route::post('/transporters/{transporter}/approve', [AdminController::class, 'approveTransporter'])->name('transporters.approve');
    Route::post('/transporters/{transporter}/toggle', [AdminController::class, 'toggleTransporterStatus'])->name('transporters.toggle');
    Route::delete('/transporters/{transporter}', [AdminController::class, 'destroyTransporter'])->name('transporters.destroy');
});

// ============================================================================
// Transition Demo Shop Routes (/shop) — Connected to Evopay as an API Client
// ============================================================================
Route::get('/shop', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/products/{slug}', [CatalogController::class, 'show'])->name('product.show');
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout/process', [CheckoutController::class, 'process'])
    ->middleware('throttle:public-api')
    ->name('checkout.process');
Route::post('/checkout/distance', [CheckoutController::class, 'getDistance'])
    ->middleware('throttle:public-api')
    ->name('checkout.distance');
Route::get('/checkout/return', [CheckoutController::class, 'gatewayReturn'])->name('checkout.return');
Route::get('/checkout/cancel', [CheckoutController::class, 'gatewayCancel'])->name('checkout.cancel');
Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
Route::post('/api/shop/webhook', [CheckoutController::class, 'shopWebhook'])->name('shop.evopay.webhook');

// Public Transporter Registration (Nyumba Cement Demo Store)
Route::get('/shop/transporters/register', [TransporterController::class, 'create'])->name('transporters.register');
Route::post('/shop/transporters/register', [TransporterController::class, 'store'])
    ->middleware('throttle:public-api')
    ->name('transporters.register.store');