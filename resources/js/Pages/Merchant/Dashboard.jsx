import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';

const formatMoney = (amount) =>
    Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const isSessionExpired = (session) => {
    if (session.status !== 'pending') return false;
    const createdAt = new Date(session.created_at).getTime();
    return Date.now() - createdAt > 30 * 60 * 1000;
};

export default function MerchantDashboard({ merchant, stats, wallet = {}, sessions = [], settlements = [] }) {
    const [activeFeed, setActiveFeed] = useState('transactions');
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [refundTarget, setRefundTarget] = useState(null);
    const [refundReason, setRefundReason] = useState('');
    const [copiedVirtualId, setCopiedVirtualId] = useState(false);

    const availableBalance = Number(wallet.available_balance || 0);
    const cleanSlug = (merchant.slug || 'account').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const virtualAccountId = `EVP-${cleanSlug}`;

    const copyVirtualId = () => {
        navigator.clipboard?.writeText(virtualAccountId);
        setCopiedVirtualId(true);
        setTimeout(() => setCopiedVirtualId(false), 1800);
    };

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
        if (!canWithdraw) return;

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

    const filteredSessions = sessions.filter((s) => {
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;

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
        <div className="min-h-screen bg-[#F6F7F9] text-gray-900 flex">
            <Head title={`${merchant.name} — Merchant Wallet`} />

            {/* DESKTOP FULL-HEIGHT SIDEBAR (Hidden on mobile, flush top-to-bottom) */}
            <aside className="hidden lg:flex w-72 fixed inset-y-0 left-0 bg-white border-r border-gray-200 flex-col justify-between z-30">
                <div>
                    {/* Logo with text stacked below */}
                    <div className="px-6 py-5 border-b border-gray-200">
                        <img
                            src="/images/logo.png"
                            onError={(e) => { e.currentTarget.src = '/assets/logo.png'; }}
                            alt="Evopay"
                            className="h-8 w-auto object-contain mb-3"
                        />
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#E45C25]">
                            Merchant Portal
                        </p>
                        <p className="text-sm font-extrabold text-gray-900 truncate mt-0.5">
                            {merchant.name}
                        </p>
                    </div>

                    {/* Nav */}
                    <nav className="p-4 space-y-1">
                        <Link
                            href="/merchant"
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold bg-[#E45C25] text-white"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                            </svg>
                            <span>Wallet & Transactions</span>
                        </Link>

                        <Link
                            href="/merchant/developers"
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                        >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                            </svg>
                            <span>API Keys & Webhooks</span>
                        </Link>
                    </nav>
                </div>

                {/* Bottom Account Summary & Sign Out */}
                <div className="p-4 border-t border-gray-200 space-y-3">
                    <div className="px-3 py-2 text-xs text-gray-500">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Gateway Fee Rate
                        </span>
                        <span className="font-bold text-gray-900">{merchant.fee_percent}% per checkout</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN WALLET WORKSPACE */}
            <main className="flex-1 lg:pl-72 min-w-0 pb-24 lg:pb-12">
                <div className="max-w-lg lg:max-w-4xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-6">
                    {/* Mobile Top Brand Header (Hidden on Desktop) */}
                    <div className="lg:hidden flex items-center justify-between pb-1">
                        <div>
                            <img
                                src="/images/logo.png"
                                onError={(e) => { e.currentTarget.src = '/assets/logo.png'; }}
                                alt="Evopay"
                                className="h-7 w-auto object-contain mb-1.5"
                            />
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#E45C25]">
                                Merchant Portal
                            </p>
                            <p className="text-sm font-extrabold text-gray-900">{merchant.name}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="text-xs font-semibold text-gray-600 border border-gray-200 bg-white px-3 py-1.5 rounded-lg"
                        >
                            Sign out
                        </button>
                    </div>

                    {/* TOP SUMMARY: VIRTUAL SETTLEMENT CARD + LEDGER */}
                    <section className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                            {/* Virtual Card */}
                            <div className="md:col-span-7 bg-[#1B1D24] text-white rounded-2xl p-6 flex flex-col justify-between border border-gray-800 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-[#E45C25]" />

                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                            Evopay Virtual Card
                                        </span>
                                        <div className="flex items-baseline gap-2 mt-1.5">
                                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                                {formatMoney(availableBalance)}
                                            </h1>
                                            <span className="text-sm font-bold text-[#E45C25]">KES</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Available Balance</p>
                                    </div>

                                    {/* Card EMV Chip */}
                                    <div className="w-10 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center p-1">
                                        <div className="w-full h-full border border-white/30 rounded-xs grid grid-cols-2" />
                                    </div>
                                </div>

                                <div className="mt-7 pt-4 border-t border-white/10 flex flex-wrap items-end justify-between gap-3">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block">
                                            Virtual Account ID
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-gray-100">
                                                {virtualAccountId}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={copyVirtualId}
                                                className="text-[11px] font-semibold text-[#E45C25] hover:underline cursor-pointer"
                                            >
                                                {copiedVirtualId ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block">
                                            Account Holder
                                        </span>
                                        <span className="text-xs font-bold text-white">
                                            {merchant.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Settlement Summary + Payout CTA */}
                            <div className="md:col-span-5 bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between gap-4">
                                <div className="space-y-2.5 text-xs">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                        Settlement Summary
                                    </p>
                                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                                        <span className="text-gray-500">Gross Collected</span>
                                        <span className="font-bold text-gray-900">{formatMoney(wallet.gross_volume || 0)} KES</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                                        <span className="text-gray-500">Fees ({merchant.fee_percent}%)</span>
                                        <span className="font-semibold text-gray-700">− {formatMoney(wallet.total_fees || 0)} KES</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                                        <span className="text-gray-500">Withdrawn</span>
                                        <span className="font-semibold text-gray-700">− {formatMoney(wallet.total_withdrawn || 0)} KES</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-500">Refunded</span>
                                        <span className="font-semibold text-purple-700">− {formatMoney(wallet.total_refunded || 0)} KES</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsWithdrawOpen(true)}
                                        className="w-full bg-[#E45C25] hover:bg-[#CF501D] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition cursor-pointer"
                                    >
                                        Withdraw Funds
                                    </button>
                                    <p className="text-[11px] text-gray-400 text-center">
                                        M-Pesa B2C or Bank · Min 100 KES
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* QUICK WALLET ACTIONS */}
                    <div className="grid grid-cols-3 gap-2.5">
                        <button
                            type="button"
                            onClick={() => setIsWithdrawOpen(true)}
                            className="bg-white border border-gray-200 hover:border-[#E45C25] rounded-xl p-3 text-left transition cursor-pointer"
                        >
                            <span className="text-xs font-bold text-[#E45C25] block">Payout</span>
                            <span className="text-[11px] text-gray-500">M-Pesa / Bank</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveFeed(activeFeed === 'settlements' ? 'transactions' : 'settlements')}
                            className={`bg-white border rounded-xl p-3 text-left transition cursor-pointer ${
                                activeFeed === 'settlements' ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            <span className="text-xs font-bold text-gray-900 block">
                                {activeFeed === 'settlements' ? 'View Orders' : 'Payout History'}
                            </span>
                            <span className="text-[11px] text-gray-500">{settlements.length} requests</span>
                        </button>

                        <Link
                            href="/merchant/developers"
                            className="bg-white border border-gray-200 hover:border-gray-400 rounded-xl p-3 text-left transition"
                        >
                            <span className="text-xs font-bold text-gray-900 block">API & Webhooks</span>
                            <span className="text-[11px] text-gray-500">{stats.paid_count || 0} paid</span>
                        </Link>
                    </div>

                    {/* FEED SECTION: TRANSACTIONS vs PAYOUT HISTORY */}
                    <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        {/* Header & Search */}
                        <div className="p-4 sm:px-5 border-b border-gray-100 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-xs font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => setActiveFeed('transactions')}
                                        className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                                            activeFeed === 'transactions' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'
                                        }`}
                                    >
                                        Transactions ({sessions.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveFeed('settlements')}
                                        className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                                            activeFeed === 'settlements' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'
                                        }`}
                                    >
                                        Payouts ({settlements.length})
                                    </button>
                                </div>

                                {activeFeed === 'transactions' && (
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search receipt, ref, phone..."
                                        className="w-full sm:w-60 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#E45C25]"
                                    />
                                )}
                            </div>

                            {activeFeed === 'transactions' && (
                                <div className="flex flex-wrap gap-1.5">
                                    {['all', 'paid', 'pending', 'refunded', 'failed'].map((tab) => (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setStatusFilter(tab)}
                                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition cursor-pointer ${
                                                statusFilter === tab
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* List Body */}
                        {activeFeed === 'transactions' ? (
                            filteredSessions.length === 0 ? (
                                <div className="p-10 text-center text-xs text-gray-500">
                                    No transactions match your filter.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredSessions.map((s) => {
                                        const isPaid = s.status === 'paid';
                                        const isRefunded = s.status === 'refunded';
                                        const expired = isSessionExpired(s);

                                        return (
                                            <div
                                                key={s.id}
                                                className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-gray-50/70 transition"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            isPaid
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : isRefunded
                                                                    ? 'bg-purple-50 text-purple-700'
                                                                    : expired
                                                                        ? 'bg-gray-100 text-gray-500'
                                                                        : 'bg-[#E45C25]/10 text-[#E45C25]'
                                                        }`}
                                                    >
                                                        {isPaid ? (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
                                                            </svg>
                                                        ) : isRefunded ? (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                                                                {s.customer?.name || s.merchant_reference}
                                                            </p>
                                                            {s.payment_method && (
                                                                <span className="text-[10px] font-semibold uppercase text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                    {s.payment_method}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                                            <span className="font-mono">{s.merchant_reference}</span>
                                                            {s.mpesa_receipt ? ` · ${s.mpesa_receipt}` : ''}
                                                            {' · '}
                                                            {new Date(s.created_at).toLocaleDateString('en-KE', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <p
                                                        className={`font-bold text-xs sm:text-sm ${
                                                            isPaid
                                                                ? 'text-emerald-700'
                                                                : isRefunded
                                                                    ? 'text-purple-700'
                                                                    : expired
                                                                        ? 'text-gray-400'
                                                                        : 'text-gray-900'
                                                        }`}
                                                    >
                                                        {isPaid ? `+ ${formatMoney(s.amount)}` : formatMoney(s.amount)} {s.currency || 'KES'}
                                                    </p>

                                                    <div className="flex items-center justify-end gap-2 mt-0.5">
                                                        <span className="text-[10px] font-medium text-gray-500 capitalize">
                                                            {expired ? 'Expired' : s.status}
                                                        </span>
                                                        {isPaid && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setRefundTarget(s)}
                                                                className="text-[11px] font-semibold text-purple-600 hover:underline cursor-pointer"
                                                            >
                                                                Refund
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ) : (
                            settlements.length === 0 ? (
                                <div className="p-10 text-center text-xs text-gray-500">
                                    No withdrawal requests yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {settlements.map((set) => {
                                        const dest = typeof set.destination === 'string'
                                            ? JSON.parse(set.destination)
                                            : (set.destination || {});

                                        return (
                                            <div
                                                key={set.id}
                                                className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-gray-50/70"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-full bg-[#E45C25]/10 text-[#E45C25] flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                                        </svg>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-mono font-bold text-xs sm:text-sm text-gray-900 truncate">
                                                            {set.reference}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                                            <span className="uppercase">{set.channel}</span> · {dest.phone || dest.account_number} ·{' '}
                                                            {new Date(set.created_at).toLocaleDateString('en-KE')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-bold text-xs sm:text-sm text-gray-900">
                                                        − {formatMoney(set.amount)} {set.currency || 'KES'}
                                                    </p>
                                                    <span className="text-[10px] font-semibold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block mt-0.5">
                                                        {set.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        )}
                    </section>
                </div>
            </main>

            {/* MOBILE BOTTOM NAVIGATION (Hidden on Desktop) */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 h-15 bg-white border-t border-gray-200 px-4 grid grid-cols-3 items-center z-40">
                <button
                    type="button"
                    onClick={() => setActiveFeed('transactions')}
                    className={`flex flex-col items-center justify-center gap-0.5 ${
                        activeFeed === 'transactions' ? 'text-[#E45C25]' : 'text-gray-500'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                    </svg>
                    <span className="text-[10px] font-bold">Wallet</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveFeed('settlements')}
                    className={`flex flex-col items-center justify-center gap-0.5 ${
                        activeFeed === 'settlements' ? 'text-[#E45C25]' : 'text-gray-500'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    <span className="text-[10px] font-bold">Payouts</span>
                </button>

                <Link
                    href="/merchant/developers"
                    className="flex flex-col items-center justify-center gap-0.5 text-gray-500 hover:text-gray-900"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                    <span className="text-[10px] font-bold">API</span>
                </Link>
            </nav>

            {/* WITHDRAW MODAL */}
            {isWithdrawOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl max-w-sm w-full space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                            <div>
                                <h4 className="font-bold text-base text-gray-900">Withdraw Funds</h4>
                                <p className="text-xs text-gray-500">Available: {formatMoney(availableBalance)} KES</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsWithdrawOpen(false)}
                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {availableBalance < 100 ? (
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                                Minimum withdrawal is 100.00 KES. Your available balance is {formatMoney(availableBalance)} KES.
                            </div>
                        ) : (
                            <form onSubmit={submitWithdrawal} className="space-y-4 text-xs">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="font-semibold text-gray-700">Amount (KES)</label>
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('amount', String(availableBalance))}
                                            className="text-[#E45C25] font-bold hover:underline cursor-pointer"
                                        >
                                            Max ({formatMoney(availableBalance)})
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
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-mono border focus:outline-hidden ${
                                            isExceedingBalance
                                                ? 'border-red-500 bg-red-50 text-red-900'
                                                : 'bg-gray-50 border-gray-200 focus:border-[#E45C25]'
                                        }`}
                                        required
                                    />
                                    {isExceedingBalance && (
                                        <p className="text-red-600 text-[11px] mt-1 font-medium">
                                            Amount exceeds available balance of {formatMoney(availableBalance)} KES.
                                        </p>
                                    )}
                                    {withdrawForm.errors.amount && (
                                        <p className="text-red-600 text-[11px] mt-1">{withdrawForm.errors.amount}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="font-semibold text-gray-700 mb-1 block">Payout Channel</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('channel', 'mpesa')}
                                            className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                                                withdrawForm.data.channel === 'mpesa'
                                                    ? 'border-[#E45C25] bg-[#E45C25]/10 text-[#E45C25]'
                                                    : 'border-gray-200 bg-white text-gray-600'
                                            }`}
                                        >
                                            M-Pesa B2C
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('channel', 'bank')}
                                            className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                                                withdrawForm.data.channel === 'bank'
                                                    ? 'border-[#E45C25] bg-[#E45C25]/10 text-[#E45C25]'
                                                    : 'border-gray-200 bg-white text-gray-600'
                                            }`}
                                        >
                                            Bank Transfer
                                        </button>
                                    </div>
                                </div>

                                {withdrawForm.data.channel === 'mpesa' ? (
                                    <div>
                                        <label className="font-semibold text-gray-700 mb-1 block">M-Pesa Phone</label>
                                        <input
                                            type="tel"
                                            value={withdrawForm.data.phone}
                                            onChange={(e) => withdrawForm.setData('phone', e.target.value)}
                                            placeholder="0712345678"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-hidden focus:border-[#E45C25]"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={withdrawForm.data.bank_name}
                                            onChange={(e) => withdrawForm.setData('bank_name', e.target.value)}
                                            placeholder="Bank Name (e.g. Equity Bank)"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={withdrawForm.data.account_number}
                                            onChange={(e) => withdrawForm.setData('account_number', e.target.value)}
                                            placeholder="Account Number"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-mono"
                                            required
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!canWithdraw || withdrawForm.processing}
                                    className="w-full bg-[#E45C25] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#CF501D] transition disabled:opacity-40 cursor-pointer"
                                >
                                    {withdrawForm.processing ? 'Submitting...' : 'Confirm Withdrawal'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* REFUND MODAL */}
            {refundTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl max-w-sm w-full space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                            <div>
                                <h4 className="font-bold text-base text-gray-900">Issue Refund</h4>
                                <p className="text-xs text-gray-500">Ref: {refundTarget.merchant_reference}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRefundTarget(null)}
                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={confirmRefund} className="space-y-4 text-xs">
                            <p className="text-gray-600 leading-relaxed">
                                You are about to refund{' '}
                                <strong className="text-gray-900">{formatMoney(refundTarget.amount)} KES</strong>. This will deduct from your available balance and dispatch a signed webhook.
                            </p>

                            <input
                                type="text"
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                placeholder="Reason (e.g. Order cancellation)"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRefundTarget(null)}
                                    className="w-1/3 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-2/3 bg-purple-600 text-white py-2.5 rounded-xl font-bold hover:bg-purple-700 transition cursor-pointer"
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