/**
 * Fast2SMS Real Mobile SMS Gateway
 * All calls go through our Vercel serverless /api/send-otp endpoint
 * to avoid browser CORS restrictions.
 */

export const DEFAULT_FAST2SMS_API_KEY = 'meEBH583i0vD9TVOCRZwcYgjfsNdopG1LXqh6SubrMaWUn4Kl7EtvQq0x8Uw972HfjcaeKbo6WuXhRmP';

/**
 * Sends real SMS OTP to Indian Mobile Numbers via Fast2SMS.
 * Routes through /api/send-otp (Vercel serverless) to bypass CORS.
 *
 * @param {string} recipientPhone - 10-digit Mobile Number
 * @param {string} otpCode - 6-digit OTP Code
 */
export async function sendRealFast2SMS(recipientPhone, otpCode) {
  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '').slice(-10);

  // Log record start
  const logRecord = {
    id: `sms-${Date.now()}`,
    recipient: cleanPhone,
    code: otpCode,
    status: 'PENDING',
    timestamp: new Date().toLocaleTimeString()
  };

  try {
    // Call our Vercel serverless endpoint (server-side avoids CORS)
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, otp: otpCode })
    });

    const data = await response.json();
    console.log('OTP API Response:', data);

    logRecord.status = data.success ? 'SENT_REAL_SMS' : 'API_FAILED';
    logRecord.responseMsg = data.message;
  } catch (err) {
    console.error('OTP send error:', err);
    logRecord.status = 'NETWORK_ERROR';
    logRecord.responseMsg = err.message;
  }

  // Save to admin audit logs
  const existing = JSON.parse(localStorage.getItem('op_admin_otp_logs') || '[]');
  localStorage.setItem('op_admin_otp_logs', JSON.stringify([logRecord, ...existing]));

  return logRecord;
}
