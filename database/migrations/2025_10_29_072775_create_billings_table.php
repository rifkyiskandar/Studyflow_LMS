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
        Schema::create('billings', function (Blueprint $table) {
            $table->id('billing_id');
            $table->foreignId('student_id')->constrained('users', 'user_id');
            $table->foreignId('semester_id')->constrained('semesters', 'semester_id');
            $table->foreignId('cost_component_id')->constrained('cost_components', 'cost_component_id');
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->dateTime('due_date');
            $table->enum('status', ['unpaid', 'paid', 'overdue'])->default('unpaid');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billings');
    }
};
