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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id('attendance_id'); 
            $table->foreignId('session_id')
                  ->constrained('class_sessions', 'session_id')
                  ->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users', 'user_id');
            $table->enum('status', ['present', 'absent', 'late', 'excused']);
            $table->text('note')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
