import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

const apiRequestSnippet = `POST https://checkout.evopay.africa/api/v1/checkout/sessions
Authorization: Bearer sk_live_your_secret_key
Content-Type: application/json

{
  "amount": 2500,
  "currency": "KES",
  "merchant_reference": "ORD-84920",
  "customer": {
    "name": "Jane Doe",
    "phone": "0712345678",
    "email": "jane@example.com"
  },
  "return_url": "https://yourshop.co.ke/orders/success",
  "webhook_url": "https://yourshop.co.ke/api/evopay/webhook"
}`;

const webhookVerifySnippet = `// Verify X-Evopay-Signature on your backend (PHP)
$payload   = $request->getContent();
$signature = $request->header('X-Evopay-Signature');
$expected  = 'sha256=' . hash_hmac('sha256', $payload, env('EVOPAY_WEBHOOK_SECRET'));

if (!hash_equals($expected, (string) $signature)) {
    abort(401, 'Invalid signature');
}`;

export default function GatewayHome() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white text-brand-dark font-sans flex flex-col overflow-x-hidden">
            <Head title="Evopay Checkout — M-Pesa & Card Payment Gateway" />

            {/* Sticky Top Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
                        <img src="/images/logo.png" alt="Evopay" className="h-8 sm:h-10 w-auto" />
                        <div className="leading-tight">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-primary block">
                                Payment Gateway
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
                        <a href="#features" className="hover:text-brand-primary transition">Features</a>
                        <a href="#how-it-works" className="hover:text-brand-primary transition">How It Works</a>
                        <a href="#developers" className="hover:text-brand-primary transition">API Docs</a>
                        <a href="#pricing" className="hover:text-brand-primary transition">Pricing</a>
                        <Link href="/shop" className="hover:text-brand-primary transition">Demo Store</Link>
                    </nav>

                    {/* Distinct Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href="mailto:support@evopay.africa?subject=Evopay%20Merchant%20Onboarding"
                            className="text-sm font-semibold text-gray-600 px-4 py-2.5 rounded-xl hover:text-brand-dark hover:bg-brand-light transition"
                        >
                            Request Access
                        </a>
                        <Link
                            href="/login"
                            className="bg-brand-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-black transition"
                        >
                            Sign In →
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        className="md:hidden p-2 rounded-lg border border-brand-border text-brand-dark hover:bg-brand-light cursor-pointer"
                        aria-label="Toggle navigation"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-brand-border bg-white px-4 py-4 space-y-1 text-sm font-semibold">
                        <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-gray-700">Features</a>
                        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-gray-700">How It Works</a>
                        <a href="#developers" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-gray-700">API Docs</a>
                        <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-gray-700">Pricing</a>
                        <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-gray-700">Demo Store</Link>
                        <div className="pt-3 mt-2 border-t border-brand-border flex flex-col gap-2.5">
                            <a
                                href="mailto:support@evopay.africa?subject=Evopay%20Merchant%20Onboarding"
                                className="w-full text-center border border-brand-border text-brand-dark py-3 rounded-xl font-bold"
                            >
                                Request Access
                            </a>
                            <Link href="/login" className="w-full text-center bg-brand-dark text-white py-3 rounded-xl font-bold">
                                Sign In →
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-brand-light border-b border-brand-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
                        <div className="lg:col-span-6 min-w-0">
                            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-brand-primary">
                                Evopay Payment Infrastructure · Kenya
                            </p>

                            <h1 className="mt-3 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-extrabold text-brand-dark tracking-tight leading-[1.15]">
                                Accept M-Pesa & Card Payments Through One Unified API
                            </h1>

                            <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                                Launch a merchant-branded hosted checkout in minutes. Evopay handles Safaricom M-Pesa STK Push, Visa & Mastercard 3D Secure, and signed server webhooks so your store gets paid reliably.
                            </p>

                            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <a
                                    href="#developers"
                                    className="bg-brand-dark text-white px-6 py-3.5 sm:py-4 rounded-xl font-bold text-sm text-center hover:bg-black transition"
                                >
                                    Read API Quickstart
                                </a>
                                <Link
                                    href="/shop"
                                    className="bg-white border border-brand-border text-brand-dark px-6 py-3.5 sm:py-4 rounded-xl font-bold text-sm text-center hover:bg-gray-50 transition"
                                >
                                    Try Live Demo Store
                                </Link>
                            </div>

                            <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-brand-border flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 font-semibold">
                                <span className="uppercase tracking-wider text-[11px] text-gray-400 w-full sm:w-auto">Payment Rails:</span>
                                <span>Safaricom M-Pesa</span>
                                <span className="text-gray-300">•</span>
                                <span>Visa & Mastercard (MPGS)</span>
                                <span className="text-gray-300 hidden sm:inline">•</span>
                                <span className="text-gray-400">Airtel Money (Soon)</span>
                            </div>
                        </div>

                        {/* Checkout Preview Card */}
                        <div className="lg:col-span-6 min-w-0 w-full">
                            <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-lg p-4 sm:p-7 max-w-lg mx-auto w-full">
                                <div className="flex items-center justify-between gap-2 pb-4 border-b border-brand-border">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                                            ES
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-brand-dark truncate">Evopay Shop</p>
                                            <p className="text-[10px] text-gray-400 truncate">checkout.evopay.africa/c/cs_live_...</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 flex-shrink-0">
                                        SSL Secured
                                    </span>
                                </div>

                                <div className="py-4 sm:py-5 text-center border-b border-brand-border/60">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Amount Payable</p>
                                    <p className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-1">KES 2,500</p>
                                    <p className="text-xs text-gray-500 mt-1">Ref: ORD-84920 · Jane Doe</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 sm:gap-2.5 my-4 sm:my-5">
                                    <div className="rounded-xl border-2 border-brand-primary bg-brand-primary/5 p-2.5 sm:p-3 text-center">
                                        <p className="text-[11px] sm:text-xs font-extrabold text-brand-dark truncate">M-Pesa</p>
                                        <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 truncate">STK Push</p>
                                    </div>
                                    <div className="rounded-xl border border-brand-border p-2.5 sm:p-3 text-center">
                                        <p className="text-[11px] sm:text-xs font-bold text-brand-dark truncate">Card</p>
                                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 truncate">Visa / MC</p>
                                    </div>
                                    <div className="rounded-xl border border-brand-border bg-gray-50 opacity-50 p-2.5 sm:p-3 text-center">
                                        <p className="text-[11px] sm:text-xs font-bold text-brand-dark truncate">Airtel</p>
                                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 truncate">Soon</p>
                                    </div>
                                </div>

                                <div className="bg-brand-dark text-white text-center py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm">
                                    Pay · KES 2,500
                                </div>

                                <div className="mt-4 rounded-xl bg-gray-900 text-gray-200 p-3 font-mono text-[10px] sm:text-[11px] flex flex-wrap items-center justify-between gap-2">
                                    <span className="truncate">POST /api/v1/checkout/sessions</span>
                                    <span className="text-emerald-400 font-bold flex-shrink-0">201 Created</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Metrics Strip */}
                <section className="bg-brand-dark text-white py-7 sm:py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 text-center">
                        <div>
                            <p className="text-lg sm:text-2xl font-extrabold text-brand-secondary">Direct STK</p>
                            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">Safaricom Daraja Integration</p>
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-extrabold text-brand-secondary">3DS 2.0</p>
                            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">Mastercard & Visa Hosted UI</p>
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-extrabold text-brand-secondary">HMAC-SHA256</p>
                            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">Signed Webhook Events</p>
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-extrabold text-brand-secondary">REST API</p>
                            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">One-Call Session Setup</p>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-12 sm:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="max-w-2xl">
                            <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Capabilities</p>
                            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
                                Everything your business needs to collect payments online
                            </h2>
                            <p className="mt-3 text-gray-500 text-sm sm:text-base">
                                Built for Kenyan commerce — reliable callbacks, responsive mobile checkout, and zero card-handling PCI headaches.
                            </p>
                        </div>

                        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            <FeatureCard
                                title="M-Pesa STK Push Express"
                                body="Customers enter any Safaricom number, receive an instant PIN prompt, and get verified directly via Safaricom callbacks."
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                    </svg>
                                }
                            />
                            <FeatureCard
                                title="Mastercard & Visa (MPGS)"
                                body="Global card acceptance powered by Mastercard Hosted Checkout with full 3D Secure verification and zero PCI-DSS burden."
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                    </svg>
                                }
                            />
                            <FeatureCard
                                title="Merchant-Branded Checkout"
                                body="Every /c/{token} session displays your business name, logo, order reference, and redirects back to your return URL."
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                                    </svg>
                                }
                            />
                            <FeatureCard
                                title="Signed Outbound Webhooks"
                                body="Evopay posts real-time payment.succeeded and payment.failed events to your server with X-Evopay-Signature verification."
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                    </svg>
                                }
                            />
                            <FeatureCard
                                title="Merchant Developer Console"
                                body="Rotate API keys, configure webhook URLs, inspect HTTP delivery logs, and retry failed webhook events in one click."
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                                    </svg>
                                }
                            />
                            <FeatureCard
                                title="Multi-Device Responsive UI"
                                body="Built for mobile shoppers and desktop browsers alike, with clear failure reasons, retries, and printable receipts."
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                    </svg>
                                }
                            />
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="py-12 sm:py-24 bg-brand-light border-y border-brand-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center max-w-2xl mx-auto">
                            <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Integration Flow</p>
                            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
                                Go live in 3 simple steps
                            </h2>
                        </div>

                        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                            <StepCard
                                step="01"
                                title="Create a Checkout Session"
                                body="Your backend calls POST /api/v1/checkout/sessions with your secret key, amount, currency, and order reference."
                            />
                            <StepCard
                                step="02"
                                title="Redirect to Evopay"
                                body="Redirect the customer to the returned checkout_url. They pick M-Pesa or Card and complete payment securely."
                            />
                            <StepCard
                                step="03"
                                title="Verify & Fulfill"
                                body="Receive a signed webhook on your server (or call GET /api/v1/checkout/sessions/{token}) and mark the order paid."
                            />
                        </div>
                    </div>
                </section>

                {/* Developer API Section */}
                <section id="developers" className="py-12 sm:py-24 bg-brand-dark text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
                        <div className="lg:col-span-5 min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary">For Developers</p>
                            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight">
                                Clean REST APIs & Cryptographic Webhooks
                            </h2>
                            <p className="mt-4 text-sm sm:text-base text-gray-400 leading-relaxed">
                                Integrate from Laravel, Node.js, Python, or any backend using standard HTTPS requests and Bearer token authentication.
                            </p>

                            <ul className="mt-6 space-y-3 text-sm text-gray-300">
                                <li className="flex items-center gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary flex-shrink-0"></span>
                                    <span>SHA-256 hashed API keys (sk_live_... / sk_test_...)</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary flex-shrink-0"></span>
                                    <span>Server-to-server session & reference verification</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary flex-shrink-0"></span>
                                    <span>HMAC-SHA256 webhook signature verification</span>
                                </li>
                            </ul>

                            <div className="mt-7 sm:mt-8">
                                <Link
                                    href="/login"
                                    className="inline-block w-full sm:w-auto text-center bg-brand-primary text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition"
                                >
                                    Open Developer Console →
                                </Link>
                            </div>
                        </div>

                        <div className="lg:col-span-7 min-w-0 w-full space-y-4">
                            <div className="rounded-2xl bg-black/50 border border-white/10 overflow-hidden max-w-full">
                                <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between gap-2 text-[11px] sm:text-xs text-gray-400 font-mono">
                                    <span className="truncate">1. Initialize Checkout Session</span>
                                    <span className="text-emerald-400 flex-shrink-0">JSON</span>
                                </div>
                                <pre className="p-3.5 sm:p-4 text-[11px] sm:text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed max-w-full">
                                    <code>{apiRequestSnippet}</code>
                                </pre>
                            </div>

                            <div className="rounded-2xl bg-black/50 border border-white/10 overflow-hidden max-w-full">
                                <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between gap-2 text-[11px] sm:text-xs text-gray-400 font-mono">
                                    <span className="truncate">2. Verify Webhook Signature</span>
                                    <span className="text-brand-secondary flex-shrink-0">PHP / Laravel</span>
                                </div>
                                <pre className="p-3.5 sm:p-4 text-[11px] sm:text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed max-w-full">
                                    <code>{webhookVerifySnippet}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-12 sm:py-24 bg-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <div className="text-center max-w-2xl mx-auto">
                            <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Transparent Pricing</p>
                            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
                                Simple pay-as-you-grow pricing
                            </h2>
                            <p className="mt-3 text-gray-500 text-sm sm:text-base">
                                No setup fees. No monthly platform charges. You only pay when you get paid.
                            </p>
                        </div>

                        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                            <div className="rounded-2xl sm:rounded-3xl border border-brand-border p-6 sm:p-8 bg-white shadow-xs">
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Standard Merchant</p>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-3xl sm:text-4xl font-extrabold text-brand-dark">2.5%</span>
                                    <span className="text-xs sm:text-sm text-gray-500">per successful transaction</span>
                                </div>
                                <p className="mt-3 text-sm text-gray-500">
                                    Ideal for growing Kenyan e-commerce stores, hardware suppliers, and online businesses.
                                </p>
                                <ul className="mt-6 space-y-2.5 text-sm text-gray-700 border-t border-brand-border pt-5">
                                    <li>• M-Pesa STK Push & Card Checkout</li>
                                    <li>• Branded Hosted Checkout Page</li>
                                    <li>• Real-time Signed Webhooks & Logs</li>
                                    <li>• Merchant Dashboard & API Keys</li>
                                </ul>
                                <Link
                                    href="/login"
                                    className="mt-7 sm:mt-8 block text-center w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition"
                                >
                                    Sign In to Dashboard
                                </Link>
                            </div>

                            <div className="rounded-2xl sm:rounded-3xl border-2 border-brand-dark p-6 sm:p-8 bg-brand-light">
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-dark">Enterprise & High Volume</p>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-3xl sm:text-4xl font-extrabold text-brand-dark">Custom</span>
                                    <span className="text-xs sm:text-sm text-gray-500">tailored rates</span>
                                </div>
                                <p className="mt-3 text-sm text-gray-500">
                                    Built for distributors, manufacturers, and multi-branch marketplaces with high monthly volume.
                                </p>
                                <ul className="mt-6 space-y-2.5 text-sm text-gray-700 border-t border-brand-border pt-5">
                                    <li>• Volume-discounted transaction fees</li>
                                    <li>• Dedicated Paybill / MPGS routing</li>
                                    <li>• Custom integration & technical support</li>
                                    <li>• Priority settlement & reporting</li>
                                </ul>
                                <a
                                    href="mailto:support@evopay.africa?subject=Evopay%20Enterprise%20Inquiry"
                                    className="mt-7 sm:mt-8 block text-center w-full bg-white border border-brand-border text-brand-dark py-3.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
                                >
                                    Contact Sales
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="py-12 sm:py-14 bg-brand-primary text-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div>
                            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                                Ready to power your checkout with Evopay?
                            </h2>
                            <p className="mt-1.5 text-sm sm:text-base text-white/85">
                                Experience the live customer checkout in our demo store or sign in to your merchant portal.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 flex-shrink-0">
                            <Link
                                href="/shop"
                                className="bg-white text-brand-dark px-6 py-3.5 rounded-xl font-bold text-sm text-center hover:bg-gray-100 transition"
                            >
                                Launch Demo Store
                            </Link>
                            <Link
                                href="/login"
                                className="bg-brand-dark text-white px-6 py-3.5 rounded-xl font-bold text-sm text-center hover:bg-black transition"
                            >
                                Sign In →
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Detailed Multi-Column Footer */}
            <footer className="bg-brand-dark text-gray-300 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
                    <div className="col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-2.5">
                            <img src="/images/logo.png" alt="Evopay" className="h-9 w-auto bg-white rounded-lg p-1" />
                        </div>
                        <p className="mt-4 text-xs text-gray-400 leading-relaxed max-w-xs">
                            Unified M-Pesa and Card payment gateway infrastructure built for Kenyan and East African commerce.
                        </p>
                        <p className="mt-4 text-xs text-gray-500">Nairobi, Kenya</p>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Products</h3>
                        <ul className="space-y-2.5 text-xs text-gray-400">
                            <li><a href="#features" className="hover:text-white transition">Hosted Checkout (/c/token)</a></li>
                            <li><a href="#features" className="hover:text-white transition">M-Pesa STK Push API</a></li>
                            <li><a href="#features" className="hover:text-white transition">Mastercard & Visa (MPGS)</a></li>
                            <li><a href="#features" className="hover:text-white transition">Signed Webhooks</a></li>
                            <li><Link href="/shop" className="hover:text-white transition">Live Demo Storefront</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Developers</h3>
                        <ul className="space-y-2.5 text-xs text-gray-400">
                            <li><a href="#developers" className="hover:text-white transition">Create Checkout Session</a></li>
                            <li><a href="#developers" className="hover:text-white transition">Verify Payment Status</a></li>
                            <li><a href="#developers" className="hover:text-white transition">Webhook Signature Guide</a></li>
                            <li><Link href="/merchant/developers" className="hover:text-white transition">API Keys Console</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform & Support</h3>
                        <ul className="space-y-2.5 text-xs text-gray-400">
                            <li><Link href="/login" className="hover:text-white transition">Merchant Portal Login</Link></li>
                            <li><Link href="/admin" className="hover:text-white transition">Platform Admin</Link></li>
                            <li><a href="mailto:support@evopay.africa" className="hover:text-white transition">support@evopay.africa</a></li>
                            <li className="text-gray-500">256-bit SSL · PCI-DSS Hosted</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 text-center sm:text-left">
                        <p>© 2026 Evopay Africa. All rights reserved.</p>
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                            <span>Safaricom Daraja</span>
                            <span>•</span>
                            <span>Mastercard MPGS</span>
                            <span>•</span>
                            <span>checkout.evopay.africa</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ title, body, icon }) {
    return (
        <div className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6 hover:border-brand-primary/50 hover:shadow-xs transition">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="font-bold text-base text-brand-dark">{title}</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{body}</p>
        </div>
    );
}

function StepCard({ step, title, body }) {
    return (
        <div className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6 shadow-xs">
            <span className="text-xs font-extrabold font-mono text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-md">
                STEP {step}
            </span>
            <h3 className="mt-4 font-bold text-lg text-brand-dark">{title}</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{body}</p>
        </div>
    );
}