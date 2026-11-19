<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkout_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('token', 64)->unique(); // e.g. cs_live_...
            $table->foreignId('merchant_id')->constrained('merchants')->cascadeOnDelete();
            $table->string('merchant_reference'); // Merchant's own order/invoice ID
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('KES');
            $table->json('customer')->nullable(); // name, email, phone
            $table->text('return_url')->nullable();
            $table->text('cancel_url')->nullable();
            $table->text('webhook_url')->nullable();
            $table->string('status', 20)->default('pending'); // pending, paid, failed, expired, cancelled
            $table->string('payment_method', 20)->nullable(); // mpesa, card, airtel
            $table->text('failure_reason')->nullable();
            $table->string('mpesa_request_id')->nullable();
            $table->string('mpesa_receipt')->nullable();
            $table->string('mpgs_session_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['merchant_id', 'merchant_reference']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_sessions');
    }
};