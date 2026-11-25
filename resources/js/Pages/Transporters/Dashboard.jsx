import { Head, router, useForm } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

export default function TransporterDashboard({ transporter, orders = [] }) {
    const rateForm = useForm({
        base_fare: transporter.base_fare,
        rate_per_kg: transporter.rate_per_kg,
        rate_per_km: transporter.rate_per_km,
        area: transporter.area || '',
        plate_number: transporter.plate_number || '',
    });

    const submitRates = (e) => {
        e.preventDefault();
        rateForm.post('/transporter/rates', { preserveScroll: true });
    };

    const toggleAvailability = () => {
        router.post('/transporter/availability', {}, { preserveScroll: true });
    };

    return (
        <MainLayout minimal homeHref="/transporter">
            <Head title={`${transporter.name} — Transporter Portal`} />

            {/* Header */}
            <div className="mb-8 flex flex-wrap justify-between items-end gap-4 pb-6 border-b border-brand-border">
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-primary">
                        Transporter Portal
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-1">
                        {transporter.name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {transporter.vehicle_type} · {transporter.phone} {transporter.plate_number ? `· ${transporter.plate_number}` : ''}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={toggleAvailability}
                        className={`px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-xs ${
                            transporter.is_available
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        <span className={`w-2.5 h-2.5 rounded-full ${transporter.is_available ? 'bg-white animate-pulse' : 'bg-gray-500'}`} />
                        <span>{transporter.is_available ? 'Online (Accepting Jobs)' : 'Offline (Busy)'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="bg-white border border-brand-border text-gray-700 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Rate Card Settings */}
                <form onSubmit={submitRates} className="bg-white rounded-2xl border border-brand-border p-6 shadow-xs space-y-4">
                    <h2 className="text-lg font-bold text-brand-dark">Your Rate Card & Vehicle</h2>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Customers' delivery estimates are calculated automatically using your base fare and weight/distance rates.
                    </p>

                    {rateForm.recentlySuccessful && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                            Rate card updated successfully.
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-brand-dark mb-1">Base Fare (KSh)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={rateForm.data.base_fare}
                            onChange={(e) => rateForm.setData('base_fare', e.target.value)}
                            className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-brand-dark mb-1">Rate per KG (KSh)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={rateForm.data.rate_per_kg}
                                onChange={(e) => rateForm.setData('rate_per_kg', e.target.value)}
                                className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-brand-dark mb-1">Rate per KM (KSh)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={rateForm.data.rate_per_km}
                                onChange={(e) => rateForm.setData('rate_per_km', e.target.value)}
                                className="w-full bg-brand-input rounded-xl px-3.5 py-2.5 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-brand-dark mb-1">Operating Town / Base</label>
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

                    <button
                        type="submit"
                        disabled={rateForm.processing}
                        className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer disabled:opacity-50"
                    >
                        {rateForm.processing ? 'Saving...' : 'Update Rate Card'}
                    </button>
                </form>

                {/* Right Column: Assigned Hauling Jobs */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-border p-6 shadow-xs">
                    <h2 className="text-lg font-bold text-brand-dark mb-4">Assigned Delivery Jobs ({orders.length})</h2>

                    {orders.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 text-sm bg-brand-light rounded-xl border border-brand-border">
                            No delivery jobs assigned yet. When customers book you at checkout and complete payment, they will appear here.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((o) => (
                                <div key={o.id} className="p-4 rounded-2xl border border-brand-border bg-brand-light space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border pb-3">
                                        <div>
                                            <span className="font-mono font-bold text-sm text-brand-dark">{o.order_number}</span>
                                            <span className="ml-2 text-xs uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                                Paid
                                            </span>
                                        </div>
                                        <p className="text-sm font-extrabold text-brand-primary">
                                            Estimated Haul Fee: {formatKES(o.delivery?.estimated_fee || 0)}
                                        </p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <p className="font-bold text-gray-400 uppercase">Customer Contact</p>
                                            <p className="font-semibold text-brand-dark mt-0.5">{o.customer?.name}</p>
                                            <a href={`tel:${o.customer?.phone}`} className="text-brand-primary font-bold hover:underline">
                                                {o.customer?.phone}
                                            </a>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-400 uppercase">Site Destination</p>
                                            <p className="font-semibold text-brand-dark mt-0.5">{o.delivery?.formatted || 'Standard Site'}</p>
                                            {o.delivery?.notes && <p className="text-gray-500 mt-0.5">Notes: {o.delivery.notes}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}