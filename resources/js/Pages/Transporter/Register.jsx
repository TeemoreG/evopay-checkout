import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

const vehicleOptions = [
    'Pickup (1 - 2 Tonnes)',
    'Canter (3 - 5 Tonnes)',
    'Tipper / Lorry (7 - 10 Tonnes)',
    'Trailer / Prime Mover (20+ Tonnes)',
    'Tuk-Tuk / Delivery Van',
    'Motorbike / Courier',
];

const formatKES = (v) => 'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const steps = [
    { id: 1, title: 'Driver & Truck', subtitle: 'Contact & vehicle' },
    { id: 2, title: 'Rate Card', subtitle: 'Your hauling fees' },
    { id: 3, title: 'ID Verification', subtitle: 'National ID upload' },
];

export default function TransportersRegister() {
    const [step, setStep] = useState(1);
    const [stepError, setStepError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        phone: '',
        vehicle_type: vehicleOptions[0],
        area: '',
        plate_number: '',
        id_number: '',
        id_document: null,
        base_fare: '500',
        rate_per_kg: '10',
        rate_per_km: '30',
    });

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setData('id_document', file);
        setStepError(null);

        if (file && file.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    const nextStep = () => {
        setStepError(null);
        if (step === 1) {
            if (!data.name.trim() || !data.phone.trim() || !data.area.trim()) {
                setStepError('Please complete your name, phone number, and primary operating town.');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (data.base_fare === '' || data.rate_per_kg === '' || data.rate_per_km === '') {
                setStepError('Please enter your base fare, per-KG rate, and per-KM rate.');
                return;
            }
            setStep(3);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        setStepError(null);

        if (!data.id_number.trim() || !data.id_document) {
            setStepError('Please enter your National ID number and attach a clear photo or PDF of your ID.');
            return;
        }

        post('/shop/transporters/register', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPreviewUrl(null);
                setStep(1);
            },
            onError: (errs) => {
                if (errs.name || errs.phone || errs.area || errs.vehicle_type) {
                    setStep(1);
                } else if (errs.base_fare || errs.rate_per_kg || errs.rate_per_km) {
                    setStep(2);
                } else {
                    setStep(3);
                }
            },
        });
    };

    // Sample preview estimate (500 KG, 10 KM)
    const sampleEstimate =
        Number(data.base_fare || 0) +
        500 * Number(data.rate_per_kg || 0) +
        10 * Number(data.rate_per_km || 0);

    return (
        <MainLayout minimal homeHref="/shop">
            <Head title="Driver Onboarding — Nyumba Cement Fleet" />

            <div className="max-w-2xl mx-auto py-4 sm:py-8">
                {/* Top App Nav Strip */}
                <div className="mb-6 flex items-center justify-between gap-3">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-primary transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span>Storefront</span>
                    </Link>

                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-dark bg-white border border-brand-border px-3.5 py-2 rounded-xl hover:bg-gray-50 transition"
                    >
                        <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        <span>Existing Driver Sign In</span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
                    {/* Hero Banner */}
                    <div className="bg-brand-dark text-white p-6 sm:p-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-secondary bg-white/10 px-3 py-1 rounded-full">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.5a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 4.5v9.75m12 0H2.25m12 0v5.25" />
                                </svg>
                                <span>Nyumba Cement Fleet Partner</span>
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
                                Transporter Application
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-300 mt-1.5 leading-relaxed max-w-lg">
                                Register your truck, configure your haulage rates, and upload your National ID. Portal login passwords are issued by our admin team upon verification.
                            </p>
                        </div>
                        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-brand-primary/20 blur-2xl pointer-events-none" />
                    </div>

                    {recentlySuccessful ? (
                        <div className="p-6 sm:p-9 space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-dark">
                                    Application & ID Received
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-2 leading-relaxed">
                                    Your profile, rate card, and National ID document are now queued for admin approval. To get your portal login credentials and activate your account:
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 text-xs">
                                <div className="rounded-2xl bg-brand-light border border-brand-border p-5 space-y-2">
                                    <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </div>
                                    <p className="font-bold text-brand-dark uppercase tracking-wider text-[11px]">
                                        Email Onboarding Desk
                                    </p>
                                    <p className="text-gray-600 leading-relaxed">
                                        Send your registered phone number and plate number to{' '}
                                        <a
                                            href="mailto:support@evopay.africa?subject=Transporter%20Approval%20%26%20Login%20Request"
                                            className="font-bold text-brand-primary underline"
                                        >
                                            support@evopay.africa
                                        </a>{' '}
                                        to receive your driver portal email and password.
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-brand-light border border-brand-border p-5 space-y-2">
                                    <div className="w-9 h-9 rounded-xl bg-brand-dark text-white flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg>
                                    </div>
                                    <p className="font-bold text-brand-dark uppercase tracking-wider text-[11px]">
                                        Visit Headquarters / Depots
                                    </p>
                                    <p className="text-gray-600 leading-relaxed">
                                        Verify in person at our main HQ or major Nairobi hardware stockists carrying Nyumba Cement:
                                    </p>
                                    <ul className="space-y-1 text-gray-700 pl-3 list-disc">
                                        <li><strong>Enterprise Road</strong> (Industrial Area)</li>
                                        <li><strong>Kombo Munyiri Road</strong> (Kamukunji)</li>
                                        <li><strong>Kangundo Road</strong> (Eastlands)</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
                                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                <p className="leading-relaxed">
                                    Once approved and logged in, flip your status to <strong>Online</strong> inside your Driver Portal so customers can select your vehicle at checkout.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 sm:p-8">
                            {/* Multi-Step Progress Header */}
                            <div className="grid grid-cols-3 gap-2 mb-7">
                                {steps.map((s) => {
                                    const active = step === s.id;
                                    const completed = step > s.id;

                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => {
                                                if (completed || active) setStep(s.id);
                                            }}
                                            className={`text-left p-3 rounded-2xl border transition ${
                                                active
                                                    ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20'
                                                    : completed
                                                        ? 'border-emerald-200 bg-emerald-50/50 cursor-pointer'
                                                        : 'border-brand-border bg-brand-light opacity-60 cursor-default'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span
                                                    className={`w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center ${
                                                        active
                                                            ? 'bg-brand-primary text-white'
                                                            : completed
                                                                ? 'bg-emerald-600 text-white'
                                                                : 'bg-gray-200 text-gray-600'
                                                    }`}
                                                >
                                                    {completed ? (
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                    ) : (
                                                        s.id
                                                    )}
                                                </span>
                                            </div>
                                            <p className="font-bold text-xs text-brand-dark truncate">{s.title}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{s.subtitle}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {(stepError || Object.keys(errors).length > 0) && (
                                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2">
                                    <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                    <div>
                                        <p className="font-bold text-red-800">Please review your details</p>
                                        <p className="mt-0.5">{stepError || Object.values(errors)[0]}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                {/* STEP 1: Driver & Vehicle */}
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                                                Full Name or Fleet Business Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g. Samuel Mutiso Logistics"
                                                className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent"
                                                required
                                            />
                                            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                                                    Direct Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    placeholder="0712345678"
                                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent"
                                                    required
                                                />
                                                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                                                    Vehicle Type <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={data.vehicle_type}
                                                    onChange={(e) => setData('vehicle_type', e.target.value)}
                                                    className="w-full bg-brand-input rounded-xl px-3.5 py-3 text-sm border border-transparent text-brand-dark"
                                                >
                                                    {vehicleOptions.map((v) => (
                                                        <option key={v} value={v}>{v}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                                                    Primary Base Town / Area <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.area}
                                                    onChange={(e) => setData('area', e.target.value)}
                                                    placeholder="e.g. Mombasa Road / Kitengela"
                                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent"
                                                    required
                                                />
                                                {errors.area && <p className="text-red-600 text-xs mt-1">{errors.area}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                                                    Vehicle Plate Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.plate_number}
                                                    onChange={(e) => setData('plate_number', e.target.value)}
                                                    placeholder="e.g. KDF 123A"
                                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent uppercase font-mono"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <span>Continue to Rate Card</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {/* STEP 2: Rate Card */}
                                {step === 2 && (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-brand-light border border-brand-border space-y-4">
                                            <div>
                                                <h2 className="text-sm font-bold text-brand-dark">Set Your Hauling Rates (KSh)</h2>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Customers pay materials online and pay your haulage fee directly upon safe arrival at their site.
                                                </p>
                                            </div>

                                            <div className="grid sm:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Base Fare (KSh)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={data.base_fare}
                                                        onChange={(e) => setData('base_fare', e.target.value)}
                                                        className="w-full bg-white rounded-xl px-3.5 py-2.5 text-sm border border-brand-border font-mono"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Rate per KG (KSh)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={data.rate_per_kg}
                                                        onChange={(e) => setData('rate_per_kg', e.target.value)}
                                                        className="w-full bg-white rounded-xl px-3.5 py-2.5 text-sm border border-brand-border font-mono"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Rate per KM (KSh)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={data.rate_per_km}
                                                        onChange={(e) => setData('rate_per_km', e.target.value)}
                                                        className="w-full bg-white rounded-xl px-3.5 py-2.5 text-sm border border-brand-border font-mono"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="rounded-xl bg-white border border-brand-border p-3.5 flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                                        Sample Quote (10 Bags / 500 KG · 10 KM)
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        What a customer sees at checkout
                                                    </p>
                                                </div>
                                                <p className="text-lg font-extrabold text-brand-primary whitespace-nowrap">
                                                    {formatKES(sampleEstimate)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="w-1/3 border border-brand-border bg-white text-brand-dark py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition cursor-pointer"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                className="w-2/3 bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <span>Continue to ID Upload</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: National ID Verification */}
                                {step === 3 && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                                                National ID / Passport Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.id_number}
                                                onChange={(e) => setData('id_number', e.target.value)}
                                                placeholder="e.g. 31458920"
                                                className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent font-mono"
                                                required
                                            />
                                            {errors.id_number && <p className="text-red-600 text-xs mt-1">{errors.id_number}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                                                Upload National ID Photo or PDF <span className="text-red-500">*</span>
                                            </label>

                                            <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-border bg-brand-light hover:border-brand-primary/60 transition p-6 cursor-pointer text-center">
                                                <input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-3">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                    </svg>
                                                </div>
                                                {data.id_document ? (
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold text-emerald-700">{data.id_document.name}</p>
                                                        <p className="text-[11px] text-gray-500">
                                                            {(data.id_document.size / 1024 / 1024).toFixed(2)} MB · Click to replace
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold text-brand-dark">Tap to upload National ID</p>
                                                        <p className="text-[11px] text-gray-500">JPG, PNG, WEBP, or PDF (Max 5 MB)</p>
                                                    </div>
                                                )}
                                            </label>

                                            {previewUrl && (
                                                <div className="mt-3 rounded-xl border border-brand-border overflow-hidden bg-gray-50 p-2">
                                                    <img src={previewUrl} alt="National ID preview" className="max-h-44 mx-auto rounded-lg object-contain" />
                                                </div>
                                            )}

                                            {errors.id_document && <p className="text-red-600 text-xs mt-1">{errors.id_document}</p>}
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-brand-light border border-brand-border text-[11px] text-gray-600 flex items-start gap-2">
                                            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                            <span>
                                                Your National ID is stored privately and only visible to verified Nyumba Cement administrators for driver onboarding approval.
                                            </span>
                                        </div>

                                        <div className="flex gap-3 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="w-1/3 border border-brand-border bg-white text-brand-dark py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition cursor-pointer"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="w-2/3 bg-brand-primary text-white py-3.5 rounded-xl font-extrabold text-sm hover:bg-brand-secondary transition cursor-pointer disabled:opacity-50"
                                            >
                                                {processing ? 'Uploading & Submitting...' : 'Submit Application'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}