<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Billing extends Model
{
    use HasFactory;

    protected $primaryKey = 'billing_id';

    protected $fillable = [
        'student_id',
        'semester_id',
        'cost_component_id',
        'description',
        'amount',
        'due_date',
        'status',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'amount' => 'decimal:2',
    ];


    public function costComponent()
    {
        return $this->belongsTo(CostComponent::class, 'cost_component_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }

    public function paymentDetails()
    {
        return $this->hasMany(PaymentDetail::class, 'billing_id', 'billing_id');
    }
}
