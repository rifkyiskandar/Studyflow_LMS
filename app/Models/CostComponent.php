<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CostComponent extends Model
{
    use HasFactory;

    protected $primaryKey = 'cost_component_id';

    protected $fillable = [
        'component_name',
        'component_code',
        'billing_type',
        'amount'
    ];






}

