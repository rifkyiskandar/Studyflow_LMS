<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentDetail extends Model
{
    use HasFactory;

    protected $primaryKey = 'payment_detail_id';

    protected $fillable = [
        'payment_id',
        'billing_id',
        'amount_paid',
    ];

    public function billing()
    {
        return $this->belongsTo(Billing::class, 'billing_id');
    }

    public function payment()
    {

        return $this->belongsTo(Payment::class, 'payment_id', 'payment_id');
    }
}
