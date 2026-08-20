import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, MapPin, Stethoscope, Calendar, Clock, Ticket, 
  CheckCircle2, AlertCircle, QrCode, FileText, X, ArrowRight, UserCheck, CreditCard, Sparkles, Filter 
} from 'lucide-react';
import { ALL_INDIAN_CITIES } from '../utils/citiesData';

export default function PatientPortal() {
  const { 
    hospitals, doctors, bookings, prescriptions, 
    createBooking, activeDigitalTicket, setActiveDigitalTicket 
  } = useApp();

  const [activeTab, setActiveTab] = useState('BOOK_OP'); // BOOK_OP | MY_BOOKINGS | PRESCRIPTIONS
  const [searchCity, setSearchCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({
    slotId: '',
    slotTime: '',
    patientName: 'Siva Kumar',
    patientAge: '28',
    patientGender: 'Male',
    patientPhone: '+91 98765 43210',
    reason: 'Fever & viral infection consultation',
    paymentMethod: 'ONLINE'
  });

  // Filter Doctors
  const filteredDoctors = doctors.filter(doc => {
    const hospital = hospitals.find(h => h.id === doc.hospitalId);
    const matchesCity = searchCity ? hospital?.city.toLowerCase().includes(searchCity.toLowerCase()) : true;
    const matchesSpecialty = selectedSpecialty === 'ALL' ? true : doc.specialty === selectedSpecialty;
    const matchesQuery = searchQuery 
      ? doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital?.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCity && matchesSpecialty && matchesQuery;
  });

  const handleOpenBookingModal = (doc) => {
    setSelectedDoctorForBooking(doc);
    if (doc.availableSlots && doc.availableSlots.length > 0) {
      setBookingFormData(prev => ({
        ...prev,
        slotId: doc.availableSlots[0].id,
        slotTime: doc.availableSlots[0].time
      }));
    }
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!selectedDoctorForBooking) return;

    createBooking({
      doctorId: selectedDoctorForBooking.id,
      hospitalId: selectedDoctorForBooking.hospitalId,
      slotId: bookingFormData.slotId,
      slotTime: bookingFormData.slotTime,
      patientName: bookingFormData.patientName,
      patientAge: bookingFormData.patientAge,
      patientGender: bookingFormData.patientGender,
      patientPhone: bookingFormData.patientPhone,
      reason: bookingFormData.reason,
      paymentMethod: bookingFormData.paymentMethod
    });

    setSelectedDoctorForBooking(null);
  };

  return (
    <div className="space-y-6">

      {/* Top Banner & Tab Navigation */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Instant OP Token Generator
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white font-outfit">
              Book Doctor OP Token Online
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Select your hospital, pick a doctor, and track your live token counter from home.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('BOOK_OP')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'BOOK_OP'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Book OP Slot
            </button>
            <button
              onClick={() => setActiveTab('MY_BOOKINGS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'MY_BOOKINGS'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My OP Tickets
              <span className="bg-slate-800 text-cyan-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-cyan-500/20">
                {bookings.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('PRESCRIPTIONS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'PRESCRIPTIONS'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Prescriptions ({prescriptions.length})
            </button>
          </div>
        </div>
      </div>

      {/* --- TAB 1: BOOK OP SLOT --- */}
      {activeTab === 'BOOK_OP' && (
        <div className="space-y-6">

          {/* Search & Filter Controls */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search Doctor, Hospital or Specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* City Filter */}
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="">All Cities ({ALL_INDIAN_CITIES.length})</option>
                {ALL_INDIAN_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Specialty Filter */}
            <div className="relative">
              <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Neurology">Neurology</option>
              </select>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map(doc => {
              const hospital = hospitals.find(h => h.id === doc.hospitalId);
              return (
                <div key={doc.id} className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  
                  {/* Doctor Info */}
                  <div className="flex gap-4">
                    <img 
                      src={doc.image} 
                      alt={doc.name} 
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shadow-md"
                    />
                    <div className="space-y-1">
                      <span className="bg-cyan-500/10 text-cyan-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/20">
                        {doc.specialty}
                      </span>
                      <h3 className="font-bold text-white text-base leading-snug">{doc.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{doc.qualification}</p>
                      <p className="text-xs text-slate-400">{doc.experience} Years Experience</p>
                    </div>
                  </div>

                  {/* Hospital Details */}
                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {hospital?.name}
                      </span>
                      <span className="text-amber-400 font-bold">★ {hospital?.rating}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-5">{hospital?.address}</p>
                  </div>

                  {/* Slots & Fees Footer */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Consultation Fee</span>
                      <p className="text-lg font-extrabold text-cyan-400">₹{doc.fee}</p>
                    </div>

                    <button
                      onClick={() => handleOpenBookingModal(doc)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
                    >
                      Book OP Token <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* --- TAB 2: MY BOOKINGS & LIVE TRACKER --- */}
      {activeTab === 'MY_BOOKINGS' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-cyan-400" /> Your Active OP Tokens
          </h3>

          {bookings.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
              No OP tokens booked yet. Click "Book OP Slot" to get your first token!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map(booking => {
                const doctor = doctors.find(d => d.id === booking.doctorId);
                const activeSlot = doctor?.availableSlots.find(s => s.id === booking.slotId);
                const currentToken = activeSlot?.currentToken || 0;
                const isMyTurn = currentToken === booking.tokenNumber;
                const isPassed = currentToken > booking.tokenNumber;

                return (
                  <div key={booking.id} className="glass-card rounded-2xl p-5 relative overflow-hidden space-y-4">
                    
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-cyan-400 font-bold">#{booking.id}</span>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                        booking.status === 'IN_CONSULTATION' || isMyTurn
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse'
                          : booking.status === 'COMPLETED'
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {isMyTurn ? '🚨 YOUR TURN NOW!' : booking.status}
                      </span>
                    </div>

                    {/* Token Number Highlight & Live Status */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 uppercase font-semibold">Your Token Number</span>
                        <div className="text-4xl font-extrabold text-cyan-400 font-outfit">
                          #{booking.tokenNumber}
                        </div>
                      </div>

                      {/* Live Queue Box */}
                      <div className="text-right bg-slate-900 px-3.5 py-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold block">CURRENT RUNNING</span>
                        <span className="text-xl font-bold text-amber-400">
                          #{currentToken}
                        </span>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-1 text-xs text-slate-300">
                      <p className="font-semibold text-white text-sm">{booking.doctorName}</p>
                      <p className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" /> {booking.hospitalName}
                      </p>
                      <p className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" /> {booking.slotTime}
                      </p>
                      <p className="text-slate-400">Patient: <strong className="text-slate-200">{booking.patientName}</strong> ({booking.patientAge}y, {booking.patientGender})</p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => setActiveDigitalTicket(booking)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-2 border border-cyan-500/20"
                    >
                      <QrCode className="w-3.5 h-3.5" /> View Digital Ticket & QR Code
                    </button>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: PRESCRIPTIONS --- */}
      {activeTab === 'PRESCRIPTIONS' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> My Medical Prescriptions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map(pres => (
              <div key={pres.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{pres.doctorName}</h4>
                    <p className="text-xs text-slate-400">Date: {pres.date}</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono">
                    {pres.id}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-cyan-400 font-semibold">Diagnosis:</span>
                  <p className="text-xs text-slate-200">{pres.diagnosis}</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">Prescribed Medicines:</span>
                  {pres.medicines.map((med, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300 border-b border-slate-800/50 py-1 last:border-0">
                      <span className="font-medium text-white">• {med.name}</span>
                      <span className="text-cyan-400">{med.dosage} ({med.duration})</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-400 italic">Notes: {pres.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- BOOKING MODAL --- */}
      {selectedDoctorForBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-800 shadow-2xl relative space-y-5">
            
            <button 
              onClick={() => setSelectedDoctorForBooking(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <img src={selectedDoctorForBooking.image} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h3 className="font-bold text-white text-base">Book OP Slot with {selectedDoctorForBooking.name}</h3>
                <p className="text-xs text-cyan-400">{selectedDoctorForBooking.specialty} • Fee: ₹{selectedDoctorForBooking.fee}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              
              {/* Slot Select */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Select Time Slot</label>
                <select
                  value={bookingFormData.slotId}
                  onChange={(e) => {
                    const slot = selectedDoctorForBooking.availableSlots.find(s => s.id === e.target.value);
                    setBookingFormData(prev => ({ ...prev, slotId: e.target.value, slotTime: slot?.time || '' }));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-cyan-500"
                  required
                >
                  {selectedDoctorForBooking.availableSlots.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.time} (Available Tokens: {s.maxTokens - s.totalBooked}/{s.maxTokens})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={bookingFormData.patientName}
                    onChange={(e) => setBookingFormData(prev => ({ ...prev, patientName: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Age</label>
                  <input
                    type="number"
                    value={bookingFormData.patientAge}
                    onChange={(e) => setBookingFormData(prev => ({ ...prev, patientAge: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingFormData(prev => ({ ...prev, paymentMethod: 'ONLINE' }))}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center flex items-center justify-center gap-2 ${
                      bookingFormData.paymentMethod === 'ONLINE'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Pay Online (UPI/Card)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingFormData(prev => ({ ...prev, paymentMethod: 'COUNTER' }))}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center flex items-center justify-center gap-2 ${
                      bookingFormData.paymentMethod === 'COUNTER'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Pay at Hospital Counter
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/25 text-sm hover:from-cyan-400 hover:to-blue-500"
              >
                Confirm & Generate OP Token
              </button>
            </form>

          </div>
        </div>
      )}

      {/* --- DIGITAL OP TICKET MODAL --- */}
      {activeDigitalTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 relative space-y-4 text-center">
            
            <button 
              onClick={() => setActiveDigitalTicket(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-extrabold text-white text-xl">OP Token Confirmed!</h3>
            <p className="text-xs text-slate-400">Please present this digital ticket at the hospital counter.</p>

            {/* Ticket Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-left space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400 font-mono">TICKET #{activeDigitalTicket.id}</span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {activeDigitalTicket.paymentStatus}
                </span>
              </div>

              <div className="text-center py-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">TOKEN NUMBER</span>
                <div className="text-5xl font-extrabold text-cyan-400 font-outfit tracking-tight">
                  #{activeDigitalTicket.tokenNumber}
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800 pt-3">
                <p><strong>Doctor:</strong> {activeDigitalTicket.doctorName}</p>
                <p><strong>Hospital:</strong> {activeDigitalTicket.hospitalName}</p>
                <p><strong>Timing:</strong> {activeDigitalTicket.slotTime}</p>
                <p><strong>Patient:</strong> {activeDigitalTicket.patientName}</p>
              </div>

              {/* QR Code Mock */}
              <div className="pt-2 flex flex-col items-center justify-center">
                <div className="bg-white p-2.5 rounded-xl">
                  <QrCode className="w-24 h-24 text-slate-950" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Scan for verification</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 rounded-xl border border-slate-700"
            >
              Print / Save OP Ticket
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
