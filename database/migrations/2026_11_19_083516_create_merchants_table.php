<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('merchants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('email')->nullable();
            $table->string('logo_url')->nullable();
            $table->text('webhook_url')->nullable();
            $table->string('webhook_secret')->nullable();
            $table->text('default_return_url')->nullable();
            $table->text('default_cancel_url')->nullable();
            $table->string('status')->default('active'); // active, pending, suspended
            $table->decimal('fee_percent', 5, 2)->default(2.50);
            $table->decimal('fee_flat', 10, 2)->default(0.00);
            $table->json('settlement_details')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('merchants');
    }
};