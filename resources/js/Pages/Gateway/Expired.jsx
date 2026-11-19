import MainLayout from '../../Layouts/MainLayout';

export default function GatewayExpired({ session, merchant }) {
    return (
        <MainLayout minimal>
            <div className="min-h-[82vh] flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6">
                <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs text-center">
                    {/* Merchant Branding Header */}
                    <div className="flex items-center justify-center gap-2 pb-4 border-b border-brand-border">
                        {merchant.logo_url ? (
                            <img src={merchant.logo_url} alt={merchant.name} className="h-6 max-w-[120px] object-contain" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-[10px] flex items-center justify-center">
                                {merchant.name.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                        <span className="text-xs font-bold text-brand-dark">{merchant.name}</span>
                    </div>

                    <div className="py-6">
                        <div className="w-14 h-14 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            !
                        </div>
                        <h1 className="mt-4 text-xl font-extrabold text-brand-dark">
                            Checkout Session Expired
                        </h1>
                        <p className="mt-2 text-xs sm:text-sm text-gray-500">
                            The payment link for reference <strong className="text-brand-dark">{session.merchant_reference}</strong> is no longer active. Please return to the merchant and start a new payment.
                        </p>
                    </div>

                    {session.cancel_url && (
                        <a
                            href={session.cancel_url}
                            className="inline-block w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition"
                        >
                            Return to {merchant.name}
                        </a>
                    )}

                    <div className="mt-5 pt-4 border-t border-brand-border text-[11px] text-gray-400">
                        Powered by Evopay Checkout
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}