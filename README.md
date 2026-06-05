# Excel Dashboard Builder

A workbook dashboard system inspired by the AdZU/QASMO reference design. It accepts Excel files, builds KPI cards and charts automatically, supports spreadsheet-style editing, and exports an updated workbook with a styled table.

## What It Can Do

- Upload `.xlsx` and `.xls` workbooks.
- Generate dashboard summaries from the uploaded data.
- Edit rows directly in the browser.
- Add and delete rows.
- Save workbook changes.
- Download an updated Excel file with a designed table.
- Search, filter, customize charts, and switch dark mode.

## Local Setup

1. Install the project dependencies:

   ```bash
   composer install
   npm install
   ```

2. Create the local environment file:

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. Update the database values in `.env`, then prepare the saved workbook tables:

   ```bash
   php artisan migrate
   ```

4. Start the app:

   ```bash
   composer run dev
   ```

5. Open the local app URL shown in the terminal, usually:

   ```text
   http://127.0.0.1:8000
   ```

## Workbook Export

Saving a workbook regenerates the downloadable Excel file. The exported file includes a formatted table with a dark blue header, borders, alternating row shading, filters, frozen headers, and readable column widths.

## Sync Notes

The app updates the downloadable Excel file after you save changes. If you edit the original Excel file outside the browser, upload it again so the dashboard can rebuild from the latest version.
