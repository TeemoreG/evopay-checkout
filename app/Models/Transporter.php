<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transporter extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'vehicle_type',
        'area',
        'plate_number',
        'id_number',
        'id_document_path',
        'status',
        'is_available',
        'base_fare',
        'rate_per_kg',
        'rate_per_km',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'base_fare' => 'float',
        'rate_per_kg' => 'float',
        'rate_per_km' => 'float',
    ];

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'transporter_id');
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status', 'approved')->where('is_available', true);
    }
}