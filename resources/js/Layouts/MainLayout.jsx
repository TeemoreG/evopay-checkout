import { Link } from '@inertiajs/react';
import { useCart } from '../Stores/cart';

export default function MainLayout({ children, minimal = false, merchantName = "" }) {
    const items = useCart((s) => s.items);
    const count = items.reduce((n, i) => n + i.qty, 0);

    return (
        <div className="min-h-screen bg-brand-light font-sans">
            <header className="bg-white border-b border-brand-border sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-20 grid grid-cols-3 items-center">
                    {/* Left: Shop link */}
                    <div className="flex items-center gap-6 text-sm font-medium text-brand-dark">
                        {!minimal && (
                            <Link href="/" className="hover:text-brand-primary transition">
                                Shop
                            </Link>
                        )}
                    </div>

                    {/* Center: Logo & Dynamic Brand Name */}
                    <div className="flex justify-center">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/images/logo.png"
                                alt={merchantName}
                                className="h-11 w-auto"
                            />
                            <span className="font-extrabold text-xl text-brand-dark tracking-tight">
                                {merchantName}
                            </span>
                        </Link>
                    </div>

                    {/* Right: Cart */}
                    <div className="flex justify-end">
                        <Link
                            href="/checkout"
                            className="relative inline-flex items-center gap-2 text-sm font-semibold text-brand-dark hover:text-brand-primary transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                            {count > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] bg-brand-primary text-white rounded-full">
                                    {count}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>

            <footer className="border-t border-brand-border bg-white mt-16 py-8 text-center text-xs text-gray-500">
                © 2026 Evopay Checkout · Powered by Evopay Africa
            </footer>
        </div>
    );
}