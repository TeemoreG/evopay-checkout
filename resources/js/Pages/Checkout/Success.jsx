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

    return (
        <MainLayout minimal>
            <div className="max-w-xl mx-auto py-10 md:py-14">
                <div className="bg-white rounded-2xl border border-brand-border p-6 md:p-8 shadow-sm">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold">
                            ✓
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
                                    <p className="text-xs text-gray-400">Delivery</p>
                                    <p className="font-medium text-brand-dark">
                                        {order.delivery?.method === 'pickup'
                                            ? 'Store Pickup (Free)'
                                            : (order.delivery?.formatted || 'Standard Delivery')}
                                    </p>
                                </div>
                            </div>

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
                                <span className="font-bold text-brand-dark">Total Paid</span>
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
                                className="bg-white border border-brand-border text-brand-dark px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition cursor-pointer"
                            >
                                Print Receipt
                            </button>
                        )}
                        <Link
                            href="/"
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