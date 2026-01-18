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
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id('enrollment_id'); 
            $table->foreignId('class_id')->constrained('course_classes', 'class_id');
            $table->foreignId('student_id')->constrained('users', 'user_id');
            $table->date('enrollment_date');
            $table->enum('status', ['active', 'dropped', 'completed'])->default('active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
