import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import { useCart } from '../../Stores/cart';
import GoogleAddressInput from '../../Components/GoogleAddressInput';
import axios from 'axios';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

export default function CheckoutIndex({
    price_per_kg = 20,
    price_per_km = 50,
    free_radius_km = 3,
    transporters = [],
}) {
    const { items, setQty, removeItem } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [distanceKm, setDistanceKm] = useState(0);
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
    const [showTransporterModal, setShowTransporterModal] = useState(false);

    const [form, setForm] = useState({
        customer: { name: '', phone: '', email: '' },
        delivery: { formatted: '', lat: null, lng: null, placeId: '', landmark: '', notes: '' },
        delivery_method: 'standard', // 'standard', 'pickup', 'transporter'
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlError = params.get('error');
        if (urlError) {
            setPaymentError(urlError);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const showError = (message) => {
        setPaymentError(message);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFieldError = (key) => {
        if (errors[key]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };

    const updateCustomer = (key, value) => {
        setForm((f) => ({ ...f, customer: { ...f.customer, [key]: value } }));
        clearFieldError(`customer.${key}`);
    };

    const updateDelivery = (key, value) => {
        setForm((f) => ({ ...f, delivery: { ...f.delivery, [key]: value } }));
        clearFieldError(`delivery.${key}`);
    };

    const subtotal = items.reduce((n, i) => n + i.lineTotal, 0);
    const totalWeight = items.reduce((acc, item) => acc + (item.qty * parseFloat(item.weight || 0)), 0);

    // Delivery calculation with free radius check
    const isWithinFreeRadius = form.delivery_method === 'standard' && distanceKm > 0 && distanceKm <= Number(free_radius_km);
    const weightFee = isWithinFreeRadius ? 0 : totalWeight * Number(price_per_kg);
    const distanceFee = isWithinFreeRadius || distanceKm <= 0 ? 0 : Math.ceil(distanceKm) * Number(price_per_km);

    let totalDeliveryFee = 0;
    if (form.delivery_method === 'standard') {
        totalDeliveryFee = isWithinFreeRadius ? 0 : (weightFee + distanceFee);
    } // 'pickup' and 'transporter' are both KSh 0 on checkout

    const total = subtotal + totalDeliveryFee;

    const handleAddressSelect = async (address) => {
        setForm(f => ({ ...f, delivery: { ...f.delivery, ...address } }));
        clearFieldError('delivery.formatted');

        if (address.lat && address.lng) {
            setIsCalculatingDistance(true);
            try {
                const res = await axios.post('/api/distance', {
                    lat: address.lat,
                    lng: address.lng,
                });
                setDistanceKm(res.data.distance_km);
            } catch (error) {
                console.error('Failed to get distance', error);
                setDistanceKm(5); // Fallback
            } finally {
                setIsCalculatingDistance(false);
            }
        }
    };

    const validateForm = () => {
        const errs = {};

        if (!form.customer.name.trim()) {
            errs['customer.name'] = 'Please enter your full name.';
        }

        const phoneDigits = form.customer.phone.replace(/\D/g, '');
        if (!phoneDigits) {
            errs['customer.phone'] = 'Please enter your phone number.';
        } else if (phoneDigits.length < 9 || phoneDigits.length > 12) {
            errs['customer.phone'] = 'Please enter a valid phone number (e.g. 0712345678).';
        }

        if (form.customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer.email.trim())) {
            errs['customer.email'] = 'Please enter a valid email address.';
        }

        if ((form.delivery_method === 'standard' || form.delivery_method === 'transporter') && !form.delivery.formatted) {
            errs['delivery.formatted'] = 'Please search and select a delivery destination address.';
        }

        return errs;
    };

    const submit = async (e) => {
        e.preventDefault();

        if (items.length === 0) {
            showError('Your cart is empty. Please add items before checking out.');
            return;
        }

        if (isCalculatingDistance) {
            showError('Please wait while we finish calculating your delivery distance.');
            return;
        }

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showError('Please fill in the highlighted details below to continue.');
            return;
        }

        setPaymentError(null);
        setErrors({});
        setIsProcessing(true);

        try {
            const response = await axios.post('/checkout/process', {
                items: items,
                subtotal: subtotal,
                delivery_method: form.delivery_method,
                customer: form.customer,
                delivery: form.delivery,
            });

            if (response.data.status === 'redirect' && response.data.url) {
                window.location.href = response.data.url;
                return;
            }

            showError('Unable to proceed to payment. Please try again.');
            setIsProcessing(false);
        } catch (error) {
            console.error(error);

            if (error.response?.status === 422 && error.response?.data?.errors) {
                const backendErrors = {};
                Object.entries(error.response.data.errors).forEach(([k, v]) => {
                    backendErrors[k] = Array.isArray(v) ? v[0] : v;
                });
                setErrors(backendErrors);
                showError('Please correct the highlighted fields below.');
            } else {
                showError(
                    error.response?.data?.error ||
                    'Something went wrong while setting up payment. Please try again.'
                );
            }

            setIsProcessing(false);
        }
    };

    return (
        <MainLayout minimal homeHref="/shop">
            <div className="hidden md:flex mb-8 items-center gap-2 text-sm text-gray-500">
                <Link href="/shop" className="hover:text-brand-primary">Shop</Link>
                <span>›</span>
                <span className="text-brand-dark font-medium">Shipping</span>
                <span>›</span>
                <span>Payment</span>
            </div>

            {paymentError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-red-600 font-bold text-sm">✕</span>
                        <div>
                            <p className="text-sm font-bold text-red-800">Action required</p>
                            <p className="text-sm text-red-700 mt-0.5">{paymentError}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setPaymentError(null)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    <Section title="Contact details">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                label="Full name"
                                required
                                value={form.customer.name}
                                onChange={(e) => updateCustomer('name', e.target.value)}
                                placeholder="e.g. John Kamau"
                                error={errors['customer.name']}
                            />
                            <Field
                                label="Phone number"
                                required
                                value={form.customer.phone}
                                onChange={(e) => updateCustomer('phone', e.target.value)}
                                placeholder="e.g. 0712345678"
                                error={errors['customer.phone']}
                            />
                            <div className="sm:col-span-2">
                                <Field
                                    label="Email (optional)"
                                    type="email"
                                    value={form.customer.email}
                                    onChange={(e) => updateCustomer('email', e.target.value)}
                                    placeholder="you@example.com"
                                    error={errors['customer.email']}
                                />
                            </div>
                        </div>
                    </Section>

                    <Section title="Delivery address">
                        <div>
                            <label className="block text-sm font-medium text-brand-dark mb-1.5">
                                Search destination address <span className="text-red-500">*</span>
                            </label>

                            <GoogleAddressInput onAddressSelect={handleAddressSelect} />

                            {errors['delivery.formatted'] && (
                                <p className="mt-1.5 text-xs text-red-600 font-medium">
                                    {errors['delivery.formatted']}
                                </p>
                            )}

                            {isCalculatingDistance && (
                                <p className="text-xs text-brand-primary mt-2 animate-pulse font-medium">
                                    Calculating real driving distance from HQ...
                                </p>
                            )}

                            {form.delivery.formatted && !isCalculatingDistance && (
                                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <div>
                                            <p className="text-xs font-semibold text-emerald-800">Confirmed Destination:</p>
                                            <p className="text-sm text-emerald-700">{form.delivery.formatted}</p>
                                            <p className="text-[11px] text-emerald-600 mt-0.5">
                                                Driving distance: <strong>{distanceKm} km</strong>
                                                {distanceKm <= Number(free_radius_km) && (
                                                    <span className="ml-1.5 font-bold uppercase tracking-wider text-[10px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.5 rounded">
                                                        Within {free_radius_km}km Free Radius
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                label="Landmark (optional)"
                                value={form.delivery.landmark}
                                onChange={(e) => updateDelivery('landmark', e.target.value)}
                                placeholder="e.g. Next to Total Petrol Station"
                            />
                            <Field
                                label="Delivery notes"
                                value={form.delivery.notes}
                                onChange={(e) => updateDelivery('notes', e.target.value)}
                                placeholder="e.g. Gate 2, call driver on arrival"
                            />
                        </div>
                    </Section>

                    <Section title="Delivery method">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* 1. Store Delivery */}
                            <button
                                type="button"
                                onClick={() => {
                                    setForm(f => ({ ...f, delivery_method: 'standard' }));
                                    clearFieldError('delivery.formatted');
                                }}
                                className={`text-left rounded-xl border p-4 transition cursor-pointer relative ${
                                    form.delivery_method === 'standard'
                                        ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/25'
                                        : 'border-brand-border bg-white hover:border-brand-primary'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-bold text-sm text-brand-dark">Store Delivery</p>
                                    <p className="font-bold text-brand-primary text-sm whitespace-nowrap">
                                        {isCalculatingDistance
                                            ? '...'
                                            : isWithinFreeRadius
                                                ? 'FREE'
                                                : formatKES(weightFee + distanceFee)}
                                    </p>
                                </div>
                                <p className="text-[11px] text-gray-500">
                                    {isWithinFreeRadius
                                        ? `Free delivery within ${free_radius_km}km of HQ`
                                        : `KSh ${price_per_kg}/kg + KSh ${price_per_km}/km`}
                                </p>
                            </button>

                            {/* 2. Store Pickup */}
                            <button
                                type="button"
                                onClick={() => {
                                    setForm(f => ({ ...f, delivery_method: 'pickup' }));
                                    clearFieldError('delivery.formatted');
                                }}
                                className={`text-left rounded-xl border p-4 transition cursor-pointer ${
                                    form.delivery_method === 'pickup'
                                        ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/25'
                                        : 'border-brand-border bg-white hover:border-brand-primary'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-bold text-sm text-brand-dark">Store Pickup</p>
                                    <p className="font-bold text-brand-primary text-sm">FREE</p>
                                </div>
                                <p className="text-[11px] text-gray-500">Collect from our warehouse</p>
                            </button>

                            {/* 3. Hire Independent Transporter */}
                            <button
                                type="button"
                                onClick={() => {
                                    setForm(f => ({ ...f, delivery_method: 'transporter' }));
                                    clearFieldError('delivery.formatted');
                                }}
                                className={`text-left rounded-xl border p-4 transition cursor-pointer ${
                                    form.delivery_method === 'transporter'
                                        ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/25'
                                        : 'border-brand-border bg-white hover:border-brand-primary'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-bold text-sm text-brand-dark leading-tight">Call Transporter</p>
                                    <p className="font-bold text-brand-primary text-sm">KSh 0</p>
                                </div>
                                <p className="text-[11px] text-gray-500">
                                    Pay driver upon safe site delivery
                                </p>
                            </button>
                        </div>

                        {/* Transporter Details Callout if 3rd method selected */}
                        {form.delivery_method === 'transporter' && (
                            <div className="mt-4 p-4 rounded-2xl bg-brand-light border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold text-brand-dark">
                                        Pay Transporter On Arrival
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        You only pay for materials today. Transport fare is settled directly with the driver once offloaded at your site.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowTransporterModal(true)}
                                    className="bg-brand-dark text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-black transition flex-shrink-0 cursor-pointer"
                                >
                                    Browse Transporters
                                </button>
                            </div>
                        )}
                    </Section>
                </div>

                <aside className="lg:col-span-1 lg:sticky lg:top-28 mt-6 lg:mt-0">
                    <div className="bg-white rounded-2xl border border-brand-border p-5 md:p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-brand-dark mb-4">Your Cart</h2>

                        {items.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-sm">Your cart is empty.</p>
                                <Link href="/shop" className="inline-block mt-3 text-sm text-brand-primary font-semibold hover:underline">
                                    Continue shopping →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4 mb-6 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1">
                                {items.map((item) => (
                                    <div key={item.key} className="flex gap-3">
                                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-brand-border">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-gray-400 font-bold text-[10px]">Item</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate text-brand-dark">{item.productName}</p>
                                            <p className="text-xs text-gray-500">{item.unitLabel}</p>
                                            <div className="mt-1.5 flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setQty(item.key, Math.max(1, item.qty - 1))}
                                                    className="w-6 h-6 rounded border border-brand-border text-xs hover:border-brand-primary flex items-center justify-center bg-white cursor-pointer"
                                                >
                                                    −
                                                </button>
                                                <span className="text-xs font-semibold w-4 text-center">{item.qty}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setQty(item.key, item.qty + 1)}
                                                    className="w-6 h-6 rounded border border-brand-border text-xs hover:border-brand-primary flex items-center justify-center bg-white cursor-pointer"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.key)}
                                                    className="ml-auto text-[11px] text-red-500 hover:underline cursor-pointer"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold whitespace-nowrap text-brand-dark">{formatKES(item.lineTotal)}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-t border-brand-border pt-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium text-brand-dark">{formatKES(subtotal)}</span>
                            </div>

                            <div className="flex justify-between items-start">
                                <span className="text-gray-500">Delivery</span>
                                <div className="text-right">
                                    {form.delivery_method === 'pickup' ? (
                                        <span className="font-medium text-brand-primary">Free (Pickup)</span>
                                    ) : form.delivery_method === 'transporter' ? (
                                        <>
                                            <span className="font-medium text-brand-primary">Pay on Site</span>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                Direct to transporter
                                            </div>
                                        </>
                                    ) : isWithinFreeRadius ? (
                                        <>
                                            <span className="font-medium text-emerald-600 font-bold">FREE</span>
                                            <div className="text-[10px] text-emerald-600 mt-0.5">
                                                Within {free_radius_km}km promo
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-medium text-brand-dark">
                                                {isCalculatingDistance ? 'Calculating...' : formatKES(totalDeliveryFee)}
                                            </span>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                Weight: {totalWeight} KG | Distance: {distanceKm} KM
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between pt-3 border-t border-brand-border mt-3 text-base">
                                <span className="font-bold text-brand-dark">Total</span>
                                <span className="font-extrabold text-brand-primary text-xl">
                                    {isCalculatingDistance ? '...' : formatKES(total)}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={items.length === 0 || isProcessing || isCalculatingDistance}
                            className="mt-6 w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-sm hover:bg-black disabled:opacity-40 transition cursor-pointer"
                        >
                            {isProcessing
                                ? 'Proceeding to Payment...'
                                : isCalculatingDistance
                                    ? 'Calculating Distance...'
                                    : `Pay · ${formatKES(total)}`}
                        </button>

                        <Link href="/shop" className="mt-4 block text-center text-sm text-gray-500 hover:text-brand-primary font-medium">
                            ← Continue Shopping
                        </Link>
                    </div>
                </aside>
            </form>

            {/* Transporters Directory Modal */}
            {showTransporterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
                        <div className="flex justify-between items-center pb-4 border-b border-brand-border mb-4">
                            <div>
                                <h3 className="text-lg font-extrabold text-brand-dark">Verified Transporters</h3>
                                <p className="text-xs text-gray-500">Call to book and pay driver upon safe delivery.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTransporterModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {transporters.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-500">
                                No verified transporters listed yet. Choose Standard Delivery or Store Pickup.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transporters.map((t) => (
                                    <div key={t.id} className="p-3.5 rounded-2xl bg-brand-light border border-brand-border flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-sm text-brand-dark">{t.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{t.vehicle_type}</p>
                                            {t.area && <p className="text-[11px] text-gray-400 mt-0.5">Base: {t.area}</p>}
                                        </div>
                                        <a
                                            href={`tel:${t.phone}`}
                                            className="bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 flex-shrink-0"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H3.75A2.25 2.25 0 001.5 4.5v2.25z" />
                                            </svg>
                                            <span>Call Driver</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-5 pt-4 border-t border-brand-border text-center">
                            <button
                                type="button"
                                onClick={() => setShowTransporterModal(false)}
                                className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold text-xs cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

function Section({ title, children }) {
    return (
        <section className="bg-white rounded-2xl border border-brand-border p-5 md:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-dark mb-4">{title}</h2>
            {children}
        </section>
    );
}

function Field({ label, value, onChange, placeholder, error, type = 'text', required, disabled }) {
    return (
        <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full rounded-lg px-4 py-3.5 text-sm placeholder-gray-400 transition ${
                    error
                        ? 'border-2 border-red-500 bg-red-50/50 text-red-900 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                        : 'bg-brand-input border border-transparent focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25'
                } ${disabled ? 'bg-gray-50 text-gray-500' : ''}`}
            />
            {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
        </div>
    );
}