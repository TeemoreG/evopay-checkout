import { Head, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

export default function GatewayHome() {
    return (
        <MainLayout minimal>
            <Head title="Evopay Checkout — Payment Gateway" />

            <div className="min-h-[75vh] flex flex-col justify-center py-8">
                <div className="max-w-3xl mx-auto text-center">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-3.5 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Evopay Payment Gateway
                    </span>

                    <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight">
                        Accept M-Pesa & Card Payments via One API
                    </h1>

                    <p className="mt-4 text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
                        Create a hosted checkout session in one API call, redirect your customer to Evopay, and receive instant signed webhooks upon payment.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/login"
                            className="bg-brand-dark text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-black transition"
                        >
                            Portal Sign In →
                        </Link>
                        <Link
                            href="/shop"
                            className="bg-white border border-brand-border text-brand-dark px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition"
                        >
                            Try Demo Store
                        </Link>
                    </div>
                </div>

                <div className="max-w-3xl w-full mx-auto mt-14 grid sm:grid-cols-3 gap-4 text-left">
                    <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                        <p className="text-xs font-bold uppercase text-brand-primary">1. Create Session</p>
                        <p className="text-sm font-bold text-brand-dark mt-1">POST /api/v1/checkout/sessions</p>
                        <p className="text-xs text-gray-500 mt-1">Authenticate with `Bearer sk_live_...` and get a hosted `/c/cs_...` URL.</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                        <p className="text-xs font-bold uppercase text-brand-primary">2. Customer Pays</p>
                        <p className="text-sm font-bold text-brand-dark mt-1">M-Pesa STK & Mastercard</p>
                        <p className="text-xs text-gray-500 mt-1">Branded with your business name & logo on desktop and mobile.</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                        <p className="text-xs font-bold uppercase text-brand-primary">3. Instant Webhook</p>
                        <p className="text-sm font-bold text-brand-dark mt-1">HMAC-SHA256 Signed</p>
                        <p className="text-xs text-gray-500 mt-1">Verify `X-Evopay-Signature` and fulfill orders automatically.</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}