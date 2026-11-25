<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transporters', function (Blueprint $table) {
            $table->boolean('is_available')->default(false)->after('status');
            $table->decimal('base_fare', 10, 2)->default(0.00)->after('is_available');
            $table->decimal('rate_per_kg', 8, 2)->default(10.00)->after('base_fare');
            $table->decimal('rate_per_km', 8, 2)->default(30.00)->after('rate_per_kg');
        });
    }

    public function down(): void
    {
        Schema::table('transporters', function (Blueprint $table) {
            $table->dropColumn(['is_available', 'base_fare', 'rate_per_kg', 'rate_per_km']);
        });
    }
};