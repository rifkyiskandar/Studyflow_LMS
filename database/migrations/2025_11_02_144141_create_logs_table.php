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
        Schema::create('logs', function (Blueprint $table) {
            $table->id('log_id'); 
            $table->foreignId('user_id')->nullable()->constrained('users', 'user_id');
            $table->enum('role', ['admin', 'lecturer', 'student']);
            $table->string('action', 10);
            $table->string('entity_name', 50)->nullable();
            $table->string('entity_id', 50)->nullable();
            $table->text('description');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
