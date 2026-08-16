import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { sendRealFast2SMS } from '../../utils/smsService';
import { 
  User, Phone, Mail, Calendar, MapPin, Lock, ArrowLeft, CheckCircle2, 
  Send, Smartphone, ShieldCheck, Stethoscope, ArrowRight, UserPlus
} from 'lucide-react';

export default function PatientRegister({ onGoToLogin, onGoToHospitalRegister }) {
  const { registerUser, showToast } = useAuth();
  const { users, hospitals } = useDb();

  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [targetPhone, setTargetPhone] = useState('');
  const [showMobileSmsCard, setShowMobileSmsCard] = useState(false);

  // Patient Registration Form State
  const [patientForm, setPatientForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    password: '',
    confirmPassword: ''
  });

  // Countdown timer effect for OTP resend
  useEffect(() => {
    let interval = null;
    if (timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerSeconds]);

  // Handle Send Direct SMS OTP to Target User Phone via Fast2SMS Gateway
  const handleSendInstantOtp = (phoneNum) => {
    if (!phoneNum || phoneNum.trim().length === 0) {
      showToast('❌ Please enter a 10-digit Mobile Number!', 'error');
      return;
    }

    const cleanPhone = phoneNum.replace(/\D/g, '').slice(0, 10);
    if (cleanPhone.length !== 10) {
      showToast('❌ Mobile Number must be exactly 10 digits!', 'error');
      alert('❌ Mobile Number must be exactly 10 digits!');
      return;
    }

    if (!/^[6-9]/.test(cleanPhone)) {
      showToast('❌ Invalid Number! Indian mobile numbers must start with 6, 7, 8, or 9.', 'error');
      alert('❌ Invalid Number! Indian mobile numbers must start with 6, 7, 8, or 9.');
      return;
    }

    // 🔒 Enforce Strict Unique Phone Number Check
    const isUserExists = (users || []).some(u => u.phone === cleanPhone);
    const isHospExists = (hospitals || []).some(h => h.phone === cleanPhone);
    if (isUserExists || isHospExists) {
      showToast(`❌ Phone number +91 ${cleanPhone} is already registered! Please login.`, 'error');
      alert(`❌ Phone number +91 ${cleanPhone} is already registered!\n\nPlease Login with your existing account or use a different phone number.`);
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    setGeneratedOtp(code);
    setOtpSent(true);
    setTimerSeconds(60);
    setEnteredOtp('');
    setTargetPhone(cleanPhone);
    setShowMobileSmsCard(true);

    showToast(`📲 Sending OTP to +91 ${cleanPhone}...`, 'info');

    // 🚀 Dispatch Real Mobile SMS via Fast2SMS Dual-Route Gateway
    sendRealFast2SMS(cleanPhone, code, (statusMsg, success) => {
      showToast(statusMsg, success ? 'success' : 'error');
    });
  };

  // Handle Verify OTP
  const handleVerifyOtp = () => {
    if (!enteredOtp || enteredOtp.trim().length === 0) {
      showToast('❌ Please enter the 6-digit OTP code!', 'error');
      return;
    }

    if (enteredOtp.trim() === generatedOtp.trim()) {
      setIsPhoneVerified(true);
      setShowMobileSmsCard(false);
      showToast('✅ Phone Number Verified Successfully via OTP!', 'success');
    } else {
      showToast('❌ Invalid OTP! Please enter the correct 6-digit code.', 'error');
    }
  };

  const handlePatientSubmit = (e) => {
    e.preventDefault();

    if (!isPhoneVerified) {
      showToast('❌ Please verify your Phone Number with OTP before registering!', 'error');
      return;
    }

    if (patientForm.password !== patientForm.confirmPassword) {
      showToast('❌ Passwords do not match!', 'error');
      return;
    }

    const result = registerUser(patientForm);
    if (result.success) {
      setTimeout(() => onGoToLogin(), 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch">

      {/* ═══ LEFT BRANDING PANEL (hidden on mobile) ═══ */}
      <div className="hidden lg:flex flex-col justify-between w-[400px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border-r border-slate-800 p-10 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

        {/* Logo + Brand */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-white font-extrabold text-xl font-outfit tracking-tight block">CarePulse</span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Patient Registration</span>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3 font-outfit">
            Create Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Patient Account
            </span>
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Get instant digital access to specialist doctors, book OP queue tokens without waiting, and download verified OPD tickets with QR codes.
          </p>
        </div>

        {/* Highlights */}
        <div className="space-y-4 my-8">
          {[
            { icon: '🎫', title: 'Instant OP Token Booking', desc: 'Skip long physical queues with live queue tokens' },
            { icon: '🩺', title: 'Top Hospital Doctors', desc: 'Consult verified specialist doctors across cities' },
            { icon: '📱', title: 'SMS & WhatsApp Updates', desc: 'Real-time notifications on doctor consultation status' },
            { icon: '📄', title: 'Digital OPD Receipts', desc: 'Instant downloadable receipts with doctor consultation details' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 backdrop-blur-sm">
              <span className="text-xl mt-0.5">{f.icon}</span>
              <div>
                <p className="text-white font-semibold text-xs">{f.title}</p>
                <p className="text-slate-400 text-[11px]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-cyan-300/80 flex items-center gap-1.5 pt-4 border-t border-slate-800">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>🔒 256-bit Encrypted · Indian Healthcare Standard</span>
        </div>
      </div>

      {/* ═══ RIGHT REGISTRATION FORM PANEL ═══ */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-10 py-4 border-b border-slate-200 dark:border-slate-800 glass-panel sticky top-0 z-20">
          <button
            type="button"
            onClick={onGoToLogin}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Patient Login
          </button>
          
          <div className="flex items-center gap-3">
            {onGoToHospitalRegister && (
              <button
                type="button"
                onClick={onGoToHospitalRegister}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
              >
                🏥 Hospital Registration →
              </button>
            )}
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hidden sm:inline">Patient Registration</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-start justify-center p-5 sm:p-10">
          <div className="w-full max-w-xl glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            
            {/* Title */}
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 text-cyan-500">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold font-outfit text-slate-900 dark:text-white">Patient Account Registration</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Please fill your official profile details and verify your phone number.</p>
            </div>

            <form onSubmit={handlePatientSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold block mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Siva Kumar"
                  value={patientForm.fullName}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Phone Number + Send OTP Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Mobile Number (10 Digits) *</label>
                  {patientForm.phone.length === 10 && /^[6-9]\d{9}$/.test(patientForm.phone) ? (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid Mobile Number
                    </span>
                  ) : patientForm.phone.length > 0 && !/^[6-9]/.test(patientForm.phone) ? (
                    <span className="text-[10px] text-rose-500 font-bold">
                      ⚠️ Must start with 6, 7, 8, or 9
                    </span>
                  ) : patientForm.phone.length > 0 ? (
                    <span className="text-[10px] text-cyan-600 font-mono">
                      {patientForm.phone.length}/10 digits
                    </span>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1 flex items-center">
                    <div className="absolute left-3 flex items-center gap-1 text-slate-500 font-bold text-xs select-none pointer-events-none border-r border-slate-300 dark:border-slate-700 pr-2">
                      <span>🇮🇳</span>
                      <span className="font-mono">+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Enter 10-digit mobile number"
                      value={patientForm.phone}
                      onChange={(e) => {
                        setPatientForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }));
                        setIsPhoneVerified(false);
                      }}
                      className={`w-full bg-white dark:bg-slate-900 border rounded-xl pl-20 pr-3 py-3 text-xs text-slate-900 dark:text-white font-mono tracking-wider outline-none ${
                        isPhoneVerified ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-slate-800 focus:border-cyan-500'
                      }`}
                      required
                    />
                  </div>

                  {!isPhoneVerified ? (
                    <button
                      type="button"
                      onClick={() => handleSendInstantOtp(patientForm.phone)}
                      disabled={timerSeconds > 0}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 min-w-max cursor-pointer transition-all active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {timerSeconds > 0 ? `Resend (${timerSeconds}s)` : 'Send OTP'}
                    </button>
                  ) : (
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> Verified ✓
                    </span>
                  )}
                </div>
              </div>

              {/* DIRECT REAL MOBILE SMS OTP VERIFICATION CARD (FAST2SMS GATEWAY) */}
              {otpSent && !isPhoneVerified && showMobileSmsCard && (
                <div className="bg-cyan-50 dark:bg-slate-900 p-4 rounded-2xl border-2 border-cyan-500/40 space-y-3 shadow-lg animate-fadeIn">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-cyan-700 dark:text-cyan-300 font-bold flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-cyan-600" /> SMS Sent to Mobile (+91 {targetPhone})
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Real SMS Dispatched
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    🔒 A 6-digit security OTP has been sent directly to your phone SIM inbox (<strong>+91 {targetPhone}</strong>) via <strong>Fast2SMS Gateway</strong>. Please enter the code below.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit SMS OTP code"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-center font-mono text-slate-900 dark:text-white text-sm font-bold tracking-widest outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow cursor-pointer transition-all active:scale-95"
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold block mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. siva@gmail.com"
                  value={patientForm.email}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={patientForm.dateOfBirth}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold block mb-1">Gender *</label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold block mb-1">Full Residential Address *</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 201, Jubilee Hills, Hyderabad"
                  value={patientForm.address}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold block mb-1">Password *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={patientForm.password}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold block mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={patientForm.confirmPassword}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isPhoneVerified 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98]'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700 cursor-not-allowed'
                }`}
              >
                {isPhoneVerified ? 'Complete Patient Registration →' : '⚠️ Please Verify Mobile Number with OTP First'}
              </button>
            </form>

            {/* Bottom Link */}
            <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-xs text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 font-semibold transition-colors cursor-pointer"
              >
                Already have a patient account? <span className="font-bold underline">Login Here</span>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
