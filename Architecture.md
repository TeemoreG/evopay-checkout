# Evopay Checkout — Universal System & Codebase Reference

**Live URL:** https://checkout.evopay.africa  
**Stack:** Laravel 12 · Inertia.js · React 19 · Vite · Tailwind CSS v4 · MySQL (cPanel)  
**Core Purpose:** Multi-merchant payment gateway for Kenya (M-Pesa STK Push + Mastercard/Visa MPGS) with a separate `/shop` demo storefront that consumes Evopay via its own REST API.

---

## 1. System Architecture & Flows

### A. Merchant Onboarding & Authentication
- **Roles (`users.role`):**
  - `admin`: Super-admin created via CLI (`php artisan admin:create`), accesses `/admin/*`.
  - `merchant`: Business user linked via `users.merchant_id`, created in `/admin/merchants`, accesses `/merchant/*`.
- **Middleware:**
  - `role` (`EnsureRole`): Guards `/admin/*` (`role:admin`) and `/merchant/*` (`role:merchant`); blocks inactive/suspended merchants.
  - `auth.api_key` (`AuthenticateApiKey`): Validates `Authorization: Bearer sk_live_...` (or `sk_test_...`) via SHA-256 hash in `api_keys` and attaches `merchant` and `api_key` to `$request->attributes`.

### B. Merchant REST API (`/api/v1/*`)
1. **`POST /api/v1/checkout/sessions`** (`Api\CheckoutSessionController::store`)
   - Supports `Idempotency-Key` header (unique per `merchant_id`).
   - Validates `amount`, `currency` (`KES`), `merchant_reference`, `customer`, `return_url`, `cancel_url`, `webhook_url`, `metadata`, `expires_in_minutes`.
   - Creates `CheckoutSession` (`cs_{mode}_...`) and returns `checkout_url` (`https://checkout.evopay.africa/c/{token}`).
2. **`GET /api/v1/checkout/sessions/{token}`** & **`/reference/{reference}`**
   - Server-to-server verification scoped to `$merchant->id`.

### C. Customer Hosted Checkout (`/c/{token}`)
- **`GET /c/{token}` (`HostedCheckoutController::show` → `Gateway/Pay.jsx`):** Branded with `merchant.name` & `merchant.logo_url`; redirects to `return_url` if paid or `Gateway/Expired.jsx` if expired.
- **M-Pesa Flow:**
  1. `GET /c/{token}/mpesa` (`Gateway/MpesaPay.jsx`) → `POST /c/{token}/mpesa/stk-push` calls `MpesaService::stkPush()`.
  2. Frontend polls `GET /c/{token}/status` every 3s (up to 75s). After 20s (or `?force=1`), `checkStatus()` falls back to `MpesaService::stkQuery()` (cache-locked).
  3. Safaricom async callback hits `POST /api/mpesa/callback` (`CheckoutController::mpesaCallback`), marks `CheckoutSession` `paid`/`failed` with `mpesa_receipt`, and dispatches `DispatchMerchantWebhook`.
- **Card Flow (Mastercard MPGS):**
  1. `POST /c/{token}/mpgs/init` calls `MpgsService::createSession()` (`INITIATE_CHECKOUT`, `PURCHASE`), caches `successIndicator`, returns `/c/{token}/mpgs/pay`.
  2. `views/gateway/mpgs.blade.php` loads `checkout.min.js` (`Checkout.showPaymentPage()`).
  3. Reconciles via `GET /c/{token}/mpgs/callback` (`MpgsService::retrieveOrder()`) or `POST /api/webhooks/mpgs` (fail-closed `X-Notification-Secret` check against `MPGS_WEBHOOK_SECRET`), then dispatches `DispatchMerchantWebhook` and redirects to `return_url`.

### D. Outbound Merchant Webhooks
- `DispatchMerchantWebhook` (`ShouldQueue`, 3 tries, `[15, 60, 300]` backoff) posts `payment.succeeded` / `payment.failed` to `session.webhook_url` (or `merchant.webhook_url`).
- Signed via `X-Evopay-Signature: sha256=...` using `merchant.webhook_secret`. Logged in `webhook_deliveries`.

### E. Transition Demo Shop (`/shop`)
- Acts as an external merchant client calling `POST /api/v1/checkout/sessions` with `EVOPAY_SHOP_SECRET_KEY`, `EVOPAY_GATEWAY_URL`, and `EVOPAY_SHOP_WEBHOOK_SECRET`.
- Calculates driving distance via Google Routes API (`computeRoutes`) from `settings` (`hq_lat`, `hq_lng`, `price_per_kg`, `price_per_km`).

---

## 2. Database Tables
- **`users`**: `id`, `name`, `email`, `password`, `role` (`admin`|`merchant`), `merchant_id` (FK nullable)
- **`merchants`**: `id`, `name`, `slug`, `email`, `logo_url`, `webhook_url`, `webhook_secret`, `default_return_url`, `default_cancel_url`, `status` (`active`|`suspended`), `fee_percent`, `fee_flat`, `settlement_details` (JSON), `metadata` (JSON)
- **`api_keys`**: `id`, `merchant_id` (FK), `name`, `public_key` (`pk_...`), `secret_key_hash` (SHA-256), `secret_key_prefix`, `mode` (`live`|`test`), `is_active`, `last_used_at`
- **`checkout_sessions`**: `id`, `token` (`cs_...`), `merchant_id` (FK), `idempotency_key` (unique with `merchant_id`), `merchant_reference`, `amount`, `currency`, `customer` (JSON), `return_url`, `cancel_url`, `webhook_url`, `status`, `payment_method`, `failure_reason`, `mpesa_request_id`, `mpesa_receipt`, `mpgs_session_id`, `metadata` (JSON), `expires_at`, `paid_at`
- **`webhook_deliveries`**: `id`, `merchant_id` (FK), `checkout_session_id` (FK), `event`, `url`, `payload` (JSON), `response_code`, `response_body`, `error`, `attempts`, `delivered_at`
- **`orders`** *(Demo Shop)*: `id`, `order_number`, `total_amount`, `status`, `failure_reason`, `payment_method`, `mpgs_session_id`, `mpesa_request_id`, `mpesa_receipt`, `items` (JSON), `customer` (JSON), `delivery` (JSON)
- **`products`**, **`product_units`**, **`price_breaks`**, **`settings`** *(Demo Shop catalog & config)*

---

## 3. Directory & File Structure

evopay-checkout/
├── app/
│   ├── Console/Commands/
│   │   ├── CreateAdminCommand.php          # `php artisan admin:create`
│   │   └── CreateMerchantCommand.php       # `php artisan merchant:create`
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   └── CheckoutSessionController.php  # /api/v1/checkout/sessions (+ Idempotency-Key)
│   │   │   ├── AdminController.php                # /admin merchants, transactions & demo-shop CRUD
│   │   │   ├── AuthController.php                 # /login, /logout
│   │   │   ├── CatalogController.php              # /shop storefront
│   │   │   ├── CheckoutController.php             # Demo shop checkout + /api/mpesa/callback
│   │   │   ├── GatewayController.php              # Public home & POST /request-access
│   │   │   ├── HostedCheckoutController.php       # /c/{token}/* payment flows & /api/webhooks/mpgs
│   │   │   └── MerchantPortalController.php       # /merchant/* dashboard, keys, webhook retries
│   │   └── Middleware/
│   │       ├── AuthenticateApiKey.php             # `auth.api_key`
│   │       ├── EnsureRole.php                     # `role:admin` / `role:merchant`
│   │       └── HandleInertiaRequests.php
│   ├── Jobs/
│   │   └── DispatchMerchantWebhook.php            # Queued HMAC-SHA256 webhook dispatcher
│   ├── Models/
│   │   ├── ApiKey.php
│   │   ├── CheckoutSession.php
│   │   ├── Merchant.php
│   │   ├── Order.php
│   │   ├── PriceBreak.php
│   │   ├── Product.php
│   │   ├── ProductUnit.php
│   │   ├── Setting.php
│   │   ├── User.php
│   │   └── WebhookDelivery.php
│   └── Services/
│       ├── MpesaService.php                       # Daraja OAuth, stkPush(), stkQuery()
│       ├── MpgsService.php                        # MPGS createSession(), retrieveOrder(), checkout.min.js URL
│       └── PricingService.php
├── bootstrap/
│   └── app.php                                    # Route files, CSRF exemptions, middleware aliases
├── database/migrations/                           # Schema history (Real DB only — NO seeders)
├── resources/
│   ├── css/app.css                                # Tailwind v4 @theme brand tokens
│   ├── views/
│   │   ├── app.blade.php
│   │   └── gateway/mpgs.blade.php                 # Mastercard checkout.min.js launcher
│   └── js/
│       ├── Components/GoogleAddressInput.jsx
│       ├── Layouts/
│       │   ├── GatewayLayout.jsx                  # Public marketing/docs header & footer
│       │   └── MainLayout.jsx                     # App shell (Admin, Merchant, Gateway /c/{token}, Shop)
│       ├── Pages/
│       │   ├── Admin/
│       │   │   ├── Merchants.jsx                  # Main /admin gateway dashboard
│       │   │   ├── Transactions.jsx               # /admin/transactions global monitor
│       │   │   ├── Index.jsx                      # /admin/demo-shop inventory
│       │   │   ├── Orders.jsx                     # /admin/orders (demo shop)
│       │   │   └── Settings.jsx                   # /admin/settings (demo shop HQ & rates)
│       │   ├── Auth/Login.jsx
│       │   ├── Catalog/Index.jsx
│       │   ├── Checkout/ (Index.jsx, Success.jsx)
│       │   ├── Gateway/
│       │   │   ├── Home.jsx                       # / (with Request Access modal -> devops2@evopay.africa)
│       │   │   ├── Developers.jsx                 # /developers
│       │   │   ├── Pricing.jsx                    # /pricing
│       │   │   ├── Pay.jsx                        # /c/{token}
│       │   │   ├── MpesaPay.jsx                   # /c/{token}/mpesa
│       │   │   ├── Success.jsx                    # /c/{token}/success (fallback receipt)
│       │   │   └── Expired.jsx                    # /c/{token} expired notice
│       │   ├── Merchant/
│       │   │   ├── Dashboard.jsx                  # /merchant transactions & stats
│       │   │   └── Developers.jsx                 # /merchant/developers API keys & webhook logs
│       │   └── Product/Show.jsx
│       └── Stores/cart.js                         # Zustand cart (Demo Shop only)
└── routes/
    ├── api.php                                    # /api/v1/*, /api/webhooks/mpgs, /api/distance
    └── web.php                                    # /, /c/{token}/*, /merchant/*, /admin/*, /shop