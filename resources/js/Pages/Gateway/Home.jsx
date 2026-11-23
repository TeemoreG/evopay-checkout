import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GatewayLayout from '../../Layouts/GatewayLayout';

export default function GatewayHome({ flash = {} }) {
    const [accessModalOpen, setAccessModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        business_name: '',
        contact_name: '',
        email: '',
        phone: '',
        expected_volume: '',
    });

    const submitRequest = (e) => {
        e.preventDefault();
        post('/request-access', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <GatewayLayout>
            <Head title="Evopay Checkout — M-Pesa & Card Payment Gateway for Kenya" />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-white via-brand-light to-orange-50/40 border-b border-brand-border relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left Copy Column */}
                    <div className="lg:col-span-7 min-w-0 text-center lg:text-left z-10">
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tight leading-[1.12]">
                            Accept M-Pesa & Card Payments Through One Unified API
                        </h1>

                        <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            Launch a merchant-branded hosted checkout in minutes. Evopay handles Safaricom M-Pesa STK Push, Visa & Mastercard 3D Secure, and signed server webhooks so your store gets paid reliably.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5">
                            <Link
                                href="/developers"
                                className="bg-brand-dark text-white px-7 py-4 rounded-xl font-bold text-sm text-center hover:bg-black transition shadow-sm"
                            >
                                Read API Documentation →
                            </Link>
                            <button
                                type="button"
                                onClick={() => setAccessModalOpen(true)}
                                className="bg-brand-primary text-white px-7 py-4 rounded-xl font-bold text-sm text-center hover:bg-brand-secondary transition shadow-sm cursor-pointer"
                            >
                                Request API Access
                            </button>
                            <Link
                                href="/shop"
                                className="bg-white border border-brand-border text-brand-dark px-7 py-4 rounded-xl font-bold text-sm text-center hover:bg-gray-50 transition shadow-xs"
                            >
                                Try Live Demo Store
                            </Link>
                        </div>

                        <div className="mt-10 pt-6 border-t border-brand-border/80 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-gray-500 font-semibold">
                            <span className="uppercase tracking-wider text-[11px] text-gray-400 w-full sm:w-auto text-center lg:text-left">Payment Rails:</span>
                            <span>Safaricom M-Pesa</span>
                            <span className="text-gray-300">•</span>
                            <span>Visa & Mastercard (MPGS)</span>
                            <span className="text-gray-300 hidden sm:inline">•</span>
                            <span className="text-gray-400">Airtel Money (Soon)</span>
                        </div>
                    </div>

                    {/* Right Hero Image Column (hero.png) - Perfectly proportioned for desktop & mobile */}
                    <div className="lg:col-span-5 min-w-0 w-full flex justify-center relative">
                        <div className="absolute inset-0 bg-radial from-brand-primary/10 to-transparent rounded-full filter blur-3xl pointer-events-none"></div>
                        <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none flex items-center justify-center p-2">
                            <img
                                src="/images/hero.png"
                                alt="Evopay Payment Infrastructure"
                                className="w-full h-auto max-h-[380px] sm:max-h-[460px] lg:max-h-[540px] object-contain relative z-10 drop-shadow-2xl"
                            />
                        </div>
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
                                Request API access today, receive your live credentials in your inbox, and test your first M-Pesa or card transaction immediately.
                            </p>
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setAccessModalOpen(true)}
                                    className="block text-center w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-sm hover:bg-brand-secondary transition shadow-sm cursor-pointer"
                                >
                                    Request API Access →
                                </button>
                                <Link
                                    href="/login"
                                    className="block text-center w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition shadow-sm"
                                >
                                    Sign In to Merchant Portal
                                </Link>
                            </div>
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

            {/* REQUEST ACCESS MODAL */}
            {accessModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full mx-auto shadow-2xl relative">
                        <div className="flex justify-between items-center pb-4 border-b border-brand-border mb-5">
                            <div>
                                <h3 className="text-lg font-extrabold text-brand-dark">Request API Access</h3>
                                <p className="text-xs text-gray-500 mt-0.5">We'll email your credentials to devops2@evopay.africa</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAccessModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {recentlySuccessful ? (
                            <div className="py-8 text-center space-y-3">
                                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                                    ✓
                                </div>
                                <h4 className="font-bold text-lg text-brand-dark">Request Received!</h4>
                                <p className="text-xs text-gray-600 max-w-xs mx-auto">
                                    Thank you! Your request has been sent to our team at <strong>devops2@evopay.africa</strong>. We will provision your keys shortly.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAccessModalOpen(false);
                                    }}
                                    className="mt-4 bg-brand-dark text-white px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
                                >
                                    Close Window
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={submitRequest} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Business Name *</label>
                                    <input
                                        type="text"
                                        value={data.business_name}
                                        onChange={(e) => setData('business_name', e.target.value)}
                                        placeholder="e.g. Nairobi Hardware Ltd"
                                        className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent"
                                        required
                                    />
                                    {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-brand-dark mb-1">Contact Person *</label>
                                        <input
                                            type="text"
                                            value={data.contact_name}
                                            onChange={(e) => setData('contact_name', e.target.value)}
                                            placeholder="e.g. John Kamau"
                                            className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent"
                                            required
                                        />
                                        {errors.contact_name && <p className="text-red-500 text-xs mt-1">{errors.contact_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-brand-dark mb-1">Business Email *</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="you@business.co.ke"
                                            className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent"
                                            required
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-brand-dark mb-1">Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="e.g. 0712345678"
                                            className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent"
                                            required
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Monthly Volume</label>
                                        <select
                                            value={data.expected_volume}
                                            onChange={(e) => setData('expected_volume', e.target.value)}
                                            className="w-full bg-brand-input rounded-xl px-3 py-3 text-sm border border-transparent"
                                        >
                                            <option value="">Select volume...</option>
                                            <option value="Under KSh 100k">Under KSh 100k / mo</option>
                                            <option value="KSh 100k - 1M">KSh 100k - 1M / mo</option>
                                            <option value="Over KSh 1M">Over KSh 1M / mo</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full mt-2 bg-brand-dark text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer disabled:opacity-50"
                                >
                                    {processing ? 'Submitting Request...' : 'Submit Access Request →'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </GatewayLayout>
    );
}