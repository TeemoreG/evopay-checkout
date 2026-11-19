import { Head, Link } from '@inertiajs/react';
import GatewayLayout from '../../Layouts/GatewayLayout';

export default function GatewayHome() {
    return (
        <GatewayLayout>
            <Head title="Evopay Checkout — M-Pesa & Card Payment Gateway for Kenya" />

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
                            <Link
                                href="/developers"
                                className="bg-brand-dark text-white px-6 py-3.5 sm:py-4 rounded-xl font-bold text-sm text-center hover:bg-black transition"
                            >
                                Read API Documentation →
                            </Link>
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
        </GatewayLayout>
    );
}