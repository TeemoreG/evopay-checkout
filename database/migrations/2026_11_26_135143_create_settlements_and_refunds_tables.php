<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained('merchants')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('KES');
            $table->string('channel', 20)->default('mpesa'); // mpesa, bank
            $table->json('destination'); // phone or bank account details
            $table->string('status', 20)->default('pending'); // pending, processing, completed, rejected
            $table->string('reference')->unique();
            $table->text('notes')->nullable();
            $table->timestamp('settled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained('merchants')->cascadeOnDelete();
            $table->foreignId('checkout_session_id')->constrained('checkout_sessions')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('KES');
            $table->string('reason')->nullable();
            $table->string('status', 20)->default('completed'); // completed, pending, failed
            $table->string('reference')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('settlements');
    }
};