import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';

const formatMoney = (amount) =>
    Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
        <div className="min-h-screen bg-[#111317] text-white flex">
            <Head title={`${merchant.name} — Evopay Wallet`} />

            {/* DESKTOP FULL-HEIGHT SIDEBAR (Completely flush top-to-bottom, hidden on mobile) */}
            <aside className="hidden lg:flex w-72 fixed inset-y-0 left-0 bg-[#181B20] border-r border-white/5 flex-col justify-between z-30">
                <div>
                    {/* Brand Header */}
                    <div className="h-20 flex items-center gap-3 px-7 border-b border-white/5">
                        <div className="w-9 h-9 rounded-xl bg-[#FF5F00] flex items-center justify-center font-black text-white text-base shadow-lg shadow-[#FF5F00]/25">
                            E
                        </div>
                        <div>
                            <span className="font-extrabold text-base tracking-tight text-white block">Evopay Wallet</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF5F00]">
                                Merchant Console
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="p-5 space-y-6">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-3 mb-2">
                                Main
                            </p>
                            <div className="space-y-1">
                                <Link
                                    href="/merchant"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-[#FF5F00] text-white shadow-md shadow-[#FF5F00]/20 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                                    </svg>
                                    <span>Wallet & Activity</span>
                                </Link>

                                <Link
                                    href="/merchant/developers"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                                    </svg>
                                    <span>API Keys & Webhooks</span>
                                </Link>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-3 mb-2">
                                Merchant Profile
                            </p>
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                                <p className="text-xs font-bold text-white truncate">{merchant.name}</p>
                                <p className="text-[11px] text-gray-400">Fee rate: {merchant.fee_percent}% / txn</p>
                                <p className="text-[11px] text-emerald-400 font-semibold pt-1">Status: Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Sign Out */}
                <div className="p-5 border-t border-white/5">
                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN APP CANVAS (Full screen mobile webview / Desktop right content) */}
            <main className="flex-1 lg:pl-72 min-w-0 pb-24 lg:pb-12">
                <div className="max-w-md lg:max-w-4xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-6">
                    {/* Top Native Mobile Header */}
                    <div className="flex items-center justify-between pb-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#FF5F00] flex items-center justify-center font-black text-xs text-white shadow-md">
                                E
                            </div>
                            <span className="font-extrabold text-base tracking-tight text-white">EVOPAY</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsWithdrawOpen(true)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 cursor-pointer"
                                title="Notifications"
                            >
                                <svg className="w-4 h-4 text-[#FF5F00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* NATIVE WALLET CARD (Matching your image with circular emblem and geometric pattern) */}
                    <div className="relative overflow-hidden rounded-3xl bg-[#1C1F26] border border-white/10 p-6 sm:p-7 shadow-2xl">
                        {/* Decorative Native Circular Motif */}
                        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full border-8 border-white/[0.04] flex items-center justify-center pointer-events-none">
                            <div className="w-28 h-28 rounded-full border-4 border-white/[0.03]" />
                        </div>

                        <div className="relative z-10 space-y-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                        Total Balance
                                    </span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                                            {formatMoney(availableBalance)}
                                        </h2>
                                        <span className="text-sm font-extrabold text-[#FF5F00]">KES</span>
                                    </div>
                                </div>

                                {/* Evopay Brand Badge */}
                                <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-3 py-1.5 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-[#FF5F00] animate-pulse" />
                                    <span className="text-[10px] font-mono font-bold text-gray-300 uppercase">Live Wallet</span>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-between items-end border-t border-white/5">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-500">Merchant Account</p>
                                    <p className="text-xs font-mono text-gray-300 tracking-wider mt-0.5">
                                        •••• •••• •••• {merchant.slug ? merchant.slug.slice(-4).toUpperCase() : '0000'}
                                    </p>
                                </div>

                                {/* Orange Contactless Icon */}
                                <div className="w-8 h-8 rounded-full bg-[#FF5F00]/15 flex items-center justify-center text-[#FF5F00]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CIRCULAR ACTION BUTTONS DOCK (Matching your design screenshot) */}
                    <div className="grid grid-cols-4 gap-3 py-1">
                        <button
                            type="button"
                            onClick={() => setIsWithdrawOpen(true)}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-full bg-[#1C1F26] border border-white/10 flex items-center justify-center text-[#FF5F00] group-hover:bg-[#FF5F00] group-hover:text-white transition shadow-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-bold text-gray-300">Withdraw</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveFeed(activeFeed === 'settlements' ? 'transactions' : 'settlements')}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-full bg-[#1C1F26] border border-white/10 flex items-center justify-center text-[#32BB78] group-hover:bg-[#32BB78] group-hover:text-white transition shadow-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-bold text-gray-300">
                                {activeFeed === 'settlements' ? 'Orders' : 'Settlements'}
                            </span>
                        </button>

                        <Link
                            href="/merchant/developers"
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-14 h-14 rounded-full bg-[#1C1F26] border border-white/10 flex items-center justify-center text-gray-300 group-hover:bg-white group-hover:text-black transition shadow-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-bold text-gray-300">API Keys</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-full bg-[#1C1F26] border border-white/10 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition shadow-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-bold text-gray-300">Sign Out</span>
                        </button>
                    </div>

                    {/* TRANSACTIONS FEED HEADER */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-extrabold text-white">
                                {activeFeed === 'transactions' ? 'Transactions' : 'Withdrawal Settlements'}
                            </h3>
                            <span className="text-xs text-gray-400">
                                {activeFeed === 'transactions' ? `${filteredSessions.length} total` : `${settlements.length} total`}
                            </span>
                        </div>

                        {/* Search Bar for transactions */}
                        {activeFeed === 'transactions' && (
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search customer, M-Pesa receipt, ref..."
                                className="w-full bg-[#1C1F26] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-[#FF5F00]"
                            />
                        )}

                        {/* FEED LIST (Native app style like the image screenshot) */}
                        {activeFeed === 'transactions' ? (
                            filteredSessions.length === 0 ? (
                                <div className="p-8 text-center text-xs text-gray-500 bg-[#1C1F26] rounded-2xl border border-white/5">
                                    No transaction activity yet.
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {filteredSessions.map((s) => {
                                        const isPaid = s.status === 'paid';
                                        const isRefunded = s.status === 'refunded';

                                        return (
                                            <div
                                                key={s.id}
                                                className="bg-[#1C1F26] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3"
                                            >
                                                {/* Left Icon */}
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div
                                                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                                            isPaid
                                                                ? 'bg-[#32BB78] text-white shadow-md shadow-[#32BB78]/25'
                                                                : isRefunded
                                                                    ? 'bg-purple-600 text-white'
                                                                    : 'bg-[#FF5F00] text-white'
                                                        }`}
                                                    >
                                                        {isPaid ? '✓' : isRefunded ? 'R' : 'P'}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-white truncate">
                                                            {s.customer?.name || s.merchant_reference}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
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

                                                {/* Right Amount & Actions */}
                                                <div className="text-right flex-shrink-0">
                                                    <p
                                                        className={`font-black text-sm ${
                                                            isPaid
                                                                ? 'text-[#32BB78]'
                                                                : isRefunded
                                                                    ? 'text-purple-400'
                                                                    : 'text-amber-400'
                                                        }`}
                                                    >
                                                        {isPaid ? `+ ${formatMoney(s.amount)} KES` : `${formatMoney(s.amount)} KES`}
                                                    </p>

                                                    {isPaid && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setRefundTarget(s)}
                                                            className="text-[10px] font-bold text-gray-400 hover:text-purple-400 underline mt-0.5 cursor-pointer block ml-auto"
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
                            /* Payout Settlements List */
                            settlements.length === 0 ? (
                                <div className="p-8 text-center text-xs text-gray-500 bg-[#1C1F26] rounded-2xl border border-white/5">
                                    No payout settlement requests yet.
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {settlements.map((set) => {
                                        const dest = typeof set.destination === 'string' ? JSON.parse(set.destination) : (set.destination || {});
                                        return (
                                            <div
                                                key={set.id}
                                                className="bg-[#1C1F26] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3"
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className="w-11 h-11 rounded-full bg-[#FF5F00] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md shadow-[#FF5F00]/25">
                                                        ↑
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-white truncate font-mono">
                                                            {set.reference}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                                            {dest.phone || dest.account_number} · {new Date(set.created_at).toLocaleDateString('en-KE')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-black text-sm text-[#FF5F00]">
                                                        - {formatMoney(set.amount)} KES
                                                    </p>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full mt-1 inline-block">
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

            {/* STICKY BOTTOM APP BAR FOR MOBILE PHONES (Hidden on Desktop) */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-[#181B20] border-t border-white/10 px-6 flex items-center justify-between z-40">
                <button
                    type="button"
                    onClick={() => setActiveFeed('transactions')}
                    className={`flex flex-col items-center gap-1 ${activeFeed === 'transactions' ? 'text-[#FF5F00]' : 'text-gray-500'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span className="text-[10px] font-bold">Wallet</span>
                </button>

                {/* Floating Orange Center Action Button */}
                <button
                    type="button"
                    onClick={() => setIsWithdrawOpen(true)}
                    className="-mt-7 w-13 h-13 rounded-full bg-[#FF5F00] text-white flex items-center justify-center shadow-lg shadow-[#FF5F00]/50 border-4 border-[#111317] cursor-pointer"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>

                <Link
                    href="/merchant/developers"
                    className="flex flex-col items-center gap-1 text-gray-500 hover:text-white"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                    <span className="text-[10px] font-bold">API</span>
                </Link>
            </nav>

            {/* WITHDRAW MODAL */}
            {isWithdrawOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
                    <div className="bg-[#1C1F26] border border-white/10 p-6 rounded-3xl max-w-sm w-full space-y-4 text-white">
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                            <div>
                                <h4 className="font-extrabold text-base">Withdraw Funds</h4>
                                <p className="text-xs text-gray-400">Available: {formatMoney(availableBalance)} KES</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsWithdrawOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400"
                            >
                                ✕
                            </button>
                        </div>

                        {availableBalance < 100 ? (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                                Minimum withdrawal is 100 KES. Your balance is {formatMoney(availableBalance)} KES.
                            </div>
                        ) : (
                            <form onSubmit={submitWithdrawal} className="space-y-4 text-xs">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="font-bold text-gray-300">Amount (KES)</label>
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('amount', String(availableBalance))}
                                            className="text-[#FF5F00] font-bold hover:underline"
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
                                        className="w-full bg-[#121418] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-hidden focus:border-[#FF5F00]"
                                        required
                                    />
                                    {isExceedingBalance && (
                                        <p className="text-red-400 text-[11px] mt-1">Exceeds available balance.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="font-bold text-gray-300 mb-1 block">Payout Channel</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('channel', 'mpesa')}
                                            className={`py-2 rounded-xl font-bold border transition ${
                                                withdrawForm.data.channel === 'mpesa'
                                                    ? 'border-[#FF5F00] bg-[#FF5F00]/10 text-[#FF5F00]'
                                                    : 'border-white/10 bg-white/5 text-gray-400'
                                            }`}
                                        >
                                            M-Pesa B2C
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('channel', 'bank')}
                                            className={`py-2 rounded-xl font-bold border transition ${
                                                withdrawForm.data.channel === 'bank'
                                                    ? 'border-[#FF5F00] bg-[#FF5F00]/10 text-[#FF5F00]'
                                                    : 'border-white/10 bg-white/5 text-gray-400'
                                            }`}
                                        >
                                            Bank Transfer
                                        </button>
                                    </div>
                                </div>

                                {withdrawForm.data.channel === 'mpesa' ? (
                                    <div>
                                        <label className="font-bold text-gray-300 mb-1 block">M-Pesa Phone</label>
                                        <input
                                            type="tel"
                                            value={withdrawForm.data.phone}
                                            onChange={(e) => withdrawForm.setData('phone', e.target.value)}
                                            placeholder="0712345678"
                                            className="w-full bg-[#121418] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={withdrawForm.data.bank_name}
                                            onChange={(e) => withdrawForm.setData('bank_name', e.target.value)}
                                            placeholder="Bank Name (e.g. Equity)"
                                            className="w-full bg-[#121418] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={withdrawForm.data.account_number}
                                            onChange={(e) => withdrawForm.setData('account_number', e.target.value)}
                                            placeholder="Account Number"
                                            className="w-full bg-[#121418] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white"
                                            required
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!canWithdraw || withdrawForm.processing}
                                    className="w-full bg-[#FF5F00] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#e05400] transition disabled:opacity-40 cursor-pointer shadow-lg shadow-[#FF5F00]/25"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
                    <div className="bg-[#1C1F26] border border-white/10 p-6 rounded-3xl max-w-sm w-full space-y-4 text-white">
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                            <div>
                                <h4 className="font-extrabold text-base">Issue Refund</h4>
                                <p className="text-xs text-gray-400">Ref: {refundTarget.merchant_reference}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRefundTarget(null)}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={confirmRefund} className="space-y-4 text-xs">
                            <p className="text-gray-300 leading-relaxed">
                                You are about to refund{' '}
                                <strong className="text-white">{formatMoney(refundTarget.amount)} KES</strong>. This will deduct from your available balance and trigger a signed webhook.
                            </p>

                            <input
                                type="text"
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                placeholder="Reason (e.g. Order cancellation)"
                                className="w-full bg-[#121418] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRefundTarget(null)}
                                    className="w-1/3 bg-white/10 text-gray-300 py-3 rounded-xl font-bold"
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