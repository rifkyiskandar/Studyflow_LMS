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
        Schema::create('class_sessions', function (Blueprint $table) {
            $table->id('session_id'); 
            $table->foreignId('class_id')
                  ->constrained('course_classes', 'class_id')
                  ->cascadeOnDelete();
            $table->integer('session_number');
            $table->date('session_date');
            $table->string('topic');
            $table->string('zoom_link')->nullable();
            $table->boolean('is_online')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_sessions');
    }
};
