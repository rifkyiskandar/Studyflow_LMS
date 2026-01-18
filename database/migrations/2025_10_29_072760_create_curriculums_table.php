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
        Schema::create('curriculums', function (Blueprint $table) {
            $table->id('curriculum_id');
            $table->foreignId('major_id')->constrained('majors', 'major_id');
            $table->foreignId('course_id')->constrained('courses', 'course_id');
            $table->integer('semester');
            $table->enum('category', ['MKU', 'WAJIB_PRODI', 'WAJIB_FAKULTAS', 'PILIHAN']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculums');
    }
};
