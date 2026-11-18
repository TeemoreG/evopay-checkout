import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import MainLayout from '../../Layouts/MainLayout';
import { useCart } from '../../Stores/cart';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const MPESA_LOGO = 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000028/1_q6VZ_q0WIism6TgZ9kBIWQ_km524l.png';

const normalizePhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
    if (digits.startsWith('254') && digits.length === 12) return digits;
    if ((digits.startsWith('7') || digits.startsWith('1')) && digits.length === 9) return '254' + digits;
    return null;
};

export default function MpesaPay({ order }) {
    const clearCart = useCart((s) => s.clear);
    const [phone, setPhone] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isWaitingForPin, setIsWaitingForPin] = useState(false);
    const [isCheckingNow, setIsCheckingNow] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(75);
    const [error, setError] = useState(null);

    const pollIntervalRef = useRef(null);
    const timerIntervalRef = useRef(null);

    const stopPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    };

    useEffect(() => {
        return () => stopPolling();
    }, []);

    const normalizedPreview = normalizePhone(phone);

    const checkPaymentStatus = async (manual = false) => {
        if (manual) setIsCheckingNow(true);
        try {
            const res = await axios.get(`/api/payments/${encodeURIComponent(order.order_number)}/status`);

            if (res.data.status === 'paid') {
                stopPolling();
                clearCart();
                router.visit(`/checkout/success?order=${encodeURIComponent(order.order_number)}`);
                return true;
            }

            if (res.data.status === 'failed') {
                stopPolling();
                setIsWaitingForPin(false);
                setError(res.data.message || 'M-Pesa payment failed or was cancelled. Please try again.');
                return true;
            }

            if (manual) {
                setError('Payment is still pending confirmation. Enter your M-Pesa PIN or wait a few seconds.');
            }
        } catch (err) {
            console.error('Status polling error', err);
        } finally {
            if (manual) setIsCheckingNow(false);
        }
        return false;
    };

    const startPolling = () => {
        stopPolling();
        let attempts = 0;
        const maxAttempts = 25; // 75 seconds
        setSecondsLeft(75);

        timerIntervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        pollIntervalRef.current = setInterval(async () => {
            attempts++;
            const finished = await checkPaymentStatus(false);

            if (!finished && attempts >= maxAttempts) {
                stopPolling();
                setIsWaitingForPin(false);
                setError('M-Pesa confirmation timed out. If you already entered your PIN, wait for the SMS or click Pay again.');
            }
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const normalized = normalizePhone(phone);

        if (!normalized) {
            setError('Please enter a valid Safaricom M-Pesa number (e.g. 0712345678 or 0112345678).');
            return;
        }

        setError(null);
        setIsSending(true);

        try {
            const res = await axios.post('/api/payments/mpesa/stk-push', {
                order_number: order.order_number,
                phone: normalized,
            });

            if (res.data.status === 'paid') {
                clearCart();
                router.visit(`/checkout/success?order=${encodeURIComponent(order.order_number)}`);
                return;
            }

            setIsSending(false);
            setIsWaitingForPin(true);
            startPolling();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Could not initiate M-Pesa STK Push. Please try again.'
            );
            setIsSending(false);
        }
    };

    return (
        <MainLayout minimal>
            <div className="max-w-md mx-auto py-8 md:py-12">
                <div className="bg-white rounded-2xl border border-brand-border p-6 md:p-8 shadow-sm">
                    {/* Header with M-Pesa Logo & Amount */}
                    <div className="flex items-center justify-between border-b border-brand-border pb-5 mb-6">
                        <img
                            src={MPESA_LOGO}
                            alt="M-Pesa"
                            className="h-10 object-contain"
                        />
                        <div className="text-right">
                            <p className="text-xs text-gray-500">
                                Order <strong className="text-brand-dark">{order.order_number}</strong>
                            </p>
                            <p className="text-xl font-extrabold text-brand-primary">
                                {formatKES(order.total_amount)}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 flex items-start justify-between gap-2">
                            <div>
                                <p className="font-bold text-red-800">M-Pesa Notice</p>
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

                    {isWaitingForPin ? (
                        <div className="py-4 text-center">
                            <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
                            <h2 className="text-lg font-bold text-brand-dark mb-2">Waiting for M-Pesa PIN</h2>
                            <p className="text-sm text-gray-500">
                                An STK Push for <strong className="text-brand-dark">{formatKES(order.total_amount)}</strong> was sent to{' '}
                                <strong className="text-brand-dark">+{normalizedPreview || phone}</strong>.
                            </p>

                            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-light border border-brand-border px-3.5 py-1.5 text-xs font-semibold text-gray-600">
                                <span>Listening for Safaricom callback</span>
                                <span className="text-brand-primary font-mono">{secondsLeft}s</span>
                            </div>

                            <div className="mt-6 space-y-3">
                                <button
                                    type="button"
                                    disabled={isCheckingNow}
                                    onClick={() => checkPaymentStatus(true)}
                                    className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 transition cursor-pointer"
                                >
                                    {isCheckingNow ? 'Checking...' : "I've Entered My PIN · Check Now"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        stopPolling();
                                        setIsWaitingForPin(false);
                                        setError(null);
                                    }}
                                    className="text-sm text-gray-500 hover:text-brand-dark underline cursor-pointer"
                                >
                                    Cancel or use a different number
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-1.5">
                                    M-Pesa Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g. 0712345678 or 0112345678"
                                    autoFocus
                                    className="w-full rounded-lg bg-brand-input border border-transparent px-4 py-3.5 text-sm placeholder-gray-500"
                                />

                                {normalizedPreview ? (
                                    <p className="mt-1.5 text-xs text-green-700 font-medium">
                                        Prompt will be sent to +{normalizedPreview}
                                    </p>
                                ) : (
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Enter the Safaricom number that will receive the M-Pesa PIN prompt.
                                    </p>
                                )}

                                {order.contact_phone && phone !== order.contact_phone && (
                                    <button
                                        type="button"
                                        onClick={() => setPhone(order.contact_phone)}
                                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
                                    >
                                        Use contact number ({order.contact_phone})
                                    </button>
                                )}
                            </div>

                            <div className="rounded-xl bg-brand-light border border-brand-border p-3.5 text-xs text-gray-600 space-y-1">
                                <p className="font-semibold text-brand-dark">How it works:</p>
                                <p>1. Enter your Safaricom M-Pesa number and click Pay.</p>
                                <p>2. Enter your M-Pesa PIN on the prompt sent to your phone.</p>
                                <p>3. You will be redirected automatically once confirmed.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-sm hover:bg-black disabled:opacity-40 transition cursor-pointer"
                            >
                                {isSending ? 'Sending M-Pesa Prompt...' : `Pay · ${formatKES(order.total_amount)}`}
                            </button>
                        </form>
                    )}

                    <div className="mt-5 pt-4 border-t border-brand-border flex items-center justify-between text-xs text-gray-400">
                        <Link
                            href={`/pay/${encodeURIComponent(order.order_number)}`}
                            className="text-sm text-gray-500 hover:text-brand-primary font-medium"
                        >
                            ← Change payment method
                        </Link>
                        <span>Secured by Evopay</span>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}