import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { useCart } from '../../Stores/cart';

const formatKES = (v) =>
    'KSh ' + Number(v).toLocaleString('en-KE', { minimumFractionDigits: 0 });

function resolvePrice(unit, qty) {
    if (!unit.price_breaks || unit.price_breaks.length === 0) return 0;
    if (unit.requires_quote) return null;
    
    const sorted = [...unit.price_breaks].sort((a, b) => b.min_qty - a.min_qty);
    const match = sorted.find(
        (b) => qty >= b.min_qty && (b.max_qty === null || qty <= b.max_qty)
    );
    return match ? parseFloat(match.unit_price) : null;
}

export default function ProductShow({ product, units }) {
    const { url } = usePage();
    const query = new URLSearchParams(url.split('?')[1] || '');

    const initialVariant = query.get('variant');
    const initialQty = parseInt(query.get('qty') || '0', 10);

    const initialUnit =
        units.find((u) => u.unit_type === initialVariant) || units[0];

    const [selectedUnit, setSelectedUnit] = useState(initialUnit);
    const [qty, setQty] = useState(
        initialQty && initialQty >= initialUnit.min_qty ? initialQty : initialUnit.min_qty
    );
    const [added, setAdded] = useState(false);
    const addItem = useCart((s) => s.addItem);

    const unitPrice = resolvePrice(selectedUnit, qty);
    const total = unitPrice ? unitPrice * qty : null;

    const stepQty = (delta) => {
        const step = selectedUnit.step_qty || 1;
        const min = selectedUnit.min_qty || 1;
        const next = qty + delta * step;
        if (next >= min) setQty(next);
    };

    const pickUnit = (u) => {
        setSelectedUnit(u);
        setQty(u.min_qty);
    };

    const handleAdd = () => {
        if (!unitPrice) return;
        addItem({
            productId: product.id,
            productName: product.name,
            image_url: product.image_url,
            weight: parseFloat(product.weight) || 0,
            unitId: selectedUnit.id,
            unitLabel: selectedUnit.label,
            qty,
            unitPrice,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <MainLayout>
            <Link href="/" className="text-sm text-gray-500 hover:text-brand-primary">
                ← Back to Shop
            </Link>

            <div className="mt-6 grid lg:grid-cols-2 gap-10">
                <div>
                    <div className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden relative">
                        {product.image_url ? (
                            <img 
                                src={product.image_url} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-400 font-bold text-3xl">{product.name}</span>
                        )}
                    </div>
                </div>

                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark">{product.name}</h1>
                    <p className="mt-2 text-gray-600">{product.short_description}</p>

                    <div className="mt-6">
                        <p className="text-sm font-semibold text-brand-dark mb-2">Choose option</p>
                        <div className="grid sm:grid-cols-2 gap-2">
                            {units.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => pickUnit(u)}
                                    className={`text-left px-4 py-3 rounded-lg border transition ${
                                        selectedUnit.id === u.id
                                            ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20'
                                            : 'border-brand-border bg-white hover:border-brand-primary'
                                    }`}
                                >
                                    <p className="font-semibold text-sm text-brand-dark">{u.label}</p>
                                    <p className="text-xs text-gray-500">
                                        {u.requires_quote || !u.price_breaks?.length
                                            ? 'Get a custom quote'
                                            : `from ${formatKES(
                                                  Math.min(
                                                      ...u.price_breaks.map((b) => parseFloat(b.unit_price))
                                                  )
                                              )}`}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {!selectedUnit.requires_quote && (
                        <div className="mt-6">
                            <p className="text-sm font-semibold text-brand-dark mb-2">Quantity</p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => stepQty(-1)}
                                    className="w-10 h-10 rounded-lg border border-brand-border bg-white font-bold hover:border-brand-primary text-brand-dark"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    value={qty}
                                    min={selectedUnit.min_qty}
                                    step={selectedUnit.step_qty}
                                    onChange={(e) =>
                                        setQty(Math.max(selectedUnit.min_qty, +e.target.value))
                                    }
                                    className="w-24 text-center rounded-lg border border-brand-border py-2 font-semibold text-brand-dark"
                                />
                                <button
                                    onClick={() => stepQty(1)}
                                    className="w-10 h-10 rounded-lg border border-brand-border bg-white font-bold hover:border-brand-primary text-brand-dark"
                                >
                                    +
                                </button>
                                <span className="text-xs text-gray-500">
                                    step {selectedUnit.step_qty}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 p-5 bg-white rounded-2xl border border-brand-border">
                        {selectedUnit.requires_quote ? (
                            <>
                                <p className="text-sm text-gray-500">
                                    This item requires a custom quote.
                                </p>
                                <button className="mt-3 w-full bg-brand-dark text-white py-3 rounded-lg font-semibold hover:bg-black transition">
                                    Request Quote
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Unit price</span>
                                    <span className="font-semibold text-brand-dark">{formatKES(unitPrice)}</span>
                                </div>
                                <div className="flex justify-between mt-2 text-lg font-extrabold">
                                    <span className="text-brand-dark">Total</span>
                                    <span className="text-brand-primary">{formatKES(total)}</span>
                                </div>
                                <button
                                    onClick={handleAdd}
                                    disabled={!unitPrice}
                                    className="mt-4 w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-brand-secondary disabled:opacity-50 transition"
                                >
                                    {added ? '✓ Added to Cart' : 'Add to Cart'}
                                </button>
                                <Link
                                    href="/checkout"
                                    className="block mt-2 text-center text-sm text-gray-500 hover:text-brand-primary"
                                >
                                    Continue to Checkout →
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}