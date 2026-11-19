import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../../Layouts/MainLayout';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const paymentMethods = [
    {
        key: 'mpesa',
        label: 'M-Pesa',
        subtitle: 'Pay via Safaricom STK Push',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000028/1_q6VZ_q0WIism6TgZ9kBIWQ_km524l.png',
        disabled: false,
    },
    {
        key: 'card',
        label: 'Card',
        subtitle: 'Visa or Mastercard',
        badgeColor: 'bg-brand-light text-brand-dark border-brand-border',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000459/visa_mx9x3z.jpg',
        disabled: false,
    },
    {
        key: 'airtel',
        label: 'Airtel Money',
        subtitle: 'Coming soon',
        badge: 'Soon',
        badgeColor: 'bg-gray-100 text-gray-500 border-gray-200',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000336/Airtel-Money-Logo_zhsldw.png',
        disabled: true,
    },
];

export default function CheckoutPay({ order }) {
    const [selected, setSelected] = useState('mpesa');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(order.failure_reason || null);

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
            router.visit(`/pay/mpesa/${encodeURIComponent(order.order_number)}`);
            return;
        }

        if (selected === 'card') {
            setIsLoading(true);
            try {
                const res = await axios.post('/api/payments/mpgs/init', {
                    order_number: order.order_number,
                });

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
            <div className="w-full max-w-lg mx-auto py-4 sm:py-8 px-3 sm:px-4">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">Complete Payment</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Select your preferred payment method to proceed.</p>
                </div>

                {/* Security Trust Pill */}
                <div className="flex flex-col items-center justify-center mb-6 mt-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-full border border-brand-border">
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        <span>Evopay Secure Hosted Checkout</span>
                    </div>
                </div>

                {/* Order Summary Card */}
                <div className="bg-brand-light rounded-2xl p-4 sm:p-5 mb-5 border border-brand-border shadow-xs">
                    <div className="flex justify-between items-center mb-2 text-xs">
                        <span className="text-gray-500">Order Reference</span>
                        <span className="font-medium text-brand-dark">
                            {order.order_number}
                        </span>
                    </div>

                    {order.customer_name && (
                        <div className="flex justify-between items-center mb-2 text-xs">
                            <span className="text-gray-500">Customer</span>
                            <span className="font-medium text-brand-dark">{order.customer_name}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-3 mt-1 border-t border-brand-border">
                        <span className="text-sm font-bold text-brand-dark">Total Payable</span>
                        <span className="text-xl sm:text-2xl font-black text-brand-primary">{formatKES(order.total_amount)}</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs sm:text-sm text-red-700 flex items-start justify-between gap-2 shadow-xs">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                                <p className="font-bold text-red-800">Payment failed or cancelled</p>
                                <p className="mt-0.5">{error}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setError(null)}
                            className="text-xs font-semibold text-red-600 hover:text-red-800 cursor-pointer"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Payment Methods */}
                <div className="space-y-3 mb-6">
                    {paymentMethods.map((pm) => {
                        const isSelected = selected === pm.key;
                        return (
                            <button
                                key={pm.key}
                                type="button"
                                disabled={pm.disabled || isLoading}
                                onClick={() => setSelected(pm.key)}
                                className={`w-full flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border transition-all text-left cursor-pointer ${
                                    pm.disabled
                                        ? 'border-brand-border bg-gray-50 opacity-60 cursor-not-allowed'
                                        : isSelected
                                            ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/25 shadow-xs'
                                            : 'border-brand-border bg-white hover:border-brand-primary/60'
                                }`}
                            >
                                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                                    <div className="w-14 h-10 bg-white rounded-xl border border-brand-border flex items-center justify-center p-1.5 flex-shrink-0">
                                        <img src={pm.image} alt={pm.label} className="max-h-full max-w-full object-contain" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm text-brand-dark leading-tight truncate">{pm.label}</p>
                                            {pm.badge && (
                                                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${pm.badgeColor}`}>
                                                    {pm.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">{pm.subtitle}</p>
                                    </div>
                                </div>

                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                    isSelected && !pm.disabled ? 'border-brand-primary bg-brand-primary' : 'border-gray-300 bg-white'
                                }`}>
                                    {isSelected && !pm.disabled && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Action Button */}
                <button
                    type="button"
                    onClick={handleContinue}
                    disabled={isLoading}
                    className="w-full bg-brand-dark text-white py-4 rounded-2xl font-extrabold text-sm sm:text-base hover:bg-black transition-all disabled:opacity-50 flex justify-center items-center shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : selected === 'card' ? (
                        'Continue to Checkout →'
                    ) : (
                        `Pay · ${formatKES(order.total_amount)}`
                    )}
                </button>

                {/* Footer Trust Bar & Links */}
                <div className="mt-6 pt-5 border-t border-brand-border text-center space-y-3">
                    <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400">
                        <span>Safaricom M-Pesa</span>
                        <span>•</span>
                        <span>Mastercard MPGS</span>
                        <span>•</span>
                        <span>Evopay</span>
                    </div>

                    <div>
                        <Link href="/checkout" className="text-xs text-gray-500 hover:text-brand-primary font-medium transition">
                            ← Cancel and return to shipping details
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}