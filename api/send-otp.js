/**
 * Vercel Serverless API Route: /api/send-otp
 * Dual-Route Fast2SMS Dispatcher (Route 1: "otp" -> Fallback Route 2: "q" Quick SMS)
 */

const FAST2SMS_API_KEY = 'meEBH583i0vD9TVOCRZwcYgjfsNdopG1LXqh6SubrMaWUn4Kl7EtvQq0x8Uw972HfjcaeKbo6WuXhRmP';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { phone, otp } = req.body || {};

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP required' });
  }

  const cleanPhone = phone.toString().replace(/[^0-9]/g, '').slice(-10);

  if (cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, message: 'Invalid 10-digit mobile number' });
  }

  console.log(`[Fast2SMS] Dispatching OTP ${otp} to +91 ${cleanPhone}`);

  // ═══ ATTEMPT 1: DEDICATED "otp" ROUTE ═══
  try {
    const otpUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=otp&variables_values=${otp}&numbers=${cleanPhone}&flash=0`;

    const resp1 = await fetch(otpUrl, { method: 'GET', headers: { 'Cache-Control': 'no-cache' } });
    const data1 = await resp1.json();

    console.log('[Fast2SMS] Route OTP Response:', JSON.stringify(data1));

    if (data1.return === true) {
      return res.status(200).json({
        success: true,
        route: 'otp',
        requestId: data1.request_id || 'OK',
        message: `SMS sent! Request ID: ${data1.request_id || 'OK'}`
      });
    }

    console.warn('[Fast2SMS] OTP route failed, trying Quick SMS fallback...', data1);
  } catch (err1) {
    console.warn('[Fast2SMS] OTP route error:', err1.message);
  }

  // ═══ ATTEMPT 2: FALLBACK "q" (QUICK SMS) ROUTE ═══
  try {
    const smsText = `Your CarePulse Hospital OP OTP is ${otp}. Valid for 5 minutes. Do not share.`;
    const quickUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=q&message=${encodeURIComponent(smsText)}&language=english&flash=0&numbers=${cleanPhone}`;

    const resp2 = await fetch(quickUrl, { method: 'GET', headers: { 'Cache-Control': 'no-cache' } });
    const data2 = await resp2.json();

    console.log('[Fast2SMS] Route Quick SMS Response:', JSON.stringify(data2));

    if (data2.return === true) {
      return res.status(200).json({
        success: true,
        route: 'quick_sms',
        requestId: data2.request_id || 'OK',
        message: `SMS sent via Quick route! Request ID: ${data2.request_id || 'OK'}`
      });
    }

    const errMsg = Array.isArray(data2.message)
      ? data2.message.join(', ')
      : (data2.message || 'Fast2SMS dispatch failed');

    return res.status(200).json({ success: false, message: errMsg, raw: data2 });

  } catch (err2) {
    console.error('[Fast2SMS] Quick SMS route error:', err2.message);
    return res.status(500).json({ success: false, message: err2.message });
  }
}
