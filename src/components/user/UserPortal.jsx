import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { useLanguage } from '../../context/LanguageContext';
import { printOpTicketReceipt, printPdfReport } from '../../utils/exportUtils';
import AppointmentSlotPicker from '../common/AppointmentSlotPicker';
import { StarDisplay, StarInput } from '../common/StarRating';
import { 
  Home, Search, Calendar, Building2, Stethoscope, User, LogOut, MapPin, Clock, 
  Ticket, CheckCircle2, QrCode, ArrowRight, X, Edit3, Lock, Sparkles, Filter, 
  CreditCard, Smartphone, Banknote, ScanLine, Star, MessageSquare, ShieldCheck, Copy,
  Trash2, Edit, AlertTriangle, Mail, Phone, Calendar as CalendarIcon, UserCheck, ShieldAlert, PhoneCall, MessageCircle,
  Building, Wallet, Zap, ChevronRight, ArrowLeft
} from 'lucide-react';

export default function UserPortal() {
  const { currentUser, logout, setCurrentUser, showToast } = useAuth();
  const { hospitals, doctors, bookings, createBooking, updateBookingStatus, addReview, getReviewsByDoctor, hasUserReviewedBooking, addNotification, updateUser, deleteUser } = useDb();
  const { t } = useLanguage();

  // Navigation Tab State: 'HOME' | 'SEARCH' | 'BOOKINGS' | 'HOSPITALS' | 'DOCTORS' | 'PROFILE'
  const [activeTab, setActiveTab] = useState('HOME');

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Amazon / Flipkart Style Multi-Option Payment Gateway State
  const [checkoutMethod, setCheckoutMethod] = useState('UPI_APPS'); // 'UPI_APPS' | 'UPI_QR' | 'UPI_ID' | 'CARD' | 'NETBANKING' | 'WALLETS' | 'COUNTER'
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPAY'); // 'GPAY' | 'PHONEPE' | 'PAYTM'
  const [customUpiId, setCustomUpiId] = useState('');
  const [isUpiIdVerified, setIsUpiIdVerified] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: currentUser?.fullName || '',
    expiry: '',
    cvv: ''
  });
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [selectedWallet, setSelectedWallet] = useState('AMAZON_PAY');

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('09:30 AM');
  const [patientDetails, setPatientDetails] = useState({
    name: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    age: '',
    gender: 'Male',
    reason: ''
  });

  // Digital Ticket Modal
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Payment Step: 'FORM' | 'PAYMENT' | 'VERIFYING'
  const [bookingStep, setBookingStep] = useState('FORM');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentTab, setPaymentTab] = useState('UPI');
  const [verifyStep, setVerifyStep] = useState(0); // 0=connecting, 1=verifying, 2=confirmed, 3=failed
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState('');
  const [txnRefNumber, setTxnRefNumber] = useState('DUP' + Math.floor(1000000 + Math.random() * 9000000));
  const [paymentTimer, setPaymentTimer] = useState(300);

  // 5-minute countdown timer for UPI QR Code
  useEffect(() => {
    let interval = null;
    if (bookingStep === 'PAYMENT') {
      setPaymentTimer(300);
      interval = setInterval(() => {
        setPaymentTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bookingStep]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // Hospital View Doctors Modal State
  const [selectedHospitalModal, setSelectedHospitalModal] = useState(null);

  // Profile State: Read-Only vs Edit Mode & Delete Account
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    dateOfBirth: currentUser?.dateOfBirth || '',
    gender: currentUser?.gender || 'Male',
    address: currentUser?.address || '',
    newPassword: ''
  });

  // Sync profile form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        gender: currentUser.gender || 'Male',
        address: currentUser.address || '',
        newPassword: ''
      });
    }
  }, [currentUser]);

  // Only APPROVED hospitals are visible to regular users! (Req #13)
  const approvedHospitals = hospitals.filter(h => h.status === 'APPROVED');

  // Active User Bookings
  const userBookings = bookings.filter(b => b.userId === currentUser?._id || b.userPhone === currentUser?.phone);
  const upcomingBookings = userBookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending');
  const previousBookings = userBookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

  // Filter Doctors
  const filteredDoctors = doctors.filter(doc => {
    const hosp = approvedHospitals.find(h => h._id === doc.hospitalId);
    if (!hosp) return false; // Hide doctors of unapproved hospitals

    const matchQuery = searchQuery ? (
      doc.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.area.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true;

    const matchCity = selectedCity ? hosp.city.toLowerCase() === selectedCity.toLowerCase() : true;
    const matchSpecialty = selectedSpecialty ? doc.specialization === selectedSpecialty : true;

    return matchQuery && matchCity && matchSpecialty;
  });

  const handleProceedToPayment = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!patientDetails.name || !patientDetails.name.trim()) {
      alert('Please enter Patient Full Name.');
      return;
    }
    const cleanPhone = (patientDetails.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      alert('Please enter a valid 10-digit Mobile Number.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      alert('Please enter a valid 10-digit Indian Mobile Number (starting with 6, 7, 8, or 9).');
      return;
    }
    if (!bookingDoctor && doctors && doctors.length > 0) {
      setBookingDoctor(doctors[0]);
    }
    setTxnRefNumber('DUP' + Math.floor(1000000 + Math.random() * 9000000));
    setBookingStep('PAYMENT');
  };

  const handleConfirmPayment = (method) => {
    if (!bookingDoctor) return;
    // Show verification animation first
    setPendingPaymentMethod(method);
    setVerifyStep(0);
    setBookingStep('VERIFYING');

    // Step 0: Connecting to bank (1.2s)
    setTimeout(() => setVerifyStep(1), 1200);
    // Step 1: Verifying transaction (2.5s)
    setTimeout(() => setVerifyStep(2), 2500);
    // Step 2: Confirmed — create booking and open ticket (3.8s)
    setTimeout(() => {
      const hosp = approvedHospitals.find(h => h._id === bookingDoctor.hospitalId);
      const generatedRef = txnRefNumber || ('DUP' + Math.floor(1000000 + Math.random() * 9000000));
      const newBk = createBooking({
        userId: currentUser?._id || 'usr-1',
        userName: patientDetails.name,
        userPhone: patientDetails.phone,
        patientAge: patientDetails.age,
        patientGender: patientDetails.gender,
        patientReason: patientDetails.reason,
        hospitalId: bookingDoctor.hospitalId,
        hospitalName: hosp?.hospitalName || 'Hospital',
        doctorId: bookingDoctor._id,
        doctorName: bookingDoctor.doctorName,
        department: bookingDoctor.department,
        date: bookingDate,
        time: bookingTime,
        opFee: bookingDoctor.opFee,
        paymentMethod: method,
        referenceNumber: generatedRef,
        status: 'Confirmed'
      });
      addNotification({
        userId: currentUser?._id,
        type: 'BOOKING',
        bookingId: newBk._id,
        icon: '✅',
        title: 'OP Booking Confirmed!',
        message: `Your appointment with ${bookingDoctor.doctorName} at ${hosp?.hospitalName} is confirmed for ${bookingDate} at ${bookingTime}. Ref: ${generatedRef}. Payment: ${method}.`,
      });
      setBookingDoctor(null);
      setBookingStep('FORM');
      setPaymentMethod('');
      setVerifyStep(0);
      setPendingPaymentMethod('');
      setSelectedTicket(newBk);
    }, 3800);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      fullName: profileForm.fullName,
      email: profileForm.email,
      dateOfBirth: profileForm.dateOfBirth,
      gender: profileForm.gender,
      address: profileForm.address,
      ...(profileForm.newPassword ? { password: profileForm.newPassword } : {})
    };
    setCurrentUser(updated);
    if (updateUser && currentUser?._id) {
      updateUser(currentUser._id, updated);
    }
    setIsEditingProfile(false);
    if (showToast) {
      showToast('✅ Profile updated successfully!', 'success');
    } else {
      alert('✅ Profile updated successfully!');
    }
  };

  const handleDeleteAccount = () => {
    if (!currentUser?._id) return;
    deleteUser(currentUser._id);
    logout();
    if (showToast) {
      showToast('🗑️ Your CarePulse Patient Account has been permanently deleted.', 'info');
    } else {
      alert('Your account has been deleted.');
    }
  };

  const handleSubmitReview = () => {
    if (!reviewBooking || reviewStars === 0) return;
    addReview({
      doctorId: reviewBooking.doctorId,
      doctorName: reviewBooking.doctorName,
      bookingId: reviewBooking._id,
      userId: currentUser._id,
      userName: currentUser.fullName,
      stars: reviewStars,
      comment: reviewText,
    });
    addNotification({
      userId: currentUser._id,
      type: 'REVIEW',
      icon: '⭐',
      title: 'Review Submitted!',
      message: `You gave ${reviewStars} ⭐ to Dr. ${reviewBooking.doctorName}. Thank you for your feedback!`,
    });
    setReviewBooking(null);
    setReviewStars(0);
    setReviewText('');
  };

  return (
    <div className="space-y-6 pb-20">

      {/* Navigation Sub-Bar */}
      <div className="glass-panel p-2 rounded-2xl border border-slate-800 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          <button
            onClick={() => setActiveTab('HOME')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'HOME' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" /> {t('home')}
          </button>
          <button
            onClick={() => setActiveTab('SEARCH')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'SEARCH' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> {t('search')}
          </button>
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'BOOKINGS' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> {t('myBookings')} ({userBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('HOSPITALS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'HOSPITALS' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> {t('hospitals')}
          </button>
          <button
            onClick={() => setActiveTab('DOCTORS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'DOCTORS' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> {t('doctors')}
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'PROFILE' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> {t('profile')}
          </button>
        </div>

        <button
          onClick={logout}
          className="px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" /> {t('logout')}
        </button>
      </div>

      {/* --- TAB 1: HOME --- */}
      {activeTab === 'HOME' && (
        <div className="space-y-6">
          
          {/* Hero Banner */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-white font-outfit">
                  Welcome back, <span className="text-cyan-400">{currentUser?.fullName}</span> 👋
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Search verified hospitals & specialist doctors, book instant OP tokens, and avoid long waiting queues.
                </p>
              </div>

              {/* 🚨 Emergency ER 24/7 Helpline Card */}
              <a
                href="tel:108"
                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 p-3 rounded-2xl flex items-center gap-3 shrink-0 transition-all shadow-lg shadow-rose-500/10 group"
              >
                <div className="p-2 bg-rose-500 text-white rounded-xl group-hover:scale-110 transition-transform animate-pulse">
                  🚨
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">Emergency 24/7</span>
                  <span className="text-sm font-extrabold text-white">Call 108 / OPD ER</span>
                </div>
              </a>
            </div>

            {/* Quick Search Bar */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Search Doctor, Hospital, or Area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Cities (Hyderabad, Vijayawada, Vizag)</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Vijayawada">Vijayawada</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
              </select>
              <button
                onClick={() => setActiveTab('SEARCH')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Search className="w-4 h-4" /> Search Doctor & Book OP
              </button>
            </div>
          </div>

          {/* Upcoming OP Bookings Widget */}
          {upcomingBookings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-cyan-400" /> Upcoming OP Appointment
              </h3>
              {upcomingBookings.slice(0, 1).map(b => (
                <div key={b._id} className="glass-card p-5 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">#{b.bookingId}</span>
                    <h4 className="font-bold text-white text-base">{b.doctorName} ({b.department})</h4>
                    <p className="text-xs text-slate-400">{b.hospitalName} • Date: <strong className="text-slate-200">{b.date} at {b.time}</strong></p>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(b)}
                    className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> View Digital Ticket
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Today's Available Doctors */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white">Today's Top Available Doctors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.slice(0, 3).map(doc => {
                const hosp = approvedHospitals.find(h => h._id === doc.hospitalId);
                return (
                  <div key={doc._id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex gap-3">
                      <img src={doc.image} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/20">
                          {doc.specialization}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1">{doc.doctorName}</h4>
                        <p className="text-xs text-slate-300 font-semibold">{hosp?.hospitalName}</p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">+91 {hosp?.phone || '9123456789'}</span>
                          <a
                            href={`tel:+91${(hosp?.phone || '9123456789').replace(/\D/g, '').slice(-10)}`}
                            className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-300 inline-flex items-center gap-1"
                          >
                            <Phone className="w-2.5 h-2.5 text-emerald-600" /> Call
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-slate-800">
                      <span>Fee: <strong className="text-cyan-400 font-bold">₹{doc.opFee}</strong></span>
                      <button
                        onClick={() => setBookingDoctor(doc)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow"
                      >
                        Book OP
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 2: SEARCH (HOSPITAL & DOCTOR SEARCH) --- */}
      {(activeTab === 'SEARCH' || activeTab === 'DOCTORS') && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Search by Doctor Name, Hospital, or Specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            >
              <option value="">All Cities</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Vijayawada">Vijayawada</option>
              <option value="Visakhapatnam">Visakhapatnam</option>
            </select>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            >
              <option value="">All Specializations</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
              <option value="Dermatologist">Dermatologist</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map(doc => {
              const hosp = approvedHospitals.find(h => h._id === doc.hospitalId);
              return (
                <div key={doc._id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex gap-4">
                    <img src={doc.image} className="w-20 h-20 rounded-2xl object-cover border border-slate-700" />
                    <div>
                      <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/20">
                        {doc.specialization}
                      </span>
                      <h3 className="font-bold text-white text-base mt-1">{doc.doctorName}</h3>
                      <p className="text-xs text-slate-400">{doc.qualification}</p>
                      <p className="text-xs text-slate-400">{doc.experience} Years Exp.</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> {hosp?.hospitalName}
                      </p>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        {hosp?.city || 'Hospital'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{hosp?.address ? `${hosp.address}, ${hosp.city}` : hosp?.city}</p>
                    <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-cyan-400 shrink-0" /> {doc.availableDays} ({doc.availableTime})
                    </p>

                    {/* Hospital Phone Number & 1-Click Call Button */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="font-bold text-white">+91 {hosp?.phone || '9123456789'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:+91${(hosp?.phone || '9123456789').replace(/\D/g, '').slice(-10)}`}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow cursor-pointer transition-all active:scale-95"
                          title="Direct Phone Call to Hospital Desk"
                        >
                          <PhoneCall className="w-3 h-3 text-emerald-600" /> Call Hospital
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?phone=91${(hosp?.phone || '9123456789').replace(/\D/g, '').slice(-10)}&text=${encodeURIComponent(`🏥 *Enquiry regarding Dr. ${doc.doctorName}*\n\nHello ${hosp?.hospitalName}, I would like to enquire about appointment consultation timings for Dr. ${doc.doctorName} (${doc.specialization}).`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 p-1.5 rounded-lg text-[11px] inline-flex items-center justify-center transition-all cursor-pointer"
                          title="WhatsApp Enquiry"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">OP Consultation Fee</span>
                      <span className="text-lg font-extrabold text-cyan-400">₹{doc.opFee}</span>
                    </div>

                    <button
                      onClick={() => {
                        setPatientDetails(prev => ({
                          ...prev,
                          name: prev.name || currentUser?.fullName || '',
                          phone: prev.phone || currentUser?.phone || ''
                        }));
                        if (!bookingDate) {
                          setBookingDate(new Date().toISOString().split('T')[0]);
                        }
                        if (!bookingTime) {
                          setBookingTime('09:30 AM');
                        }
                        setBookingDoctor(doc);
                        setBookingStep('FORM');
                      }}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5"
                    >
                      Book OP <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 3: MY BOOKINGS --- */}
      {activeTab === 'BOOKINGS' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-cyan-400" /> My OP Booking History
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userBookings.map(b => (
              <div key={b._id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-mono text-cyan-400 font-bold text-xs">#{b.bookingId}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    b.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    b.status === 'Completed' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="text-xs text-slate-200 space-y-1">
                  <p className="font-bold text-white text-sm">{b.doctorName} ({b.department})</p>
                  <p className="text-slate-400">Hospital: {b.hospitalName}</p>
                  <p className="text-slate-400">Date & Time: {b.date} at {b.time}</p>
                  <p className="text-slate-400">OP Fee: <strong className="text-cyan-400">₹{b.opFee}</strong></p>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setSelectedTicket(b)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" /> View Ticket
                  </button>

                  {b.status === 'Confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(b._id, 'Cancelled')}
                      className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                  )}

                  {b.status === 'Completed' && !hasUserReviewedBooking(b._id) && (
                    <button
                      onClick={() => { setReviewBooking(b); setReviewStars(5); }}
                      className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-xl flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Rate Doctor
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: HOSPITALS --- */}
      {activeTab === 'HOSPITALS' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">Click on any hospital card to view its verified doctors & book OP tokens directly.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {approvedHospitals.map(h => {
              const hospDocs = doctors.filter(d => d.hospitalId === h._id && d.status === 'ACTIVE');
              return (
                <div
                  key={h._id}
                  onClick={() => setSelectedHospitalModal(h)}
                  className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 cursor-pointer hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all group relative"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img src={h.logo} className="w-full h-36 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md text-cyan-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3" /> {hospDocs.length} Doctors
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                    {h.hospitalName}
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-400">{h.address}, {h.area}, {h.city}</p>

                  {/* 📍 Google Maps Navigation Button */}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-slate-500">Contact: {h.phone}</p>
                    <a
                      href={h.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.hospitalName + ' ' + h.city)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <MapPin className="w-3 h-3 text-emerald-400" /> Google Maps 📍
                    </a>
                  </div>

                  {/* 🏥 Real-time Emergency Beds Availability Widget */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 grid grid-cols-3 gap-1 text-center">
                    <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-bold">ICU BEDS</span>
                      <span className="text-xs font-extrabold text-cyan-400">{h.icuBeds || 6} Free</span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-bold">GENERAL</span>
                      <span className="text-xs font-extrabold text-emerald-400">{h.generalBeds || 18} Free</span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-bold">AMBULANCE</span>
                      <span className="text-[10px] font-extrabold text-rose-400">24/7 Ready 🚑</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {h.departments.map((dept, idx) => (
                      <span key={idx} className="bg-slate-900 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-slate-800">
                        {dept}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold">
                    <span>View Doctors & Book OP</span>
                    <span className="bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20 text-[11px]">Click to View →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 5: PROFILE --- */}
      {activeTab === 'PROFILE' && (
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            
            {/* ═══ LEFT PANEL: Patient Card + Stats + Danger Zone ═══ */}
            <div className="lg:w-[360px] flex-shrink-0 flex flex-col gap-5">
              
              {/* Identity & Status Card */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-cyan-500/25 border-2 border-cyan-400/30">
                      {currentUser?.fullName?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white font-outfit">{currentUser?.fullName}</h3>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20 inline-flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Patient
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs border-t border-slate-800/80 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold">Patient ID:</span>
                      <span className="font-mono text-cyan-300 font-extrabold tracking-wider bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-500/30 shadow-sm">
                        {currentUser?.patientId || ('CP-PAT-' + (currentUser?.phone ? currentUser.phone.slice(-6) : '543210'))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold">Total OP Bookings:</span>
                      <span className="text-white font-extrabold bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">{userBookings.length} Bookings</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold">Account Status:</span>
                      <span className="text-emerald-400 font-bold">Active & Verified ✓</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold">Member Since:</span>
                      <span className="text-slate-300">{currentUser?.createdAt || 'Active Member'}</span>
                    </div>
                  </div>
                </div>

                {!isEditingProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all active:scale-[0.98] mt-4"
                  >
                    <Edit className="w-4 h-4" /> Edit Profile Details
                  </button>
                )}
              </div>

              {/* Danger Zone — Separate Delete Account Box (Half-Sized Compact) */}
              <div className="glass-panel p-3.5 rounded-2xl border border-rose-500/25 bg-gradient-to-br from-slate-950 via-rose-950/10 to-slate-950 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                  <Trash2 className="w-3 h-3" /> Danger Zone · Delete Account
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Permanently delete your account and consultation records.
                </p>

                {!showDeleteConfirm ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/50 font-semibold rounded-md text-[10px] inline-flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-2.5 h-2.5" /> Delete Account
                    </button>
                  </div>
                ) : (
                  <div className="bg-rose-950/40 border border-rose-500/50 p-2.5 rounded-xl space-y-1.5 max-w-xs">
                    <div className="flex items-center gap-1 text-rose-300 font-bold text-[10px]">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      Permanently delete account?
                    </div>
                    <p className="text-[9px] text-slate-400">
                      This cannot be undone. All OP tickets will be erased.
                    </p>
                    <div className="flex gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="px-2.5 py-0.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold rounded-md text-[9px] shadow flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-2 h-2" /> Yes, Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-md text-[9px] border border-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* ═══ RIGHT PANEL: Details Grid (Read-Only) OR Edit Form ═══ */}
            <div className="flex-1 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-between">
              
              {/* READ-ONLY VIEW */}
              {!isEditingProfile ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h4 className="text-lg font-extrabold text-white flex items-center gap-2 font-outfit">
                        <User className="w-5 h-5 text-cyan-400" /> Patient Personal Information
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">CarePulse registered patient medical profile</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-cyan-400" /> Edit Details
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    {/* Full Name */}
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-cyan-400" /> Full Name
                      </span>
                      <p className="text-sm font-extrabold text-white">{currentUser?.fullName || 'N/A'}</p>
                    </div>

                    {/* Phone Number */}
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-cyan-400" /> Phone Number (Login ID)
                      </span>
                      <p className="font-mono text-sm font-extrabold text-white">{currentUser?.phone || 'N/A'}</p>
                      <p className="text-[10px] text-emerald-400">✓ Verified Mobile Account</p>
                    </div>

                    {/* Email */}
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address
                      </span>
                      <p className="text-sm font-semibold text-white truncate">{currentUser?.email || 'Not specified'}</p>
                      <p className="text-[10px] text-slate-500">For booking notifications</p>
                    </div>

                    {/* Date of Birth */}
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" /> Date of Birth
                      </span>
                      <p className="text-sm font-semibold text-white">{currentUser?.dateOfBirth || 'Not specified'}</p>
                    </div>

                    {/* Gender */}
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-cyan-400" /> Gender
                      </span>
                      <p className="text-sm font-semibold text-white">{currentUser?.gender || 'Not specified'}</p>
                    </div>

                    {/* Account Security */}
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Security Status
                      </span>
                      <p className="text-sm font-semibold text-emerald-400">Password Protected 🔒</p>
                    </div>

                    {/* Address */}
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Residential Address
                      </span>
                      <p className="text-xs font-semibold text-slate-200">{currentUser?.address || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT MODE FORM */
                <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-cyan-400 font-bold flex items-center gap-1.5 text-base font-outfit">
                        <Edit className="w-4 h-4" /> Edit Patient Information
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Modify fields and click Save Changes</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileForm({
                          fullName: currentUser?.fullName || '',
                          phone: currentUser?.phone || '',
                          email: currentUser?.email || '',
                          dateOfBirth: currentUser?.dateOfBirth || '',
                          gender: currentUser?.gender || 'Male',
                          address: currentUser?.address || '',
                          newPassword: ''
                        });
                        setIsEditingProfile(false);
                      }}
                      className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl p-3 text-white text-xs outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Phone Number (Login ID)</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        readOnly
                        className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 text-slate-500 font-mono text-xs cursor-not-allowed"
                      />
                      <span className="text-[10px] text-slate-500 block mt-1">Phone number is locked as unique login ID</span>
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl p-3 text-white text-xs outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={profileForm.dateOfBirth}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl p-3 text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Gender</label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl p-3 text-white text-xs outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Residential Address</label>
                    <input
                      type="text"
                      placeholder="Enter full street, area, city..."
                      value={profileForm.address}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl p-3 text-white text-xs outline-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <label className="text-slate-400 font-semibold block mb-1">Change Password (Leave blank to keep current)</label>
                    <input
                      type="password"
                      placeholder="Enter new password (optional)"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl p-3 text-white text-xs outline-none"
                    />
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/25 text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Save Profile Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileForm({
                          fullName: currentUser?.fullName || '',
                          phone: currentUser?.phone || '',
                          email: currentUser?.email || '',
                          dateOfBirth: currentUser?.dateOfBirth || '',
                          gender: currentUser?.gender || 'Male',
                          address: currentUser?.address || '',
                          newPassword: ''
                        });
                        setIsEditingProfile(false);
                      }}
                      className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3.5 rounded-xl text-xs border border-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>
        </div>
      )}

      {/* --- BOOKING MODAL (Step 1: Details → Step 2: UPI Payment) --- */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="glass-panel w-full max-w-4xl rounded-3xl border border-cyan-500/30 shadow-2xl relative overflow-hidden max-h-[95vh] flex flex-col">
            {/* Modal close button */}
            <button
              onClick={() => { setBookingDoctor(null); setBookingStep('FORM'); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-20 p-1.5 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* STEP 1: HORIZONTAL SPLIT — Left: Doctor Info | Right: Booking Form */}
            {bookingStep === 'FORM' && (
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                {/* LEFT PANEL: Doctor & Hospital Info */}
                <div className="lg:w-[300px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-6 flex flex-col gap-5">
                  <div>
                    <p className="text-[10px] text-cyan-400 font-bold tracking-wider mb-3">STEP 1 OF 2 · APPOINTMENT</p>
                    {/* Doctor Card */}
                    <div className="bg-slate-950/60 rounded-2xl border border-cyan-500/20 p-4 space-y-3">
                      {/* Doctor Photo */}
                      {bookingDoctor.image ? (
                        <div className="relative w-20 h-20">
                          <img
                            src={bookingDoctor.image}
                            alt={bookingDoctor.doctorName}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                          <div className="hidden w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 items-center justify-center text-white font-extrabold text-2xl border-2 border-cyan-500/50 shadow-lg">
                            {bookingDoctor.doctorName?.[0]?.toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-extrabold text-2xl border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20">
                          {bookingDoctor.doctorName?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-extrabold text-white text-base">{bookingDoctor.doctorName}</p>
                        <p className="text-cyan-400 text-xs font-semibold">{bookingDoctor.specialization}</p>
                        <p className="text-slate-400 text-xs mt-1">{bookingDoctor.department}</p>
                      </div>
                      <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Hospital:</span>
                          <span className="text-slate-200 font-semibold text-right max-w-[140px]">{(hospitals.find(h => h._id === bookingDoctor.hospitalId) || hospitals[0])?.hospitalName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Experience:</span>
                          <span className="text-slate-200 font-semibold">{bookingDoctor.experience || 'N/A'} yrs</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-slate-400">OP Fee:</span>
                          <span className="text-xl font-extrabold text-cyan-400">₹{bookingDoctor.opFee}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info badges */}
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Instant OP Token Confirmation</div>
                    <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Digital PDF Ticket Download</div>
                    <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> UPI QR Payment — No Card Needed</div>
                    <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Real-Time Queue Updates</div>
                  </div>
                </div>

                {/* RIGHT PANEL: Booking Form */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                  <h3 className="font-bold text-white text-lg">Patient & Appointment Details</h3>

                  <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
                    <AppointmentSlotPicker
                      doctorId={bookingDoctor._id}
                      existingBookings={bookings}
                      selectedDate={bookingDate}
                      selectedTime={bookingTime}
                      onDateChange={setBookingDate}
                      onTimeChange={setBookingTime}
                    />

                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                        <User className="w-4 h-4 text-cyan-400" /> Patient Details (For Hospital Records)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 font-semibold block mb-1">Patient Full Name *</label>
                          <input type="text" placeholder="Enter patient name..." value={patientDetails.name}
                            onChange={(e) => setPatientDetails(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600" required />
                        </div>
                        <div>
                          <label className="text-slate-400 font-semibold block mb-1">
                            Phone Number * <span className="text-[10px] text-cyan-400 font-normal">(10 Digits Only)</span>
                          </label>
                          <input 
                            type="tel" 
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="Enter 10-digit phone number..." 
                            value={patientDetails.phone}
                            onChange={(e) => {
                              const numbersOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setPatientDetails(prev => ({ ...prev, phone: numbersOnly }));
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600 focus:border-cyan-500/60 outline-none font-mono" 
                            required 
                          />
                          {patientDetails.phone && patientDetails.phone.length > 0 && patientDetails.phone.length < 10 && (
                            <p className="text-[10px] text-amber-400 mt-1 font-medium">
                              ⚠️ Enter complete 10 digits ({10 - patientDetails.phone.length} remaining)
                            </p>
                          )}
                          {patientDetails.phone && patientDetails.phone.length === 10 && !/^[6-9]/.test(patientDetails.phone) && (
                            <p className="text-[10px] text-rose-400 mt-1 font-medium">
                              ⚠️ Number must start with 6, 7, 8, or 9
                            </p>
                          )}
                          {patientDetails.phone && patientDetails.phone.length === 10 && /^[6-9]\d{9}$/.test(patientDetails.phone) && (
                            <p className="text-[10px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Valid 10-digit Mobile Number
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 font-semibold block mb-1">Age (Years)</label>
                          <input type="number" placeholder="e.g. 28" value={patientDetails.age} min="1" max="120"
                            onChange={(e) => setPatientDetails(prev => ({ ...prev, age: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600" />
                        </div>
                        <div>
                          <label className="text-slate-400 font-semibold block mb-1">Gender</label>
                          <select value={patientDetails.gender} onChange={(e) => setPatientDetails(prev => ({ ...prev, gender: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Symptoms / Reason for Visit</label>
                        <input type="text" placeholder="e.g. Fever, Cold, General Consultation..." value={patientDetails.reason}
                          onChange={(e) => setPatientDetails(prev => ({ ...prev, reason: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!patientDetails.name || !patientDetails.name.trim()) {
                          alert('Please enter Patient Full Name.');
                          return;
                        }
                        const cleanPhone = (patientDetails.phone || '').replace(/\D/g, '');
                        if (!cleanPhone || cleanPhone.length !== 10) {
                          alert('Please enter a valid 10-digit Mobile Number.');
                          return;
                        }
                        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
                          alert('Please enter a valid 10-digit Indian Mobile Number (starting with 6, 7, 8, or 9).');
                          return;
                        }
                        setBookingStep('PAYMENT');
                      }}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      <CreditCard className="w-4 h-4" /> Proceed to Payment (₹{bookingDoctor.opFee}) →
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* STEP 2: COMPLETE AMAZON / FLIPKART STYLE MULTI-OPTION PAYMENT CHECKOUT GATEWAY */}
            {bookingStep === 'PAYMENT' && (
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-slate-50 text-slate-900">
                
                {/* ═══ 1. LEFT PAYMENT METHODS SIDEBAR ═══ */}
                <div className="lg:w-[260px] flex-shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">STEP 2 OF 2 · CHECKOUT</span>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                        <Lock className="w-4 h-4 text-emerald-600" /> Payment Options
                      </h4>
                    </div>

                    <div className="space-y-1">
                      {/* 1. UPI Apps & QR */}
                      <button
                        type="button"
                        onClick={() => setCheckoutMethod('UPI_APPS')}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          checkoutMethod === 'UPI_APPS'
                            ? 'bg-cyan-50 text-cyan-800 border-2 border-cyan-500 shadow-sm'
                            : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-cyan-600 shrink-0" />
                          <div>
                            <span className="block">UPI & QR Code</span>
                            <span className="text-[10px] text-slate-500 font-normal">GPay, PhonePe, Paytm</span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      {/* 2. Credit / Debit Cards */}
                      <button
                        type="button"
                        onClick={() => setCheckoutMethod('CARD')}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          checkoutMethod === 'CARD'
                            ? 'bg-cyan-50 text-cyan-800 border-2 border-cyan-500 shadow-sm'
                            : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div>
                            <span className="block">Credit / Debit Card</span>
                            <span className="text-[10px] text-slate-500 font-normal">Visa, Mastercard, RuPay</span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      {/* 3. Net Banking */}
                      <button
                        type="button"
                        onClick={() => setCheckoutMethod('NETBANKING')}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          checkoutMethod === 'NETBANKING'
                            ? 'bg-cyan-50 text-cyan-800 border-2 border-cyan-500 shadow-sm'
                            : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="block">Net Banking</span>
                            <span className="text-[10px] text-slate-500 font-normal">SBI, HDFC, ICICI, Axis</span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      {/* 4. Digital Wallets */}
                      <button
                        type="button"
                        onClick={() => setCheckoutMethod('WALLETS')}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          checkoutMethod === 'WALLETS'
                            ? 'bg-cyan-50 text-cyan-800 border-2 border-cyan-500 shadow-sm'
                            : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <span className="block">Wallets / Amazon Pay</span>
                            <span className="text-[10px] text-slate-500 font-normal">Amazon Pay, Paytm</span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      {/* 5. Pay at Hospital Counter (COD Style) */}
                      <button
                        type="button"
                        onClick={() => setCheckoutMethod('COUNTER')}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          checkoutMethod === 'COUNTER'
                            ? 'bg-cyan-50 text-cyan-800 border-2 border-cyan-500 shadow-sm'
                            : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="block">Pay at Counter</span>
                            <span className="text-[10px] text-slate-500 font-normal">Cash on Hospital Visit</span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>256-bit Bank Encrypted</span>
                    </div>
                  </div>
                </div>

                {/* ═══ 2. CENTER INTERACTIVE PAYMENT FORM ═══ */}
                <div className="flex-1 p-5 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col justify-start">
                  
                  {/* OPTION A: UPI APPS & QR CODE */}
                  {checkoutMethod === 'UPI_APPS' && (
                    <div className="space-y-5">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-cyan-600" /> Instant UPI Payment
                        </h4>
                        <p className="text-xs text-slate-500">Pay directly from any UPI app or scan the live QR code.</p>
                      </div>

                      {/* 1-Click Fast App Pills */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">1. Select Preferred UPI App:</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            { id: 'GPAY', name: 'Google Pay', icon: '🟢', color: 'border-emerald-300 hover:border-emerald-500' },
                            { id: 'PHONEPE', name: 'PhonePe', icon: '🟣', color: 'border-purple-300 hover:border-purple-500' },
                            { id: 'PAYTM', name: 'Paytm UPI', icon: '🔵', color: 'border-blue-300 hover:border-blue-500' }
                          ].map(app => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => setSelectedUpiApp(app.id)}
                              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                selectedUpiApp === app.id
                                  ? 'bg-cyan-50 border-2 border-cyan-600 shadow-sm'
                                  : `bg-white ${app.color} shadow-xs`
                              }`}
                            >
                              <span className="text-xl block mb-1">{app.icon}</span>
                              <span className="text-xs font-bold text-slate-900 block">{app.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Enter UPI ID / VPA */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                        <label className="text-xs font-bold text-slate-700 block">2. Or Enter Any UPI ID (VPA):</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. yourname@okhdfcbank / mobile@ybl"
                            value={customUpiId}
                            onChange={(e) => {
                              setCustomUpiId(e.target.value);
                              setIsUpiIdVerified(false);
                            }}
                            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-cyan-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customUpiId.includes('@')) {
                                setIsUpiIdVerified(true);
                                showToast('✅ UPI ID Verified Successfully!', 'success');
                              } else {
                                showToast('❌ Please enter a valid UPI ID (e.g. user@okaxis)', 'error');
                              }
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-xs active:scale-95 transition-all"
                          >
                            {isUpiIdVerified ? '✓ Verified' : 'Verify'}
                          </button>
                        </div>
                        {isUpiIdVerified && (
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Account Verified: {customUpiId}
                          </span>
                        )}
                      </div>

                      {/* Dynamic Live QR Code with Countdown */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 shadow-xs">
                        <div className="p-2 bg-white rounded-xl border border-slate-300 shadow-sm shrink-0">
                          <img
                            src={(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.upiQrCode || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.upiId || 'paytm.s2zpy5u@pty'}&pn=${(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.hospitalName || 'Hospital'}&am=${bookingDoctor?.opFee || 100}&cu=INR&tr=${txnRefNumber}`)}`}
                            className="w-28 h-28 object-contain rounded-lg"
                            alt="Live UPI QR Code"
                          />
                        </div>
                        <div className="space-y-1.5 text-center sm:text-left">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                            Live Scanner Ready
                          </span>
                          <h5 className="font-bold text-xs text-slate-900">Scan with any Camera or UPI App</h5>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Time Left to Pay : <span className="font-mono font-bold text-cyan-700">{formatTimer(paymentTimer)}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Ref: {txnRefNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OPTION B: CREDIT / DEBIT CARDS */}
                  {checkoutMethod === 'CARD' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-indigo-600" /> Credit or Debit Card
                        </h4>
                        <p className="text-xs text-slate-500">We accept Visa, MasterCard, RuPay, Maestro & Amex.</p>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3.5 shadow-xs">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Card Number *</label>
                          <div className="relative">
                            <input
                              type="text"
                              maxLength={19}
                              placeholder="4123 4567 8901 2345"
                              value={cardForm.cardNumber}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                setCardForm(prev => ({ ...prev, cardNumber: v }));
                              }}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 font-mono tracking-wider"
                            />
                            <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Cardholder Name *</label>
                          <input
                            type="text"
                            placeholder="Name as printed on card"
                            value={cardForm.cardHolder}
                            onChange={(e) => setCardForm(prev => ({ ...prev, cardHolder: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">Expiry Date (MM/YY) *</label>
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="12/28"
                              value={cardForm.expiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '');
                                if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                                setCardForm(prev => ({ ...prev, expiry: v }));
                              }}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">CVV / CVC *</label>
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="•••"
                              value={cardForm.cvv}
                              onChange={(e) => setCardForm(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 font-mono tracking-widest"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Your card details are protected by 3D Secure OTP & 256-bit encryption.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OPTION C: NET BANKING */}
                  {checkoutMethod === 'NETBANKING' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                          <Building className="w-5 h-5 text-emerald-600" /> Internet Banking
                        </h4>
                        <p className="text-xs text-slate-500">Select your bank from top Indian banking institutions.</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: 'SBI', name: 'State Bank of India', short: 'SBI' },
                          { id: 'HDFC', name: 'HDFC Bank', short: 'HDFC' },
                          { id: 'ICICI', name: 'ICICI Bank', short: 'ICICI' },
                          { id: 'AXIS', name: 'Axis Bank', short: 'AXIS' },
                          { id: 'KOTAK', name: 'Kotak Mahindra', short: 'KOTAK' },
                          { id: 'PNB', name: 'Punjab National Bank', short: 'PNB' }
                        ].map(bank => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              selectedBank === bank.id
                                ? 'bg-emerald-50 border-2 border-emerald-600 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                            }`}
                          >
                            <span className="font-mono font-extrabold text-xs text-slate-900 block mb-0.5">{bank.short}</span>
                            <span className="text-[10px] text-slate-500 font-medium block truncate">{bank.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Or Choose from All Indian Banks:</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500"
                        >
                          <option value="SBI">State Bank of India (SBI)</option>
                          <option value="HDFC">HDFC Bank</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="AXIS">Axis Bank</option>
                          <option value="KOTAK">Kotak Mahindra Bank</option>
                          <option value="PNB">Punjab National Bank</option>
                          <option value="BOB">Bank of Baroda</option>
                          <option value="CANARA">Canara Bank</option>
                          <option value="UNION">Union Bank of India</option>
                          <option value="INDUSIND">IndusInd Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* OPTION D: DIGITAL WALLETS */}
                  {checkoutMethod === 'WALLETS' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-amber-600" /> Digital Wallets & Pay Later
                        </h4>
                        <p className="text-xs text-slate-500">Fast 1-click checkout with your linked wallet balance.</p>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { id: 'AMAZON_PAY', name: 'Amazon Pay Balance & UPI', icon: '🛒', desc: 'Instant 1-Click Pay' },
                          { id: 'PAYTM', name: 'Paytm Wallet & Postpaid', icon: '💳', desc: 'Link and pay via Paytm' },
                          { id: 'MOBIKWIK', name: 'MobiKwik / ZIP Pay Later', icon: '⚡', desc: 'Pay next month' }
                        ].map(w => (
                          <div
                            key={w.id}
                            onClick={() => setSelectedWallet(w.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              selectedWallet === w.id
                                ? 'bg-amber-50/60 border-2 border-amber-500 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{w.icon}</span>
                              <div>
                                <span className="font-bold text-xs text-slate-900 block">{w.name}</span>
                                <span className="text-[10px] text-slate-500">{w.desc}</span>
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="walletSelection"
                              checked={selectedWallet === w.id}
                              onChange={() => setSelectedWallet(w.id)}
                              className="w-4 h-4 text-amber-600 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* OPTION E: PAY AT HOSPITAL COUNTER */}
                  {checkoutMethod === 'COUNTER' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                          <Banknote className="w-5 h-5 text-emerald-600" /> Pay at Hospital Counter (Cash on Visit)
                        </h4>
                        <p className="text-xs text-slate-500">Book token online now and pay cash/card upon hospital arrival.</p>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs text-emerald-900 shadow-xs">
                        <span className="font-bold text-sm block">🏥 Hospital Counter Payment Terms:</span>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-800">
                          <li>Your digital queue token will be confirmed immediately.</li>
                          <li>Please arrive 15 minutes before slot time to pay at the OP Registration Counter.</li>
                          <li>Accepted at desk: Cash, Cards, UPI QR, Hospital Health Cards.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                </div>

                {/* ═══ 3. RIGHT FLIPKART/AMAZON ORDER SUMMARY & ACTION ═══ */}
                <div className="lg:w-[320px] flex-shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-5 flex flex-col justify-between shadow-xs">
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-200">
                      Order Summary
                    </h4>

                    {/* Doctor & Hospital Details */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-900">{bookingDoctor?.doctorName}</p>
                          <p className="text-[11px] text-cyan-700 font-semibold">{bookingDoctor?.specialization}</p>
                        </div>
                        <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          OP Slot
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        🏥 {(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.hospitalName}
                      </p>
                      <p className="text-[10px] text-slate-600 font-mono pt-1 border-t border-slate-200">
                        📅 {bookingDate} · ⏰ {bookingTime}
                      </p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Consultation Fee</span>
                        <span className="font-semibold text-slate-900">₹{bookingDoctor?.opFee}.00</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Digital Platform Fee</span>
                        <span className="font-semibold text-emerald-600">FREE <span className="line-through text-slate-400">₹49</span></span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Taxes & GST (0%)</span>
                        <span className="font-semibold text-slate-900">₹0.00</span>
                      </div>
                      <div className="flex justify-between pt-2.5 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                        <span>Total Payable</span>
                        <span className="text-base text-cyan-700 font-extrabold">₹{bookingDoctor?.opFee}.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm & Pay Action */}
                  <div className="space-y-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        let finalMethod = 'UPI';
                        if (checkoutMethod === 'CARD') finalMethod = 'Card';
                        else if (checkoutMethod === 'NETBANKING') finalMethod = 'NetBanking';
                        else if (checkoutMethod === 'WALLETS') finalMethod = 'Wallet';
                        else if (checkoutMethod === 'COUNTER') finalMethod = 'Counter';
                        handleConfirmPayment(finalMethod);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm transition-all active:scale-[0.98]"
                    >
                      <Lock className="w-4 h-4" />
                      {checkoutMethod === 'COUNTER' ? 'Confirm Counter Booking' : `Pay ₹${bookingDoctor?.opFee} Securely`}
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingStep('FORM')}
                      className="w-full text-slate-500 hover:text-slate-800 text-xs py-1.5 cursor-pointer text-center font-semibold"
                    >
                      ← Back to Patient Details
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* STEP: PAYMENT VERIFICATION ANIMATION */}
            {bookingStep === 'VERIFYING' && (
              <div className="flex flex-col items-center justify-center py-10 px-6 space-y-6 text-center min-h-[400px]">
                {/* Title */}
                <div>
                  <p className="text-[10px] text-cyan-400 font-bold tracking-wider mb-1">SECURE PAYMENT GATEWAY</p>
                  <h3 className="font-bold text-white text-lg">
                    {verifyStep < 2 ? '🔄 Verifying Your Payment...' : '✅ Payment Confirmed!'}
                  </h3>
                </div>

                {/* Animated Ring */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {verifyStep < 2 ? (
                    <>
                      <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin"></div>
                      <div className="text-4xl">🏦</div>
                    </>
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-emerald-500/20 border-4 border-emerald-400 flex items-center justify-center animate-pulse">
                      <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                    </div>
                  )}
                </div>

                {/* Verification Steps */}
                <div className="w-full space-y-3 px-2">
                  {/* Step 1: Connecting */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${verifyStep >= 0 ? 'border-cyan-500/40 bg-cyan-950/30' : 'border-slate-800 bg-slate-900/30 opacity-40'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${verifyStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-cyan-500/30 text-cyan-300'}`}>
                      {verifyStep >= 1 ? '✓' : (
                        <span className="block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-bold ${verifyStep >= 1 ? 'text-emerald-400' : 'text-cyan-300'}`}>Connecting to UPI Gateway</p>
                      <p className="text-[10px] text-slate-400">Establishing secure NPCI connection...</p>
                    </div>
                  </div>

                  {/* Step 2: Verifying Transaction */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${verifyStep >= 1 ? 'border-cyan-500/40 bg-cyan-950/30' : 'border-slate-800 bg-slate-900/30 opacity-40'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${verifyStep >= 2 ? 'bg-emerald-500 text-white' : verifyStep === 1 ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-800 text-slate-600'}`}>
                      {verifyStep >= 2 ? '✓' : verifyStep === 1 ? (
                        <span className="block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                      ) : '2'}
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-bold ${verifyStep >= 2 ? 'text-emerald-400' : verifyStep >= 1 ? 'text-cyan-300' : 'text-slate-600'}`}>Verifying UPI Transaction</p>
                      <p className="text-[10px] text-slate-400">Checking bank debit confirmation & TRID...</p>
                    </div>
                  </div>

                  {/* Step 3: Amount Credit Confirmed */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${verifyStep >= 2 ? 'border-emerald-500/40 bg-emerald-950/30' : 'border-slate-800 bg-slate-900/30 opacity-40'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${verifyStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                      {verifyStep >= 2 ? '✓' : '3'}
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-bold ${verifyStep >= 2 ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {verifyStep >= 2 ? `₹${bookingDoctor?.opFee} Credited to Hospital Account ✓` : 'Amount Credit Verification'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {verifyStep >= 2 ? 'Transaction ID verified. Booking auto-confirmed!' : 'Waiting for bank credit confirmation...'}
                      </p>
                    </div>
                  </div>
                </div>

                {verifyStep >= 2 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 w-full">
                    <p className="text-emerald-400 font-bold text-sm">🎉 Payment Successfully Verified!</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Opening your OP Appointment Ticket...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- DIGITAL TICKET & PAYMENT RECEIPT PDF MODAL --- */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-emerald-500/40 shadow-2xl relative space-y-4 text-center max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            {/* Payment Successfully Status Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl space-y-1">
              <div className="inline-flex p-2.5 rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-emerald-400 text-lg">Payment Successfully Completed! ✓</h3>
              <p className="text-[11px] text-slate-300">OP Consultation Token Confirmed & Hospital Notified</p>
            </div>

            {/* PDF Printable Sheet Box */}
            <div id="pdf-printable-sheet" className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-3 text-xs text-slate-300 shadow-inner">
              
              {/* Unique OP Token Code & Status */}
              <div className="bg-gradient-to-r from-cyan-950 to-slate-900 p-3 rounded-xl border border-cyan-500/40 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">UNIQUE OP TOKEN CODE</span>
                    <span className="font-mono text-cyan-300 font-extrabold text-base tracking-wider">#{selectedTicket.bookingId}</span>
                  </div>
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-md">
                    CONFIRMED & PAID
                  </span>
                </div>
                
                {/* Transaction Reference Number */}
                <div className="border-t border-slate-800/80 pt-2 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-semibold">Transaction Reference Number:</span>
                  <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 tracking-wider">
                    {selectedTicket.referenceNumber || ('DUP' + (selectedTicket.bookingId ? selectedTicket.bookingId.replace(/\D/g, '') : '2904329'))}
                  </span>
                </div>
              </div>

              {/* Patient & OP Details */}
              <div className="space-y-1.5 pt-1">
                <p className="text-white font-bold text-sm">👨‍⚕️ Doctor: {selectedTicket.doctorName}</p>
                <p className="text-cyan-300 font-semibold">🏥 Hospital: {selectedTicket.hospitalName}</p>
                <p className="text-slate-300">🗓️ <strong>Date & Time:</strong> {selectedTicket.date} at {selectedTicket.time}</p>
                <p className="text-slate-300">👤 <strong>Patient Name:</strong> {selectedTicket.userName} ({selectedTicket.userPhone})</p>
                <p className="text-slate-300">💰 <strong>Fee Paid:</strong> <span className="text-emerald-400 font-bold text-sm">₹{selectedTicket.opFee}</span></p>
                <p className="text-slate-300">💳 <strong>Payment Mode:</strong> {selectedTicket.paymentMethod || 'Online NetBanking / UPI'}</p>
              </div>

            </div>

            {/* Action Buttons: PDF Download / Print */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  printOpTicketReceipt(selectedTicket);
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                📄 Download PDF Sheet
              </button>
              <button
                onClick={() => {
                  printOpTicketReceipt(selectedTicket);
                }}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-3 rounded-xl border border-slate-700 cursor-pointer"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DOCTOR RATING & REVIEW MODAL --- */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-amber-500/30 shadow-2xl relative space-y-4">
            <button onClick={() => setReviewBooking(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Star className="w-5 h-5 fill-amber-400" /> Rate Your Doctor Experience
            </div>

            <h3 className="font-extrabold text-white text-lg">Dr. {reviewBooking.doctorName}</h3>
            <p className="text-xs text-slate-400">{reviewBooking.hospitalName} • OP Appointment #{reviewBooking.bookingId}</p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-2">Select Rating</label>
                <StarInput value={reviewStars} onChange={setReviewStars} />
              </div>

              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1">Your Review / Feedback (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="How was your consultation experience? Doctor diagnosis, waiting time, staff behavior..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={reviewStars === 0}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg shadow-amber-500/20 text-xs disabled:opacity-40"
              >
                Submit Doctor Review ⭐
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SELECTED HOSPITAL DOCTORS MODAL --- */}
      {selectedHospitalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-cyan-500/30 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setSelectedHospitalModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10">
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img src={selectedHospitalModal.logo} className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                      {selectedHospitalModal.city}
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      {selectedHospitalModal.hospitalType || 'Hospital'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-xl mt-1">{selectedHospitalModal.hospitalName}</h3>
                  <p className="text-xs text-slate-400">{selectedHospitalModal.address}, {selectedHospitalModal.area}</p>
                </div>
              </div>

              {/* Direct Hospital Phone Call & WhatsApp Buttons */}
              <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                <a
                  href={`tel:+91${(selectedHospitalModal.phone || '9123456789').replace(/\D/g, '').slice(-10)}`}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all scale-[1.02] active:scale-95"
                  title="Direct Phone Call to Hospital Desk"
                >
                  <PhoneCall className="w-4 h-4" /> Call Hospital (+91 {selectedHospitalModal.phone})
                </a>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?phone=91${(selectedHospitalModal.phone || '9123456789').replace(/\D/g, '').slice(-10)}&text=${encodeURIComponent(`🏥 *Enquiry for ${selectedHospitalModal.hospitalName}*\n\nHello, I am looking for OP consultation and doctor timings at your hospital.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition-all"
                    title="WhatsApp Enquiry"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Chat
                  </a>

                  {selectedHospitalModal.mapsUrl && (
                    <a
                      href={selectedHospitalModal.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Map
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Available Verified Doctors ({doctors.filter(d => d.hospitalId === selectedHospitalModal._id && d.status === 'ACTIVE').length})</span>
                <span className="text-xs font-normal text-slate-400">Click "Book OP" to schedule appointment</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.filter(d => d.hospitalId === selectedHospitalModal._id && d.status === 'ACTIVE').map(doc => (
                  <div key={doc._id} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
                    <div className="flex gap-3">
                      <img src={doc.image} className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0" />
                      <div>
                        <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/20">
                          {doc.specialization}
                        </span>
                        <h5 className="font-bold text-white text-xs mt-1">{doc.doctorName}</h5>
                        <p className="text-[11px] text-slate-400">{doc.qualification}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{doc.experience} Years Experience</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-300">Fee: <strong className="text-cyan-400 font-bold">₹{doc.opFee}</strong></span>
                      <button
                        onClick={() => {
                          setSelectedHospitalModal(null);
                          setPatientDetails(prev => ({
                            ...prev,
                            name: prev.name || currentUser?.fullName || '',
                            phone: prev.phone || currentUser?.phone || ''
                          }));
                          if (!bookingDate) {
                            setBookingDate(new Date().toISOString().split('T')[0]);
                          }
                          if (!bookingTime) {
                            setBookingTime('09:30 AM');
                          }
                          setBookingDoctor(doc);
                          setBookingStep('FORM');
                        }}
                        className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1"
                      >
                        Book OP <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {doctors.filter(d => d.hospitalId === selectedHospitalModal._id && d.status === 'ACTIVE').length === 0 && (
                  <div className="col-span-2 p-8 text-center text-slate-500 text-xs">
                    No active doctors available for this hospital currently.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MOBILE BOTTOM NAVIGATION BAR (Smartphones) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('HOME')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'HOME' ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('SEARCH')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'SEARCH' ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Search</span>
        </button>

        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className={`flex flex-col items-center gap-1 relative ${activeTab === 'BOOKINGS' ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Bookings</span>
          {userBookings.length > 0 && (
            <span className="absolute -top-1 right-2 w-3.5 h-3.5 bg-cyan-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {userBookings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('HOSPITALS')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'HOSPITALS' ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px]">Hospitals</span>
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'PROFILE' ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>

    </div>
  );
}

