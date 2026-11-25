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
                {/* Back to Shop Link */}
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
                    {/* Header Banner */}
                    <div className="mb-8">
                        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
                            Partner Network
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-3 tracking-tight">
                            Register as a Verified Transporter
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                            Get discovered by building material buyers. When shoppers choose independent transport at checkout or after paying, your phone number and vehicle details are displayed for them to call directly.
                        </p>
                    </div>

                    {/* Success Notice */}
                    {recentlySuccessful ? (
                        <div className="py-8 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-extrabold text-brand-dark">Registration Submitted!</h2>
                            <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                                Thank you for signing up. Our admin team will verify your vehicle details and list your contact number on the checkout directory shortly.
                            </p>
                            <div className="pt-4 flex flex-wrap justify-center gap-3">
                                <Link
                                    href="/shop"
                                    className="bg-brand-dark text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-black transition"
                                >
                                    Browse Store
                                </Link>
                            </div>
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
                                    className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent placeholder-gray-400"
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
                                        placeholder="e.g. 0712345678"
                                        className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent placeholder-gray-400"
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
                                        {vehicleOptions.map((v) => (
                                            <option key={v} value={v}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                                        Primary Base / Operating Town <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.area}
                                        onChange={(e) => setData('area', e.target.value)}
                                        placeholder="e.g. Mombasa Road, Kitengela"
                                        className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent placeholder-gray-400"
                                        required
                                    />
                                    {errors.area && <p className="text-red-600 text-xs mt-1 font-medium">{errors.area}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                                        Vehicle Plate Number (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.plate_number}
                                        onChange={(e) => setData('plate_number', e.target.value)}
                                        placeholder="e.g. KDF 123A"
                                        className="w-full bg-brand-input rounded-xl px-4 py-3 text-sm border border-transparent placeholder-gray-400 uppercase font-mono"
                                    />
                                    {errors.plate_number && <p className="text-red-600 text-xs mt-1 font-medium">{errors.plate_number}</p>}
                                </div>
                            </div>

                            {/* Trust Note Card */}
                            <div className="p-4 rounded-2xl bg-brand-light border border-brand-border space-y-1.5 text-xs text-gray-600">
                                <div className="flex items-center gap-1.5 text-brand-dark font-bold">
                                    <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                    </svg>
                                    <span>How Transporter Listing Works</span>
                                </div>
                                <p>1. We do not charge listing fees or commissions on your trips.</p>
                                <p>2. Customers will call you directly to negotiate and pay your transport fare.</p>
                                <p>3. Keep your phone reachable to receive hauling job requests.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full mt-2 bg-brand-dark text-white py-4 rounded-xl font-extrabold text-sm hover:bg-black transition cursor-pointer disabled:opacity-50"
                            >
                                {processing ? 'Submitting Registration...' : 'Submit Transporter Details →'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}