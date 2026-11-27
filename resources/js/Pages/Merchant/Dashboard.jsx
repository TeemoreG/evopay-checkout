import { useMemo, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';

const formatMoney = (amount) =>
    Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const isSessionExpired = (session) => {
    if (session.status !== 'pending') return false;
    const createdAt = new Date(session.created_at).getTime();
    return Date.now() - createdAt > 30 * 60 * 1000;
};

export default function MerchantDashboard({ merchant, stats, wallet = {}, sessions = [], settlements = [] }) {
    const [activeFeed, setActiveFeed] = useState('transactions'); // 'transactions' | 'settlements' | 'profile'
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState('');
    const [showBalance, setShowBalance] = useState(true);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
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

    // Real sparkline curve from last 8 paid sessions
    const sparklinePoints = useMemo(() => {
        const paid = sessions
            .filter((s) => s.status === 'paid')
            .slice(0, 8)
            .reverse()
            .map((s) => Number(s.amount || 0));

        if (paid.length < 2) {
            return { line: 'M0 38 L240 38', area: 'M0 38 L240 38 L240 48 L0 48 Z' };
        }

        const max = Math.max(...paid, 1);
        const min = Math.min(...paid, 0);
        const span = max - min || 1;
        const stepX = 240 / (paid.length - 1);

        const coords = paid.map((val, idx) => {
            const x = +(idx * stepX).toFixed(1);
            const y = +(40 - ((val - min) / span) * 30).toFixed(1);
            return [x, y];
        });

        let line = `M${coords[0][0]} ${coords[0][1]}`;
        for (let i = 1; i < coords.length; i++) {
            const prev = coords[i - 1];
            const curr = coords[i];
            const midX = +((prev[0] + curr[0]) / 2).toFixed(1);
            line += ` C${midX} ${prev[1]}, ${midX} ${curr[1]}, ${curr[0]} ${curr[1]}`;
        }

        const area = `${line} L240 48 L0 48 Z`;
        return { line, area };
    }, [sessions]);

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

    const setPresetAmount = (fraction) => {
        const val = Math.floor(availableBalance * fraction * 100) / 100;
        withdrawForm.setData('amount', String(val));
    };

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
                    setSelectedSession(null);
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

    const exportCsv = () => {
        const rows = [
            ['Reference', 'Token', 'Customer', 'Phone', 'Amount', 'Currency', 'Method', 'Receipt', 'Status', 'Date'],
            ...filteredSessions.map((s) => [
                s.merchant_reference || '',
                s.token || '',
                s.customer?.name || '',
                s.customer?.phone || '',
                s.amount,
                s.currency || 'KES',
                s.payment_method || '',
                s.mpesa_receipt || '',
                isSessionExpired(s) ? 'expired' : s.status,
                s.created_at,
            ]),
        ];

        const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cleanSlug.toLowerCase()}-transactions.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#F6F7F9] text-gray-900 flex">
            <Head title={`${merchant.name} — Evopay Wallet`} />

            {/* DESKTOP FULL-HEIGHT SIDEBAR */}
            <aside className="hidden lg:flex w-72 fixed inset-y-0 left-0 bg-white border-r border-gray-200 flex-col justify-between z-30">
                <div>
                    {/* Centered Logo Only */}
                    <div className="h-20 px-6 border-b border-gray-200 flex items-center justify-center">
                        <img
                            src="/images/logo.png"
                            onError={(e) => { e.currentTarget.src = '/assets/logo.png'; }}
                            alt="Evopay"
                            className="h-9 w-auto object-contain"
                        />
                    </div>

                    <nav className="p-4 space-y-1">
                        <button
                            type="button"
                            onClick={() => setActiveFeed('transactions')}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                activeFeed === 'transactions'
                                    ? 'bg-[#E45C25] text-white font-bold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                            </svg>
                            <span>Wallet & Transactions</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveFeed('settlements')}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                activeFeed === 'settlements'
                                    ? 'bg-[#E45C25] text-white font-bold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                            <span>Payout History</span>
                        </button>

                        <Link
                            href="/merchant/developers"
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                        >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                            </svg>
                            <span>API Keys & Webhooks</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setActiveFeed('profile')}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                activeFeed === 'profile'
                                    ? 'bg-[#E45C25] text-white font-bold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            <span>Profile & Account</span>
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <div className="px-3 py-2 text-xs text-gray-500">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Gateway Fee Rate
                        </span>
                        <span className="font-bold text-gray-900">{merchant.fee_percent}% per checkout</span>
                    </div>
                </div>
            </aside>

            {/* MAIN WALLET WORKSPACE */}
            <main className="flex-1 lg:pl-72 min-w-0 pb-24 lg:pb-12">
                <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-5">
                    {/* Mobile Centered Logo Header */}
                    <div className="lg:hidden flex items-center justify-center py-1">
                        <img
                            src="/images/logo.png"
                            onError={(e) => { e.currentTarget.src = '/assets/logo.png'; }}
                            alt="Evopay"
                            className="h-8 w-auto object-contain"
                        />
                    </div>

                    {activeFeed === 'profile' ? (
                        /* PROFILE TAB (Includes Account Details & Sign Out) */
                        <section className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-[#E45C25]/10 text-[#E45C25] font-black text-base flex items-center justify-center">
                                        {(merchant.name || 'M').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-extrabold text-gray-900">{merchant.name}</h1>
                                        <p className="text-xs font-mono text-gray-500">{virtualAccountId}</p>
                                    </div>
                                </div>

                                <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Active
                                </span>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3 text-xs">
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                                        Virtual Account ID
                                    </span>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="font-mono font-bold text-gray-900">{virtualAccountId}</span>
                                        <button
                                            type="button"
                                            onClick={copyVirtualId}
                                            className="p-1 text-gray-500 hover:text-[#E45C25] cursor-pointer"
                                            title="Copy Virtual Account ID"
                                        >
                                            {copiedVirtualId ? (
                                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                                        Gateway Fee Rate
                                    </span>
                                    <span className="font-bold text-gray-900 mt-1 block">{merchant.fee_percent}% per paid checkout</span>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                                        Successful Payments
                                    </span>
                                    <span className="font-bold text-gray-900 mt-1 block">{stats.paid_count || 0} of {stats.total_count || 0} sessions</span>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                                        Available Wallet Balance
                                    </span>
                                    <span className="font-bold text-gray-900 mt-1 block">{formatMoney(availableBalance)} KES</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/merchant/developers"
                                    className="flex-1 text-center border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-bold text-xs py-3 rounded-xl transition"
                                >
                                    Manage API Keys & Webhooks
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => router.post('/logout')}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                    </svg>
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </section>
                    ) : (
                        <>
                            {/* TOP SECTION: VIRTUAL CARD + SETTLEMENT SUMMARY */}
                            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                                {/* Evopay Virtual Card */}
                                <div className="lg:col-span-7 bg-[#14171D] text-white rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden border border-gray-800">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-[11px] font-medium text-gray-400 block">
                                                Virtual Account
                                            </span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-gray-200">
                                                    {virtualAccountId}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={copyVirtualId}
                                                    className="p-1 rounded-md text-gray-400 hover:text-[#E45C25] hover:bg-white/10 transition cursor-pointer"
                                                    title={copiedVirtualId ? 'Copied' : 'Copy Virtual Account ID'}
                                                    aria-label="Copy Virtual Account ID"
                                                >
                                                    {copiedVirtualId ? (
                                                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="font-black text-base sm:text-lg tracking-tight text-white">
                                                EVO<span className="text-[#E45C25]">PAY</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Real Activity Sparkline from Paid Sessions */}
                                    <div className="my-3 h-12 w-full">
                                        <svg viewBox="0 0 240 48" preserveAspectRatio="none" className="w-full h-full">
                                            <defs>
                                                <linearGradient id="evopayCardChart" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
                                                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>
                                            <path d={sparklinePoints.area} fill="url(#evopayCardChart)" />
                                            <path d={sparklinePoints.line} fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.6" />
                                        </svg>
                                    </div>

                                    {/* Balance + Eye Toggle + Primary Tag */}
                                    <div className="flex items-end justify-between gap-3">
                                        <div>
                                            <span className="text-[11px] text-gray-400 block">
                                                Available Balance
                                            </span>
                                            <div className="flex items-center gap-2.5 mt-0.5">
                                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                                    {showBalance ? `${formatMoney(availableBalance)} KES` : '•••••• KES'}
                                                </h1>

                                                <button
                                                    type="button"
                                                    onClick={() => setShowBalance((v) => !v)}
                                                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition cursor-pointer"
                                                    title={showBalance ? 'Hide balance' : 'Check balance'}
                                                    aria-label={showBalance ? 'Hide balance' : 'Check balance'}
                                                >
                                                    {showBalance ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <span className="bg-white text-gray-900 text-[10px] font-bold px-3 py-1 rounded-full">
                                            Primary
                                        </span>
                                    </div>
                                </div>

                                {/* Right Settlement Summary */}
                                <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 p-5 flex flex-col justify-between gap-4">
                                    <div className="space-y-2.5 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                                Wallet Ledger
                                            </span>
                                            <span className="text-[11px] font-semibold text-gray-500">
                                                {stats.paid_count || 0} paid txns
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                                            <span className="text-gray-500">Gross Collected</span>
                                            <span className="font-bold text-gray-900">
                                                {showBalance ? `${formatMoney(wallet.gross_volume || 0)} KES` : '••••••'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                                            <span className="text-gray-500">Fees ({merchant.fee_percent}%)</span>
                                            <span className="font-semibold text-gray-700">
                                                {showBalance ? `− ${formatMoney(wallet.total_fees || 0)} KES` : '••••••'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                                            <span className="text-gray-500">Withdrawn</span>
                                            <span className="font-semibold text-gray-700">
                                                {showBalance ? `− ${formatMoney(wallet.total_withdrawn || 0)} KES` : '••••••'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-500">Refunded</span>
                                            <span className="font-semibold text-purple-700">
                                                {showBalance ? `− ${formatMoney(wallet.total_refunded || 0)} KES` : '••••••'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setIsWithdrawOpen(true)}
                                            className="bg-[#E45C25] hover:bg-[#CF501D] text-white font-bold text-xs py-3 px-4 rounded-full transition cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                            </svg>
                                            <span>Withdraw</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setActiveFeed(activeFeed === 'settlements' ? 'transactions' : 'settlements')}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs py-3 px-4 rounded-full transition cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <span>{activeFeed === 'settlements' ? 'Transactions' : 'Payouts'}</span>
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* TRANSACTIONS / PAYOUTS LIST */}
                            <section className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                                <div className="p-4 sm:px-6 border-b border-gray-100 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-base font-extrabold text-gray-900">
                                                {activeFeed === 'transactions' ? 'Transactions' : 'Payout History'}
                                            </h2>
                                            <span className="text-xs font-semibold text-gray-400">
                                                ({activeFeed === 'transactions' ? filteredSessions.length : settlements.length})
                                            </span>
                                        </div>

                                        {activeFeed === 'transactions' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={exportCsv}
                                                    disabled={filteredSessions.length === 0}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer"
                                                >
                                                    <span>Export CSV</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setShowFilters((v) => !v)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                                                        showFilters || statusFilter !== 'all' || search
                                                            ? 'border-[#E45C25] text-[#E45C25] bg-[#E45C25]/5'
                                                            : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span>Filters</span>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18M6 12h12m-9 7.5h6" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {activeFeed === 'transactions' && showFilters && (
                                        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                            <div className="flex flex-wrap gap-1.5">
                                                {['all', 'paid', 'pending', 'refunded', 'failed'].map((tab) => (
                                                    <button
                                                        key={tab}
                                                        type="button"
                                                        onClick={() => setStatusFilter(tab)}
                                                        className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize transition cursor-pointer ${
                                                            statusFilter === tab
                                                                ? 'bg-gray-900 text-white'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {tab}
                                                    </button>
                                                ))}
                                            </div>

                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search receipt, ref, phone..."
                                                className="w-full sm:w-60 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#E45C25]"
                                            />
                                        </div>
                                    )}
                                </div>

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
                                                        onClick={() => setSelectedSession(s)}
                                                        className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-gray-50/70 transition cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3.5 min-w-0">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                                                                {isPaid ? (
                                                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                                                    </svg>
                                                                ) : isRefunded ? (
                                                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                                                                    {s.customer?.name || s.merchant_reference}
                                                                </p>
                                                                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                                                    {new Date(s.created_at).toLocaleDateString('en-KE', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                    })}{' '}
                                                                    |{' '}
                                                                    {new Date(s.created_at).toLocaleTimeString('en-KE', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                    {s.mpesa_receipt ? ` · ${s.mpesa_receipt}` : ''}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="text-right flex-shrink-0">
                                                            <p
                                                                className={`font-bold text-xs sm:text-sm ${
                                                                    isPaid
                                                                        ? 'text-emerald-600'
                                                                        : isRefunded
                                                                            ? 'text-purple-600'
                                                                            : expired
                                                                                ? 'text-gray-400'
                                                                                : 'text-gray-900'
                                                                }`}
                                                            >
                                                                {isPaid ? `+ ${formatMoney(s.amount)}` : isRefunded ? `− ${formatMoney(s.amount)}` : formatMoney(s.amount)} {s.currency || 'KES'}
                                                            </p>

                                                            <div className="flex items-center justify-end gap-2 mt-0.5">
                                                                <span className="text-[10px] font-medium text-gray-400 capitalize">
                                                                    {expired ? 'Expired' : s.status}
                                                                </span>
                                                                {isPaid && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setRefundTarget(s);
                                                                        }}
                                                                        className="text-[11px] font-semibold text-[#E45C25] hover:underline cursor-pointer"
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
                                                        className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-gray-50/70"
                                                    >
                                                        <div className="flex items-center gap-3.5 min-w-0">
                                                            <div className="w-10 h-10 rounded-xl bg-[#E45C25]/10 text-[#E45C25] flex items-center justify-center flex-shrink-0">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
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
                                                            <p className="font-bold text-xs sm:text-sm text-[#E45C25]">
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
                        </>
                    )}
                </div>
            </main>

            {/* MOBILE BOTTOM NAVIGATION (4 Tabs: Wallet, Payouts, API, Profile) */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 h-15 bg-white border-t border-gray-200 px-2 grid grid-cols-4 items-center z-40">
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

                <button
                    type="button"
                    onClick={() => setActiveFeed('profile')}
                    className={`flex flex-col items-center justify-center gap-0.5 ${
                        activeFeed === 'profile' ? 'text-[#E45C25]' : 'text-gray-500'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-[10px] font-bold">Profile</span>
                </button>
            </nav>

            {/* TRANSACTION DETAIL MODAL */}
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl max-w-sm w-full space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                            <div>
                                <h4 className="font-bold text-base text-gray-900">Transaction Receipt</h4>
                                <p className="text-xs font-mono text-gray-500">{selectedSession.merchant_reference}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedSession(null)}
                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                                <span className="text-gray-500">Amount</span>
                                <span className="font-extrabold text-gray-900">
                                    {formatMoney(selectedSession.amount)} {selectedSession.currency || 'KES'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                                <span className="text-gray-500">Status</span>
                                <span className="font-bold uppercase text-gray-900">
                                    {isSessionExpired(selectedSession) ? 'expired' : selectedSession.status}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                                <span className="text-gray-500">Customer</span>
                                <span className="font-semibold text-gray-900">{selectedSession.customer?.name || '—'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                                <span className="text-gray-500">Phone / Email</span>
                                <span className="font-medium text-gray-900">
                                    {selectedSession.customer?.phone || selectedSession.customer?.email || '—'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                                <span className="text-gray-500">Channel</span>
                                <span className="font-semibold uppercase text-gray-900">{selectedSession.payment_method || '—'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                                <span className="text-gray-500">Receipt</span>
                                <span className="font-mono font-semibold text-emerald-700">{selectedSession.mpesa_receipt || '—'}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">Session Token</span>
                                <span className="font-mono text-gray-600">{selectedSession.token}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            {selectedSession.status === 'paid' && (
                                <button
                                    type="button"
                                    onClick={() => setRefundTarget(selectedSession)}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                                >
                                    Issue Refund
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setSelectedSession(null)}
                                className="flex-1 bg-gray-100 text-gray-800 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* WITHDRAW MODAL (with 25%, 50%, Max Presets) */}
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
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="font-semibold text-gray-700">Amount (KES)</label>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setPresetAmount(0.25)}
                                                className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 font-semibold text-gray-700 cursor-pointer"
                                            >
                                                25%
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPresetAmount(0.5)}
                                                className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 font-semibold text-gray-700 cursor-pointer"
                                            >
                                                50%
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPresetAmount(1)}
                                                className="px-2 py-0.5 rounded bg-[#E45C25]/10 text-[#E45C25] font-bold cursor-pointer"
                                            >
                                                Max
                                            </button>
                                        </div>
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