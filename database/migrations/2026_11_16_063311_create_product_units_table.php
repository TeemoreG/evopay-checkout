<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->enum('unit_type', ['bag', 'pallet', 'tonne', 'bulk']);
            $table->string('label');                      // "50KG Bag", "Pallet (50 bags)"
            $table->unsignedInteger('base_qty_in_bags');  // 1, 50, 20, null(quote only)
            $table->unsignedInteger('min_qty')->default(1);
            $table->unsignedInteger('step_qty')->default(1);
            $table->boolean('requires_quote')->default(false); // true for bulk
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['product_id', 'unit_type']);
            $table->index(['product_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_units');
    }
};