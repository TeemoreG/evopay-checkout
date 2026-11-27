import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function AdminLayout({ children, title = 'Platform Admin' }) {
    const { url } = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isRouteActive = (pattern) => {
        if (pattern === '/admin') return url === '/admin' || url === '/admin/merchants';
        return url.startsWith(pattern);
    };

    const navItems = [
        {
            group: 'Payment Gateway',
            items: [
                {
                    name: 'Merchants Directory',
                    href: '/admin',
                    activePattern: '/admin',
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.614A2.993 2.993 0 009 9.35c.832 0 1.612-.34 2.18-.914A3.002 3.002 0 0015 9.35c.832 0 1.612-.34 2.18-.914a3.002 3.002 0 003.57.614M3.75 9.35l7.5-6.5a1.125 1.125 0 011.5 0l7.5 6.5" />
                        </svg>
                    ),
                },
                {
                    name: 'Global Transactions',
                    href: '/admin/transactions',
                    activePattern: '/admin/transactions',
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                    ),
                },
            ],
        },
        {
            group: 'Demo Store & Fleet',
            items: [
                {
                    name: 'Inventory & Products',
                    href: '/admin/demo-shop',
                    activePattern: '/admin/demo-shop',
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    ),
                },
                {
                    name: 'Shop Orders',
                    href: '/admin/orders',
                    activePattern: '/admin/orders',
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                    ),
                },
                {
                    name: 'Transporters & Fleet',
                    href: '/admin/transporters',
                    activePattern: '/admin/transporters',
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.5a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 4.5v9.75m12 0H2.25m12 0v5.25" />
                        </svg>
                    ),
                },
                {
                    name: 'HQ Coordinates & Rates',
                    href: '/admin/settings',
                    activePattern: '/admin/settings',
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    ),
                },
            ],
        },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full justify-between bg-white">
            <div>
                {/* Brand / Logo (Edge-to-edge flush header) */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200">
                    <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-white font-black text-sm shadow-xs">
                        E
                    </div>
                    <div>
                        <span className="font-extrabold text-sm text-brand-dark tracking-tight block">Evopay Platform</span>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Master Admin</p>
                    </div>
                </div>

                {/* Nav Links */}
                <div className="p-4 space-y-6">
                    {navItems.map((group) => (
                        <div key={group.group}>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
                                {group.group}
                            </p>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isRouteActive(item.activePattern);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                                                active
                                                    ? 'bg-brand-primary text-white shadow-xs'
                                                    : 'text-gray-600 hover:text-brand-dark hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className={active ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* User & Logout Strip (Bottom docked) */}
            <div className="p-4 border-t border-gray-200 space-y-2">
                <Link
                    href="/shop"
                    target="_blank"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-brand-primary hover:bg-gray-50 transition"
                >
                    <span>View Demo Storefront</span>
                    <span className="text-[11px] text-gray-400">↗</span>
                </Link>

                <button
                    type="button"
                    onClick={() => router.post('/logout')}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Head title={title} />

            {/* Desktop True Full-Height Left Sidebar (Flush top-to-bottom, no card border) */}
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Top Header (Hidden on Desktop) */}
            <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-30">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center text-white font-black text-xs">
                        E
                    </div>
                    <span className="font-extrabold text-sm text-brand-dark">Evopay Admin</span>
                </div>
                <button
                    type="button"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-gray-600 hover:text-brand-dark cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" onClick={() => setMobileOpen(false)}>
                    <div className="w-64 bg-white h-full" onClick={(e) => e.stopPropagation()}>
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content Pane */}
            <main className="flex-1 lg:pl-64 pt-14 lg:pt-0 min-w-0">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}