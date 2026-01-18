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
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');


            $table->foreignId('student_id')->constrained('users', 'user_id')->cascadeOnDelete();

            


            $table->string('order_id')->unique();
            $table->string('snap_token')->nullable();
            $table->string('payment_method')->nullable();
            $table->json('midtrans_response')->nullable();


            $table->decimal('total_amount', 12, 2);
            $table->timestamp('payment_date')->nullable();


            $table->enum('status', ['pending', 'paid', 'expired', 'failed'])->default('pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
