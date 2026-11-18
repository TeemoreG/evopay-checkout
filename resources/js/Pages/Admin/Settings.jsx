import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

export default function AdminSettings({ hq_lat, hq_lng }) {
    const { data, setData, post, processing, errors } = useForm({
        hq_lat: hq_lat,
        hq_lng: hq_lng,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/settings');
    };

    return (
        <MainLayout minimal>
            <Head title="Admin Settings" />
            
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark">Store Settings</h1>
                    <p className="text-gray-500 mt-1">Configure your global delivery origin.</p>
                </div>
                <Link href="/admin" className="bg-white border border-brand-border text-brand-dark px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition">
                    ← Back to Inventory
                </Link>
            </div>

            <div className="max-w-xl">
                <form onSubmit={submit} className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4">Delivery HQ Coordinates</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        These coordinates are used to calculate the driving distance for all deliveries.
                    </p>

                    <div className="space-y-4">
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

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full mt-4 bg-brand-dark text-white py-3 rounded-lg font-bold hover:bg-black transition disabled:opacity-50"
                        >
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}