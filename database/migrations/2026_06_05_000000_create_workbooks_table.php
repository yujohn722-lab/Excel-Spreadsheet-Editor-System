<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workbooks', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('sheet_name');
            $table->json('columns');
            $table->json('rows');
            $table->json('config')->nullable();
            $table->timestamps();

            $table->index('updated_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workbooks');
    }
};
