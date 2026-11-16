<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index()
    {
        $categories = Product::where('is_active', true)
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();

        $products = Product::where('is_active', true)
            ->with(['units' => function($q) {
                $q->where('is_active', true)->with(['priceBreaks' => function($pb) {
                    $pb->where('is_active', true)->orderBy('min_qty', 'asc');
                }]);
            }])
            ->get()
            ->map(function ($p) {
                $basePrice = null;
                if ($p->units->isNotEmpty()) {
                    $firstUnit = $p->units->first();
                    if ($firstUnit->priceBreaks->isNotEmpty()) {
                        $basePrice = (float) $firstUnit->priceBreaks->first()->unit_price;
                    }
                }

                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'sku' => $p->sku,
                    'short_description' => $p->short_description,
                    'image_url' => $p->image_url,
                    'category' => $p->category,
                    'weight' => (float) ($p->weight ?? 0),
                    'from_price' => $basePrice,
                ];
            });

        return Inertia::render('Catalog/Index', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function show($slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();
        
        $product->load([
            'units' => function($q) {
                $q->where('is_active', true)->with(['priceBreaks' => function($pb) {
                    $pb->where('is_active', true)->orderBy('min_qty', 'asc');
                }]);
            },
        ]);

        return Inertia::render('Product/Show', [
            'product' => $product, // This already passes weight because it's the full model
            'units' => $product->units,
        ]);
    }
}