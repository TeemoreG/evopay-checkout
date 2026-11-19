<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained('merchants')->cascadeOnDelete();
            $table->string('name')->default('Default API Key');
            $table->string('public_key', 64)->unique(); // e.g. pk_live_... or pk_test_...
            $table->string('secret_key_hash', 64)->unique(); // SHA-256 hash of sk_live_...
            $table->string('secret_key_prefix', 16); // e.g. sk_live_1234... for dashboard display
            $table->string('mode', 10)->default('live'); // live, test
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->index(['merchant_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('api_keys');
    }
};