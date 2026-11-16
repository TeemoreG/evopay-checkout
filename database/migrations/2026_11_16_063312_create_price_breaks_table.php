<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('price_breaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_unit_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('min_qty');           // inclusive
            $table->unsignedInteger('max_qty')->nullable(); // null = unlimited
            $table->decimal('unit_price', 12, 2);         // KES
            $table->string('currency', 3)->default('KES');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['product_unit_id', 'min_qty', 'max_qty']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_breaks');
    }
};