<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseClass extends Model
{
    use HasFactory;

    protected $primaryKey = 'class_id';

    protected $fillable = [
        'course_id',
        'lecturer_id',
        'semester_id',
        'room_id',
        'day',
        'start_time',
        'end_time',
        'class_name',
    ];



    protected $casts = [
        'start_time' => 'string',
        'end_time' => 'string',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function lecturer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lecturer_id', 'user_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id', 'room_id');
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'semester_id');
    }
}
