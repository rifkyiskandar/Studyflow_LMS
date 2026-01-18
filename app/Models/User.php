<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Tentukan primary key kustom Anda.
     */
    protected $primaryKey = 'user_id';

    /**
     * Atribut yang bisa diisi (Mass Assignment).
     */
    protected $fillable = [
        'full_name',
        'email',
        'password_hash',
        'role_id',
        'phone_number',
        'birth_date',
        'address',
        'profile_picture',
        'last_login'
    ];

    /**
     * Atribut yang disembunyikan saat serialisasi.
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /**
     * Casting tipe data otomatis.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password_hash'     => 'hashed',
        'birth_date'        => 'date',
        'last_login'        => 'datetime',
        'role_id'           => 'integer',
        'is_active'         => 'boolean',
    ];

    /**
     * Override password field.
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function getAuthPasswordName()
    {
        return 'password_hash';
    }



    /**
     * Relasi ke Profil Mahasiswa.
     */
    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class, 'user_id', 'user_id');
    }

    /**
     * Relasi ke Profil Dosen.
     */
    public function lecturerProfile(): HasOne
    {
        return $this->hasOne(LecturerProfile::class, 'user_id', 'user_id');
    }

    /**
     * Relasi ke Grades (Riwayat Nilai).
     * Digunakan untuk mengambil history nilai mahasiswa.
     */
    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class, 'student_id', 'user_id');
    }


    public function profileInfo()
    {
        return $this->hasOne(StudentProfileInfo::class, 'user_id', 'user_id');
    }
}
