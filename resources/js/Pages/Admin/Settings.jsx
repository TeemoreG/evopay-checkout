import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

export default function AdminSettings({
    hq_lat,
    hq_lng,
    price_per_kg,
    price_per_km,
    unit_measurements = ['piece', 'bag', 'wheelbarrow', 'pickup', 'lorry', 'tonne'],
}) {
    const [newUnit, setNewUnit] = useState('');

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        hq_lat: hq_lat,
        hq_lng: hq_lng,
        price_per_kg: price_per_kg ?? '20',
        price_per_km: price_per_km ?? '50',
        unit_measurements: unit_measurements,
    });

    const addMeasurement = () => {
        const cleaned = newUnit.trim().toLowerCase();
        if (!cleaned) return;
        if (!data.unit_measurements.includes(cleaned)) {
            setData('unit_measurements', [...data.unit_measurements, cleaned]);
        }
        setNewUnit('');
    };

    const removeMeasurement = (unit) => {
        if (data.unit_measurements.length <= 1) return;
        setData(
            'unit_measurements',
            data.unit_measurements.filter((u) => u !== unit)
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/settings', { preserveScroll: true });
    };

    return (
        <MainLayout minimal>
            <Head title="Admin Settings" />

            <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark">Store Settings</h1>
                    <p className="text-gray-500 mt-1">Configure delivery origin, pricing rates, and quantity measurements.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/orders" className="bg-white border border-brand-border text-brand-dark px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition">
                        Orders
                    </Link>
                    <Link href="/admin" className="bg-white border border-brand-border text-brand-dark px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition">
                        ← Back to Inventory
                    </Link>
                </div>
            </div>

            {recentlySuccessful && (
                <div className="max-w-2xl mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
                    Settings saved successfully.
                </div>
            )}

            <div className="max-w-2xl">
                <form onSubmit={submit} className="space-y-6">
                    {/* HQ Coordinates */}
                    <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-1">Delivery HQ Coordinates</h2>
                        <p className="text-sm text-gray-500 mb-5">
                            Used as the origin when calculating driving distance for deliveries.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={data.hq_lat}
                                    onChange={(e) => setData('hq_lat', e.target.value)}
                                    className="w-full bg-brand-input rounded-lg px-4 py-2.5 text-sm"
                                    placeholder="-1.2674"
                                    required
                                />
                                {errors.hq_lat && <p className="text-red-500 text-xs mt-1">{errors.hq_lat}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Longitude</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={data.hq_lng}
                                    onChange={(e) => setData('hq_lng', e.target.value)}
                                    className="w-full bg-brand-input rounded-lg px-4 py-2.5 text-sm"
                                    placeholder="36.7704"
                                    required
                                />
                                {errors.hq_lng && <p className="text-red-500 text-xs mt-1">{errors.hq_lng}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Delivery Rates */}
                    <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-1">Delivery Pricing Rates</h2>
                        <p className="text-sm text-gray-500 mb-5">
                            Delivery fee formula: (Total Weight × Price per KG) + (Rounded KM × Price per KM).
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Price per KG (KSh)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.price_per_kg}
                                    onChange={(e) => setData('price_per_kg', e.target.value)}
                                    className="w-full bg-brand-input rounded-lg px-4 py-2.5 text-sm"
                                    placeholder="20"
                                    required
                                />
                                {errors.price_per_kg && <p className="text-red-500 text-xs mt-1">{errors.price_per_kg}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Price per KM (KSh)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.price_per_km}
                                    onChange={(e) => setData('price_per_km', e.target.value)}
                                    className="w-full bg-brand-input rounded-lg px-4 py-2.5 text-sm"
                                    placeholder="50"
                                    required
                                />
                                {errors.price_per_km && <p className="text-red-500 text-xs mt-1">{errors.price_per_km}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Custom Quantity Measurements */}
                    <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-1">Quantity Measurement Types</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Add any measurement unit for your products (e.g. lorry, wheelbarrow, bag, tonne, pallet).
                        </p>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newUnit}
                                onChange={(e) => setNewUnit(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addMeasurement();
                                    }
                                }}
                                placeholder="e.g. lorry, wheelbarrow, half-lorry"
                                className="flex-1 bg-brand-input rounded-lg px-4 py-2.5 text-sm"
                            />
                            <button
                                type="button"
                                onClick={addMeasurement}
                                className="bg-brand-primary text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-secondary transition"
                            >
                                + Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {data.unit_measurements.map((unit) => (
                                <span
                                    key={unit}
                                    className="inline-flex items-center gap-2 bg-brand-light border border-brand-border text-brand-dark text-xs font-semibold px-3 py-1.5 rounded-full"
                                >
                                    {unit}
                                    <button
                                        type="button"
                                        onClick={() => removeMeasurement(unit)}
                                        className="text-gray-400 hover:text-red-500 font-bold"
                                        title="Remove measurement"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold hover:bg-black transition disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : 'Save Settings'}
                    </button>
                </form>
            </div>
        </MainLayout>
    );
}