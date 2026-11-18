import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const statusStyles = {
    paid: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
};

export default function AdminOrders({ orders = [] }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filtered = orders.filter((order) => {
        if (filter !== 'all' && order.status !== filter) return false;

        const q = search.trim().toLowerCase();
        if (!q) return true;

        return (
            order.order_number?.toLowerCase().includes(q) ||
            order.mpesa_receipt?.toLowerCase().includes(q) ||
            order.customer?.name?.toLowerCase().includes(q) ||
            order.customer?.phone?.toLowerCase().includes(q)
        );
    });

    const paidOrders = orders.filter((o) => o.status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    return (
        <MainLayout minimal>
            <Head title="Admin Orders" />

            <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark">Orders</h1>
                    <p className="text-gray-500 mt-1">Track customer orders, M-Pesa receipts, and card payments.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/settings" className="bg-white border border-brand-border text-brand-dark px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition">
                        Settings
                    </Link>
                    <Link href="/admin" className="bg-white border border-brand-border text-brand-dark px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition">
                        ← Back to Inventory
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-gray-400">Total Orders</p>
                    <p className="text-2xl font-extrabold text-brand-dark mt-1">{orders.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-gray-400">Paid Orders</p>
                    <p className="text-2xl font-extrabold text-green-600 mt-1">{paidOrders.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-gray-400">Paid Revenue</p>
                    <p className="text-2xl font-extrabold text-brand-primary mt-1">{formatKES(totalRevenue)}</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex gap-2">
                    {['all', 'paid', 'pending', 'failed'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
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
                    placeholder="Search order #, receipt, name or phone..."
                    className="w-full sm:w-72 bg-white border border-brand-border rounded-lg px-4 py-2 text-sm"
                />
            </div>

            {/* Orders List */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-brand-border p-10 text-center text-gray-500 text-sm">
                    No matching orders found.
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl border border-brand-border p-5 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-border pb-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="font-extrabold text-brand-dark">{order.order_number}</span>
                                        <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusStyles[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-xs font-semibold uppercase text-gray-500 bg-brand-light px-2 py-0.5 rounded">
                                            {order.payment_method || 'unselected'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(order.created_at).toLocaleString('en-KE')}
                                        {order.mpesa_receipt && (
                                            <span className="ml-3 font-semibold text-green-700">
                                                M-Pesa Receipt: {order.mpesa_receipt}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-lg font-extrabold text-brand-primary">{formatKES(order.total_amount)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-400 mb-1">Customer</p>
                                    <p className="font-semibold text-brand-dark">{order.customer?.name || '—'}</p>
                                    <p className="text-gray-600 text-xs">{order.customer?.phone || '—'}</p>
                                    {order.customer?.email && <p className="text-gray-500 text-xs">{order.customer.email}</p>}
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-400 mb-1">Delivery</p>
                                    <p className="font-semibold text-brand-dark capitalize">
                                        {order.delivery?.method || 'standard'} ({formatKES(order.delivery?.fee || 0)})
                                    </p>
                                    {order.delivery?.formatted && (
                                        <p className="text-gray-600 text-xs mt-0.5">
                                            {order.delivery.formatted} ({order.delivery.distance_km || 0} km)
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-400 mb-1">Items</p>
                                    <ul className="space-y-1 text-xs text-gray-700">
                                        {(order.items || []).map((item, idx) => (
                                            <li key={idx} className="flex justify-between gap-2">
                                                <span className="truncate">{item.qty} × {item.productName} ({item.unitLabel})</span>
                                                <span className="font-semibold whitespace-nowrap">{formatKES(item.lineTotal)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {order.status === 'failed' && order.failure_reason && (
                                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                                    <strong>Failure reason:</strong> {order.failure_reason}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </MainLayout>
    );
}