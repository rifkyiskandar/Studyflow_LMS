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
        Schema::create('session_materials', function (Blueprint $table) {
            $table->id('material_id'); 
            $table->foreignId('session_id')
                  ->constrained('class_sessions', 'session_id')
                  ->cascadeOnDelete();
            $table->enum('type', ['ppt', 'video', 'note', 'book', 'link', 'other']);
            $table->string('title');
            $table->string('url')->nullable();
            $table->string('file_path')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_materials');
    }
};
