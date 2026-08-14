import React, { useState, useEffect } from 'react';
import { useDb } from '../../context/DbContext';
import { sendWhatsAppOtpToUser } from '../../utils/whatsappService';
import { sendRealFast2SMS } from '../../utils/smsService';
import { 
  KeyRound, Phone, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, 
  RefreshCw, MessageCircle, X, ShieldAlert, Sparkles, AlertCircle, Smartphone 
} from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose, role = 'USER', onPasswordResetSuccess }) {
  const { users, resetUserPassword } = useDb();

  // Step: 1 = Enter Phone, 2 = Verify OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [matchedUser, setMatchedUser] = useState(null);
  
  // OTP States
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [isOtpSending, setIsOtpSending] = useState(false);

  // New Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Role Theme Colors & Titles
  const roleConfig = {
    USER: {
      title: 'Patient Password Recovery',
      badge: 'Patient Portal',
      accentColor: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgGlow: 'bg-cyan-500/10'
    },
    HOSPITAL: {
      title: 'Hospital Password Recovery',
      badge: 'Hospital Desk Portal',
      accentColor: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgGlow: 'bg-emerald-500/10'
    },
    ADMIN: {
      title: 'Super Admin Security Recovery',
      badge: 'Master Admin Access',
      accentColor: 'from-indigo-600 to-purple-600',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/40',
      bgGlow: 'bg-indigo-500/10'
    }
  }[role] || {
    title: 'Password Recovery',
    badge: 'Security Portal',
    accentColor: 'from-cyan-500 to-blue-600',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgGlow: 'bg-cyan-500/10'
  };

  // Timer countdown
  useEffect(() => {
    let timer;
    if (step === 2 && otpTimer > 0) {
      timer = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTimer]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPhone('');
      setMatchedUser(null);
      setGeneratedOtp('');
      setEnteredOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage('');
      setOtpTimer(60);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Find user and generate OTP
  const handleRequestOtp = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Find in users database matching role (or allow admin override)
    const found = users.find(u => u.phone === cleanPhone);

    if (!found) {
      setErrorMessage(`No account found registered with mobile number +91 ${cleanPhone}. Please check your number.`);
      return;
    }

    if (role !== 'ADMIN' && found.role !== role && found.role !== 'USER') {
      setErrorMessage(`This phone number is registered as a ${found.role} account, not ${role}.`);
      return;
    }

    setMatchedUser(found);
    setIsOtpSending(true);

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    // 🚀 Dispatch Real Mobile SMS directly to Phone SIM via Fast2SMS Gateway
    sendRealFast2SMS(cleanPhone, otp);

    setTimeout(() => {
      setIsOtpSending(false);
      setStep(2);
      setOtpTimer(60);
    }, 600);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setErrorMessage('❌ Invalid OTP Code. Please enter the 6-digit code sent to your WhatsApp/SMS.');
      return;
    }

    setStep(3);
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (otpTimer > 0) return;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    
    // Send Real Mobile SMS via Fast2SMS Gateway
    sendRealFast2SMS(matchedUser.phone, otp);

    setOtpTimer(60);
    setErrorMessage('');
    alert(`📲 New 6-digit SMS OTP dispatched to your mobile SIM +91 ${matchedUser.phone}!`);
  };

  // Step 3: Set New Password
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    // Update in database
    resetUserPassword(matchedUser._id, newPassword);

    // Pass back to parent form so user can auto-login
    if (onPasswordResetSuccess) {
      onPasswordResetSuccess(matchedUser.phone, newPassword);
    }

    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border ${roleConfig.borderColor} shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${roleConfig.accentColor} flex items-center justify-center text-white shadow-lg shrink-0`}>
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-lg font-outfit">{roleConfig.title}</h3>
            </div>
            <span className={`text-[10px] font-bold ${roleConfig.textColor} bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 inline-block mt-0.5`}>
              {roleConfig.badge}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ═══ STEP 1: ENTER REGISTERED PHONE ═══ */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div className="space-y-1">
              <p className="text-slate-300 text-xs">
                Enter your registered 10-digit mobile phone number to receive a secure WhatsApp/SMS verification code.
              </p>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1.5">Registered Mobile Number *</label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-500 font-bold font-mono text-xs">+91</div>
                <input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-xl pl-12 pr-4 py-3 text-sm text-white font-mono outline-none"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isOtpSending || phone.length < 10}
              className={`w-full bg-gradient-to-r ${roleConfig.accentColor} hover:opacity-95 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50`}
            >
              {isOtpSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Account...
                </>
              ) : (
                <>
                  Send Verification OTP <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ═══ STEP 2: VERIFY OTP ═══ */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Account Identified:</span>
                <strong className="text-white">{matchedUser?.fullName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">OTP Sent To:</span>
                <span className="font-mono text-cyan-300 font-bold">+91 {matchedUser?.phone}</span>
              </div>
              <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800 leading-relaxed">
                🔒 A 6-digit security code has been sent directly to your phone SIM inbox (<strong>+91 {matchedUser?.phone}</strong>) via <strong>Fast2SMS Gateway</strong>. Please check your SMS messages and enter the code below.
              </p>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1.5">Enter 6-Digit OTP Code Received on Phone *</label>
              <input
                type="text"
                placeholder="• • • • • •"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white outline-none"
                required
                autoFocus
              />
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-white underline cursor-pointer"
              >
                ← Change Phone
              </button>
              <button
                type="button"
                disabled={otpTimer > 0}
                onClick={handleResendOtp}
                className={`${otpTimer > 0 ? 'text-slate-500' : 'text-cyan-400 hover:underline cursor-pointer'} font-semibold`}
              >
                {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP Now ↻'}
              </button>
            </div>

            <button
              type="submit"
              disabled={enteredOtp.length < 6}
              className={`w-full bg-gradient-to-r ${roleConfig.accentColor} hover:opacity-95 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50`}
            >
              Verify OTP & Proceed <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ═══ STEP 3: SET NEW PASSWORD ═══ */}
        {step === 3 && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <p className="text-slate-300 text-xs">
                Identity verified! Create a new secure password for <strong className="text-white">{matchedUser?.fullName}</strong>.
              </p>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1.5">New Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-xl pl-10 pr-10 py-3 text-sm text-white outline-none"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white absolute right-3.5 top-3.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1.5">Confirm New Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={newPassword.length < 6 || confirmPassword.length < 6}
              className={`w-full bg-gradient-to-r ${roleConfig.accentColor} hover:opacity-95 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50`}
            >
              Update Password & Finish <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ═══ STEP 4: SUCCESS CONFIRMATION ═══ */}
        {step === 4 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-white text-lg font-outfit">Password Reset Successfully!</h4>
              <p className="text-xs text-slate-400">
                Your new password has been updated in the database. You can now login with your phone number (+91 {matchedUser?.phone}) and new password.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              Back to Login Screen <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
