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

/**
 * Print a dedicated, beautiful OP Digital Ticket PDF Receipt with Reference Number
 * @param {object} ticket - Booking ticket object
 */
export function printOpTicketReceipt(ticket) {
  const refNo = ticket.referenceNumber || ('DUP' + (ticket.bookingId ? ticket.bookingId.replace(/\D/g, '') : '2904329'));
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>CarePulse OP Ticket — ${ticket.bookingId}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif; padding: 30px; color: #1e293b; background: #f8fafc; }
        .ticket-box { border: 2px solid #06b6d4; border-radius: 20px; padding: 28px; max-width: 620px; margin: 0 auto; background: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.06); position: relative; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 18px; margin-bottom: 20px; }
        .brand { font-size: 22px; font-weight: 900; color: #0891b2; letter-spacing: -0.5px; }
        .brand span { color: #0f172a; }
        .status-badge { background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; border: 1px solid #86efac; text-transform: uppercase; letter-spacing: 0.5px; }
        .ref-box { background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .ref-title { font-size: 10px; color: #15803d; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .ref-code { font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 900; color: #166534; letter-spacing: 1px; }
        .token-title { font-size: 10px; color: #0891b2; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .token-code { font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 900; color: #0e7490; letter-spacing: 1px; }
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
        .details-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
        .details-table tr:nth-child(even) td { background: #f8fafc; }
        .details-table td.label { color: #64748b; font-weight: 600; width: 42%; }
        .details-table td.val { color: #0f172a; font-weight: 700; }
        .details-table td.amount { color: #059669; font-size: 16px; font-weight: 900; }
        .footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #64748b; line-height: 1.5; }
        @media print {
          body { padding: 0; background: #fff; }
          .ticket-box { box-shadow: none; border-color: #0891b2; }
        }
      </style>
    </head>
    <body>
      <div class="ticket-box">
        <div class="header">
          <div>
            <div class="brand">CarePulse <span>OP Ticket</span></div>
            <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Hospital OP Appointment & Digital Pass</div>
          </div>
          <div class="status-badge">✓ Confirmed & Paid</div>
        </div>

        <div class="ref-box">
          <div>
            <div class="ref-title">Transaction Reference Number</div>
            <div class="ref-code">${refNo}</div>
          </div>
          <div style="text-align: right;">
            <div class="token-title">Unique OP Token Code</div>
            <div class="token-code">#${ticket.bookingId}</div>
          </div>
        </div>

        <table class="details-table">
          <tr><td class="label">👨‍⚕️ Consulting Doctor</td><td class="val">${ticket.doctorName} (${ticket.department || 'General'})</td></tr>
          <tr><td class="label">🏥 Hospital Name</td><td class="val">${ticket.hospitalName}</td></tr>
          <tr><td class="label">🗓️ Appointment Date</td><td class="val">${ticket.date}</td></tr>
          <tr><td class="label">⏰ Appointment Time</td><td class="val">${ticket.time}</td></tr>
          <tr><td class="label">👤 Patient Full Name</td><td class="val">${ticket.userName}</td></tr>
          <tr><td class="label">📞 Patient Phone</td><td class="val">${ticket.userPhone}</td></tr>
          <tr><td class="label">💰 OP Consultation Fee</td><td class="val amount">₹${ticket.opFee} (Paid Online)</td></tr>
          <tr><td class="label">💳 Payment Method</td><td class="val">${ticket.paymentMethod || 'UPI QR / NetBanking'}</td></tr>
        </table>

        <div class="footer">
          🔒 <strong>Official Verified Digital OP Pass</strong><br/>
          Present this ticket at the hospital OP counter on arrival. Generated on ${new Date().toLocaleString('en-IN')}
        </div>
      </div>
    </body>
    </html>
  `;
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}
