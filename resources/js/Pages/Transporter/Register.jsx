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

export default function TransportersRegister() {
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        phone: '',
        vehicle_type: vehicleOptions[0],
        area: '',
        plate_number: '',
        base_fare: '500',
        rate_per_kg: '10',
        rate_per_km: '30',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/shop/transporters/register', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <MainLayout minimal homeHref="/shop">
            <Head title="Join as a Transporter — Nyumba Cement" />

            <div className="max-w-xl mx-auto py-8 sm:py-12">
                <div className="mb-6">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-primary transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span>Back to Store</span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-xs relative overflow-hidden">
                    <div className="mb-8">
                        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
                            Fleet Partner Network
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-3 tracking-tight">
                            Register as a Verified Transporter
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                            Set your haulage rates to get booked for customer deliveries. Passwords and portal access credentials are issue-controlled and assigned by the Nyumba Cement administrative team upon profile verification.
                        </p>
                    </div>

                    {recentlySuccessful ? (
                        <div className="py-6 space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-extrabold text-brand-dark">Registration Submitted!</h2>
                                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-2 leading-relaxed">
                                    Your vehicle profile and rate card have been submitted for verification. To collect your driver portal login credentials and finalize listing approval:
                                </p>
                            </div>

                            {/* Contact & Physical Verification Instructions */}
                            <div className="rounded-2xl bg-brand-light border border-brand-border p-5 space-y-4 text-xs text-brand-dark">
                                <div>
                                    <p className="font-bold uppercase tracking-wider text-[11px] text-brand-primary mb-1">
                                        Option 1: Email Onboarding Desk
                                    </p>
                                    <p className="text-gray-600">
                                        Email our team at{' '}
                                        <a href="mailto:support@evopay.africa?subject=Transporter%20Verification%20and%20Login%20Request" className="font-bold text-brand-dark underline hover:text-brand-primary">
                                            support@evopay.africa
                                        </a>{' '}
                                        with your registered phone number to receive your secure portal login password.
                                    </p>
                                </div>

                                <div className="border-t border-brand-border pt-3">
                                    <p className="font-bold uppercase tracking-wider text-[11px] text-brand-primary mb-1">
                                        Option 2: Physical Verification at Nairobi Depots
                                    </p>
                                    <p className="text-gray-600 leading-relaxed">
                                        Visit the main headquarters or any major authorized hardware depot stocking Nyumba Cement in Nairobi:
                                    </p>
                                    <ul className="mt-2 space-y-1.5 pl-3 list-disc text-gray-700">
                                        <li><strong>Industrial Area:</strong> Authorized hardware distributors along <strong>Enterprise Road</strong></li>
                                        <li><strong>Gikomba / Kamukunji Area:</strong> Hardware hub along <strong>Kombo Munyiri Road</strong></li>
                                        <li><strong>Eastlands Depot:</strong> Partner collection center along <strong>Kangundo Road</strong></li>
                                    </ul>
                                </div>
                            </div>

                            <p className="text-center text-[11px] text-gray-400">
                                Once verified, your phone will be unlocked for direct customer calls after material checkout.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                                    Your Full Name or Fleet Business Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Samuel Mutiso Logistics"
                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent"
                                    required
                                />
                                {errors.name && <p className="text-red-600 text-xs mt-1 font-medium">{errors.name}</p>}
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
                                    {errors.phone && <p className="text-red-600 text-xs mt-1 font-medium">{errors.phone}</p>}
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
                                        {vehicleOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Rate Card Inputs */}
                            <div className="p-4 rounded-2xl bg-brand-light border border-brand-border space-y-3">
                                <p className="text-xs font-bold text-brand-dark uppercase tracking-wider">Your Rate Card (KSh)</p>
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Base Fare</label>
                                        <input
                                            type="number"
                                            value={data.base_fare}
                                            onChange={(e) => setData('base_fare', e.target.value)}
                                            className="w-full bg-white rounded-xl px-3 py-2.5 text-sm border border-brand-border"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Rate per KG</label>
                                        <input
                                            type="number"
                                            value={data.rate_per_kg}
                                            onChange={(e) => setData('rate_per_kg', e.target.value)}
                                            className="w-full bg-white rounded-xl px-3 py-2.5 text-sm border border-brand-border"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Rate per KM</label>
                                        <input
                                            type="number"
                                            value={data.rate_per_km}
                                            onChange={(e) => setData('rate_per_km', e.target.value)}
                                            className="w-full bg-white rounded-xl px-3 py-2.5 text-sm border border-brand-border"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1.5">Primary Base Town</label>
                                    <input
                                        type="text"
                                        value={data.area}
                                        onChange={(e) => setData('area', e.target.value)}
                                        placeholder="e.g. Mombasa Road"
                                        className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent"
                                        required
                                    />
                                    {errors.area && <p className="text-red-600 text-xs mt-1 font-medium">{errors.area}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1.5">Plate Number</label>
                                    <input
                                        type="text"
                                        value={data.plate_number}
                                        onChange={(e) => setData('plate_number', e.target.value)}
                                        placeholder="KDF 123A"
                                        className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent uppercase font-mono"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full mt-2 bg-brand-dark text-white py-4 rounded-xl font-extrabold text-sm hover:bg-black transition cursor-pointer disabled:opacity-50"
                            >
                                {processing ? 'Submitting Application...' : 'Register Transporter Fleet →'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}