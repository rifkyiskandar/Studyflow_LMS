<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users', 'user_id')->cascadeOnDelete();
            $table->string('student_number', 20)->unique();
            $table->foreignId('faculty_id')->constrained('faculties', 'faculty_id');
            $table->foreignId('major_id')->constrained('majors', 'major_id');
            $table->foreignId('semester_id')->constrained('semesters', 'semester_id');
            $table->year('batch_year');
            $table->decimal('gpa', 3, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
