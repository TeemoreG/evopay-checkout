<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transporters', function (Blueprint $table) {
            if (!Schema::hasColumn('transporters', 'max_weight_kg')) {
                $table->decimal('max_weight_kg', 10, 2)->default(3000)->after('rate_per_km');
            }
        });
    }

    public function down(): void
    {
        Schema::table('transporters', function (Blueprint $table) {
            $table->dropColumn('max_weight_kg');
        });
    }
};