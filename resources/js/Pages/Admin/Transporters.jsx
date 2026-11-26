import { useEffect, useState } from 'react';
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

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

export default function AdminTransporters({ transporters = [] }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);

    const [editingTransporter, setEditingTransporter] = useState(null);
    const [modalTab, setModalTab] = useState('details');

    useEffect(() => {
        const refresh = () => {
            if (!editingTransporter && !isAddOpen) {
                router.reload({ only: ['transporters'], preserveScroll: true });
            }
        };
        window.addEventListener('focus', refresh);
        const timer = setInterval(refresh, 10000);
        return () => {
            window.removeEventListener('focus', refresh);
            clearInterval(timer);
        };
    }, [editingTransporter, isAddOpen]);

    const editForm = useForm({
        name: '',
        phone: '',
        vehicle_type: vehicleOptions[0],
        area: '',
        plate_number: '',
        id_number: '',
        status: 'pending',
        is_available: false,
        base_fare: '500',
        rate_per_kg: '10',
        rate_per_km: '30',
    });

    const loginForm = useForm({
        email: '',
        password: '',
    });

    const addForm = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        vehicle_type: vehicleOptions[0],
        area: '',
        plate_number: '',
        id_number: '',
        base_fare: '500',
        rate_per_kg: '10',
        rate_per_km: '30',
    });

    const openEditModal = (t, initialTab = 'details') => {
        setEditingTransporter(t);
        setModalTab(initialTab);
        editForm.setData({
            name: t.name || '',
            phone: t.phone || '',
            vehicle_type: t.vehicle_type || vehicleOptions[0],
            area: t.area || '',
            plate_number: t.plate_number || '',
            id_number: t.id_number || '',
            status: t.status || 'pending',
            is_available: Boolean(t.is_available),
            base_fare: String(t.base_fare ?? 500),
            rate_per_kg: String(t.rate_per_kg ?? 10),
            rate_per_km: String(t.rate_per_km ?? 30),
        });
        editForm.clearErrors();
        loginForm.setData({
            email: t.user?.email || '',
            password: '',
        });
        loginForm.clearErrors();
    };

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
            t.plate_number?.toLowerCase().includes(q) ||
            t.id_number?.toLowerCase().includes(q)
        );
    });

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post('/admin/transporters', {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setIsAddOpen(false);
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!editingTransporter) return;

        editForm.put(`/admin/transporters/${editingTransporter.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingTransporter(null);
            },
        });
    };

    const submitLogin = (e) => {
        e.preventDefault();
        if (!editingTransporter) return;

        loginForm.post(`/admin/transporters/${editingTransporter.id}/login`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingTransporter(null);
                loginForm.reset();
            },
        });
    };

    const approveFromModal = () => {
        if (!editingTransporter) return;
        router.post(`/admin/transporters/${editingTransporter.id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => setEditingTransporter(null),
        });
    };

    const deleteFromModal = () => {
        if (!editingTransporter) return;
        if (confirm(`Permanently remove "${editingTransporter.name}" from the directory?`)) {
            router.delete(`/admin/transporters/${editingTransporter.id}`, {
                preserveScroll: true,
                onSuccess: () => setEditingTransporter(null),
            });
        }
    };

    const isPdfDoc = editingTransporter?.id_document_path?.toLowerCase().endsWith('.pdf');
    const idDocUrl = editingTransporter?.id_document_path
        ? `/admin/transporters/${editingTransporter.id}/id-document`
        : null;

    return (
        <MainLayout minimal homeHref="/admin/demo-shop">
            <Head title="Transporters Directory — Evopay Admin" />

            <div className="mb-8 flex flex-wrap justify-between items-end gap-4 pb-6 border-b border-brand-border">
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-primary">
                        Demo Shop Admin
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-1">
                        Transporters Directory & Fleet
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tap any driver card to inspect their National ID, edit rate cards, approve, or assign portal logins.
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
                    <Link href="/admin/demo-shop" className="bg-white border border-brand-border text-brand-dark px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm hover:bg-gray-50 transition">
                        Inventory
                    </Link>
                    <Link href="/admin/orders" className="bg-white border border-brand-border text-brand-dark px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm hover:bg-gray-50 transition">
                        Orders
                    </Link>
                    <Link href="/admin/settings" className="bg-white border border-brand-border text-brand-dark px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm hover:bg-gray-50 transition">
                        Settings
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
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Approved & Listed</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1.5">{counts.approved}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Pending Review</p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1.5">{counts.pending}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Driver Join Page</p>
                    <Link
                        href="/shop/transporters/register"
                        target="_blank"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline"
                    >
                        <span>Open Register Link</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* List Card */}
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
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {counts[tab] ?? 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-80">
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, phone, plate, ID, town..."
                            className="w-full bg-white border border-brand-border rounded-xl pl-9 pr-4 py-2 text-sm"
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 text-sm">No transporters found.</div>
                ) : (
                    <div className="divide-y divide-brand-border">
                        {filtered.map((t) => {
                            const meta = statusMeta[t.status] || statusMeta.pending;

                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => openEditModal(t, 'details')}
                                    className="w-full text-left p-4 sm:p-5 hover:bg-brand-light/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer group"
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-brand-primary group-hover:text-white transition">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.5a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 4.5v9.75m12 0H2.25m12 0v5.25" />
                                            </svg>
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-sm text-brand-dark group-hover:text-brand-primary transition">{t.name}</span>
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badge}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                                    {meta.label}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${t.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {t.is_available ? 'Online' : 'Offline'}
                                                </span>
                                                {t.plate_number && (
                                                    <span className="font-mono text-[11px] font-semibold text-gray-600 bg-brand-input px-2 py-0.5 rounded-md">
                                                        {t.plate_number}
                                                    </span>
                                                )}
                                                {t.id_document_path && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                                        </svg>
                                                        <span>ID Attached</span>
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                                <span className="font-semibold text-brand-dark">{t.phone}</span>
                                                <span>·</span>
                                                <span>{t.vehicle_type}</span>
                                                <span>·</span>
                                                <span>Base: <strong className="text-brand-dark">{t.area || 'Nairobi'}</strong></span>
                                                <span>·</span>
                                                <span className="font-mono font-semibold text-brand-primary">
                                                    {formatKES(t.base_fare)} base · {formatKES(t.rate_per_kg)}/kg · {formatKES(t.rate_per_km)}/km
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 self-end lg:self-center">
                                        {t.user ? (
                                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                                Portal: {t.user.email}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                No Login Yet
                                            </span>
                                        )}

                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark group-hover:text-brand-primary">
                                            <span>Manage</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Tap-to-Edit & Inspect Modal */}
            {editingTransporter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-brand-border max-w-2xl w-full shadow-2xl overflow-hidden my-6">
                        <div className="p-6 bg-brand-dark text-white flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">
                                        Driver Profile #{editingTransporter.id}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                        editingTransporter.status === 'approved'
                                            ? 'bg-emerald-500/20 text-emerald-300'
                                            : editingTransporter.status === 'pending'
                                                ? 'bg-amber-500/20 text-amber-300'
                                                : 'bg-red-500/20 text-red-300'
                                    }`}>
                                        {editingTransporter.status}
                                    </span>
                                </div>
                                <h2 className="text-xl font-extrabold mt-1">{editingTransporter.name}</h2>
                                <p className="text-xs text-gray-300 mt-0.5">
                                    {editingTransporter.phone} · {editingTransporter.vehicle_type}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditingTransporter(null)}
                                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="px-6 pt-4 border-b border-brand-border bg-brand-light flex flex-wrap gap-2">
                            {[
                                { id: 'details', label: 'Details & Rates' },
                                { id: 'id', label: 'National ID Check' },
                                { id: 'login', label: editingTransporter.user ? 'Portal Login' : 'Assign Login' },
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setModalTab(t.id)}
                                    className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition cursor-pointer ${
                                        modalTab === t.id
                                            ? 'border-brand-primary text-brand-primary bg-white'
                                            : 'border-transparent text-gray-500 hover:text-brand-dark'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {modalTab === 'details' && (
                                <form onSubmit={submitEdit} className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">Driver / Business Name *</label>
                                            <input
                                                type="text"
                                                value={editForm.data.name}
                                                onChange={(e) => editForm.setData('name', e.target.value)}
                                                className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                                                required
                                            />
                                            {editForm.errors.name && <p className="text-red-500 text-xs mt-1">{editForm.errors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">Phone Number *</label>
                                            <input
                                                type="tel"
                                                value={editForm.data.phone}
                                                onChange={(e) => editForm.setData('phone', e.target.value)}
                                                className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                                                required
                                            />
                                            {editForm.errors.phone && <p className="text-red-500 text-xs mt-1">{editForm.errors.phone}</p>}
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-3.5">
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">Vehicle Type</label>
                                            <select
                                                value={editForm.data.vehicle_type}
                                                onChange={(e) => editForm.setData('vehicle_type', e.target.value)}
                                                className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm"
                                            >
                                                {vehicleOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">Plate Number</label>
                                            <input
                                                type="text"
                                                value={editForm.data.plate_number}
                                                onChange={(e) => editForm.setData('plate_number', e.target.value)}
                                                className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm uppercase font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">Base Town</label>
                                            <input
                                                type="text"
                                                value={editForm.data.area}
                                                onChange={(e) => editForm.setData('area', e.target.value)}
                                                className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-brand-light border border-brand-border">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Base Fare (KSh)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.data.base_fare}
                                                onChange={(e) => editForm.setData('base_fare', e.target.value)}
                                                className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm font-mono"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Rate/KG (KSh)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.data.rate_per_kg}
                                                onChange={(e) => editForm.setData('rate_per_kg', e.target.value)}
                                                className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm font-mono"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Rate/KM (KSh)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.data.rate_per_km}
                                                onChange={(e) => editForm.setData('rate_per_km', e.target.value)}
                                                className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm font-mono"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-3.5">
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">National ID #</label>
                                            <input
                                                type="text"
                                                value={editForm.data.id_number}
                                                onChange={(e) => editForm.setData('id_number', e.target.value)}
                                                className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">Account Status</label>
                                            <select
                                                value={editForm.data.status}
                                                onChange={(e) => editForm.setData('status', e.target.value)}
                                                className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm"
                                            >
                                                <option value="pending">Pending Review</option>
                                                <option value="approved">Approved</option>
                                                <option value="suspended">Suspended</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <label className="w-full flex items-center justify-between bg-brand-light border border-brand-border rounded-xl px-3.5 py-2.5 cursor-pointer">
                                                <span className="text-xs font-bold text-brand-dark">Online</span>
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.data.is_available}
                                                    onChange={(e) => editForm.setData('is_available', e.target.checked)}
                                                    className="w-4 h-4 accent-emerald-600"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-brand-border flex flex-wrap items-center justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={deleteFromModal}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50 transition cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                            <span>Delete Driver</span>
                                        </button>

                                        <div className="flex items-center gap-2.5">
                                            {editingTransporter.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    onClick={approveFromModal}
                                                    className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
                                                >
                                                    Quick Approve
                                                </button>
                                            )}
                                            <button
                                                type="submit"
                                                disabled={editForm.processing}
                                                className="bg-brand-dark text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-black transition cursor-pointer disabled:opacity-50"
                                            >
                                                {editForm.processing ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {modalTab === 'id' && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-brand-light border border-brand-border flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">National ID Number</p>
                                            <p className="text-base font-extrabold font-mono text-brand-dark mt-0.5">
                                                {editingTransporter.id_number || 'Not provided'}
                                            </p>
                                        </div>

                                        {editingTransporter.status === 'pending' && (
                                            <button
                                                type="button"
                                                onClick={approveFromModal}
                                                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                                            >
                                                Approve Driver
                                            </button>
                                        )}
                                    </div>

                                    {idDocUrl ? (
                                        <div className="rounded-2xl border border-brand-border bg-gray-50 p-4 text-center space-y-3">
                                            {isPdfDoc ? (
                                                <div className="py-8">
                                                    <svg className="w-12 h-12 text-brand-primary mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                    </svg>
                                                    <p className="text-xs font-semibold text-gray-600">PDF National ID Document Uploaded</p>
                                                </div>
                                            ) : (
                                                <img
                                                    src={idDocUrl}
                                                    alt="Driver National ID"
                                                    className="max-h-72 mx-auto rounded-xl object-contain border border-brand-border bg-white"
                                                />
                                            )}

                                            <a
                                                href={idDocUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
                                            >
                                                <span>Open Full Document in New Tab</span>
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                </svg>
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="p-8 rounded-2xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
                                            No National ID document uploaded for this driver yet.
                                        </div>
                                    )}
                                </div>
                            )}

                            {modalTab === 'login' && (
                                <form onSubmit={submitLogin} className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-brand-light border border-brand-border text-xs text-gray-600 leading-relaxed">
                                        Assign or reset the email and password this driver will use to sign in at <strong>/login</strong> and manage their availability & rate card.
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-brand-dark mb-1">Driver Login Email *</label>
                                        <input
                                            type="email"
                                            value={loginForm.data.email}
                                            onChange={(e) => loginForm.setData('email', e.target.value)}
                                            placeholder="driver@logistics.co.ke"
                                            className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
                                            required
                                        />
                                        {loginForm.errors.email && <p className="text-red-500 text-xs mt-1">{loginForm.errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-brand-dark mb-1">Portal Password (min 8 chars) *</label>
                                        <input
                                            type="password"
                                            minLength={8}
                                            value={loginForm.data.password}
                                            onChange={(e) => loginForm.setData('password', e.target.value)}
                                            placeholder="Enter a strong password"
                                            className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
                                            required
                                        />
                                        {loginForm.errors.password && <p className="text-red-500 text-xs mt-1">{loginForm.errors.password}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loginForm.processing}
                                        className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer disabled:opacity-50"
                                    >
                                        {loginForm.processing ? 'Saving Credentials...' : 'Save Driver Portal Login'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Transporter Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 max-w-lg w-full shadow-2xl relative my-8">
                        <div className="flex justify-between items-center pb-4 border-b border-brand-border mb-5">
                            <h3 className="text-lg font-bold text-brand-dark">Add Transporter & Rate Card</h3>
                            <button type="button" onClick={() => setIsAddOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={submitAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Driver / Business Name *</label>
                                <input
                                    type="text"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    placeholder="e.g. Samuel Mutiso Logistics"
                                    className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm"
                                    required
                                />
                                {addForm.errors.name && <p className="text-red-500 text-xs mt-1">{addForm.errors.name}</p>}
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={addForm.data.phone}
                                        onChange={(e) => addForm.setData('phone', e.target.value)}
                                        placeholder="0712345678"
                                        className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm"
                                        required
                                    />
                                    {addForm.errors.phone && <p className="text-red-500 text-xs mt-1">{addForm.errors.phone}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Vehicle Type *</label>
                                    <select
                                        value={addForm.data.vehicle_type}
                                        onChange={(e) => addForm.setData('vehicle_type', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm"
                                    >
                                        {vehicleOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Portal Login Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={addForm.data.email}
                                        onChange={(e) => addForm.setData('email', e.target.value)}
                                        placeholder="driver@logistics.co.ke"
                                        className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm"
                                    />
                                    {addForm.errors.email && <p className="text-red-500 text-xs mt-1">{addForm.errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Portal Password (Optional)</label>
                                    <input
                                        type="password"
                                        value={addForm.data.password}
                                        onChange={(e) => addForm.setData('password', e.target.value)}
                                        placeholder="min 8 chars"
                                        className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm"
                                    />
                                    {addForm.errors.password && <p className="text-red-500 text-xs mt-1">{addForm.errors.password}</p>}
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Base Fare (KSh)</label>
                                    <input
                                        type="number"
                                        value={addForm.data.base_fare}
                                        onChange={(e) => addForm.setData('base_fare', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Rate/KG (KSh)</label>
                                    <input
                                        type="number"
                                        value={addForm.data.rate_per_kg}
                                        onChange={(e) => addForm.setData('rate_per_kg', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Rate/KM (KSh)</label>
                                    <input
                                        type="number"
                                        value={addForm.data.rate_per_km}
                                        onChange={(e) => addForm.setData('rate_per_km', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Base Town</label>
                                    <input
                                        type="text"
                                        value={addForm.data.area}
                                        onChange={(e) => addForm.setData('area', e.target.value)}
                                        placeholder="Mombasa Road"
                                        className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Plate Number</label>
                                    <input
                                        type="text"
                                        value={addForm.data.plate_number}
                                        onChange={(e) => addForm.setData('plate_number', e.target.value)}
                                        placeholder="KDF 123A"
                                        className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm uppercase font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">National ID #</label>
                                    <input
                                        type="text"
                                        value={addForm.data.id_number}
                                        onChange={(e) => addForm.setData('id_number', e.target.value)}
                                        placeholder="34567890"
                                        className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm font-mono"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={addForm.processing}
                                className="w-full mt-2 bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer disabled:opacity-50"
                            >
                                {addForm.processing ? 'Saving...' : 'Save & Approve Transporter'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}