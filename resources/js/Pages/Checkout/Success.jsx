import { Link } from '@inertiajs/react';
import { useEffect } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import { useCart } from '../../Stores/cart';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

export default function CheckoutSuccess({ order = null, transporters = [] }) {
    const clear = useCart((s) => s.clear);

    useEffect(() => {
        clear();
    }, []);

    const isTransporterDelivery = order?.delivery?.method === 'transporter';
    const isPickup = order?.delivery?.method === 'pickup';

    return (
        <MainLayout minimal homeHref="/shop">
            <div className="max-w-xl mx-auto py-10 md:py-14">
                <div className="bg-white rounded-2xl border border-brand-border p-6 md:p-8 shadow-sm">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <h1 className="mt-5 text-2xl md:text-3xl font-extrabold text-brand-dark">
                            Payment Confirmed
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Thank you{order?.customer?.name ? `, ${order.customer.name}` : ''}. Your order has been received and confirmed.
                        </p>
                    </div>

                    {order && (
                        <div className="mt-8 border-t border-brand-border pt-6 space-y-5 text-sm">
                            {/* Payment Metadata */}
                            <div className="grid grid-cols-2 gap-3 bg-brand-light rounded-xl p-4 border border-brand-border">
                                <div>
                                    <p className="text-xs text-gray-400">Order Number</p>
                                    <p className="font-bold text-brand-dark">{order.order_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">Payment Method</p>
                                    <p className="font-bold text-brand-dark uppercase">{order.payment_method}</p>
                                </div>
                                {order.mpesa_receipt && (
                                    <div>
                                        <p className="text-xs text-gray-400">M-Pesa Receipt</p>
                                        <p className="font-bold text-green-700">{order.mpesa_receipt}</p>
                                    </div>
                                )}
                                <div className={order.mpesa_receipt ? 'text-right' : 'col-span-2'}>
                                    <p className="text-xs text-gray-400">Delivery Method</p>
                                    <p className="font-medium text-brand-dark">
                                        {isPickup
                                            ? 'Store Pickup (Free)'
                                            : isTransporterDelivery
                                                ? 'Independent Transporter (Pay on Site)'
                                                : (order.delivery?.formatted || 'Standard Delivery')}
                                    </p>
                                </div>
                            </div>

                            {/* Destination banner for transporter/standard delivery */}
                            {order.delivery?.formatted && (
                                <div className="rounded-xl bg-gray-50 border border-brand-border p-3.5 text-xs text-gray-600">
                                    <p className="font-bold text-brand-dark mb-0.5">Destination Site Address</p>
                                    <p>{order.delivery.formatted}</p>
                                    {order.delivery?.notes && (
                                        <p className="mt-1 text-gray-500">
                                            <strong>Site notes:</strong> {order.delivery.notes}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Items */}
                            <div>
                                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Order Summary</p>
                                <div className="space-y-2">
                                    {(order.items || []).map((item, idx) => (
                                        <div key={idx} className="flex justify-between gap-3">
                                            <span className="text-gray-700">
                                                {item.qty} × {item.productName}
                                                {item.unitLabel ? <span className="text-gray-400"> ({item.unitLabel})</span> : null}
                                            </span>
                                            <span className="font-semibold text-brand-dark whitespace-nowrap">
                                                {formatKES(item.lineTotal)}
                                            </span>
                                        </div>
                                    ))}
                                    {Number(order.delivery?.fee || 0) > 0 && (
                                        <div className="flex justify-between text-gray-500 pt-1">
                                            <span>Delivery Fee ({order.delivery?.distance_km || 0} km)</span>
                                            <span>{formatKES(order.delivery.fee)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Total Paid on Shop */}
                            <div className="border-t border-brand-border pt-4 flex justify-between items-center text-base">
                                <span className="font-bold text-brand-dark">Total Paid (Materials)</span>
                                <span className="text-xl font-extrabold text-brand-primary">
                                    {formatKES(order.total_amount)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Transporters Call Directory Section */}
                    {(isTransporterDelivery || isPickup) && transporters.length > 0 && (
                        <div className="mt-8 border-t border-brand-border pt-6">
                            <div className="mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                                    <h2 className="font-extrabold text-sm text-brand-dark">
                                        Need Hauling? Call a Verified Transporter
                                    </h2>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Call any available driver below to arrange pickup and offloading. <strong>Payment for transport is made directly to the driver after delivery at your site.</strong>
                                </p>
                            </div>

                            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                                {transporters.map((t) => (
                                    <div
                                        key={t.id}
                                        className="p-3.5 rounded-xl border border-brand-border bg-brand-light flex items-center justify-between gap-3 text-xs"
                                    >
                                        <div>
                                            <p className="font-bold text-brand-dark">{t.name}</p>
                                            <p className="text-gray-500">{t.vehicle_type}</p>
                                            {t.area && <p className="text-[11px] text-gray-400">Base: {t.area}</p>}
                                        </div>
                                        <a
                                            href={`tel:${t.phone}`}
                                            className="bg-emerald-600 text-white px-3.5 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 transition flex items-center gap-1.5 flex-shrink-0"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H3.75A2.25 2.25 0 001.5 4.5v2.25z" />
                                            </svg>
                                            <span>Call Driver</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        {order && (
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="bg-white border border-brand-border text-brand-dark px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition cursor-pointer"
                            >
                                Print Receipt
                            </button>
                        )}
                        <Link
                            href="/shop"
                            className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-secondary transition"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}