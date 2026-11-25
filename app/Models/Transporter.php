<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Transporter extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'vehicle_type',
        'area',
        'plate_number',
        'status',
    ];

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }
}