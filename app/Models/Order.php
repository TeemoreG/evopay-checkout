<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'total_amount',
        'status',
        'payment_method',
        'mpgs_session_id',
        'items',
        'customer',
        'delivery',
    ];

    protected $casts = [
        'items' => 'array',
        'customer' => 'array',
        'delivery' => 'array',
    ];
}