/**
 * Fast2SMS Real Mobile SMS Gateway - Frontend Service
 * Routes through Vercel serverless /api/send-otp to bypass browser CORS.
 * Backend tries OTP Route first, auto-falls back to Quick SMS Route.
 */

/**
 * Send real SMS OTP to Indian mobile via Fast2SMS (dual-route).
 * Shows live Fast2SMS response status in toast/callback.
 *
 * @param {string} recipientPhone - 10-digit mobile number
 * @param {string} otpCode       - 6-digit OTP code
 * @param {Function} [onStatus]  - optional callback(msg, success) for live status toast
 */
export async function sendRealFast2SMS(recipientPhone, otpCode, onStatus) {
  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '').slice(-10);

  const logRecord = {
    id: `sms-${Date.now()}`,
    recipient: cleanPhone,
    code: otpCode,
    status: 'PENDING',
    route: '-',
    requestId: '-',
    timestamp: new Date().toLocaleTimeString()
  };

  try {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, otp: otpCode })
    });

    const data = await response.json();
    console.log('[SMS Service] API Response:', data);

    if (data.success) {
      logRecord.status = 'SENT';
      logRecord.route = data.route || 'otp';
      logRecord.requestId = data.requestId || 'OK';
      if (onStatus) onStatus(`✅ Fast2SMS: ${data.message}`, true);
    } else {
      logRecord.status = 'FAILED';
      logRecord.route = data.route || 'unknown';
      const errMsg = data.message || 'Fast2SMS delivery failed';
      console.warn('[SMS Service] Delivery failed:', errMsg);
      if (onStatus) onStatus(`⚠️ Fast2SMS Status: ${errMsg}`, false);
    }
  } catch (err) {
    console.error('[SMS Service] Network error:', err);
    logRecord.status = 'NETWORK_ERROR';
    if (onStatus) onStatus(`❌ SMS Network Error: ${err.message}`, false);
  }

  // Save to admin audit log
  try {
    const existing = JSON.parse(localStorage.getItem('op_admin_otp_logs') || '[]');
    localStorage.setItem('op_admin_otp_logs', JSON.stringify([logRecord, ...existing].slice(0, 100)));
  } catch (_) {}

  return logRecord;
}
