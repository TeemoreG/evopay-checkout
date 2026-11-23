import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

const formatMoney = (amount, currency = 'KES') =>
    `${currency} ` + Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const paymentMethods = [
    {
        key: 'mpesa',
        label: 'M-Pesa',
        subtitle: 'STK Push',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000028/1_q6VZ_q0WIism6TgZ9kBIWQ_km524l.png',
        disabled: false,
    },
    {
        key: 'card',
        label: 'Card',
        subtitle: 'Visa / MC',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000459/visa_mx9x3z.jpg',
        disabled: false,
    },
    {
        key: 'airtel',
        label: 'Airtel',
        subtitle: 'Coming soon',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000336/Airtel-Money-Logo_zhsldw.png',
        disabled: true,
    },
];

export default function GatewayPay({ session, merchant }) {
    const [selected, setSelected] = useState('mpesa');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(session.failure_reason || null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlError = params.get('error');
        if (urlError) {
            setError(urlError);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const handleContinue = async () => {
        if (isLoading) return;
        setError(null);

        if (selected === 'mpesa') {
            window.location.href = `/c/${session.token}/mpesa`;
            return;
        }

        if (selected === 'card') {
            setIsLoading(true);
            try {
                const res = await axios.post(`/c/${session.token}/mpgs/init`);

                if (res.data.status === 'redirect' && res.data.url) {
                    window.location.href = res.data.url;
                    return;
                }

                setError('Could not initialize card checkout. Please try again.');
                setIsLoading(false);
            } catch (err) {
                setError(
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    'Could not initialize card checkout. Please try again.'
                );
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-brand-dark font-sans flex flex-col justify-between sm:justify-center sm:py-8 sm:px-4">
            <Head title={`Pay ${merchant.name} — Secure Checkout`} />

            {/* Main App Container: Full-bleed on mobile reaching the top edge, sleek card on desktop */}
            <div className="w-full sm:max-w-md mx-auto bg-white min-h-screen sm:min-h-0 sm:rounded-3xl sm:border sm:border-brand-border sm:shadow-xl flex flex-col justify-between p-5 sm:p-7">
                <div>
                    {/* Top Native App Bar: Back/Cancel on left, Merchant Brand center, Lock on right */}
                    <div className="flex items-center justify-between pt-1 pb-4 border-b border-gray-100">
                        {session.cancel_url ? (
                            <a
                                href={session.cancel_url}
                                className="text-gray-400 hover:text-brand-dark text-xs font-semibold transition flex items-center gap-1"
                            >
                                <span>←</span>
                                <span>Cancel</span>
                            </a>
                        ) : (
                            <div className="w-10"></div>
                        )}

                        {/* Merchant Identity (NO Evopay Logo) */}
                        <div className="flex items-center gap-2">
                            {merchant.logo_url ? (
                                <img
                                    src={merchant.logo_url}
                                    alt={merchant.name}
                                    className="h-6 max-w-[120px] object-contain"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center">
                                    {merchant.name.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span className="text-xs sm:text-sm font-bold text-brand-dark truncate max-w-[150px]">
                                {merchant.name}
                            </span>
                        </div>

                        {/* Security Indicator */}
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
                            </svg>
                            <span>Secured</span>
                        </div>
                    </div>

                    {/* Amount Due Display */}
                    <div className="py-6 text-center border-b border-gray-100">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                            Amount to Pay
                        </p>
                        <p className="text-3xl sm:text-4xl font-extrabold text-brand-dark mt-1 tracking-tight">
                            {formatMoney(session.amount, session.currency)}
                        </p>

                        <div className="mt-2.5 flex items-center justify-center gap-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium text-gray-600">
                                Ref: {session.merchant_reference}
                            </span>
                            {session.customer?.name && (
                                <span className="truncate max-w-[150px] font-medium">
                                    • {session.customer.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start justify-between gap-2">
                            <div className="flex items-start gap-1.5">
                                <span className="text-red-500 font-bold">✕</span>
                                <p className="mt-0.5">{error}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setError(null)}
                                className="text-[11px] font-semibold text-red-600 hover:text-red-800 cursor-pointer"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Payment Method Selector (3-in-a-Row across mobile & desktop) */}
                    <div className="pt-6">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 text-left">
                            Select Payment Method
                        </p>

                        <div className="grid grid-cols-3 gap-2.5">
                            {paymentMethods.map((pm) => {
                                const isSelected = selected === pm.key;
                                return (
                                    <button
                                        key={pm.key}
                                        type="button"
                                        disabled={pm.disabled || isLoading}
                                        onClick={() => setSelected(pm.key)}
                                        className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center h-28 cursor-pointer ${
                                            pm.disabled
                                                ? 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
                                                : isSelected
                                                    ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/25 shadow-xs'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        {/* Selected Badge */}
                                        {isSelected && !pm.disabled && (
                                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-primary text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                                                ✓
                                            </span>
                                        )}

                                        {/* Soon Badge */}
                                        {pm.disabled && (
                                            <span className="absolute top-1.5 right-1.5 text-[8px] bg-gray-200 text-gray-600 px-1 py-0.2 rounded font-bold uppercase">
                                                Soon
                                            </span>
                                        )}

                                        {/* Brand Logo */}
                                        <div className="h-8 w-full flex items-center justify-center mt-1">
                                            <img
                                                src={pm.image}
                                                alt={pm.label}
                                                className="max-h-7 max-w-[85%] object-contain"
                                            />
                                        </div>

                                        {/* Method Titles */}
                                        <div className="w-full">
                                            <p className="font-bold text-xs text-brand-dark truncate leading-tight">
                                                {pm.label}
                                            </p>
                                            <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                                {pm.subtitle}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Action Section */}
                <div className="pt-8 sm:pt-6">
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isLoading}
                        className="w-full bg-brand-dark text-white py-4 rounded-2xl font-bold text-sm sm:text-base hover:bg-black transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : selected === 'card' ? (
                            <>
                                <span>Continue to Checkout</span>
                                <span>→</span>
                            </>
                        ) : (
                            `Pay · ${formatMoney(session.amount, session.currency)}`
                        )}
                    </button>

                    {/* Subtle Trust Footer */}
                    <div className="mt-4 text-center">
                        <p className="text-[10px] text-gray-400 font-medium">
                            Secured by Evopay • PCI-DSS & 256-bit SSL Compliant
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}