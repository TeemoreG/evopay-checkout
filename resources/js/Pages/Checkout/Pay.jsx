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
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000459/visa_mx9x3z.jpg',
        disabled: false,
    },
    {
        key: 'airtel',
        label: 'Airtel Money',
        subtitle: 'Coming soon',
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
            <div className="w-full max-w-md mx-auto py-6 px-4">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-brand-dark">Complete Payment</h1>
                    <p className="text-sm text-gray-500 mt-1">Select your preferred payment method.</p>
                </div>

                {/* Order Summary Card */}
                <div className="bg-brand-light rounded-xl p-4 mb-6 border border-brand-border">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Order Number</span>
                        <span className="text-xs text-gray-500 text-brand-dark">{order.order_number}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-brand-border/50">
                        <span className="text-sm font-medium text-brand-dark">Total Payable</span>
                        <span className="text-xl font-extrabold text-brand-primary">{formatKES(order.total_amount)}</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <div className="flex-1">{error}</div>
                    </div>
                )}

                {/* Payment Methods */}
                <div className="space-y-3 mb-8">
                    {paymentMethods.map((pm) => {
                        const isSelected = selected === pm.key;
                        return (
                            <button
                                key={pm.key}
                                type="button"
                                disabled={pm.disabled || isLoading}
                                onClick={() => setSelected(pm.key)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                                    pm.disabled
                                        ? 'border-brand-border bg-gray-50 opacity-60 cursor-not-allowed'
                                        : isSelected
                                            ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                                            : 'border-brand-border bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-8 bg-white rounded border border-brand-border flex items-center justify-center p-1 flex-shrink-0">
                                        <img src={pm.image} alt={pm.label} className="max-h-full max-w-full object-contain" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-brand-dark">{pm.label}</p>
                                        <p className="text-xs text-gray-500">{pm.subtitle}</p>
                                    </div>
                                </div>

                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected && !pm.disabled ? 'border-brand-primary' : 'border-gray-300'
                                }`}>
                                    {isSelected && !pm.disabled && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary"></div>}
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
                    className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        `Pay ${formatKES(order.total_amount)}`
                    )}
                </button>

                {/* Footer Links */}
                <div className="mt-6 text-center">
                    <Link href="/checkout" className="text-xs text-gray-500 hover:text-brand-primary transition">
                        Cancel and return to checkout
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
}