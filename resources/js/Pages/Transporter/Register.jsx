import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

function VehicleIllustration({ type = '', size = 52 }) {
    const t = (type || '').toLowerCase();

    if (t.includes('motorbike') || t.includes('courier') || t.includes('bike')) {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ width: size, height: size, minWidth: size, minHeight: size }} className="flex-shrink-0">
                <rect width="64" height="64" rx="16" fill="#F0FDF4" />
                <ellipse cx="32" cy="51" rx="22" ry="4" fill="#000" fillOpacity="0.08" />
                <ellipse cx="18" cy="44" rx="7" ry="5.5" fill="#1E293B" />
                <ellipse cx="18" cy="44" rx="4" ry="3" fill="#E2E8F0" />
                <ellipse cx="46" cy="44" rx="7" ry="5.5" fill="#1E293B" />
                <ellipse cx="46" cy="44" rx="4" ry="3" fill="#E2E8F0" />
                <path d="M17 43L28 32H38L47 43" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M42 27L47 43" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M26 31C26 27 29 25 33 25H39L36 32H26Z" fill="#32BB78" />
                <rect x="12" y="20" width="13" height="13" rx="3" fill="#32BB78" />
                <path d="M12 24.5H25" stroke="#16A34A" strokeWidth="1.5" />
            </svg>
        );
    }

    if (t.includes('canter')) {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ width: size, height: size, minWidth: size, minHeight: size }} className="flex-shrink-0">
                <rect width="64" height="64" rx="16" fill="#F0FDF4" />
                <ellipse cx="32" cy="51" rx="24" ry="4" fill="#000" fillOpacity="0.08" />
                <circle cx="19" cy="45" r="5.5" fill="#1E293B" /><circle cx="19" cy="45" r="3" fill="#E2E8F0" />
                <circle cx="45" cy="45" r="5.5" fill="#1E293B" /><circle cx="45" cy="45" r="3" fill="#E2E8F0" />
                <rect x="8" y="17" width="28" height="23" rx="3" fill="#32BB78" />
                <rect x="8" y="34" width="28" height="6" fill="#16A34A" />
                <path d="M36 21H48C51 21 53 23 53 26V40H36V21Z" fill="#1E293B" />
                <path d="M39 24H48C49.5 24 50.5 25 50.5 26.5V32H39V24Z" fill="#7DD3FC" fillOpacity="0.85" />
            </svg>
        );
    }

    if (t.includes('tipper') || t.includes('lorry')) {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ width: size, height: size, minWidth: size, minHeight: size }} className="flex-shrink-0">
                <rect width="64" height="64" rx="16" fill="#F0FDF4" />
                <ellipse cx="32" cy="52" rx="25" ry="4" fill="#000" fillOpacity="0.08" />
                <circle cx="15" cy="46" r="5" fill="#1E293B" /><circle cx="26" cy="46" r="5" fill="#1E293B" /><circle cx="47" cy="46" r="5" fill="#1E293B" />
                <path d="M7 21H37L35 41H7V21Z" fill="#32BB78" />
                <path d="M35 38L38 31" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M39 20H51C53.5 20 55 22 55 24.5V41H39V20Z" fill="#1E293B" />
                <path d="M42 23H50C51.5 23 52.5 24 52.5 25.5V31H42V23Z" fill="#7DD3FC" fillOpacity="0.85" />
            </svg>
        );
    }

    if (t.includes('trailer') || t.includes('prime') || t.includes('mover')) {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ width: size, height: size, minWidth: size, minHeight: size }} className="flex-shrink-0">
                <rect width="64" height="64" rx="16" fill="#F0FDF4" />
                <ellipse cx="32" cy="52" rx="26" ry="4" fill="#000" fillOpacity="0.08" />
                <circle cx="11" cy="46" r="4.5" fill="#1E293B" /><circle cx="21" cy="46" r="4.5" fill="#1E293B" /><circle cx="48" cy="46" r="5" fill="#1E293B" />
                <rect x="6" y="19" width="31" height="22" rx="2" fill="#32BB78" />
                <path d="M39 16H49C52 16 54 18 54 21V41H39V16Z" fill="#1E293B" />
                <path d="M42 20H49.5C51 20 52 21 52 22.5V28H42V20Z" fill="#7DD3FC" fillOpacity="0.85" />
            </svg>
        );
    }

    if (t.includes('tuk') || t.includes('van')) {
        return (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ width: size, height: size, minWidth: size, minHeight: size }} className="flex-shrink-0">
                <rect width="64" height="64" rx="16" fill="#F0FDF4" />
                <ellipse cx="32" cy="51" rx="23" ry="4" fill="#000" fillOpacity="0.08" />
                <circle cx="17" cy="45" r="5.5" fill="#1E293B" /><circle cx="45" cy="45" r="5.5" fill="#1E293B" />
                <path d="M9 24C9 21.5 11 19.5 13.5 19.5H38L49 26C52 28 53 30.5 53 33.5V42H9V24Z" fill="#32BB78" />
                <path d="M37 22H44.5L49 27.5H37V22Z" fill="#1E293B" />
            </svg>
        );
    }

    // Default: Pickup
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ width: size, height: size, minWidth: size, minHeight: size }} className="flex-shrink-0">
            <rect width="64" height="64" rx="16" fill="#F0FDF4" />
            <ellipse cx="32" cy="51" rx="23" ry="4" fill="#000" fillOpacity="0.08" />
            <circle cx="17" cy="44" r="5.5" fill="#1E293B" /><circle cx="44" cy="44" r="5.5" fill="#1E293B" />
            <path d="M8 30H27V41H8V30Z" fill="#32BB78" />
            <rect x="10" y="25" width="7" height="6" rx="1.5" fill="#FDE047" />
            <path d="M27 23C27 21 29 19.5 31 19.5H41L49 27.5V41H27V23Z" fill="#32BB78" />
            <path d="M30 22.5H38.5V28H30V22.5Z" fill="#1E293B" />
        </svg>
    );
}

const vehicleOptions = [
    { label: 'Pickup (1 - 2 Tonnes)', defaultWeight: 2000, baseFare: 500, perKg: 10, perKm: 30 },
    { label: 'Canter (3 - 5 Tonnes)', defaultWeight: 5000, baseFare: 1000, perKg: 8, perKm: 50 },
    { label: 'Tipper / Lorry (7 - 10 Tonnes)', defaultWeight: 10000, baseFare: 2000, perKg: 6, perKm: 80 },
    { label: 'Trailer / Prime Mover (20+ Tonnes)', defaultWeight: 28000, baseFare: 5000, perKg: 4, perKm: 120 },
    { label: 'Tuk-Tuk / Delivery Van', defaultWeight: 800, baseFare: 300, perKg: 12, perKm: 25 },
    { label: 'Motorbike / Courier', defaultWeight: 150, baseFare: 150, perKg: 15, perKm: 20 },
];

const formatKES = (v) => 'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const steps = [
    { id: 1, title: 'Driver & Login', subtitle: 'Account & Vehicle' },
    { id: 2, title: 'Rate Card & Capacity', subtitle: 'Fees & Max Payload' },
    { id: 3, title: 'ID Verification', subtitle: 'National ID' },
];

export default function TransportersRegister() {
    const [step, setStep] = useState(1);
    const [stepError, setStepError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        vehicle_type: vehicleOptions[0].label,
        area: '',
        plate_number: '',
        id_number: '',
        id_document: null,
        base_fare: '500',
        rate_per_kg: '10',
        rate_per_km: '30',
        max_weight_kg: '2000',
    });

    const handleSelectVehicle = (v) => {
        setData((d) => ({
            ...d,
            vehicle_type: v.label,
            max_weight_kg: String(v.defaultWeight),
            base_fare: String(v.baseFare),
            rate_per_kg: String(v.perKg),
            rate_per_km: String(v.perKm),
        }));
    };

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
                setStepError('Please complete your name, phone number, and operating base.');
                return;
            }
            if (!data.password || data.password.length < 8) {
                setStepError('Please set a portal password of at least 8 characters.');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (data.base_fare === '' || data.rate_per_kg === '' || data.rate_per_km === '' || !data.max_weight_kg) {
                setStepError('Please verify your base fare, rates, and maximum cargo weight.');
                return;
            }
            setStep(3);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        setStepError(null);

        if (!data.id_number.trim() || !data.id_document) {
            setStepError('Please enter your National ID number and upload a clear document photo or PDF.');
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
                if (errs.name || errs.phone || errs.area || errs.vehicle_type || errs.password || errs.email) {
                    setStep(1);
                } else if (errs.base_fare || errs.rate_per_kg || errs.rate_per_km || errs.max_weight_kg) {
                    setStep(2);
                } else {
                    setStep(3);
                }
            },
        });
    };

    const sampleWeight = Math.min(Number(data.max_weight_kg || 500), 500);
    const sampleEstimate =
        Number(data.base_fare || 0) +
        sampleWeight * Number(data.rate_per_kg || 0) +
        10 * Number(data.rate_per_km || 0);

    return (
        <MainLayout minimal homeHref="/shop">
            <Head title="Driver Onboarding & Portal Registration" />

            <div className="max-w-2xl mx-auto py-4 sm:py-8">
                {/* Navigation Bar */}
                <div className="mb-6 flex items-center justify-between gap-3">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-primary transition"
                    >
                        <span>← Back to Store</span>
                    </Link>

                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-dark bg-white border border-brand-border px-3.5 py-2 rounded-xl hover:bg-gray-50 transition"
                    >
                        <span>Already registered? Sign In</span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
                    {/* Header */}
                    <div className="p-6 sm:p-8 border-b border-brand-border">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-2 tracking-tight">
                            Drive & Earn with Nyumba
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                            Sign up with your mobile number, set your own trip rates and weight limits, and receive live dispatches.
                        </p>
                    </div>

                    {recentlySuccessful ? (
                        /* High-Converting Success Confirmation Page with Fast-Track Admin Contact */
                        <div className="p-6 sm:p-9 space-y-6">
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                                    ✓
                                </div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-dark">
                                    Application Submitted!
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                                    Your account and driver portal are created. An administrator needs to verify your National ID before you can turn <strong>Online</strong>.
                                </p>
                            </div>

                            {/* Direct Fast-Track Actions */}
                            <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/60 p-5 space-y-3">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-200 px-2.5 py-0.5 rounded-full">
                                        Fast-Track Verification
                                    </span>
                                    <h3 className="text-sm font-extrabold text-emerald-950 mt-1.5">
                                        Contact Safety Desk to approve within 15 minutes:
                                    </h3>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                                    <a
                                        href="https://wa.me/254700000000?text=Hello%20Nyumba%20Admin,%20I%20have%20just%20submitted%20my%20driver%20application.%20Please%20verify%20my%20National%20ID%20so%20I%20can%20start%20taking%20jobs."
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-emerald-600 text-white py-3 px-4 rounded-xl text-xs font-bold text-center hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-xs"
                                    >
                                        <span>Chat on WhatsApp</span>
                                        <span>→</span>
                                    </a>

                                    <a
                                        href="mailto:support@evopay.africa?subject=Driver%20ID%20Approval%20Request"
                                        className="bg-white border border-emerald-300 text-emerald-900 py-3 px-4 rounded-xl text-xs font-bold text-center hover:bg-emerald-100 transition flex items-center justify-center gap-2"
                                    >
                                        <span>Email devops2@evopay.africa</span>
                                    </a>
                                </div>
                            </div>

                            {/* Physical Depots List */}
                            <div className="rounded-2xl bg-brand-light border border-brand-border p-4 text-xs text-gray-600 space-y-2">
                                <p className="font-bold text-brand-dark uppercase tracking-wider text-[11px]">
                                    Or Visit In-Person (Nairobi Depots)
                                </p>
                                <p>You can also walk into any stockist carrying Nyumba Cement with your physical ID:</p>
                                <ul className="pl-4 list-disc space-y-0.5 text-gray-700">
                                    <li>Enterprise Road (Industrial Area)</li>
                                    <li>Kombo Munyiri Road (Kamukunji)</li>
                                    <li>Kangundo Road (Eastlands)</li>
                                </ul>
                            </div>

                            <Link
                                href="/login"
                                className="block w-full bg-brand-dark text-white text-center py-3.5 rounded-xl font-bold text-sm hover:bg-black transition"
                            >
                                Go to Sign In Page →
                            </Link>
                        </div>
                    ) : (
                        <div className="p-6 sm:p-8">
                            {/* Step Indicators */}
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
                                                    {completed ? '✓' : s.id}
                                                </span>
                                            </div>
                                            <p className="font-bold text-xs text-brand-dark truncate">{s.title}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{s.subtitle}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {(stepError || Object.keys(errors).length > 0) && (
                                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                                    <p className="font-bold text-red-800">Please review:</p>
                                    <p className="mt-0.5">{stepError || Object.values(errors)[0]}</p>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                {/* STEP 1: Driver, Vehicle, and Login Credentials */}
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">
                                                Full Name / Fleet Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g. Samuel Mutiso Logistics"
                                                className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
                                                required
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-xs font-semibold text-brand-dark mb-1">
                                                    Mobile Phone Number (Login ID) *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    placeholder="0712345678"
                                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm font-mono"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-brand-dark mb-1">
                                                    Email Address (Optional)
                                                </label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="samuel@gmail.com"
                                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">
                                                Portal Login Password (Min 8 characters) *
                                            </label>
                                            <input
                                                type="password"
                                                minLength={8}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
                                                required
                                            />
                                            <p className="text-[11px] text-gray-500 mt-1">
                                                You can sign in with this password using either your phone number or email.
                                            </p>
                                        </div>

                                        {/* Visual Vehicle Card Selector with Bolt-style SVGs */}
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-2">
                                                Select Your Vehicle Category *
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                                {vehicleOptions.map((v) => {
                                                    const isSelected = data.vehicle_type === v.label;
                                                    return (
                                                        <button
                                                            key={v.label}
                                                            type="button"
                                                            onClick={() => handleSelectVehicle(v)}
                                                            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                                                                isSelected
                                                                    ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20'
                                                                    : 'border-brand-border bg-white hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <VehicleIllustration type={v.label} size={44} />
                                                            <div className="mt-2">
                                                                <p className="text-xs font-extrabold text-brand-dark leading-tight">
                                                                    {v.label}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 mt-0.5">
                                                                    Max {v.defaultWeight.toLocaleString()} KG
                                                                </p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-xs font-semibold text-brand-dark mb-1">
                                                    Operating Town / Base Area *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.area}
                                                    onChange={(e) => setData('area', e.target.value)}
                                                    placeholder="e.g. Mombasa Road / Kitengela"
                                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-brand-dark mb-1">
                                                    Plate Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.plate_number}
                                                    onChange={(e) => setData('plate_number', e.target.value)}
                                                    placeholder="KDF 123A"
                                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm font-mono uppercase"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer"
                                        >
                                            Continue to Rate Card & Capacity →
                                        </button>
                                    </div>
                                )}

                                {/* STEP 2: Rate Card & Max Cargo Weight Limit */}
                                {step === 2 && (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-brand-light border border-brand-border space-y-4">
                                            <div>
                                                <h2 className="text-sm font-bold text-brand-dark">Set Trip Rates & Cargo Limit</h2>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Clients pay materials online and hand you the transport fare directly upon delivery.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Base Fare (KSh)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={data.base_fare}
                                                        onChange={(e) => setData('base_fare', e.target.value)}
                                                        className="w-full bg-white rounded-xl px-3 py-2 text-sm font-mono border border-brand-border"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Rate/KG (KSh)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={data.rate_per_kg}
                                                        onChange={(e) => setData('rate_per_kg', e.target.value)}
                                                        className="w-full bg-white rounded-xl px-3 py-2 text-sm font-mono border border-brand-border"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Rate/KM (KSh)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={data.rate_per_km}
                                                        onChange={(e) => setData('rate_per_km', e.target.value)}
                                                        className="w-full bg-white rounded-xl px-3 py-2 text-sm font-mono border border-brand-border"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-brand-dark mb-1">
                                                    Maximum Weight You Can Carry (KG) *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="50"
                                                    value={data.max_weight_kg}
                                                    onChange={(e) => setData('max_weight_kg', e.target.value)}
                                                    className="w-full bg-white rounded-xl px-4 py-2.5 text-sm font-mono border border-brand-border font-bold text-brand-dark"
                                                    required
                                                />
                                                <p className="text-[11px] text-gray-500 mt-1">
                                                    Orders exceeding this weight will not be assigned to your vehicle at checkout.
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-white border border-brand-border p-3 flex justify-between items-center text-xs">
                                                <div>
                                                    <p className="font-bold text-brand-dark">Sample 10 KM Quote</p>
                                                    <p className="text-gray-500 text-[11px]">Calculated for {sampleWeight} KG cargo</p>
                                                </div>
                                                <span className="text-base font-black text-brand-primary font-mono">{formatKES(sampleEstimate)}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="w-1/3 border border-brand-border bg-white text-brand-dark py-3.5 rounded-xl font-bold text-sm cursor-pointer"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                className="w-2/3 bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer"
                                            >
                                                Continue to ID Upload →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: National ID Verification */}
                                {step === 3 && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">
                                                National ID Number *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.id_number}
                                                onChange={(e) => setData('id_number', e.target.value)}
                                                placeholder="e.g. 31458920"
                                                className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm font-mono"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark mb-1">
                                                Upload National ID (Photo or PDF) *
                                            </label>

                                            <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-border bg-brand-light hover:border-brand-primary/60 transition p-6 cursor-pointer text-center">
                                                <input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                {data.id_document ? (
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold text-emerald-700">{data.id_document.name}</p>
                                                        <p className="text-[11px] text-gray-500">Tap to replace document</p>
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
                                                    <img src={previewUrl} alt="ID preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="w-1/3 border border-brand-border bg-white text-brand-dark py-3.5 rounded-xl font-bold text-sm cursor-pointer"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="w-2/3 bg-brand-primary text-white py-3.5 rounded-xl font-extrabold text-sm hover:bg-brand-secondary transition cursor-pointer disabled:opacity-50"
                                            >
                                                {processing ? 'Submitting Application...' : 'Submit Application'}
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