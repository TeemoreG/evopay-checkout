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
        <div className="min-h-screen bg-slate-50 sm:bg-slate-100 text-[#1A1A1A] font-sans flex flex-col justify-between sm:justify-center sm:py-10 sm:px-4">
            <Head title={`Pay ${merchant.name} — Evopay Checkout`} />

            {/* Container: Fills 100% of mobile screen vertically (zero dead space below), centers as a sleek floating card on desktop */}
            <div className="w-full sm:max-w-md mx-auto bg-white min-h-screen sm:min-h-0 sm:rounded-3xl border-0 sm:border sm:border-gray-200 sm:shadow-xl flex flex-col justify-between p-6 sm:p-8">
                
                {/* Top Section */}
                <div>
                    {/* Header Bar */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        {/* Merchant Identity */}
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
                                <p className="text-sm font-bold text-[#1A1A1A] truncate leading-tight">
                                    {merchant.name}
                                </p>
                                <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                                    Ref: {session.merchant_reference}
                                </p>
                            </div>
                        </div>

                        {/* Secured by Evopay Badge */}
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full flex-shrink-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Secured by Evopay</span>
                        </div>
                    </div>

                    {/* Amount Due Section */}
                    <div className="py-6 sm:py-7 text-center border-b border-gray-100">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            AMOUNT TO PAY
                        </p>
                        <p className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mt-1 tracking-tight">
                            {formatMoney(session.amount, session.currency)}
                        </p>
                        {session.customer?.name && (
                            <p className="text-xs text-gray-500 mt-2 font-medium truncate">
                                Customer: <span className="text-[#1A1A1A] font-semibold">{session.customer.name}</span>
                            </p>
                        )}
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start justify-between gap-2 shadow-xs">
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

                    {/* Payment Rails Selector */}
                    <div className="pt-6 pb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 text-left">
                            SELECT PAYMENT METHOD
                        </p>

                        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
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
                                                ? 'border-gray-200 bg-gray-50/60 opacity-40 cursor-not-allowed'
                                                : isSelected
                                                    ? 'border-[#E05A26] bg-[#E05A26]/5 ring-1 ring-[#E05A26] shadow-xs'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        {/* Evopay Brand Orange Selected Tick */}
                                        {isSelected && !pm.disabled && (
                                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#E05A26] text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                                                ✓
                                            </span>
                                        )}

                                        {/* Soon Badge */}
                                        {pm.disabled && (
                                            <span className="absolute top-1.5 right-1.5 text-[8px] bg-gray-200 text-gray-600 px-1.5 py-0.2 rounded font-bold uppercase">
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
                                            <p className="font-bold text-xs text-[#1A1A1A] truncate leading-tight">
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

                {/* Bottom Action Section (Anchored cleanly at the bottom on mobile) */}
                <div className="pt-8 sm:pt-6">
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isLoading}
                        className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold text-sm sm:text-base hover:bg-black transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
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

                    {/* Cancel & Trust Link */}
                    <div className="mt-4 text-center">
                        {session.cancel_url ? (
                            <a
                                href={session.cancel_url}
                                className="text-xs text-gray-400 hover:text-gray-600 font-medium transition"
                            >
                                Cancel and return to store
                            </a>
                        ) : (
                            <p className="text-[11px] text-gray-400 font-medium">
                                256-bit SSL Encrypted • PCI-DSS Compliant
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}