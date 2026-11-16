import { Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { useCart } from '../../Stores/cart';
import { useEffect } from 'react';

export default function CheckoutSuccess() {
    const clear = useCart((s) => s.clear);
    useEffect(() => { clear(); }, []);

    return (
        <MainLayout minimal>
            <div className="max-w-lg mx-auto text-center py-16">
                <div className="w-20 h-20 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl">
                    ✓
                </div>
                <h1 className="mt-6 text-3xl font-extrabold text-brand-dark">Order confirmed</h1>
                <p className="mt-2 text-gray-500">
                    We'll send an SMS + email receipt shortly. Delivery: 1–2 business days in Nairobi.
                </p>
                <Link
                    href="/"
                    className="mt-8 inline-block bg-brand-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-secondary transition"
                >
                    Continue Shopping
                </Link>
            </div>
        </MainLayout>
    );
}