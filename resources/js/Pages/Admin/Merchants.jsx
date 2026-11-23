import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import MainLayout from '../../Layouts/MainLayout';

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
        <MainLayout minimal homeHref="/admin">
            <Head title="Evopay Platform Admin — Merchants" />

            {/* Top Header & Navigation */}
            <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-primary">
                        Platform Admin
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-0.5 tracking-tight">
                        Merchants
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setError(null);
                            setOnboardOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 bg-brand-primary text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-brand-secondary transition shadow-xs cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Onboard</span>
                    </button>

                    <Link
                        href="/admin/transactions"
                        className="inline-flex items-center gap-1.5 bg-brand-dark text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-black transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                        </svg>
                        <span>Transactions</span>
                    </Link>

                    <Link
                        href="/admin/demo-shop"
                        className="inline-flex items-center gap-1.5 bg-white border border-brand-border text-brand-dark px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-50 transition"
                        title="Demo Shop Admin"
                    >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                        </svg>
                        <span className="hidden sm:inline">Demo Shop</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="inline-flex items-center justify-center bg-white border border-brand-border text-gray-600 p-2.5 sm:px-3.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer"
                        title="Logout"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        <span className="hidden sm:inline ml-1.5">Logout</span>
                    </button>
                </div>
            </div>

            {/* Platform KPI Strip with SVG Icons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard
                    label="Active Merchants"
                    value={activeCount}
                    sub={`/ ${stats.merchants_count ?? merchants.length}`}
                    iconBg="bg-orange-50 text-brand-primary"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                        </svg>
                    }
                />
                <KpiCard
                    label="Gateway Volume"
                    value={formatKES(stats.paid_volume)}
                    valueColor="text-brand-primary"
                    iconBg="bg-brand-primary/10 text-brand-primary"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                    }
                />
                <KpiCard
                    label="Est. Platform Fees"
                    value={formatKES(estimatedCommission)}
                    valueColor="text-emerald-600"
                    iconBg="bg-emerald-50 text-emerald-600"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                    }
                />
                <KpiCard
                    label="Conversion"
                    value={`${conversionRate}%`}
                    sub={`${stats.paid_count ?? 0}/${stats.total_sessions ?? 0}`}
                    iconBg="bg-blue-50 text-blue-600"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Flash Banner */}
            {bannerMessage && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between gap-3 text-sm font-semibold text-emerald-800">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{bannerMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setBannerMessage(null)}
                        className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
                        aria-label="Dismiss"
                    >
                        <CloseIcon />
                    </button>
                </div>
            )}

            {/* Newly Created Credentials Banner */}
            {createdCreds && (
                <div className="mb-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50/90 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-emerald-950">
                                    {createdCreds.merchant.name}
                                </h2>
                                <p className="text-[11px] font-semibold text-emerald-700">
                                    Copy secret key now — shown once
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCreatedCreds(null)}
                            className="text-emerald-800 hover:text-emerald-950 p-1 cursor-pointer"
                            aria-label="Close"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs">
                        <CopyBox
                            label="Portal Login"
                            value={createdCreds.login_email}
                            copied={copiedField === 'email'}
                            onCopy={() => copyValue('email', createdCreds.login_email)}
                        />
                        <CopyBox
                            label="Public Key"
                            value={createdCreds.public_key}
                            mono
                            copied={copiedField === 'pk'}
                            onCopy={() => copyValue('pk', createdCreds.public_key)}
                        />
                        <CopyBox
                            label="Secret Key"
                            value={createdCreds.secret_key}
                            mono
                            copied={copiedField === 'sk'}
                            onCopy={() => copyValue('sk', createdCreds.secret_key)}
                        />
                    </div>
                </div>
            )}

            {/* Search & Filter Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: `All (${merchants.length})` },
                        { key: 'active', label: `Active (${activeCount})` },
                        { key: 'suspended', label: `Suspended (${suspendedCount})` },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setStatusFilter(tab.key)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                statusFilter === tab.key
                                    ? 'bg-brand-dark text-white'
                                    : 'bg-white border border-brand-border text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-80">
                    <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search merchant or email..."
                        className="w-full bg-white border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm"
                    />
                </div>
            </div>

            {/* Clean Icon-Driven Merchants Table */}
            <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
                {filteredMerchants.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-sm font-semibold text-gray-500">No merchants found.</p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setStatusFilter('all');
                            }}
                            className="mt-2 text-xs font-bold text-brand-primary hover:underline cursor-pointer"
                        >
                            Reset filters
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-brand-light border-b border-brand-border text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="py-3.5 px-5">Merchant</th>
                                    <th className="py-3.5 px-4">Portal</th>
                                    <th className="py-3.5 px-4">Volume</th>
                                    <th className="py-3.5 px-4">Fee</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {filteredMerchants.map((m) => {
                                    const merchantFeeEarned = (Number(m.paid_volume || 0) * Number(m.fee_percent || 0)) / 100;

                                    return (
                                        <tr key={m.id} className="hover:bg-gray-50/70 transition">
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    {m.logo_url ? (
                                                        <img
                                                            src={m.logo_url}
                                                            alt={m.name}
                                                            className="w-9 h-9 rounded-xl object-contain bg-white border border-brand-border p-1 flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                                                            {m.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-brand-dark truncate">{m.name}</p>
                                                        <p className="text-[11px] text-gray-400 font-mono truncate">{m.slug}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                            m.has_login ? 'bg-blue-500' : 'bg-amber-400'
                                                        }`}
                                                        title={m.has_login ? 'Portal Active' : 'No Login Configured'}
                                                    ></span>
                                                    <span className="text-xs text-gray-600 truncate max-w-[180px]">
                                                        {m.login_email || m.email || '—'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <p className="font-bold text-brand-dark">{formatKES(m.paid_volume)}</p>
                                                <p className="text-[11px] text-gray-400">
                                                    {m.paid_count}/{m.checkout_sessions_count} paid
                                                </p>
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <p className="font-semibold text-brand-dark">{m.fee_percent}%</p>
                                                <p className="text-[11px] text-emerald-600 font-medium">
                                                    {formatKES(merchantFeeEarned)}
                                                </p>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                                                        m.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-red-50 text-red-700 border-red-200'
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                    {m.status}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-5 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setInspectTarget(m)}
                                                        title="View Details"
                                                        className="p-2 rounded-lg border border-brand-border bg-white text-gray-600 hover:text-brand-dark hover:bg-gray-50 transition cursor-pointer"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setLoginTarget(m);
                                                            setLoginEmail(m.login_email || m.email || '');
                                                            setLoginPassword('');
                                                            setLoginError(null);
                                                        }}
                                                        title={m.has_login ? 'Reset Portal Login' : 'Create Portal Login'}
                                                        className="p-2 rounded-lg border border-brand-border bg-white text-gray-600 hover:text-brand-dark hover:bg-gray-50 transition cursor-pointer"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(m)}
                                                        title={m.status === 'active' ? 'Suspend Merchant' : 'Activate Merchant'}
                                                        className={`p-2 rounded-lg border transition cursor-pointer ${
                                                            m.status === 'active'
                                                                ? 'border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100'
                                                                : 'border-emerald-200 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100'
                                                        }`}
                                                    >
                                                        {m.status === 'active' ? (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        )}
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

            {/* MODAL 1: Onboard New Merchant */}
            {onboardOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-5">
                            <div>
                                <h2 className="text-lg font-extrabold text-brand-dark">Onboard Merchant</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Generates API keys and portal credentials.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOnboardOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center cursor-pointer"
                            >
                                <CloseIcon />
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
                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
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
                                        className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
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
                                        className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
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
                                        className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1">Initial Key Mode</label>
                                    <select
                                        value={form.mode}
                                        onChange={(e) => setForm({ ...form, mode: e.target.value })}
                                        className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
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
                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1">Webhook URL (optional)</label>
                                <input
                                    type="url"
                                    value={form.webhook_url}
                                    onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
                                    placeholder="https://theirshop.co.ke/api/evopay/webhook"
                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
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

            {/* MODAL 2: Attach / Reset Merchant Login */}
            {loginTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-7 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-4">
                            <h3 className="font-extrabold text-base text-brand-dark">
                                {loginTarget.has_login ? 'Reset' : 'Create'} Login · {loginTarget.name}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setLoginTarget(null)}
                                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <form onSubmit={submitLogin} className="space-y-4">
                            {loginError && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                                    {loginError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold mb-1">Merchant Login Email</label>
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
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
                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
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

            {/* MODAL 3: Merchant Details Inspector */}
            {inspectTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-7 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-4">
                            <div className="flex items-center gap-3">
                                {inspectTarget.logo_url ? (
                                    <img src={inspectTarget.logo_url} alt={inspectTarget.name} className="w-9 h-9 rounded-lg object-contain border border-brand-border p-1" />
                                ) : (
                                    <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center">
                                        {inspectTarget.name.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-extrabold text-base text-brand-dark">{inspectTarget.name}</h3>
                                    <p className="text-xs font-mono text-gray-400">{inspectTarget.slug}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInspectTarget(null)}
                                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <DetailRow label="Status" value={inspectTarget.status.toUpperCase()} bold />
                            <DetailRow label="Contact Email" value={inspectTarget.email || '—'} />
                            <DetailRow label="Portal Login" value={inspectTarget.login_email || 'Not configured'} />
                            <DetailRow label="Gross Volume" value={formatKES(inspectTarget.paid_volume)} highlight />
                            <DetailRow label="Sessions" value={`${inspectTarget.paid_count} / ${inspectTarget.checkout_sessions_count} paid`} />
                            <DetailRow label="Fee Rate" value={`${inspectTarget.fee_percent}%`} />
                            <DetailRow
                                label="Joined"
                                value={inspectTarget.created_at ? new Date(inspectTarget.created_at).toLocaleDateString('en-KE') : '—'}
                            />
                        </div>

                        <div className="mt-6 flex gap-2.5">
                            <Link
                                href="/admin/transactions"
                                className="flex-1 text-center bg-brand-dark text-white py-3 rounded-xl font-bold text-xs hover:bg-black transition"
                            >
                                View Transactions
                            </Link>
                            <button
                                type="button"
                                onClick={() => setInspectTarget(null)}
                                className="flex-1 bg-brand-light border border-brand-border text-brand-dark py-3 rounded-xl font-bold text-xs hover:bg-gray-100 transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

function KpiCard({ label, value, sub, icon, iconBg, valueColor = 'text-brand-dark' }) {
    return (
        <div className="bg-white rounded-2xl border border-brand-border p-4 sm:p-5 shadow-xs flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 truncate">
                    {label}
                </p>
                <p className={`text-xl sm:text-2xl font-extrabold mt-1.5 truncate ${valueColor}`}>
                    {value}
                    {sub && <span className="text-xs font-semibold text-gray-400 ml-1">{sub}</span>}
                </p>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                {icon}
            </div>
        </div>
    );
}

function CopyBox({ label, value, mono = false, copied, onCopy }) {
    return (
        <div className="bg-white rounded-xl border border-emerald-200 p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase text-gray-400">{label}</p>
                <p className={`${mono ? 'font-mono font-bold' : 'font-semibold'} text-brand-dark mt-0.5 truncate`}>
                    {value}
                </p>
            </div>
            <button
                type="button"
                onClick={onCopy}
                className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex-shrink-0 cursor-pointer"
                title={`Copy ${label}`}
            >
                {copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                )}
            </button>
        </div>
    );
}

function DetailRow({ label, value, bold = false, highlight = false }) {
    return (
        <div className="flex justify-between py-2 border-b border-brand-border/60 last:border-b-0">
            <span className="text-gray-500">{label}</span>
            <span className={highlight ? 'font-bold text-brand-primary' : bold ? 'font-bold text-brand-dark' : 'font-semibold text-brand-dark'}>
                {value}
            </span>
        </div>
    );
}

function CloseIcon() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}