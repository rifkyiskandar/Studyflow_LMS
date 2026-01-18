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
        Schema::create('forum_attachments', function (Blueprint $table) {
            $table->id('attachment_id'); 
            $table->foreignId('thread_id')
                  ->nullable()
                  ->constrained('forum_threads', 'thread_id')
                  ->cascadeOnDelete();
            $table->foreignId('reply_id')
                  ->nullable()
                  ->constrained('forum_replies', 'reply_id')
                  ->cascadeOnDelete();
            $table->string('file_url');
            $table->timestamp('uploaded_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forum_attachments');
    }
};
