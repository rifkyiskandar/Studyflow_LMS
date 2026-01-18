<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProfileInfo extends Model
{
    protected $table = 'student_profiles_info';
    protected $primaryKey = 'user_id';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'nickname',
        'dream_job',
        'goals',
        'quote',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
