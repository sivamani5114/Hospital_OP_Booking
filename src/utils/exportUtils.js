// exportUtils.js — PDF Print & CSV Download helpers

/**
 * Download table data as a .csv file
 * @param {string} filename - filename without extension
 * @param {string[]} headers - column headers
 * @param {string[][]} rows - array of row arrays
 */
export function downloadCsv(filename, headers, rows) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const val = String(cell ?? '').replace(/"/g, '""');
      // If value looks like a 10-digit phone number, prefix with `'` or tab so Excel doesn't convert to scientific notation
      if (/^\d{10}$/.test(val)) {
        return `"'${val}"`;
      }
      return `"${val}"`;
    }).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print a styled HTML table as a PDF using browser print dialog
 * @param {string} title - Report title
 * @param {string[]} headers - column headers
 * @param {string[][]} rows - array of row arrays
 */
export function printPdfReport(title, headers, rows) {
  const tableRows = rows.map(row => `
    <tr>${row.map(cell => `<td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${cell ?? ''}</td>`).join('')}</tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #1a202c; }
        h1 { font-size: 20px; font-weight: 800; color: #1a202c; margin-bottom: 4px; }
        p.meta { font-size: 11px; color: #718096; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead tr { background: #2d3748; color: white; }
        thead th { padding: 10px 12px; text-align: left; font-weight: 600; }
        tbody tr:nth-child(even) { background: #f7fafc; }
        td { vertical-align: middle; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>🏥 CarePulse — ${title}</h1>
      <p class="meta">Generated on: ${new Date().toLocaleString('en-IN')} | CarePulse Hospital OP Management System</p>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}
