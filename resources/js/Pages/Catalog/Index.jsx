import { Link } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import { useCart } from '../../Stores/cart';

const formatKES = (v) =>
    'KSh ' + Number(v).toLocaleString('en-KE', { minimumFractionDigits: 0 });

// Generates a fake rating and a random review count
const getFakeRating = (id) => {
    const ratings = [3.8, 4.2, 4.5, 4.8, 5.0, 4.1, 4.7];
    const rating = ratings[id % ratings.length];
    
    // Generate a consistent pseudo-random number of reviews based on the ID
    const reviewCount = (id * 37) % 400 + 12; 
    return { rating, reviewCount };
};

export default function CatalogIndex({ products, categories }) {
    const [activeCategory, setActiveCategory] = useState('All');
    const addItem = useCart((s) => s.addItem);

    const allCategories = ['All', ...categories];

    const filteredProducts = activeCategory === 'All' 
        ? products 
        : products.filter(p => p.category === activeCategory);

    const handleQuickAdd = (e, product) => {
        e.preventDefault(); // Stop the Link from navigating
        
        if (!product.from_price) return alert('This product requires a quote.');

        addItem({
            productId: product.id,
            productName: product.name,
            unitId: `${product.id}-default`,
            unitLabel: '1 Unit',
            qty: 1,
            unitPrice: product.from_price,
        });
    };

    return (
        <MainLayout>
            {/* Hero Section */}
            <div className="mb-10 rounded-2xl bg-brand-dark text-white p-8 md:p-12 relative overflow-hidden flex items-center">
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Discover our latest products.
                    </h1>
                    <p className="text-gray-300 text-lg mb-6">
                        Shop securely with instant checkout. Delivered straight to your door.
                    </p>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-brand-primary/20 to-transparent"></div>
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-brand-primary rounded-full blur-3xl opacity-20"></div>
            </div>

            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-brand-dark">
                    {activeCategory === 'All' ? 'All Products' : activeCategory} ({filteredProducts.length})
                </h2>
                <div className="flex gap-2 text-sm overflow-x-auto pb-2 md:pb-0">
                    {allCategories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full whitespace-nowrap transition font-medium ${
                                activeCategory === cat 
                                ? 'bg-brand-dark text-white shadow-md' 
                                : 'bg-white border border-brand-border text-brand-dark hover:border-brand-primary'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredProducts.map((p) => {
                    const { rating, reviewCount } = getFakeRating(p.id);
                    
                    return (
                        <Link
                            key={p.id}
                            href={`/products/${p.slug}`}
                            className="group flex flex-col bg-white rounded-2xl border border-brand-border overflow-hidden hover:shadow-xl hover:border-brand-primary transition duration-300 relative"
                        >
                            {/* Image Area */}
                            <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                {p.image_url ? (
                                    <img 
                                        src={p.image_url} 
                                        alt={p.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                                
                                {/* Category Badge (Top Left) */}
                                {p.category && (
                                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm text-brand-dark uppercase tracking-wider">
                                        {p.category}
                                    </span>
                                )}

                                {/* Quick Add (+) Button (Top Right) */}
                                <button
                                    onClick={(e) => handleQuickAdd(e, p)}
                                    className="absolute top-3 right-3 bg-brand-primary text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:bg-brand-dark hover:scale-110 transition-all duration-200 z-10"
                                    title="Quick Add to Cart"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                </button>
                            </div>

                            {/* Details Area */}
                            <div className="p-4 flex flex-col flex-grow">
                                {/* Rating & Reviews */}
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-[11px] text-gray-500 font-medium">
                                        {rating} <span className="text-gray-400 font-normal">({reviewCount})</span>
                                    </span>
                                </div>

                                <h3 className="font-semibold text-sm text-brand-dark line-clamp-2 mb-1 group-hover:text-brand-primary transition">
                                    {p.name}
                                </h3>
                                <p className="text-[11px] text-gray-400 mb-3">{p.sku}</p>
                                
                                <div className="mt-auto">
                                    <p className="text-lg font-extrabold text-brand-dark">
                                        {p.from_price ? formatKES(p.from_price) : 'Quote'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </MainLayout>
    );
}