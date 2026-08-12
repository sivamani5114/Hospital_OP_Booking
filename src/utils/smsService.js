/**
 * Official Admin SMS Dispatcher Engine
 * Admin Sender Number: +91 9346700951
 */

export const ADMIN_SENDER_NUMBER = '9346700951';

// In-Memory & LocalStorage OTP Dispatch Records
export function dispatchAdminOtp(recipientPhone, otpCode) {
  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '').slice(-10);
  
  const dispatchRecord = {
    id: `otp-${Date.now()}`,
    sender: ADMIN_SENDER_NUMBER,
    recipient: cleanPhone,
    code: otpCode,
    status: 'DELIVERED',
    timestamp: new Date().toLocaleTimeString()
  };

  // Save to LocalStorage for Admin Dispatcher Log tracking
  const existing = JSON.parse(localStorage.getItem('op_admin_otp_logs') || '[]');
  localStorage.setItem('op_admin_otp_logs', JSON.stringify([dispatchRecord, ...existing]));

  return dispatchRecord;
}

export function getAdminOtpLogs() {
  return JSON.parse(localStorage.getItem('op_admin_otp_logs') || '[]');
}
