<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Course extends Model
{
    use HasFactory;

    protected $primaryKey = 'course_id';

    protected $fillable = [
        'course_code', 'course_name', 'sks',
        'faculty_id', 'major_id', 'description'
    ];

    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class, 'faculty_id', 'faculty_id');
    }

    public function major(): BelongsTo
    {
        return $this->belongsTo(Major::class, 'major_id', 'major_id');
    }
}
