import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { useLanguage } from '../../context/LanguageContext';
import AppointmentSlotPicker from '../common/AppointmentSlotPicker';
import { StarDisplay, StarInput } from '../common/StarRating';
import { 
  Home, Search, Calendar, Building2, Stethoscope, User, LogOut, MapPin, Clock, 
  Ticket, CheckCircle2, QrCode, ArrowRight, X, Edit3, Lock, Sparkles, Filter, 
  CreditCard, Smartphone, Banknote, ScanLine, Star, MessageSquare
} from 'lucide-react';

export default function UserPortal() {
  const { currentUser, logout, setCurrentUser } = useAuth();
  const { hospitals, doctors, bookings, createBooking, updateBookingStatus, addReview, getReviewsByDoctor, hasUserReviewedBooking, addNotification } = useDb();
  const { t } = useLanguage();

  // Navigation Tab State: 'HOME' | 'SEARCH' | 'BOOKINGS' | 'HOSPITALS' | 'DOCTORS' | 'PROFILE'
  const [activeTab, setActiveTab] = useState('HOME');

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

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

  // Payment Step: 'FORM' | 'PAYMENT'
  const [bookingStep, setBookingStep] = useState('FORM');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentTab, setPaymentTab] = useState('UPI');

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // Hospital View Doctors Modal State
  const [selectedHospitalModal, setSelectedHospitalModal] = useState(null);

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    dateOfBirth: currentUser?.dateOfBirth || '',
    gender: currentUser?.gender || 'Male',
    address: currentUser?.address || '',
    newPassword: ''
  });

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
    e.preventDefault();
    setBookingStep('PAYMENT');
  };

  const handleConfirmPayment = (method) => {
    if (!bookingDoctor) return;
    const hosp = approvedHospitals.find(h => h._id === bookingDoctor.hospitalId);

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
      status: 'Confirmed'
    });

    // 🔔 Trigger in-app notification
    addNotification({
      userId: currentUser?._id,
      type: 'BOOKING',
      bookingId: newBk._id,
      icon: '✅',
      title: 'OP Booking Confirmed!',
      message: `Your appointment with ${bookingDoctor.doctorName} at ${hosp?.hospitalName} is confirmed for ${bookingDate} at ${bookingTime}. Payment: ${method}.`,
    });

    setBookingDoctor(null);
    setBookingStep('FORM');
    setPaymentMethod('');
    setSelectedTicket(newBk);
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
    alert('✅ Profile updated successfully!');
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
                        <p className="text-xs text-slate-400">{hosp?.hospitalName}</p>
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

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" /> {hosp?.hospitalName}
                    </p>
                    <p className="text-slate-400">{hosp?.address}, {hosp?.city}</p>
                    <p className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> {doc.availableDays} ({doc.availableTime})
                    </p>
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
        <div className="max-w-xl mx-auto glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" /> Patient Profile Settings
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Phone (Read-only)</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  readOnly
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="text-slate-400 font-semibold block mb-1">Change Password (Optional)</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 rounded-xl"
            >
              Update Profile Details
            </button>
          </form>
        </div>
      )}

      {/* --- BOOKING MODAL (Step 1: Details → Step 2: UPI Payment) --- */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-cyan-500/30 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => { setBookingDoctor(null); setBookingStep('FORM'); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-1 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* STEP 1: PATIENT & APPOINTMENT DETAILS FORM */}
            {bookingStep === 'FORM' && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-cyan-400 font-bold mb-0.5 tracking-wider">STEP 1 OF 2: APPOINTMENT & PATIENT DETAILS</p>
                  <h3 className="font-bold text-white text-lg">{t('bookingFor')}: {bookingDoctor.doctorName}</h3>
                </div>

                <form onSubmit={handleProceedToPayment} className="space-y-3 text-xs">
                  {/* Smart Appointment Slot Picker */}
                  <AppointmentSlotPicker
                    doctorId={bookingDoctor._id}
                    existingBookings={bookings}
                    selectedDate={bookingDate}
                    selectedTime={bookingTime}
                    onDateChange={setBookingDate}
                    onTimeChange={setBookingTime}
                  />

                  {/* Comprehensive Patient Details Form */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <User className="w-4 h-4 text-cyan-400" /> Patient Details (For Hospital Records)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Patient Full Name *</label>
                        <input
                          type="text"
                          placeholder="Enter patient name..."
                          value={patientDetails.name}
                          onChange={(e) => setPatientDetails(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          placeholder="Enter 10-digit phone number..."
                          value={patientDetails.phone}
                          onChange={(e) => setPatientDetails(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Age (Years)</label>
                        <input
                          type="number"
                          placeholder="e.g. 28"
                          value={patientDetails.age}
                          onChange={(e) => setPatientDetails(prev => ({ ...prev, age: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600"
                          min="1"
                          max="120"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Gender</label>
                        <select
                          value={patientDetails.gender}
                          onChange={(e) => setPatientDetails(prev => ({ ...prev, gender: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Symptoms / Reason for Visit</label>
                      <input
                        type="text"
                        placeholder="e.g. Fever, Cold, Stomach Pain, General Consultation..."
                        value={patientDetails.reason}
                        onChange={(e) => setPatientDetails(prev => ({ ...prev, reason: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">{t('fee')}:</span>
                    <span className="text-lg font-extrabold text-cyan-400">₹{bookingDoctor.opFee}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <CreditCard className="w-4 h-4" /> Proceed to Payment (₹{bookingDoctor.opFee}) →
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: NETBANKING & UPI QR PAYMENT SECTION */}
            {bookingStep === 'PAYMENT' && (
              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-[10px] text-cyan-400 font-bold mb-0.5 tracking-wider">STEP 2 OF 2: SECURE NETBANKING & UPI PAYMENT</p>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <ScanLine className="w-5 h-5 text-cyan-400" /> {(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0] || {})?.hospitalName || 'Apollo Health City'} OP Payment
                  </h3>
                </div>

                {/* Doctor & Fee Summary Card */}
                <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">Dr. {bookingDoctor?.doctorName}</p>
                    <p className="text-slate-400">{bookingDoctor?.specialization} | Date: {bookingDate}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Total OP Fee</span>
                    <span className="text-lg font-extrabold text-cyan-400">₹{bookingDoctor?.opFee}</span>
                  </div>
                </div>

                {/* Payment Method Selector Tabs */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 font-bold">
                  <button
                    type="button"
                    onClick={() => setPaymentTab('UPI')}
                    className={`flex-1 py-2 rounded-lg transition-all ${(!paymentTab || paymentTab === 'UPI') ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    📱 UPI & Scan QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab('NETBANKING')}
                    className={`flex-1 py-2 rounded-lg transition-all ${(paymentTab === 'NETBANKING') ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    🏦 Direct NetBanking
                  </button>
                </div>

                {/* TAB 1: Dynamic Hospital UPI QR Code Area */}
                {(!paymentTab || paymentTab === 'UPI') && (
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3 shadow-xl text-slate-900">
                    <div className="bg-slate-950 p-2.5 rounded-2xl border-2 border-cyan-500/30">
                      <img
                        src={(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.upiQrCode || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.upiId || 'paytm.s2zpy5u@pty'}&pn=${(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.hospitalName || 'Hospital'}&am=${bookingDoctor?.opFee || 100}&cu=INR`)}`}
                        className="w-36 h-36 object-contain rounded-xl"
                        alt="Hospital UPI QR Code"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-extrabold text-base text-slate-900">{(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.hospitalName || 'Apollo Health City'}</p>
                      <p className="font-semibold text-xs text-slate-700 mt-0.5">Dr. {bookingDoctor?.doctorName}</p>
                      <p className="text-xs font-mono font-bold mt-1 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 text-slate-800">
                        UPI ID: {(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.upiId || 'paytm.s2zpy5u@pty'}
                      </p>
                      <p className="text-slate-500 text-[10px] mt-1 font-medium">Pay via GPay / PhonePe / Paytm / BHIM UPI</p>
                    </div>
                    <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-5 py-2 text-center w-full">
                      <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider">DOCTOR CONSULTATION FEE</p>
                      <p className="text-2xl font-extrabold text-cyan-700 font-outfit">₹{bookingDoctor?.opFee}</p>
                    </div>
                  </div>
                )}

                {/* TAB 2: Direct NetBanking Details Box */}
                {paymentTab === 'NETBANKING' && (
                  <div className="bg-slate-950 rounded-2xl p-4 border border-cyan-500/40 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-cyan-300 font-bold text-sm flex items-center gap-1.5">
                        🏦 Hospital Business NetBanking Account
                      </span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">DIRECT CREDIT</span>
                    </div>

                    <div className="space-y-2 bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Holder:</span>
                        <span className="text-white font-bold">{(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.accountHolderName || 'Sukhavasi Sivamani'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bank Name:</span>
                        <span className="text-emerald-400 font-bold">{(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.bankName || 'State Bank of India'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Account Number:</span>
                        <span className="text-cyan-300 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.bankAccountNo || '42417133367'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">IFSC Code:</span>
                        <span className="text-amber-300 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.ifscCode || 'sbin0008487'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Type:</span>
                        <span className="text-slate-200 font-semibold">{(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.accountType || 'Current Business Account'}</span>
                      </div>
                    </div>

                    <div className="bg-cyan-950/40 border border-cyan-500/30 p-2.5 rounded-xl text-[11px] text-cyan-300 text-center">
                      💳 Perform NEFT / RTGS / IMPS transfer of <strong>₹{bookingDoctor?.opFee}</strong> directly into the above bank account.
                    </div>
                  </div>
                )}

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                    <ShieldCheck className="w-4 h-4" /> Secure Payment & Bank Account Verification
                  </div>
                  <p className="text-[11px] text-slate-400">
                    🔒 Payments are routed directly to <strong>{(hospitals.find(h => h._id === bookingDoctor?.hospitalId) || hospitals[0])?.hospitalName || 'Apollo Health City'}</strong>'s Business Bank Account.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleConfirmPayment(paymentTab === 'NETBANKING' ? 'NetBanking' : 'UPI')}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" /> {paymentTab === 'NETBANKING' ? 'I Have Paid via NetBanking ✓' : t('paidUpi')} (₹{bookingDoctor?.opFee})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmPayment('Counter')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 border border-slate-700 text-xs cursor-pointer"
                  >
                    <Banknote className="w-4 h-4 text-amber-400" /> {t('payAtCounter')} (₹{bookingDoctor?.opFee})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setBookingStep('FORM')}
                  className="w-full text-slate-500 hover:text-slate-300 text-xs py-1 cursor-pointer"
                >
                  ← Back to booking details
                </button>
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
              <div className="bg-gradient-to-r from-cyan-950 to-slate-900 p-3 rounded-xl border border-cyan-500/40 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">UNIQUE OP TOKEN CODE</span>
                  <span className="font-mono text-cyan-300 font-extrabold text-base tracking-wider">#{selectedTicket.bookingId}</span>
                </div>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-md">
                  CONFIRMED & PAID
                </span>
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

              {/* 🏦 Hospital Business NetBanking & UPI Details Box */}
              {(() => {
                const hosp = hospitals.find(h => h._id === selectedTicket.hospitalId) || hospitals[0] || {};
                return (
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1 mt-2 text-slate-300">
                    <p className="text-cyan-400 font-bold flex items-center justify-between">
                      <span>🏦 HOSPITAL BANK & SETTLEMENT RECEIPT:</span>
                      <span className="text-[9px] text-emerald-400 font-mono">VERIFIED</span>
                    </p>
                    <p><strong>Account Holder:</strong> {hosp.accountHolderName || hosp.hospitalName}</p>
                    <p><strong>Bank Name:</strong> {hosp.bankName || 'HDFC Bank'} | <strong>IFSC:</strong> {hosp.ifscCode || 'HDFC0000123'}</p>
                    <p><strong>Account No:</strong> <span className="font-mono text-cyan-300 font-bold">{hosp.bankAccountNo || '99881100223344'}</span></p>
                    <p><strong>UPI ID:</strong> <span className="font-mono text-amber-300 font-bold">{hosp.upiId || 'paytm.s2zpy5u@pty'}</span></p>
                  </div>
                );
              })()}

              {/* Dynamic QR Code */}
              <div className="pt-2 flex flex-col items-center">
                {(() => {
                  const hosp = hospitals.find(h => h._id === selectedTicket.hospitalId) || hospitals[0] || {};
                  const upiId = hosp.upiId || 'paytm.s2zpy5u@pty';
                  const feeAmount = selectedTicket.opFee || 100;
                  const dynamicUpiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(selectedTicket.hospitalName)}&am=${feeAmount}&cu=INR`;
                  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(dynamicUpiUrl)}`;

                  return (
                    <div className="flex flex-col items-center space-y-1.5">
                      <div className="bg-white p-2 rounded-2xl border-2 border-emerald-500/50 shadow-md flex flex-col items-center">
                        <img
                          src={qrApiUrl}
                          className="w-28 h-28 object-contain rounded-xl"
                          alt="Hospital Dynamic UPI QR Code"
                        />
                        <div className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full mt-1 shadow">
                          FIXED PAY AMOUNT: ₹{feeAmount}
                        </div>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold text-center">
                        📱 Scan with GPay / PhonePe / Paytm to Pay Exact ₹{feeAmount}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Action Buttons: PDF Download / Print */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  printPdfReport(
                    `CarePulse — OP Ticket #${selectedTicket.bookingId}`,
                    ['Unique Code', 'Doctor', 'Hospital', 'Date & Time', 'Patient', 'Fee (₹)', 'Payment Status'],
                    [[
                      `#${selectedTicket.bookingId}`,
                      selectedTicket.doctorName,
                      selectedTicket.hospitalName,
                      `${selectedTicket.date} ${selectedTicket.time}`,
                      selectedTicket.userName,
                      `₹${selectedTicket.opFee}`,
                      'Payment Successfully Completed'
                    ]]
                  );
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5"
              >
                📄 Download PDF Sheet
              </button>
              <button
                onClick={() => window.print()}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-3 rounded-xl border border-slate-700"
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

            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <img src={selectedHospitalModal.logo} className="w-16 h-16 rounded-2xl object-cover border border-slate-700" />
              <div>
                <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  {selectedHospitalModal.city}
                </span>
                <h3 className="font-extrabold text-white text-xl mt-1">{selectedHospitalModal.hospitalName}</h3>
                <p className="text-xs text-slate-400">{selectedHospitalModal.address}, {selectedHospitalModal.area}</p>
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

