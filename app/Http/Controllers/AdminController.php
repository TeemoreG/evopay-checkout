<?php

namespace App\Http\Controllers;

use App\Models\Merchant;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminController extends Controller
{
    private function getUnitMeasurements(): array
    {
        $default = ['piece', 'bag', 'wheelbarrow', 'pickup', 'lorry', 'tonne'];
        $raw = Setting::get('unit_measurements');

        if (!$raw) {
            return $default;
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) && count($decoded) > 0 ? $decoded : $default;
    }

    public function index()
    {
        $products = Product::with(['units.priceBreaks'])->latest()->get();

        return Inertia::render('Admin/Index', [
            'products' => $products,
            'unit_measurements' => $this->getUnitMeasurements(),
        ]);
    }

    public function orders()
    {
        $orders = Order::latest()->limit(100)->get();

        return Inertia::render('Admin/Orders', [
            'orders' => $orders,
        ]);
    }

    public function merchants()
    {
        $merchants = Merchant::withCount('checkoutSessions')
            ->with(['apiKeys' => fn ($q) => $q->where('is_active', true)])
            ->latest()
            ->get();

        return Inertia::render('Admin/Merchants', [
            'merchants' => $merchants,
        ]);
    }

    public function storeMerchant(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'logo_url' => 'nullable|url|max:2048',
            'webhook_url' => 'nullable|url|max:2048',
            'fee_percent' => 'nullable|numeric|min:0|max:50',
            'mode' => 'required|in:live,test',
        ]);

        $result = DB::transaction(function () use ($data) {
            $slug = Str::slug($data['name']);
            $originalSlug = $slug;
            $counter = 1;
            while (Merchant::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }

            $merchant = Merchant::create([
                'name' => $data['name'],
                'slug' => $slug,
                'email' => $data['email'],
                'logo_url' => $data['logo_url'] ?? null,
                'webhook_url' => $data['webhook_url'] ?? null,
                'webhook_secret' => 'whsec_' . Str::random(32),
                'fee_percent' => $data['fee_percent'] ?? 2.50,
                'status' => 'active',
            ]);

            $keys = $merchant->createApiKey('Default API Key', $data['mode']);

            User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => 'merchant',
                'merchant_id' => $merchant->id,
            ]);

            return [
                'merchant' => $merchant,
                'public_key' => $keys['public_key'],
                'secret_key' => $keys['secret_key'],
            ];
        });

        return response()->json([
            'status' => 'success',
            'merchant' => $result['merchant'],
            'public_key' => $result['public_key'],
            'secret_key' => $result['secret_key'],
            'login_email' => $data['email'],
        ]);
    }

    public function toggleMerchantStatus(Merchant $merchant)
    {
        $merchant->update([
            'status' => $merchant->status === 'active' ? 'suspended' : 'active',
        ]);

        return redirect()->back();
    }

    public function storeProduct(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'weight' => 'nullable|numeric|min:0',
            'short_description' => 'nullable|string',
            'units' => 'array',
            'units.*.unit_type' => 'required|string',
            'units.*.label' => 'required|string',
            'units.*.price' => 'required|numeric|min:1',
        ]);

        $product = Product::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . rand(100, 999),
            'sku' => 'SKU-' . rand(10000, 99999),
            'category' => $request->category,
            'weight' => $request->weight ?? 0,
            'short_description' => $request->short_description ?? '',
            'image_url' => $request->image_url ?? '',
            'is_active' => true,
        ]);

        if ($request->has('units') && is_array($request->units)) {
            foreach ($request->units as $unitData) {
                $unit = ProductUnit::create([
                    'product_id' => $product->id,
                    'unit_type' => $unitData['unit_type'],
                    'label' => $unitData['label'],
                    'base_qty_in_bags' => 1,
                    'min_qty' => 1,
                    'step_qty' => 1,
                    'requires_quote' => false,
                    'is_active' => true,
                ]);

                $unit->priceBreaks()->create([
                    'min_qty' => 1,
                    'max_qty' => null,
                    'unit_price' => $unitData['price'],
                    'is_active' => true
                ]);
            }
        }

        return redirect()->back()->with('success', 'Product created successfully!');
    }

    public function updateProduct(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'weight' => 'nullable|numeric|min:0',
            'short_description' => 'nullable|string',
            'units' => 'array',
        ]);

        $product->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . $product->id,
            'category' => $request->category,
            'weight' => $request->weight ?? 0,
            'short_description' => $request->short_description ?? '',
            'image_url' => $request->image_url ?? '',
        ]);

        if ($request->has('units') && is_array($request->units)) {
            $existingUnitIds = collect($request->units)->pluck('id')->filter()->toArray();
            $product->units()->whereNotIn('id', $existingUnitIds)->delete();

            foreach ($request->units as $unitData) {
                if (isset($unitData['id']) && $unitData['id']) {
                    $unit = $product->units()->find($unitData['id']);
                    if ($unit) {
                        $unit->update([
                            'unit_type' => $unitData['unit_type'],
                            'label' => $unitData['label'],
                        ]);

                        $unit->priceBreaks()->delete();
                        $unit->priceBreaks()->create([
                            'min_qty' => 1,
                            'max_qty' => null,
                            'unit_price' => $unitData['price'],
                            'is_active' => true
                        ]);
                    }
                } else {
                    $newUnit = $product->units()->create([
                        'unit_type' => $unitData['unit_type'],
                        'label' => $unitData['label'],
                        'base_qty_in_bags' => 1,
                        'min_qty' => 1,
                        'step_qty' => 1,
                        'requires_quote' => false,
                        'is_active' => true,
                    ]);
                    $newUnit->priceBreaks()->create([
                        'min_qty' => 1,
                        'max_qty' => null,
                        'unit_price' => $unitData['price'],
                        'is_active' => true
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Product updated successfully!');
    }

    public function destroyProduct(Product $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'Product deleted successfully!');
    }

    public function settings()
    {
        return Inertia::render('Admin/Settings', [
            'hq_lat' => Setting::get('hq_lat', '-1.2674'),
            'hq_lng' => Setting::get('hq_lng', '36.7704'),
            'price_per_kg' => Setting::get('price_per_kg', '20'),
            'price_per_km' => Setting::get('price_per_km', '50'),
            'unit_measurements' => $this->getUnitMeasurements(),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'hq_lat' => 'required|numeric',
            'hq_lng' => 'required|numeric',
            'price_per_kg' => 'required|numeric|min:0',
            'price_per_km' => 'required|numeric|min:0',
            'unit_measurements' => 'nullable|array',
            'unit_measurements.*' => 'required|string|max:50',
        ]);

        Setting::set('hq_lat', $request->hq_lat);
        Setting::set('hq_lng', $request->hq_lng);
        Setting::set('price_per_kg', $request->price_per_kg);
        Setting::set('price_per_km', $request->price_per_km);

        if ($request->has('unit_measurements')) {
            $cleaned = collect($request->unit_measurements)
                ->map(fn ($u) => strtolower(trim($u)))
                ->filter()
                ->unique()
                ->values()
                ->all();

            Setting::set('unit_measurements', json_encode($cleaned));
        }

        return redirect()->back()->with('success', 'Settings updated successfully!');
    }
}