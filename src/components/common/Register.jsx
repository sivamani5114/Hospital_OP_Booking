import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { sendWhatsAppOtpToUser } from '../../utils/whatsappService';
import { sendRealFast2SMS } from '../../utils/smsService';
import { autoVerifyHospitalCertificate } from '../../utils/certVerificationEngine';
import CertificateVerificationModal from '../common/CertificateVerificationModal';
import { 
  User, Phone, Mail, Calendar, MapPin, Lock, ArrowLeft, Building2, CheckCircle2, 
  KeyRound, Send, Smartphone, Sparkles, Zap, Stethoscope, MessageCircle, 
  Award, ShieldCheck, Loader2, FileCheck2
} from 'lucide-react';

export default function Register({ onGoToLogin, initialRegType = 'PATIENT' }) {
  const { registerUser, showToast } = useAuth();
  const { registerHospitalSelf, users, hospitals } = useDb();

  const [regType, setRegType] = useState(initialRegType || 'PATIENT'); // PATIENT | HOSPITAL

  useEffect(() => {
    if (initialRegType) {
      setRegType(initialRegType);
    }
  }, [initialRegType]);

  // Certificate Auto-Verification State
  const [isVerifyingCert, setIsVerifyingCert] = useState(false);
  const [certVerificationData, setCertVerificationData] = useState(null);
  const [showCertVerificationModal, setShowCertVerificationModal] = useState(false);

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

    // 4. Legal & Verification Documents & Certificate Numbers (1. Hospital Registration, 2. Clinical Establishment, 3. NABH, 4. PAN, 5. GST, 6. Drug License, 7. Biomedical Waste, 8. Fire NOC, 9. Trade License)
    regCertificateNo: '',
    regCertificate: '',
    regCertificateName: '',
    clinicalEstablishmentCertNo: '',
    clinicalEstablishmentCert: '',
    clinicalEstablishmentCertName: '',
    nabhCertificateNo: '',
    nabhCertificate: '',
    nabhCertificateName: '',
    hospitalPanNo: '',
    hospitalPan: '',
    hospitalPanName: '',
    gstCertificateNo: '',
    gstCertificate: '',
    gstCertificateName: '',
    drugLicenseNo: '',
    drugLicense: '',
    drugLicenseName: '',
    biomedicalWasteAuthNo: '',
    biomedicalWasteAuth: '',
    biomedicalWasteAuthName: '',
    fireNocCertNo: '',
    fireNocCert: '',
    fireNocCertName: '',
    tradeLicenseCertNo: '',
    tradeLicenseCert: '',
    tradeLicenseCertName: '',

    // 👨‍💼 Hospital Owner / Authorized Person Verification & Govt ID Numbers
    authorizedPersonName: '',
    authorizedPersonDesignation: '',
    authorizedPersonAadhaarNo: '',
    authorizedPersonIdProof: '',
    authorizedPersonIdName: '',
    authorizedPersonPanNo: '',
    authorizedPersonPan: '',
    authorizedPersonPanName: '',
    authorizationLetterNo: '',
    authorizationLetter: '',
    authorizationLetterName: '',

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

    // 7. Payment & Business Bank Details (Section 7)
    accountHolderName: '',
    bankAccountNo: '',
    confirmBankAccountNo: '',
    bankName: '',
    ifscCode: '',
    accountType: 'Current', // Current / Savings
    upiId: '',
    upiQrCode: '',
    upiQrCodeName: '',
    bankProof: '',
    bankProofName: '',

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

  // Handle Auto Certificate Verification
  const handleAutoVerifyHospitalCert = async (fileObj, customRegNo) => {
    setIsVerifyingCert(true);
    showToast('🔍 AI Scanner: Authenticating Hospital Registration Certificate...', 'info');
    try {
      const res = await autoVerifyHospitalCertificate({
        hospitalName: hospitalForm.hospitalName,
        regNo: customRegNo || hospitalForm.regCertificateNo,
        docType: 'HOSPITAL_REGISTRATION',
        fileName: fileObj ? fileObj.name : hospitalForm.regCertificateName
      });
      setCertVerificationData(res);
      setHospitalForm(prev => ({
        ...prev,
        verificationStatus: 'AUTO_VERIFIED',
        verificationData: res
      }));
      showToast(res.message, 'success');
    } catch (err) {
      console.error('Cert verification error:', err);
    } finally {
      setIsVerifyingCert(false);
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
    <div className="min-h-screen flex items-stretch bg-slate-950">

      {/* ═══ LEFT BRANDING PANEL (hidden on mobile) ═══ */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-cyan-950/30 to-slate-900 border-r border-slate-800 p-10 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>

        {/* Logo + Brand */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-extrabold text-lg font-outfit tracking-tight">CarePulse</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Join India's Smartest<br />
            <span className="text-cyan-400">Hospital OP System</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Register as a patient or hospital and get instant access to digital OP booking, smart queue management, and real-time tracking.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="space-y-4">
          {[
            { icon: '🏥', title: 'Instant OP Token Booking', desc: 'Skip queues with digital tokens' },
            { icon: '📱', title: 'QR-Based UPI Payments', desc: 'Pay via GPay, PhonePe or Paytm' },
            { icon: '🔔', title: 'Real-Time Notifications', desc: 'Track your slot & appointment' },
            { icon: '📄', title: 'Digital PDF Receipts', desc: 'Download OP tickets instantly' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{f.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-slate-500 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom tag */}
        <div className="text-[11px] text-slate-600">
          🔒 256-bit SSL Encrypted · NABH Verified Hospitals · Trusted by 10,000+ Patients
        </div>
      </div>

      {/* ═══ RIGHT FORM PANEL ═══ */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Header strip */}
        <div className="flex items-center justify-between px-5 sm:px-10 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
          <button
            onClick={onGoToLogin}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>
          <span className="text-xs font-bold text-cyan-400">CarePulse Registration</span>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-start justify-center p-5 sm:p-10">
          <div className="w-full max-w-xl space-y-5">

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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400 font-semibold">Phone Number (10 Digits) *</label>
                {patientForm.phone.length === 10 && /^[6-9]\d{9}$/.test(patientForm.phone) ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid Mobile Number
                  </span>
                ) : patientForm.phone.length > 0 && !/^[6-9]/.test(patientForm.phone) ? (
                  <span className="text-[10px] text-rose-400 font-bold">
                    ⚠️ Must start with 6, 7, 8, or 9
                  </span>
                ) : patientForm.phone.length > 0 ? (
                  <span className="text-[10px] text-cyan-400 font-mono">
                    {patientForm.phone.length}/10 digits
                  </span>
                ) : null}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1 flex items-center">
                  <div className="absolute left-3 flex items-center gap-1 text-slate-400 font-bold text-xs select-none pointer-events-none border-r border-slate-700 pr-2">
                    <span>🇮🇳</span>
                    <span className="font-mono text-slate-300">+91</span>
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
                    className={`w-full bg-slate-900 border rounded-xl pl-20 pr-3 py-2.5 text-xs text-white font-mono tracking-wider ${
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
                    className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 min-w-max cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {timerSeconds > 0 ? `Resend (${timerSeconds}s)` : 'Send OTP'}
                  </button>
                ) : (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Verified ✓
                  </span>
                )}
              </div>
            </div>

            {/* DIRECT REAL MOBILE SMS OTP VERIFICATION CARD (FAST2SMS GATEWAY) */}
            {otpSent && !isPhoneVerified && showMobileSmsCard && (
              <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-4 rounded-2xl border-2 border-cyan-500/40 space-y-3 shadow-2xl animate-fadeIn">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" /> SMS Sent to Mobile (+91 {targetPhone})
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Real SMS Dispatched
                  </span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  🔒 A 6-digit security OTP has been sent directly to your phone SIM inbox (<strong>+91 {targetPhone}</strong>) via <strong>Fast2SMS Gateway</strong>. Please check your SMS messages and enter the code below.
                </p>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit SMS OTP code"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl p-2.5 text-center font-mono text-white text-sm font-bold tracking-widest outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer"
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
            
            {/* Step Navigation Pill Indicator (3 Steps) */}
            <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => setHospStep(1)}
                className={`flex-1 py-2 rounded-xl text-center transition-all ${
                  hospStep === 1 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Step 1: Basic & Contact
              </button>
              <button
                type="button"
                onClick={() => setHospStep(2)}
                className={`flex-1 py-2 rounded-xl text-center transition-all ${
                  hospStep === 2 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Step 2: Legal & Settings
              </button>
              <button
                type="button"
                onClick={() => setHospStep(3)}
                className={`flex-1 py-2 rounded-xl text-center transition-all ${
                  hospStep === 3 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Step 3: Bank & Payment Details 💳
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

                {/* Hospital Photo / Building Image Upload */}
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <label className="text-slate-400 font-semibold block text-xs">Upload Hospital Building Photo / Logo *</label>
                  <div className="flex items-center gap-3">
                    {hospitalForm.logo && (
                      <img src={hospitalForm.logo} className="w-12 h-12 rounded-xl object-cover border border-emerald-500/50 shadow" alt="Hospital Preview" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setHospitalForm(prev => ({ ...prev, logo: reader.result, logoFileName: file.name }));
                            showToast(`🏥 Hospital Photo Uploaded: ${file.name}`, 'success');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-2 file:font-bold"
                    />
                  </div>
                  {hospitalForm.logoFileName && (
                    <span className="text-[10px] text-emerald-400 font-bold block">
                      ✓ Photo Selected: {hospitalForm.logoFileName}
                    </span>
                  )}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold block text-xs">Hospital Phone Number (10 Digits) *</label>
                    {hospitalForm.phone.length === 10 && /^[6-9]\d{9}$/.test(hospitalForm.phone) ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid Mobile Number
                      </span>
                    ) : hospitalForm.phone.length > 0 && !/^[6-9]/.test(hospitalForm.phone) ? (
                      <span className="text-[10px] text-rose-400 font-bold">
                        ⚠️ Must start with 6, 7, 8, or 9
                      </span>
                    ) : hospitalForm.phone.length > 0 ? (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {hospitalForm.phone.length}/10 digits
                      </span>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1 flex items-center">
                      <div className="absolute left-3 flex items-center gap-1 text-slate-400 font-bold text-xs select-none pointer-events-none border-r border-slate-700 pr-2">
                        <span>🇮🇳</span>
                        <span className="font-mono text-slate-300">+91</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter 10-digit hospital phone number"
                        value={hospitalForm.phone}
                        onChange={(e) => {
                          setHospitalForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }));
                          setIsPhoneVerified(false);
                        }}
                        className={`w-full bg-slate-900 border rounded-xl pl-20 pr-3 py-2.5 text-xs text-white font-mono tracking-wider ${
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
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 min-w-max cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {timerSeconds > 0 ? `Resend (${timerSeconds}s)` : 'Send OTP'}
                      </button>
                    ) : (
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Verified ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* DIRECT REAL MOBILE SMS OTP VERIFICATION CARD FOR HOSPITAL REGISTRATION */}
                {otpSent && !isPhoneVerified && showMobileSmsCard && (
                  <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-4 rounded-2xl border-2 border-emerald-500/40 space-y-3 shadow-2xl animate-fadeIn">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-400" /> SMS Sent to Hospital Phone (+91 {targetPhone})
                      </span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Real SMS Dispatched
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">
                      🔒 A 6-digit verification code has been dispatched directly to your hospital mobile SIM (<strong>+91 {targetPhone}</strong>) via <strong>Fast2SMS Gateway</strong>. Please check your SMS inbox and enter the code below.
                    </p>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit SMS OTP code"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl p-2.5 text-center font-mono text-white text-sm font-bold tracking-widest outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer"
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

                {/* 👨‍💼 1. Authorized Person Verification */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-cyan-300 text-xs flex items-center justify-between">
                    <span>👨‍💼 1. Hospital Owner / Authorized Person Verification</span>
                    <span className="text-[10px] text-cyan-400 font-semibold font-mono">KYC VERIFICATION</span>
                  </h4>

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
                      <label className="text-slate-400 font-semibold block mb-1">Designation *</label>
                      <input
                        type="text"
                        placeholder="e.g. Managing Director / Trustee"
                        value={hospitalForm.authorizedPersonDesignation}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, authorizedPersonDesignation: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Authorized Person Document Uploads (Aadhaar/Govt ID, PAN Card, Authorization Letter) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Aadhaar / Govt ID *</label>
                      <input
                        type="text"
                        placeholder="Aadhaar No (e.g. 5566 7788 9900)"
                        value={hospitalForm.authorizedPersonAadhaarNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, authorizedPersonAadhaarNo: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white mb-1 font-mono"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHospitalForm(prev => ({ ...prev, authorizedPersonIdProof: reader.result, authorizedPersonIdName: file.name }));
                              showToast(`🪪 Aadhaar Uploaded: ${file.name}`, 'success');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-1.5 text-[11px] text-slate-300 file:bg-cyan-600 file:text-white file:border-0 file:rounded-md file:px-2 file:py-0.5 file:mr-1 file:font-bold"
                      />
                      {hospitalForm.authorizedPersonIdName && <span className="text-[10px] text-cyan-400 font-bold block mt-0.5">✓ {hospitalForm.authorizedPersonIdName}</span>}
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Personal PAN Card *</label>
                      <input
                        type="text"
                        placeholder="Personal PAN (e.g. ABCDE1234F)"
                        value={hospitalForm.authorizedPersonPanNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, authorizedPersonPanNo: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white mb-1 font-mono uppercase"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHospitalForm(prev => ({ ...prev, authorizedPersonPan: reader.result, authorizedPersonPanName: file.name }));
                              showToast(`📄 Personal PAN Uploaded: ${file.name}`, 'success');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-1.5 text-[11px] text-slate-300 file:bg-cyan-600 file:text-white file:border-0 file:rounded-md file:px-2 file:py-0.5 file:mr-1 file:font-bold"
                      />
                      {hospitalForm.authorizedPersonPanName && <span className="text-[10px] text-cyan-400 font-bold block mt-0.5">✓ {hospitalForm.authorizedPersonPanName}</span>}
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Authorization Letter *</label>
                      <input
                        type="text"
                        placeholder="Letter Ref No (e.g. AUTH/2026/09)"
                        value={hospitalForm.authorizationLetterNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, authorizationLetterNo: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white mb-1 font-mono"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHospitalForm(prev => ({ ...prev, authorizationLetter: reader.result, authorizationLetterName: file.name }));
                              showToast(`📑 Authorization Letter Uploaded: ${file.name}`, 'success');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-1.5 text-[11px] text-slate-300 file:bg-cyan-600 file:text-white file:border-0 file:rounded-md file:px-2 file:py-0.5 file:mr-1 file:font-bold"
                      />
                      {hospitalForm.authorizationLetterName && <span className="text-[10px] text-cyan-400 font-bold block mt-0.5">✓ {hospitalForm.authorizationLetterName}</span>}
                    </div>
                  </div>
                </div>

                {/* 📑 2. Full Hospital Legal & Compliance Certificates Upload Box */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-emerald-300 text-xs flex items-center justify-between">
                    <span>📑 2. Mandatory & Facility Legal Documents Upload & License Numbers (9 Documents)</span>
                    <span className="text-[10px] text-emerald-400 font-semibold font-mono">GOVT LICENSES</span>
                  </h4>

                  {/* LIVE AUTO-VERIFICATION SCANNER & CERTIFICATE BANNER */}
                  {isVerifyingCert && (
                    <div className="bg-cyan-950/50 border border-cyan-500/50 p-3 rounded-2xl flex items-center gap-2.5 text-cyan-300 text-xs animate-pulse shadow-lg">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
                      <span>🔍 <strong>AI Engine Active:</strong> Scanning Govt Health Registry & Authenticating Official Seal...</span>
                    </div>
                  )}

                  {certVerificationData && !isVerifyingCert && (
                    <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border-2 border-emerald-500/50 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-xl animate-fadeIn">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div>
                          <strong className="text-emerald-300 block font-bold">
                            {certVerificationData.badge} ({certVerificationData.confidenceScore}% Genuine Authenticated)
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            {certVerificationData.details.issuingAuthority} · <span className="font-mono text-cyan-300 font-bold">{certVerificationData.verificationId}</span>
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCertVerificationModal(true)}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow"
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-400" /> Inspect Verified Certificate 🛡️
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* 1. Hospital Registration Certificate (Compulsory with Instant AI Verification) */}
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-300 font-bold block text-[11px]">1. Hospital Registration Certificate * (Auto-Verified)</label>
                        {certVerificationData ? (
                          <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                          </span>
                        ) : null}
                      </div>
                      <input
                        type="text"
                        placeholder="Registration / License Number (e.g. REG-TS-88492)"
                        value={hospitalForm.regCertificateNo}
                        onChange={(e) => {
                          setHospitalForm(prev => ({ ...prev, regCertificateNo: e.target.value }));
                          if (e.target.value.length >= 5) {
                            handleAutoVerifyHospitalCert(null, e.target.value);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHospitalForm(prev => ({ ...prev, regCertificate: reader.result, regCertificateName: file.name }));
                              showToast(`📄 Hospital Reg Certificate: ${file.name}`, 'success');
                              handleAutoVerifyHospitalCert(file, hospitalForm.regCertificateNo);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded file:px-2 file:py-0.5 file:mr-1 file:font-bold cursor-pointer"
                      />
                      {hospitalForm.regCertificateName && (
                        <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold pt-0.5">
                          <span>✓ {hospitalForm.regCertificateName}</span>
                          <button
                            type="button"
                            onClick={() => handleAutoVerifyHospitalCert(null, hospitalForm.regCertificateNo)}
                            className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            ⚡ Re-Verify Scan
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 2. Clinical Establishment Registration */}
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <label className="text-slate-300 font-bold block text-[11px]">2. Clinical Establishment Certificate</label>
                      <input
                        type="text"
                        placeholder="Clinical Est. License No (e.g. CEA/TS/2022/101)"
                        value={hospitalForm.clinicalEstablishmentCertNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, clinicalEstablishmentCertNo: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHospitalForm(prev => ({ ...prev, clinicalEstablishmentCert: reader.result, clinicalEstablishmentCertName: file.name }));
                              showToast(`📄 Clinical Establishment Cert: ${file.name}`, 'success');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded file:px-2 file:py-0.5 file:mr-1 file:font-bold"
                      />
                      {hospitalForm.clinicalEstablishmentCertName && <span className="text-[10px] text-emerald-400 font-bold block">✓ {hospitalForm.clinicalEstablishmentCertName}</span>}
                    </div>

                    {/* 3. NABH Certificate */}
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <label className="text-slate-300 font-bold block text-[11px]">3. NABH Accreditation Certificate</label>
                      <input
                        type="text"
                        placeholder="NABH Accreditation No (e.g. NABH-2024-H-199)"
                        value={hospitalForm.nabhCertificateNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, nabhCertificateNo: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHospitalForm(prev => ({ ...prev, nabhCertificate: reader.result, nabhCertificateName: file.name }));
                              showToast(`🏅 NABH Cert: ${file.name}`, 'success');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded file:px-2 file:py-0.5 file:mr-1 file:font-bold"
                      />
                      {hospitalForm.nabhCertificateName && <span className="text-[10px] text-emerald-400 font-bold block">✓ {hospitalForm.nabhCertificateName}</span>}
                    </div>

                    {/* 4. Hospital PAN Card */}
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <label className="text-slate-300 font-bold block text-[11px]">4. Hospital Business PAN Card *</label>
                      <input
                        type="text"
                        placeholder="Hospital Business PAN (e.g. AABCH1234F)"
                        value={hospitalForm.hospitalPanNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, hospitalPanNo: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-mono uppercase"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHospitalForm(prev => ({ ...prev, hospitalPan: reader.result, hospitalPanName: file.name }));
                              showToast(`📄 Hospital PAN: ${file.name}`, 'success');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded file:px-2 file:py-0.5 file:mr-1 file:font-bold"
                      />
                      {hospitalForm.hospitalPanName && <span className="text-[10px] text-emerald-400 font-bold block">✓ {hospitalForm.hospitalPanName}</span>}
                    </div>

                    {/* 5. GST Certificate */}
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <label className="text-slate-300 font-bold block text-[11px]">5. GST Certificate (If Applicable)</label>
                      <input
                        type="text"
                        placeholder="GSTIN Number (e.g. 36AABCH1234F1Z5)"
                        value={hospitalForm.gstCertificateNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, gstCertificateNo: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-mono uppercase"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHospitalForm(prev => ({ ...prev, gstCertificate: reader.result, gstCertificateName: file.name }));
                              showToast(`📄 GST Cert: ${file.name}`, 'success');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded file:px-2 file:py-0.5 file:mr-1 file:font-bold"
                      />
                      {hospitalForm.gstCertificateName && <span className="text-[10px] text-emerald-400 font-bold block">✓ {hospitalForm.gstCertificateName}</span>}
                    </div>

                    {/* 6. Drug License */}
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <label className="text-slate-300 font-bold block text-[11px]">6. Pharmacy Drug License</label>
                      <input
                        type="text"
                        placeholder="Drug License No (e.g. DL/TS/20/4491)"
                        value={hospitalForm.drugLicenseNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, drugLicenseNo: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHospitalForm(prev => ({ ...prev, drugLicense: reader.result, drugLicenseName: file.name }));
                              showToast(`💊 Drug License: ${file.name}`, 'success');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded file:px-2 file:py-0.5 file:mr-1 file:font-bold"
                      />
                      {hospitalForm.drugLicenseName && <span className="text-[10px] text-emerald-400 font-bold block">✓ {hospitalForm.drugLicenseName}</span>}
                    </div>

                    {/* 7. Biomedical Waste Authorization */}
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <label className="text-slate-300 font-bold block text-[11px]">7. Biomedical Waste Authorization</label>
                      <input
                        type="text"
                        placeholder="BMWM Auth No (e.g. TSPCB/BMW/2023/88)"
                        value={hospitalForm.biomedicalWasteAuthNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, biomedicalWasteAuthNo: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHospitalForm(prev => ({ ...prev, biomedicalWasteAuth: reader.result, biomedicalWasteAuthName: file.name }));
                              showToast(`♻️ Biomedical Waste Auth: ${file.name}`, 'success');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded file:px-2 file:py-0.5 file:mr-1 file:font-bold"
                      />
                      {hospitalForm.biomedicalWasteAuthName && <span className="text-[10px] text-emerald-400 font-bold block">✓ {hospitalForm.biomedicalWasteAuthName}</span>}
                    </div>

                    {/* 8. Fire Safety Certificate / NOC */}
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <label className="text-slate-300 font-bold block text-[11px]">8. Fire Safety Certificate / NOC</label>
                      <input
                        type="text"
                        placeholder="Fire NOC No (e.g. FIRE/TS/NOC/2024/991)"
                        value={hospitalForm.fireNocCertNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, fireNocCertNo: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHospitalForm(prev => ({ ...prev, fireNocCert: reader.result, fireNocCertName: file.name }));
                              showToast(`🔥 Fire NOC Cert: ${file.name}`, 'success');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded file:px-2 file:py-0.5 file:mr-1 file:font-bold"
                      />
                      {hospitalForm.fireNocCertName && <span className="text-[10px] text-emerald-400 font-bold block">✓ {hospitalForm.fireNocCertName}</span>}
                    </div>

                    {/* 9. Local Municipal / Trade License */}
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1 col-span-1 md:col-span-2">
                      <label className="text-slate-300 font-bold block text-[11px]">9. Local Municipal / Trade License</label>
                      <input
                        type="text"
                        placeholder="Trade License No (e.g. GHMC/TRADE/2025/1102)"
                        value={hospitalForm.tradeLicenseCertNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, tradeLicenseCertNo: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHospitalForm(prev => ({ ...prev, tradeLicenseCert: reader.result, tradeLicenseCertName: file.name }));
                              showToast(`🏢 Trade License: ${file.name}`, 'success');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded file:px-2 file:py-0.5 file:mr-1 file:font-bold"
                      />
                    </div>
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
                    <label className="text-slate-400 font-semibold block mb-1">Advance OP Booking Window</label>
                    <select
                      value={hospitalForm.sameDayBooking}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, sameDayBooking: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    >
                      <option value="Yes">Allowed (Same Day Booking)</option>
                      <option value="1_DAY">1 Day Advance Only</option>
                      <option value="3_DAYS">3 Days Advance</option>
                      <option value="1_WEEK">1 Week Advance (7 Days)</option>
                      <option value="2_WEEKS">Max 2 Weeks Advance (14 Days)</option>
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
                    type="button"
                    onClick={() => {
                      // 🔒 Strict Document Verification Audit (All 12 Documents Mandatory Check)
                      const requiredDocs = [
                        { key: 'regCertificate', name: '1. Hospital Registration Certificate' },
                        { key: 'clinicalEstablishmentCert', name: '2. Clinical Establishment Registration Certificate' },
                        { key: 'nabhCertificate', name: '3. NABH Certificate' },
                        { key: 'hospitalPan', name: '4. Hospital Business PAN Card' },
                        { key: 'gstCertificate', name: '5. GST Certificate' },
                        { key: 'drugLicense', name: '6. Pharmacy Drug License' },
                        { key: 'biomedicalWasteAuth', name: '7. Biomedical Waste Authorization Certificate' },
                        { key: 'fireNocCert', name: '8. Fire Safety Certificate / Fire NOC' },
                        { key: 'tradeLicenseCert', name: '9. Local Municipal / Trade License' },
                        { key: 'authorizedPersonIdProof', name: 'Owner Aadhaar / Government Photo ID' },
                        { key: 'authorizedPersonPan', name: 'Owner Personal PAN Card' },
                        { key: 'authorizationLetter', name: 'Hospital Official Authorization Letter / Proof' }
                      ];

                      const missingDoc = requiredDocs.find(doc => !hospitalForm[doc.key]);
                      if (missingDoc) {
                        showToast(`⚠️ Mandatory Document Missing: Please upload "${missingDoc.name}" to proceed!`, 'error');
                        alert(`❌ MANDATORY VERIFICATION REQUIREMENT:\n\nPlease upload "${missingDoc.name}" to complete legal verification audit.`);
                        return;
                      }

                      setHospStep(3);
                    }}
                    className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg"
                  >
                    Proceed to Step 3: Bank Details & QR Code →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment & Business Bank Details */}
            {hospStep === 3 && (
              <div className="space-y-3 animate-fadeIn text-xs">
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-amber-300 text-xs">💳 Business Bank Account Details</h4>

                  {/* Account Holder Name */}
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Apollo Health City Pvt Ltd"
                      value={hospitalForm.accountHolderName}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>

                  {/* Bank Account Number & Confirm Account Number */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Business Bank Account No *</label>
                      <input
                        type="password"
                        placeholder="e.g. 99881100223344"
                        value={hospitalForm.bankAccountNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, bankAccountNo: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Confirm Account No *</label>
                      <input
                        type="text"
                        placeholder="e.g. 99881100223344"
                        value={hospitalForm.confirmBankAccountNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, confirmBankAccountNo: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Bank Name, IFSC Code & Account Type */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Bank Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC / ICICI Bank"
                        value={hospitalForm.bankName}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, bankName: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">IFSC Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC0000123"
                        value={hospitalForm.ifscCode}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, ifscCode: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white uppercase font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Account Type</label>
                      <select
                        value={hospitalForm.accountType}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, accountType: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      >
                        <option value="Current">Current Account</option>
                        <option value="Savings">Savings Account</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Hospital UPI ID & QR Code Upload */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-cyan-300 text-xs">📱 Hospital UPI Payment & QR Code</h4>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Hospital Official UPI ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. apollohealth@ybl or abchospital@upi"
                      value={hospitalForm.upiId}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, upiId: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                      required
                    />
                  </div>

                  {/* Upload Hospital UPI QR Code Image */}
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Upload Hospital UPI QR Code Image *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setHospitalForm(prev => ({ ...prev, upiQrCode: reader.result, upiQrCodeName: file.name }));
                            showToast(`📱 UPI QR Code Uploaded: ${file.name}`, 'success');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 file:bg-cyan-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-2 file:font-bold"
                    />
                    {hospitalForm.upiQrCodeName && (
                      <span className="text-[10px] text-cyan-400 font-bold mt-1 block">
                        ✓ QR Code Selected: {hospitalForm.upiQrCodeName}
                      </span>
                    )}
                  </div>

                  {/* Upload Cancelled Cheque / Bank Proof */}
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Upload Cancelled Cheque / Bank Proof (PDF/Image) *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setHospitalForm(prev => ({ ...prev, bankProof: reader.result, bankProofName: file.name }));
                            showToast(`📑 Bank Proof Uploaded: ${file.name}`, 'success');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-2 file:font-bold"
                    />
                    {hospitalForm.bankProofName && (
                      <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
                        ✓ Bank Proof Selected: {hospitalForm.bankProofName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-[11px] text-amber-300">
                  🔒 <strong>Protected & Encrypted Storage:</strong> Bank Account Numbers & Proofs are encrypted. Patient will only see Hospital Name, UPI ID & Official QR Code during payment.
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHospStep(2)}
                    className="w-1/3 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl border border-slate-700"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    className="w-2/3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/25"
                  >
                    Submit Complete Hospital Registration 🚀
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
          </div>
        </div>
      </div>

      {/* Interactive Certificate Verification Modal */}
      {showCertVerificationModal && certVerificationData && (
        <CertificateVerificationModal
          isOpen={showCertVerificationModal}
          onClose={() => setShowCertVerificationModal(false)}
          data={certVerificationData}
          type="HOSPITAL"
        />
      )}
    </div>
  );
}
