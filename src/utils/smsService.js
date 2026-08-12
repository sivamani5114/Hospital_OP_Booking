/**
 * Fast2SMS Real Mobile Gateway API Dispatcher
 * Sends Amazon/Flipkart style Direct Mobile SMS to User Phone Inbox
 */

export const FAST2SMS_API_KEY = 'meEBH583i0vD9TVOCRZwcYgjfsNdopG1LXqh6SubrMaWUn4Kl7EtvQq0x8Uw972HfjcaeKbo6WuXhRmP';

/**
 * Sends real SMS OTP to Indian Mobile Numbers via Fast2SMS Gateway
 * @param {string} recipientPhone - 10-digit Mobile Number
 * @param {string} otpCode - 6-digit OTP Code
 */
export async function sendRealFast2SMS(recipientPhone, otpCode) {
  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '').slice(-10);

  try {
    const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=otp&variables_values=${otpCode}&numbers=${cleanPhone}`, {
      method: 'GET'
    });

    const data = await response.json();
    console.log('Fast2SMS Response:', data);

    // Save record to local logs
    const dispatchRecord = {
      id: `fast2sms-${Date.now()}`,
      sender: 'FAST2SMS_GATEWAY',
      recipient: cleanPhone,
      code: otpCode,
      status: data.return ? 'SENT_REAL_MOBILE_SMS' : 'API_RESPONSE_FAILED',
      responseMsg: data.message || 'SUCCESS',
      timestamp: new Date().toLocaleTimeString()
    };

    const existing = JSON.parse(localStorage.getItem('op_admin_otp_logs') || '[]');
    localStorage.setItem('op_admin_otp_logs', JSON.stringify([dispatchRecord, ...existing]));

    return data;
  } catch (err) {
    console.error('Fast2SMS Error:', err);
    return { return: false, message: err.message };
  }
}
