import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import { useCart } from '../../Stores/cart';
import GoogleAddressInput from '../../Components/GoogleAddressInput';
import axios from 'axios';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

function VehicleIllustration({ type = '', size = 56 }) {
    const t = (type || '').toLowerCase();

    // 1. Motorbike / Courier (Isometric Bolt delivery scooter with cargo box)
    if (t.includes('motorbike') || t.includes('courier') || t.includes('bike')) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: size, height: size, minWidth: size, minHeight: size }}
                className="flex-shrink-0"
            >
                <rect width="64" height="64" rx="16" fill="#F0FDF4" />
                {/* Ground Shadow */}
                <ellipse cx="32" cy="51" rx="22" ry="4" fill="#000000" fillOpacity="0.08" />
                {/* Rear Wheel */}
                <ellipse cx="18" cy="44" rx="7" ry="5.5" fill="#1E293B" />
                <ellipse cx="18" cy="44" rx="4" ry="3" fill="#E2E8F0" />
                {/* Front Wheel */}
                <ellipse cx="46" cy="44" rx="7" ry="5.5" fill="#1E293B" />
                <ellipse cx="46" cy="44" rx="4" ry="3" fill="#E2E8F0" />
                {/* Scooter Chassis & Floorboard */}
                <path d="M19 41L28 41L34 43L43 38" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                {/* Green Body Shell */}
                <path d="M25 39C25 34 29 32 35 32H39L44 41H31L25 39Z" fill="#32BB78" />
                {/* Front Apron & Steering */}
                <path d="M38 32L42 21H46L44 38Z" fill="#32BB78" />
                {/* Windshield */}
                <path d="M43 20L45 13H48L46 20Z" fill="#7DD3FC" fillOpacity="0.75" />
                {/* Black Driver Seat */}
                <path d="M22 34C22 32 25 31 31 31C34 31 35 33 34 35H22V34Z" fill="#0F172A" />
                {/* Courier Delivery Box */}
                <rect x="12" y="20" width="13" height="13" rx="3" fill="#32BB78" />
                <path d="M12 24.5H25" stroke="#16A34A" strokeWidth="1.5" />
                <rect x="16" y="23" width="5" height="3" rx="0.75" fill="#FFFFFF" />
                {/* Handlebars */}
                <path d="M41 21H48" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
                {/* Headlight */}
                <circle cx="46" cy="24" r="1.5" fill="#FDE047" />
            </svg>
        );
    }

    // 2. Canter (3 - 5 Tonnes) — Isometric Box Cargo Truck
    if (t.includes('canter')) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: size, height: size, minWidth: size, minHeight: size }}
                className="flex-shrink-0"
            >
                <rect width="64" height="64" rx="16" fill="#F0FDF4" />
                {/* Ground Shadow */}
                <ellipse cx="32" cy="51" rx="24" ry="4" fill="#000000" fillOpacity="0.08" />
                {/* Wheels */}
                <circle cx="19" cy="45" r="5.5" fill="#1E293B" />
                <circle cx="19" cy="45" r="3" fill="#E2E8F0" />
                <circle cx="45" cy="45" r="5.5" fill="#1E293B" />
                <circle cx="45" cy="45" r="3" fill="#E2E8F0" />
                {/* Rear Cargo Box */}
                <rect x="8" y="17" width="28" height="23" rx="3" fill="#32BB78" />
                <rect x="8" y="34" width="28" height="6" fill="#16A34A" />
                <path d="M14 17V40M22 17V40M30 17V40" stroke="#22C55E" strokeWidth="1" strokeOpacity="0.4" />
                {/* Forward Cabin */}
                <path d="M36 21H48C51 21 53 23 53 26V40H36V21Z" fill="#1E293B" />
                {/* Windshield */}
                <path d="M39 24H48C49.5 24 50.5 25 50.5 26.5V32H39V24Z" fill="#7DD3FC" fillOpacity="0.85" />
                {/* Front Bumper & Headlight */}
                <rect x="51" y="36" width="3" height="3" rx="1" fill="#FDE047" />
                <rect x="36" y="38" width="18" height="3" fill="#0F172A" />
            </svg>
        );
    }

    // 3. Tipper / Lorry (7 - 10 Tonnes) — Heavy Tipper with Angled Bed
    if (t.includes('tipper') || t.includes('lorry')) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: size, height: size, minWidth: size, minHeight: size }}
                className="flex-shrink-0"
            >
                <rect width="64" height="64" rx="16" fill="#F0FDF4" />
                {/* Ground Shadow */}
                <ellipse cx="32" cy="52" rx="25" ry="4" fill="#000000" fillOpacity="0.08" />
                {/* Dual Rear Wheels + Front Wheel */}
                <circle cx="15" cy="46" r="5" fill="#1E293B" />
                <circle cx="15" cy="46" r="2.5" fill="#E2E8F0" />
                <circle cx="26" cy="46" r="5" fill="#1E293B" />
                <circle cx="26" cy="46" r="2.5" fill="#E2E8F0" />
                <circle cx="47" cy="46" r="5" fill="#1E293B" />
                <circle cx="47" cy="46" r="2.5" fill="#E2E8F0" />
                {/* Reinforced Tipper Bed */}
                <path d="M7 21H37L35 41H7V21Z" fill="#32BB78" />
                <path d="M7 21L11 18H37L37 21" fill="#22C55E" />
                <path d="M14 21V41M21 21V41M28 21V41" stroke="#16A34A" strokeWidth="1.5" />
                {/* Hydraulic Lift Piston */}
                <path d="M35 38L38 31" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
                {/* Heavy Duty Cabin */}
                <path d="M39 20H51C53.5 20 55 22 55 24.5V41H39V20Z" fill="#1E293B" />
                {/* Windshield */}
                <path d="M42 23H50C51.5 23 52.5 24 52.5 25.5V31H42V23Z" fill="#7DD3FC" fillOpacity="0.85" />
                {/* Grille & Headlight */}
                <circle cx="53.5" cy="36.5" r="1.5" fill="#FDE047" />
                <rect x="39" y="39" width="16" height="3" fill="#0F172A" />
            </svg>
        );
    }

    // 4. Trailer / Prime Mover (20+ Tonnes) — Long Freight Hauler
    if (t.includes('trailer') || t.includes('prime') || t.includes('mover')) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: size, height: size, minWidth: size, minHeight: size }}
                className="flex-shrink-0"
            >
                <rect width="64" height="64" rx="16" fill="#F0FDF4" />
                {/* Ground Shadow */}
                <ellipse cx="32" cy="52" rx="26" ry="4" fill="#000000" fillOpacity="0.08" />
                {/* Wheels across wheelbase */}
                <circle cx="11" cy="46" r="4.5" fill="#1E293B" />
                <circle cx="11" cy="46" r="2.2" fill="#E2E8F0" />
                <circle cx="21" cy="46" r="4.5" fill="#1E293B" />
                <circle cx="21" cy="46" r="2.2" fill="#E2E8F0" />
                <circle cx="33" cy="46" r="4.5" fill="#1E293B" />
                <circle cx="33" cy="46" r="2.2" fill="#E2E8F0" />
                <circle cx="48" cy="46" r="5" fill="#1E293B" />
                <circle cx="48" cy="46" r="2.5" fill="#E2E8F0" />
                {/* Shipping Cargo Container */}
                <rect x="6" y="19" width="31" height="22" rx="2" fill="#32BB78" />
                <path d="M12 19V41M18 19V41M24 19V41M30 19V41" stroke="#16A34A" strokeWidth="1.2" />
                {/* Big Rig Cab */}
                <path d="M39 16H49C52 16 54 18 54 21V41H39V16Z" fill="#1E293B" />
                {/* Windshield */}
                <path d="M42 20H49.5C51 20 52 21 52 22.5V28H42V20Z" fill="#7DD3FC" fillOpacity="0.85" />
                {/* Chrome Exhaust Stack */}
                <rect x="40" y="12" width="2" height="6" rx="1" fill="#F97316" />
                <circle cx="53" cy="36" r="1.5" fill="#FDE047" />
            </svg>
        );
    }

    // 5. Tuk-Tuk / Delivery Van — Streamlined Metro Van
    if (t.includes('tuk') || t.includes('van')) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: size, height: size, minWidth: size, minHeight: size }}
                className="flex-shrink-0"
            >
                <rect width="64" height="64" rx="16" fill="#F0FDF4" />
                {/* Ground Shadow */}
                <ellipse cx="32" cy="51" rx="23" ry="4" fill="#000000" fillOpacity="0.08" />
                {/* Wheels */}
                <circle cx="17" cy="45" r="5.5" fill="#1E293B" />
                <circle cx="17" cy="45" r="3" fill="#E2E8F0" />
                <circle cx="45" cy="45" r="5.5" fill="#1E293B" />
                <circle cx="45" cy="45" r="3" fill="#E2E8F0" />
                {/* Aerodynamic Body */}
                <path d="M9 24C9 21.5 11 19.5 13.5 19.5H38L49 26C52 28 53 30.5 53 33.5V42H9V24Z" fill="#32BB78" />
                <path d="M9 36H53V42H9V36Z" fill="#16A34A" />
                {/* Windows */}
                <path d="M37 22H44.5L49 27.5H37V22Z" fill="#1E293B" />
                <rect x="25" y="22" width="10" height="7.5" rx="1.5" fill="#7DD3FC" fillOpacity="0.85" />
                {/* Headlight */}
                <circle cx="51.5" cy="33.5" r="1.5" fill="#FDE047" />
            </svg>
        );
    }

    // Default: Pickup (1 - 2 Tonnes) — Bold Flatbed Pickup
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: size, height: size, minWidth: size, minHeight: size }}
            className="flex-shrink-0"
        >
            <rect width="64" height="64" rx="16" fill="#F0FDF4" />
            {/* Ground Shadow */}
            <ellipse cx="32" cy="51" rx="23" ry="4" fill="#000000" fillOpacity="0.08" />
            {/* Wheels */}
            <circle cx="17" cy="44" r="5.5" fill="#1E293B" />
            <circle cx="17" cy="44" r="3" fill="#E2E8F0" />
            <circle cx="44" cy="44" r="5.5" fill="#1E293B" />
            <circle cx="44" cy="44" r="3" fill="#E2E8F0" />
            {/* Flat Cargo Bed */}
            <path d="M8 30H27V41H8V30Z" fill="#32BB78" />
            {/* Cargo Payload (Bags) */}
            <rect x="10" y="25" width="7" height="6" rx="1.5" fill="#FDE047" />
            <rect x="18" y="25" width="7" height="6" rx="1.5" fill="#F97316" />
            {/* Cabin */}
            <path d="M27 23C27 21 29 19.5 31 19.5H41L49 27.5V41H27V23Z" fill="#32BB78" />
            {/* Windows */}
            <path d="M30 22.5H38.5V28H30V22.5Z" fill="#1E293B" />
            <path d="M40.5 22.5H42.5L46.5 27.5H40.5V22.5Z" fill="#7DD3FC" fillOpacity="0.85" />
            {/* Side Protection Line */}
            <rect x="8" y="36.5" width="43" height="3.5" fill="#16A34A" />
            {/* Headlight */}
            <circle cx="48" cy="33" r="1.5" fill="#FDE047" />
        </svg>
    );
}

export default function CheckoutIndex({ transporters = [], free_radius_km = 3 }) {
    const { items, setQty, removeItem } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [distanceKm, setDistanceKm] = useState(0);
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

    // Keep transporter list hidden behind drawer/modal by default
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [selectedTransporter, setSelectedTransporter] = useState(null);

    const [form, setForm] = useState({
        customer: { name: '', phone: '', email: '' },
        delivery: { formatted: '', lat: null, lng: null, placeId: '', landmark: '', notes: '', transporter_id: null },
        delivery_method: 'transporter', // 'transporter' or 'pickup'
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

    useEffect(() => {
        setSelectedTransporter((current) => {
            if (transporters.length === 0) {
                setForm((f) => ({
                    ...f,
                    delivery: { ...f.delivery, transporter_id: null },
                }));
                return null;
            }

            const match = current ? transporters.find((t) => t.id === current.id) : null;
            const next = match || transporters[0];

            setForm((f) =>
                f.delivery.transporter_id === next.id
                    ? f
                    : { ...f, delivery: { ...f.delivery, transporter_id: next.id } }
            );
            return next;
        });
    }, [transporters]);

    useEffect(() => {
        const refresh = () => {
            if (!isProcessing && !isPickerOpen) {
                router.reload({ only: ['transporters'], preserveScroll: true });
            }
        };
        window.addEventListener('focus', refresh);
        const timer = setInterval(refresh, 10000);
        return () => {
            window.removeEventListener('focus', refresh);
            clearInterval(timer);
        };
    }, [isProcessing, isPickerOpen]);

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

    // Dynamic transport calculation using chosen driver's rate card
    const freeRadius = Number(free_radius_km || 0);
    const billableKm = distanceKm > freeRadius ? Math.ceil(distanceKm - freeRadius) : 0;

    let estimatedTransportFee = 0;
    if (form.delivery_method === 'transporter' && selectedTransporter) {
        const base = Number(selectedTransporter.base_fare || 0);
        const wFee = totalWeight * Number(selectedTransporter.rate_per_kg || 0);
        const dFee = billableKm * Number(selectedTransporter.rate_per_km || 0);
        estimatedTransportFee = base + wFee + dFee;
    }

    const total = subtotal; // Materials paid online; driver paid on delivery

    const handleAddressSelect = async (address) => {
        setForm((f) => ({ ...f, delivery: { ...f.delivery, ...address } }));
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
                errs['delivery.transporter_id'] = 'Please click "Browse Transporters" and select an available driver.';
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
                if (error.response?.status === 422) {
                    setSelectedTransporter(null);
                    setForm((f) => ({ ...f, delivery: { ...f.delivery, transporter_id: null } }));
                    router.reload({ only: ['transporters'] });
                }
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {/* 1. Hire Transporter */}
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, delivery_method: 'transporter' }))}
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
                                <p className="text-[11px] text-gray-500">Book an independent driver; pay upon delivery</p>
                            </button>

                            {/* 2. Store Pickup */}
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, delivery_method: 'pickup' }))}
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
                                <p className="text-[11px] text-gray-500">Collect directly from our warehouse</p>
                            </button>
                        </div>

                        {/* Selected Transporter Card with Bolt-style Illustration */}
                        {form.delivery_method === 'transporter' && (
                            <div className="p-4 rounded-2xl bg-brand-light border border-brand-border space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Assigned Transporter
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Driver phone details will be unlocked on your receipt after payment.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsPickerOpen(true)}
                                        className="bg-brand-dark text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-black transition cursor-pointer flex items-center gap-1.5"
                                    >
                                        <span>Browse Transporters ({transporters.length} online)</span>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </button>
                                </div>

                                {selectedTransporter ? (
                                    <div className="p-3.5 rounded-2xl bg-white border border-brand-border flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <VehicleIllustration
                                                type={selectedTransporter.vehicle_type}
                                                size={56}
                                            />
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-brand-dark truncate">
                                                    {selectedTransporter.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {selectedTransporter.vehicle_type}
                                                    {selectedTransporter.plate_number ? ` · ${selectedTransporter.plate_number}` : ''}
                                                </p>
                                                {selectedTransporter.area && (
                                                    <p className="text-[11px] text-gray-400 truncate">
                                                        Base: {selectedTransporter.area}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[11px] font-semibold text-gray-400">Est. Haul Fee</p>
                                            <p className="text-sm font-extrabold text-brand-primary">
                                                {formatKES(estimatedTransportFee)}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl bg-white border border-dashed border-gray-300 text-center text-xs text-gray-500">
                                        No driver selected yet. Click <strong>Browse Transporters</strong> to choose one.
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
                                                {selectedTransporter ? formatKES(estimatedTransportFee) : 'Pick Driver'}
                                            </span>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                Pay driver upon arrival
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

            {/* Modal: Browse Transporters with Bolt-style Illustration Cards */}
            {isPickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
                        <div className="flex justify-between items-center pb-4 border-b border-brand-border mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-brand-dark">Select Transporter</h3>
                                <p className="text-xs text-gray-500">Only currently online drivers are listed.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPickerOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {transporters.length === 0 ? (
                            <div className="py-8 text-center text-xs text-gray-500">
                                No transporters are currently online. Please choose Store Pickup or check back shortly.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {transporters.map((t) => {
                                    const isSelected = selectedTransporter?.id === t.id;
                                    const base = Number(t.base_fare || 0);
                                    const wFee = totalWeight * Number(t.rate_per_kg || 0);
                                    const dFee = billableKm * Number(t.rate_per_km || 0);
                                    const est = base + wFee + dFee;

                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => {
                                                setSelectedTransporter(t);
                                                setForm((f) => ({
                                                    ...f,
                                                    delivery: { ...f.delivery, transporter_id: t.id },
                                                }));
                                                clearFieldError('delivery.transporter_id');
                                                setIsPickerOpen(false);
                                            }}
                                            className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                                                isSelected
                                                    ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20'
                                                    : 'border-brand-border bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <VehicleIllustration
                                                    type={t.vehicle_type}
                                                    size={56}
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm text-brand-dark truncate">
                                                        {t.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {t.vehicle_type}
                                                        {t.plate_number ? ` · ${t.plate_number}` : ''}
                                                    </p>
                                                    {t.area && (
                                                        <p className="text-[11px] text-gray-400 truncate">
                                                            Base: {t.area}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs font-bold text-brand-primary">Est. Fee</p>
                                                <p className="text-sm font-extrabold text-brand-dark">{formatKES(est)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-5 pt-4 border-t border-brand-border">
                            <button
                                type="button"
                                onClick={() => setIsPickerOpen(false)}
                                className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold text-xs cursor-pointer"
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