<?php

namespace App\Http\Controllers;

use App\Models\Workbook;
use App\Services\WorkbookExcelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class WorkbookController extends Controller
{
    public function __construct(private readonly WorkbookExcelService $excelService)
    {
        //
    }

    public function index(): View
    {
        $latestWorkbook = Workbook::query()
            ->latest('updated_at')
            ->first();

        return view('dashboard', [
            'initialWorkbook' => $latestWorkbook,
            'workbookSummaries' => Workbook::query()
                ->latest('updated_at')
                ->limit(12)
                ->get(['id', 'name', 'sheet_name', 'original_filename', 'sync_mode', 'updated_at']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedWorkbook($request);

        $workbook = Workbook::query()->create($data);
        $this->storeUploadedExcelFile($request, $workbook);
        $this->excelService->writeCurrentFile($workbook->fresh());

        return response()->json([
            'workbook' => $workbook->fresh(),
            'message' => 'Workbook saved.',
        ], 201);
    }

    public function update(Request $request, Workbook $workbook): JsonResponse
    {
        $workbook->update($this->validatedWorkbook($request));
        $this->storeUploadedExcelFile($request, $workbook);
        $this->excelService->writeCurrentFile($workbook->fresh());

        return response()->json([
            'workbook' => $workbook->fresh(),
            'message' => 'Workbook updated.',
        ]);
    }

    public function download(Workbook $workbook): BinaryFileResponse
    {
        $path = $workbook->current_file_path;

        if (! $path || ! Storage::disk('local')->exists($path)) {
            $path = $this->excelService->writeCurrentFile($workbook);
        }

        return response()->download(
            Storage::disk('local')->path($path),
            $this->excelService->downloadName($workbook)
        );
    }

    public function destroy(Workbook $workbook): JsonResponse
    {
        Storage::disk('local')->deleteDirectory("workbooks/{$workbook->id}");
        $workbook->delete();

        return response()->json([
            'message' => 'Workbook deleted.',
        ]);
    }

    private function validatedWorkbook(Request $request): array
    {
        $request->merge([
            'columns' => $this->decodeJsonField($request->input('columns', [])),
            'rows' => $this->decodeJsonField($request->input('rows', [])),
            'config' => $this->decodeJsonField($request->input('config')),
        ]);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sheet_name' => ['required', 'string', 'max:255'],
            'columns' => ['required', 'array'],
            'rows' => ['required', 'array'],
            'config' => ['nullable', 'array'],
            'excel_file' => ['nullable', 'file', 'mimes:xlsx,xls', 'max:51200'],
            'sync_mode' => ['nullable', 'string', 'max:80'],
            'external_source_url' => ['nullable', 'string', 'max:2048'],
            'external_sync_status' => ['nullable', 'string', 'max:120'],
        ]);

        unset($data['excel_file']);

        return $data;
    }

    private function storeUploadedExcelFile(Request $request, Workbook $workbook): void
    {
        if (! $request->hasFile('excel_file')) {
            return;
        }

        $file = $request->file('excel_file');
        $extension = $file->getClientOriginalExtension() ?: 'xlsx';
        $path = $file->storeAs("workbooks/{$workbook->id}", "source.{$extension}", 'local');
        $realPath = $file->getRealPath();

        $workbook->forceFill([
            'original_filename' => $file->getClientOriginalName(),
            'original_file_path' => $path,
            'file_mime' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'file_hash' => $realPath ? hash_file('sha256', $realPath) : null,
            'last_imported_at' => now(),
            'sync_mode' => $request->string('sync_mode')->toString() ?: 'manual_upload',
            'external_source_url' => $request->input('external_source_url'),
            'external_sync_status' => $request->input('external_sync_status', 'Stored file sync'),
        ])->save();
    }

    private function decodeJsonField(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }
}
