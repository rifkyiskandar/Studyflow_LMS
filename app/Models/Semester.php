<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\StudentProfile; 

class Semester extends Model
{
    use HasFactory;

    /**
     * Tentukan primary key kustom Anda.
     */
    protected $primaryKey = 'semester_id';

    /**
     * Atribut yang bisa diisi secara massal.
     */
    protected $fillable = [
        'semester_name',
        'academic_year',
        'term',
        'start_date',
        'end_date',
        'is_active',
    ];

    /**
     * Atribut yang harus di-cast ke tipe data tertentu.
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function studentProfiles(): HasMany
    {
        return $this->hasMany(StudentProfile::class, 'semester_id', 'semester_id');
    }
}
