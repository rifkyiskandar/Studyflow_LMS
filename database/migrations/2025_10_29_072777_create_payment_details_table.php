<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_details', function (Blueprint $table) {
            $table->id('payment_detail_id');


            $table->foreignId('payment_id')->constrained('payments', 'payment_id')->cascadeOnDelete();


            $table->foreignId('billing_id')->constrained('billings', 'billing_id');


            $table->decimal('amount_paid', 12, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_details');
    }
};
