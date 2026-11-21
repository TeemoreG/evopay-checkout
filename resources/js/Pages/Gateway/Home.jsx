import { Head, Link } from '@inertiajs/react';
import GatewayLayout from '../../Layouts/GatewayLayout';

export default function GatewayHome() {
    return (
        <GatewayLayout>
            <Head title="Evopay Checkout — M-Pesa & Card Payment Gateway for Kenya" />

            {/* Hero Section */}
            <section className="bg-brand-light border-b border-brand-border overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-6 min-w-0 text-center lg:text-left">
                        <p className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-3.5 py-1.5 rounded-full mb-3">
                            Evopay Payment Infrastructure · Kenya
                        </p>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tight leading-[1.12]">
                            Accept M-Pesa & Card Payments Through One Unified API
                        </h1>

                        <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Launch a merchant-branded hosted checkout in minutes. Evopay handles Safaricom M-Pesa STK Push, Visa & Mastercard 3D Secure, and signed server webhooks so your store gets paid reliably.
                        </p>

                        <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
                            <Link
                                href="/developers"
                                className="bg-brand-dark text-white px-7 py-4 rounded-xl font-bold text-sm text-center hover:bg-black transition shadow-sm"
                            >
                                Read API Documentation →
                            </Link>
                            <Link
                                href="/shop"
                                className="bg-white border border-brand-border text-brand-dark px-7 py-4 rounded-xl font-bold text-sm text-center hover:bg-gray-50 transition"
                            >
                                Try Live Demo Store
                            </Link>
                        </div>

                        <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-brand-border flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs text-gray-500 font-semibold">
                            <span className="uppercase tracking-wider text-[11px] text-gray-400 w-full sm:w-auto text-center lg:text-left">Payment Rails:</span>
                            <span>Safaricom M-Pesa</span>
                            <span className="text-gray-300">•</span>
                            <span>Visa & Mastercard (MPGS)</span>
                            <span className="text-gray-300 hidden sm:inline">•</span>
                            <span className="text-gray-400">Airtel Money (Soon)</span>
                        </div>
                    </div>

                    {/* Right Hero Image (hero.png) */}
                    <div className="lg:col-span-6 min-w-0 w-full flex justify-center">
                        <div className="relative w-full max-w-lg lg:max-w-none flex items-center justify-center p-2 sm:p-4">
                            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-brand-primary/15 animate-pulse blur-3xl pointer-events-none"></div>
                            <img
                                src="/images/hero.png"
                                alt="Evopay Payment Infrastructure"
                                className="w-full h-auto max-h-[420px] lg:max-h-[500px] object-contain relative z-10 drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Metrics Strip */}
            <section className="bg-brand-dark text-white py-8 sm:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                        <p className="text-xl sm:text-3xl font-extrabold text-brand-secondary">Direct STK</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Safaricom Daraja Integration</p>
                    </div>
                    <div>
                        <p className="text-xl sm:text-3xl font-extrabold text-brand-secondary">3DS 2.0</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Mastercard & Visa Hosted UI</p>
                    </div>
                    <div>
                        <p className="text-xl sm:text-3xl font-extrabold text-brand-secondary">HMAC-SHA256</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Signed Webhook Events</p>
                    </div>
                    <div>
                        <p className="text-xl sm:text-3xl font-extrabold text-brand-secondary">REST API</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">One-Call Session Setup</p>
                    </div>
                </div>
            </section>

            {/* Extended Value Proposition / About Section */}
            <section className="py-16 sm:py-24 bg-white border-b border-brand-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-6">
                            <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Why Evopay?</p>
                            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight leading-snug">
                                Designed specifically for African merchants scaling online
                            </h2>
                            <p className="mt-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                                Managing multiple payment aggregators, dropped Safaricom callbacks, and card security compliance shouldn't slow down your engineering team. Evopay abstracts the complexity into a single modern API.
                            </p>
                            <div className="mt-6 space-y-4 text-sm text-gray-700">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                                    <p><strong>Zero PCI-DSS Scope:</strong> Card details are captured entirely on Mastercard’s secure hosted gateway, keeping your servers out of scope.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                                    <p><strong>Built-in STK Query Fallback:</strong> If Safaricom's webhook is delayed, our automated query fallback verifies transaction status so customers never get stuck.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                                    <p><strong>Reliable Webhooks with Retries:</strong> Cryptographically signed events with automatic exponential backoff ensure your backend never misses an order confirmation.</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-6 bg-brand-light rounded-3xl border border-brand-border p-8 sm:p-10 shadow-xs">
                            <h3 className="text-xl font-bold text-brand-dark mb-3">Ready to start accepting payments?</h3>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                Create your merchant account in seconds, grab your live API keys, and test your first M-Pesa STK push or card transaction immediately.
                            </p>
                            <div className="space-y-3">
                                <Link
                                    href="/login"
                                    className="block text-center w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition shadow-sm"
                                >
                                    Sign In to Merchant Portal →
                                </Link>
                                <Link
                                    href="/developers"
                                    className="block text-center w-full bg-white border border-brand-border text-brand-dark py-4 rounded-xl font-bold text-sm hover:bg-gray-50 transition"
                                >
                                    Explore API Reference
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </GatewayLayout>
    );
}