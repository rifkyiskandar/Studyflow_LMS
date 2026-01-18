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
        Schema::create('assignments', function (Blueprint $table) {
            $table->id('assignment_id'); 
            $table->foreignId('class_id')
                  ->constrained('course_classes', 'class_id')
                  ->cascadeOnDelete();
            $table->string('title');
            $table->enum('type', ['assignment', 'quiz', 'uts', 'uas']);
            $table->integer('weight');
            $table->dateTime('due_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
