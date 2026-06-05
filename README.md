# Laravel Blade Excel Dashboard Builder

A Laravel + Blade dashboard builder inspired by the attached AdZU/QASMO reference design. The app accepts Excel workbooks, infers KPIs and charts, supports spreadsheet-like editing, and stores workbook snapshots in MySQL through Eloquent.

## Stack

- Laravel
- Blade
- MySQL
- JavaScript
- Tailwind CSS
- Chart.js
- SheetJS for browser-side `.xlsx` and `.xls` parsing
- PhpSpreadsheet for server-side `.xlsx` generation

## Local Setup

1. Install PHP dependencies:

   ```bash
   composer install
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Configure the app:

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   Update the MySQL values in `.env`.

4. Run migrations:

   ```bash
   php artisan migrate
   ```

5. Start Laravel and Vite:

   ```bash
   composer run dev
   ```

The UI keeps a local browser draft if the database is unavailable, then saves to MySQL when Laravel and the database are ready.

## Excel Sync Behavior

- Upload or re-upload Excel: the app parses the file in the browser, sends the workbook model to Laravel, and stores the uploaded source file metadata.
- Save workbook: Laravel saves rows/settings to MySQL and regenerates the server-side `current.xlsx` file.
- Download updated Excel: use the dashboard button to download the latest regenerated workbook.
- Live local-file watching is not possible in a browser-only app. The project now has sync metadata and UI space for a future OneDrive, SharePoint, Google Drive, or desktop-helper connector.
