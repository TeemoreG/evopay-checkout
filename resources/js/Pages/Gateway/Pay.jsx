import { useEffect, useState } from 'react';
import axios from 'axios';
import { Head, Link } from '@inertiajs/react';

const formatMoney = (amount, currency = 'KES') =>
    `${currency} ` + Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

export default function GatewayPay({ session, merchant }) {
    const [selected, setSelected] = useState('mpesa');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(session.failure_reason || null);

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
                setError('Card checkout initialization failed.');
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 font-sans">
            <Head title={`Pay ${merchant.name}`} />
            
            {/* Minimal Logo Header */}
            <div className="w-full max-w-lg mb-8 flex justify-center">
                <img src="/images/logo.png" alt="Evopay" className="h-8" />
            </div>

            <div className="w-full max-w-lg bg-white sm:rounded-2xl sm:shadow-sm sm:border border-gray-100 overflow-hidden">
                {/* Order Summary Strip */}
                <div className="p-6 border-b border-gray-50 bg-white">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pay to</p>
                    <p className="text-sm font-bold text-gray-900 mb-4">{merchant.name}</p>
                    <div className="flex justify-between items-end">
                        <span className="text-gray-500 text-sm">Total</span>
                        <span className="text-3xl font-extrabold text-gray-900">{formatMoney(session.amount, session.currency)}</span>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="p-6 space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Payment Method</p>
                    
                    {/* M-Pesa Option */}
                    <button 
                        onClick={() => setSelected('mpesa')}
                        className={`w-full flex items-center p-4 border rounded-xl transition-all ${selected === 'mpesa' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">M-P</div>
                        <div className="flex-1 text-left">
                            <p className="font-bold text-gray-900">M-Pesa</p>
                            <p className="text-xs text-gray-500">Pay via STK Push</p>
                        </div>
                        {selected === 'mpesa' && <div className="w-3 h-3 bg-orange-500 rounded-full" />}
                    </button>

                    {/* Card Option */}
                    <button 
                        onClick={() => setSelected('card')}
                        className={`w-full flex items-center p-4 border rounded-xl transition-all ${selected === 'card' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">CD</div>
                        <div className="flex-1 text-left">
                            <p className="font-bold text-gray-900">Credit / Debit Card</p>
                            <p className="text-xs text-gray-500">Visa or Mastercard</p>
                        </div>
                        {selected === 'card' && <div className="w-3 h-3 bg-orange-500 rounded-full" />}
                    </button>
                </div>

                {/* Action Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={handleContinue}
                        disabled={isLoading}
                        className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : `Pay ${formatMoney(session.amount, session.currency)}`}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-4">Secured by Evopay</p>
                </div>
            </div>
        </div>
    );
}