<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_units', function (Blueprint $table) {
            // Change the enum to a simple string
            $table->string('unit_type')->change();
        });
    }

    public function down(): void
    {
        // We won't revert to enum in case of rollback
    }
};