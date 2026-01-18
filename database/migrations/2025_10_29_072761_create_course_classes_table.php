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
        Schema::create('course_classes', function (Blueprint $table) {
            $table->id('class_id');
            $table->foreignId('course_id')->constrained('courses', 'course_id');
            $table->foreignId('lecturer_id')->constrained('users', 'user_id');
            $table->foreignId('semester_id')->constrained('semesters', 'semester_id');
            $table->foreignId('room_id')->constrained('rooms', 'room_id');
            $table->string('class_name', 20);
            $table->enum('day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_classes');
    }
};
