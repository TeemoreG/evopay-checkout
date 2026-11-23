import { useEffect, useState } from 'react';
import axios from 'axios';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

const formatMoney = (amount, currency = 'KES') =>
    `${currency} ` + Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const paymentMethods = [
    {
        key: 'mpesa',
        label: 'M-Pesa',
        subtitle: 'STK Push (Instant)',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000028/1_q6VZ_q0WIism6TgZ9kBIWQ_km524l.png',
        disabled: false,
    },
    {
        key: 'card',
        label: 'Card Payment',
        subtitle: 'Visa / Mastercard',
        image: 'https://res.cloudinary.com/dvqjgbdhp/image/upload/v1795000459/visa_mx9x3z.jpg',
        disabled: false,
    },
];

export default function GatewayPay({ session, merchant }) {
    const [selected, setSelected] = useState('mpesa');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(session.failure_reason || null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlError = params.get('error');
        if (urlError) setError(urlError);
    }, []);

    const handleContinue = async () => {
        if (isLoading) return;
        setError(null);
        if (selected === 'mpesa') {
            window.location.href = `/c/${session.token}/mpesa`;
            return;
        }
        if (selected === 'card') {
            setIsLoading(true);
            try {
                const res = await axios.post(`/c/${session.token}/mpgs/init`);
                if (res.data.status === 'redirect') window.location.href = res.data.url;
            } catch (err) {
                setError('Could not initialize card checkout. Please try again.');
                setIsLoading(false);
            }
        }
    };

    return (
        <MainLayout minimal>
            <Head title={`Checkout — ${merchant.name}`} />
            <div className="min-h-[82vh] flex flex-col justify-center py-8 px-4">
                
                {/* Main Checkout Container */}
                <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-brand-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    
                    {/* Header */}
                    <div className="px-6 pt-8 pb-6 border-b border-brand-border/50">
                        <div className="flex items-center justify-between mb-6">
                            {merchant.logo_url ? (
                                <img src={merchant.logo_url} alt={merchant.name} className="h-7 object-contain" />
                            ) : (
                                <div className="text-sm font-bold text-brand-dark">{merchant.name}</div>
                            )}
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Secure
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total to pay</p>
                            <p className="text-4xl font-black text-brand-dark mt-1 tracking-tight">
                                {formatMoney(session.amount, session.currency)}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">Ref: {session.merchant_reference}</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-xs text-red-700 font-medium">
                                {error}
                            </div>
                        )}

                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Payment Method</p>
                        
                        <div className="space-y-3">
                            {paymentMethods.map((pm) => (
                                <button
                                    key={pm.key}
                                    type="button"
                                    onClick={() => setSelected(pm.key)}
                                    className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                                        selected === pm.key 
                                            ? 'border-brand-primary bg-brand-primary/5 shadow-inner' 
                                            : 'border-brand-border bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className="w-12 h-8 flex items-center justify-center mr-4">
                                        <img src={pm.image} className="max-h-full object-contain" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-bold text-brand-dark">{pm.label}</p>
                                        <p className="text-[11px] text-gray-500">{pm.subtitle}</p>
                                    </div>
                                    {selected === pm.key && <div className="w-2 h-2 rounded-full bg-brand-primary"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-gray-50 border-t border-brand-border">
                        <button
                            onClick={handleContinue}
                            disabled={isLoading}
                            className="w-full bg-brand-dark text-white py-4 rounded-2xl font-bold text-sm hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Proceed to secure payment'}
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}