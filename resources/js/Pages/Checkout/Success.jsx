import { Link } from '@inertiajs/react';
import { useEffect } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import { useCart } from '../../Stores/cart';

const formatKES = (v) =>
    'KSh ' + Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

export default function CheckoutSuccess({ order = null }) {
    const clear = useCart((s) => s.clear);

    useEffect(() => {
        clear();
    }, []);

    const isTransporterDelivery = order?.delivery?.method === 'transporter';
    const isPickup = order?.delivery?.method === 'pickup';
    const hasAssignedDriver = Boolean(
        isTransporterDelivery && (order?.delivery?.transporter_name || order?.delivery?.transporter_phone)
    );

    return (
        <MainLayout minimal homeHref="/shop">
            <div className="max-w-xl mx-auto py-10 md:py-14">
                <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-xs">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
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
                            <div className="grid grid-cols-2 gap-3 bg-brand-light rounded-2xl p-4 border border-brand-border">
                                <div>
                                    <p className="text-xs text-gray-400">Order Number</p>
                                    <p className="font-bold font-mono text-brand-dark">{order.order_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">Payment Method</p>
                                    <p className="font-bold text-brand-dark uppercase">{order.payment_method}</p>
                                </div>
                                {order.mpesa_receipt && (
                                    <div>
                                        <p className="text-xs text-gray-400">M-Pesa Receipt</p>
                                        <p className="font-bold font-mono text-emerald-700">{order.mpesa_receipt}</p>
                                    </div>
                                )}
                                <div className={order.mpesa_receipt ? 'text-right' : 'col-span-2'}>
                                    <p className="text-xs text-gray-400">Fulfillment</p>
                                    <p className="font-semibold text-brand-dark">
                                        {isPickup
                                            ? 'Store Pickup (Free)'
                                            : isTransporterDelivery
                                                ? 'Independent Transporter (Pay on Site)'
                                                : (order.delivery?.formatted || 'Standard Delivery')}
                                    </p>
                                </div>
                            </div>

                            {/* Assigned Transporter Contact Card (Unlocked after payment) */}
                            {hasAssignedDriver && (
                                <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 p-4 sm:p-5 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                <span>Assigned Driver Unlocked</span>
                                            </span>
                                            <h2 className="text-base font-extrabold text-brand-dark mt-1.5">
                                                {order.delivery.transporter_name}
                                            </h2>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                {order.delivery.transporter_vehicle || 'Verified Fleet'}
                                                {order.delivery.transporter_plate ? ` · ${order.delivery.transporter_plate}` : ''}
                                            </p>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[10px] font-bold uppercase text-gray-400">Est. Haul Fee</p>
                                            <p className="text-base font-extrabold text-brand-primary">
                                                {formatKES(order.delivery?.estimated_transport_fee || 0)}
                                            </p>
                                        </div>
                                    </div>

                                    {order.delivery?.transporter_phone && (
                                        <a
                                            href={`tel:${order.delivery.transporter_phone}`}
                                            className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-xs"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H3.75A2.25 2.25 0 001.5 4.5v2.25z" />
                                            </svg>
                                            <span>Call Driver · {order.delivery.transporter_phone}</span>
                                        </a>
                                    )}

                                    <p className="text-[11px] text-gray-600 leading-relaxed">
                                        Call your driver to coordinate loading and site arrival. Transport payment is settled directly with the driver once your materials arrive safely.
                                    </p>
                                </div>
                            )}

                            {/* Destination Site Address */}
                            {order.delivery?.formatted && (
                                <div className="rounded-2xl bg-brand-light border border-brand-border p-4 text-xs text-gray-600 space-y-1">
                                    <p className="font-bold text-brand-dark uppercase tracking-wider text-[10px]">
                                        Destination Site Address
                                    </p>
                                    <p className="text-sm font-medium text-brand-dark">{order.delivery.formatted}</p>
                                    {order.delivery?.distance_km > 0 && (
                                        <p className="text-gray-500">
                                            Distance: <strong>{order.delivery.distance_km} km</strong>
                                            {order.delivery?.total_weight_kg > 0 ? ` · Weight: ${order.delivery.total_weight_kg} kg` : ''}
                                        </p>
                                    )}
                                    {order.delivery?.landmark && (
                                        <p className="text-gray-500">Landmark: {order.delivery.landmark}</p>
                                    )}
                                    {order.delivery?.notes && (
                                        <p className="text-gray-500">Notes: {order.delivery.notes}</p>
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

                            {/* Total */}
                            <div className="border-t border-brand-border pt-4 flex justify-between items-center text-base">
                                <span className="font-bold text-brand-dark">Total Paid (Materials)</span>
                                <span className="text-xl font-extrabold text-brand-primary">
                                    {formatKES(order.total_amount)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        {order && (
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="bg-white border border-brand-border text-brand-dark px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition cursor-pointer inline-flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                                </svg>
                                <span>Print Receipt</span>
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