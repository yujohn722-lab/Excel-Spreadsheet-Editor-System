<?php

namespace App\Services;

use App\Models\Workbook;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Table;
use PhpOffice\PhpSpreadsheet\Worksheet\Table\TableStyle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
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
        $columnTypes = $this->columnTypes($workbook);

        foreach ($columns as $index => $column) {
            $cell = Coordinate::stringFromColumnIndex($index + 1).'1';
            $sheet->setCellValue($cell, $column);
        }

        foreach ($rows as $rowIndex => $row) {
            foreach ($columns as $columnIndex => $column) {
                $cell = Coordinate::stringFromColumnIndex($columnIndex + 1).($rowIndex + 2);
                $this->writeCellValue($sheet, $cell, $row[$column] ?? null, $columnTypes[$column] ?? null);
            }
        }

        $this->applyDesignedTable($sheet, $columns, $rows, $columnTypes);

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

        $fallbackColumns = array_values(array_filter(array_keys($firstRow), fn (string $key) => $key !== '__rowId'));

        return $fallbackColumns !== [] ? $fallbackColumns : ['Record'];
    }

    private function columnTypes(Workbook $workbook): array
    {
        return collect($workbook->columns ?? [])
            ->filter(fn (mixed $column) => is_array($column) && isset($column['name']))
            ->mapWithKeys(fn (array $column) => [$column['name'] => $column['type'] ?? 'text'])
            ->all();
    }

    private function writeCellValue(Worksheet $sheet, string $cell, mixed $value, ?string $type): void
    {
        if ($value === null || $value === '') {
            $sheet->setCellValue($cell, null);

            return;
        }

        if ($type === 'number' && is_numeric($value)) {
            $sheet->setCellValue($cell, (float) $value);

            return;
        }

        if ($type === 'date') {
            $date = $this->dateValue($value);

            if ($date) {
                $sheet->setCellValue($cell, ExcelDate::PHPToExcel($date));

                return;
            }
        }

        if ($type === 'boolean') {
            $boolean = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            $sheet->setCellValue($cell, $boolean ?? $value);

            return;
        }

        $sheet->setCellValueExplicit($cell, (string) $value, DataType::TYPE_STRING);
    }

    private function applyDesignedTable(Worksheet $sheet, array $columns, array $rows, array $columnTypes): void
    {
        $lastColumn = Coordinate::stringFromColumnIndex(max(count($columns), 1));
        $lastRow = max(count($rows) + 1, 1);
        $headerRange = "A1:{$lastColumn}1";
        $tableRange = "A1:{$lastColumn}{$lastRow}";

        $sheet->freezePane('A2');
        $sheet->getSheetView()->setZoomScale(92);
        $sheet->getTabColor()->setRGB('2367F3');
        $sheet->getRowDimension(1)->setRowHeight(28);

        $sheet->getStyle($tableRange)->applyFromArray([
            'font' => [
                'name' => 'Aptos',
                'size' => 11,
                'color' => ['argb' => 'FF05133D'],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'FFD8E3F1'],
                ],
            ],
        ]);

        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['argb' => 'FFFFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF003C8F'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        for ($row = 2; $row <= $lastRow; $row++) {
            $sheet->getRowDimension($row)->setRowHeight(22);

            if ($row % 2 === 0) {
                $sheet->getStyle("A{$row}:{$lastColumn}{$row}")
                    ->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()
                    ->setARGB('FFF4F8FF');
            }
        }

        foreach ($columns as $index => $column) {
            $letter = Coordinate::stringFromColumnIndex($index + 1);
            $sheet->getColumnDimension($letter)->setWidth($this->columnWidth($column, $rows));

            if ($lastRow < 2) {
                continue;
            }

            $range = "{$letter}2:{$letter}{$lastRow}";

            if (($columnTypes[$column] ?? null) === 'date') {
                $sheet->getStyle($range)->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_DATE_YYYYMMDD);
            }

            if (($columnTypes[$column] ?? null) === 'number') {
                $sheet->getStyle($range)->getNumberFormat()->setFormatCode('#,##0.##');
            }
        }

        if ($lastRow > 1) {
            $table = new Table($tableRange, 'WorkbookTable');
            $tableStyle = new TableStyle(TableStyle::TABLE_STYLE_MEDIUM2);
            $tableStyle->setShowRowStripes(true);
            $table->setStyle($tableStyle);
            $sheet->addTable($table);

            return;
        }

        $sheet->setAutoFilter($tableRange);
    }

    private function columnWidth(string $column, array $rows): int
    {
        $maxLength = mb_strlen($column);

        foreach (array_slice($rows, 0, 50) as $row) {
            $maxLength = max($maxLength, mb_strlen((string) ($row[$column] ?? '')));
        }

        return min(max($maxLength + 3, 12), 36);
    }

    private function dateValue(mixed $value): ?\DateTimeImmutable
    {
        if ($value instanceof \DateTimeImmutable) {
            return $value;
        }

        if ($value instanceof \DateTimeInterface) {
            return \DateTimeImmutable::createFromInterface($value);
        }

        if (is_numeric($value)) {
            return null;
        }

        try {
            return new \DateTimeImmutable((string) $value);
        } catch (\Exception) {
            return null;
        }
    }

    private function safeSheetTitle(string $title): string
    {
        $safeTitle = preg_replace('/[\\\\\\/\\?\\*\\[\\]:]/', ' ', $title) ?: 'Sheet1';

        return mb_substr($safeTitle, 0, 31) ?: 'Sheet1';
    }
}
