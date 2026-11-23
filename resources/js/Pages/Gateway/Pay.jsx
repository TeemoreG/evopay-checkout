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
        subtitle: 'Visa / Mastercard',
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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between sm:justify-center pt-3 sm:pt-8 pb-8 px-3 sm:px-4">
            <Head title={`Pay ${merchant.name} — Checkout`} />

            {/* Main Checkout Container — Paystack/Stripe Architecture */}
            <div className="w-full max-w-[460px] mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col justify-between p-5 sm:p-8">
                <div>
                    {/* Merchant Header — Zero Evopay Logo, Only Merchant Branding */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                            {merchant.logo_url ? (
                                <img
                                    src={merchant.logo_url}
                                    alt={merchant.name}
                                    className="h-8 max-w-[120px] object-contain flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 text-[#E05A26] font-bold text-xs flex items-center justify-center flex-shrink-0">
                                    {merchant.name.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-slate-800 truncate leading-tight">
                                    {merchant.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                    Ref: {session.merchant_reference}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full flex-shrink-0">
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
                            </svg>
                            <span>Encrypted</span>
                        </div>
                    </div>

                    {/* Amount Hero Section */}
                    <div className="py-5 text-center border-b border-slate-100">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Amount to Pay
                        </p>
                        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 tracking-tight">
                            {formatMoney(session.amount, session.currency)}
                        </p>
                        {session.customer?.name && (
                            <p className="text-xs text-slate-500 mt-1.5 font-medium truncate">
                                Customer: <span className="text-slate-800">{session.customer.name}</span>
                            </p>
                        )}
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="my-4 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 flex items-start justify-between gap-2 shadow-xs">
                            <div className="flex items-start gap-1.5">
                                <span className="text-red-500 font-bold">✕</span>
                                <p className="mt-0.5 leading-snug">{error}</p>
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

                    {/* Payment Method Selector (Paystack/Stripe 3-Column Row) */}
                    <div className="pt-4 pb-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-left">
                            Select Payment Method
                        </p>

                        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                            {paymentMethods.map((pm) => {
                                const isSelected = selected === pm.key;
                                return (
                                    <button
                                        key={pm.key}
                                        type="button"
                                        disabled={pm.disabled || isLoading}
                                        onClick={() => setSelected(pm.key)}
                                        className={`relative flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all text-center h-[98px] sm:h-[105px] cursor-pointer ${
                                            pm.disabled
                                                ? 'border-slate-200 bg-slate-50/60 opacity-40 cursor-not-allowed'
                                                : isSelected
                                                    ? 'border-[#E05A26] bg-[#E05A26]/5 ring-1 ring-[#E05A26] shadow-xs'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        {/* Selection Tick */}
                                        {isSelected && !pm.disabled && (
                                            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#E05A26] text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                                                ✓
                                            </span>
                                        )}

                                        {/* Soon Badge */}
                                        {pm.disabled && (
                                            <span className="absolute top-1.5 right-1.5 text-[7px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-bold uppercase">
                                                Soon
                                            </span>
                                        )}

                                        {/* Payment Logo */}
                                        <div className="h-7 w-full flex items-center justify-center mt-1">
                                            <img
                                                src={pm.image}
                                                alt={pm.label}
                                                className="max-h-6 max-w-[85%] object-contain"
                                            />
                                        </div>

                                        {/* Labels */}
                                        <div className="w-full">
                                            <p className="font-bold text-[11px] sm:text-xs text-slate-800 truncate leading-tight">
                                                {pm.label}
                                            </p>
                                            <p className="text-[9px] sm:text-[10px] text-slate-400 truncate mt-0.5">
                                                {pm.subtitle}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Primary CTA & Cancel Button */}
                <div className="pt-6 sm:pt-7">
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base hover:bg-black transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : selected === 'card' ? (
                            <>
                                <span>Continue to Checkout</span>
                                <span>→</span>
                            </>
                        ) : (
                            `Pay · ${formatMoney(session.amount, session.currency)}`
                        )}
                    </button>

                    {/* Cancel Navigation */}
                    <div className="mt-4 text-center">
                        {session.cancel_url ? (
                            <a
                                href={session.cancel_url}
                                className="text-xs text-slate-400 hover:text-slate-600 font-medium transition"
                            >
                                Cancel and return to store
                            </a>
                        ) : (
                            <p className="text-[11px] text-slate-400 font-medium">
                                256-bit SSL Encrypted Payment
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}