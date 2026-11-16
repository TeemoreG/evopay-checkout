<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductUnit extends Model
{
    protected $fillable = [
        'product_id', 'unit_type', 'label', 'base_qty_in_bags',
        'min_qty', 'step_qty', 'requires_quote', 'is_active',
    ];

    protected $casts = [
        'requires_quote' => 'boolean',
        'is_active'      => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function priceBreaks(): HasMany
    {
        return $this->hasMany(PriceBreak::class);
    }
}