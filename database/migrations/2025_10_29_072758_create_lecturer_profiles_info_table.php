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
        Schema::create('lecturer_profiles_info', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users', 'user_id')->cascadeOnDelete();
            $table->string('office_hours')->nullable();
            $table->text('research_interest')->nullable();
            $table->text('bio')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lecturer_profiles_info');
    }
};
