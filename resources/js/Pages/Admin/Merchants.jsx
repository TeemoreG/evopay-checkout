import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import MainLayout from '../../Layouts/MainLayout';

export default function AdminMerchants({ merchants = [] }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        logo_url: '',
        webhook_url: '',
        fee_percent: '2.5',
        mode: 'live',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [createdCreds, setCreatedCreds] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);
        try {
            const res = await axios.post('/admin/merchants', form);
            setCreatedCreds(res.data);
            setForm({ name: '', email: '', password: '', logo_url: '', webhook_url: '', fee_percent: '2.5', mode: 'live' });
            router.reload({ only: ['merchants'] });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create merchant.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <MainLayout minimal>
            <Head title="Admin Merchants — Evopay" />

            <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark">Merchants</h1>
                    <p className="text-gray-500 mt-1">Onboard external businesses and manage gateway access.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/orders" className="bg-white border border-brand-border text-brand-dark px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50">
                        Orders
                    </Link>
                    <Link href="/admin" className="bg-white border border-brand-border text-brand-dark px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50">
                        ← Back to Admin
                    </Link>
                </div>
            </div>

            {createdCreds && (
                <div className="mb-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-5 text-sm">
                    <p className="font-extrabold text-emerald-900">Merchant Created: {createdCreds.merchant.name}</p>
                    <p className="text-xs text-emerald-800 mt-1">Login Email: <strong>{createdCreds.login_email}</strong></p>
                    <p className="text-xs font-mono text-brand-dark mt-2">Public Key: {createdCreds.public_key}</p>
                    <p className="text-xs font-mono font-bold text-brand-dark mt-1">Secret Key (shown once): {createdCreds.secret_key}</p>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
                <form onSubmit={submit} className="bg-white rounded-2xl border border-brand-border p-6 shadow-xs space-y-4">
                    <h2 className="text-lg font-bold text-brand-dark">Onboard New Merchant</h2>
                    {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}

                    <div>
                        <label className="block text-xs font-semibold mb-1">Business Name *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                            required
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1">Login Email *</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Portal Password *</label>
                            <input
                                type="password"
                                minLength={8}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1">Platform Fee (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={form.fee_percent}
                                onChange={(e) => setForm({ ...form, fee_percent: e.target.value })}
                                className="w-full bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Initial Key Mode</label>
                            <select
                                value={form.mode}
                                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                                className="w-full bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                            >
                                <option value="live">Live</option>
                                <option value="test">Test</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1">Logo URL (optional)</label>
                        <input
                            type="url"
                            value={form.logo_url}
                            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                            className="w-full bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer"
                    >
                        {isSaving ? 'Creating...' : 'Create Merchant & Generate Keys'}
                    </button>
                </form>

                <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-xs space-y-3">
                    <h2 className="text-lg font-bold text-brand-dark">Active Merchants ({merchants.length})</h2>
                    {merchants.map((m) => (
                        <div key={m.id} className="p-4 rounded-xl border border-brand-border flex items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-brand-dark">{m.name}</span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                        m.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {m.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {m.email || m.slug} · {m.checkout_sessions_count} sessions · {m.fee_percent}% fee
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.post(`/admin/merchants/${m.id}/toggle`, {}, { preserveScroll: true })}
                                className="text-xs font-bold text-brand-primary hover:underline cursor-pointer"
                            >
                                {m.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}