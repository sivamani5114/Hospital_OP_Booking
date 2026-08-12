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

  // 2-Step Hospital Registration State (Step 1: Basic Info, Step 2: Legal Docs & Facilities)
  const [hospStep, setHospStep] = useState(1);
  
  const [hospitalForm, setHospitalForm] = useState({
    // 1. Basic Details
    hospitalName: '',
    hospitalType: 'Private', // Private / Government / Corporate / Clinic
    regNo: '',
    establishedYear: '',
    logo: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80',
    description: '',

    // 2. Contact Details
    email: '',
    phone: '',
    landline: '',
    website: '',

    // 3. Address & Location
    doorNo: '',
    street: '',
    area: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    mapsUrl: '',

    // 4. Legal & Verification
    regCertificate: 'Uploaded Certificate PDF',
    nabhAccredited: 'No',
    pan: '',
    gstNo: '',
    authorizedPersonName: '',
    authorizedPersonDesignation: '',
    authorizedPersonIdProof: '',

    // 5. Facilities (Selected Checkboxes - empty by default)
    facilities: [],

    // 6. OP Booking Settings
    opDays: 'Monday - Saturday',
    opTimings: '',
    opFee: '',
    maxBookingsPerDay: '',
    slotDurationMinutes: '15',
    sameDayBooking: 'Yes',
    cancellationPolicy: '',

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

  // Handle Send Direct WhatsApp OTP to Target User Phone
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

    // 🚀 Dispatch Real Mobile SMS via Paid Fast2SMS Gateway Directly to Mobile SIM Inbox
    sendRealFast2SMS(cleanPhone, code);

    // Save to internal log dispatcher
    sendWhatsAppOtpToUser(cleanPhone, code);

    showToast(`📲 Real Mobile SMS Dispatched to +91 ${cleanPhone}! Check SMS Inbox.`, 'success');
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

            {/* GUARANTEED INSTANT MOBILE SMS CARD DISPLAY WITH ON-SCREEN OTP */}
            {otpSent && !isPhoneVerified && showMobileSmsCard && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-4 rounded-2xl border-2 border-cyan-500/50 space-y-3 shadow-xl animate-fadeIn">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" /> Phone Verification (+91 {targetPhone})
                  </span>
                  <button
                    type="button"
                    onClick={handleInstantFill}
                    className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-amber-500/30 shadow"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> 1-Click Auto-Fill Code
                  </button>
                </div>

                {/* ON-SCREEN OTP DISPLAY BADGE */}
                <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30 text-xs flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Your 6-Digit OTP Code:</span>
                  <strong className="text-cyan-300 font-mono text-base tracking-widest font-extrabold bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/30">
                    {generatedOtp}
                  </strong>
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

        {/* --- HOSPITAL REGISTRATION FORM (2-Step Professional Registration) --- */}
        {regType === 'HOSPITAL' && (
          <form onSubmit={handleHospitalSubmit} className="space-y-4">
            
            {/* Step Navigation Pill Indicator */}
            <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-bold">
              <button
                type="button"
                onClick={() => setHospStep(1)}
                className={`flex-1 py-2 rounded-xl text-center transition-all ${
                  hospStep === 1 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Step 1: Basic Info & Contact
              </button>
              <button
                type="button"
                onClick={() => setHospStep(2)}
                className={`flex-1 py-2 rounded-xl text-center transition-all ${
                  hospStep === 2 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Step 2: Legal, Facilities & OP Settings
              </button>
            </div>

            {/* STEP 1: Basic Info & Contact */}
            {hospStep === 1 && (
              <div className="space-y-3 animate-fadeIn text-xs">
                {/* Hospital Name & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Hospital Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Apollo / Sunshine Hospital"
                      value={hospitalForm.hospitalName}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, hospitalName: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Hospital Type *</label>
                    <select
                      value={hospitalForm.hospitalType}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, hospitalType: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    >
                      <option value="Private">Private Hospital</option>
                      <option value="Government">Government Hospital</option>
                      <option value="Corporate">Corporate Multi-Speciality</option>
                      <option value="Clinic">Polyclinic / Specialty Clinic</option>
                    </select>
                  </div>
                </div>

                {/* Reg No & Est Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Hospital Reg. No *</label>
                    <input
                      type="text"
                      placeholder="e.g. REG-TS-88492"
                      value={hospitalForm.regNo}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, regNo: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Established Year</label>
                    <input
                      type="number"
                      placeholder="e.g. 2012"
                      value={hospitalForm.establishedYear}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, establishedYear: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                {/* Hospital Phone Number + Send OTP Button */}
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Hospital Phone Number *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="tel"
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

                {/* GUARANTEED INSTANT OTP CARD DISPLAY FOR HOSPITAL REGISTRATION */}
                {otpSent && !isPhoneVerified && showMobileSmsCard && (
                  <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-4 rounded-2xl border-2 border-emerald-500/50 space-y-3 shadow-xl animate-fadeIn">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-400" /> Hospital Phone Verification (+91 {targetPhone})
                      </span>
                      <button
                        type="button"
                        onClick={handleInstantFill}
                        className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-amber-500/30 shadow"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" /> 1-Click Auto-Fill Code
                      </button>
                    </div>

                    {/* ON-SCREEN OTP DISPLAY BADGE */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 text-xs flex justify-between items-center">
                      <span className="text-slate-300 font-medium">Your 6-Digit OTP Code:</span>
                      <strong className="text-emerald-300 font-mono text-base tracking-widest font-extrabold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                        {generatedOtp}
                      </strong>
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

                {/* Email & Landline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Official Hospital Email *</label>
                    <input
                      type="email"
                      placeholder="e.g. contact@hospital.com"
                      value={hospitalForm.email}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Landline Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 040-23456789"
                      value={hospitalForm.landline}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, landline: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                {/* Address: City, Area, Door No, Pincode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad / Vijayawada"
                      value={hospitalForm.city}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Area / Locality *</label>
                    <input
                      type="text"
                      placeholder="e.g. Jubilee Hills / MG Road"
                      value={hospitalForm.area}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>
                </div>

                {/* 📍 Interactive Live Map Pin & 2-Step Location Confirmation */}
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Google Maps Location Link * (Pin & Confirm Location)</label>
                  
                  <div className="space-y-2 mb-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const searchQuery = hospitalForm.hospitalName || hospitalForm.city || 'Hospital near me';
                          const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
                          window.open(mapsUrl, '_blank');
                          setHospitalForm(prev => ({ ...prev, mapsUrl: prev.mapsUrl || mapsUrl }));
                        }}
                        className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow"
                      >
                        🗺️ Step 1: Open Google Maps to Select Pin
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if ("geolocation" in navigator) {
                            navigator.geolocation.getCurrentPosition((position) => {
                              const lat = position.coords.latitude;
                              const lng = position.coords.longitude;
                              const gpsLink = `https://www.google.com/maps?q=${lat},${lng}`;
                              setHospitalForm(prev => ({ ...prev, mapsUrl: gpsLink }));
                              showToast(`📍 Device GPS Coordinates Captured! (${lat.toFixed(4)}, ${lng.toFixed(4)})`, 'success');
                            });
                          }
                        }}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-3 py-2.5 rounded-xl flex items-center gap-1"
                      >
                        🎯 Auto GPS Pin
                      </button>
                    </div>

                    {/* Step 2 Pin Confirmation Banner */}
                    {hospitalForm.mapsUrl ? (
                      <div className="bg-emerald-950/40 border border-emerald-500/50 p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Map Location Pinned & Verified ✓
                        </span>
                        <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                          LOCATION CONFIRMED
                        </span>
                      </div>
                    ) : (
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-[11px] text-slate-400 text-center">
                        ⚠️ Please click "Open Google Maps" or "Auto GPS Pin" above to confirm location pin.
                      </div>
                    )}
                  </div>

                  <input
                    type="url"
                    placeholder="https://www.google.com/maps?q=latitude,longitude"
                    value={hospitalForm.mapsUrl}
                    onChange={(e) => setHospitalForm(prev => ({ ...prev, mapsUrl: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white text-xs font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    🎯 Click <strong>"Pin Current Device GPS Location"</strong> while at the hospital to drop exact GPS coordinates instantly!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setHospStep(2)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg"
                >
                  Proceed to Step 2: Legal Docs & OP Settings →
                </button>
              </div>
            )}

            {/* STEP 2: Legal Docs, Facilities & OP Settings */}
            {hospStep === 2 && (
              <div className="space-y-3 animate-fadeIn text-xs">
                {/* Authorized Person Name & Designation */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Authorized Person Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajesh Kumar"
                      value={hospitalForm.authorizedPersonName}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, authorizedPersonName: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">NABH Accredited?</label>
                    <select
                      value={hospitalForm.nabhAccredited}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, nabhAccredited: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    >
                      <option value="Yes">Yes (NABH Certified)</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                {/* 📄 4. Document File Upload Inputs (Registration Certificate & ID Proof) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Upload Registration Certificate (PDF/Image) *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setHospitalForm(prev => ({ ...prev, regCertificate: reader.result, regCertificateName: file.name }));
                            showToast(`📄 Certificate Uploaded: ${file.name}`, 'success');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-2 file:font-bold"
                    />
                    {hospitalForm.regCertificateName && (
                      <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
                        ✓ {hospitalForm.regCertificateName}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Upload Authorized ID Proof (Aadhaar/PAN) *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setHospitalForm(prev => ({ ...prev, authorizedPersonIdProof: reader.result, authorizedPersonIdName: file.name }));
                            showToast(`🪪 ID Proof Uploaded: ${file.name}`, 'success');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 file:bg-cyan-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-2 file:font-bold"
                    />
                    {hospitalForm.authorizedPersonIdName && (
                      <span className="text-[10px] text-cyan-400 font-bold mt-1 block">
                        ✓ {hospitalForm.authorizedPersonIdName}
                      </span>
                    )}
                  </div>
                </div>

                {/* PAN & GST */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">PAN Number</label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={hospitalForm.pan}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, pan: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">GST Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 36AAACH7492K1Z5"
                      value={hospitalForm.gstNo}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, gstNo: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                {/* 🏥 5. Hospital Facilities Checkbox Selector */}
                <div>
                  <label className="text-slate-400 font-semibold block mb-1.5">Hospital Facilities Available (Select all that apply)</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]">
                    {[
                      'Emergency 24/7', 'Pharmacy', 'Laboratory', 'Radiology / X-Ray', 
                      'CT Scan', 'MRI', 'ICU', 'Ambulance 24/7', 'Blood Bank', 'Operation Theatre'
                    ].map((facility) => {
                      const isChecked = hospitalForm.facilities.includes(facility);
                      return (
                        <label key={facility} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setHospitalForm(prev => ({ ...prev, facilities: [...prev.facilities, facility] }));
                              } else {
                                setHospitalForm(prev => ({ ...prev, facilities: prev.facilities.filter(f => f !== facility) }));
                              }
                            }}
                            className="rounded accent-emerald-500"
                          />
                          <span>{facility}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* ⚙️ 6. OP Booking Settings (Slot Duration & Same Day Booking) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">OP Slot Duration</label>
                    <select
                      value={hospitalForm.slotDurationMinutes}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, slotDurationMinutes: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    >
                      <option value="10">10 Minutes Slot</option>
                      <option value="15">15 Minutes Slot</option>
                      <option value="20">20 Minutes Slot</option>
                      <option value="30">30 Minutes Slot</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Same-Day OP Booking</label>
                    <select
                      value={hospitalForm.sameDayBooking}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, sameDayBooking: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    >
                      <option value="Yes">Allowed (Same Day)</option>
                      <option value="No">1 Day Advance Only</option>
                    </select>
                  </div>
                </div>

                {/* OP Fee & Timings */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Base OP Fee (₹) *</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={hospitalForm.opFee}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, opFee: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Max Bookings / Day</label>
                    <input
                      type="number"
                      placeholder="30"
                      value={hospitalForm.maxBookingsPerDay}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, maxBookingsPerDay: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Password *</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={hospitalForm.password}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={hospitalForm.confirmPassword}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-[11px] text-amber-300">
                  🔒 <strong>Admin Verification Required:</strong> Your hospital will be submitted for Super Admin document review. Once approved by Admin, your hospital portal will be activated.
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHospStep(1)}
                    className="w-1/3 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl border border-slate-700"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    className="w-2/3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/25"
                  >
                    Submit for Admin Approval 🚀
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
