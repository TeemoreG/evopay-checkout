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
        subtitle: 'Safaricom STK Push',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000028/1_q6VZ_q0WIism6TgZ9kBIWQ_km524l.png',
        disabled: false,
    },
    {
        key: 'card',
        label: 'Debit / Credit Card',
        subtitle: 'Visa & Mastercard',
        tag: 'Secure 3D',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000459/visa_mx9x3z.jpg',
        disabled: false,
    },
    {
        key: 'airtel',
        label: 'Airtel Money',
        subtitle: 'Mobile Money',
        tag: 'Coming Soon',
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
            <div className="max-w-3xl mx-auto py-6 sm:py-12 px-2 sm:px-4">
                <div className="bg-white rounded-3xl border border-brand-border p-5 sm:p-8 md:p-10 shadow-sm">
                    {/* Top Security & Branding Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-brand-border">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Evopay Secure Checkout
                            </span>
                        </div>
                    </div>

                    {/* Order & Amount Header */}
                    <div className="py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold px-2.5 py-1 bg-brand-light border border-brand-border rounded-md text-brand-dark">
                                    {order.order_number}
                                </span>
                                {order.items_count > 0 && (
                                    <span className="text-xs text-gray-500 font-medium">
                                        ({order.items_count} {order.items_count === 1 ? 'item' : 'items'})
                                    </span>
                                )}
                            </div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark mt-2 tracking-tight">
                                Select Payment Method
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                {order.customer_name ? `Paying as ${order.customer_name} · ` : ''}Choose your preferred option
                            </p>
                        </div>

                        <div className="sm:text-right bg-brand-light sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-brand-border">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-brand-primary mt-0.5">
                                {formatKES(order.total_amount)}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start justify-between gap-3 shadow-xs">
                            <div className="flex items-start gap-2.5">
                                <span className="mt-0.5 text-red-600 font-bold">✕</span>
                                <div>
                                    <p className="font-bold text-red-800">Payment failed or cancelled</p>
                                    <p className="mt-0.5 text-xs sm:text-sm">{error}</p>
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

                    {/* Payment Methods - Row Grid Layout on tablet/desktop, Clean responsive stack on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mt-2">
                        {paymentMethods.map((pm) => {
                            const isSelected = selected === pm.key;
                            return (
                                <button
                                    key={pm.key}
                                    type="button"
                                    disabled={pm.disabled || isLoading}
                                    onClick={() => setSelected(pm.key)}
                                    className={`relative text-left rounded-2xl border p-4 sm:p-5 transition-all flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-between min-h-[96px] sm:min-h-[170px] ${
                                        pm.disabled
                                            ? 'border-brand-border bg-gray-50 opacity-55 cursor-not-allowed'
                                            : isSelected
                                                ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/25 shadow-sm cursor-pointer'
                                                : 'border-brand-border bg-white hover:border-brand-primary/60 hover:shadow-xs cursor-pointer'
                                    }`}
                                >
                                    {/* Tag Badge */}
                                    {pm.tag && (
                                        <span
                                            className={`absolute top-2.5 right-2.5 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wide ${
                                                pm.disabled
                                                    ? 'bg-gray-200 text-gray-600'
                                                    : isSelected
                                                        ? 'bg-brand-primary text-white'
                                                        : 'bg-brand-light border border-brand-border text-gray-600'
                                            }`}
                                        >
                                            {pm.tag}
                                        </span>
                                    )}

                                    {/* Logo Container */}
                                    <div className="w-14 h-12 sm:w-16 sm:h-12 flex items-center justify-center bg-white rounded-xl border border-brand-border/80 p-1 flex-shrink-0">
                                        <img
                                            src={pm.image}
                                            alt={pm.label}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>

                                    {/* Text Info */}
                                    <div className="flex-1 sm:flex-initial mx-3 sm:mx-0 sm:mt-4">
                                        <p className="font-bold text-sm text-brand-dark leading-tight">
                                            {pm.label}
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            {pm.subtitle}
                                        </p>
                                    </div>

                                    {/* Active Radio Indicator */}
                                    <div className="flex-shrink-0 sm:mt-3">
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                                                pm.disabled
                                                    ? 'border-gray-300'
                                                    : isSelected
                                                        ? 'border-brand-primary bg-brand-primary'
                                                        : 'border-gray-300 bg-white'
                                            }`}
                                        >
                                            {isSelected && !pm.disabled && (
                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                            )}
                                        </div>
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
                        className="mt-8 w-full bg-brand-dark text-white py-4 rounded-2xl font-bold text-sm sm:text-base hover:bg-black disabled:opacity-40 transition-all cursor-pointer shadow-md hover:shadow-lg"
                    >
                        {isLoading
                            ? 'Connecting to Gateway...'
                            : selected === 'card'
                                ? 'Continue to Checkout'
                                : `Pay · ${formatKES(order.total_amount)}`}
                    </button>

                    {/* Trust Badges & Back Navigation */}
                    <div className="mt-6 pt-5 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
                        <Link
                            href="/checkout"
                            className="text-gray-500 hover:text-brand-primary font-medium transition"
                        >
                            ← Back to shipping details
                        </Link>

                        <div className="flex items-center gap-3 text-[11px]">
                            <span>Safaricom M-Pesa</span>
                            <span>•</span>
                            <span>Mastercard MPGS</span>
                            <span>•</span>
                            <span>Evopay Africa</span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}