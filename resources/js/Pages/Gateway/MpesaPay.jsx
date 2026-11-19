import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import MainLayout from '../../Layouts/MainLayout';

const formatMoney = (amount, currency = 'KES') =>
    `${currency} ` + Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const MPESA_LOGO = 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000028/1_q6VZ_q0WIism6TgZ9kBIWQ_km524l.png';

const normalizePhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
    if (digits.startsWith('254') && digits.length === 12) return digits;
    if ((digits.startsWith('7') || digits.startsWith('1')) && digits.length === 9) return '254' + digits;
    return null;
};

export default function GatewayMpesaPay({ session, merchant }) {
    const [phone, setPhone] = useState(session.customer_phone || '');
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
            const url = manual
                ? `/c/${session.token}/status?force=1`
                : `/c/${session.token}/status`;

            const res = await axios.get(url);

            if (res.data.status === 'paid') {
                stopPolling();
                if (res.data.redirect_url) {
                    window.location.href = res.data.redirect_url;
                } else {
                    window.location.href = `/c/${session.token}/success`;
                }
                return true;
            }

            if (res.data.status === 'failed') {
                stopPolling();
                setIsWaitingForPin(false);
                setError(res.data.message || 'M-Pesa payment was not completed. Please try again.');
                return true;
            }

            if (manual) {
                setError('Payment still pending. Please check your phone for the PIN prompt.');
            }
        } catch (err) {
            console.error('Polling error', err);
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
                setError('Confirmation timed out. If you entered your PIN, wait for the SMS or click Pay to retry.');
            }
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const normalized = normalizePhone(phone);

        if (!normalized) {
            setError('Please enter a valid Safaricom M-Pesa number (e.g. 0712345678).');
            return;
        }

        setError(null);
        setIsSending(true);

        try {
            const res = await axios.post(`/c/${session.token}/mpesa/stk-push`, {
                phone: normalized,
            });

            if (res.data.status === 'paid') {
                window.location.href = `/c/${session.token}/success`;
                return;
            }

            setIsSending(false);
            setIsWaitingForPin(true);
            startPolling();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Could not send M-Pesa prompt. Please try again.'
            );
            setIsSending(false);
        }
    };

    return (
        <MainLayout minimal>
            <div className="min-h-[82vh] flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6">
                <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                        <img src={MPESA_LOGO} alt="M-Pesa" className="h-7 object-contain" />
                        <div className="text-right">
                            <span className="text-xs font-semibold text-gray-500">{merchant.name}</span>
                            <p className="text-xs font-mono text-gray-400">{session.merchant_reference}</p>
                        </div>
                    </div>

                    <div className="py-5 text-center">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Due</p>
                        <p className="text-3xl font-extrabold text-brand-primary mt-0.5">
                            {formatMoney(session.amount, session.currency)}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start justify-between gap-2 shadow-xs">
                            <div>
                                <p className="font-bold text-red-800">M-Pesa Notice</p>
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

                    {isWaitingForPin ? (
                        <div className="py-4 text-center">
                            <div className="w-14 h-14 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <h2 className="text-base font-bold text-brand-dark mb-1">Waiting for M-Pesa PIN</h2>
                            <p className="text-xs text-gray-500">
                                Prompt sent to <strong className="text-brand-dark">+{normalizedPreview || phone}</strong>. Check your phone.
                            </p>

                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-light border border-brand-border px-3 py-1 text-[11px] font-semibold text-gray-600">
                                <span>Waiting for Safaricom confirmation</span>
                                <span className="text-brand-primary font-mono">{secondsLeft}s</span>
                            </div>

                            <div className="mt-5 space-y-2.5">
                                <button
                                    type="button"
                                    disabled={isCheckingNow}
                                    onClick={() => checkPaymentStatus(true)}
                                    className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold text-xs hover:bg-black transition cursor-pointer"
                                >
                                    {isCheckingNow ? 'Checking...' : "I've Entered My PIN · Check Now"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        stopPolling();
                                        setIsWaitingForPin(false);
                                    }}
                                    className="text-xs text-gray-400 hover:text-brand-dark underline cursor-pointer"
                                >
                                    Cancel or use different number
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                                    M-Pesa Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g. 0712345678"
                                    autoFocus
                                    className="w-full rounded-xl bg-brand-input border border-transparent px-4 py-3 text-sm placeholder-gray-400"
                                />

                                {normalizedPreview ? (
                                    <p className="mt-1 text-[11px] text-green-700 font-medium">
                                        Prompt will be sent to +{normalizedPreview}
                                    </p>
                                ) : (
                                    <p className="mt-1 text-[11px] text-gray-400">
                                        Enter your active Safaricom line.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black disabled:opacity-40 transition cursor-pointer"
                            >
                                {isSending ? 'Sending Prompt...' : `Pay · ${formatMoney(session.amount, session.currency)}`}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 pt-4 border-t border-brand-border flex items-center justify-between text-[11px] text-gray-400">
                        <a href={`/c/${session.token}`} className="text-gray-500 hover:text-brand-primary font-medium">
                            ← Change payment method
                        </a>
                        <span>Secured by Evopay</span>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}