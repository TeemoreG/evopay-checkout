import { Head, Link } from '@inertiajs/react';
import GatewayLayout from '../../Layouts/GatewayLayout';

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

export default function GatewayDevelopers() {
    return (
        <GatewayLayout>
            <Head title="API Documentation & Developers — Evopay" />

            {/* Sub-Header banner */}
            <section className="bg-brand-light border-b border-brand-border py-12 sm:py-16 text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-primary">Developer Guide</p>
                    <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
                        Integrate Evopay Checkout in Minutes
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                        Standard REST APIs, cryptographically signed webhooks, and hosted session management designed for seamless backend integration.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 sm:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Capabilities</p>
                        <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
                            Everything your business needs to collect payments online
                        </h2>
                    </div>

                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <section className="py-16 sm:py-20 bg-brand-light border-y border-brand-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto">
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Integration Flow</p>
                        <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
                            Go live in 3 simple steps
                        </h2>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Developer API Code Section */}
            <section className="py-16 sm:py-24 bg-brand-dark text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-5 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary">API & Webhooks</p>
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

                        <div className="mt-8">
                            <Link
                                href="/login"
                                className="inline-block bg-brand-primary text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition"
                            >
                                Open Developer Console →
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-7 min-w-0 w-full space-y-4">
                        <div className="rounded-2xl bg-black/50 border border-white/10 overflow-hidden max-w-full">
                            <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between gap-2 text-xs text-gray-400 font-mono">
                                <span className="truncate">1. Initialize Checkout Session</span>
                                <span className="text-emerald-400 flex-shrink-0">JSON</span>
                            </div>
                            <pre className="p-4 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed max-w-full">
                                <code>{apiRequestSnippet}</code>
                            </pre>
                        </div>

                        <div className="rounded-2xl bg-black/50 border border-white/10 overflow-hidden max-w-full">
                            <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between gap-2 text-xs text-gray-400 font-mono">
                                <span className="truncate">2. Verify Webhook Signature</span>
                                <span className="text-brand-secondary flex-shrink-0">PHP / Laravel</span>
                            </div>
                            <pre className="p-4 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed max-w-full">
                                <code>{webhookVerifySnippet}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </section>
        </GatewayLayout>
    );
}

function FeatureCard({ title, body, icon }) {
    return (
        <div className="rounded-2xl border border-brand-border bg-white p-6 hover:border-brand-primary/50 hover:shadow-xs transition">
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
        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-xs">
            <span className="text-xs font-extrabold font-mono text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-md">
                STEP {step}
            </span>
            <h3 className="mt-4 font-bold text-lg text-brand-dark">{title}</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{body}</p>
        </div>
    );
}