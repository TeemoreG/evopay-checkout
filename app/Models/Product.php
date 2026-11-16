<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    // Added 'image_url' to the fillable array
    protected $fillable = [
        'name', 
        'slug', 
        'sku', 
        'description', 
        'short_description',
        'image', 
        'image_url', // <-- THIS WAS MISSING
        'category', 
        'brand', 
        'kebs_certified', 
        'grade',
        'is_active', 
        'specs', 
        'best_used_for',
    ];

    protected $casts = [
        'kebs_certified' => 'boolean',
        'is_active'      => 'boolean',
        'specs'          => 'array',
        'best_used_for'  => 'array',
    ];

    public function units(): HasMany
    {
        return $this->hasMany(ProductUnit::class);
    }
}