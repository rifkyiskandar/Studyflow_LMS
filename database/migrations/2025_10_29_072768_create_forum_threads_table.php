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
        Schema::create('forum_threads', function (Blueprint $table) {
            $table->id('thread_id');
            $table->foreignId('class_id')
                  ->constrained('course_classes', 'class_id')
                  ->cascadeOnDelete();
            $table->foreignId('session_id')
                  ->nullable()
                  ->constrained('class_sessions', 'session_id')
                  ->nullOnDelete();
            $table->foreignId('user_id')->constrained('users', 'user_id');
            $table->string('title');
            $table->text('content');
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forum_threads');
    }
};
