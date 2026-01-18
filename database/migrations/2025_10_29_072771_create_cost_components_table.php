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
        Schema::create('cost_components', function (Blueprint $table) {
            $table->id('cost_component_id');
            $table->string('component_name');
            $table->string('component_code')->unique();
            $table->enum('billing_type', ['PER_SKS', 'PER_COURSE', 'PER_SEMESTER', 'ONE_TIME']);
            $table->decimal('amount', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cost_components');
    }
};
