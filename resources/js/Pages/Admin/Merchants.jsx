import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '../../Layouts/AdminLayout';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

export default function AdminMerchants({ merchants = [], stats = {} }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [copiedField, setCopiedField] = useState(null);

    // Onboard Merchant Modal
    const [onboardOpen, setOnboardOpen] = useState(false);
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

    // Attach / Reset Login Modal
    const [loginTarget, setLoginTarget] = useState(null);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginSaving, setLoginSaving] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const [bannerMessage, setBannerMessage] = useState(null);

    // Merchant Detail Inspector Modal
    const [inspectTarget, setInspectTarget] = useState(null);

    const copyValue = (label, value) => {
        if (!value) return;
        navigator.clipboard?.writeText(value);
        setCopiedField(label);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const estimatedCommission = merchants.reduce(
        (sum, m) => sum + ((Number(m.paid_volume || 0) * Number(m.fee_percent || 0)) / 100),
        0
    );

    const conversionRate = stats.total_sessions > 0
        ? Math.round(((stats.paid_count || 0) / stats.total_sessions) * 100)
        : 0;

    const activeCount = merchants.filter((m) => m.status === 'active').length;
    const suspendedCount = merchants.filter((m) => m.status !== 'active').length;

    const filteredMerchants = merchants.filter((m) => {
        if (statusFilter === 'active' && m.status !== 'active') return false;
        if (statusFilter === 'suspended' && m.status === 'active') return false;

        const q = search.trim().toLowerCase();
        if (!q) return true;

        return (
            m.name?.toLowerCase().includes(q) ||
            m.slug?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q) ||
            m.login_email?.toLowerCase().includes(q)
        );
    });

    const submitOnboard = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);
        try {
            const res = await axios.post('/admin/merchants', form);
            setCreatedCreds(res.data);
            setOnboardOpen(false);
            setForm({
                name: '',
                email: '',
                password: '',
                logo_url: '',
                webhook_url: '',
                fee_percent: '2.5',
                mode: 'live',
            });
            router.reload({ only: ['merchants', 'stats'] });
        } catch (err) {
            const fieldErrors = err.response?.data?.errors;
            if (fieldErrors) {
                const firstErr = Object.values(fieldErrors).flat()[0];
                setError(firstErr || 'Please check the form inputs.');
            } else {
                setError(err.response?.data?.message || 'Failed to create merchant.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const submitLogin = async (e) => {
        e.preventDefault();
        if (!loginTarget) return;
        setLoginSaving(true);
        setLoginError(null);
        try {
            const res = await axios.post(`/admin/merchants/${loginTarget.id}/login`, {
                email: loginEmail,
                password: loginPassword,
            });
            setBannerMessage(res.data.message);
            setLoginTarget(null);
            setLoginPassword('');
            router.reload({ only: ['merchants'] });
        } catch (err) {
            setLoginError(err.response?.data?.message || 'Failed to save login.');
        } finally {
            setLoginSaving(false);
        }
    };

    const handleToggleStatus = (merchant) => {
        const action = merchant.status === 'active' ? 'suspend' : 'activate';
        if (
            merchant.status === 'active' &&
            !confirm(`Suspend ${merchant.name}? Their API keys will stop creating checkout sessions immediately.`)
        ) {
            return;
        }

        router.post(`/admin/merchants/${merchant.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setBannerMessage(`${merchant.name} has been ${action === 'suspend' ? 'suspended' : 'activated'}.`);
            },
        });
    };

    return (
        <AdminLayout title="Merchants Directory — Evopay Admin">
            <div className="space-y-6">
                {/* Header Strip */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
                            Merchants Directory
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                            Manage API credentials, portal access, and fee rates across all connected stores.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setError(null);
                            setOnboardOpen(true);
                        }}
                        className="bg-brand-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-brand-secondary transition shadow-xs cursor-pointer"
                    >
                        + Onboard Merchant
                    </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Active Merchants</p>
                        <p className="text-2xl font-extrabold text-brand-dark mt-1">
                            {activeCount}
                            <span className="text-xs font-semibold text-gray-400 ml-1.5">/ {merchants.length} total</span>
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Gateway Volume</p>
                        <p className="text-2xl font-extrabold text-brand-primary mt-1">
                            {formatKES(stats.paid_volume)}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Est. Platform Revenue</p>
                        <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                            {formatKES(estimatedCommission)}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Session Conversion</p>
                        <p className="text-2xl font-extrabold text-brand-dark mt-1">
                            {conversionRate}%
                            <span className="text-xs font-semibold text-gray-400 ml-1.5">
                                ({stats.paid_count ?? 0}/{stats.total_sessions ?? 0})
                            </span>
                        </p>
                    </div>
                </div>

                {/* Banner messages */}
                {bannerMessage && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between gap-3 text-sm font-semibold text-emerald-800">
                        <span>{bannerMessage}</span>
                        <button
                            type="button"
                            onClick={() => setBannerMessage(null)}
                            className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {createdCreds && (
                    <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/90 p-5 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                                    Shown Once
                                </span>
                                <h3 className="text-sm font-extrabold text-emerald-950 mt-1">
                                    {createdCreds.merchant.name} is ready for integration
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCreatedCreds(null)}
                                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                            >
                                Dismiss
                            </button>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-white rounded-xl border border-emerald-200 p-3">
                                <p className="text-[10px] font-bold uppercase text-gray-400">Login Email</p>
                                <p className="font-semibold text-brand-dark mt-0.5 truncate">{createdCreds.login_email}</p>
                                <button
                                    type="button"
                                    onClick={() => copyValue('email', createdCreds.login_email)}
                                    className="mt-1 text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                >
                                    {copiedField === 'email' ? 'Copied!' : 'Copy Email'}
                                </button>
                            </div>
                            <div className="bg-white rounded-xl border border-emerald-200 p-3">
                                <p className="text-[10px] font-bold uppercase text-gray-400">Public Key</p>
                                <p className="font-mono text-brand-dark mt-0.5 truncate">{createdCreds.public_key}</p>
                                <button
                                    type="button"
                                    onClick={() => copyValue('pk', createdCreds.public_key)}
                                    className="mt-1 text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                >
                                    {copiedField === 'pk' ? 'Copied!' : 'Copy Public Key'}
                                </button>
                            </div>
                            <div className="bg-white rounded-xl border border-emerald-200 p-3">
                                <p className="text-[10px] font-bold uppercase text-gray-400">Secret Key</p>
                                <p className="font-mono font-bold text-brand-dark mt-0.5 truncate">{createdCreds.secret_key}</p>
                                <button
                                    type="button"
                                    onClick={() => copyValue('sk', createdCreds.secret_key)}
                                    className="mt-1 text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                >
                                    {copiedField === 'sk' ? 'Copied!' : 'Copy Secret Key'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-gray-200">
                        {[
                            { key: 'all', label: `All (${merchants.length})` },
                            { key: 'active', label: `Active (${activeCount})` },
                            { key: 'suspended', label: `Suspended (${suspendedCount})` },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setStatusFilter(tab.key)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    statusFilter === tab.key
                                        ? 'bg-brand-dark text-white'
                                        : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, slug, or email..."
                        className="w-full sm:w-72 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    {filteredMerchants.length === 0 ? (
                        <div className="p-12 text-center text-sm text-gray-500">
                            No merchants match your search filter.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="py-3.5 px-5">Merchant</th>
                                        <th className="py-3.5 px-4">Portal Account</th>
                                        <th className="py-3.5 px-4">Paid Volume</th>
                                        <th className="py-3.5 px-4">Fee Rate</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredMerchants.map((m) => {
                                        const mRate = m.checkout_sessions_count > 0
                                            ? Math.round((m.paid_count / m.checkout_sessions_count) * 100)
                                            : 0;

                                        return (
                                            <tr key={m.id} className="hover:bg-gray-50/70 transition">
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                                                            {m.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-brand-dark leading-tight">{m.name}</p>
                                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{m.slug}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    {m.has_login ? (
                                                        <div>
                                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                                Portal Active
                                                            </span>
                                                            <p className="text-xs text-gray-600 mt-1">{m.login_email}</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                                No Login Yet
                                                            </span>
                                                            <p className="text-xs text-gray-400 mt-1">{m.email || '—'}</p>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4">
                                                    <p className="font-extrabold text-brand-dark">{formatKES(m.paid_volume)}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {m.paid_count}/{m.checkout_sessions_count} paid ({mRate}%)
                                                    </p>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <p className="font-semibold text-brand-dark">{m.fee_percent}%</p>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <span
                                                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                                                            m.status === 'active'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}
                                                    >
                                                        {m.status}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-5 text-right">
                                                    <div className="inline-flex items-center gap-3 text-xs font-bold">
                                                        <button
                                                            type="button"
                                                            onClick={() => setInspectTarget(m)}
                                                            className="text-gray-600 hover:text-brand-dark cursor-pointer"
                                                        >
                                                            Details
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setLoginTarget(m);
                                                                setLoginEmail(m.login_email || m.email || '');
                                                                setLoginPassword('');
                                                                setLoginError(null);
                                                            }}
                                                            className="text-brand-dark hover:underline cursor-pointer"
                                                        >
                                                            {m.has_login ? 'Reset Login' : '+ Add Login'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleStatus(m)}
                                                            className={`hover:underline cursor-pointer ${
                                                                m.status === 'active' ? 'text-red-600' : 'text-emerald-600'
                                                            }`}
                                                        >
                                                            {m.status === 'active' ? 'Suspend' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: Onboard New Merchant */}
            {onboardOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-5">
                            <div>
                                <h2 className="text-lg font-extrabold text-brand-dark">Onboard New Merchant</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Creates business profile, API keys, and portal login.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOnboardOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 font-bold text-xs cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitOnboard} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Business Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-transparent"
                                    placeholder="e.g. Nairobi Hardware Ltd"
                                    required
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Portal Login Email *</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-transparent"
                                        placeholder="owner@business.co.ke"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Portal Password *</label>
                                    <input
                                        type="password"
                                        minLength={8}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-transparent"
                                        placeholder="Min 8 characters"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Platform Fee (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="50"
                                        value={form.fee_percent}
                                        onChange={(e) => setForm({ ...form, fee_percent: e.target.value })}
                                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Initial Key Mode</label>
                                    <select
                                        value={form.mode}
                                        onChange={(e) => setForm({ ...form, mode: e.target.value })}
                                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-transparent"
                                    >
                                        <option value="live">Live (Production)</option>
                                        <option value="test">Test (Sandbox)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Logo URL (optional)</label>
                                <input
                                    type="url"
                                    value={form.logo_url}
                                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Webhook URL (optional)</label>
                                <input
                                    type="url"
                                    value={form.webhook_url}
                                    onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
                                    placeholder="https://theirshop.co.ke/api/evopay/webhook"
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-transparent"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer disabled:opacity-50"
                            >
                                {isSaving ? 'Creating Merchant...' : 'Create Merchant & Generate Keys'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Attach / Reset Login */}
            {loginTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                            <h3 className="font-extrabold text-base text-brand-dark">
                                {loginTarget.has_login ? 'Reset' : 'Create'} Portal Login · {loginTarget.name}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setLoginTarget(null)}
                                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitLogin} className="space-y-4">
                            {loginError && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                                    {loginError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold mb-1">Login Email</label>
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1">New Password (min 8 chars)</label>
                                <input
                                    type="password"
                                    minLength={8}
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-transparent"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loginSaving}
                                className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer disabled:opacity-50"
                            >
                                {loginSaving ? 'Saving...' : 'Save Portal Login'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Details Inspector */}
            {inspectTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                            <div>
                                <h3 className="font-extrabold text-base text-brand-dark">{inspectTarget.name}</h3>
                                <p className="text-xs font-mono text-gray-400">{inspectTarget.slug}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInspectTarget(null)}
                                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Status</span>
                                <span className="font-bold uppercase text-brand-dark">{inspectTarget.status}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Portal Login Email</span>
                                <span className="font-semibold text-brand-dark">{inspectTarget.login_email || 'Not configured'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Paid Volume</span>
                                <span className="font-bold text-brand-primary">{formatKES(inspectTarget.paid_volume)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Platform Fee</span>
                                <span className="font-semibold text-brand-dark">{inspectTarget.fee_percent}%</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setInspectTarget(null)}
                                className="w-full bg-gray-100 text-brand-dark py-3 rounded-xl font-bold text-xs hover:bg-gray-200 transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}