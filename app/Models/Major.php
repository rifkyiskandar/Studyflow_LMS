<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Major extends Model
{
    use HasFactory;


    protected $primaryKey = 'major_id';


    protected $fillable = ['major_name', 'faculty_id'];


    public function faculty()
    {

        return $this->belongsTo(Faculty::class, 'faculty_id');
    }
}
