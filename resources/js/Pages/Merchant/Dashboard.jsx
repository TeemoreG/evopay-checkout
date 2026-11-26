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

    const filtered = sessions.filter((s) => {
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

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Desktop Left Navigation Sidebar */}
                <aside className="w-full lg:w-64 bg-white rounded-3xl border border-brand-border p-4 shadow-xs space-y-1.5 flex-shrink-0">
                    <div className="p-3 mb-2 border-b border-brand-border">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">Merchant Console</p>
                        <h2 className="text-sm font-extrabold text-brand-dark truncate mt-0.5">{merchant.name}</h2>
                        <p className="text-[11px] text-gray-500">Rate: {merchant.fee_percent}% per txn</p>
                    </div>

                    <Link
                        href="/merchant"
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-brand-dark text-white shadow-xs"
                    >
                        <span>Transactions & Wallet</span>
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

                {/* Main Dashboard Canvas */}
                <div className="flex-1 w-full min-w-0 space-y-6">
                    {/* Wallet Hero Banner */}
                    <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Available Wallet Balance</span>
                            <h1 className="text-3xl sm:text-4xl font-black text-brand-dark mt-0.5">
                                {formatMoney(availableBalance)}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                                <span>Gross Paid: <strong className="text-brand-dark">{formatMoney(wallet.gross_volume || 0)}</strong></span>
                                <span>•</span>
                                <span>Platform Fees ({merchant.fee_percent}%): {formatMoney(wallet.total_fees || 0)}</span>
                                <span>•</span>
                                <span>Settled Out: {formatMoney(wallet.total_withdrawn || 0)}</span>
                                {Number(wallet.total_refunded || 0) > 0 && (
                                    <>
                                        <span>•</span>
                                        <span className="text-purple-600 font-semibold">Refunds: {formatMoney(wallet.total_refunded)}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsWithdrawOpen(true)}
                            disabled={availableBalance < 100}
                            className="bg-brand-primary text-white px-6 py-3.5 rounded-2xl font-extrabold text-sm hover:bg-brand-secondary transition shadow-xs cursor-pointer flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {availableBalance < 100 ? 'Min KES 100 to Withdraw' : 'Request Withdrawal →'}
                        </button>
                    </div>

                    {/* Stats KPI Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-xs">
                            <p className="text-[11px] font-bold uppercase text-gray-400">Gross Paid Volume</p>
                            <p className="text-xl font-black text-brand-dark mt-1">{formatMoney(stats.total_volume)}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-xs">
                            <p className="text-[11px] font-bold uppercase text-gray-400">Successful Checkouts</p>
                            <p className="text-xl font-black text-emerald-600 mt-1">{stats.paid_count}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-xs">
                            <p className="text-[11px] font-bold uppercase text-gray-400">Total Sessions Created</p>
                            <p className="text-xl font-black text-brand-dark mt-1">{stats.total_count}</p>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-brand-border">
                            {['all', 'paid', 'pending', 'refunded', 'failed'].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setFilter(tab)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
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
                            className="w-full sm:w-72 bg-white border border-brand-border rounded-xl px-4 py-2 text-sm"
                        />
                    </div>

                    {/* Transactions & Refund Table */}
                    <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
                        {filtered.length === 0 ? (
                            <div className="p-10 text-center text-sm text-gray-500">
                                No checkout sessions found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-brand-light border-b border-brand-border text-[11px] font-bold uppercase text-gray-500">
                                        <tr>
                                            <th className="py-3.5 px-4">Reference</th>
                                            <th className="py-3.5 px-4">Customer</th>
                                            <th className="py-3.5 px-4">Amount</th>
                                            <th className="py-3.5 px-4">Method</th>
                                            <th className="py-3.5 px-4">Receipt</th>
                                            <th className="py-3.5 px-4">Status</th>
                                            <th className="py-3.5 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border">
                                        {filtered.map((s) => (
                                            <tr key={s.id} className="hover:bg-gray-50/60">
                                                <td className="py-3.5 px-4">
                                                    <p className="font-bold text-brand-dark">{s.merchant_reference}</p>
                                                    <p className="text-[11px] font-mono text-gray-400">{s.token}</p>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <p className="font-medium text-brand-dark">{s.customer?.name || '—'}</p>
                                                    <p className="text-xs text-gray-500">{s.customer?.phone || s.customer?.email || '—'}</p>
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-brand-dark whitespace-nowrap">
                                                    {formatMoney(s.amount, s.currency)}
                                                </td>
                                                <td className="py-3.5 px-4 uppercase text-xs font-semibold text-gray-600">
                                                    {s.payment_method || '—'}
                                                </td>
                                                <td className="py-3.5 px-4 font-mono text-xs text-emerald-700 font-semibold">
                                                    {s.mpesa_receipt || '—'}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusStyles[s.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
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
            </div>

            {/* WITHDRAWAL MODAL — Strict Balance Check */}
            {isWithdrawOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-brand-border p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
                            <div>
                                <h3 className="text-base font-extrabold text-brand-dark">Withdraw Funds</h3>
                                <p className="text-xs text-gray-500">
                                    Max available:{' '}
                                    <strong className={availableBalance > 0 ? 'text-emerald-700' : 'text-gray-500'}>
                                        {formatMoney(availableBalance)}
                                    </strong>
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

                        {availableBalance <= 0 ? (
                            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                                <p className="font-bold">No funds currently available to withdraw</p>
                                <p className="leading-relaxed">
                                    Your available wallet balance is currently KES 0.00. Funds become available once customers complete paid checkouts through your merchant keys.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={submitWithdrawal} className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs font-semibold text-brand-dark">Amount to Withdraw (KES) *</label>
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('amount', String(availableBalance))}
                                            className="text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
                                        >
                                            Use Max ({formatMoney(availableBalance)})
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
                                                : 'bg-brand-input border-transparent'
                                        }`}
                                        required
                                    />
                                    {isExceedingBalance && (
                                        <p className="text-xs text-red-600 mt-1 font-semibold">
                                            Amount exceeds your available balance of {formatMoney(availableBalance)}.
                                        </p>
                                    )}
                                    {withdrawForm.errors.amount && (
                                        <p className="text-xs text-red-600 mt-1">{withdrawForm.errors.amount}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Payout Channel *</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => withdrawForm.setData('channel', 'mpesa')}
                                            className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                                withdrawForm.data.channel === 'mpesa'
                                                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                                                    : 'border-brand-border bg-white text-gray-600'
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
                                                    : 'border-brand-border bg-white text-gray-600'
                                            }`}
                                        >
                                            Bank Transfer
                                        </button>
                                    </div>
                                </div>

                                {withdrawForm.data.channel === 'mpesa' ? (
                                    <div>
                                        <label className="block text-xs font-semibold text-brand-dark mb-1">M-Pesa Recipient Phone *</label>
                                        <input
                                            type="tel"
                                            value={withdrawForm.data.phone}
                                            onChange={(e) => withdrawForm.setData('phone', e.target.value)}
                                            placeholder="0712345678"
                                            className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm font-mono"
                                            required
                                        />
                                        {withdrawForm.errors.phone && <p className="text-xs text-red-600 mt-1">{withdrawForm.errors.phone}</p>}
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
                                                className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm"
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
                                                className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm font-mono"
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
                                    {withdrawForm.processing
                                        ? 'Submitting Request...'
                                        : isExceedingBalance
                                            ? 'Exceeds Available Balance'
                                            : requestedAmount < 100
                                                ? 'Min KES 100'
                                                : `Withdraw ${formatMoney(requestedAmount)}`}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* REFUND CONFIRMATION MODAL */}
            {refundTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-brand-border p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
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
                                You are about to issue a full refund of{' '}
                                <strong className="text-brand-dark">{formatMoney(refundTarget.amount, refundTarget.currency)}</strong> to the customer. This will deduct from your available balance and trigger a signed webhook event.
                            </p>

                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Reason for Refund</label>
                                <input
                                    type="text"
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="e.g. Out of stock / Customer request"
                                    className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRefundTarget(null)}
                                    className="w-1/3 bg-brand-light border border-brand-border text-brand-dark py-3 rounded-xl font-bold text-xs cursor-pointer"
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