import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import { useCart } from '../../Stores/cart';
import GoogleAddressInput from '../../Components/GoogleAddressInput';
import axios from 'axios';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

export default function CheckoutIndex({ transporters = [] }) {
    const { items, setQty, removeItem } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [distanceKm, setDistanceKm] = useState(0);
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
    const [selectedTransporter, setSelectedTransporter] = useState(null);

    const [form, setForm] = useState({
        customer: { name: '', phone: '', email: '' },
        delivery: { formatted: '', lat: null, lng: null, placeId: '', landmark: '', notes: '', transporter_id: null },
        delivery_method: 'transporter', // Default to independent transporter
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlError = params.get('error');
        if (urlError) {
            setPaymentError(urlError);
            window.history.replaceState({}, '', window.location.pathname);
        }
        // Auto-select first available transporter if none selected
        if (transporters.length > 0 && !selectedTransporter) {
            setSelectedTransporter(transporters[0]);
            setForm(f => ({
                ...f,
                delivery: { ...f.delivery, transporter_id: transporters[0].id }
            }));
        }
    }, [transporters]);

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

    // Calculate dynamic transport fee based on selected transporter's rate card
    let estimatedTransportFee = 0;
    if (form.delivery_method === 'transporter' && selectedTransporter) {
        const base = Number(selectedTransporter.base_fare || 0);
        const weightFee = totalWeight * Number(selectedTransporter.rate_per_kg || 0);
        const distanceFee = distanceKm > 0 ? Math.ceil(distanceKm) * Number(selectedTransporter.rate_per_km || 0) : 0;
        estimatedTransportFee = base + weightFee + distanceFee;
    }

    const total = subtotal; // Materials paid online; transport fee is paid to driver upon delivery

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

        if (form.delivery_method === 'transporter') {
            if (!form.delivery.formatted) {
                errs['delivery.formatted'] = 'Please search and select your site destination address.';
            }
            if (!form.delivery.transporter_id) {
                errs['delivery.transporter_id'] = 'Please select an available transporter for your delivery.';
            }
        }

        return errs;
    };

    const submit = async (e) => {
        e.preventDefault();

        if (items.length === 0) {
            showError('Your cart is empty. Please add items before checking out.');
            return;
        }

        if (isCalculatingDistance && form.delivery_method === 'transporter') {
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
                delivery: {
                    ...form.delivery,
                    estimated_transport_fee: estimatedTransportFee,
                    transporter_name: selectedTransporter?.name,
                    transporter_phone: selectedTransporter?.phone,
                },
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
                <span className="text-brand-dark font-medium">Fulfillment</span>
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

                    {form.delivery_method === 'transporter' && (
                        <Section title="Delivery destination address">
                            <div>
                                <label className="block text-sm font-medium text-brand-dark mb-1.5">
                                    Search site address <span className="text-red-500">*</span>
                                </label>

                                <GoogleAddressInput onAddressSelect={handleAddressSelect} />

                                {errors['delivery.formatted'] && (
                                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                                        {errors['delivery.formatted']}
                                    </p>
                                )}

                                {isCalculatingDistance && (
                                    <p className="text-xs text-brand-primary mt-2 animate-pulse font-medium">
                                        Calculating delivery distance from warehouse...
                                    </p>
                                )}

                                {form.delivery.formatted && !isCalculatingDistance && (
                                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
                                        <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <div>
                                            <p className="text-xs font-semibold text-emerald-800">Site Destination Confirmed:</p>
                                            <p className="text-sm text-emerald-700">{form.delivery.formatted}</p>
                                            <p className="text-[11px] text-emerald-600 mt-0.5">
                                                Distance: <strong>{distanceKm} km</strong>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="Landmark (optional)"
                                    value={form.delivery.landmark}
                                    onChange={(e) => updateDelivery('landmark', e.target.value)}
                                    placeholder="e.g. Next to Naivas Supermarket"
                                />
                                <Field
                                    label="Delivery notes"
                                    value={form.delivery.notes}
                                    onChange={(e) => updateDelivery('notes', e.target.value)}
                                    placeholder="e.g. Gate 3, call driver on arrival"
                                />
                            </div>
                        </Section>
                    )}

                    <Section title="Fulfillment method">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                            {/* 1. Choose Transporter */}
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, delivery_method: 'transporter' }))}
                                className={`text-left rounded-xl border p-4 transition cursor-pointer ${
                                    form.delivery_method === 'transporter'
                                        ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/25'
                                        : 'border-brand-border bg-white hover:border-brand-primary'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-bold text-sm text-brand-dark">Hire Transporter</p>
                                    <p className="font-bold text-brand-primary text-sm">Pay on Site</p>
                                </div>
                                <p className="text-[11px] text-gray-500">Select an available driver for haulage</p>
                            </button>

                            {/* 2. Store Pickup */}
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, delivery_method: 'pickup' }))}
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
                        </div>

                        {/* Transporter Selection List */}
                        {form.delivery_method === 'transporter' && (
                            <div className="space-y-3 pt-3 border-t border-brand-border">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Select Available Transporter ({transporters.length})
                                    </h3>
                                    <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                                        Online & Ready
                                    </span>
                                </div>

                                {transporters.length === 0 ? (
                                    <div className="p-6 rounded-2xl bg-brand-light border border-brand-border text-center text-xs text-gray-500">
                                        No independent drivers are currently online. Please select <strong>Store Pickup</strong> or check back shortly.
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {transporters.map((t) => {
                                            const isSelected = selectedTransporter?.id === t.id;
                                            // calculate individual transporter estimate for preview
                                            const base = Number(t.base_fare || 0);
                                            const wFee = totalWeight * Number(t.rate_per_kg || 0);
                                            const dFee = distanceKm > 0 ? Math.ceil(distanceKm) * Number(t.rate_per_km || 0) : 0;
                                            const est = base + wFee + dFee;

                                            return (
                                                <div
                                                    key={t.id}
                                                    onClick={() => {
                                                        setSelectedTransporter(t);
                                                        setForm(f => ({
                                                            ...f,
                                                            delivery: { ...f.delivery, transporter_id: t.id }
                                                        }));
                                                        clearFieldError('delivery.transporter_id');
                                                    }}
                                                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                                                        isSelected
                                                            ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20'
                                                            : 'border-brand-border bg-white hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-gray-300 bg-white'}`}>
                                                            {isSelected && <span className="text-[10px] font-bold">✓</span>}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-brand-dark">{t.name}</p>
                                                            <p className="text-xs text-gray-500">{t.vehicle_type} {t.plate_number ? `· ${t.plate_number}` : ''}</p>
                                                            {t.area && <p className="text-[11px] text-gray-400">Base: {t.area}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-xs font-bold text-brand-primary">Est. Haulage</p>
                                                        <p className="text-sm font-extrabold text-brand-dark">{formatKES(est)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {errors['delivery.transporter_id'] && (
                                    <p className="text-xs text-red-600 font-medium">{errors['delivery.transporter_id']}</p>
                                )}
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
                                <span className="text-gray-500">Materials Subtotal</span>
                                <span className="font-medium text-brand-dark">{formatKES(subtotal)}</span>
                            </div>

                            <div className="flex justify-between items-start">
                                <span className="text-gray-500">Transport Fee</span>
                                <div className="text-right">
                                    {form.delivery_method === 'pickup' ? (
                                        <span className="font-medium text-brand-primary">Free (Pickup)</span>
                                    ) : (
                                        <>
                                            <span className="font-medium text-brand-primary">
                                                {selectedTransporter ? formatKES(estimatedTransportFee) : 'Select Driver'}
                                            </span>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                Pay directly to driver on site
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between pt-3 border-t border-brand-border mt-3 text-base">
                                <span className="font-bold text-brand-dark">Pay Online Now</span>
                                <span className="font-extrabold text-brand-primary text-xl">
                                    {formatKES(total)}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={items.length === 0 || isProcessing || (form.delivery_method === 'transporter' && isCalculatingDistance)}
                            className="mt-6 w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-sm hover:bg-black disabled:opacity-40 transition cursor-pointer"
                        >
                            {isProcessing
                                ? 'Proceeding to Payment...'
                                : isCalculatingDistance
                                    ? 'Calculating Distance...'
                                    : `Pay Materials · ${formatKES(total)}`}
                        </button>

                        <Link href="/shop" className="mt-4 block text-center text-sm text-gray-500 hover:text-brand-primary font-medium">
                            ← Continue Shopping
                        </Link>
                    </div>
                </aside>
            </form>
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