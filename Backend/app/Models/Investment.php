<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Investment extends Model
{
    protected $fillable = [
        'user_id',
        'symbol',
        'name',
        'type',
        'quantity',
        'average_buy_price',
        'current_price',
    ];

    protected $casts = [
        'quantity' => 'decimal:8',
        'average_buy_price' => 'decimal:2',
        'current_price' => 'decimal:2',
    ];
}