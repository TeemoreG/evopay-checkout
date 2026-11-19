import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import MainLayout from '../../Layouts/MainLayout';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

export default function AdminMerchants({ merchants = [], stats = {} }) {
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

    // Attach / reset login modal state
    const [loginTarget, setLoginTarget] = useState(null);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginSaving, setLoginSaving] = useState(false);
    const [loginMessage, setLoginMessage] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);
        try {
            const res = await axios.post('/admin/merchants', form);
            setCreatedCreds(res.data);
            setForm({ name: '', email: '', password: '', logo_url: '', webhook_url: '', fee_percent: '2.5', mode: 'live' });
            router.reload({ only: ['merchants', 'stats'] });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create merchant.');
        } finally {
            setIsSaving(false);
        }
    };

    const submitLogin = async (e) => {
        e.preventDefault();
        if (!loginTarget) return;
        setLoginSaving(true);
        setLoginMessage(null);
        try {
            const res = await axios.post(`/admin/merchants/${loginTarget.id}/login`, {
                email: loginEmail,
                password: loginPassword,
            });
            setLoginMessage(res.data.message);
            setLoginTarget(null);
            setLoginPassword('');
            router.reload({ only: ['merchants'] });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save login.');
        } finally {
            setLoginSaving(false);
        }
    };

    return (
        <MainLayout minimal homeHref="/admin">
            <Head title="Evopay Platform Admin — Merchants" />

            <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Evopay Gateway Admin</p>
                    <h1 className="text-3xl font-extrabold text-brand-dark mt-0.5">Merchants & Platform</h1>
                    <p className="text-gray-500 mt-1 text-sm">Onboard businesses, manage portal logins, and monitor payment volume.</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <Link href="/admin/transactions" className="bg-brand-dark text-white px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-black transition">
                        Transactions
                    </Link>
                    <Link href="/admin/demo-shop" className="bg-white border border-brand-border text-brand-dark px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-gray-50 transition">
                        Demo Shop
                    </Link>
                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="bg-white border border-brand-border text-gray-600 px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase text-gray-400">Merchants</p>
                    <p className="text-2xl font-extrabold text-brand-dark mt-1">{stats.merchants_count ?? merchants.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase text-gray-400">Gateway Volume</p>
                    <p className="text-2xl font-extrabold text-brand-primary mt-1">{formatKES(stats.paid_volume)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase text-gray-400">Paid Sessions</p>
                    <p className="text-2xl font-extrabold text-green-600 mt-1">{stats.paid_count ?? 0}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase text-gray-400">Total Sessions</p>
                    <p className="text-2xl font-extrabold text-brand-dark mt-1">{stats.total_sessions ?? 0}</p>
                </div>
            </div>

            {loginMessage && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
                    {loginMessage}
                </div>
            )}

            {createdCreds && (
                <div className="mb-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-5 text-sm">
                    <p className="font-extrabold text-emerald-900">Merchant Created: {createdCreds.merchant.name}</p>
                    <p className="text-xs text-emerald-800 mt-1">Portal Login Email: <strong>{createdCreds.login_email}</strong></p>
                    <p className="text-xs font-mono text-brand-dark mt-2">Public Key: {createdCreds.public_key}</p>
                    <p className="text-xs font-mono font-bold text-brand-dark mt-1 break-all">Secret Key (shown once): {createdCreds.secret_key}</p>
                </div>
            )}

            {/* Attach Login Inline Form */}
            {loginTarget && (
                <form onSubmit={submitLogin} className="mb-6 bg-white rounded-2xl border-2 border-brand-primary p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-sm text-brand-dark">
                            {loginTarget.has_login ? 'Reset' : 'Create'} Portal Login for {loginTarget.name}
                        </h3>
                        <button type="button" onClick={() => setLoginTarget(null)} className="text-xs text-red-500 font-semibold">
                            Cancel
                        </button>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="Merchant login email"
                            className="bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                            required
                        />
                        <input
                            type="password"
                            minLength={8}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Password (min 8 chars)"
                            className="bg-brand-input rounded-lg px-3.5 py-2.5 text-sm"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loginSaving}
                            className="bg-brand-dark text-white rounded-lg font-bold text-sm py-2.5 hover:bg-black cursor-pointer"
                        >
                            {loginSaving ? 'Saving...' : 'Save Login'}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid lg:grid-cols-2 gap-8 items-start">
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
                            placeholder="e.g. Nairobi Hardware Ltd"
                            required
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1">Portal Login Email *</label>
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
                            placeholder="https://..."
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
                    <h2 className="text-lg font-bold text-brand-dark">Merchants ({merchants.length})</h2>
                    {merchants.map((m) => (
                        <div key={m.id} className="p-4 rounded-xl border border-brand-border flex flex-wrap items-center justify-between gap-3">
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
                                    {m.login_email || m.email || m.slug} · {formatKES(m.paid_volume)} ({m.paid_count}/{m.checkout_sessions_count} sessions) · {m.fee_percent}% fee
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginTarget(m);
                                        setLoginEmail(m.login_email || m.email || '');
                                        setLoginPassword('');
                                    }}
                                    className="text-brand-dark hover:underline cursor-pointer"
                                >
                                    {m.has_login ? 'Reset Login' : '+ Add Login'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.post(`/admin/merchants/${m.id}/toggle`, {}, { preserveScroll: true })}
                                    className="text-brand-primary hover:underline cursor-pointer"
                                >
                                    {m.status === 'active' ? 'Suspend' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}