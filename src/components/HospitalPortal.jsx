import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, Users, Play, CheckCircle, XCircle, Plus, 
  FilePlus, Clock, Stethoscope, PhoneCall, AlertCircle, ChevronRight, RefreshCw, X 
} from 'lucide-react';

export default function HospitalPortal() {
  const { 
    doctors, bookings, createBooking, callNextToken, updateBookingStatus, 
    addPrescription, selectedDoctorForDesk, setSelectedDoctorForDesk 
  } = useApp();

  const [selectedSlotId, setSelectedSlotId] = useState('slot-101');
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(null); // booking object

  // Form State for Walk-in Patient Token
  const [walkinData, setWalkinData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: 'Male',
    patientPhone: '',
    reason: 'Offline Walk-in OP Registration'
  });

  // Form State for Prescription
  const [presData, setPresData] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '1-0-1', duration: '5 Days' }],
    notes: ''
  });

  const activeDoctor = doctors.find(d => d.id === selectedDoctorForDesk) || doctors[0];
  const activeSlot = activeDoctor?.availableSlots.find(s => s.id === selectedSlotId) || activeDoctor?.availableSlots[0];

  // Filter Bookings for selected doctor & slot
  const slotBookings = bookings.filter(b => b.doctorId === activeDoctor?.id && b.slotId === activeSlot?.id);

  // Statistics
  const totalBooked = slotBookings.length;
  const currentToken = activeSlot?.currentToken || 0;
  const completedCount = slotBookings.filter(b => b.status === 'COMPLETED').length;
  const inConsultationBooking = slotBookings.find(b => b.status === 'IN_CONSULTATION' || b.tokenNumber === currentToken);

  const handleCallNext = () => {
    if (activeDoctor && activeSlot) {
      callNextToken(activeDoctor.id, activeSlot.id);
    }
  };

  const handleCreateWalkinToken = (e) => {
    e.preventDefault();
    if (!activeDoctor || !activeSlot) return;

    createBooking({
      doctorId: activeDoctor.id,
      hospitalId: activeDoctor.hospitalId,
      slotId: activeSlot.id,
      slotTime: activeSlot.time,
      patientName: walkinData.patientName,
      patientAge: walkinData.patientAge,
      patientGender: walkinData.patientGender,
      patientPhone: walkinData.patientPhone,
      reason: walkinData.reason,
      paymentMethod: 'COUNTER'
    });

    setShowWalkinModal(false);
    setWalkinData({ patientName: '', patientAge: '', patientGender: 'Male', patientPhone: '', reason: 'Offline Walk-in OP Registration' });
  };

  const handleSavePrescription = (e) => {
    e.preventDefault();
    if (!showPrescriptionModal) return;

    addPrescription({
      bookingId: showPrescriptionModal.id,
      doctorName: activeDoctor.name,
      patientName: showPrescriptionModal.patientName,
      diagnosis: presData.diagnosis,
      medicines: presData.medicines,
      notes: presData.notes
    });

    setShowPrescriptionModal(null);
    setPresData({ diagnosis: '', medicines: [{ name: '', dosage: '1-0-1', duration: '5 Days' }], notes: '' });
  };

  const handleAddMedicineRow = () => {
    setPresData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '1-0-1', duration: '5 Days' }]
    }));
  };

  return (
    <div className="space-y-6">

      {/* Hospital Top Dashboard Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white font-outfit">Hospital Queue Control Desk</h2>
            <p className="text-xs text-slate-400">Manage Doctor live token counters, walk-in tokens, and digital prescriptions.</p>
          </div>
        </div>

        {/* Doctor Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-semibold hidden sm:block">Select Doctor:</label>
          <select
            value={selectedDoctorForDesk}
            onChange={(e) => {
              setSelectedDoctorForDesk(e.target.value);
              const doc = doctors.find(d => d.id === e.target.value);
              if (doc && doc.availableSlots.length > 0) {
                setSelectedSlotId(doc.availableSlots[0].id);
              }
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
          >
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Queue Counter Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- LEFT PANEL: LIVE TOKEN COUNTER CONTROL DESK --- */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> DOCTOR CABIN LIVE DESK
            </span>
            <span className="text-xs text-slate-400 font-mono">Slot: {activeSlot?.time}</span>
          </div>

          {/* Current Running Token Huge Card */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-3 shadow-inner">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">CURRENT TOKEN IN CABIN</span>
            <div className="text-6xl font-extrabold text-emerald-400 font-outfit glow-emerald">
              #{currentToken}
            </div>
            {inConsultationBooking ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-xs">
                <span className="text-slate-400 block">Patient Name:</span>
                <strong className="text-white text-sm">{inConsultationBooking.patientName}</strong> ({inConsultationBooking.patientAge}y, {inConsultationBooking.patientGender})
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No patient currently inside cabin.</p>
            )}
          </div>

          {/* Action Control Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCallNext}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 text-base transition-all scale-[1.01] active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" /> CALL NEXT PATIENT (TOKEN #{currentToken + 1})
            </button>

            {inConsultationBooking && (
              <button
                onClick={() => setShowPrescriptionModal(inConsultationBooking)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-cyan-500/30"
              >
                <FilePlus className="w-4 h-4" /> Create Prescription & Complete Consultation
              </button>
            )}
          </div>

          {/* Queue Statistics */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="bg-slate-900 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Total Booked</span>
              <span className="text-base font-bold text-white">{totalBooked}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Completed</span>
              <span className="text-base font-bold text-emerald-400">{completedCount}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Remaining</span>
              <span className="text-base font-bold text-amber-400">{Math.max(0, totalBooked - completedCount)}</span>
            </div>
          </div>

        </div>

        {/* --- RIGHT PANEL: DAILY OP PATIENT LIST & WALK-IN REGISTRATION --- */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" /> Patient Tokens for {activeDoctor?.name}
            </h3>

            <button
              onClick={() => setShowWalkinModal(true)}
              className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Walk-in Token
            </button>
          </div>

          {/* Patient Tokens List */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Token</th>
                    <th className="p-3.5">Patient Details</th>
                    <th className="p-3.5">Reason / Symptoms</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {slotBookings.map(b => (
                    <tr key={b.id} className={`hover:bg-slate-900/50 transition-colors ${
                      b.tokenNumber === currentToken ? 'bg-emerald-500/10 font-medium' : ''
                    }`}>
                      <td className="p-3.5 font-bold text-emerald-400 font-mono text-sm">
                        #{b.tokenNumber}
                      </td>
                      <td className="p-3.5">
                        <strong className="text-white block">{b.patientName}</strong>
                        <span className="text-[11px] text-slate-400">{b.patientAge}y, {b.patientGender} • {b.patientPhone}</span>
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-xs truncate">
                        {b.reason}
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {b.paymentStatus} (₹{b.amount})
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'IN_CONSULTATION' ? 'bg-emerald-500 text-slate-950 animate-pulse' :
                          b.status === 'COMPLETED' ? 'bg-slate-800 text-slate-400' : 'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => updateBookingStatus(b.id, 'COMPLETED')}
                          className="p-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white rounded-lg text-slate-400 transition-colors"
                          title="Mark Completed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* --- OFFLINE WALK-IN TOKEN MODAL --- */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-800 shadow-2xl relative space-y-4">
            
            <button 
              onClick={() => setShowWalkinModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Offline Walk-in OP Token
            </h3>

            <form onSubmit={handleCreateWalkinToken} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Patient Name</label>
                <input
                  type="text"
                  value={walkinData.patientName}
                  onChange={(e) => setWalkinData(prev => ({ ...prev, patientName: e.target.value }))}
                  placeholder="Enter full name"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Age</label>
                  <input
                    type="number"
                    value={walkinData.patientAge}
                    onChange={(e) => setWalkinData(prev => ({ ...prev, patientAge: e.target.value }))}
                    placeholder="25"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Gender</label>
                  <select
                    value={walkinData.patientGender}
                    onChange={(e) => setWalkinData(prev => ({ ...prev, patientGender: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={walkinData.patientPhone}
                  onChange={(e) => setWalkinData(prev => ({ ...prev, patientPhone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 rounded-xl text-xs hover:from-emerald-400 hover:to-teal-500"
              >
                Print Walk-in OP Token
              </button>
            </form>

          </div>
        </div>
      )}

      {/* --- PRESCRIPTION MODAL --- */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-800 shadow-2xl relative space-y-4">
            
            <button 
              onClick={() => setShowPrescriptionModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-white text-lg">Create Prescription for {showPrescriptionModal.patientName}</h3>

            <form onSubmit={handleSavePrescription} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Diagnosis</label>
                <input
                  type="text"
                  value={presData.diagnosis}
                  onChange={(e) => setPresData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="e.g. Viral Fever & Dehydration"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>

              {/* Medicines List */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold block">Medicines</label>
                {presData.medicines.map((med, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Paracetamol 650mg)"
                      value={med.name}
                      onChange={(e) => {
                        const newMeds = [...presData.medicines];
                        newMeds[idx].name = e.target.value;
                        setPresData(prev => ({ ...prev, medicines: newMeds }));
                      }}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Dosage (1-0-1)"
                      value={med.dosage}
                      onChange={(e) => {
                        const newMeds = [...presData.medicines];
                        newMeds[idx].dosage = e.target.value;
                        setPresData(prev => ({ ...prev, medicines: newMeds }));
                      }}
                      className="w-24 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddMedicineRow}
                  className="text-xs text-cyan-400 hover:underline font-semibold"
                >
                  + Add Another Medicine
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Advice / Notes</label>
                <textarea
                  value={presData.notes}
                  onChange={(e) => setPresData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Drink plenty of water. Rest for 3 days."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white h-20"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl text-xs hover:from-cyan-400 hover:to-blue-500"
              >
                Save Prescription & Complete Patient
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
