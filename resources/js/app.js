import '../css/app.css';
import Chart from 'chart.js/auto';
import * as XLSX from 'xlsx';

const payload = window.dashboardPayload || {};
const csrfToken = payload.csrfToken || document.querySelector('meta[name="csrf-token"]')?.content || '';
const localDraftKey = 'excel-dashboard-builder:draft';
const legacyDraftKey = 'blade-excel-dashboard-builder:draft';

const sampleRows = [
  { __rowId: 'sample-1', Program: 'Institutional Strategic Management', Office: 'QASMO', Cycle: 'S.Y. 2024-2025', Status: 'Completed', Budget: 285000, Participants: 96, Completion: 100, 'Quality Score': 94, Date: '2025-03-18' },
  { __rowId: 'sample-2', Program: 'Internal Quality Assurance', Office: 'Academic Affairs', Cycle: 'S.Y. 2024-2025', Status: 'Completed', Budget: 142000, Participants: 58, Completion: 100, 'Quality Score': 91, Date: '2025-04-11' },
  { __rowId: 'sample-3', Program: 'External Quality Assurance', Office: 'Graduate School', Cycle: 'S.Y. 2024-2025', Status: 'In Progress', Budget: 198000, Participants: 44, Completion: 76, 'Quality Score': 88, Date: '2025-05-02' },
  { __rowId: 'sample-4', Program: 'Evaluation Tool Development', Office: 'College Deans', Cycle: 'S.Y. 2025-2026', Status: 'In Progress', Budget: 94000, Participants: 39, Completion: 64, 'Quality Score': 86, Date: '2025-07-16' },
  { __rowId: 'sample-5', Program: 'Operations Manual Workshop', Office: 'Administrative Services', Cycle: 'S.Y. 2025-2026', Status: 'Planned', Budget: 76000, Participants: 28, Completion: 22, 'Quality Score': 81, Date: '2025-09-09' },
  { __rowId: 'sample-6', Program: 'Accreditation Readiness', Office: 'Basic Education', Cycle: 'S.Y. 2025-2026', Status: 'In Progress', Budget: 168000, Participants: 62, Completion: 71, 'Quality Score': 89, Date: '2025-10-21' },
  { __rowId: 'sample-7', Program: 'Strategic Plan Monitoring', Office: "President's Council", Cycle: 'S.Y. 2025-2026', Status: 'Completed', Budget: 121000, Participants: 34, Completion: 100, 'Quality Score': 96, Date: '2025-11-17' },
  { __rowId: 'sample-8', Program: 'Quality Culture Seminar', Office: 'Human Resources', Cycle: 'S.Y. 2025-2026', Status: 'Planned', Budget: 54000, Participants: 80, Completion: 18, 'Quality Score': 84, Date: '2025-12-18' }
];

const colors = ['#2367f3', '#06c76f', '#ffdc5e', '#9bc7e4', '#5d6bf5', '#003c8f', '#84cc16', '#38bdf8'];

let workbook = payload.initialWorkbook ? fromSavedWorkbook(payload.initialWorkbook) : createSampleWorkbook();
let pendingExcelFile = null;
let search = '';
let filters = {};
let chart = null;
let revealObserver = null;

const els = {
  themeToggle: document.getElementById('theme-toggle'),
  uploadPanel: document.getElementById('upload'),
  uploadButton: document.getElementById('upload-button'),
  excelInput: document.getElementById('excel-input'),
  uploadError: document.getElementById('upload-error'),
  searchInput: document.getElementById('search-input'),
  filterOne: document.getElementById('filter-one'),
  filterTwo: document.getElementById('filter-two'),
  filterOneLabel: document.getElementById('filter-one-label'),
  filterTwoLabel: document.getElementById('filter-two-label'),
  clearFilters: document.getElementById('clear-filters'),
  databaseStatus: document.getElementById('database-status'),
  saveButton: document.getElementById('save-workbook'),
  downloadButton: document.getElementById('download-excel'),
  saveStatus: document.getElementById('save-status'),
  recentWorkbooks: document.getElementById('recent-workbooks'),
  kpiGrid: document.getElementById('kpi-grid'),
  chartTitle: document.getElementById('chart-title'),
  chartSubtitle: document.getElementById('chart-subtitle'),
  chartCanvas: document.getElementById('main-chart'),
  chartType: document.getElementById('chart-type'),
  dimensionField: document.getElementById('dimension-field'),
  metricField: document.getElementById('metric-field'),
  dateField: document.getElementById('date-field'),
  trendMode: document.getElementById('trend-mode'),
  densityMode: document.getElementById('density-mode'),
  tableSummary: document.getElementById('table-summary'),
  tableHead: document.getElementById('table-head'),
  tableBody: document.getElementById('table-body'),
  addRow: document.getElementById('add-row'),
  syncModeBadge: document.getElementById('sync-mode-badge'),
  syncTiles: document.getElementById('sync-tiles'),
  qualityProfile: document.getElementById('quality-profile')
};

hydrateDraft();
bindEvents();
initializeMotion();
render();

function bindEvents() {
  els.themeToggle?.addEventListener('click', () => {
    const nextMode = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextMode);
    localStorage.setItem('dashboard-theme', nextMode ? 'dark' : 'light');
  });

  document.documentElement.classList.toggle('dark', localStorage.getItem('dashboard-theme') === 'dark');

  els.uploadButton?.addEventListener('click', () => els.excelInput?.click());
  els.excelInput?.addEventListener('change', (event) => handleExcelFile(event.target.files?.[0]));

  ['dragover', 'drop'].forEach((type) => {
    els.uploadPanel?.addEventListener(type, (event) => event.preventDefault());
  });
  els.uploadPanel?.addEventListener('dragenter', () => els.uploadPanel.classList.add('border-primary', 'bg-accent'));
  els.uploadPanel?.addEventListener('dragleave', () => els.uploadPanel.classList.remove('border-primary', 'bg-accent'));
  els.uploadPanel?.addEventListener('drop', (event) => {
    els.uploadPanel.classList.remove('border-primary', 'bg-accent');
    handleExcelFile(event.dataTransfer?.files?.[0]);
  });

  els.searchInput?.addEventListener('input', (event) => {
    search = event.target.value;
    render();
  });

  els.filterOne?.addEventListener('change', () => updateFilterFromSelect(els.filterOne));
  els.filterTwo?.addEventListener('change', () => updateFilterFromSelect(els.filterTwo));
  els.clearFilters?.addEventListener('click', () => {
    search = '';
    filters = {};
    els.searchInput.value = '';
    render();
  });

  els.chartType?.addEventListener('change', () => {
    workbook.config.chartType = els.chartType.value;
    setUnsaved('Unsaved dashboard settings');
    render();
  });
  els.dimensionField?.addEventListener('change', () => {
    workbook.config.dimension = els.dimensionField.value;
    setUnsaved('Unsaved dashboard settings');
    render();
  });
  els.metricField?.addEventListener('change', () => {
    workbook.config.metric = els.metricField.value;
    setUnsaved('Unsaved dashboard settings');
    render();
  });
  els.dateField?.addEventListener('change', () => {
    workbook.config.dateColumn = els.dateField.value === 'none' ? null : els.dateField.value;
    setUnsaved('Unsaved dashboard settings');
    render();
  });
  els.trendMode?.addEventListener('change', () => {
    workbook.config.showTrend = els.trendMode.checked;
    setUnsaved('Unsaved dashboard settings');
    render();
  });
  els.densityMode?.addEventListener('change', () => {
    workbook.config.density = els.densityMode.checked ? 'compact' : 'comfortable';
    setUnsaved('Unsaved dashboard settings');
    render();
  });

  els.addRow?.addEventListener('click', () => {
    workbook.rows.push(emptyRow(workbook.columns));
    refreshColumns();
    setUnsaved('Unsaved changes');
    render();
  });

  els.saveButton?.addEventListener('click', saveWorkbook);
  els.downloadButton?.addEventListener('click', () => {
    if (!workbook.id) {
      setStatus('Save workbook before downloading Excel');
      return;
    }
    window.location.href = `/workbooks/${workbook.id}/download`;
  });
}

function initializeMotion() {
  bindTraversalLinks();
  setupRevealObserver();
  updateScrollProgress();
  updateActiveTraversal();

  window.addEventListener('scroll', () => {
    updateScrollProgress();
    updateActiveTraversal();
  }, { passive: true });

  window.addEventListener('resize', updateScrollProgress);
}

function bindTraversalLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.classList.add('traverse-link');

    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      const target = hash ? document.getElementById(hash.slice(1)) : null;

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.classList.remove('nav-traversing');
      void target.offsetWidth;
      target.classList.add('nav-traversing');
      window.history.pushState(null, '', hash);
      setActiveTraversal(hash);

      window.setTimeout(() => target.classList.remove('nav-traversing'), 520);
    });
  });
}

function setupRevealObserver() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal-on-scroll').forEach((element) => element.classList.add('is-visible'));
    return;
  }

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add('is-visible');
      revealObserver?.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
}

function refreshMotion() {
  window.requestAnimationFrame(() => {
    document.querySelectorAll('.reveal-on-scroll:not([data-reveal-ready])').forEach((element) => {
      element.dataset.revealReady = 'true';
      revealObserver ? revealObserver.observe(element) : element.classList.add('is-visible');
    });
  });
}

function updateScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
  document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
}

function updateActiveTraversal() {
  const targetIds = [...new Set([...document.querySelectorAll('a[href^="#"]')]
    .map((link) => link.getAttribute('href')?.slice(1))
    .filter(Boolean))];
  const targets = targetIds
    .map((id) => document.getElementById(id))
    .filter((element) => element && element.offsetParent !== null);
  const active = targets
    .filter((element) => element.getBoundingClientRect().top <= 128)
    .pop();

  if (active) {
    setActiveTraversal(`#${active.id}`);
  }
}

function setActiveTraversal(hash) {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === hash);
  });
}

async function handleExcelFile(file) {
  hideUploadError();
  if (!file) {
    return;
  }
  if (!/\.(xlsx|xls)$/i.test(file.name)) {
    showUploadError('Select an .xlsx or .xls workbook.');
    return;
  }

  try {
    const parsedWorkbook = await parseExcelFile(file);
    workbook = {
      ...parsedWorkbook,
      originalFilename: file.name,
      syncMode: 'manual_upload',
      externalSyncStatus: 'Pending save'
    };
    pendingExcelFile = file;
    search = '';
    filters = {};
    els.searchInput.value = '';
    setStatus('Workbook loaded; save to update stored Excel');
    render();
  } catch (error) {
    showUploadError(error.message || 'The workbook could not be parsed.');
  }
}

async function parseExcelFile(file) {
  const buffer = await file.arrayBuffer();
  const parsed = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = parsed.SheetNames[0];
  if (!sheetName) {
    throw new Error('No worksheet found in the selected file.');
  }

  const sheet = parsed.Sheets[sheetName];
  const records = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  const rows = records.map((record) => {
    const row = { __rowId: createRowId() };
    Object.entries(record).forEach(([key, value]) => {
      row[String(key).trim() || 'Column'] = normalizeCell(value);
    });
    return row;
  });

  if (!rows.length) {
    throw new Error('The selected worksheet does not contain table rows.');
  }

  const columns = inferColumns(rows);
  return {
    name: file.name.replace(/\.(xlsx|xls)$/i, ''),
    sheetName,
    rows,
    columns,
    config: createDashboardConfig(rows, columns),
    updatedAt: new Date().toISOString()
  };
}

async function saveWorkbook() {
  localStorage.setItem(localDraftKey, JSON.stringify(workbook));
  setStatus('Saving...');

  try {
    const body = buildSavePayload();
    const response = await fetch(workbook.id ? `/workbooks/${workbook.id}` : '/workbooks', {
      method: workbook.id && pendingExcelFile ? 'POST' : workbook.id ? 'PUT' : 'POST',
      headers: pendingExcelFile
        ? { Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken }
        : { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
      body: pendingExcelFile ? body : JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Database is unavailable');
    }

    const result = await response.json();
    workbook = fromSavedWorkbook(result.workbook);
    pendingExcelFile = null;
    localStorage.setItem(localDraftKey, JSON.stringify(workbook));
    setStatus('Saved and updated Excel file');
    render();
  } catch (error) {
    setStatus('Local draft saved; storage is not connected');
  }
}

function buildSavePayload() {
  const model = {
    name: workbook.name,
    sheet_name: workbook.sheetName,
    columns: workbook.columns,
    rows: stripInternalKeys(workbook.rows),
    config: workbook.config,
    sync_mode: pendingExcelFile ? 'manual_upload' : workbook.syncMode || 'stored_file',
    external_source_url: workbook.externalSourceUrl || null,
    external_sync_status: pendingExcelFile ? 'Stored file sync' : workbook.externalSyncStatus || 'Stored file sync'
  };

  if (!pendingExcelFile) {
    return model;
  }

  const formData = new FormData();
  formData.append('_method', workbook.id ? 'PUT' : 'POST');
  Object.entries(model).forEach(([key, value]) => {
    formData.append(key, typeof value === 'object' && value !== null ? JSON.stringify(value) : value ?? '');
  });
  formData.append('excel_file', pendingExcelFile);
  return formData;
}

function render() {
  refreshColumns();
  const visibleRows = filterRows(workbook.rows, search, filters);

  renderFilters();
  renderDatabase(visibleRows);
  renderKpis(visibleRows);
  renderControls();
  renderChart(visibleRows);
  renderTable(visibleRows);
  renderSync();
  renderQualityProfile();
  refreshMotion();
  updateScrollProgress();
  updateActiveTraversal();
}

function renderFilters() {
  const dimensions = dimensionColumns(workbook.columns).slice(0, 2);
  renderFilterSelect(els.filterOne, els.filterOneLabel, dimensions[0]);
  renderFilterSelect(els.filterTwo, els.filterTwoLabel, dimensions[1]);
}

function renderFilterSelect(select, label, column) {
  if (!select || !label) {
    return;
  }

  if (!column) {
    label.textContent = 'Filter';
    select.innerHTML = '<option value="all">No field</option>';
    select.disabled = true;
    return;
  }

  select.disabled = false;
  select.dataset.column = column.name;
  label.textContent = column.name;
  select.innerHTML = `<option value="all">All ${escapeHtml(column.name)}</option>${distinctValues(workbook.rows, column.name)
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join('')}`;
  select.value = filters[column.name] || 'all';
}

function updateFilterFromSelect(select) {
  const column = select?.dataset?.column;
  if (!column) {
    return;
  }
  filters[column] = select.value;
  render();
}

function renderDatabase(visibleRows) {
  els.databaseStatus.innerHTML = [
    statusLine('Workbook', workbook.name),
    statusLine('Sheet', workbook.sheetName),
    statusLine('Excel file', pendingExcelFile?.name || workbook.originalFilename || 'Not stored yet'),
    statusLine('Rows', String(workbook.rows.length)),
    statusLine('Visible', String(visibleRows.length)),
    statusLine('File sync', pendingExcelFile ? 'Re-upload pending' : workbook.currentFilePath ? 'Current XLSX ready' : 'Save required')
  ].join('');

  els.downloadButton.disabled = !workbook.id;

  const summaries = payload.workbookSummaries || [];
  if (!summaries.length) {
    els.recentWorkbooks.innerHTML = '';
    return;
  }

  els.recentWorkbooks.innerHTML = `
    <p class="text-xs font-bold uppercase text-muted-foreground">Recent Workbooks</p>
    <div class="mt-3 space-y-2">
      ${summaries
        .slice(0, 3)
        .map((summary) => `
          <div class="motion-card rounded-md bg-muted/55 px-3 py-2 text-xs">
            <p class="truncate font-bold">${escapeHtml(summary.name)}</p>
            <p class="truncate text-muted-foreground">${escapeHtml(summary.original_filename || summary.sheet_name)}</p>
          </div>
        `)
        .join('')}
    </div>
  `;
}

function renderKpis(visibleRows) {
  const kpis = generateKpis(visibleRows, workbook.columns, workbook.config.metric);
  const toneClass = {
    blue: 'bg-primary text-primary-foreground',
    green: 'bg-emerald-500 text-white',
    yellow: 'bg-yellow-300 text-slate-900',
    sky: 'bg-sky-200 text-slate-900'
  };
  const sizeClass = workbook.config.density === 'compact' ? 'h-20 w-20 text-xl' : 'h-24 w-24 text-2xl';

  els.kpiGrid.innerHTML = kpis
    .map((kpi) => `
      <div class="motion-card reveal-on-scroll rounded-lg border bg-card p-4 shadow-panel">
        <div class="flex items-center gap-4">
          <div class="flex shrink-0 items-center justify-center rounded-full text-center font-extrabold shadow-soft ${sizeClass} ${toneClass[kpi.tone]}">${escapeHtml(kpi.value)}</div>
          <div class="min-w-0">
            <p class="text-sm font-bold uppercase text-muted-foreground">${escapeHtml(kpi.label)}</p>
            <p class="mt-2 text-sm leading-5 text-muted-foreground">${escapeHtml(kpi.helper)}</p>
          </div>
        </div>
      </div>
    `)
    .join('');
}

function renderControls() {
  setSelectValue(els.chartType, workbook.config.chartType || 'bar', ['bar', 'line', 'pie']);
  setOptions(els.dimensionField, dimensionColumns(workbook.columns).map((column) => column.name), workbook.config.dimension);
  setOptions(els.metricField, numericColumns(workbook.columns).map((column) => column.name), workbook.config.metric);
  setOptions(els.dateField, ['none', ...workbook.columns.filter((column) => column.type === 'date').map((column) => column.name)], workbook.config.dateColumn || 'none');
  els.trendMode.checked = Boolean(workbook.config.showTrend);
  els.densityMode.checked = workbook.config.density === 'compact';
}

function renderChart(visibleRows) {
  const categorySeries = buildCategorySeries(visibleRows, workbook.config.dimension, workbook.config.metric);
  const trendSeries = buildTrendSeries(visibleRows, workbook.config.dateColumn, workbook.config.metric);
  const useTrend = workbook.config.showTrend && trendSeries.length > 1;
  const series = useTrend ? trendSeries : categorySeries;
  const chartType = useTrend ? 'line' : workbook.config.chartType === 'pie' ? 'doughnut' : workbook.config.chartType || 'bar';

  els.chartTitle.textContent = workbook.config.title || 'Dashboard Overview';
  els.chartSubtitle.textContent = `${workbook.config.metric || 'Metric'} by ${workbook.config.dimension || 'record'} from ${visibleRows.length} visible rows`;

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(els.chartCanvas, {
    type: chartType,
    data: {
      labels: series.map((point) => point.label),
      datasets: [
        {
          label: workbook.config.metric || 'Value',
          data: series.map((point) => point.value),
          borderColor: '#2367f3',
          backgroundColor: chartType === 'doughnut' ? series.map((_, index) => colors[index % colors.length]) : 'rgba(35, 103, 243, 0.72)',
          borderWidth: 3,
          tension: 0.35,
          borderRadius: chartType === 'bar' ? 6 : 0
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: chartType === 'doughnut' },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${formatNumber(Number(context.raw))}`
          }
        }
      },
      scales: chartType === 'doughnut' ? {} : {
        x: { grid: { display: false } },
        y: { ticks: { callback: (value) => formatNumber(Number(value)) } }
      }
    }
  });

  els.chartCanvas.classList.remove('chart-pulse');
  void els.chartCanvas.offsetWidth;
  els.chartCanvas.classList.add('chart-pulse');
}

function renderTable(visibleRows) {
  els.tableSummary.textContent = `${visibleRows.length} visible rows can be edited directly in the grid.`;
  els.tableHead.innerHTML = `
    <tr class="border-b">
      ${workbook.columns.map((column) => `<th class="h-11 min-w-[170px] px-3 text-left align-middle text-xs font-bold uppercase text-muted-foreground">${escapeHtml(column.name)}</th>`).join('')}
      <th class="h-11 w-14 px-3"></th>
    </tr>
  `;

  const compact = workbook.config.density === 'compact';
  els.tableBody.innerHTML = visibleRows.length
    ? visibleRows
        .map((row) => `
          <tr class="fade-in-row border-b transition-colors hover:bg-muted/50 ${compact ? 'h-10' : 'h-12'}" style="--reveal-delay: ${Math.min(220, visibleRows.indexOf(row) * 24)}ms" data-row-id="${row.__rowId}">
            ${workbook.columns
              .map((column) => `
                <td class="px-3 ${compact ? 'py-1' : 'py-2'} align-middle">
                  <input class="cell-input flex ${compact ? 'h-8' : 'h-10'} min-w-[150px] w-full rounded-md border border-transparent bg-transparent px-3 py-2 text-sm shadow-none hover:border-input focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    data-column="${escapeHtml(column.name)}"
                    data-type="${column.type}"
                    type="${column.type === 'number' ? 'number' : 'text'}"
                    value="${escapeHtml(row[column.name] ?? '')}">
                </td>
              `)
              .join('')}
            <td class="px-3 py-2 align-middle">
              <button class="delete-row inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold text-destructive hover:bg-accent" type="button">Del</button>
            </td>
          </tr>
        `)
        .join('')
    : `<tr><td colspan="${workbook.columns.length + 1}" class="h-24 text-center text-muted-foreground">No rows match the active filters.</td></tr>`;

  els.tableBody.querySelectorAll('.cell-input').forEach((input) => {
    input.addEventListener('change', (event) => {
      const rowId = event.target.closest('tr').dataset.rowId;
      const column = event.target.dataset.column;
      const type = event.target.dataset.type;
      const row = workbook.rows.find((item) => item.__rowId === rowId);
      if (!row) {
        return;
      }
      row[column] = normalizeEditedValue(event.target.value, type);
      refreshColumns();
      setUnsaved('Unsaved changes');
      render();
    });
  });

  els.tableBody.querySelectorAll('.delete-row').forEach((button) => {
    button.addEventListener('click', (event) => {
      const rowId = event.target.closest('tr').dataset.rowId;
      workbook.rows = workbook.rows.filter((row) => row.__rowId !== rowId);
      refreshColumns();
      setUnsaved('Unsaved changes');
      render();
    });
  });
}

function renderSync() {
  els.syncModeBadge.textContent = workbook.syncMode || 'manual_upload';
  els.syncTiles.innerHTML = [
    statusTile('App edits to Excel', workbook.currentFilePath ? 'Ready' : 'After save'),
    statusTile('Excel re-upload', pendingExcelFile ? 'Pending' : 'Available'),
    statusTile('Live cloud sync', workbook.externalSyncStatus || 'Connector required')
  ].join('');
}

function renderQualityProfile() {
  els.qualityProfile.innerHTML = workbook.columns
    .slice(0, 6)
    .map((column) => `
      <div class="motion-card reveal-on-scroll rounded-md border bg-muted/35 p-4">
        <p class="truncate text-sm font-bold text-foreground">${escapeHtml(column.name)}</p>
        <p class="mt-2 text-xs font-semibold uppercase text-muted-foreground">${escapeHtml(column.type)}</p>
        <p class="mt-3 text-sm text-muted-foreground">${column.distinct} distinct, ${column.missing} blank</p>
      </div>
    `)
    .join('');
}

function createSampleWorkbook() {
  const columns = inferColumns(sampleRows);
  return {
    name: 'QASMO Programs and Workshops',
    sheetName: 'Programs',
    rows: sampleRows.map((row) => ({ ...row })),
    columns,
    config: createDashboardConfig(sampleRows, columns),
    syncMode: 'local_draft',
    externalSyncStatus: 'Not saved',
    updatedAt: new Date().toISOString()
  };
}

function fromSavedWorkbook(source) {
  const rows = hydrateRows(source.rows || []);
  const columns = inferColumns(rows);
  return {
    id: source.id,
    name: source.name,
    sheetName: source.sheet_name,
    rows,
    columns,
    config: source.config || createDashboardConfig(rows, columns),
    originalFilename: source.original_filename,
    originalFilePath: source.original_file_path,
    currentFilePath: source.current_file_path,
    fileHash: source.file_hash,
    syncMode: source.sync_mode,
    externalSourceUrl: source.external_source_url,
    externalSyncStatus: source.external_sync_status,
    lastImportedAt: source.last_imported_at,
    lastExportedAt: source.last_exported_at,
    lastSyncedAt: source.last_synced_at,
    updatedAt: source.updated_at
  };
}

function hydrateDraft() {
  if (payload.initialWorkbook) {
    setStatus('Loaded saved workbook');
    return;
  }

  try {
    const draft = JSON.parse(localStorage.getItem(localDraftKey) || localStorage.getItem(legacyDraftKey) || 'null');
    if (draft?.rows?.length) {
      workbook = { ...draft, columns: inferColumns(draft.rows) };
      setStatus('Local draft restored');
      localStorage.setItem(localDraftKey, JSON.stringify(workbook));
      localStorage.removeItem(legacyDraftKey);
    }
  } catch {
    localStorage.removeItem(localDraftKey);
    localStorage.removeItem(legacyDraftKey);
  }
}

function refreshColumns() {
  workbook.columns = inferColumns(workbook.rows);
  workbook.config = reconcileConfig(workbook.config, workbook.rows, workbook.columns);
}

function reconcileConfig(config, rows, columns) {
  const fallback = createDashboardConfig(rows, columns);
  const hasMetric = columns.some((column) => column.name === config.metric);
  const hasDimension = columns.some((column) => column.name === config.dimension);
  const hasDateColumn = columns.some((column) => column.name === config.dateColumn);
  const chartType = ['bar', 'line', 'pie'].includes(config.chartType) ? config.chartType : fallback.chartType;

  return {
    ...config,
    chartType,
    metric: hasMetric ? config.metric : fallback.metric,
    dimension: hasDimension ? config.dimension : fallback.dimension,
    dateColumn: hasDateColumn ? config.dateColumn : fallback.dateColumn,
    showTrend: hasDateColumn ? config.showTrend : Boolean(fallback.dateColumn)
  };
}

function inferColumns(rows) {
  return publicColumnNames(rows).map((name) => {
    const values = rows.map((row) => row[name]).filter((value) => value !== null && value !== '');
    const type = inferType(values);
    return {
      name,
      type,
      distinct: new Set(values.map((value) => String(value))).size,
      missing: rows.length - values.length,
      examples: [...new Set(values.slice(0, 5).map((value) => String(value)))].slice(0, 3)
    };
  });
}

function createDashboardConfig(rows, columns = inferColumns(rows)) {
  const metric = columns.find((column) => column.type === 'number')?.name;
  const dimension = columns.find((column) => column.type === 'text' && column.distinct > 1 && column.distinct <= Math.max(12, rows.length))?.name || columns.find((column) => column.type === 'text')?.name;
  const dateColumn = columns.find((column) => column.type === 'date')?.name;
  return { title: 'Dashboard Overview', chartType: 'bar', metric, dimension, dateColumn, density: 'comfortable', showTrend: Boolean(dateColumn) };
}

function publicColumnNames(rows) {
  const names = new Set();
  rows.forEach((row) => Object.keys(row).forEach((key) => key !== '__rowId' && names.add(key)));
  return [...names];
}

function dimensionColumns(columns) {
  return columns.filter((column) => column.type === 'text' || column.type === 'date' || column.type === 'boolean');
}

function numericColumns(columns) {
  return columns.filter((column) => column.type === 'number');
}

function filterRows(rows, query, activeFilters) {
  const normalized = query.trim().toLowerCase();
  return rows.filter((row) => {
    const matchesSearch = !normalized || Object.entries(row).some(([key, value]) => key !== '__rowId' && String(value ?? '').toLowerCase().includes(normalized));
    const matchesFilters = Object.entries(activeFilters).every(([key, value]) => !value || value === 'all' || String(row[key] ?? '') === value);
    return matchesSearch && matchesFilters;
  });
}

function generateKpis(rows, columns, metric) {
  const numeric = metric || numericColumns(columns)[0]?.name;
  const total = numeric ? sum(rows, numeric) : rows.length;
  const average = numeric ? averageValue(rows, numeric) : rows.length;
  const completionColumn = columns.find((column) => ['completion', 'progress', 'rate', 'percent'].some((fragment) => column.name.toLowerCase().includes(fragment)));
  const completion = completionColumn ? averageValue(rows, completionColumn.name) : completeness(rows, columns);
  const dimension = dimensionColumns(columns)[0]?.name;
  const unique = dimension ? new Set(rows.map((row) => String(row[dimension] ?? '')).filter(Boolean)).size : columns.length;
  return [
    { label: 'Records', value: formatNumber(rows.length), helper: `${columns.length} active columns`, tone: 'blue' },
    { label: numeric ? `Total ${numeric}` : 'Total Values', value: formatNumber(total), helper: numeric ? 'Summed from numeric field' : 'Rows counted', tone: 'green' },
    { label: numeric ? `Avg ${numeric}` : 'Average', value: formatNumber(average), helper: 'Mean across visible rows', tone: 'yellow' },
    { label: completionColumn ? `Avg ${completionColumn.name}` : 'Data Completeness', value: `${Math.round(completion)}%`, helper: dimension ? `${unique} ${dimension} groups` : `${unique} unique groups`, tone: 'sky' }
  ];
}

function buildCategorySeries(rows, dimension, metric) {
  if (!dimension || !metric) {
    return rows.slice(0, 8).map((_, index) => ({ label: `Row ${index + 1}`, value: index + 1 }));
  }
  const groups = new Map();
  rows.forEach((row) => {
    const label = String(row[dimension] ?? 'Unassigned') || 'Unassigned';
    groups.set(label, (groups.get(label) || 0) + (toNumber(row[metric]) || 0));
  });
  return [...groups.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 10);
}

function buildTrendSeries(rows, dateColumn, metric) {
  if (!dateColumn || !metric) {
    return [];
  }
  const groups = new Map();
  rows.forEach((row) => {
    const date = toDate(row[dateColumn]);
    if (!date) {
      return;
    }
    const label = new Intl.DateTimeFormat('en', { month: 'short', year: '2-digit' }).format(date);
    groups.set(label, (groups.get(label) || 0) + (toNumber(row[metric]) || 0));
  });
  return [...groups.entries()].map(([label, value]) => ({ label, value }));
}

function distinctValues(rows, column) {
  return [...new Set(rows.map((row) => String(row[column] ?? '')).filter(Boolean))].slice(0, 40);
}

function emptyRow(columns) {
  return columns.reduce((row, column) => {
    row[column.name] = '';
    return row;
  }, { __rowId: createRowId() });
}

function stripInternalKeys(rows) {
  return rows.map((row) => {
    const clean = {};
    Object.entries(row).forEach(([key, value]) => {
      if (key !== '__rowId') {
        clean[key] = value;
      }
    });
    return clean;
  });
}

function hydrateRows(rows) {
  return rows.map((row) => ({ __rowId: createRowId(), ...row }));
}

function normalizeCell(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return '';
    }
    const numberCandidate = Number(trimmed.replace(/,/g, '').replace(/%$/, ''));
    return Number.isFinite(numberCandidate) && /^-?[\d,.]+%?$/.test(trimmed) ? numberCandidate : trimmed;
  }
  return value;
}

function normalizeEditedValue(value, type) {
  if (value === '') {
    return '';
  }
  if (type === 'number') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  if (type === 'boolean') {
    return ['true', 'yes', '1'].includes(value.toLowerCase());
  }
  return value;
}

function inferType(values) {
  if (!values.length) {
    return 'text';
  }
  const numberHits = values.filter((value) => toNumber(value) !== null).length;
  const dateHits = values.filter((value) => toDate(value) !== null).length;
  const booleanHits = values.filter((value) => typeof value === 'boolean' || ['true', 'false', 'yes', 'no'].includes(String(value).toLowerCase())).length;
  if (numberHits / values.length >= 0.8) {
    return 'number';
  }
  if (dateHits / values.length >= 0.8) {
    return 'date';
  }
  if (booleanHits / values.length >= 0.8) {
    return 'boolean';
  }
  return 'text';
}

function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== 'string') {
    return null;
  }
  const parsed = Number(value.replace(/,/g, '').replace(/%$/, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function toDate(value) {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sum(rows, column) {
  return rows.reduce((total, row) => total + (toNumber(row[column]) || 0), 0);
}

function averageValue(rows, column) {
  const values = rows.map((row) => toNumber(row[column])).filter((value) => value !== null);
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

function completeness(rows, columns) {
  const cells = rows.length * columns.length;
  if (!cells) {
    return 0;
  }
  const filled = rows.reduce((total, row) => total + columns.filter((column) => row[column.name] !== null && row[column.name] !== '').length, 0);
  return (filled / cells) * 100;
}

function setOptions(select, options, activeValue) {
  const safeOptions = options.length ? options : [''];
  select.innerHTML = safeOptions.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value || 'No field')}</option>`).join('');
  select.value = activeValue && safeOptions.includes(activeValue) ? activeValue : safeOptions[0];
}

function setSelectValue(select, value, options) {
  select.innerHTML = options.map((option) => `<option value="${option}">${option === 'pie' ? 'Donut' : option}</option>`).join('');
  select.value = options.includes(value) ? value : options[0];
}

function createRowId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `row-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function statusLine(label, value) {
  return `
    <div class="motion-card flex items-center justify-between gap-3 rounded-md bg-muted/55 px-3 py-2">
      <span class="font-semibold text-muted-foreground">${escapeHtml(label)}</span>
      <span class="truncate text-right font-bold">${escapeHtml(value)}</span>
    </div>
  `;
}

function statusTile(label, value) {
  return `
    <div class="motion-card reveal-on-scroll rounded-md border bg-muted/35 p-4">
      <p class="text-xs font-bold uppercase text-muted-foreground">${escapeHtml(label)}</p>
      <p class="mt-2 truncate text-sm font-extrabold text-foreground">${escapeHtml(value)}</p>
    </div>
  `;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en', {
    notation: Math.abs(value) >= 100000 ? 'compact' : 'standard',
    maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 1
  }).format(value);
}

function setStatus(message) {
  els.saveStatus.textContent = message;
}

function setUnsaved(message) {
  workbook.updatedAt = new Date().toISOString();
  setStatus(message);
}

function showUploadError(message) {
  els.uploadError.textContent = message;
  els.uploadError.classList.remove('hidden');
}

function hideUploadError() {
  els.uploadError.textContent = '';
  els.uploadError.classList.add('hidden');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
