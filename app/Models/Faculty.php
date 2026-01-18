<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faculty extends Model
{
    use HasFactory;
    protected $primaryKey = 'faculty_id';
    protected $fillable = ['faculty_name'];



    /**
     * Fakultas memiliki banyak Jurusan (Majors)
     */
    public function majors(): HasMany
    {
        return $this->hasMany(Major::class, 'faculty_id', 'faculty_id');
    }

    /**
     * Fakultas memiliki banyak Profil Dosen (Lecturer Profiles)
     */
    public function lecturerProfiles(): HasMany
    {
        return $this->hasMany(LecturerProfile::class, 'faculty_id', 'faculty_id');
    }
}
