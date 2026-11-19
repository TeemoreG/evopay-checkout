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
        subtitle: 'Money',
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
            <div className="w-full max-w-lg mx-auto min-h-[100dvh] flex flex-col py-6 sm:py-10 px-4 sm:px-6">
                {/* Stepper Breadcrumb */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-6">
                    <span className="text-gray-500">Shipping</span>
                    <span>›</span>
                    <span className="text-brand-dark font-semibold">Payment</span>
                    <span>›</span>
                    <span>Confirmation</span>
                </div>

                {/* Security Badge */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-gray-500 bg-brand-light px-3.5 py-1.5 rounded-full border border-brand-border">
                        <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                        </svg>
                        <span>Evopay Secure Payment Gateway</span>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-7">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">Complete Payment</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1.5">Choose your preferred payment method</p>
                </div>

                {/* Order Summary Box */}
                <div className="bg-brand-light rounded-2xl p-5 sm:p-6 mb-6 border border-brand-border shadow-xs">
                    <div className="flex justify-between items-center mb-3 text-xs sm:text-sm">
                        <span className="text-gray-500">Order Reference</span>
                        <span className="font-semibold text-brand-dark">{order.order_number}</span>
                    </div>

                    {order.customer_name && (
                        <div className="flex justify-between items-center mb-3 text-xs sm:text-sm">
                            <span className="text-gray-500">Customer</span>
                            <span className="font-semibold text-brand-dark">{order.customer_name}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 mt-1 border-t border-brand-border">
                        <span className="text-sm font-bold text-brand-dark">Total Payable</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-brand-primary">{formatKES(order.total_amount)}</span>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start justify-between gap-2 shadow-xs">
                        <div className="flex items-start gap-1.5">
                            <span className="text-red-500 font-bold">✕</span>
                            <div>
                                <p className="font-bold text-red-800">Notice</p>
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

                {/* Payment Methods - Wider, shorter icon area */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                    {paymentMethods.map((pm) => {
                        const isSelected = selected === pm.key;
                        return (
                            <button
                                key={pm.key}
                                type="button"
                                disabled={pm.disabled || isLoading}
                                onClick={() => setSelected(pm.key)}
                                className={`relative flex flex-col items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all text-center min-h-[104px] sm:min-h-[112px] cursor-pointer ${
                                    pm.disabled
                                        ? 'border-brand-border bg-gray-50 opacity-50 cursor-not-allowed'
                                        : isSelected
                                            ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/30 shadow-sm'
                                            : 'border-brand-border bg-white hover:border-brand-primary/40'
                                }`}
                            >

                                {pm.disabled && (
                                    <span className="absolute top-1.5 right-1.5 text-[7px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">
                                        Soon
                                    </span>
                                )}

                                {/* Reduced icon height */}
                                <div className="h-6 sm:h-7 w-full flex items-center justify-center mt-1 mb-1.5">
                                    <img
                                        src={pm.image}
                                        alt={pm.label}
                                        className="max-h-5 sm:max-h-6 max-w-[85%] object-contain"
                                    />
                                </div>

                                <div className="w-full">
                                    <p className="font-bold text-xs sm:text-sm text-brand-dark leading-tight truncate">
                                        {pm.label}
                                    </p>
                                    <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 truncate">
                                        {pm.subtitle}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Push button toward bottom on tall screens */}
                <div className="mt-auto">
                    {/* Primary Action Button */}
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isLoading}
                        className="w-full bg-brand-dark text-white py-4.5 sm:py-5 rounded-2xl font-bold text-sm sm:text-base hover:bg-black transition-all disabled:opacity-50 flex justify-center items-center gap-1.5 shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : selected === 'card' ? (
                            <>
                                <span>Continue to Checkout</span>
                                <span>→</span>
                            </>
                        ) : (
                            `Pay · ${formatKES(order.total_amount)}`
                        )}
                    </button>

                    {/* Footer Security Badges & Return Link */}
                    <div className="mt-6 pt-5 border-t border-brand-border text-center space-y-3">
                        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
                            <span>Safaricom M-Pesa</span>
                            <span>•</span>
                            <span>Mastercard</span>
                            <span>•</span>
                            <span>PCI-DSS</span>
                        </div>

                        <div>
                            <Link href="/checkout" className="text-[11px] text-gray-400 hover:text-brand-primary font-medium transition">
                                ← Cancel and return to shipping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}