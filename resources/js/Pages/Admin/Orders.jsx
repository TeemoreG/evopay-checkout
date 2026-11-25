import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const statusMeta = {
    paid: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    pending: {
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
    },
    failed: {
        badge: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
    },
};

export default function AdminOrders({ orders = [] }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const counts = {
        all: orders.length,
        paid: orders.filter((o) => o.status === 'paid').length,
        pending: orders.filter((o) => o.status === 'pending').length,
        failed: orders.filter((o) => o.status === 'failed').length,
    };

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
        <MainLayout minimal homeHref="/admin/demo-shop">
            <Head title="Demo Shop Orders — Evopay Admin" />

            {/* Top Header & Sub-Nav */}
            <div className="mb-8 flex flex-wrap justify-between items-end gap-4 pb-6 border-b border-brand-border">
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-primary">
                        Demo Shop Admin
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-1">
                        Orders
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track customer orders, delivery details, and Evopay payment receipts.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/admin/demo-shop"
                        className="bg-white border border-brand-border text-brand-dark px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-50 transition"
                    >
                        Inventory
                    </Link>
                    <Link
                        href="/admin/orders"
                        className="bg-brand-dark text-white px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm"
                    >
                        Orders
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="bg-white border border-brand-border text-brand-dark px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-50 transition"
                    >
                        Settings
                    </Link>
                    <Link
                        href="/admin"
                        className="bg-white border border-brand-border text-gray-600 px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-50 transition"
                    >
                        Platform Admin
                    </Link>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Total Orders
                    </p>
                    <p className="text-2xl font-extrabold text-brand-dark mt-1.5">
                        {orders.length}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Paid Orders
                    </p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1.5">
                        {paidOrders.length}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Paid Revenue
                    </p>
                    <p className="text-2xl font-extrabold text-brand-primary mt-1.5">
                        {formatKES(totalRevenue)}
                    </p>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
                {/* Filter Toolbar */}
                <div className="p-4 border-b border-brand-border bg-brand-light/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-brand-border">
                        {['all', 'paid', 'pending', 'failed'].map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setFilter(tab)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer flex items-center gap-1.5 ${
                                    filter === tab
                                        ? 'bg-brand-dark text-white shadow-xs'
                                        : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
                                }`}
                            >
                                <span>{tab}</span>
                                <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                        filter === tab
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}
                                >
                                    {counts[tab]}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-80">
                        <svg
                            className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search order #, receipt, name or phone..."
                            className="w-full bg-white border border-brand-border rounded-xl pl-9 pr-4 py-2 text-sm"
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 text-sm">
                        No matching orders found.
                    </div>
                ) : (
                    <div className="divide-y divide-brand-border">
                        {filtered.map((order) => {
                            const meta = statusMeta[order.status] || {
                                badge: 'bg-gray-100 text-gray-700 border-gray-200',
                                dot: 'bg-gray-400',
                            };
                            const isExpanded = expandedId === order.id;

                            return (
                                <div key={order.id} className="p-4 sm:p-5 hover:bg-gray-50/50 transition">
                                    {/* Top Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span className="font-mono font-bold text-sm text-brand-dark">
                                                {order.order_number}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1.5 text-[11px] font-bold capitalize px-2.5 py-0.5 rounded-full border ${meta.badge}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                                {order.status}
                                            </span>
                                            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 bg-brand-light border border-brand-border px-2 py-0.5 rounded-md">
                                                {order.payment_method || 'unselected'}
                                            </span>
                                            {order.mpesa_receipt && (
                                                <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                                    {order.mpesa_receipt}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-base font-extrabold text-brand-dark">
                                                    {formatKES(order.total_amount)}
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    {new Date(order.created_at).toLocaleString('en-KE')}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                                className="text-xs font-semibold text-gray-500 hover:text-brand-primary border border-brand-border bg-white px-2.5 py-1.5 rounded-lg cursor-pointer"
                                            >
                                                {isExpanded ? 'Hide' : 'Details'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Compact Summary Line */}
                                    <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
                                        <span>
                                            <strong className="text-brand-dark">{order.customer?.name || '—'}</strong>
                                            {order.customer?.phone ? ` · ${order.customer.phone}` : ''}
                                        </span>
                                        <span className="capitalize">
                                            {order.delivery?.method || 'standard'} delivery ({formatKES(order.delivery?.fee || 0)})
                                        </span>
                                        <span>
                                            {(order.items || []).length} item{(order.items || []).length === 1 ? '' : 's'}
                                        </span>
                                    </div>

                                    {/* Expandable Breakdown */}
                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t border-brand-border grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                                    Customer
                                                </p>
                                                <p className="font-semibold text-brand-dark">{order.customer?.name || '—'}</p>
                                                <p className="text-gray-600 text-xs">{order.customer?.phone || '—'}</p>
                                                {order.customer?.email && (
                                                    <p className="text-gray-500 text-xs">{order.customer.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                                    Delivery
                                                </p>
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
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                                    Items
                                                </p>
                                                <ul className="space-y-1 text-xs text-gray-700">
                                                    {(order.items || []).map((item, idx) => (
                                                        <li key={idx} className="flex justify-between gap-2">
                                                            <span className="truncate">
                                                                {item.qty} × {item.productName} ({item.unitLabel})
                                                            </span>
                                                            <span className="font-semibold whitespace-nowrap">
                                                                {formatKES(item.lineTotal)}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {order.status === 'failed' && order.failure_reason && (
                                        <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs text-red-700">
                                            <strong>Failure reason:</strong> {order.failure_reason}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}