<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KrsRequest extends Model
{
    protected $primaryKey = 'krs_id';
    protected $fillable = ['student_id', 'semester_id', 'status', 'total_sks'];

    public function items()
    {
        return $this->hasMany(KrsItem::class, 'krs_id');
    }

    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }
}
