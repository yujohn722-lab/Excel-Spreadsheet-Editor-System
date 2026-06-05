<?php

namespace App\Services;

use App\Models\Workbook;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class WorkbookExcelService
{
    public function writeCurrentFile(Workbook $workbook): string
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($this->safeSheetTitle($workbook->sheet_name));

        $rows = $workbook->rows ?? [];
        $columns = $this->columnNames($workbook);

        foreach ($columns as $index => $column) {
            $cell = Coordinate::stringFromColumnIndex($index + 1).'1';
            $sheet->setCellValue($cell, $column);
            $sheet->getStyle($cell)->getFont()->setBold(true);
        }

        foreach ($rows as $rowIndex => $row) {
            foreach ($columns as $columnIndex => $column) {
                $cell = Coordinate::stringFromColumnIndex($columnIndex + 1).($rowIndex + 2);
                $sheet->setCellValue($cell, $row[$column] ?? null);
            }
        }

        foreach (range(1, max(count($columns), 1)) as $columnIndex) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($columnIndex))->setAutoSize(true);
        }

        $path = "workbooks/{$workbook->id}/current.xlsx";
        $absolutePath = Storage::disk('local')->path($path);
        $directory = dirname($absolutePath);

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        (new Xlsx($spreadsheet))->save($absolutePath);
        $spreadsheet->disconnectWorksheets();

        $workbook->forceFill([
            'current_file_path' => $path,
            'last_exported_at' => now(),
        ])->save();

        return $path;
    }

    public function downloadName(Workbook $workbook): string
    {
        $baseName = pathinfo($workbook->original_filename ?: $workbook->name, PATHINFO_FILENAME);
        $safeName = preg_replace('/[^A-Za-z0-9 _-]/', '', $baseName) ?: 'workbook';

        return trim($safeName).'-updated.xlsx';
    }

    private function columnNames(Workbook $workbook): array
    {
        $columns = collect($workbook->columns ?? [])
            ->pluck('name')
            ->filter()
            ->values()
            ->all();

        if ($columns !== []) {
            return $columns;
        }

        $firstRow = $workbook->rows[0] ?? [];

        return array_values(array_filter(array_keys($firstRow), fn (string $key) => $key !== '__rowId'));
    }

    private function safeSheetTitle(string $title): string
    {
        $safeTitle = preg_replace('/[\\\\\\/\\?\\*\\[\\]:]/', ' ', $title) ?: 'Sheet1';

        return mb_substr($safeTitle, 0, 31) ?: 'Sheet1';
    }
}
