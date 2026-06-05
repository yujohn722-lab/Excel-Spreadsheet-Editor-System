<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workbooks', function (Blueprint $table) {
            $table->string('original_filename')->nullable();
            $table->string('original_file_path')->nullable();
            $table->string('current_file_path')->nullable();
            $table->string('file_mime')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('file_hash', 64)->nullable();
            $table->timestamp('last_imported_at')->nullable();
            $table->timestamp('last_exported_at')->nullable();
            $table->string('sync_mode')->default('manual_upload');
            $table->string('external_source_url')->nullable();
            $table->string('external_sync_status')->nullable();
            $table->timestamp('last_synced_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('workbooks', function (Blueprint $table) {
            $table->dropColumn([
                'original_filename',
                'original_file_path',
                'current_file_path',
                'file_mime',
                'file_size',
                'file_hash',
                'last_imported_at',
                'last_exported_at',
                'sync_mode',
                'external_source_url',
                'external_sync_status',
                'last_synced_at',
            ]);
        });
    }
};
