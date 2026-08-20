import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, Building2, Stethoscope, Users, Plus, 
  Edit3, Trash2, CheckCircle, AlertTriangle, DollarSign, Activity, X 
} from 'lucide-react';
import { ALL_INDIAN_CITIES } from '../utils/citiesData';

export default function AdminPortal() {
  const { 
    hospitals, addHospital, updateHospital, deleteHospital,
    doctors, addDoctor, updateDoctor, deleteDoctor,
    bookings, updateBookingStatus 
  } = useApp();

  const [activeTab, setActiveTab] = useState('HOSPITALS'); // HOSPITALS | DOCTORS | BOOKINGS
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // Form State for Hospital
  const [hospForm, setHospForm] = useState({
    name: '', city: 'Hyderabad', address: '', licenseNo: '', phone: ''
  });

  // Form State for Doctor
  const [docForm, setDocForm] = useState({
    hospitalId: hospitals[0]?.id || '',
    name: '', specialty: 'Cardiology', qualification: '', experience: 5, fee: 500
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.paymentStatus === 'PAID' ? b.amount : 0), 0);

  const handleCreateHospital = (e) => {
    e.preventDefault();
    addHospital({
      name: hospForm.name,
      city: hospForm.city,
      address: hospForm.address,
      licenseNo: hospForm.licenseNo,
      phone: hospForm.phone,
      image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80',
      specialties: ['General Medicine', 'Pediatrics']
    });
    setShowAddHospitalModal(false);
    setHospForm({ name: '', city: 'Hyderabad', address: '', licenseNo: '', phone: '' });
  };

  const handleCreateDoctor = (e) => {
    e.preventDefault();
    addDoctor({
      hospitalId: docForm.hospitalId || hospitals[0]?.id,
      name: docForm.name,
      specialty: docForm.specialty,
      qualification: docForm.qualification,
      experience: Number(docForm.experience),
      fee: Number(docForm.fee),
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
    });
    setShowAddDoctorModal(false);
    setDocForm({ hospitalId: hospitals[0]?.id || '', name: '', specialty: 'Cardiology', qualification: '', experience: 5, fee: 500 });
  };

  return (
    <div className="space-y-6">

      {/* Admin Header & System Metrics */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white font-outfit">Super Admin Control Center</h2>
              <p className="text-xs text-slate-400">Full CRUD control over Hospitals, Doctors, OP Bookings, and Revenue.</p>
            </div>
          </div>

          {/* Sub Nav Tabs */}
          <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('HOSPITALS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'HOSPITALS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hospitals ({hospitals.length})
            </button>
            <button
              onClick={() => setActiveTab('DOCTORS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'DOCTORS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Doctors ({doctors.length})
            </button>
            <button
              onClick={() => setActiveTab('BOOKINGS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'BOOKINGS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All OP Bookings ({bookings.length})
            </button>
          </div>
        </div>

        {/* Global Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Total Platform Revenue</span>
            <span className="text-2xl font-extrabold text-indigo-400 font-outfit">₹{totalRevenue.toLocaleString()}</span>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Active Hospitals</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-outfit">{hospitals.length}</span>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Total Doctors</span>
            <span className="text-2xl font-extrabold text-cyan-400 font-outfit">{doctors.length}</span>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Total OP Bookings</span>
            <span className="text-2xl font-extrabold text-amber-400 font-outfit">{bookings.length}</span>
          </div>
        </div>
      </div>

      {/* --- TAB 1: HOSPITALS MANAGEMENT --- */}
      {activeTab === 'HOSPITALS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" /> Hospital Directory Management
            </h3>
            <button
              onClick={() => setShowAddHospitalModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" /> Add New Hospital
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hospitals.map(h => (
              <div key={h.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-base">{h.name}</h4>
                    <p className="text-xs text-indigo-400 font-medium">{h.city}</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {h.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{h.address}</p>
                <p className="text-xs text-slate-500">License: {h.licenseNo} • {h.phone}</p>

                <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => deleteHospital(h.id)}
                    className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
                    title="Delete Hospital"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: DOCTORS MANAGEMENT --- */}
      {activeTab === 'DOCTORS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-400" /> Doctors Directory & Slots
            </h3>
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" /> Add New Doctor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map(d => {
              const hospital = hospitals.find(h => h.id === d.hospitalId);
              return (
                <div key={d.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex gap-3">
                    <img src={d.image} className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{d.name}</h4>
                      <p className="text-xs text-cyan-400">{d.specialty}</p>
                      <p className="text-[11px] text-slate-400">{hospital?.name}</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <p>Qualification: {d.qualification}</p>
                    <p>Fee: <strong className="text-emerald-400">₹{d.fee}</strong> | Experience: {d.experience}y</p>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => deleteDoctor(d.id)}
                      className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
                      title="Delete Doctor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 3: BOOKINGS EDIT & OVERRIDE --- */}
      {activeTab === 'BOOKINGS' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> Global OP Booking Records
          </h3>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Booking ID</th>
                    <th className="p-3.5">Patient</th>
                    <th className="p-3.5">Doctor & Hospital</th>
                    <th className="p-3.5">Token #</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-900/50">
                      <td className="p-3.5 font-mono text-cyan-400 font-bold">{b.id}</td>
                      <td className="p-3.5 font-medium">{b.patientName}</td>
                      <td className="p-3.5">{b.doctorName} ({b.hospitalName})</td>
                      <td className="p-3.5 font-bold text-amber-400">#{b.tokenNumber}</td>
                      <td className="p-3.5">{b.paymentStatus} (₹{b.amount})</td>
                      <td className="p-3.5 font-bold">{b.status}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => updateBookingStatus(b.id, 'CANCELLED')}
                          className="px-2.5 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-[11px] font-semibold"
                        >
                          Cancel Booking
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD HOSPITAL MODAL --- */}
      {showAddHospitalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-800 shadow-2xl relative space-y-4">
            
            <button onClick={() => setShowAddHospitalModal(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-white text-lg">Add New Hospital</h3>

            <form onSubmit={handleCreateHospital} className="space-y-3">
              <input
                type="text"
                placeholder="Hospital Name"
                value={hospForm.name}
                onChange={(e) => setHospForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                required
              />
              <select
                value={hospForm.city}
                onChange={(e) => setHospForm(prev => ({ ...prev, city: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              >
                {ALL_INDIAN_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Address"
                value={hospForm.address}
                onChange={(e) => setHospForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                required
              />
              <input
                type="text"
                placeholder="Medical License Number"
                value={hospForm.licenseNo}
                onChange={(e) => setHospForm(prev => ({ ...prev, licenseNo: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                required
              />
              <input
                type="text"
                placeholder="Contact Phone"
                value={hospForm.phone}
                onChange={(e) => setHospForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                required
              />

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs"
              >
                Create Hospital Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD DOCTOR MODAL --- */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-800 shadow-2xl relative space-y-4">
            
            <button onClick={() => setShowAddDoctorModal(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-white text-lg">Add New Doctor</h3>

            <form onSubmit={handleCreateDoctor} className="space-y-3">
              <select
                value={docForm.hospitalId}
                onChange={(e) => setDocForm(prev => ({ ...prev, hospitalId: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Doctor Name (e.g. Dr. K. Srinivas)"
                value={docForm.name}
                onChange={(e) => setDocForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                required
              />

              <select
                value={docForm.specialty}
                onChange={(e) => setDocForm(prev => ({ ...prev, specialty: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Neurology">Neurology</option>
              </select>

              <input
                type="text"
                placeholder="Qualification (e.g. MBBS, MD)"
                value={docForm.qualification}
                onChange={(e) => setDocForm(prev => ({ ...prev, qualification: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Experience (Years)"
                  value={docForm.experience}
                  onChange={(e) => setDocForm(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Fee (₹)"
                  value={docForm.fee}
                  onChange={(e) => setDocForm(prev => ({ ...prev, fee: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs"
              >
                Create Doctor Profile
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
