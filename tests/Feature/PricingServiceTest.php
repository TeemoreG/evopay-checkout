<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductUnit;
use App\Services\PricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingServiceTest extends TestCase
{
    use RefreshDatabase;

    private function kpSuperGoldBag(): ProductUnit
    {
        $product = Product::create([
            'name' => 'KP Super Gold', 'slug' => 'kp', 'sku' => 'KPSG',
            'category' => 'cement', 'brand' => 'Mombasa Cement', 'is_active' => true,
        ]);

        $unit = ProductUnit::create([
            'product_id' => $product->id, 'unit_type' => 'bag',
            'label' => '50KG Bag', 'base_qty_in_bags' => 1,
            'min_qty' => 1, 'step_qty' => 1, 'requires_quote' => false, 'is_active' => true,
        ]);

        $unit->priceBreaks()->createMany([
            ['min_qty' => 1,   'max_qty' => 49,   'unit_price' => 800, 'is_active' => true],
            ['min_qty' => 50,  'max_qty' => 99,   'unit_price' => 760, 'is_active' => true],
            ['min_qty' => 100, 'max_qty' => null, 'unit_price' => 750, 'is_active' => true],
        ]);

        return $unit->fresh();
    }

    public function test_single_bag_uses_first_tier(): void
    {
        $r = (new PricingService)->calculate($this->kpSuperGoldBag(), 1);
        $this->assertSame(800.0, $r['unit_price']);
        $this->assertSame(800.0, $r['total']);
    }

    public function test_quantity_50_triggers_second_tier(): void
    {
        $r = (new PricingService)->calculate($this->kpSuperGoldBag(), 50);
        $this->assertSame(760.0, $r['unit_price']);
        $this->assertSame(38000.0, $r['total']);
    }

    public function test_quantity_100_triggers_third_tier(): void
    {
        $r = (new PricingService)->calculate($this->kpSuperGoldBag(), 100);
        $this->assertSame(750.0, $r['unit_price']);
        $this->assertSame(75000.0, $r['total']);
    }

    public function test_quantity_250_uses_highest_tier(): void
    {
        $r = (new PricingService)->calculate($this->kpSuperGoldBag(), 250);
        $this->assertSame(750.0, $r['unit_price']);
        $this->assertSame(187500.0, $r['total']);
    }

    public function test_below_minimum_throws(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        (new PricingService)->calculate($this->kpSuperGoldBag(), 0);
    }
}