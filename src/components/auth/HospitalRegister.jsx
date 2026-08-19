import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { sendRealFast2SMS } from '../../utils/smsService';
import { autoVerifyHospitalCertificate } from '../../utils/certVerificationEngine';
import CertificateVerificationModal from '../common/CertificateVerificationModal';
import { 
  Building2, Phone, Mail, MapPin, Lock, ArrowLeft, CheckCircle2, 
  Send, Smartphone, ShieldCheck, Stethoscope, ArrowRight, Award, Loader2, Upload
} from 'lucide-react';

export default function HospitalRegister({ onGoToLogin, onGoToPatientRegister }) {
  const { showToast } = useAuth();
  const { registerHospitalSelf, users, hospitals } = useDb();

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

  // 3-Step Hospital Registration State
  const [hospStep, setHospStep] = useState(1);
  
  const [hospitalForm, setHospitalForm] = useState({
    // 1. Basic Details
    hospitalName: '',
    hospitalType: 'Private', // Private / Government / Corporate / Clinic
    regNo: '',
    establishedYear: '',
    logo: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80',
    logoFileName: '',
    description: '',

    // 2. Contact Details
    email: '',
    phone: '',
    landline: '',
    website: '',

    // 3. Address & Location
    city: '',
    area: '',
    address: '',
    mapsUrl: '',

    // 4. Authorized Person Verification
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

    // 5. Legal Certificates
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

    pan: '',
    gstNo: '',

    // Facilities & Settings
    facilities: ['Emergency 24/7', 'Pharmacy', 'Laboratory'],
    slotDurationMinutes: '15',
    sameDayBooking: 'Yes',
    opFee: '500',
    maxBookingsPerDay: '30',

    // Bank & Payment Details
    accountHolderName: '',
    bankAccountNo: '',
    confirmBankAccountNo: '',
    bankName: '',
    ifscCode: '',
    accountType: 'Current',
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

  // Handle Send Direct SMS OTP
  const handleSendInstantOtp = (phoneNum) => {
    if (!phoneNum || phoneNum.trim().length === 0) {
      showToast('❌ Please enter a 10-digit Hospital Phone Number!', 'error');
      return;
    }

    const cleanPhone = phoneNum.replace(/\D/g, '').slice(0, 10);
    if (cleanPhone.length !== 10) {
      showToast('❌ Mobile Number must be exactly 10 digits!', 'error');
      alert('❌ Mobile Number must be exactly 10 digits!');
      return;
    }

    if (!/^[6-9]/.test(cleanPhone)) {
      showToast('❌ Invalid Number! Indian numbers must start with 6, 7, 8, or 9.', 'error');
      alert('❌ Invalid Number! Indian numbers must start with 6, 7, 8, or 9.');
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
      showToast('✅ Hospital Phone Number Verified Successfully via OTP!', 'success');
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
      address: hospitalForm.address || `${hospitalForm.area}, ${hospitalForm.city}`,
      hospitalTimings: '09:00 AM - 08:00 PM',
      opFee: Number(hospitalForm.opFee) || 500,
      emergencyAvailable: true,
      departments: ['General Medicine', 'Pediatrics', 'Cardiology']
    }, hospitalForm.password);

    showToast('✅ Hospital registered! Pending Admin approval.', 'success');
    if (onGoToLogin) {
      setTimeout(() => onGoToLogin(), 1500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex-1 flex flex-col md:flex-row items-stretch w-full bg-slate-950 text-slate-100">

      {/* ═══ LEFT BRANDING PANEL (hidden on mobile) ═══ */}
      <div className="hidden lg:flex flex-col justify-between w-[380px] lg:w-[420px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-r border-slate-800/80 p-8 lg:p-12 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Logo + Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-white font-extrabold text-xl font-outfit tracking-tight block">CarePulse OP</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Hospital Portal</span>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3 font-outfit">
            Register Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Hospital / Clinic
            </span>
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Join 150+ verified healthcare institutions on CarePulse. Accept online OP bookings, configure doctor consultation slots, track daily revenue, and deliver digital prescriptions seamlessly.
          </p>
        </div>

        {/* Highlights */}
        <div className="space-y-4 my-8 relative z-10">
          {[
            { icon: '👨‍⚕️', title: 'Manage Doctors & Slots', desc: 'Add verified doctors with license numbers' },
            { icon: '📋', title: 'Real-Time OP Queue', desc: 'Live token counter and queue management' },
            { icon: '📄', title: 'Digital Prescriptions', desc: 'Attach prescription notes to patient records' },
            { icon: '📊', title: 'Revenue & Reports', desc: 'Instant daily OP collection summaries' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
              <span className="text-xl mt-0.5">{f.icon}</span>
              <div>
                <p className="text-white font-semibold text-xs">{f.title}</p>
                <p className="text-slate-400 text-[11px]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-emerald-300/80 flex items-center gap-1.5 pt-4 border-t border-slate-800/80 relative z-10">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>🔒 NABH & CEA Compliant · Encrypted System</span>
        </div>
      </div>

      {/* ═══ RIGHT REGISTRATION FORM PANEL (100% True Edge to Edge) ═══ */}
      <div className="flex-1 flex flex-col min-h-[calc(100vh-65px)] w-full overflow-y-auto bg-slate-950/60">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-slate-800/80 glass-panel sticky top-0 z-20 w-full">
          <button
            type="button"
            onClick={onGoToLogin}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hospital Desk Login
          </button>
        </div>

        {/* Form Container (100% Full Width Edge to Edge Layout) */}
        <div className="flex-1 p-6 sm:p-10 lg:p-14 w-full flex flex-col justify-start">
          <div className="w-full space-y-6">
            
            {/* Title Header */}
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 text-emerald-400 shadow-md">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-outfit text-white">Hospital Registration & Verification</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">3-Step official registration for Super Admin document audit and live portal onboarding.</p>
            </div>

            <form onSubmit={handleHospitalSubmit} className="space-y-6 w-full">
              
              {/* Step Navigation Pill Indicator (100% Full Width) */}
              <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-bold gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setHospStep(1)}
                  className={`flex-1 py-3 rounded-xl text-center transition-all cursor-pointer ${
                    hospStep === 1 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Step 1: Basic & Contact
                </button>
                <button
                  type="button"
                  onClick={() => setHospStep(2)}
                  className={`flex-1 py-2.5 rounded-xl text-center transition-all cursor-pointer ${
                    hospStep === 2 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Step 2: Legal Docs & Settings
                </button>
                <button
                  type="button"
                  onClick={() => setHospStep(3)}
                  className={`flex-1 py-2.5 rounded-xl text-center transition-all cursor-pointer ${
                    hospStep === 3 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Step 3: Bank Details 💳
                </button>
              </div>

              {/* STEP 1: Basic Info & Contact */}
              {hospStep === 1 && (
                <div className="space-y-5 animate-fadeIn text-xs w-full">
                  {/* Hospital Name & Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="w-full">
                      <label className="text-slate-300 font-semibold block mb-1.5">Hospital Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Apollo Health City"
                        value={hospitalForm.hospitalName}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, hospitalName: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-emerald-500 shadow-sm"
                        required
                      />
                    </div>

                    <div className="w-full">
                      <label className="text-slate-300 font-semibold block mb-1.5">Hospital Type *</label>
                      <select
                        value={hospitalForm.hospitalType}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, hospitalType: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-emerald-500 shadow-sm"
                      >
                        <option value="Private">Private Hospital</option>
                        <option value="Government">Government Hospital</option>
                        <option value="Corporate">Corporate Multi-Speciality</option>
                        <option value="Clinic">Polyclinic / Specialty Clinic</option>
                      </select>
                    </div>
                  </div>

                  {/* Hospital Photo */}
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2.5 w-full">
                    <label className="text-slate-300 font-semibold block text-xs">Upload Hospital Building Photo / Logo *</label>
                    <div className="flex items-center gap-3 w-full">
                      {hospitalForm.logo && (
                        <img src={hospitalForm.logo} className="w-12 h-12 rounded-xl object-cover border border-emerald-500/50 shadow shrink-0" alt="Hospital Preview" />
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
                        className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-2 file:font-bold cursor-pointer"
                      />
                    </div>
                    {hospitalForm.logoFileName && (
                      <span className="text-[10px] text-emerald-400 font-bold block">
                        ✓ Photo Selected: {hospitalForm.logoFileName}
                      </span>
                    )}
                  </div>

                  {/* Reg No & Est Year */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="w-full">
                      <label className="text-slate-300 font-semibold block mb-1.5">Hospital Reg. No *</label>
                      <input
                        type="text"
                        placeholder="e.g. REG-TS-88492"
                        value={hospitalForm.regNo}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, regNo: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-emerald-500 shadow-sm"
                        required
                      />
                    </div>

                    <div className="w-full">
                      <label className="text-slate-300 font-semibold block mb-1.5">Established Year</label>
                      <input
                        type="number"
                        placeholder="e.g. 2012"
                        value={hospitalForm.establishedYear}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, establishedYear: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-emerald-500 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Phone + Send OTP */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-semibold block text-xs">Hospital Phone Number (10 Digits) *</label>
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
                          placeholder="Enter 10-digit hospital phone"
                          value={hospitalForm.phone}
                          onChange={(e) => {
                            setHospitalForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }));
                            setIsPhoneVerified(false);
                          }}
                          className={`w-full bg-slate-900 border rounded-xl pl-20 pr-3 py-3 text-xs text-white font-mono tracking-wider outline-none ${
                            isPhoneVerified ? 'border-emerald-500/80 bg-emerald-950/20' : 'border-slate-800 focus:border-emerald-500'
                          }`}
                          required
                        />
                      </div>

                      {!isPhoneVerified ? (
                        <button
                          type="button"
                          onClick={() => handleSendInstantOtp(hospitalForm.phone)}
                          disabled={timerSeconds > 0}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 min-w-max cursor-pointer transition-all active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {timerSeconds > 0 ? `Resend (${timerSeconds}s)` : 'Send OTP'}
                        </button>
                      ) : (
                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-1.5 shrink-0">
                          <CheckCircle2 className="w-4 h-4" /> Verified ✓
                        </span>
                      )}
                    </div>
                  </div>

                  {/* SMS OTP CARD */}
                  {otpSent && !isPhoneVerified && showMobileSmsCard && (
                    <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-4 rounded-2xl border-2 border-emerald-500/40 space-y-3 shadow-2xl animate-fadeIn">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-emerald-400" /> SMS Sent to Mobile (+91 {targetPhone})
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Real SMS Dispatched
                        </span>
                      </div>

                      <p className="text-slate-300 text-xs leading-relaxed">
                        🔒 A 6-digit verification code has been dispatched directly to your hospital mobile SIM (<strong>+91 {targetPhone}</strong>) via <strong>Fast2SMS Gateway</strong>. Please enter the code below.
                      </p>

                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit SMS OTP code"
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-center font-mono text-white text-sm font-bold tracking-widest outline-none"
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

                  {/* Email & Landline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Official Hospital Email *</label>
                      <input
                        type="email"
                        placeholder="e.g. contact@hospital.com"
                        value={hospitalForm.email}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Landline Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 040-23456789"
                        value={hospitalForm.landline}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, landline: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* City & Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">City *</label>
                      <input
                        type="text"
                        placeholder="e.g. Hyderabad / Vijayawada"
                        value={hospitalForm.city}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Area / Locality *</label>
                      <input
                        type="text"
                        placeholder="e.g. Jubilee Hills / MG Road"
                        value={hospitalForm.area}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, area: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Google Maps Location */}
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Google Maps Location Link *</label>
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          const searchQuery = hospitalForm.hospitalName || hospitalForm.city || 'Hospital near me';
                          const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
                          window.open(mapsUrl, '_blank');
                          setHospitalForm(prev => ({ ...prev, mapsUrl: prev.mapsUrl || mapsUrl }));
                        }}
                        className="flex-1 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                      >
                        🗺️ Open Google Maps to Select Pin
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
                              showToast(`📍 Device GPS Captured! (${lat.toFixed(4)}, ${lng.toFixed(4)})`, 'success');
                            });
                          }
                        }}
                        className="bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer"
                      >
                        🎯 Auto GPS Pin
                      </button>
                    </div>

                    <input
                      type="url"
                      placeholder="https://www.google.com/maps?q=latitude,longitude"
                      value={hospitalForm.mapsUrl}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, mapsUrl: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setHospStep(2)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    Proceed to Step 2: Legal Docs & OP Settings →
                  </button>
                </div>
              )}

              {/* STEP 2: Legal Docs & Settings */}
              {hospStep === 2 && (
                <div className="space-y-4 animate-fadeIn text-xs">
                  
                  {/* 1. Authorized Person Verification */}
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-cyan-300 text-xs flex items-center justify-between">
                      <span>👨‍💼 1. Hospital Owner / Authorized Person Verification</span>
                      <span className="text-[10px] text-cyan-400 font-semibold font-mono">KYC VERIFICATION</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Authorized Person Name *</label>
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
                        <label className="text-slate-300 font-semibold block mb-1">Designation *</label>
                        <input
                          type="text"
                          placeholder="e.g. Managing Director"
                          value={hospitalForm.authorizedPersonDesignation}
                          onChange={(e) => setHospitalForm(prev => ({ ...prev, authorizedPersonDesignation: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Mandatory Legal Certificates with AI Verification */}
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-emerald-300 text-xs flex items-center justify-between">
                      <span>📑 2. Hospital Registration Certificate (Auto-Verified)</span>
                      <span className="text-[10px] text-emerald-400 font-semibold font-mono">GOVT LICENSES</span>
                    </h4>

                    {isVerifyingCert && (
                      <div className="bg-cyan-950/50 border border-cyan-400 p-3 rounded-2xl flex items-center gap-2.5 text-cyan-300 text-xs animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
                        <span>🔍 <strong>AI Engine Active:</strong> Scanning Govt Health Registry & Authenticating Official Seal...</span>
                      </div>
                    )}

                    {certVerificationData && !isVerifyingCert && (
                      <div className="bg-emerald-950/60 border-2 border-emerald-500/50 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-2xl">
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
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow"
                        >
                          <Award className="w-3.5 h-3.5" /> Inspect Certificate 🛡️
                        </button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-slate-300 font-bold block text-[11px]">Hospital Registration / License Certificate *</label>
                      <input
                        type="text"
                        placeholder="Registration Number (e.g. REG-TS-88492)"
                        value={hospitalForm.regCertificateNo}
                        onChange={(e) => {
                          setHospitalForm(prev => ({ ...prev, regCertificateNo: e.target.value }));
                          if (e.target.value.length >= 5) {
                            handleAutoVerifyHospitalCert(null, e.target.value);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded file:px-2.5 file:py-1 file:mr-2 file:font-bold cursor-pointer"
                      />
                      {hospitalForm.regCertificateName && (
                        <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold pt-0.5">
                          <span>✓ {hospitalForm.regCertificateName}</span>
                          <button
                            type="button"
                            onClick={() => handleAutoVerifyHospitalCert(null, hospitalForm.regCertificateNo)}
                            className="text-cyan-400 hover:underline cursor-pointer"
                          >
                            ⚡ Re-Verify Scan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Facilities Checkboxes */}
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1.5">Hospital Facilities Available</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px]">
                      {[
                        'Emergency 24/7', 'Pharmacy', 'Laboratory', 'Radiology / X-Ray', 
                        'CT Scan', 'MRI', 'ICU', 'Ambulance 24/7', 'Blood Bank', 'Operation Theatre'
                      ].map((facility) => {
                        const isChecked = hospitalForm.facilities.includes(facility);
                        return (
                          <label key={facility} className="flex items-center gap-2 cursor-pointer text-slate-300">
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

                  {/* Fee & Slot duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Base OP Fee (₹) *</label>
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
                      <label className="text-slate-300 font-semibold block mb-1">OP Slot Duration</label>
                      <select
                        value={hospitalForm.slotDurationMinutes}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, slotDurationMinutes: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      >
                        <option value="10">10 Minutes</option>
                        <option value="15">15 Minutes</option>
                        <option value="20">20 Minutes</option>
                        <option value="30">30 Minutes</option>
                      </select>
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Hospital Password *</label>
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
                      <label className="text-slate-300 font-semibold block mb-1">Confirm Password *</label>
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

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setHospStep(1)}
                      className="w-1/3 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      onClick={() => setHospStep(3)}
                      className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg cursor-pointer transition-all"
                    >
                      Proceed to Step 3: Bank Details & QR Code →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Bank Details */}
              {hospStep === 3 && (
                <div className="space-y-4 animate-fadeIn text-xs">
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-amber-300 text-xs">💳 Business Bank Account Details</h4>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Account Holder Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Apollo Health City Pvt Ltd"
                        value={hospitalForm.accountHolderName}
                        onChange={(e) => setHospitalForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Bank Account Number *</label>
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
                        <label className="text-slate-300 font-semibold block mb-1">Confirm Account Number *</label>
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Bank Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. HDFC Bank"
                          value={hospitalForm.bankName}
                          onChange={(e) => setHospitalForm(prev => ({ ...prev, bankName: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">IFSC Code *</label>
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
                        <label className="text-slate-300 font-semibold block mb-1">Account Type</label>
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

                  {/* UPI ID */}
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Hospital Official UPI ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. apollohealth@ybl"
                      value={hospitalForm.upiId}
                      onChange={(e) => setHospitalForm(prev => ({ ...prev, upiId: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setHospStep(2)}
                      className="w-1/3 bg-slate-800 text-slate-300 font-bold py-3.5 rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>

                    <button
                      type="submit"
                      className="w-2/3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      Submit Complete Hospital Registration 🚀
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Bottom Link */}
            <div className="text-center pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors cursor-pointer"
              >
                Already have a hospital account? <span className="font-bold underline text-emerald-400">Login to Hospital Desk</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Certificate Verification Modal */}
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
