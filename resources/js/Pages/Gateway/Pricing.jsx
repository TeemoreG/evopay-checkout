import { Head, Link } from '@inertiajs/react';
import GatewayLayout from '../../Layouts/GatewayLayout';

export default function GatewayPricing() {
    return (
        <GatewayLayout>
            <Head title="Transparent Pricing — Evopay" />

            {/* Sub-Header banner */}
            <section className="bg-brand-light border-b border-brand-border py-12 sm:py-16 text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-primary">Pricing Plans</p>
                    <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
                        Simple, Pay-As-You-Grow Pricing
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
                        No setup fees. No monthly platform subscriptions. You only pay a small commission when a customer successfully pays your business.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-3xl border border-brand-border p-7 sm:p-8 bg-white shadow-xs flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Standard Merchant</p>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-4xl font-extrabold text-brand-dark">2.5%</span>
                                    <span className="text-sm text-gray-500">per successful transaction</span>
                                </div>
                                <p className="mt-3 text-sm text-gray-500">
                                    Ideal for growing Kenyan e-commerce stores, hardware suppliers, and online businesses.
                                </p>
                                <ul className="mt-6 space-y-3 text-sm text-gray-700 border-t border-brand-border pt-5">
                                    <li className="flex items-center gap-2">
                                        <span className="text-emerald-600 font-bold">✓</span>
                                        <span>M-Pesa STK Push & Card Checkout</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-emerald-600 font-bold">✓</span>
                                        <span>Branded Hosted Checkout Page (/c/token)</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-emerald-600 font-bold">✓</span>
                                        <span>Real-time Signed Webhooks & Delivery Logs</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-emerald-600 font-bold">✓</span>
                                        <span>Merchant Dashboard & API Key Console</span>
                                    </li>
                                </ul>
                            </div>

                            <Link
                                href="/login"
                                className="mt-8 block text-center w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition"
                            >
                                Sign In to Dashboard
                            </Link>
                        </div>

                        <div className="rounded-3xl border-2 border-brand-dark p-7 sm:p-8 bg-brand-light flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-dark">Enterprise & High Volume</p>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-4xl font-extrabold text-brand-dark">Custom</span>
                                    <span className="text-sm text-gray-500">tailored rates</span>
                                </div>
                                <p className="mt-3 text-sm text-gray-500">
                                    Built for distributors, manufacturers, and multi-branch marketplaces with high monthly volume.
                                </p>
                                <ul className="mt-6 space-y-3 text-sm text-gray-700 border-t border-brand-border pt-5">
                                    <li className="flex items-center gap-2">
                                        <span className="text-brand-dark font-bold">✓</span>
                                        <span>Volume-discounted transaction fees</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-brand-dark font-bold">✓</span>
                                        <span>Dedicated Paybill / MPGS routing</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-brand-dark font-bold">✓</span>
                                        <span>Custom integration & technical support</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-brand-dark font-bold">✓</span>
                                        <span>Priority settlement & custom reporting</span>
                                    </li>
                                </ul>
                            </div>

                            <a
                                href="mailto:support@evopay.africa?subject=Evopay%20Enterprise%20Inquiry"
                                className="mt-8 block text-center w-full bg-white border border-brand-border text-brand-dark py-3.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
                            >
                                Contact Sales
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </GatewayLayout>
    );
}