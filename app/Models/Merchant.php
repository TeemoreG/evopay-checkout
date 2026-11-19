<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Merchant extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'email',
        'logo_url',
        'webhook_url',
        'webhook_secret',
        'default_return_url',
        'default_cancel_url',
        'status',
        'fee_percent',
        'fee_flat',
        'settlement_details',
        'metadata',
    ];

    protected $casts = [
        'settlement_details' => 'array',
        'metadata' => 'array',
        'fee_percent' => 'float',
        'fee_flat' => 'float',
    ];

    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    public function checkoutSessions(): HasMany
    {
        return $this->hasMany(CheckoutSession::class);
    }

    /**
     * Create an API key pair. Returns the unhashed secret key once.
     */
    public function createApiKey(string $name = 'Default API Key', string $mode = 'live'): array
    {
        $rawSecret = 'sk_' . $mode . '_' . Str::random(32);
        $publicKey = 'pk_' . $mode . '_' . Str::random(24);

        $apiKey = $this->apiKeys()->create([
            'name' => $name,
            'public_key' => $publicKey,
            'secret_key_hash' => hash('sha256', $rawSecret),
            'secret_key_prefix' => substr($rawSecret, 0, 12),
            'mode' => $mode,
            'is_active' => true,
        ]);

        return [
            'api_key' => $apiKey,
            'public_key' => $publicKey,
            'secret_key' => $rawSecret, // Show once to merchant
        ];
    }
}