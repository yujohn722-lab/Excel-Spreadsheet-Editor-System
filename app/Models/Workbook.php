<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workbook extends Model
{
    use HasFactory;
    use HasUlids;

    protected $fillable = [
        'name',
        'sheet_name',
        'columns',
        'rows',
        'config',
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
    ];

    protected $casts = [
        'columns' => 'array',
        'rows' => 'array',
        'config' => 'array',
        'last_imported_at' => 'datetime',
        'last_exported_at' => 'datetime',
        'last_synced_at' => 'datetime',
    ];
}
