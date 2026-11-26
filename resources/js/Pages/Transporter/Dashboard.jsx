import { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const vehicleOptions = [
    'Pickup (1 - 2 Tonnes)',
    'Canter (3 - 5 Tonnes)',
    'Tipper / Lorry (7 - 10 Tonnes)',
    'Trailer / Prime Mover (20+ Tonnes)',
    'Tuk-Tuk / Delivery Van',
    'Motorbike / Courier',
];

const orderStatusMeta = {
    paid: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Ready for Pickup',
    },
    delivered: {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        label: 'Delivered',
    },
    pending: {
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Awaiting Payment',
    },
    cancelled: {
        badge: 'bg-gray-100 text-gray-600 border-gray-200',
        dot: 'bg-gray-400',
        label: 'Cancelled',
    },
    failed: {
        badge: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        label: 'Failed',
    },
};

export default function TransporterDashboard({ transporter, stats = {}, orders = [] }) {
    const [activeTab, setActiveTab] = useState('jobs');
    const [jobFilter, setJobFilter] = useState('active');
    const [simWeight, setSimWeight] = useState(500);
    const [simKm, setSimKm] = useState(12);

    const rateForm = useForm({
        vehicle_type: transporter.vehicle_type || vehicleOptions[0],
        base_fare: transporter.base_fare,
        rate_per_kg: transporter.rate_per_kg,
        rate_per_km: transporter.rate_per_km,
        area: transporter.area || '',
        plate_number: transporter.plate_number || '',
    });

    const profileForm = useForm({
        name: transporter.name || '',
        phone: transporter.phone || '',
        area: transporter.area || '',
        plate_number: transporter.plate_number || '',
        id_number: transporter.id_number || '',
    });

    useEffect(() => {
        const refresh = () => {
            router.reload({ only: ['transporter', 'stats', 'orders'], preserveScroll: true });
        };
        window.addEventListener('focus', refresh);
        const timer = setInterval(refresh, 10000);
        return () => {
            window.removeEventListener('focus', refresh);
            clearInterval(timer);
        };
    }, []);

    const submitRates = (e) => {
        e.preventDefault();
        rateForm.post('/transporter/rates', { preserveScroll: true });
    };

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.post('/transporter/profile', { preserveScroll: true });
    };

    const toggleAvailability = () => {
        router.post('/transporter/availability', {}, { preserveScroll: true });
    };

    const markDelivered = (orderId, orderNumber) => {
        if (confirm(`Confirm order ${orderNumber} is offloaded and delivered? This will also mark you back Online.`)) {
            router.post(`/transporter/orders/${orderId}/delivered`, {}, { preserveScroll: true });
        }
    };

    const filteredOrders = orders.filter((o) => {
        if (jobFilter === 'active') return o.status === 'paid';
        if (jobFilter === 'completed') return o.status === 'delivered';
        return true;
    });

    const simulatedTotal =
        Number(rateForm.data.base_fare || 0) +
        Number(simWeight || 0) * Number(rateForm.data.rate_per_kg || 0) +
        Number(simKm || 0) * Number(rateForm.data.rate_per_km || 0);

    const buildMapsUrl = (delivery) => {
        if (delivery?.lat && delivery?.lng) {
            return `https://www.google.com/maps/search/?api=1&query=${delivery.lat},${delivery.lng}`;
        }
        if (delivery?.formatted) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(delivery.formatted)}`;
        }
        return null;
    };

    return (
        <MainLayout minimal homeHref="/transporter">
            <Head title={`${transporter.name} — Driver Portal`} />

            <div className="max-w-5xl mx-auto pb-20 md:pb-8">
                {/* Clean Light Header & Status Card */}
                <div className="bg-white rounded-2xl border border-brand-border p-5 sm:p-6 shadow-xs mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.5a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 4.5v9.75m12 0H2.25m12 0v5.25" />
                                </svg>
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                                        Driver Portal
                                    </span>
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        {transporter.status}
                                    </span>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark mt-0.5 truncate">
                                    {transporter.name}
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                    {transporter.vehicle_type}
                                    {transporter.plate_number ? ` · ${transporter.plate_number}` : ''}
                                    {transporter.area ? ` · ${transporter.area}` : ''}
                                </p>
                            </div>
                        </div>

                        {/* Availability Switch + Labeled Logout */}
                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-brand-border">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={transporter.is_available}
                                onClick={toggleAvailability}
                                className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border transition cursor-pointer ${
                                    transporter.is_available
                                        ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70'
                                        : 'bg-brand-light border-brand-border hover:bg-gray-100'
                                }`}
                            >
                                <div className="text-left">
                                    <p className={`text-xs font-extrabold leading-tight ${transporter.is_available ? 'text-emerald-800' : 'text-brand-dark'}`}>
                                        {transporter.is_available ? 'Online' : 'Offline'}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                        {transporter.is_available ? 'Accepting jobs' : 'Paused'}
                                    </p>
                                </div>

                                <span
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                                        transporter.is_available ? 'bg-emerald-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                                            transporter.is_available ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => router.post('/logout')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-brand-dark transition cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* KPI Metrics Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-brand-border">
                        <div className="bg-brand-light rounded-xl p-3.5 border border-brand-border">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Jobs</p>
                            <p className="text-xl font-extrabold text-brand-dark mt-0.5">{stats.active_jobs ?? 0}</p>
                        </div>
                        <div className="bg-brand-light rounded-xl p-3.5 border border-brand-border">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Completed</p>
                            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{stats.completed_jobs ?? 0}</p>
                        </div>
                        <div className="bg-brand-light rounded-xl p-3.5 border border-brand-border">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Est. Earnings</p>
                            <p className="text-xl font-extrabold text-brand-primary mt-0.5">{formatKES(stats.estimated_earnings ?? 0)}</p>
                        </div>
                        <div className="bg-brand-light rounded-xl p-3.5 border border-brand-border">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Weight Hauled</p>
                            <p className="text-xl font-extrabold text-brand-dark mt-0.5">{stats.total_weight_kg ?? 0} KG</p>
                        </div>
                    </div>
                </div>

                {/* Desktop Multi-Page Segmented Navigation */}
                <div className="hidden md:flex items-center gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-brand-border w-fit shadow-xs">
                    {[
                        { id: 'jobs', label: `Dispatch Jobs (${orders.length})` },
                        { id: 'rates', label: 'Rate Card & Calculator' },
                        { id: 'profile', label: 'Truck & ID Profile' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                activeTab === tab.id
                                    ? 'bg-brand-dark text-white shadow-xs'
                                    : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* PAGE 1: Dispatch Jobs */}
                {activeTab === 'jobs' && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-extrabold text-brand-dark">Assigned Haulage Jobs</h2>
                            <div className="inline-flex gap-1 bg-white p-1 rounded-xl border border-brand-border">
                                {[
                                    { id: 'active', label: 'Active' },
                                    { id: 'completed', label: 'Completed' },
                                    { id: 'all', label: 'All' },
                                ].map((f) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() => setJobFilter(f.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            jobFilter === f.id
                                                ? 'bg-brand-dark text-white'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-brand-border p-10 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-brand-light text-gray-400 flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-bold text-brand-dark">No jobs in this view yet</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Make sure your status switch is set to <strong>Online</strong> so shoppers can book your vehicle at checkout.
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {filteredOrders.map((o) => {
                                    const meta = orderStatusMeta[o.status] || orderStatusMeta.pending;
                                    const mapsUrl = buildMapsUrl(o.delivery);

                                    return (
                                        <div key={o.id} className="bg-white rounded-3xl border border-brand-border p-5 shadow-xs flex flex-col justify-between space-y-4">
                                            <div>
                                                <div className="flex items-start justify-between gap-2 pb-3 border-b border-brand-border">
                                                    <div>
                                                        <span className="font-mono font-extrabold text-sm text-brand-dark">{o.order_number}</span>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                                            {new Date(o.created_at).toLocaleString('en-KE')}
                                                        </p>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${meta.badge}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                                        {meta.label}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 my-3.5 bg-brand-light rounded-2xl p-3 border border-brand-border text-center">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase text-gray-400">Est. Fare</p>
                                                        <p className="text-sm font-extrabold text-brand-primary mt-0.5">
                                                            {formatKES(o.delivery?.estimated_transport_fee || 0)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase text-gray-400">Distance</p>
                                                        <p className="text-sm font-extrabold text-brand-dark mt-0.5">
                                                            {o.delivery?.distance_km || 0} km
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase text-gray-400">Cargo Weight</p>
                                                        <p className="text-sm font-extrabold text-brand-dark mt-0.5">
                                                            {o.delivery?.total_weight_kg || 0} kg
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5 text-xs">
                                                    <div className="flex items-start gap-2">
                                                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                        </svg>
                                                        <div>
                                                            <p className="font-bold text-brand-dark">{o.customer?.name || 'Customer'}</p>
                                                            <p className="text-gray-500">{o.customer?.phone || '—'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <svg className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                                        </svg>
                                                        <div>
                                                            <p className="font-semibold text-brand-dark">{o.delivery?.formatted || 'Site Address'}</p>
                                                            {o.delivery?.landmark && <p className="text-gray-500">Landmark: {o.delivery.landmark}</p>}
                                                            {o.delivery?.notes && <p className="text-gray-500">Notes: {o.delivery.notes}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 border-t border-brand-border/70">
                                                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Materials to Load</p>
                                                        <ul className="space-y-0.5 text-gray-700">
                                                            {(o.items || []).map((item, idx) => (
                                                                <li key={idx}>• {item.qty} × {item.productName} ({item.unitLabel})</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-brand-border flex flex-wrap gap-2">
                                                {o.customer?.phone && (
                                                    <a
                                                        href={`tel:${o.customer.phone}`}
                                                        className="flex-1 bg-brand-light border border-brand-border text-brand-dark py-2.5 px-3 rounded-xl font-bold text-xs hover:bg-gray-100 transition inline-flex items-center justify-center gap-1.5"
                                                    >
                                                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H3.75A2.25 2.25 0 001.5 4.5v2.25z" />
                                                        </svg>
                                                        <span>Call Buyer</span>
                                                    </a>
                                                )}

                                                {mapsUrl && (
                                                    <a
                                                        href={mapsUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex-1 bg-brand-light border border-brand-border text-brand-dark py-2.5 px-3 rounded-xl font-bold text-xs hover:bg-gray-100 transition inline-flex items-center justify-center gap-1.5"
                                                    >
                                                        <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                                                        </svg>
                                                        <span>Navigate</span>
                                                    </a>
                                                )}

                                                {o.status === 'paid' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => markDelivered(o.id, o.order_number)}
                                                        className="w-full bg-emerald-600 text-white py-2.5 px-3 rounded-xl font-bold text-xs hover:bg-emerald-700 transition cursor-pointer inline-flex items-center justify-center gap-1.5"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                        <span>Mark Delivered & Go Online</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* PAGE 2: Rate Card & Simulator */}
                {activeTab === 'rates' && (
                    <div className="grid lg:grid-cols-2 gap-6 items-start">
                        <form onSubmit={submitRates} className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
                            <div>
                                <h2 className="text-lg font-extrabold text-brand-dark">Rate Card & Truck Details</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Customers see live haulage estimates computed from these exact rates.
                                </p>
                            </div>

                            {rateForm.recentlySuccessful && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                                    Rate card updated successfully.
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Vehicle Type</label>
                                <select
                                    value={rateForm.data.vehicle_type}
                                    onChange={(e) => rateForm.setData('vehicle_type', e.target.value)}
                                    className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                                >
                                    {vehicleOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Base Fare</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={rateForm.data.base_fare}
                                        onChange={(e) => rateForm.setData('base_fare', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Rate / KG</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={rateForm.data.rate_per_kg}
                                        onChange={(e) => rateForm.setData('rate_per_kg', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Rate / KM</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={rateForm.data.rate_per_km}
                                        onChange={(e) => rateForm.setData('rate_per_km', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3 py-2.5 text-sm font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Operating Base</label>
                                    <input
                                        type="text"
                                        value={rateForm.data.area}
                                        onChange={(e) => rateForm.setData('area', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Plate Number</label>
                                    <input
                                        type="text"
                                        value={rateForm.data.plate_number}
                                        onChange={(e) => rateForm.setData('plate_number', e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm uppercase font-mono"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={rateForm.processing}
                                className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer disabled:opacity-50"
                            >
                                {rateForm.processing ? 'Saving...' : 'Save Rate Card'}
                            </button>
                        </form>

                        {/* Trip Quote Simulator */}
                        <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                                    Live Fare Preview
                                </span>
                                <h3 className="text-lg font-extrabold text-brand-dark mt-0.5">Trip Quote Simulator</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Test what customers will be quoted for different cargo weights and distances.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Test Weight (KG)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={simWeight}
                                        onChange={(e) => setSimWeight(e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Test Distance (KM)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={simKm}
                                        onChange={(e) => setSimKm(e.target.value)}
                                        className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm font-mono"
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-brand-light border border-brand-border space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Base Fare</span>
                                    <span className="font-mono font-semibold text-brand-dark">{formatKES(rateForm.data.base_fare)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Weight ({simWeight || 0} KG × {formatKES(rateForm.data.rate_per_kg)})</span>
                                    <span className="font-mono font-semibold text-brand-dark">{formatKES((simWeight || 0) * (rateForm.data.rate_per_kg || 0))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Distance ({simKm || 0} KM × {formatKES(rateForm.data.rate_per_km)})</span>
                                    <span className="font-mono font-semibold text-brand-dark">{formatKES((simKm || 0) * (rateForm.data.rate_per_km || 0))}</span>
                                </div>
                                <div className="pt-2.5 border-t border-brand-border flex justify-between items-center text-sm">
                                    <span className="font-bold text-brand-dark">Estimated Driver Payout</span>
                                    <span className="text-lg font-extrabold text-brand-primary font-mono">{formatKES(simulatedTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PAGE 3: Profile & Verification */}
                {activeTab === 'profile' && (
                    <form onSubmit={submitProfile} className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs max-w-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-brand-border pb-4">
                            <div>
                                <h2 className="text-lg font-extrabold text-brand-dark">Driver Verification & Profile</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Update your KYC and fleet credentials on file with Nyumba Cement.</p>
                            </div>
                            <span className="inline-flex items-center text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full capitalize">
                                {transporter.status}
                            </span>
                        </div>

                        {profileForm.recentlySuccessful && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                                Profile updated successfully.
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Driver / Fleet Name *</label>
                                <input
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                                    required
                                />
                                {profileForm.errors.name && <p className="text-red-500 text-xs mt-1">{profileForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Registered Phone *</label>
                                <input
                                    type="tel"
                                    value={profileForm.data.phone}
                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                    className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm font-mono"
                                    required
                                />
                                {profileForm.errors.phone && <p className="text-red-500 text-xs mt-1">{profileForm.errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">National ID Number</label>
                                <input
                                    type="text"
                                    value={profileForm.data.id_number}
                                    onChange={(e) => profileForm.setData('id_number', e.target.value)}
                                    className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm font-mono"
                                />
                                {profileForm.errors.id_number && <p className="text-red-500 text-xs mt-1">{profileForm.errors.id_number}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Plate Number</label>
                                <input
                                    type="text"
                                    value={profileForm.data.plate_number}
                                    onChange={(e) => profileForm.setData('plate_number', e.target.value)}
                                    className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm uppercase font-mono"
                                />
                                {profileForm.errors.plate_number && <p className="text-red-500 text-xs mt-1">{profileForm.errors.plate_number}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Operating Base</label>
                                <input
                                    type="text"
                                    value={profileForm.data.area}
                                    onChange={(e) => profileForm.setData('area', e.target.value)}
                                    className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                                />
                                {profileForm.errors.area && <p className="text-red-500 text-xs mt-1">{profileForm.errors.area}</p>}
                            </div>

                            <div className="p-3.5 rounded-xl bg-brand-light border border-brand-border flex flex-col justify-center">
                                <p className="text-[11px] font-bold uppercase text-gray-400">ID Document Status</p>
                                <p className="font-bold text-emerald-700 text-xs mt-1">
                                    {transporter.has_id_document ? 'Document on File' : 'Verified Offline'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={profileForm.processing}
                            className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer disabled:opacity-50"
                        >
                            {profileForm.processing ? 'Saving...' : 'Save Profile'}
                        </button>

                        <div className="rounded-2xl bg-brand-light border border-brand-border p-4 text-xs text-gray-600 leading-relaxed">
                            Need to reset credentials or update your ID document? Email{' '}
                            <a href="mailto:support@evopay.africa" className="font-bold text-brand-primary hover:underline">
                                support@evopay.africa
                            </a>{' '}
                            or visit any major Nyumba Cement stockist depot on Enterprise Road, Kombo Munyiri Road, or Kangundo Road.
                        </div>
                    </form>
                )}
            </div>

            {/* Sticky Mobile Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brand-border px-2 py-2 grid grid-cols-3 gap-1 shadow-lg">
                <button
                    type="button"
                    onClick={() => setActiveTab('jobs')}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        activeTab === 'jobs' ? 'text-brand-primary bg-brand-primary/10' : 'text-gray-500'
                    }`}
                >
                    <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.5a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 4.5v9.75m12 0H2.25m12 0v5.25" />
                    </svg>
                    <span>Jobs</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('rates')}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        activeTab === 'rates' ? 'text-brand-primary bg-brand-primary/10' : 'text-gray-500'
                    }`}
                >
                    <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Rates</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        activeTab === 'profile' ? 'text-brand-primary bg-brand-primary/10' : 'text-gray-500'
                    }`}
                >
                    <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span>Profile</span>
                </button>
            </nav>
        </MainLayout>
    );
}