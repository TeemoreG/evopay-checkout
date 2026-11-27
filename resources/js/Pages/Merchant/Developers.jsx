import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';

export default function MerchantDevelopers({ merchant, apiKeys = [], deliveries = [] }) {
    const [mobileSection, setMobileSection] = useState('keys'); // 'keys' | 'settings' | 'logs'
    const [keyName, setKeyName] = useState('New API Key');
    const [keyMode, setKeyMode] = useState('live');
    const [creatingKey, setCreatingKey] = useState(false);
    const [newSecretKey, setNewSecretKey] = useState(null);
    const [webhookSecret, setWebhookSecret] = useState(merchant.webhook_secret || '');
    const [rotatingSecret, setRotatingSecret] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const copyText = (id, text) => {
        if (!text) return;
        navigator.clipboard?.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1800);
    };

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

    const CopyIcon = ({ copied }) =>
        copied ? (
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
            </svg>
        );

    return (
        <div className="min-h-screen bg-[#F6F7F9] text-gray-900 flex">
            <Head title="API Keys & Webhooks — Evopay" />

            {/* DESKTOP FULL-HEIGHT SIDEBAR */}
            <aside className="hidden lg:flex w-72 fixed inset-y-0 left-0 bg-white border-r border-gray-200 flex-col justify-between z-30">
                <div>
                    <div className="h-20 px-6 border-b border-gray-200 flex items-center justify-center">
                        <img
                            src="/images/logo.png"
                            onError={(e) => { e.currentTarget.src = '/assets/logo.png'; }}
                            alt="Evopay"
                            className="h-9 w-auto object-contain"
                        />
                    </div>

                    <nav className="p-4 space-y-1">
                        <Link
                            href="/merchant"
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                        >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                            </svg>
                            <span>Wallet & Transactions</span>
                        </Link>

                        <Link
                            href="/merchant/developers"
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold bg-[#E45C25] text-white"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                            </svg>
                            <span>API Keys & Webhooks</span>
                        </Link>
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <Link
                        href="/merchant"
                        className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <span>← Back to Wallet</span>
                    </Link>
                </div>
            </aside>

            {/* MAIN DEVELOPER WORKSPACE */}
            <main className="flex-1 lg:pl-72 min-w-0 pb-24 lg:pb-12">
                <div className="max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-5">
                    {/* Mobile Centered Logo */}
                    <div className="lg:hidden flex items-center justify-center py-1">
                        <img
                            src="/images/logo.png"
                            onError={(e) => { e.currentTarget.src = '/assets/logo.png'; }}
                            alt="Evopay"
                            className="h-8 w-auto object-contain"
                        />
                    </div>

                    {/* Page Heading */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                                API Keys & Webhooks
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                Manage integration keys, callback URLs, and delivery logs.
                            </p>
                        </div>

                        <Link
                            href="/merchant"
                            className="hidden sm:inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3.5 py-2 rounded-xl font-bold text-xs hover:bg-gray-50 transition"
                        >
                            ← Back to Wallet
                        </Link>
                    </div>

                    {/* Mobile Segmented Switcher */}
                    <div className="lg:hidden grid grid-cols-3 gap-1 bg-white p-1 rounded-2xl border border-gray-200">
                        {[
                            { id: 'keys', label: `Keys (${apiKeys.length})` },
                            { id: 'settings', label: 'Webhooks' },
                            { id: 'logs', label: `Logs (${deliveries.length})` },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setMobileSection(tab.id)}
                                className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                    mobileSection === tab.id
                                        ? 'bg-[#E45C25] text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Newly Created Secret Key Banner */}
                    {newSecretKey && (
                        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-extrabold text-emerald-900">Copy your new Secret Key</p>
                                    <p className="text-xs text-emerald-700 mt-0.5">
                                        Shown once only. Store this safely on your backend server.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNewSecretKey(null)}
                                    className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2 bg-white border border-emerald-200 px-3.5 py-2.5 rounded-xl">
                                <code className="text-xs font-mono font-bold text-gray-900 break-all">
                                    {newSecretKey}
                                </code>
                                <button
                                    type="button"
                                    onClick={() => copyText('new-sk', newSecretKey)}
                                    className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 cursor-pointer flex-shrink-0"
                                    title="Copy Secret Key"
                                >
                                    <CopyIcon copied={copiedId === 'new-sk'} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Main Grid (Desktop shows side-by-side, Mobile switches cleanly via tabs) */}
                    <div className="grid lg:grid-cols-2 gap-5 items-start">
                        {/* API Keys Card */}
                        <section className={`${mobileSection === 'keys' ? 'block' : 'hidden'} lg:block bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 space-y-4`}>
                            <div>
                                <h2 className="text-base font-extrabold text-gray-900">API Keys</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Authenticate checkout session requests from your server.</p>
                            </div>

                            <form onSubmit={generateKey} className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={keyName}
                                    onChange={(e) => setKeyName(e.target.value)}
                                    placeholder="Key label (e.g. Storefront)"
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-[#E45C25]"
                                    required
                                />
                                <div className="flex gap-2">
                                    <select
                                        value={keyMode}
                                        onChange={(e) => setKeyMode(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold"
                                    >
                                        <option value="live">Live</option>
                                        <option value="test">Test</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={creatingKey}
                                        className="flex-1 sm:flex-initial bg-[#E45C25] hover:bg-[#CF501D] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer disabled:opacity-50"
                                    >
                                        {creatingKey ? 'Creating...' : '+ Generate'}
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-2.5">
                                {apiKeys.length === 0 ? (
                                    <p className="text-xs text-gray-500 py-4 text-center">No API keys created yet.</p>
                                ) : (
                                    apiKeys.map((k) => (
                                        <div key={k.id} className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">{k.name}</span>
                                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">
                                                        {k.mode}
                                                    </span>
                                                    {!k.is_active && (
                                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                                                            Revoked
                                                        </span>
                                                    )}
                                                </div>
                                                {k.is_active && (
                                                    <button
                                                        type="button"
                                                        onClick={() => revokeKey(k.id)}
                                                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer flex-shrink-0"
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[11px] font-mono text-gray-600">
                                                <span className="truncate">{k.public_key}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => copyText(`pk-${k.id}`, k.public_key)}
                                                    className="text-gray-400 hover:text-[#E45C25] cursor-pointer flex-shrink-0"
                                                    title="Copy Public Key"
                                                >
                                                    <CopyIcon copied={copiedId === `pk-${k.id}`} />
                                                </button>
                                            </div>

                                            <p className="text-[11px] font-mono text-gray-400 px-1">
                                                Secret prefix: {k.secret_key_prefix}...
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Business & Webhook Settings Card */}
                        <form
                            onSubmit={saveSettings}
                            className={`${mobileSection === 'settings' ? 'block' : 'hidden'} lg:block bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 space-y-4`}
                        >
                            <div>
                                <h2 className="text-base font-extrabold text-gray-900">Business & Webhook Settings</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Configure checkout branding and server event callbacks.</p>
                            </div>

                            {settingsForm.recentlySuccessful && (
                                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
                                    Settings saved successfully.
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Business Name</label>
                                <input
                                    type="text"
                                    value={settingsForm.data.name}
                                    onChange={(e) => settingsForm.setData('name', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#E45C25]"
                                    required
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Email</label>
                                    <input
                                        type="email"
                                        value={settingsForm.data.email}
                                        onChange={(e) => settingsForm.setData('email', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Logo URL</label>
                                    <input
                                        type="url"
                                        value={settingsForm.data.logo_url}
                                        onChange={(e) => settingsForm.setData('logo_url', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Webhook URL</label>
                                <input
                                    type="url"
                                    value={settingsForm.data.webhook_url}
                                    onChange={(e) => settingsForm.setData('webhook_url', e.target.value)}
                                    placeholder="https://yourapp.co.ke/api/evopay/webhook"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Default Return URL</label>
                                    <input
                                        type="url"
                                        value={settingsForm.data.default_return_url}
                                        onChange={(e) => settingsForm.setData('default_return_url', e.target.value)}
                                        placeholder="https://yourapp.co.ke/success"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Default Cancel URL</label>
                                    <input
                                        type="url"
                                        value={settingsForm.data.default_cancel_url}
                                        onChange={(e) => settingsForm.setData('default_cancel_url', e.target.value)}
                                        placeholder="https://yourapp.co.ke/cart"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={settingsForm.processing}
                                className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm transition cursor-pointer disabled:opacity-50"
                            >
                                {settingsForm.processing ? 'Saving...' : 'Save Settings'}
                            </button>

                            <div className="pt-4 border-t border-gray-100 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                        Webhook Secret (X-Evopay-Signature)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={rotateSecret}
                                        disabled={rotatingSecret}
                                        className="text-xs font-bold text-[#E45C25] hover:underline cursor-pointer"
                                    >
                                        {rotatingSecret ? 'Rotating...' : 'Rotate Secret'}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                    <code className="text-xs font-mono text-gray-800 break-all">
                                        {webhookSecret || 'Not generated'}
                                    </code>
                                    {webhookSecret && (
                                        <button
                                            type="button"
                                            onClick={() => copyText('whsec', webhookSecret)}
                                            className="text-gray-400 hover:text-[#E45C25] cursor-pointer flex-shrink-0"
                                            title="Copy Webhook Secret"
                                        >
                                            <CopyIcon copied={copiedId === 'whsec'} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Webhook Deliveries Log */}
                    <section className={`${mobileSection === 'logs' ? 'block' : 'hidden'} lg:block bg-white rounded-3xl border border-gray-200 overflow-hidden`}>
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-extrabold text-gray-900">Recent Webhook Deliveries</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Last 30 outbound event attempts.</p>
                            </div>
                            <span className="text-xs font-semibold text-gray-400">{deliveries.length} logs</span>
                        </div>

                        {deliveries.length === 0 ? (
                            <p className="p-8 text-center text-xs text-gray-500">No webhooks dispatched yet.</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {deliveries.map((d) => (
                                    <div key={d.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-gray-900">{d.event}</span>
                                                <span className="text-gray-300">·</span>
                                                <span className="font-mono font-semibold text-gray-700">
                                                    {d.merchant_reference || d.session_token}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 mt-0.5 truncate">{d.url}</p>
                                            {d.error && <p className="text-red-600 mt-0.5">{d.error}</p>}
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                                            <span className={`font-bold px-2.5 py-1 rounded-full text-[11px] ${
                                                d.delivered_at ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                            }`}>
                                                {d.response_code ? `HTTP ${d.response_code}` : 'Failed'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => router.post(`/merchant/webhooks/${d.id}/retry`, {}, { preserveScroll: true })}
                                                className="font-bold text-[#E45C25] hover:underline cursor-pointer"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* MOBILE BOTTOM NAVIGATION (Matches Merchant Dashboard) */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 h-15 bg-white border-t border-gray-200 px-2 grid grid-cols-4 items-center z-40">
                <Link
                    href="/merchant"
                    className="flex flex-col items-center justify-center gap-0.5 text-gray-500 hover:text-gray-900"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                    </svg>
                    <span className="text-[10px] font-bold">Wallet</span>
                </Link>

                <Link
                    href="/merchant"
                    className="flex flex-col items-center justify-center gap-0.5 text-gray-500 hover:text-gray-900"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    <span className="text-[10px] font-bold">Payouts</span>
                </Link>

                <Link
                    href="/merchant/developers"
                    className="flex flex-col items-center justify-center gap-0.5 text-[#E45C25]"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                    <span className="text-[10px] font-bold">API</span>
                </Link>

                <Link
                    href="/merchant"
                    className="flex flex-col items-center justify-center gap-0.5 text-gray-500 hover:text-gray-900"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-[10px] font-bold">Profile</span>
                </Link>
            </nav>
        </div>
    );
}