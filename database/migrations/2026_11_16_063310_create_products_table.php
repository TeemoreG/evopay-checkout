<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->unique();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->string('image')->nullable();
            $table->string('category')->default('cement');
            $table->string('brand')->default('Mombasa Cement');
            $table->boolean('kebs_certified')->default(true);
            $table->string('grade')->nullable();          // e.g. CEM II A-P 42.5N
            $table->boolean('is_active')->default(true);
            $table->json('specs')->nullable();            // technical specs
            $table->json('best_used_for')->nullable();    // array of use cases
            $table->timestamps();

            $table->index(['is_active', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};