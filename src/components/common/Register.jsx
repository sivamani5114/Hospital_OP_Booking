import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { sendWhatsAppOtpToUser } from '../../utils/whatsappService';
import { sendRealFast2SMS } from '../../utils/smsService';
import { User, Phone, Mail, Calendar, MapPin, Lock, ArrowLeft, Building2, CheckCircle2, KeyRound, Send, Smartphone, Sparkles, Zap } from 'lucide-react';

export default function Register({ onGoToLogin }) {
  const { registerUser, showToast } = useAuth();
  const { registerHospitalSelf } = useDb();

  const [regType, setRegType] = useState('PATIENT'); // PATIENT | HOSPITAL

  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [targetPhone, setTargetPhone] = useState('');
  const [showMobileSmsCard, setShowMobileSmsCard] = useState(false);

  // Patient Registration Form State (Blank by Default)
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

  // Hospital Registration Form State (Blank by Default)
  const [hospitalForm, setHospitalForm] = useState({
    hospitalName: '',
    phone: '',
    email: '',
    city: 'Hyderabad',
    area: '',
    address: '',
    hospitalTimings: '09:00 AM - 08:00 PM',
    opFee: '500',
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

  // Handle Send Real Fast2SMS Direct Mobile SMS OTP
  const handleSendInstantOtp = (phoneNum) => {
    if (!phoneNum || phoneNum.trim().length < 10) {
      showToast('❌ Please enter a valid 10-digit Phone Number first!', 'error');
      return;
    }

    const cleanPhone = phoneNum.replace(/[^0-9]/g, '').slice(-10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    setGeneratedOtp(code);
    setOtpSent(true);
    setTimerSeconds(30);
    setEnteredOtp('');
    setTargetPhone(cleanPhone);
    setShowMobileSmsCard(true);

    // 🚀 Send Real Mobile SMS via Fast2SMS Gateway to User Mobile Phone Inbox
    sendRealFast2SMS(cleanPhone, code);

    // Trigger SMS App Deep Link to open Mobile Message App directly
    const smsUrl = `sms:+91${cleanPhone}?body=${encodeURIComponent(`Your CarePulse Verification OTP is: ${code}`)}`;
    window.location.href = smsUrl;

    // Save to dispatch logs
    sendWhatsAppOtpToUser(cleanPhone, code);

    showToast(`📲 SMS Dispatched to +91 ${cleanPhone}! Opening Messages App...`, 'success');
  };

  // Handle Auto-fill for instant user convenience
  const handleInstantFill = () => {
    setEnteredOtp(generatedOtp);
    showToast('⚡ OTP Code Auto-Filled!', 'info');
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

  const handleHospitalSubmit = (e) => {
    e.preventDefault();

    if (!isPhoneVerified) {
      showToast('❌ Please verify Hospital Phone Number with OTP before registering!', 'error');
      return;
    }

    if (hospitalForm.password !== hospitalForm.confirmPassword) {
      showToast('❌ Passwords do not match!', 'error');
      return;
    }

    registerHospitalSelf({
      hospitalName: hospitalForm.hospitalName,
      phone: hospitalForm.phone,
      email: hospitalForm.email,
      city: hospitalForm.city,
      area: hospitalForm.area,
      address: hospitalForm.address,
      hospitalTimings: hospitalForm.hospitalTimings,
      opFee: Number(hospitalForm.opFee),
      emergencyAvailable: true,
      departments: ['General Medicine', 'Pediatrics']
    }, hospitalForm.password);

    showToast('✅ Hospital registered! Pending Admin approval.', 'success');
    onGoToLogin();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={onGoToLogin}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>
          
          <span className="text-xs font-bold text-cyan-400">CarePulse Registration</span>
        </div>

        {/* Tab Switcher: Patient vs Hospital Registration */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setRegType('PATIENT');
              setIsPhoneVerified(false);
              setOtpSent(false);
              setShowMobileSmsCard(false);
            }}
            className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${
              regType === 'PATIENT' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Patient Registration
          </button>
          <button
            type="button"
            onClick={() => {
              setRegType('HOSPITAL');
              setIsPhoneVerified(false);
              setOtpSent(false);
              setShowMobileSmsCard(false);
            }}
            className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${
              regType === 'HOSPITAL' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Hospital Registration
          </button>
        </div>

        {/* --- PATIENT REGISTRATION FORM WITH GUARANTEED OTP --- */}
        {regType === 'PATIENT' && (
          <form onSubmit={handlePatientSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Siva Kumar"
                value={patientForm.fullName}
                onChange={(e) => setPatientForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            {/* Phone Number + Send OTP Button */}
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Phone Number *</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={patientForm.phone}
                    onChange={(e) => {
                      setPatientForm(prev => ({ ...prev, phone: e.target.value }));
                      setIsPhoneVerified(false);
                    }}
                    className={`w-full bg-slate-900 border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white ${
                      isPhoneVerified ? 'border-emerald-500/80 bg-emerald-950/20' : 'border-slate-800'
                    }`}
                    required
                  />
                </div>

                {!isPhoneVerified ? (
                  <button
                    type="button"
                    onClick={() => handleSendInstantOtp(patientForm.phone)}
                    disabled={timerSeconds > 0}
                    className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 min-w-max"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {timerSeconds > 0 ? `Resend (${timerSeconds}s)` : 'Send OTP'}
                  </button>
                ) : (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Verified
                  </span>
                )}
              </div>
            </div>

            {/* GUARANTEED INSTANT MOBILE SMS CARD DISPLAY */}
            {otpSent && !isPhoneVerified && showMobileSmsCard && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-4 rounded-2xl border-2 border-cyan-500/50 space-y-3 shadow-xl animate-fadeIn">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" /> Enter OTP received on +91 {targetPhone}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP code"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center font-mono text-white text-sm font-bold tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow"
                  >
                    Verify OTP
                  </button>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. siva@gmail.com"
                value={patientForm.email}
                onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={patientForm.dateOfBirth}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Gender</label>
                <select
                  value={patientForm.gender}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Full Address</label>
              <input
                type="text"
                placeholder="e.g. Flat 201, Jubilee Hills, Hyderabad"
                value={patientForm.address}
                onChange={(e) => setPatientForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={patientForm.password}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={patientForm.confirmPassword}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full font-bold py-3.5 rounded-xl text-xs transition-all ${
                isPhoneVerified 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {isPhoneVerified ? 'Complete Patient Registration' : '⚠️ Please Verify Phone with OTP First'}
            </button>
          </form>
        )}

        {/* --- HOSPITAL REGISTRATION FORM WITH GUARANTEED OTP --- */}
        {regType === 'HOSPITAL' && (
          <form onSubmit={handleHospitalSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Hospital Name</label>
              <input
                type="text"
                placeholder="e.g. Care & Cure City Hospital"
                value={hospitalForm.hospitalName}
                onChange={(e) => setHospitalForm(prev => ({ ...prev, hospitalName: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            {/* Hospital Phone Number + OTP */}
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Hospital Phone Number *</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. 9848012345"
                    value={hospitalForm.phone}
                    onChange={(e) => {
                      setHospitalForm(prev => ({ ...prev, phone: e.target.value }));
                      setIsPhoneVerified(false);
                    }}
                    className={`w-full bg-slate-900 border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white ${
                      isPhoneVerified ? 'border-emerald-500/80 bg-emerald-950/20' : 'border-slate-800'
                    }`}
                    required
                  />
                </div>

                {!isPhoneVerified ? (
                  <button
                    type="button"
                    onClick={() => handleSendInstantOtp(hospitalForm.phone)}
                    disabled={timerSeconds > 0}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 min-w-max"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {timerSeconds > 0 ? `Resend (${timerSeconds}s)` : 'Send OTP'}
                  </button>
                ) : (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Verified
                  </span>
                )}
              </div>
            </div>

            {/* GUARANTEED INSTANT MOBILE SMS CARD DISPLAY */}
            {otpSent && !isPhoneVerified && showMobileSmsCard && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-4 rounded-2xl border-2 border-emerald-500/50 space-y-3 shadow-xl animate-fadeIn">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" /> Hospital Phone SMS Inbox (+91 {targetPhone})
                  </span>
                  <button
                    type="button"
                    onClick={handleInstantFill}
                    className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-500/30"
                  >
                    <Zap className="w-3 h-3 text-amber-400" /> Auto-Fill Code ({generatedOtp})
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-mono">From: CarePulse-Verification</span>
                  <p className="text-white font-medium mt-0.5">
                    Your CarePulse verification code is: <strong className="text-emerald-300 font-mono text-sm tracking-widest font-extrabold">{generatedOtp}</strong>. Valid for 5 mins.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP code"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center font-mono text-white text-sm font-bold tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow"
                  >
                    Verify OTP
                  </button>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. info@carecure.com"
                value={hospitalForm.email}
                onChange={(e) => setHospitalForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">City</label>
                <select
                  value={hospitalForm.city}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Vijayawada">Vijayawada</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Area / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. Jubilee Hills"
                  value={hospitalForm.area}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={hospitalForm.password}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={hospitalForm.confirmPassword}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full font-bold py-3.5 rounded-xl text-xs transition-all ${
                isPhoneVerified 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {isPhoneVerified ? 'Submit Hospital Registration (Pending Admin Approval)' : '⚠️ Please Verify Hospital Phone with OTP First'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
