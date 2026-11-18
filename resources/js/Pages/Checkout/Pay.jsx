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
        description: 'Pay instantly with Safaricom M-Pesa STK Push',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000028/1_q6VZ_q0WIism6TgZ9kBIWQ_km524l.png',
        disabled: false,
    },
    {
        key: 'card',
        label: 'Card (Visa / Mastercard)',
        description: 'Pay securely via Mastercard Hosted Checkout',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000459/visa_mx9x3z.jpg',
        disabled: false,
    },
    {
        key: 'airtel',
        label: 'Airtel Money',
        description: 'Coming soon',
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
            <div className="max-w-lg mx-auto py-8 md:py-12">
                <div className="bg-white rounded-2xl border border-brand-border p-6 md:p-8 shadow-sm">
                    {/* Summary Header */}
                    <div className="flex items-start justify-between border-b border-brand-border pb-5 mb-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Evopay Checkout
                            </p>
                            <h1 className="text-xl font-extrabold text-brand-dark mt-1">
                                Choose Payment Method
                            </h1>
                            <p className="text-xs text-gray-500 mt-1">
                                Order <strong className="text-brand-dark">{order.order_number}</strong>
                                {order.customer_name ? ` · ${order.customer_name}` : ''}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Total to pay</p>
                            <p className="text-2xl font-extrabold text-brand-primary">
                                {formatKES(order.total_amount)}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 flex items-start justify-between gap-2">
                            <div>
                                <p className="font-bold text-red-800">Payment could not be completed</p>
                                <p className="mt-0.5">{error}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setError(null)}
                                className="text-xs font-semibold text-red-600 hover:text-red-800"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Payment Options */}
                    <div className="space-y-3">
                        {paymentMethods.map((pm) => {
                            const isSelected = selected === pm.key;
                            return (
                                <button
                                    key={pm.key}
                                    type="button"
                                    disabled={pm.disabled || isLoading}
                                    onClick={() => setSelected(pm.key)}
                                    className={`w-full text-left rounded-xl border p-4 transition flex items-center gap-4 ${
                                        pm.disabled
                                            ? 'border-brand-border bg-gray-50 opacity-60 cursor-not-allowed'
                                            : isSelected
                                                ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/25 cursor-pointer'
                                                : 'border-brand-border bg-white hover:border-brand-primary cursor-pointer'
                                    }`}
                                >
                                    <div className="w-16 h-10 flex items-center justify-center flex-shrink-0 bg-white rounded-lg border border-brand-border p-1">
                                        <img src={pm.image} alt={pm.label} className="max-h-full max-w-full object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm text-brand-dark">{pm.label}</p>
                                            {pm.disabled && (
                                                <span className="text-[10px] bg-gray-200 text-brand-dark px-1.5 py-0.5 rounded font-bold uppercase">
                                                    Soon
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{pm.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isLoading}
                        className="mt-6 w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-sm hover:bg-black disabled:opacity-40 transition cursor-pointer"
                    >
                        {isLoading
                            ? 'Redirecting...'
                            : selected === 'card'
                                ? 'Continue to Checkout'
                                : `Pay · ${formatKES(order.total_amount)}`}
                    </button>

                    <div className="mt-5 pt-4 border-t border-brand-border text-center">
                        <Link
                            href="/checkout"
                            className="text-sm text-gray-500 hover:text-brand-primary font-medium"
                        >
                            ← Back to shipping details
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}