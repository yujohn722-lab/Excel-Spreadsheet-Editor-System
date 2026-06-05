<?php

use App\Http\Controllers\WorkbookController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WorkbookController::class, 'index'])->name('dashboard');

Route::post('/workbooks', [WorkbookController::class, 'store'])->name('workbooks.store');
Route::put('/workbooks/{workbook}', [WorkbookController::class, 'update'])->name('workbooks.update');
Route::get('/workbooks/{workbook}/download', [WorkbookController::class, 'download'])->name('workbooks.download');
Route::delete('/workbooks/{workbook}', [WorkbookController::class, 'destroy'])->name('workbooks.destroy');
