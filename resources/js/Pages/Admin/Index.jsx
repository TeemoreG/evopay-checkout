import { useState } from 'react';
import { useForm, Head, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

const formatKES = (v) =>
    'KSh ' + Number(v).toLocaleString('en-KE', { minimumFractionDigits: 0 });

export default function AdminIndex({ products }) {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const triggerSuccess = (msg) => {
        setSuccessMessage(msg);
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
    };

    const productForm = useForm({
        id: null,
        name: '',
        category: 'Hardware',
        weight: '', // <-- ADDED
        short_description: '',
        image_url: '', 
        units: [],
    });

    const isEditing = !!productForm.data.id;

    const resetForm = () => {
        productForm.setData({
            id: null, name: '', category: 'Hardware', weight: '', short_description: '', image_url: '', units: []
        });
        productForm.clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            productForm.put(`/admin/products/${productForm.data.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    triggerSuccess('Product updated successfully!');
                    resetForm();
                },
            });
        } else {
            productForm.post('/admin/products', {
                preserveScroll: true,
                onSuccess: () => {
                    triggerSuccess('Product created successfully!');
                    resetForm();
                },
            });
        }
    };

    const editProduct = (product) => {
        const mappedUnits = product.units.map(u => ({
            id: u.id,
            unit_type: u.unit_type,
            label: u.label,
            price: u.price_breaks?.[0]?.unit_price || '',
        }));

        productForm.setData({
            id: product.id,
            name: product.name,
            category: product.category,
            weight: product.weight || '', // <-- ADDED
            short_description: product.short_description || '',
            image_url: product.image_url || '',
            units: mappedUnits,
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteProduct = (id) => {
        if (confirm('Are you sure you want to delete this product? All variants will be lost.')) {
            router.delete(`/admin/products/${id}`, { 
                preserveScroll: true,
                onSuccess: () => triggerSuccess('Product deleted successfully!')
            });
        }
    };

    const addVariantField = () => {
        productForm.setData('units', [
            ...productForm.data.units,
            { id: null, unit_type: 'piece', label: '1 Unit', price: '' }
        ]);
    };

    const updateVariantField = (index, field, value) => {
        const newUnits = [...productForm.data.units];
        newUnits[index][field] = value;
        productForm.setData('units', newUnits);
    };

    const removeVariantField = (index) => {
        const newUnits = [...productForm.data.units];
        newUnits.splice(index, 1);
        productForm.setData('units', newUnits);
    };

    return (
        <MainLayout minimal>
            <Head title="Admin Dashboard" />
            
            {/* SUCCESS MODAL */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl transform transition-transform scale-100 max-w-sm w-full mx-4 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-brand-dark mb-2">Success!</h3>
                        <p className="text-gray-500 text-sm">{successMessage}</p>
                        <button 
                            onClick={() => setShowSuccessModal(false)} 
                            className="mt-6 px-6 py-2 bg-brand-dark text-white rounded-lg font-bold text-sm hover:bg-black transition w-full"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your store inventory and pricing.</p>
                </div>
                <a href="/" className="bg-brand-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-secondary transition">
                    View Store &rarr;
                </a>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* LEFT: FORM */}
                <div>
                    <form onSubmit={submit} className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm sticky top-24">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">{isEditing ? 'Update Product' : 'Create Product'}</h2>
                            {isEditing && (
                                <button type="button" onClick={resetForm} className="text-xs text-red-500 hover:underline">Cancel Edit</button>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Product Name</label>
                                <input
                                    type="text"
                                    value={productForm.data.name}
                                    onChange={(e) => productForm.setData('name', e.target.value)}
                                    className="w-full bg-brand-input rounded-lg px-4 py-2.5 text-sm"
                                    placeholder="e.g. Samsung 55 inch TV"
                                    required
                                />
                            </div>

                            {/* UPDATED TO 3 COLUMNS */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        value={productForm.data.category}
                                        onChange={(e) => productForm.setData('category', e.target.value)}
                                        className="w-full bg-brand-input rounded-lg px-4 py-2.5 text-sm"
                                    >
                                        <option value="Hardware">Hardware</option>
                                        <option value="Electronics">Electronics</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Weight (KG)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={productForm.data.weight}
                                        onChange={(e) => productForm.setData('weight', e.target.value)}
                                        className="w-full bg-brand-input rounded-lg px-4 py-2.5 text-sm"
                                        placeholder="e.g. 50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL</label>
                                    <input
                                        type="text"
                                        value={productForm.data.image_url}
                                        onChange={(e) => productForm.setData('image_url', e.target.value)}
                                        className="w-full bg-brand-input rounded-lg px-4 py-2.5 text-sm"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            
                            {/* Image Preview (Full width below the inputs) */}
                            {productForm.data.image_url && (
                                <div>
                                    <img src={productForm.data.image_url} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-brand-border" />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Short Description</label>
                                <textarea
                                    value={productForm.data.short_description}
                                    onChange={(e) => productForm.setData('short_description', e.target.value)}
                                    className="w-full bg-brand-input rounded-lg px-4 py-2.5 text-sm"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="border-t border-brand-border pt-4 mt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-brand-dark">Variants & Pricing</h3>
                                    <button 
                                        type="button" 
                                        onClick={addVariantField}
                                        className="text-xs bg-brand-primary/10 text-brand-primary font-bold px-3 py-1 rounded hover:bg-brand-primary/20 transition"
                                    >
                                        + Add Variant
                                    </button>
                                </div>

                                {productForm.data.units.length === 0 && (
                                    <p className="text-xs text-gray-500 italic">No variants added yet. Click "+ Add Variant".</p>
                                )}

                                <div className="space-y-3">
                                    {productForm.data.units.map((unit, index) => (
                                        <div key={index} className="flex items-end gap-2 bg-brand-light p-3 rounded-lg border border-brand-border">
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Type</label>
                                                <input
                                                    type="text"
                                                    value={unit.unit_type}
                                                    onChange={(e) => updateVariantField(index, 'unit_type', e.target.value)}
                                                    className="w-full bg-white rounded border border-brand-border px-2 py-1.5 text-sm"
                                                    placeholder="e.g. piece"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Label</label>
                                                <input
                                                    type="text"
                                                    value={unit.label}
                                                    onChange={(e) => updateVariantField(index, 'label', e.target.value)}
                                                    className="w-full bg-white rounded border border-brand-border px-2 py-1.5 text-sm"
                                                    placeholder="e.g. 1 Unit"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Price (KES)</label>
                                                <input
                                                    type="number"
                                                    value={unit.price}
                                                    onChange={(e) => updateVariantField(index, 'price', e.target.value)}
                                                    className="w-full bg-white rounded border border-brand-border px-2 py-1.5 text-sm font-mono"
                                                    placeholder="1500"
                                                />
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => removeVariantField(index)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                                title="Remove Variant"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={productForm.processing}
                                className="w-full mt-6 bg-brand-dark text-white py-3 rounded-lg font-bold hover:bg-black transition disabled:opacity-50"
                            >
                                {isEditing ? 'Save Changes' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* RIGHT: LIVE INVENTORY LIST */}
                <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm max-h-[800px] overflow-y-auto">
                    <h2 className="text-lg font-bold mb-4">Inventory</h2>
                    <div className="space-y-4">
                        {products.map((p) => (
                            <div key={p.id} className="flex gap-4 p-4 border border-brand-border rounded-xl relative group">
                                
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => editProduct(p)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Edit Product">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                    </button>
                                    <button onClick={() => deleteProduct(p.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Delete Product">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>

                                <img src={p.image_url || 'https://via.placeholder.com/100'} alt={p.name} className="w-16 h-16 rounded-lg object-cover bg-gray-50 flex-shrink-0" />
                                <div className="flex-1 pr-16">
                                    <h3 className="font-bold text-sm text-brand-dark">{p.name}</h3>
                                    {/* ADDED WEIGHT DISPLAY */}
                                    <p className="text-xs text-gray-500">{p.category} &middot; {p.sku} &middot; {p.weight || 0} KG</p>
                                    
                                    <div className="mt-3 space-y-1.5">
                                        {p.units.length === 0 ? (
                                            <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded">No variants added yet.</p>
                                        ) : (
                                            p.units.map(u => {
                                                const price = u.price_breaks?.[0]?.unit_price;
                                                return (
                                                    <div key={u.id} className="flex justify-between items-center text-xs bg-brand-light px-3 py-2 rounded-md border border-brand-border">
                                                        <span className="font-medium text-brand-dark">{u.label} <span className="text-gray-400 font-normal">({u.unit_type})</span></span>
                                                        <span className="font-bold text-brand-primary">{formatKES(price)}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}