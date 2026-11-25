import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
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

const formatKES = (v) => 'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

export default function AdminTransporters({ transporters = [] }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Login modal state
    const [loginTarget, setLoginTarget] = useState(null);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginSaving, setLoginSaving] = useState(false);

    const form = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        vehicle_type: vehicleOptions[0],
        area: '',
        plate_number: '',
        base_fare: '500',
        rate_per_kg: '10',
        rate_per_km: '30',
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

    const submitLogin = async (e) => {
        e.preventDefault();
        if (!loginTarget) return;
        setLoginSaving(true);
        try {
            await axios.post(`/admin/transporters/${loginTarget.id}/login`, {
                email: loginEmail,
                password: loginPassword,
            });
            setLoginTarget(null);
            setLoginPassword('');
            router.reload({ only: ['transporters'] });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save driver login.');
        } finally {
            setLoginSaving(false);
        }
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

            <div className="mb-8 flex flex-wrap justify-between items-end gap-4 pb-6 border-b border-brand-border">
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-primary">
                        Demo Shop Admin
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-1">
                        Transporters Directory & Fleet
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage independent drivers, rate cards, and portal logins.
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

            {/* Attach Login Modal */}
            {loginTarget && (
                <form onSubmit={submitLogin} className="mb-6 bg-white rounded-2xl border-2 border-brand-primary p-5 shadow-sm max-w-xl">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-sm text-brand-dark">
                            {loginTarget.user ? 'Reset' : 'Create'} Portal Login for {loginTarget.name}
                        </h3>
                        <button type="button" onClick={() => setLoginTarget(null)} className="text-xs text-red-500 font-semibold cursor-pointer">
                            Cancel
                        </button>
                    </div>
                    <div className="space-y-3">
                        <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="Driver login email"
                            className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                            required
                        />
                        <input
                            type="password"
                            minLength={8}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Password (min 8 chars)"
                            className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loginSaving}
                            className="w-full bg-brand-dark text-white rounded-xl font-bold text-sm py-3 hover:bg-black cursor-pointer"
                        >
                            {loginSaving ? 'Saving...' : 'Save Driver Login'}
                        </button>
                    </div>
                </form>
            )}

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

            {/* List Table */}
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
                            placeholder="Search name, phone, plate, town..."
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
                                <div key={t.id} className="p-4 sm:p-5 hover:bg-gray-50/50 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${t.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {t.is_available ? 'Online' : 'Offline'}
                                                </span>
                                                {t.plate_number && (
                                                    <span className="font-mono text-[11px] font-semibold text-gray-600 bg-brand-input px-2 py-0.5 rounded-md">
                                                        {t.plate_number}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                <span className="font-bold text-brand-dark">{t.phone}</span>
                                                <span>·</span>
                                                <span>{t.vehicle_type}</span>
                                                <span>·</span>
                                                <span>Base: <strong>{t.area || 'Nairobi'}</strong></span>
                                                <span>·</span>
                                                <span className="font-mono font-semibold text-brand-primary">
                                                    Base Fare: {formatKES(t.base_fare)} | {formatKES(t.rate_per_kg)}/kg | {formatKES(t.rate_per_km)}/km
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLoginTarget(t);
                                                setLoginEmail(t.user?.email || '');
                                                setLoginPassword('');
                                            }}
                                            className="border border-brand-border bg-white text-brand-dark px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
                                        >
                                            {t.user ? 'Reset Login' : '+ Add Login'}
                                        </button>

                                        {t.status === 'pending' && (
                                            <button
                                                type="button"
                                                onClick={() => approveTransporter(t.id)}
                                                className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                                            >
                                                Approve
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

            {/* Add Transporter Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 max-w-lg w-full shadow-2xl relative my-8">
                        <div className="flex justify-between items-center pb-4 border-b border-brand-border mb-5">
                            <h3 className="text-lg font-bold text-brand-dark">Add Transporter & Rate Card</h3>
                            <button type="button" onClick={() => setIsAddOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Driver / Business Name *</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g. Samuel Mutiso Logistics"
                                    className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm"
                                    required
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        placeholder="0712345678"
                                        className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Vehicle Type *</label>
                                    <select
                                        value={form.data.vehicle_type}
                                        onChange={(e) => form.setData('vehicle_type', e.target.value)}
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
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="driver@logistics.co.ke"
                                        className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Portal Password (Optional)</label>
                                    <input
                                        type="password"
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        placeholder="min 8 chars"
                                        className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Base Fare (KSh)</label>
                                    <input
                                        type="number"
                                        value={form.data.base_fare}
                                        onChange={(e) => form.setData('base_fare', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Rate/KG (KSh)</label>
                                    <input
                                        type="number"
                                        value={form.data.rate_per_kg}
                                        onChange={(e) => form.setData('rate_per_kg', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Rate/KM (KSh)</label>
                                    <input
                                        type="number"
                                        value={form.data.rate_per_km}
                                        onChange={(e) => form.setData('rate_per_km', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Base Town / Area</label>
                                    <input
                                        type="text"
                                        value={form.data.area}
                                        onChange={(e) => form.setData('area', e.target.value)}
                                        placeholder="Mombasa Road"
                                        className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Plate Number</label>
                                    <input
                                        type="text"
                                        value={form.data.plate_number}
                                        onChange={(e) => form.setData('plate_number', e.target.value)}
                                        placeholder="KDF 123A"
                                        className="w-full bg-brand-input rounded-xl px-4 py-2.5 text-sm uppercase font-mono"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full mt-2 bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer"
                            >
                                {form.processing ? 'Saving...' : 'Save & Approve Transporter'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}