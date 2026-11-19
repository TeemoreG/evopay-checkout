import { Head, useForm } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <MainLayout minimal>
            <Head title="Sign In — Evopay" />

            <div className="min-h-[80vh] flex flex-col justify-center py-8 px-4">
                <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs">
                    <div className="text-center mb-6">
                        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
                            Evopay Portal
                        </span>
                        <h1 className="text-2xl font-extrabold text-brand-dark mt-3">Sign In</h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Access your Evopay Merchant or Admin dashboard
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-dark mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@business.co.ke"
                                required
                                autoFocus
                                className={`w-full rounded-xl bg-brand-input border px-4 py-3 text-sm ${
                                    errors.email ? 'border-red-500 bg-red-50/40' : 'border-transparent'
                                }`}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-dark mb-1.5">Password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                required
                                className={`w-full rounded-xl bg-brand-input border px-4 py-3 text-sm ${
                                    errors.password ? 'border-red-500 bg-red-50/40' : 'border-transparent'
                                }`}
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>}
                        </div>

                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <span>Keep me signed in</span>
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}