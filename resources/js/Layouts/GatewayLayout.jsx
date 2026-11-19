import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function GatewayLayout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { url } = usePage();

    const isActive = (path) => {
        if (path === '/') return url === '/';
        return url.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-white text-brand-dark font-sans flex flex-col overflow-x-hidden">
            {/* Sticky Top Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
                        <img src="/images/logo.png" alt="Evopay" className="h-8 sm:h-10 w-auto" />
                        <div className="leading-tight">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-primary block">
                                Payment Gateway
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
                        <Link
                            href="/"
                            className={`transition ${isActive('/') ? 'text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/developers"
                            className={`transition ${isActive('/developers') ? 'text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}
                        >
                            Developers
                        </Link>
                        <Link
                            href="/pricing"
                            className={`transition ${isActive('/pricing') ? 'text-brand-primary' : 'text-gray-600 hover:text-brand-primary'}`}
                        >
                            Pricing
                        </Link>
                    </nav>

                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href="mailto:support@evopay.africa?subject=Evopay%20Merchant%20Onboarding"
                            className="text-sm font-semibold text-gray-600 px-4 py-2.5 rounded-xl hover:text-brand-dark hover:bg-brand-light transition"
                        >
                            Request Access
                        </a>
                        <Link
                            href="/login"
                            className="bg-brand-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-black transition"
                        >
                            Sign In →
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        className="md:hidden p-2 rounded-lg border border-brand-border text-brand-dark hover:bg-brand-light cursor-pointer"
                        aria-label="Toggle navigation"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-brand-border bg-white px-4 py-4 space-y-1 text-sm font-semibold">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-gray-700">Home</Link>
                        <Link href="/developers" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-gray-700">Developers</Link>
                        <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-gray-700">Pricing</Link>
                        <div className="pt-3 mt-2 border-t border-brand-border flex flex-col gap-2.5">
                            <a
                                href="mailto:support@evopay.africa?subject=Evopay%20Merchant%20Onboarding"
                                className="w-full text-center border border-brand-border text-brand-dark py-3 rounded-xl font-bold"
                            >
                                Request Access
                            </a>
                            <Link href="/login" className="w-full text-center bg-brand-dark text-white py-3 rounded-xl font-bold">
                                Sign In →
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1">{children}</main>

            {/* Detailed Multi-Column Footer */}
            <footer className="bg-brand-dark text-gray-300 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
                    <div className="col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-2.5">
                            <img src="/images/logo.png" alt="Evopay" className="h-9 w-auto bg-white rounded-lg p-1" />
                        </div>
                        <p className="mt-4 text-xs text-gray-400 leading-relaxed max-w-xs">
                            Unified M-Pesa and Card payment gateway infrastructure built for Kenyan and East African commerce.
                        </p>
                        <p className="mt-4 text-xs text-gray-500">Nairobi, Kenya</p>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Products</h3>
                        <ul className="space-y-2.5 text-xs text-gray-400">
                            <li><Link href="/" className="hover:text-white transition">Hosted Checkout</Link></li>
                            <li><Link href="/developers" className="hover:text-white transition">M-Pesa STK Push API</Link></li>
                            <li><Link href="/developers" className="hover:text-white transition">Mastercard & Visa</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                            <li><Link href="/shop" className="hover:text-white transition">Live Demo Store</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Developers</h3>
                        <ul className="space-y-2.5 text-xs text-gray-400">
                            <li><Link href="/developers" className="hover:text-white transition">Create Session API</Link></li>
                            <li><Link href="/developers" className="hover:text-white transition">Verify Payment Status</Link></li>
                            <li><Link href="/developers" className="hover:text-white transition">Webhook Signatures</Link></li>
                            <li><Link href="/merchant/developers" className="hover:text-white transition">API Keys Console</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform & Support</h3>
                        <ul className="space-y-2.5 text-xs text-gray-400">
                            <li><Link href="/login" className="hover:text-white transition">Merchant Portal Login</Link></li>
                            <li><Link href="/admin" className="hover:text-white transition">Platform Admin</Link></li>
                            <li><a href="mailto:support@evopay.africa" className="hover:text-white transition">support@evopay.africa</a></li>
                            <li className="text-gray-500">256-bit SSL · PCI-DSS Hosted</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 text-center sm:text-left">
                        <p>© 2026 Evopay Africa. All rights reserved.</p>
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                            <span>Safaricom Daraja</span>
                            <span>•</span>
                            <span>Mastercard MPGS</span>
                            <span>•</span>
                            <span>checkout.evopay.africa</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}