<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KrsItem extends Model
{
    protected $primaryKey = 'krs_item_id';
    protected $fillable = ['krs_id', 'class_id', 'sks', 'status'];

    public function krsRequest()
    {
        return $this->belongsTo(KrsRequest::class, 'krs_id');
    }

    public function class()
    {
        return $this->belongsTo(CourseClass::class, 'class_id');
    }
}
