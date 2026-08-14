/**
 * Vercel Serverless API Route: /api/send-otp
 * Server-side Fast2SMS OTP dispatcher (bypasses browser CORS restrictions)
 */

const FAST2SMS_API_KEY = 'meEBH583i0vD9TVOCRZwcYgjfsNdopG1LXqh6SubrMaWUn4Kl7EtvQq0x8Uw972HfjcaeKbo6WuXhRmP';

export default async function handler(req, res) {
  // Allow CORS from our frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'phone and otp are required' });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

  if (cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, message: 'Invalid 10-digit phone number' });
  }

  try {
    const fast2smsUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=otp&variables_values=${otp}&numbers=${cleanPhone}&flash=0`;

    const response = await fetch(fast2smsUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    const data = await response.json();
    console.log('Fast2SMS API Response:', JSON.stringify(data));

    if (data.return === true) {
      return res.status(200).json({
        success: true,
        message: `OTP sent successfully to +91 ${cleanPhone}`,
        requestId: data.request_id
      });
    } else {
      return res.status(200).json({
        success: false,
        message: data.message?.[0] || 'Fast2SMS delivery failed',
        raw: data
      });
    }
  } catch (err) {
    console.error('Fast2SMS Server Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while sending SMS',
      error: err.message
    });
  }
}
