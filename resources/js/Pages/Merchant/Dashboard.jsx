import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

const formatMoney = (amount, currency = 'KES') =>
    `${currency} ` + Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const statusStyles = {
    paid: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
};

export default function MerchantDashboard({ merchant, stats, sessions = [] }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

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
            <Head title={`${merchant.name} — Evopay Merchant`} />

            <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Merchant Portal</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-0.5">{merchant.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor live payments, receipts, and checkout sessions.</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                    <Link
                        href="/merchant/developers"
                        className="bg-brand-dark text-white px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-black transition"
                    >
                        API Keys & Webhooks
                    </Link>
                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="bg-white border border-brand-border text-gray-700 px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase text-gray-400">Paid Volume</p>
                    <p className="text-2xl font-extrabold text-brand-primary mt-1">{formatMoney(stats.total_volume)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase text-gray-400">Successful Payments</p>
                    <p className="text-2xl font-extrabold text-green-600 mt-1">{stats.paid_count}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase text-gray-400">Total Sessions</p>
                    <p className="text-2xl font-extrabold text-brand-dark mt-1">{stats.total_count}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex gap-2">
                    {['all', 'paid', 'pending', 'failed'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setFilter(tab)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                                filter === tab
                                    ? 'bg-brand-dark text-white'
                                    : 'bg-white border border-brand-border text-gray-600 hover:bg-gray-50'
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
                    className="w-full sm:w-72 bg-white border border-brand-border rounded-lg px-4 py-2 text-sm"
                />
            </div>

            {/* Sessions Table */}
            <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        No checkout sessions found yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-brand-light border-b border-brand-border text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="py-3.5 px-4">Reference</th>
                                    <th className="py-3.5 px-4">Customer</th>
                                    <th className="py-3.5 px-4">Amount</th>
                                    <th className="py-3.5 px-4">Method</th>
                                    <th className="py-3.5 px-4">Receipt</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Date</th>
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
                                        <td className="py-3.5 px-4 font-mono text-xs text-green-700 font-semibold">
                                            {s.mpesa_receipt || '—'}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusStyles[s.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                                            {new Date(s.created_at).toLocaleString('en-KE')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}