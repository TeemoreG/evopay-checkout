<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Disable foreign keys temporarily so we can truncate safely
        Schema::disableForeignKeyConstraints();
        Product::truncate();
        ProductUnit::truncate();
        Schema::enableForeignKeyConstraints();

        // 2. Define strictly Hardware & Electronics
        $items = [
            // HARDWARE
            ['cat' => 'Hardware', 'name' => 'KP Super Gold Cement', 'price' => 800, 'img' => 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80'],
            ['cat' => 'Hardware', 'name' => 'Nyumba Plus Cement', 'price' => 720, 'img' => 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&q=80'],
            ['cat' => 'Hardware', 'name' => 'Steel Reinforcement Bar 12mm', 'price' => 1200, 'img' => 'https://images.unsplash.com/photo-1504307651254-35680f356f12?w=600&q=80'],
            ['cat' => 'Hardware', 'name' => 'Roofing Sheets (30G)', 'price' => 900, 'img' => 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=600&q=80'],
            ['cat' => 'Hardware', 'name' => 'PVC Water Pipe 1/2 inch', 'price' => 450, 'img' => 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80'],
            ['cat' => 'Hardware', 'name' => 'Ceramic Floor Tiles (Box)', 'price' => 1500, 'img' => 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80'],
            
            // ELECTRONICS
            ['cat' => 'Electronics', 'name' => 'Samsung 43" Smart TV', 'price' => 35000, 'img' => 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80'],
            ['cat' => 'Electronics', 'name' => 'HP Pavilion Laptop 15"', 'price' => 75000, 'img' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'],
            ['cat' => 'Electronics', 'name' => 'iPhone 13 Pro Max 128GB', 'price' => 95000, 'img' => 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80'],
            ['cat' => 'Electronics', 'name' => 'Sony Wireless Headphones', 'price' => 18500, 'img' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'],
            ['cat' => 'Electronics', 'name' => 'JBL Bluetooth Speaker', 'price' => 8500, 'img' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80'],
            ['cat' => 'Electronics', 'name' => 'Logitech Wireless Mouse', 'price' => 2500, 'img' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80'],
            ['cat' => 'Electronics', 'name' => 'PlayStation 5 Console', 'price' => 85000, 'img' => 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80'],
            ['cat' => 'Electronics', 'name' => 'Canon DSLR Camera', 'price' => 65000, 'img' => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'],
            ['cat' => 'Electronics', 'name' => 'Smart Watch Series 7', 'price' => 25000, 'img' => 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80'],
        ];

        foreach ($items as $item) {
            $product = Product::create([
                'name' => $item['name'],
                'slug' => Str::slug($item['name']) . '-' . rand(100, 999),
                'sku' => 'SKU-' . rand(10000, 99999),
                'image_url' => $item['img'],
                'short_description' => 'Premium quality ' . strtolower($item['name']) . '.',
                'category' => $item['cat'],
                'is_active' => true,
            ]);

            // Cement gets Bags, everything else gets Pieces
            if (str_contains($item['name'], 'Cement')) {
                $unitBag = ProductUnit::create([
                    'product_id' => $product->id, 'unit_type' => 'bag', 'label' => '50KG Bag',
                    'base_qty_in_bags' => 1, 'min_qty' => 1, 'step_qty' => 1, 'requires_quote' => false, 'is_active' => true,
                ]);
                $unitBag->priceBreaks()->createMany([
                    ['min_qty' => 1, 'max_qty' => 49, 'unit_price' => $item['price'], 'is_active' => true],
                    ['min_qty' => 50, 'max_qty' => null, 'unit_price' => $item['price'] * 0.95, 'is_active' => true], 
                ]);
            } else {
                $unit = ProductUnit::create([
                    'product_id' => $product->id, 'unit_type' => 'piece', 'label' => '1 Unit',
                    'base_qty_in_bags' => 1, 'min_qty' => 1, 'step_qty' => 1, 'requires_quote' => false, 'is_active' => true,
                ]);
                $unit->priceBreaks()->create([
                    'min_qty' => 1, 'max_qty' => null, 'unit_price' => $item['price'], 'is_active' => true,
                ]);
            }
        }
    }
}