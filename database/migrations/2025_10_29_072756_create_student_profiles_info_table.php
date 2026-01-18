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
        Schema::create('student_profiles_info', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users', 'user_id')->cascadeOnDelete();
            $table->string('nickname', 50)->nullable();
            $table->string('dream_job')->nullable();
            $table->text('goals')->nullable();
            $table->text('quote')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_profiles_info');
    }
};
