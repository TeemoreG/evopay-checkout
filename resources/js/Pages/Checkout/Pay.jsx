import { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../../Layouts/MainLayout';

const formatMoney = (amount, currency = 'KES') =>
    `${currency} ` + Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const paymentMethods = [
    {
        key: 'mpesa',
        label: 'M-Pesa',
        subtitle: 'STK Push',
        badge: 'Instant',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000028/1_q6VZ_q0WIism6TgZ9kBIWQ_km524l.png',
        disabled: false,
    },
    {
        key: 'card',
        label: 'Card',
        subtitle: 'Visa / MC',
        badge: '3D Secure',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000459/visa_mx9x3z.jpg',
        disabled: false,
    },
    {
        key: 'airtel',
        label: 'Airtel',
        subtitle: 'Money',
        badge: 'Soon',
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
        <MainLayout minimal>
            <div className="w-full max-w-md mx-auto pt-0 sm:pt-4 pb-8 px-2 sm:px-4">
                {/* Checkout Container: Edge-to-edge feel on mobile, sleek floating card on desktop */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-5 sm:p-7 shadow-xs">
                    
                    {/* Merchant Identity & Trust Bar */}
                    <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                        <div className="flex items-center gap-2.5 min-w-0">
                            {merchant.logo_url ? (
                                <img src={merchant.logo_url} alt={merchant.name} className="h-7 max-w-[110px] object-contain flex-shrink-0" />
                            ) : (
                                <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                                    {merchant.name.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span className="text-xs sm:text-sm font-bold text-brand-dark truncate">
                                {merchant.name}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 bg-brand-light px-2.5 py-1 rounded-full border border-brand-border flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Secured by Evopay</span>
                        </div>
                    </div>

                    {/* Amount & Reference Section (Stripe/Paystack Style) */}
                    <div className="py-5 text-center border-b border-brand-border/60">
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
                            Amount to Pay
                        </p>
                        <p className="text-3xl sm:text-4xl font-extrabold text-brand-dark mt-1 tracking-tight">
                            {formatMoney(session.amount, session.currency)}
                        </p>
                        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                            <span>Ref: <strong className="text-brand-dark">{session.merchant_reference}</strong></span>
                            {session.customer?.name && (
                                <>
                                    <span>•</span>
                                    <span className="truncate max-w-[140px]">{session.customer.name}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start justify-between gap-2 shadow-xs">
                            <div className="flex items-start gap-1.5">
                                <span className="text-red-500 font-bold">✕</span>
                                <div>
                                    <p className="font-bold text-red-800">Payment failed or cancelled</p>
                                    <p className="mt-0.5">{error}</p>
                                </div>
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

                    {/* Payment Rails Header */}
                    <div className="pt-4 pb-2">
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
                            Select Payment Method
                        </p>
                    </div>

                    {/* 3-in-a-Row Payment Cards (Fitted for mobile screens) */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                        {paymentMethods.map((pm) => {
                            const isSelected = selected === pm.key;
                            return (
                                <button
                                    key={pm.key}
                                    type="button"
                                    disabled={pm.disabled || isLoading}
                                    onClick={() => setSelected(pm.key)}
                                    className={`relative flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all text-center h-24 sm:h-28 cursor-pointer ${
                                        pm.disabled
                                            ? 'border-brand-border bg-gray-50 opacity-45 cursor-not-allowed'
                                            : isSelected
                                                ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 shadow-xs'
                                                : 'border-brand-border bg-white hover:border-brand-primary/40'
                                    }`}
                                >
                                    {/* Selected Checkmark */}
                                    {isSelected && !pm.disabled && (
                                        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-brand-primary text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                                            ✓
                                        </span>
                                    )}

                                    {/* Soon Badge */}
                                    {pm.disabled && (
                                        <span className="absolute top-1 right-1 text-[7px] bg-gray-200 text-gray-600 px-1 py-0.2 rounded font-bold uppercase">
                                            Soon
                                        </span>
                                    )}

                                    {/* Logo */}
                                    <div className="h-7 sm:h-8 w-full flex items-center justify-center mt-1">
                                        <img src={pm.image} alt="" className="max-h-6 sm:max-h-7 max-w-[80%] object-contain" />
                                    </div>

                                    {/* Text */}
                                    <div className="w-full">
                                        <p className="font-bold text-[11px] sm:text-xs text-brand-dark truncate leading-tight">
                                            {pm.label}
                                        </p>
                                        <p className="text-[9px] sm:text-[10px] text-gray-400 truncate mt-0.5">
                                            {pm.subtitle}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Primary Pay Action Button */}
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isLoading}
                        className="w-full bg-brand-dark text-white py-3.5 sm:py-4 rounded-xl font-bold text-sm hover:bg-black transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
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

                    {/* Footer Cancel & Security Badges */}
                    <div className="mt-5 pt-4 border-t border-brand-border flex items-center justify-between text-xs text-gray-400">
                        {session.cancel_url ? (
                            <a href={session.cancel_url} className="text-gray-500 hover:text-brand-primary font-medium text-[11px]">
                                ← Cancel and return
                            </a>
                        ) : (
                            <span className="text-[10px] text-gray-400">Secure 256-bit SSL</span>
                        )}

                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span>Safaricom</span>
                            <span>•</span>
                            <span>Mastercard</span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}