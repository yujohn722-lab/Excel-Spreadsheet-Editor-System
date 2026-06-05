<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Excel Dashboard Builder') }}</title>

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body>
        <div class="min-h-screen bg-background">
            <header class="sticky top-0 z-40 border-b bg-card/95 shadow-soft backdrop-blur">
                <div class="flex h-[70px] items-center justify-between gap-4 px-4 sm:px-8">
                    <div class="flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-adzu-blue bg-white text-lg font-black text-adzu-blue shadow-soft">A</div>
                        <div class="leading-none">
                            <div class="font-serif text-3xl font-bold italic text-adzu-blue">AdZU</div>
                            <div class="-mt-1 text-[10px] font-semibold uppercase text-muted-foreground">Excel Dashboard Builder</div>
                        </div>
                    </div>

                    <nav class="hidden items-center gap-8 text-sm font-bold text-foreground lg:flex">
                        <a href="#dashboard" class="transition-colors hover:text-primary">Dashboard</a>
                        <a href="#spreadsheet" class="transition-colors hover:text-primary">Spreadsheet</a>
                        <a href="#sync" class="transition-colors hover:text-primary">Sync</a>
                        <a href="#database" class="transition-colors hover:text-primary">Database</a>
                    </nav>

                    <div class="flex items-center gap-2">
                        <button id="theme-toggle" class="inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold transition-colors hover:bg-accent" type="button" title="Toggle dark mode">DM</button>
                        <a href="#upload" class="hidden h-10 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 sm:inline-flex">New Workbook</a>
                    </div>
                </div>
            </header>

            <section class="adzu-hero relative overflow-hidden">
                <div class="absolute inset-y-0 right-0 hidden w-1/2 opacity-35 md:block">
                    <div class="adzu-paper h-full w-full"></div>
                </div>
                <div class="relative mx-auto flex min-h-[236px] max-w-[1440px] items-center px-6 py-10 sm:px-10 lg:px-14">
                    <div class="max-w-4xl text-white">
                        <div class="mb-5 inline-flex items-center rounded-full border border-white/45 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">Excel Dashboard Builder</div>
                        <h1 class="max-w-5xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">Excel Dashboard Builder Information System</h1>
                        <p class="mt-5 max-w-3xl text-base font-medium leading-7 text-white/90 sm:text-lg">Upload operational spreadsheets, refine live data, and publish institution-grade dashboard views from one Laravel Blade workspace.</p>
                    </div>
                </div>
            </section>

            <main class="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 lg:px-10">
                <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <a href="#upload" class="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-adzu-gray px-5 text-sm font-semibold text-adzu-ink transition-colors hover:bg-adzu-gray/80">Workbook Intake</a>
                    <a href="#dashboard" class="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-adzu-gray px-5 text-sm font-semibold text-adzu-ink transition-colors hover:bg-adzu-gray/80">Dashboard View</a>
                    <a href="#spreadsheet" class="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-adzu-gray px-5 text-sm font-semibold text-adzu-ink transition-colors hover:bg-adzu-gray/80">Spreadsheet Editor</a>
                    <a href="#sync" class="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-adzu-gray px-5 text-sm font-semibold text-adzu-ink transition-colors hover:bg-adzu-gray/80">Excel Sync</a>
                </div>

                <div class="mt-7 flex items-start gap-6">
                    <aside class="hidden w-[232px] shrink-0 lg:block">
                        <div class="sticky top-[92px] overflow-hidden rounded-lg border bg-card shadow-panel">
                            <div class="bg-adzu-blue px-5 py-4 text-white">
                                <p class="text-xs font-semibold uppercase opacity-80">Navigation</p>
                                <h2 class="mt-1 text-xl font-bold">QASMO Studio</h2>
                            </div>
                            <nav class="space-y-1 p-3">
                                <a href="#dashboard" class="flex items-center gap-3 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft">Builder</a>
                                <a href="#upload" class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent">Workbook</a>
                                <a href="#spreadsheet" class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent">Spreadsheet</a>
                                <a href="#customize" class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent">Customize</a>
                                <a href="#database" class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent">Database</a>
                            </nav>
                            <div class="border-t bg-muted/45 p-4">
                                <p class="text-xs font-semibold uppercase text-adzu-blue dark:text-blue-300">Stack</p>
                                <p class="mt-1 text-sm text-muted-foreground">Laravel Blade, MySQL, JavaScript, Tailwind.</p>
                            </div>
                        </div>
                    </aside>

                    <div class="min-w-0 flex-1 space-y-6">
                        <section id="dashboard" class="grid gap-6 xl:grid-cols-[1fr_330px]">
                            <div class="space-y-6">
                                <div id="upload" class="rounded-lg border border-dashed bg-card p-5 shadow-panel transition-colors">
                                    <input id="excel-input" class="sr-only" type="file" accept=".xlsx,.xls">
                                    <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div class="flex items-start gap-4">
                                            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">XL</div>
                                            <div>
                                                <div class="flex flex-wrap items-center gap-2">
                                                    <h2 class="text-xl font-extrabold text-adzu-blue dark:text-blue-300">Workbook Intake</h2>
                                                    <span class="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">.xlsx .xls</span>
                                                </div>
                                                <p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Drop a workbook here or browse to replace the active dashboard model.</p>
                                                <p id="upload-error" class="mt-2 hidden text-sm font-semibold text-destructive"></p>
                                            </div>
                                        </div>
                                        <button id="upload-button" class="inline-flex h-10 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90" type="button">Upload Excel</button>
                                    </div>
                                </div>

                                <div class="rounded-lg border bg-card p-4 shadow-panel">
                                    <div class="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
                                        <div class="space-y-2">
                                            <label for="search-input" class="text-sm font-semibold">Search</label>
                                            <input id="search-input" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Find records, offices, statuses...">
                                        </div>
                                        <div class="space-y-2">
                                            <label id="filter-one-label" class="text-sm font-semibold">Filter</label>
                                            <select id="filter-one" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft"></select>
                                        </div>
                                        <div class="space-y-2">
                                            <label id="filter-two-label" class="text-sm font-semibold">Filter</label>
                                            <select id="filter-two" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft"></select>
                                        </div>
                                        <div class="flex items-end">
                                            <button id="clear-filters" class="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold shadow-soft transition-colors hover:bg-accent lg:w-auto" type="button">Clear</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="database" class="rounded-lg border bg-card p-5 shadow-panel">
                                <div class="flex items-center gap-2">
                                    <div class="h-5 w-5 rounded bg-primary"></div>
                                    <h2 class="text-xl font-extrabold text-adzu-blue dark:text-blue-300">Database Record</h2>
                                </div>
                                <div id="database-status" class="mt-4 space-y-3 text-sm"></div>
                                <button id="save-workbook" class="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90" type="button">Save Workbook</button>
                                <button id="download-excel" class="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold shadow-soft transition-colors hover:bg-accent disabled:opacity-50" type="button">Download Updated Excel</button>
                                <p id="save-status" class="mt-3 text-xs font-semibold text-muted-foreground">Ready to save</p>
                                <div id="recent-workbooks" class="mt-5 border-t pt-4"></div>
                            </div>
                        </section>

                        <section id="kpi-grid" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"></section>

                        <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
                            <div class="rounded-lg border bg-card shadow-panel">
                                <div class="border-b p-5">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <h2 id="chart-title" class="text-2xl font-extrabold text-adzu-blue dark:text-blue-300">Dashboard Overview</h2>
                                        <span class="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">Interactive</span>
                                    </div>
                                    <p id="chart-subtitle" class="mt-2 text-sm text-muted-foreground"></p>
                                </div>
                                <div class="h-[330px] p-5">
                                    <canvas id="main-chart"></canvas>
                                </div>
                            </div>

                            <div id="customize" class="rounded-lg border bg-card shadow-panel">
                                <div class="border-b p-5">
                                    <h2 class="text-xl font-extrabold text-adzu-blue dark:text-blue-300">Dashboard Controls</h2>
                                    <p class="mt-2 text-sm text-muted-foreground">Configuration is stored with the workbook record.</p>
                                </div>
                                <div class="space-y-4 p-5">
                                    <div class="grid gap-2">
                                        <label class="text-sm font-semibold">Chart Type</label>
                                        <select id="chart-type" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft">
                                            <option value="bar">Bar</option>
                                            <option value="line">Line</option>
                                            <option value="pie">Donut</option>
                                        </select>
                                    </div>
                                    <div class="grid gap-2">
                                        <label class="text-sm font-semibold">Dimension</label>
                                        <select id="dimension-field" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft"></select>
                                    </div>
                                    <div class="grid gap-2">
                                        <label class="text-sm font-semibold">Metric</label>
                                        <select id="metric-field" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft"></select>
                                    </div>
                                    <div class="grid gap-2">
                                        <label class="text-sm font-semibold">Date Field</label>
                                        <select id="date-field" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft"></select>
                                    </div>
                                    <label class="flex items-center justify-between rounded-md bg-muted/55 p-3 text-sm font-semibold">
                                        Trend Mode
                                        <input id="trend-mode" type="checkbox" class="h-5 w-5">
                                    </label>
                                    <label class="flex items-center justify-between rounded-md bg-muted/55 p-3 text-sm font-semibold">
                                        Compact Density
                                        <input id="density-mode" type="checkbox" class="h-5 w-5">
                                    </label>
                                </div>
                            </div>
                        </section>

                        <section id="spreadsheet" class="rounded-lg border bg-card shadow-panel">
                            <div class="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 class="text-2xl font-extrabold text-adzu-blue dark:text-blue-300">Editable Workbook Table</h2>
                                    <p id="table-summary" class="mt-2 text-sm text-muted-foreground"></p>
                                </div>
                                <button id="add-row" class="inline-flex h-10 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90" type="button">Add Row</button>
                            </div>
                            <div class="max-h-[430px] overflow-auto scrollbar-thin">
                                <table class="w-full caption-bottom text-sm">
                                    <thead id="table-head" class="sticky top-0 z-10 bg-muted"></thead>
                                    <tbody id="table-body"></tbody>
                                </table>
                            </div>
                        </section>

                        <section id="sync" class="grid gap-5 lg:grid-cols-[1fr_330px]">
                            <div class="rounded-lg border bg-card p-6 shadow-panel">
                                <div class="flex flex-wrap items-center gap-2">
                                    <h2 class="text-2xl font-extrabold text-adzu-blue dark:text-blue-300">Excel Sync Center</h2>
                                    <span id="sync-mode-badge" class="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">manual_upload</span>
                                </div>
                                <div id="sync-tiles" class="mt-5 grid gap-3 sm:grid-cols-3"></div>
                            </div>
                            <div class="rounded-lg border bg-card p-6 shadow-panel">
                                <h2 class="text-2xl font-extrabold text-adzu-blue dark:text-blue-300">Cloud Connector</h2>
                                <div class="mt-5 space-y-3">
                                    <div class="rounded-full bg-muted px-5 py-3 text-center text-sm font-extrabold leading-tight text-muted-foreground">OneDrive / SharePoint</div>
                                    <div class="rounded-full bg-muted px-5 py-3 text-center text-sm font-extrabold leading-tight text-muted-foreground">Google Drive</div>
                                    <div class="rounded-full bg-muted px-5 py-3 text-center text-sm font-extrabold leading-tight text-muted-foreground">Local Desktop Helper</div>
                                </div>
                            </div>
                        </section>

                        <section class="grid gap-5 lg:grid-cols-[1fr_330px]">
                            <div class="rounded-lg border bg-card p-6 shadow-panel">
                                <div class="flex flex-wrap items-center gap-2">
                                    <h2 class="text-2xl font-extrabold text-adzu-blue dark:text-blue-300">Workbook Quality Profile</h2>
                                    <span class="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">Auto-generated</span>
                                </div>
                                <div id="quality-profile" class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"></div>
                            </div>
                            <div class="rounded-lg border bg-card p-6 shadow-panel">
                                <h2 class="text-2xl font-extrabold text-adzu-blue dark:text-blue-300">Programs and Services</h2>
                                <div class="mt-5 space-y-3">
                                    <div class="rounded-full bg-primary px-5 py-3 text-center text-sm font-extrabold leading-tight text-primary-foreground shadow-soft">Institutional Strategic Management</div>
                                    <div class="rounded-full bg-primary px-5 py-3 text-center text-sm font-extrabold leading-tight text-primary-foreground shadow-soft">Internal Quality Assurance</div>
                                    <div class="rounded-full bg-primary px-5 py-3 text-center text-sm font-extrabold leading-tight text-primary-foreground shadow-soft">External Quality Assurance</div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <footer class="mt-10">
                <div class="border-y bg-muted px-4 py-3 text-center text-sm font-semibold text-muted-foreground">qasmo@adzu.edu.ph | 991-0871 loc. 2100 | Room 207, Fr Carretero SJ Building</div>
                <div class="bg-adzu-blue px-4 py-8 text-center text-sm text-white">
                    <p class="font-semibold">Ateneo de Zamboanga University | Laravel Blade Excel Dashboard Builder</p>
                    <p class="mt-2 text-white/75">Laravel, Blade, MySQL, JavaScript, Tailwind CSS, Chart.js, and PhpSpreadsheet.</p>
                </div>
            </footer>
        </div>

        <script>
            window.dashboardPayload = {
                csrfToken: @json(csrf_token()),
                initialWorkbook: @json($initialWorkbook),
                workbookSummaries: @json($workbookSummaries),
            };
        </script>
    </body>
</html>
