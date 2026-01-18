<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $primaryKey = 'payment_id';

    protected $fillable = [
        'student_id',
        'order_id',
        'snap_token',
        'payment_method',
        'midtrans_response',
        'total_amount',
        'payment_date',
        'status',
    ];

    protected $casts = [
        'midtrans_response' => 'array',
        'payment_date' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    public function student()
    {



        return $this->belongsTo(User::class, 'student_id', 'user_id');
    }

    public function details()
    {
        return $this->hasMany(PaymentDetail::class, 'payment_id');
    }
}
