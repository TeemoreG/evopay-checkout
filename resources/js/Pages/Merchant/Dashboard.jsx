import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';

const formatMoney = (amount) =>
    Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

// Evopay Exact Connected-Dots SVG Emblem
function EvopayLogo({ className = 'h-7' }) {
    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <span className="font-black text-2xl tracking-tighter text-[#E85A24] font-sans">ev</span>
            <div className="w-6 h-6 rounded-full bg-[#E85A24] flex items-center justify-center p-1 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full">
                    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                    <circle cx="12" cy="4" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="20" r="1.5" fill="currentColor" />
                    <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="20" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="6.5" cy="6.5" r="1.2" fill="currentColor" />
                    <circle cx="17.5" cy="17.5" r="1.2" fill="currentColor" />
                    <path d="M12 6.5V9.5M12 14.5V17.5M6.5 12H9.5M14.5 12H17.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </div>
            <span className="font-black text-2xl tracking-tighter text-[#E85A24] font-sans">pay</span>
        </div>
    );
}

export default function MerchantDashboard({ merchant, stats, wallet = {}, sessions = [], settlements = [] }) {
    const [activeFeed, setActiveFeed] = useState('transactions'); // 'transactions' or 'settlements'
    const [search, setSearch] = useState('');
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [refundTarget, setRefundTarget] = useState(null);
    const [refundReason, setRefundReason] = useState('');

    const availableBalance = Number(wallet.available_balance || 0);

    const withdrawForm = useForm({
        amount: '',
        channel: 'mpesa',
        phone: '',
        bank_name: '',
        account_number: '',
    });

    const requestedAmount = Number(withdrawForm.data.amount || 0);
    const isExceedingBalance = requestedAmount > availableBalance;
    const canWithdraw = availableBalance >= 100 && requestedAmount >= 100 && !isExceedingBalance;

    const submitWithdrawal = (e) => {
        e.preventDefault();
        if (isExceedingBalance || requestedAmount <= 0) return;

        withdrawForm.post('/merchant/withdraw', {
            preserveScroll: true,
            onSuccess: () => {
                withdrawForm.reset();
                setIsWithdrawOpen(false);
            },
        });
    };

    const confirmRefund = (e) => {
        e.preventDefault();
        if (!refundTarget) return;

        router.post(
            `/merchant/sessions/${refundTarget.id}/refund`,
            { reason: refundReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRefundTarget(null);
                    setRefundReason('');
                },
            }
        );
    };

    // Calculate whether a pending session is older than 60 mins (expired)
    const getSessionState = (session) => {
        if (session.status === 'paid') return { label: 'Paid', style: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
        if (session.status === 'refunded') return { label: 'Refunded', style: 'text-purple-700 bg-purple-50 border-purple-200' };
        if (session.status === 'failed') return { label: 'Failed', style: 'text-rose-700 bg-rose-50 border-rose-200' };

        const ageMs = Date.now() - new Date(session.created_at).getTime();
        const isExpired = ageMs > 60 * 60 * 1000;

        if (isExpired) {
            return { label: 'Session Expired', style: 'text-gray-500 bg-gray-100 border-gray-200' };
        }

        return { label: 'Awaiting Payment', style: 'text-amber-800 bg-amber-50 border-amber-200' };
    };

    const filteredSessions = sessions.filter((s) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;

        return (
            s.merchant_reference?.toLowerCase().includes(q) ||
            s.token?.toLowerCase().includes(q) ||
            s.mpesa_receipt?.toLowerCase().includes(q) ||
            s.customer?.name?.toLowerCase().includes(q) ||
            s.customer?.phone?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="min-h-screen bg-[#F4F5F8] text-gray-900 flex">
            <Head title={`${merchant.name} — Evopay Merchant`} />

            {/* DESKTOP FULL-HEIGHT SIDEBAR (Hidden on mobile) */}
            <aside className="hidden lg:flex w-72 fixed inset-y-0 left-0 bg-white border-r border-gray-200 flex-col justify-between z-30">
                <div>
                    {/* Brand Flush Header */}
                    <div className="h-20 flex items-center px-7 border-b border-gray-100">
                        <EvopayLogo />
                    </div>

                    {/* Nav Links */}
                    <div className="p-5 space-y-6">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3.5 mb-2.5">
                                Merchant Workspace
                            </p>
                            <div className="space-y-1">
                                <Link
                                    href="/merchant"
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold bg-[#E85A24] text-white shadow-xs transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                                    </svg>
                                    <span>Wallet & Activity</span>
                                </Link>

                                <Link
                                    href="/merchant/developers"
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                                    </svg>
                                    <span>API Keys & Webhooks</span>
                                </Link>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3.5 mb-2.5">
                                Account
                            </p>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-1">
                                <p className="text-xs font-bold text-gray-900 truncate">{merchant.name}</p>
                                <p className="text-[11px] text-gray-500 font-mono">Commission: {merchant.fee_percent}%</p>
                                <span className="inline-block text-[10px] font-bold uppercase text-emerald-700 mt-1">
                                    ● Verified Account
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN APP CONTAINER */}
            <main className="flex-1 lg:pl-72 min-w-0 pb-20">
                {/* Mobile & Web App Hero Header (Evopay Warm Orange Header like image) */}
                <div className="bg-[#E85A24] px-5 pt-7 pb-20 sm:pb-24 lg:rounded-b-3xl">
                    <div className="max-w-md lg:max-w-4xl mx-auto flex items-center justify-between text-white">
                        <div>
                            <span className="text-xs text-orange-100 font-medium">Hello 👋</span>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                                Welcome to Evopay!
                            </h1>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white font-bold text-xs">
                                👤
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* OVERLAPPING EVOPAY BALANCE CARD */}
                <div className="max-w-md lg:max-w-4xl mx-auto px-4 -mt-14 sm:-mt-16 space-y-6">
                    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg shadow-black/5 border border-gray-100 space-y-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    EVOPAY BALANCE
                                </span>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="text-xs font-bold text-gray-400">Kshs.</span>
                                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                                        {formatMoney(availableBalance)}
                                    </h2>
                                </div>
                            </div>

                            {/* Orange Wallet Graphic Icon */}
                            <div className="w-11 h-11 rounded-2xl bg-[#FFF2ED] flex items-center justify-center text-[#E85A24]">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                                </svg>
                            </div>
                        </div>

                        {/* Two Primary Action Buttons (Matching image) */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => setIsWithdrawOpen(true)}
                                disabled={availableBalance < 100}
                                className="bg-[#E85A24] text-white py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-sm hover:bg-[#d44d1a] transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 cursor-pointer"
                            >
                                <span>+</span>
                                <span>Withdraw Funds</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveFeed(activeFeed === 'settlements' ? 'transactions' : 'settlements')}
                                className="bg-white border-2 border-gray-200 text-gray-800 py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-sm hover:bg-gray-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5 text-[#E85A24]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                </svg>
                                <span>{activeFeed === 'settlements' ? 'View Orders' : 'View Payouts'}</span>
                            </button>
                        </div>

                        {/* Balance Ledger Summary */}
                        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                            <span>Gross: <strong className="text-gray-900 font-semibold">Ksh. {formatMoney(wallet.gross_volume || 0)}</strong></span>
                            <span>Fees ({merchant.fee_percent}%): Ksh. {formatMoney(wallet.total_fees || 0)}</span>
                            <span>Withdrawn: Ksh. {formatMoney(wallet.total_withdrawn || 0)}</span>
                            {Number(wallet.total_refunded || 0) > 0 && (
                                <span className="text-purple-600 font-semibold">Refunds: Ksh. {formatMoney(wallet.total_refunded)}</span>
                            )}
                        </div>
                    </div>

                    {/* ACTIVITY FEED HEADER */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-800">
                                {activeFeed === 'transactions' ? 'Customer Transactions' : 'Withdrawal Statements'}
                            </h3>
                            <span className="text-xs text-gray-400">
                                {activeFeed === 'transactions' ? `${filteredSessions.length} total` : `${settlements.length} total`}
                            </span>
                        </div>

                        {activeFeed === 'transactions' && (
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by customer name, phone, M-Pesa receipt..."
                                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#E85A24]"
                            />
                        )}

                        {/* FEED ITEMS */}
                        {activeFeed === 'transactions' ? (
                            filteredSessions.length === 0 ? (
                                <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-gray-200">
                                    No checkout sessions recorded yet.
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {filteredSessions.map((s) => {
                                        const state = getSessionState(s);
                                        const isPaid = s.status === 'paid';

                                        return (
                                            <div
                                                key={s.id}
                                                className="bg-white border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs hover:border-gray-300 transition"
                                            >
                                                {/* Left Column */}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                                            isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {isPaid ? '✓' : '•'}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-gray-900 truncate">
                                                            {s.customer?.name || s.merchant_reference}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                                            {s.mpesa_receipt ? `${s.mpesa_receipt} · ` : ''}
                                                            {new Date(s.created_at).toLocaleDateString('en-KE', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right Column */}
                                                <div className="text-right flex-shrink-0">
                                                    <p
                                                        className={`font-black text-sm ${
                                                            isPaid ? 'text-[#E85A24]' : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {isPaid ? `+ ${formatMoney(s.amount)}` : `${formatMoney(s.amount)}`} Kshs
                                                    </p>

                                                    <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1 ${state.style}`}>
                                                        {state.label}
                                                    </span>

                                                    {isPaid && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setRefundTarget(s)}
                                                            className="text-[10px] font-bold text-purple-600 hover:text-purple-800 underline block ml-auto mt-1 cursor-pointer"
                                                        >
                                                            Refund
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ) : (
                            /* Payouts / Settlements Feed */
                            settlements.length === 0 ? (
                                <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-gray-200">
                                    No payout settlement requests yet.
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {settlements.map((set) => {
                                        const dest = typeof set.destination === 'string' ? JSON.parse(set.destination) : (set.destination || {});
                                        return (
                                            <div
                                                key={set.id}
                                                className="bg-white border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-full bg-[#FFF2ED] text-[#E85A24] flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                        ↑
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-gray-900 truncate font-mono">
                                                            {set.reference}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                                            {dest.phone || dest.account_number} · {new Date(set.created_at).toLocaleDateString('en-KE')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-black text-sm text-gray-900">
                                                        - {formatMoney(set.amount)} Kshs
                                                    </p>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                        {set.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </main>

            {/* WITHDRAW MODAL */}
            {isWithdrawOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white border border-gray-200 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                            <div>
                                <h4 className="font-extrabold text-base text-gray-900">Withdraw Funds</h4>
                                <p className="text-xs text-gray-500">Available: Kshs. {formatMoney(availableBalance)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsWithdrawOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500"
                            >
                                ✕
                            </button>
                        </div>

                        {availableBalance < 100 ? (
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                                Minimum withdrawal is Kshs. 100.
                            </div>
                        ) : (
                            <form onSubmit={submitWithdrawal} className="space-y-4 text-xs">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="font-bold text-gray-700">Amount (KSh)</label>
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('amount', String(availableBalance))}
                                            className="text-[#E85A24] font-bold hover:underline"
                                        >
                                            Max
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        min="100"
                                        max={availableBalance}
                                        step="0.01"
                                        value={withdrawForm.data.amount}
                                        onChange={(e) => withdrawForm.setData('amount', e.target.value)}
                                        placeholder={`100 - ${availableBalance}`}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 focus:outline-hidden focus:border-[#E85A24]"
                                        required
                                    />
                                    {isExceedingBalance && (
                                        <p className="text-red-600 text-[11px] mt-1">Exceeds available balance.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="font-bold text-gray-700 mb-1 block">Payout Channel</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('channel', 'mpesa')}
                                            className={`py-2 rounded-xl font-bold border transition ${
                                                withdrawForm.data.channel === 'mpesa'
                                                    ? 'border-[#E85A24] bg-[#FFF2ED] text-[#E85A24]'
                                                    : 'border-gray-200 bg-white text-gray-600'
                                            }`}
                                        >
                                            M-Pesa B2C
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('channel', 'bank')}
                                            className={`py-2 rounded-xl font-bold border transition ${
                                                withdrawForm.data.channel === 'bank'
                                                    ? 'border-[#E85A24] bg-[#FFF2ED] text-[#E85A24]'
                                                    : 'border-gray-200 bg-white text-gray-600'
                                            }`}
                                        >
                                            Bank Transfer
                                        </button>
                                    </div>
                                </div>

                                {withdrawForm.data.channel === 'mpesa' ? (
                                    <div>
                                        <label className="font-bold text-gray-700 mb-1 block">Recipient Phone</label>
                                        <input
                                            type="tel"
                                            value={withdrawForm.data.phone}
                                            onChange={(e) => withdrawForm.setData('phone', e.target.value)}
                                            placeholder="0712345678"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={withdrawForm.data.bank_name}
                                            onChange={(e) => withdrawForm.setData('bank_name', e.target.value)}
                                            placeholder="Bank Name"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900"
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={withdrawForm.data.account_number}
                                            onChange={(e) => withdrawForm.setData('account_number', e.target.value)}
                                            placeholder="Account Number"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900"
                                            required
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!canWithdraw || withdrawForm.processing}
                                    className="w-full bg-[#E85A24] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#d44d1a] transition disabled:opacity-40 cursor-pointer shadow-sm"
                                >
                                    {withdrawForm.processing ? 'Processing...' : 'Confirm Withdrawal'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* REFUND MODAL */}
            {refundTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white border border-gray-200 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                            <div>
                                <h4 className="font-extrabold text-base text-gray-900">Issue Refund</h4>
                                <p className="text-xs text-gray-500">Ref: {refundTarget.merchant_reference}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRefundTarget(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={confirmRefund} className="space-y-4 text-xs">
                            <p className="text-gray-600 leading-relaxed">
                                You are about to refund{' '}
                                <strong className="text-gray-900">{formatMoney(refundTarget.amount)} Kshs</strong> to the customer. This will be deducted from your wallet ledger.
                            </p>

                            <input
                                type="text"
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                placeholder="Reason (e.g. Order cancellation)"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRefundTarget(null)}
                                    className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-2/3 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition"
                                >
                                    Process Refund
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}