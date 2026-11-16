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

        // Force a fresh query with no caching
        $products = Product::where('is_active', true)
            ->with(['units' => function($q) {
                $q->where('is_active', true)->with(['priceBreaks' => function($pb) {
                    $pb->where('is_active', true)->orderBy('min_qty', 'asc');
                }]);
            }])
            ->get()
            ->map(function ($p) {
                // Get the base price directly from the first unit's first price break
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
            'product' => $product,
            'units' => $product->units,
        ]);
    }
}