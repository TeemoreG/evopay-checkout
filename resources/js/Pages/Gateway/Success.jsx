import MainLayout from '../../Layouts/MainLayout';

const formatMoney = (amount, currency = 'KES') =>
    `${currency} ` + Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

export default function GatewaySuccess({ session, merchant }) {
    return (
        <MainLayout minimal>
            <div className="min-h-[82vh] flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6">
                <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs">
                    {/* Merchant Branding Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                        <div className="flex items-center gap-2">
                            {merchant.logo_url ? (
                                <img src={merchant.logo_url} alt={merchant.name} className="h-6 max-w-[120px] object-contain" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-[10px] flex items-center justify-center">
                                    {merchant.name.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span className="text-xs font-bold text-brand-dark truncate max-w-[160px]">
                                {merchant.name}
                            </span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Paid
                        </span>
                    </div>

                    {/* Confirmation Icon & Amount */}
                    <div className="py-6 text-center border-b border-brand-border/60">
                        <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            ✓
                        </div>
                        <h1 className="mt-4 text-xl sm:text-2xl font-extrabold text-brand-dark">
                            Payment Successful
                        </h1>
                        <p className="mt-1 text-xs text-gray-500">
                            {session.customer?.name ? `Thank you, ${session.customer.name}. ` : ''}Your payment has been confirmed.
                        </p>
                        <p className="mt-4 text-3xl font-black text-brand-primary">
                            {formatMoney(session.amount, session.currency)}
                        </p>
                    </div>

                    {/* Transaction Receipt Details */}
                    <div className="py-5 space-y-2.5 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Merchant Reference</span>
                            <span className="font-semibold text-brand-dark">{session.merchant_reference}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Payment Method</span>
                            <span className="font-semibold text-brand-dark uppercase">
                                {session.payment_method || 'Paid'}
                            </span>
                        </div>
                        {session.mpesa_receipt && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">M-Pesa Receipt</span>
                                <span className="font-bold text-emerald-700">{session.mpesa_receipt}</span>
                            </div>
                        )}
                        {session.paid_at && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Paid At</span>
                                <span className="font-medium text-brand-dark">
                                    {new Date(session.paid_at).toLocaleString('en-KE')}
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer"
                    >
                        Print / Save Receipt
                    </button>

                    <div className="mt-5 pt-4 border-t border-brand-border text-center text-[11px] text-gray-400">
                        Powered by Evopay Checkout
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}