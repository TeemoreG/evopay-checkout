<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'total_amount',
        'status',
        'failure_reason',
        'payment_method',
        'mpgs_session_id',
        'mpesa_request_id',
        'mpesa_receipt',
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