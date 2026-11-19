import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import MainLayout from '../../Layouts/MainLayout';

export default function MerchantDevelopers({ merchant, apiKeys = [], deliveries = [] }) {
    const [keyName, setKeyName] = useState('New API Key');
    const [keyMode, setKeyMode] = useState('live');
    const [creatingKey, setCreatingKey] = useState(false);
    const [newSecretKey, setNewSecretKey] = useState(null);
    const [webhookSecret, setWebhookSecret] = useState(merchant.webhook_secret || '');
    const [rotatingSecret, setRotatingSecret] = useState(false);

    const settingsForm = useForm({
        name: merchant.name || '',
        email: merchant.email || '',
        logo_url: merchant.logo_url || '',
        webhook_url: merchant.webhook_url || '',
        default_return_url: merchant.default_return_url || '',
        default_cancel_url: merchant.default_cancel_url || '',
    });

    const saveSettings = (e) => {
        e.preventDefault();
        settingsForm.post('/merchant/settings', { preserveScroll: true });
    };

    const generateKey = async (e) => {
        e.preventDefault();
        if (!keyName.trim()) return;
        setCreatingKey(true);
        try {
            const res = await axios.post('/merchant/api-keys', {
                name: keyName.trim(),
                mode: keyMode,
            });
            setNewSecretKey(res.data.secret_key);
            setKeyName('New API Key');
            router.reload({ only: ['apiKeys'] });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to generate API key.');
        } finally {
            setCreatingKey(false);
        }
    };

    const revokeKey = (id) => {
        if (confirm('Revoke this API key? Any app using it will stop working immediately.')) {
            router.delete(`/merchant/api-keys/${id}`, { preserveScroll: true });
        }
    };

    const rotateSecret = async () => {
        if (!confirm('Rotate webhook signing secret? Update your server verification secret immediately after.')) return;
        setRotatingSecret(true);
        try {
            const res = await axios.post('/merchant/webhook-secret');
            setWebhookSecret(res.data.webhook_secret);
        } finally {
            setRotatingSecret(false);
        }
    };

    return (
        <MainLayout minimal>
            <Head title="Developers & Settings — Evopay" />

            <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">API Keys & Webhooks</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your integration keys, checkout branding, and webhook logs.</p>
                </div>
                <Link
                    href="/merchant"
                    className="bg-white border border-brand-border text-brand-dark px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-gray-50 transition"
                >
                    ← Back to Transactions
                </Link>
            </div>

            {newSecretKey && (
                <div className="mb-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-5">
                    <p className="text-sm font-extrabold text-emerald-900">Copy your new Secret Key now</p>
                    <p className="text-xs text-emerald-700 mt-1">
                        For security, we only show this once. Store it safely on your backend server.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <code className="bg-white border border-emerald-200 px-3 py-2 rounded-lg text-xs font-mono font-bold text-brand-dark break-all">
                            {newSecretKey}
                        </code>
                        <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(newSecretKey)}
                            className="bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
                        >
                            Copy Key
                        </button>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Left: Branding & Webhook Settings */}
                <form onSubmit={saveSettings} className="bg-white rounded-2xl border border-brand-border p-6 shadow-xs space-y-4">
                    <h2 className="text-lg font-bold text-brand-dark">Business & Webhook Settings</h2>

                    {settingsForm.recentlySuccessful && (
                        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs font-semibold text-green-800">
                            Settings saved successfully.
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold mb-1">Business Name</label>
                        <input
                            type="text"
                            value={settingsForm.data.name}
                            onChange={(e) => settingsForm.setData('name', e.target.value)}
                            className="w-full bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                            required
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1">Contact Email</label>
                            <input
                                type="email"
                                value={settingsForm.data.email}
                                onChange={(e) => settingsForm.setData('email', e.target.value)}
                                className="w-full bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Logo URL</label>
                            <input
                                type="url"
                                value={settingsForm.data.logo_url}
                                onChange={(e) => settingsForm.setData('logo_url', e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1">Webhook URL</label>
                        <input
                            type="url"
                            value={settingsForm.data.webhook_url}
                            onChange={(e) => settingsForm.setData('webhook_url', e.target.value)}
                            placeholder="https://yourapp.co.ke/api/evopay/webhook"
                            className="w-full bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1">Default Return URL</label>
                            <input
                                type="url"
                                value={settingsForm.data.default_return_url}
                                onChange={(e) => settingsForm.setData('default_return_url', e.target.value)}
                                placeholder="https://yourapp.co.ke/success"
                                className="w-full bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Default Cancel URL</label>
                            <input
                                type="url"
                                value={settingsForm.data.default_cancel_url}
                                onChange={(e) => settingsForm.setData('default_cancel_url', e.target.value)}
                                placeholder="https://yourapp.co.ke/cart"
                                className="w-full bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={settingsForm.processing}
                        className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer"
                    >
                        {settingsForm.processing ? 'Saving...' : 'Save Settings'}
                    </button>

                    <div className="pt-4 border-t border-brand-border">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-500">Webhook Signing Secret (`X-Evopay-Signature`)</span>
                            <button
                                type="button"
                                onClick={rotateSecret}
                                disabled={rotatingSecret}
                                className="text-xs font-bold text-brand-primary hover:underline cursor-pointer"
                            >
                                {rotatingSecret ? 'Rotating...' : 'Rotate Secret'}
                            </button>
                        </div>
                        <code className="block bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-xs font-mono break-all">
                            {webhookSecret || 'Not generated'}
                        </code>
                    </div>
                </form>

                {/* Right: API Keys */}
                <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-xs">
                    <h2 className="text-lg font-bold text-brand-dark mb-4">API Keys</h2>

                    <form onSubmit={generateKey} className="flex flex-wrap gap-2 mb-5">
                        <input
                            type="text"
                            value={keyName}
                            onChange={(e) => setKeyName(e.target.value)}
                            placeholder="Key label (e.g. Production Store)"
                            className="flex-1 min-w-[160px] bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                            required
                        />
                        <select
                            value={keyMode}
                            onChange={(e) => setKeyMode(e.target.value)}
                            className="bg-brand-input rounded-lg px-3 py-2.5 text-sm"
                        >
                            <option value="live">Live</option>
                            <option value="test">Test</option>
                        </select>
                        <button
                            type="submit"
                            disabled={creatingKey}
                            className="bg-brand-primary text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-secondary transition cursor-pointer"
                        >
                            {creatingKey ? 'Creating...' : '+ Generate'}
                        </button>
                    </form>

                    <div className="space-y-3">
                        {apiKeys.map((k) => (
                            <div key={k.id} className="p-3.5 rounded-xl border border-brand-border bg-brand-light flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-brand-dark">{k.name}</span>
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white border border-brand-border">
                                            {k.mode}
                                        </span>
                                        {!k.is_active && (
                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                                                Revoked
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-mono text-gray-500 mt-1 truncate">
                                        Public: {k.public_key} · Secret: {k.secret_key_prefix}...
                                    </p>
                                </div>
                                {k.is_active && (
                                    <button
                                        type="button"
                                        onClick={() => revokeKey(k.id)}
                                        className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                                    >
                                        Revoke
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Webhook Deliveries Log */}
            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-xs">
                <h2 className="text-lg font-bold text-brand-dark mb-4">Recent Webhook Deliveries</h2>
                {deliveries.length === 0 ? (
                    <p className="text-sm text-gray-500">No webhooks dispatched yet.</p>
                ) : (
                    <div className="space-y-2.5">
                        {deliveries.map((d) => (
                            <div key={d.id} className="p-3.5 rounded-xl border border-brand-border flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div>
                                    <span className="font-bold text-brand-dark">{d.event}</span>
                                    <span className="mx-2 text-gray-400">·</span>
                                    <span className="font-semibold">{d.merchant_reference || d.session_token}</span>
                                    <p className="text-gray-500 mt-0.5 truncate max-w-md">{d.url}</p>
                                    {d.error && <p className="text-red-600 mt-0.5">{d.error}</p>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold px-2.5 py-1 rounded-full ${
                                        d.delivered_at ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {d.response_code ? `HTTP ${d.response_code}` : 'Failed'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => router.post(`/merchant/webhooks/${d.id}/retry`, {}, { preserveScroll: true })}
                                        className="font-bold text-brand-primary hover:underline cursor-pointer"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}