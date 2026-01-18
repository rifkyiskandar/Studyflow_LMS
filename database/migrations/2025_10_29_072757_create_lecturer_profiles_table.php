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
        Schema::create('lecturer_profiles', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users', 'user_id')->cascadeOnDelete();
            $table->string('lecturer_number', 20)->unique();
            $table->foreignId('faculty_id')->constrained('faculties', 'faculty_id');
            $table->string('title', 100)->nullable();
            $table->string('position', 100)->nullable();
            $table->string('office_room', 50)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lecturer_profiles');
    }
};
