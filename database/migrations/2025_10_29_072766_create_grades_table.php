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
        Schema::create('grades', function (Blueprint $table) {
            $table->id('grade_id');


            $table->foreignId('student_id')->constrained('users', 'user_id')->cascadeOnDelete();


            $table->foreignId('course_id')->constrained('courses', 'course_id')->cascadeOnDelete();


            $table->foreignId('semester_id')->constrained('semesters', 'semester_id');


            $table->decimal('score', 5, 2)->nullable();
            $table->char('grade_char', 2)->nullable();
            $table->decimal('grade_point', 3, 2)->nullable();


            $table->boolean('is_passed')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
