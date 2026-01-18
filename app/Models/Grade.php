<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory;


    protected $primaryKey = 'grade_id';

    protected $fillable = [
        'student_id',
        'course_id',
        'semester_id',
        'score',
        'grade_char',
        'grade_point',
        'is_passed',
    ];

    protected $casts = [
        'is_passed' => 'boolean',
        'grade_point' => 'decimal:2',
        'score' => 'decimal:2',
    ];




    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id', 'user_id');
    }


    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }


    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'semester_id');
    }
}
