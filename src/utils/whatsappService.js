/**
 * Official CarePulse WhatsApp OTP Engine
 * Admin Super Control: +91 9948985114
 */

export const ADMIN_PHONE_NUMBER = '9948985114';

/**
 * Dispatch WhatsApp OTP directly to Recipient Phone Number
 * @param {string} recipientPhone 10-digit mobile number
 * @param {string} otpCode 6-digit verification code
 */
export function sendWhatsAppOtpToUser(recipientPhone, otpCode) {
  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '').slice(-10);
  
  const message = `🏥 *CarePulse Hospital OP System*\n\nYour Verification OTP Code is: *${otpCode}*\n\nValid for 5 minutes. Do not share this OTP with anyone.`;
  const waUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(message)}`;

  // Log dispatch record internally for Admin auditing
  const dispatchRecord = {
    id: `wa-${Date.now()}`,
    sender: ADMIN_PHONE_NUMBER,
    recipient: cleanPhone,
    code: otpCode,
    status: 'SENT_TO_WHATSAPP',
    timestamp: new Date().toLocaleTimeString()
  };

  const existingLogs = JSON.parse(localStorage.getItem('op_wa_otp_logs') || '[]');
  localStorage.setItem('op_wa_otp_logs', JSON.stringify([dispatchRecord, ...existingLogs]));

  return {
    success: true,
    recipient: cleanPhone,
    otpCode: otpCode,
    waUrl: waUrl
  };
}

export function getWaOtpLogs() {
  return JSON.parse(localStorage.getItem('op_wa_otp_logs') || '[]');
}
