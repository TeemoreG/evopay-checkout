<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiKey extends Model
{
    protected $fillable = [
        'merchant_id',
        'name',
        'public_key',
        'secret_key_hash',
        'secret_key_prefix',
        'mode',
        'is_active',
        'last_used_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    /**
     * Authenticate an incoming raw secret key (sk_live_... or sk_test_...).
     */
    public static function verifySecretKey(string $plainTextKey): ?self
    {
        if (!str_starts_with($plainTextKey, 'sk_')) {
            return null;
        }

        $hash = hash('sha256', $plainTextKey);

        $key = self::with('merchant')
            ->where('secret_key_hash', $hash)
            ->where('is_active', true)
            ->first();

        if ($key && $key->merchant && $key->merchant->status === 'active') {
            $key->updateQuietly(['last_used_at' => now()]);
            return $key;
        }

        return null;
    }
}