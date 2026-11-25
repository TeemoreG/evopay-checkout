import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

const statusMeta = {
    approved: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Approved',
    },
    pending: {
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Pending Review',
    },
    suspended: {
        badge: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        label: 'Suspended',
    },
};

const vehicleOptions = [
    'Pickup (1 - 2 Tonnes)',
    'Canter (3 - 5 Tonnes)',
    'Tipper / Lorry (7 - 10 Tonnes)',
    'Trailer / Prime Mover (20+ Tonnes)',
    'Tuk-Tuk / Delivery Van',
    'Motorbike / Courier',
];

export default function AdminTransporters({ transporters = [] }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);

    const form = useForm({
        name: '',
        phone: '',
        vehicle_type: vehicleOptions[0],
        area: '',
        plate_number: '',
    });

    const counts = {
        all: transporters.length,
        approved: transporters.filter((t) => t.status === 'approved').length,
        pending: transporters.filter((t) => t.status === 'pending').length,
        suspended: transporters.filter((t) => t.status === 'suspended').length,
    };

    const filtered = transporters.filter((t) => {
        if (filter !== 'all' && t.status !== filter) return false;

        const q = search.trim().toLowerCase();
        if (!q) return true;

        return (
            t.name?.toLowerCase().includes(q) ||
            t.phone?.toLowerCase().includes(q) ||
            t.area?.toLowerCase().includes(q) ||
            t.vehicle_type?.toLowerCase().includes(q) ||
            t.plate_number?.toLowerCase().includes(q)
        );
    });

    const submitAdd = (e) => {
        e.preventDefault();
        form.post('/admin/transporters', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setIsAddOpen(false);
            },
        });
    };

    const approveTransporter = (id) => {
        router.post(`/admin/transporters/${id}/approve`, {}, { preserveScroll: true });
    };

    const toggleStatus = (id) => {
        router.post(`/admin/transporters/${id}/toggle`, {}, { preserveScroll: true });
    };

    const deleteTransporter = (id, name) => {
        if (confirm(`Remove transporter "${name}" from directory?`)) {
            router.delete(`/admin/transporters/${id}`, { preserveScroll: true });
        }
    };

    return (
        <MainLayout minimal homeHref="/admin/demo-shop">
            <Head title="Transporters Directory — Evopay Admin" />

            {/* Top Navigation & Sub-Header */}
            <div className="mb-8 flex flex-wrap justify-between items-end gap-4 pb-6 border-b border-brand-border">
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-primary">
                        Demo Shop Admin
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-1">
                        Transporters Directory
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage independent drivers and hauling providers listed for customer self-arrangement.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsAddOpen(true)}
                        className="bg-brand-primary text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm hover:bg-brand-secondary transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Add Transporter</span>
                    </button>
                    <Link
                        href="/admin/demo-shop"
                        className="bg-white border border-brand-border text-brand-dark px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm hover:bg-gray-50 transition"
                    >
                        Inventory
                    </Link>
                    <Link
                        href="/admin/orders"
                        className="bg-white border border-brand-border text-brand-dark px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm hover:bg-gray-50 transition"
                    >
                        Orders
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="bg-white border border-brand-border text-brand-dark px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm hover:bg-gray-50 transition"
                    >
                        Settings
                    </Link>
                    <Link
                        href="/admin"
                        className="bg-white border border-brand-border text-gray-600 px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm hover:bg-gray-50 transition"
                    >
                        Platform Admin
                    </Link>
                </div>
            </div>

            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Registered</p>
                    <p className="text-2xl font-extrabold text-brand-dark mt-1.5">{counts.all}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Active / Listed</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1.5">{counts.approved}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Pending Review</p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1.5">{counts.pending}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Public Portal Link</p>
                    <Link
                        href="/shop/transporters/register"
                        target="_blank"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline"
                    >
                        <span>Open Join Page</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Filter Toolbar & Search */}
            <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
                <div className="p-4 border-b border-brand-border bg-brand-light/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-brand-border">
                        {['all', 'approved', 'pending', 'suspended'].map((tab) => (
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
                                    {counts[tab] ?? 0}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, phone, plate, town..."
                            className="w-full bg-white border border-brand-border rounded-xl pl-9 pr-4 py-2 text-sm"
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 text-sm">
                        No transporters found matching this filter.
                    </div>
                ) : (
                    <div className="divide-y divide-brand-border">
                        {filtered.map((t) => {
                            const meta = statusMeta[t.status] || statusMeta.pending;

                            return (
                                <div key={t.id} className="p-4 sm:p-5 hover:bg-gray-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.5a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 4.5v9.75m12 0H2.25m12 0v5.25" />
                                            </svg>
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-sm text-brand-dark">{t.name}</span>
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badge}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                                    {meta.label}
                                                </span>
                                                {t.plate_number && (
                                                    <span className="font-mono text-[11px] font-semibold text-gray-600 bg-brand-input px-2 py-0.5 rounded-md">
                                                        {t.plate_number}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                <a
                                                    href={`tel:${t.phone}`}
                                                    className="font-bold text-brand-dark hover:text-brand-primary inline-flex items-center gap-1"
                                                >
                                                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H3.75A2.25 2.25 0 001.5 4.5v2.25z" />
                                                    </svg>
                                                    <span>{t.phone}</span>
                                                </a>
                                                <span>·</span>
                                                <span>{t.vehicle_type}</span>
                                                {t.area && (
                                                    <>
                                                        <span>·</span>
                                                        <span>Base: <strong>{t.area}</strong></span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                                        {t.status === 'pending' && (
                                            <button
                                                type="button"
                                                onClick={() => approveTransporter(t.id)}
                                                className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                                            >
                                                Approve & List
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => toggleStatus(t.id)}
                                            className="border border-brand-border bg-white text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                                        >
                                            {t.status === 'approved' ? 'Suspend' : 'Activate'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => deleteTransporter(t.id, t.name)}
                                            className="text-red-500 hover:text-red-700 px-2 py-1.5 text-xs font-semibold cursor-pointer"
                                            title="Delete Transporter"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal: Direct Admin Add */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
                        <div className="flex justify-between items-center pb-4 border-b border-brand-border mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-brand-dark">Add Verified Transporter</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Directly approves driver for immediate display on checkout.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={submitAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Driver or Fleet Name *</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g. Samuel Mutiso Logistics"
                                    className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm border border-transparent"
                                    required
                                />
                                {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        placeholder="e.g. 0712345678"
                                        className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm border border-transparent"
                                        required
                                    />
                                    {form.errors.phone && <p className="text-red-500 text-xs mt-1">{form.errors.phone}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Vehicle Type *</label>
                                    <select
                                        value={form.data.vehicle_type}
                                        onChange={(e) => form.setData('vehicle_type', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm border border-transparent"
                                    >
                                        {vehicleOptions.map((v) => (
                                            <option key={v} value={v}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Base Location / Town</label>
                                    <input
                                        type="text"
                                        value={form.data.area}
                                        onChange={(e) => form.setData('area', e.target.value)}
                                        placeholder="e.g. Mombasa Road / Kitengela"
                                        className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm border border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Plate Number (optional)</label>
                                    <input
                                        type="text"
                                        value={form.data.plate_number}
                                        onChange={(e) => form.setData('plate_number', e.target.value)}
                                        placeholder="e.g. KDF 123A"
                                        className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm border border-transparent uppercase font-mono"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full mt-2 bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer disabled:opacity-50"
                            >
                                {form.processing ? 'Saving...' : 'Save & List Transporter'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}