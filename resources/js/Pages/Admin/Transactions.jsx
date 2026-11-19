import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

const formatMoney = (amount, currency = 'KES') =>
    `${currency} ` + Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const statusStyles = {
    paid: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
};

export default function AdminTransactions({ sessions = [] }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filtered = sessions.filter((s) => {
        if (filter !== 'all' && s.status !== filter) return false;
        const q = search.trim().toLowerCase();
        if (!q) return true;

        return (
            s.merchant_name?.toLowerCase().includes(q) ||
            s.merchant_reference?.toLowerCase().includes(q) ||
            s.token?.toLowerCase().includes(q) ||
            s.mpesa_receipt?.toLowerCase().includes(q) ||
            s.customer?.name?.toLowerCase().includes(q) ||
            s.customer?.phone?.toLowerCase().includes(q)
        );
    });

    return (
        <MainLayout minimal homeHref="/admin">
            <Head title="Gateway Transactions — Evopay Admin" />

            <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Evopay Gateway Admin</p>
                    <h1 className="text-3xl font-extrabold text-brand-dark mt-0.5">All Gateway Transactions</h1>
                    <p className="text-gray-500 mt-1 text-sm">Global view of every checkout session across all onboarded merchants.</p>
                </div>
                <Link href="/admin" className="bg-white border border-brand-border text-brand-dark px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition">
                    ← Back to Merchants
                </Link>
            </div>

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
                    placeholder="Search merchant, ref, receipt, phone..."
                    className="w-full sm:w-80 bg-white border border-brand-border rounded-lg px-4 py-2 text-sm"
                />
            </div>

            <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">No gateway transactions found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-brand-light border-b border-brand-border text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="py-3.5 px-4">Merchant</th>
                                    <th className="py-3.5 px-4">Reference / Token</th>
                                    <th className="py-3.5 px-4">Customer</th>
                                    <th className="py-3.5 px-4">Amount</th>
                                    <th className="py-3.5 px-4">Est. Fee</th>
                                    <th className="py-3.5 px-4">Method</th>
                                    <th className="py-3.5 px-4">Receipt</th>
                                    <th className="py-3.5 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {filtered.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50/60">
                                        <td className="py-3.5 px-4 font-bold text-brand-dark">{s.merchant_name}</td>
                                        <td className="py-3.5 px-4">
                                            <p className="font-semibold text-brand-dark">{s.merchant_reference}</p>
                                            <p className="text-[11px] font-mono text-gray-400">{s.token}</p>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <p className="text-brand-dark">{s.customer?.name || '—'}</p>
                                            <p className="text-xs text-gray-500">{s.customer?.phone || '—'}</p>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-brand-dark whitespace-nowrap">
                                            {formatMoney(s.amount, s.currency)}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                                            {formatMoney(s.fee_amount, s.currency)}
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