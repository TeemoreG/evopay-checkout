import { Link } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import { useCart } from '../../Stores/cart';
import GoogleAddressInput from '../../Components/GoogleAddressInput';
import axios from 'axios';

const formatKES = (v) =>
    'KSh ' + Number(v).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const paymentMethods = [
    { key: 'mpesa', label: 'M-Pesa', subtitle: 'STK push', image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1781875182/Mpesa_bvcz8v.png', disabled: false },
    { key: 'card', label: 'Card', subtitle: 'Visa / MC', image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1789069363/visa-mastercard-logos_mpvf6q.jpg', disabled: false },
    { key: 'airtel', label: 'Airtel', subtitle: 'Soon', image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1789463153/422-4221364_send-cash-to-ghana-airtel-logo-new-hd_scmhh9.png', disabled: true },
];

export default function CheckoutIndex() {
    const { items, setQty, removeItem } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [distanceKm, setDistanceKm] = useState(3); 

    const [form, setForm] = useState({
        customer: { name: '', phone: '', email: '' },
        delivery: { formatted: '', lat: null, lng: null, placeId: '', landmark: '', notes: '' },
        payment_method: 'mpesa',
        delivery_method: 'standard',
    });
    
    const [errors] = useState({});

    const updateCustomer = (key, value) => setForm((f) => ({ ...f, customer: { ...f.customer, [key]: value } }));
    const updateDelivery = (key, value) => setForm((f) => ({ ...f, delivery: { ...f.delivery, [key]: value } }));

    const subtotal = items.reduce((n, i) => n + i.lineTotal, 0);
    
    // DYNAMIC WEIGHT & DISTANCE LOGIC
    const totalWeight = items.reduce((acc, item) => acc + (item.qty * (item.weight || 0)), 0); 
    const weightFee = totalWeight * 20; // KSh 20 per KG
    const distanceFee = distanceKm * 50; // KSh 50 per KM
    const totalDeliveryFee = form.delivery_method === 'pickup' ? 0 : (weightFee + distanceFee);
    const total = subtotal + totalDeliveryFee;

    const submit = async (e) => {
        e.preventDefault();
        if (items.length === 0) return;
        
        if (form.delivery_method === 'standard' && !form.delivery.formatted) {
            alert("Please select a delivery address.");
            return;
        }

        setIsProcessing(true);

        try {
            const response = await axios.post('/checkout/process', {
                items: items,
                subtotal: subtotal,
                payment_method: form.payment_method,
                delivery_method: form.delivery_method,
                customer: form.customer,
                delivery: form.delivery
            });

            if (response.data.status === 'redirect') {
                window.location.href = response.data.url;
            } else if (response.data.status === 'pending') {
                alert(response.data.message);
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Payment failed to initialize.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <MainLayout minimal>
            <div className="hidden md:flex mb-8 items-center gap-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-brand-primary">Shop</Link>
                <span>›</span>
                <span>Shipping</span>
                <span>›</span>
                <span className="text-brand-dark font-medium">Payment</span>
            </div>

            <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                {/* LEFT COLUMN (FORMS) */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* CONTACT */}
                    <Section title="Contact details">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Full name" required value={form.customer.name} onChange={(e) => updateCustomer('name', e.target.value)} placeholder="e.g. John Kamau" error={errors['customer.name']} />
                            <Field label="Phone number" required value={form.customer.phone} onChange={(e) => updateCustomer('phone', e.target.value)} placeholder="+254 7XX XXX XXX" error={errors['customer.phone']} />
                            <div className="sm:col-span-2">
                                <Field label="Email (optional)" type="email" value={form.customer.email} onChange={(e) => updateCustomer('email', e.target.value)} placeholder="you@example.com" error={errors['customer.email']} />
                            </div>
                        </div>
                    </Section>

                    {/* ADDRESS */}
                    <Section title="Delivery address">
                        <div>
                            <label className="block text-sm font-medium text-brand-dark mb-1.5">Search your address <span className="text-red-500">*</span></label>
                            
                            <GoogleAddressInput 
                                onAddressSelect={(address) => {
                                    setForm(f => ({ ...f, delivery: { ...f.delivery, ...address } }));
                                    setDistanceKm(Math.floor(Math.random() * 15) + 2); 
                                }} 
                            />

                            {form.delivery.formatted && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <div>
                                        <p className="text-xs font-semibold text-green-800">Confirmed Address:</p>
                                        <p className="text-sm text-green-700">{form.delivery.formatted}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Landmark (optional)" value={form.delivery.landmark} onChange={(e) => updateDelivery('landmark', e.target.value)} placeholder="e.g. Next to Imaara Mall" />
                            <Field label="Delivery notes" value={form.delivery.notes} onChange={(e) => updateDelivery('notes', e.target.value)} placeholder="e.g. Gate 3, opposite Shell" />
                        </div>
                    </Section>

                    {/* DELIVERY METHOD */}
                    <Section title="Delivery method">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button type="button" onClick={() => setForm(f => ({ ...f, delivery_method: 'standard' }))} className={`text-left rounded-xl border p-4 transition relative ${form.delivery_method === 'standard' ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/25' : 'border-brand-border bg-white hover:border-brand-primary'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-bold text-sm text-brand-dark">Standard Delivery</p>
                                    <p className="font-bold text-brand-primary text-sm">{formatKES(totalDeliveryFee)}</p>
                                </div>
                                <p className="text-[11px] text-gray-500">Calculated by weight & distance</p>
                                {form.delivery_method === 'standard' && <span className="absolute -top-2 -right-2 bg-brand-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</span>}
                            </button>
                            
                            <button type="button" onClick={() => setForm(f => ({ ...f, delivery_method: 'pickup' }))} className={`text-left rounded-xl border p-4 transition relative ${form.delivery_method === 'pickup' ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/25' : 'border-brand-border bg-white hover:border-brand-primary'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-bold text-sm text-brand-dark">Store Pickup</p>
                                    <p className="font-bold text-brand-primary text-sm">FREE</p>
                                </div>
                                <p className="text-[11px] text-gray-500">Collect from our warehouse</p>
                                {form.delivery_method === 'pickup' && <span className="absolute -top-2 -right-2 bg-brand-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</span>}
                            </button>
                        </div>
                    </Section>

                    {/* PAYMENT METHOD */}
                    <Section title="Payment method">
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {paymentMethods.map((pm) => (
                                <button key={pm.key} type="button" disabled={pm.disabled} onClick={() => setForm(f => ({ ...f, payment_method: pm.key }))} className={`text-left rounded-xl border p-2 sm:p-4 transition relative flex flex-col items-center justify-center ${pm.disabled ? 'border-brand-border bg-gray-50 opacity-60 cursor-not-allowed' : form.payment_method === pm.key ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/25' : 'border-brand-border bg-white hover:border-brand-primary'}`}>
                                    <div className="h-8 sm:h-10 w-full flex items-center justify-center mb-1 sm:mb-3">
                                        <img src={pm.image} alt={pm.label} className="max-h-full max-w-[80%] object-contain" />
                                    </div>
                                    <div className="text-center w-full">
                                        <p className="font-bold text-[10px] sm:text-sm text-brand-dark truncate">{pm.label}</p>
                                        <p className="text-[9px] sm:text-[11px] text-gray-500 mt-0.5 truncate">{pm.subtitle}</p>
                                    </div>
                                    {pm.disabled && <span className="absolute top-1 right-1 sm:top-2 sm:right-2 text-[7px] sm:text-[9px] bg-gray-200 text-brand-dark px-1 sm:px-1.5 py-0.5 rounded font-bold uppercase">Soon</span>}
                                    {!pm.disabled && form.payment_method === pm.key && <span className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-brand-primary text-white rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-[8px] sm:text-[10px] font-bold">✓</span>}
                                </button>
                            ))}
                        </div>
                    </Section>
                </div>

                {/* RIGHT COLUMN (SUMMARY) */}
                <aside className="lg:col-span-1 lg:sticky lg:top-28 mt-6 lg:mt-0">
                    <div className="bg-white rounded-2xl border border-brand-border p-5 md:p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-brand-dark mb-4">Your Cart</h2>

                        {items.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-sm">Your cart is empty.</p>
                                <Link href="/" className="inline-block mt-3 text-sm text-brand-primary font-semibold hover:underline">Continue shopping →</Link>
                            </div>
                        ) : (
                            <div className="space-y-4 mb-6 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1">
                                {items.map((item) => (
                                    <div key={item.key} className="flex gap-3">
                                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-brand-border">
                                            {item.image_url ? <img src={item.image_url} alt={item.productName} className="w-full h-full object-cover" /> : <span className="text-gray-400 font-bold text-[10px]">Item</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate text-brand-dark">{item.productName}</p>
                                            <p className="text-xs text-gray-500">{item.unitLabel}</p>
                                            <div className="mt-1.5 flex items-center gap-2">
                                                <button type="button" onClick={() => setQty(item.key, Math.max(1, item.qty - 1))} className="w-6 h-6 rounded border border-brand-border text-xs hover:border-brand-primary flex items-center justify-center bg-white">−</button>
                                                <span className="text-xs font-semibold w-4 text-center">{item.qty}</span>
                                                <button type="button" onClick={() => setQty(item.key, item.qty + 1)} className="w-6 h-6 rounded border border-brand-border text-xs hover:border-brand-primary flex items-center justify-center bg-white">+</button>
                                                <button type="button" onClick={() => removeItem(item.key)} className="ml-auto text-[11px] text-red-500 hover:underline">Remove</button>
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
                            
                            {/* DELIVERY BREAKDOWN ADDED HERE */}
                            <div className="flex justify-between items-start">
                                <span className="text-gray-500">Delivery</span>
                                <div className="text-right">
                                    {form.delivery_method === 'pickup' ? (
                                        <span className="font-medium text-brand-primary">Free</span>
                                    ) : (
                                        <>
                                            <span className="font-medium text-brand-dark">{formatKES(totalDeliveryFee)}</span>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                Weight: {totalWeight} KG | Distance: {distanceKm} KM
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between pt-3 border-t border-brand-border mt-3 text-base">
                                <span className="font-bold text-brand-dark">Total</span>
                                <span className="font-extrabold text-brand-primary text-xl">{formatKES(total)}</span>
                            </div>
                        </div>

                        <button type="submit" disabled={items.length === 0 || isProcessing} className="mt-6 w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-sm hover:bg-black disabled:opacity-40 transition">
                            {isProcessing ? 'Initializing Payment...' : `Pay · ${formatKES(total)}`}
                        </button>

                        <Link href="/" className="mt-4 block text-center text-sm text-gray-500 hover:text-brand-primary font-medium">← Continue Shopping</Link>
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
            <label className="block text-sm font-medium text-brand-dark mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
            <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder} disabled={disabled} className={`w-full rounded-lg bg-brand-input border px-4 py-3.5 text-sm placeholder-gray-500 ${error ? 'border-red-400' : 'border-transparent'} ${disabled ? 'bg-gray-50 text-gray-500' : ''}`} />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}