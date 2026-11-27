import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

const formatMoney = (amount, currency = 'KES') =>
    `${currency} ` + Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });

const statusStyles = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function MerchantDashboard({ merchant, stats, wallet = {}, sessions = [], settlements = [] }) {
    const [activeSection, setActiveSection] = useState('transactions'); // 'transactions' or 'settlements'
    const [filter, setFilter] = useState('all');
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
        if (filter !== 'all' && s.status !== filter) return false;

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
        <MainLayout minimal>
            <Head title={`${merchant.name} — Merchant Console`} />

            <div className="flex flex-col lg:flex-row gap-6 items-start max-w-7xl mx-auto">
                {/* Desktop Left Navigation Sidebar (Hidden on Mobile) */}
                <aside className="hidden lg:block w-60 bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2 flex-shrink-0">
                    <div className="p-3 mb-1 border-b border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">Merchant Console</p>
                        <h2 className="text-sm font-extrabold text-brand-dark truncate mt-0.5">{merchant.name}</h2>
                        <p className="text-[11px] text-gray-400">Fee: {merchant.fee_percent}% / transaction</p>
                    </div>

                    <Link
                        href="/merchant"
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-brand-dark text-white shadow-xs"
                    >
                        <span>Wallet & Transactions</span>
                    </Link>

                    <Link
                        href="/merchant/developers"
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-gray-600 hover:text-brand-dark hover:bg-gray-50 transition"
                    >
                        <span>API Keys & Webhooks</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 transition cursor-pointer mt-4"
                    >
                        Sign Out
                    </button>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0 space-y-6">
                    {/* Modern Clean Flat Mobile Wallet Card (No Gradients) */}
                    <div className="bg-white rounded-3xl border-2 border-gray-200 p-6 sm:p-7 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                        Settlement Wallet
                                    </span>
                                    <span className="text-xs text-gray-400">· {merchant.name}</span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium mt-1">Available for Payout</p>
                                <h1 className="text-3xl sm:text-4xl font-black text-brand-dark mt-0.5 tracking-tight">
                                    {formatMoney(availableBalance)}
                                </h1>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsWithdrawOpen(true)}
                                disabled={availableBalance < 100}
                                className="bg-brand-primary text-white py-3 px-6 rounded-2xl font-extrabold text-xs sm:text-sm hover:bg-brand-secondary transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer self-start sm:self-center"
                            >
                                {availableBalance < 100 ? 'Min KES 100 to Payout' : 'Request Payout →'}
                            </button>
                        </div>

                        {/* Wallet Ledger Breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 text-xs">
                            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                <span className="block text-[10px] font-bold uppercase text-gray-400">Gross Paid</span>
                                <span className="text-sm font-extrabold text-brand-dark mt-0.5 block">{formatMoney(wallet.gross_volume || 0)}</span>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                <span className="block text-[10px] font-bold uppercase text-gray-400">Platform Fees</span>
                                <span className="text-sm font-extrabold text-gray-700 mt-0.5 block">{formatMoney(wallet.total_fees || 0)}</span>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                <span className="block text-[10px] font-bold uppercase text-gray-400">Total Settled</span>
                                <span className="text-sm font-extrabold text-gray-700 mt-0.5 block">{formatMoney(wallet.total_withdrawn || 0)}</span>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                <span className="block text-[10px] font-bold uppercase text-purple-600">Refunds Issued</span>
                                <span className="text-sm font-extrabold text-purple-700 mt-0.5 block">{formatMoney(wallet.total_refunded || 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section Switcher Tabs: Inbound Transactions vs Withdrawal Payouts */}
                    <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
                        <div className="inline-flex gap-1.5 bg-gray-100 p-1 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setActiveSection('transactions')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                    activeSection === 'transactions'
                                        ? 'bg-white text-brand-dark shadow-xs'
                                        : 'text-gray-600 hover:text-brand-dark'
                                }`}
                            >
                                Checkout Sessions ({sessions.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveSection('settlements')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                    activeSection === 'settlements'
                                        ? 'bg-white text-brand-dark shadow-xs'
                                        : 'text-gray-600 hover:text-brand-dark'
                                }`}
                            >
                                Payout History ({settlements.length})
                            </button>
                        </div>
                    </div>

                    {/* SECTION 1: Inbound Checkout Transactions Table */}
                    {activeSection === 'transactions' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200">
                                    {['all', 'paid', 'pending', 'refunded', 'failed'].map((tab) => (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setFilter(tab)}
                                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition cursor-pointer ${
                                                filter === tab
                                                    ? 'bg-brand-dark text-white'
                                                    : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
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
                                    placeholder="Search reference, receipt, customer..."
                                    className="w-full sm:w-64 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs"
                                />
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                                {filteredSessions.length === 0 ? (
                                    <div className="p-10 text-center text-sm text-gray-500">
                                        No checkout transactions found.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase text-gray-500">
                                                <tr>
                                                    <th className="py-3 px-4">Reference</th>
                                                    <th className="py-3 px-4">Customer</th>
                                                    <th className="py-3 px-4">Amount</th>
                                                    <th className="py-3 px-4">Channel</th>
                                                    <th className="py-3 px-4">Receipt</th>
                                                    <th className="py-3 px-4">Status</th>
                                                    <th className="py-3 px-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-xs">
                                                {filteredSessions.map((s) => (
                                                    <tr key={s.id} className="hover:bg-gray-50/70 transition">
                                                        <td className="py-3.5 px-4">
                                                            <p className="font-bold text-brand-dark">{s.merchant_reference}</p>
                                                            <p className="text-[10px] font-mono text-gray-400">{s.token}</p>
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <p className="font-medium text-brand-dark">{s.customer?.name || '—'}</p>
                                                            <p className="text-[11px] text-gray-500">{s.customer?.phone || s.customer?.email || '—'}</p>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-bold text-brand-dark whitespace-nowrap">
                                                            {formatMoney(s.amount, s.currency)}
                                                        </td>
                                                        <td className="py-3.5 px-4 uppercase text-[11px] font-semibold text-gray-600">
                                                            {s.payment_method || '—'}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">
                                                            {s.mpesa_receipt || '—'}
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyles[s.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                                {s.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right">
                                                            {s.status === 'paid' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setRefundTarget(s)}
                                                                    className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
                                                                >
                                                                    Refund
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: Withdrawal Payout History Table */}
                    {activeSection === 'settlements' && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                            {settlements.length === 0 ? (
                                <div className="p-10 text-center text-sm text-gray-500">
                                    No withdrawal requests placed yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase text-gray-500">
                                            <tr>
                                                <th className="py-3 px-4">Reference</th>
                                                <th className="py-3 px-4">Amount</th>
                                                <th className="py-3 px-4">Channel</th>
                                                <th className="py-3 px-4">Destination</th>
                                                <th className="py-3 px-4">Status</th>
                                                <th className="py-3 px-4">Requested Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs">
                                            {settlements.map((set) => {
                                                const dest = typeof set.destination === 'string' ? JSON.parse(set.destination) : (set.destination || {});
                                                return (
                                                    <tr key={set.id} className="hover:bg-gray-50/70">
                                                        <td className="py-3.5 px-4 font-mono font-bold text-brand-dark">
                                                            {set.reference}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-bold text-brand-dark">
                                                            {formatMoney(set.amount, set.currency)}
                                                        </td>
                                                        <td className="py-3.5 px-4 uppercase text-[11px] font-semibold text-gray-600">
                                                            {set.channel}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono text-gray-700">
                                                            {dest.phone || dest.account_number ? `${dest.bank_name ? dest.bank_name + ' · ' : ''}${dest.phone || dest.account_number}` : '—'}
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                                                {set.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-gray-500">
                                                            {new Date(set.created_at).toLocaleString('en-KE')}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* WITHDRAWAL MODAL */}
            {isWithdrawOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                            <div>
                                <h3 className="text-base font-extrabold text-brand-dark">Withdraw Funds</h3>
                                <p className="text-xs text-gray-500">
                                    Available:{' '}
                                    <strong className="text-emerald-700">{formatMoney(availableBalance)}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsWithdrawOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {availableBalance < 100 ? (
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                                You need at least KES 100 to request a payout. Your current balance is {formatMoney(availableBalance)}.
                            </div>
                        ) : (
                            <form onSubmit={submitWithdrawal} className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs font-semibold text-brand-dark">Amount (KES) *</label>
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('amount', String(availableBalance))}
                                            className="text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
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
                                        className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono border ${
                                            isExceedingBalance
                                                ? 'border-red-500 bg-red-50 text-red-900'
                                                : 'bg-gray-50 border-gray-200'
                                        }`}
                                        required
                                    />
                                    {isExceedingBalance && (
                                        <p className="text-xs text-red-600 mt-1 font-semibold">
                                            Exceeds available balance of {formatMoney(availableBalance)}.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Channel *</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('channel', 'mpesa')}
                                            className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                                withdrawForm.data.channel === 'mpesa'
                                                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                                                    : 'border-gray-200 bg-white text-gray-600'
                                            }`}
                                        >
                                            M-Pesa B2C
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('channel', 'bank')}
                                            className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                                withdrawForm.data.channel === 'bank'
                                                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                                                    : 'border-gray-200 bg-white text-gray-600'
                                            }`}
                                        >
                                            Bank Transfer
                                        </button>
                                    </div>
                                </div>

                                {withdrawForm.data.channel === 'mpesa' ? (
                                    <div>
                                        <label className="block text-xs font-semibold text-brand-dark mb-1">M-Pesa Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={withdrawForm.data.phone}
                                            onChange={(e) => withdrawForm.setData('phone', e.target.value)}
                                            placeholder="0712345678"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">Bank Name *</label>
                                            <input
                                                type="text"
                                                value={withdrawForm.data.bank_name}
                                                onChange={(e) => withdrawForm.setData('bank_name', e.target.value)}
                                                placeholder="e.g. Equity Bank"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">Account Number *</label>
                                            <input
                                                type="text"
                                                value={withdrawForm.data.account_number}
                                                onChange={(e) => withdrawForm.setData('account_number', e.target.value)}
                                                placeholder="0123456789"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!canWithdraw || withdrawForm.processing}
                                    className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {withdrawForm.processing ? 'Submitting...' : `Withdraw ${formatMoney(requestedAmount)}`}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* REFUND MODAL */}
            {refundTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                            <div>
                                <h3 className="text-base font-extrabold text-brand-dark">Confirm Refund</h3>
                                <p className="text-xs text-gray-500">Ref: {refundTarget.merchant_reference}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRefundTarget(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={confirmRefund} className="space-y-4">
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Issue refund of{' '}
                                <strong className="text-brand-dark">{formatMoney(refundTarget.amount, refundTarget.currency)}</strong> to the customer. This will deduct from your available balance.
                            </p>

                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Reason for Refund</label>
                                <input
                                    type="text"
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="e.g. Order cancellation"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRefundTarget(null)}
                                    className="w-1/3 bg-gray-100 text-brand-dark py-3 rounded-xl font-bold text-xs cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-2/3 bg-purple-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-purple-700 transition cursor-pointer"
                                >
                                    Process Refund
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}