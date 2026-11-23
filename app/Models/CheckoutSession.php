<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CheckoutSession extends Model
{
    protected $fillable = [
        'token',
        'idempotency_key', // Added this
        'merchant_id',
        'merchant_reference',
        'amount',
        'currency',
        'customer',
        'return_url',
        'cancel_url',
        'webhook_url',
        'status',
        'payment_method',
        'failure_reason',
        'mpesa_request_id',
        'mpesa_receipt',
        'mpgs_session_id',
        'metadata',
        'expires_at',
        'paid_at',
    ];

    protected $casts = [
        'customer' => 'array',
        'metadata' => 'array',
        'amount' => 'float',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public static function generateToken(string $mode = 'live'): string
    {
        return 'cs_' . $mode . '_' . Str::random(28);
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isExpired(): bool
    {
        return $this->expires_at && now()->greaterThan($this->expires_at);
    }

    public function markAsPaid(string $method, ?string $receipt = null): void
    {
        $this->update([
            'status' => 'paid',
            'payment_method' => $method,
            'mpesa_receipt' => $receipt ?? $this->mpesa_receipt,
            'failure_reason' => null,
            'paid_at' => now(),
        ]);
    }

    public function markAsFailed(string $reason): void
    {
        $this->update([
            'status' => 'failed',
            'failure_reason' => $reason,
        ]);
    }
}