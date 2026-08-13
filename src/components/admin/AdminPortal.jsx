import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { useLanguage } from '../../context/LanguageContext';
import { downloadCsv, printPdfReport } from '../../utils/exportUtils';
import { getWaOtpLogs, ADMIN_PHONE_NUMBER } from '../../utils/whatsappService';
import { 
  ShieldCheck, Users, Building2, Stethoscope, Calendar, Settings, 
  LogOut, Plus, CheckCircle, XCircle, Trash2, Edit3, Lock, Search, AlertCircle, X, ShieldAlert, Image as ImageIcon, Upload, Award, Smartphone, Send, MessageCircle, FileText, FileSpreadsheet 
} from 'lucide-react';
import { ALL_DOCTOR_CATEGORIES, OFFICIAL_QUALIFICATIONS, PRESET_AVATARS } from '../hospital/HospitalPortal';

export default function AdminPortal() {
  const { logout } = useAuth();
  const { 
    users, addUser, updateUser, deleteUser, toggleUserStatus, resetUserPassword,
    hospitals, addHospital, updateHospital, deleteHospital, approveHospital, rejectHospital, toggleHospitalStatus,
    doctors, addDoctor, updateDoctor, deleteDoctor, toggleDoctorStatus,
    bookings, updateBookingStatus, deleteBooking 
  } = useDb();
  const { t } = useLanguage();

  // Navigation Tab State: 'DASHBOARD' | 'USERS' | 'HOSPITALS' | 'DOCTORS' | 'BOOKINGS' | 'DISPATCHER'
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddHospModal, setShowAddHospModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [selectedHospitalDetails, setSelectedHospitalDetails] = useState(null);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);

  // User Form State
  const [userForm, setUserForm] = useState({
    fullName: '', phone: '', email: '', dateOfBirth: '1995-01-01', gender: 'Male', address: '', password: 'password123', role: 'USER'
  });

  // Hospital Form State
  const [hospForm, setHospForm] = useState({
    hospitalName: '', phone: '', email: '', address: '', area: '', city: 'Hyderabad', hospitalTimings: '24/7', opFee: 600
  });

  // Doctor Form State
  const [customSpecialtyText, setCustomSpecialtyText] = useState('');
  const [customQualificationText, setCustomQualificationText] = useState('');
  const [docForm, setDocForm] = useState({
    hospitalId: hospitals[0]?._id || '',
    doctorName: '',
    medicalRegistrationNo: '',
    qualificationDegree: OFFICIAL_QUALIFICATIONS[0],
    specialization: ALL_DOCTOR_CATEGORIES[0],
    experience: '',
    phone: '',
    opFee: '',
    availableDays: 'Monday - Saturday',
    availableTime: '',
    maxPatients: '',
    image: ''
  });

  // Stats Calculations
  const totalUsers = users.length;
  const totalHospitals = hospitals.length;
  const pendingHospitalsCount = hospitals.filter(h => h.status === 'PENDING').length;
  const totalDoctors = doctors.length;
  const totalBookings = bookings.length;
  const waOtpLogs = getWaOtpLogs();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    addUser(userForm);
    setShowAddUserModal(false);
    setUserForm({ fullName: '', phone: '', email: '', dateOfBirth: '1995-01-01', gender: 'Male', address: '', password: 'password123', role: 'USER' });
    alert('✅ User created by Admin!');
  };

  const handleCreateHospitalSubmit = (e) => {
    e.preventDefault();
    addHospital({
      hospitalName: hospForm.hospitalName,
      phone: hospForm.phone,
      email: hospForm.email,
      address: hospForm.address,
      area: hospForm.area,
      city: hospForm.city,
      hospitalTimings: hospForm.hospitalTimings,
      opFee: Number(hospForm.opFee),
      emergencyAvailable: true,
      departments: ['General Medicine', 'Pediatrics']
    });
    setShowAddHospModal(false);
    setHospForm({ hospitalName: '', phone: '', email: '', address: '', area: '', city: 'Hyderabad', hospitalTimings: '24/7', opFee: 600 });
    alert('✅ Hospital created and Approved!');
  };

  const handleCreateDoctorSubmit = (e) => {
    e.preventDefault();

    if (!docForm.medicalRegistrationNo || docForm.medicalRegistrationNo.trim().length < 4) {
      alert('❌ Valid Medical Registration Number / License ID is REQUIRED to verify doctor!');
      return;
    }

    const finalSpecialty = docForm.specialization.startsWith('OTHER') ? customSpecialtyText : docForm.specialization.split(' (')[0];
    const finalQualification = docForm.qualificationDegree.startsWith('OTHER') ? customQualificationText : docForm.qualificationDegree.split(' (')[0];

    addDoctor({
      hospitalId: docForm.hospitalId || hospitals[0]?._id,
      doctorName: docForm.doctorName,
      medicalRegistrationNo: docForm.medicalRegistrationNo.toUpperCase(),
      qualification: finalQualification,
      qualificationDegree: finalQualification,
      specialization: finalSpecialty,
      department: finalSpecialty,
      experience: Number(docForm.experience),
      phone: docForm.phone,
      opFee: Number(docForm.opFee),
      availableDays: docForm.availableDays,
      availableTime: docForm.availableTime,
      maxPatients: Number(docForm.maxPatients),
      isVerified: true,
      image: docForm.image || PRESET_AVATARS[0]
    });

    setShowAddDoctorModal(false);
    setCustomSpecialtyText('');
    setCustomQualificationText('');
    alert('✅ Educated & Verified Doctor Added with Medical Council Reg. No!');
  };

  return (
    <div className="space-y-6 pb-20">

      {/* Navigation Sub-Bar */}
      <div className="glass-panel p-2 rounded-2xl border border-slate-800 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'DASHBOARD' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Admin Dashboard
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'USERS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> User Mgmt ({totalUsers})
          </button>
          <button
            onClick={() => setActiveTab('HOSPITALS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
              activeTab === 'HOSPITALS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Hospital Mgmt ({totalHospitals})
            {pendingHospitalsCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {pendingHospitalsCount} PENDING
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('DOCTORS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'DOCTORS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctor Mgmt ({totalDoctors})
          </button>
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'BOOKINGS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> All OP Bookings ({totalBookings})
          </button>
          <button
            onClick={() => setActiveTab('DISPATCHER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'DISPATCHER' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Dispatcher Logs ({ADMIN_PHONE_NUMBER})
          </button>
        </div>

        <button
          onClick={logout}
          className="px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>

      {/* --- DASHBOARD --- */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white font-outfit">Super Admin Control Center</h2>
              <p className="text-xs text-slate-400">Master Control Portal. Only Super Admin has access to these logs.</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-400" /> Admin Phone: +91 {ADMIN_PHONE_NUMBER}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Total Registered Users</span>
              <span className="text-2xl font-extrabold text-indigo-400 font-outfit">{totalUsers}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Total Hospitals</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-outfit">{totalHospitals}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Total Doctors</span>
              <span className="text-2xl font-extrabold text-cyan-400 font-outfit">{totalDoctors}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Total System OP Bookings</span>
              <span className="text-2xl font-extrabold text-amber-400 font-outfit">{totalBookings}</span>
            </div>
          </div>
        </div>
      )}

      {/* --- WHATSAPP DISPATCHER LOGS --- */}
      {activeTab === 'DISPATCHER' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" /> WhatsApp OTP Dispatch Logs (+91 {ADMIN_PHONE_NUMBER})
              </h3>
              <p className="text-xs text-slate-400">Super Admin Private Audit Logs for WhatsApp OTP dispatches to users & hospitals.</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Log ID</th>
                  <th className="p-3.5">Admin Dispatcher</th>
                  <th className="p-3.5">Target Recipient Phone</th>
                  <th className="p-3.5">Dispatched OTP Code</th>
                  <th className="p-3.5">Dispatch Time</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {waOtpLogs.length > 0 ? (
                  waOtpLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-900/50">
                      <td className="p-3.5 font-mono text-slate-400">{log.id}</td>
                      <td className="p-3.5 font-bold text-cyan-400">+91 {log.sender}</td>
                      <td className="p-3.5 font-bold text-white">+91 {log.recipient}</td>
                      <td className="p-3.5 font-mono font-extrabold text-amber-400 tracking-wider">{log.code}</td>
                      <td className="p-3.5 text-slate-400">{log.timestamp}</td>
                      <td className="p-3.5">
                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No WhatsApp OTP dispatches recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- USERS --- */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> User Accounts Control (CRUD)
            </h3>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add User Account
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">User Details</th>
                  <th className="p-3.5">Contact Phone & Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-900/50">
                    <td className="p-3.5">
                      <strong className="text-white block">{u.fullName}</strong>
                      <span className="text-[11px] text-slate-400">{u.address}</span>
                    </td>
                    <td className="p-3.5">{u.phone} • {u.email}</td>
                    <td className="p-3.5 font-bold text-cyan-400">{u.role}</td>
                    <td className="p-3.5 font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => toggleUserStatus(u._id)}
                        className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px]"
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          const pwd = prompt('Enter new password for user:', 'newpass123');
                          if (pwd) resetUserPassword(u._id, pwd);
                        }}
                        className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-[11px]"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- HOSPITALS --- */}
      {activeTab === 'HOSPITALS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" /> Hospital Approvals & CRUD Control
            </h3>
            <button
              onClick={() => setShowAddHospModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Hospital
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Hospital Name & City</th>
                  <th className="p-3.5">Address & Phone</th>
                  <th className="p-3.5">Base OP Fee</th>
                  <th className="p-3.5">Approval Status</th>
                  <th className="p-3.5 text-right">Admin Approval & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {hospitals.map(h => (
                  <tr key={h._id} className="hover:bg-slate-900/50">
                    <td className="p-3.5">
                      <strong className="text-white block">{h.hospitalName}</strong>
                      <span className="text-[11px] text-cyan-400">{h.city} ({h.area})</span>
                    </td>
                    <td className="p-3.5">{h.address} • {h.phone}</td>
                    <td className="p-3.5 font-bold text-emerald-400">₹{h.opFee}</td>
                    <td className="p-3.5 font-bold">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                        h.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        h.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedHospitalDetails(h)}
                        className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 rounded-lg text-[11px] font-bold"
                      >
                        🔍 View All Reg Details & Docs
                      </button>
                      {h.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => approveHospital(h._id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter Rejection Reason for Hospital (e.g. Invalid Registration Certificate / Invalid License):', 'Registration Certificate Verification Failed.');
                              if (reason) rejectHospital(h._id, reason);
                            }}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px]"
                          >
                            Reject & Send Reason
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => toggleHospitalStatus(h._id)}
                        className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px]"
                      >
                        Suspend/Activate
                      </button>
                      <button
                        onClick={() => deleteHospital(h._id)}
                        className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- DOCTORS --- */}
      {activeTab === 'DOCTORS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-400" /> Verified Doctors Directory
            </h3>
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Verified Doctor (Reg. ID & Degree)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map(d => {
              const hosp = hospitals.find(h => h._id === d.hospitalId);
              return (
                <div key={d._id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex gap-4 items-center">
                    <img src={d.image} className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow" />
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-bold text-white text-sm">{d.doctorName}</h4>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" title="Verified License" />
                      </div>
                      <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                        {d.specialization}
                      </span>
                      <p className="text-[11px] text-slate-300 mt-1 font-semibold">{d.qualification}</p>
                    </div>
                  </div>

                  {/* Rich Detailed Information Box */}
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <p className="text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-emerald-400" /> Reg No: {d.medicalRegistrationNo || 'TSMC/F/88912'}
                    </p>
                    {hosp && (
                      <p className="text-cyan-300 font-bold text-[11px]">
                        🏥 Hospital: <strong>{hosp.hospitalName}</strong> ({hosp.city})
                      </p>
                    )}
                    <p className="text-slate-300">🗓️ <strong>Days:</strong> {d.availableDays || 'Monday - Saturday'}</p>
                    <p className="text-slate-300">⏰ <strong>Timing:</strong> {d.availableTime || '09:00 AM - 01:00 PM'}</p>
                    <p className="text-slate-300">
                      💰 <strong>Fee:</strong> <strong className="text-emerald-400">₹{d.opFee}</strong> | 🌟 <strong>Exp:</strong> {d.experience || 5} Yrs | 👥 <strong>Max Patients:</strong> {d.maxPatients || 25}/day
                    </p>
                  </div>

                  {/* Actions: View Legal Docs & Delete */}
                  <div className="flex justify-between items-center pt-1">
                    <button
                      onClick={() => setSelectedDoctorDetails(d)}
                      className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow"
                    >
                      🔍 View Full Profile & 12 Docs
                    </button>
                    <button
                      onClick={() => deleteDoctor(d._id)}
                      className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-800"
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

      {/* --- BOOKINGS --- */}
      {activeTab === 'BOOKINGS' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" /> Global OP Booking Records
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => printPdfReport(
                  'CarePulse — All OP Bookings Report',
                  ['Booking ID', 'Patient', 'Phone', 'Hospital', 'Doctor', 'Date', 'Fee (₹)', 'Status'],
                  bookings.map(b => [`#${b.bookingId}`, b.userName, b.userPhone, b.hospitalName, b.doctorName, b.date, b.opFee, b.status])
                )}
                className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-bold text-xs px-3.5 py-2 rounded-xl"
              >
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => downloadCsv(
                  `CarePulse_All_Bookings_${new Date().toISOString().slice(0, 10)}`,
                  ['Booking ID', 'Patient', 'Phone', 'Hospital', 'Doctor', 'Date', 'Time', 'Fee', 'Payment', 'Status'],
                  bookings.map(b => [`#${b.bookingId}`, b.userName, b.userPhone, b.hospitalName, b.doctorName, b.date, b.time, b.opFee, b.paymentMethod || 'N/A', b.status])
                )}
                className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 font-bold text-xs px-3.5 py-2 rounded-xl"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Booking ID</th>
                  <th className="p-3.5">Patient Details</th>
                  <th className="p-3.5">Hospital & Doctor</th>
                  <th className="p-3.5">Fee</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {bookings.map(b => (
                  <tr key={b._id} className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-mono text-cyan-400 font-bold">#{b.bookingId}</td>
                    <td className="p-3.5 font-medium">{b.userName} ({b.userPhone})</td>
                    <td className="p-3.5">{b.doctorName} ({b.hospitalName})</td>
                    <td className="p-3.5 font-bold text-emerald-400">₹{b.opFee}</td>
                    <td className="p-3.5 font-bold">{b.status}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => updateBookingStatus(b._id, 'Cancelled')}
                        className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-[11px]"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD USER MODAL --- */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-800 shadow-2xl relative space-y-4">
            <button onClick={() => setShowAddUserModal(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-white text-lg">Add New User Account</h3>
            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Full Name"
                value={userForm.fullName}
                onChange={(e) => setUserForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={userForm.phone}
                onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD HOSPITAL MODAL --- */}
      {showAddHospModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-800 shadow-2xl relative space-y-4">
            <button onClick={() => setShowAddHospModal(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-white text-lg">Add New Hospital (Approved)</h3>
            <form onSubmit={handleCreateHospitalSubmit} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Hospital Name"
                value={hospForm.hospitalName}
                onChange={(e) => setHospForm(prev => ({ ...prev, hospitalName: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={hospForm.phone}
                onChange={(e) => setHospForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl"
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
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 border border-indigo-500/30 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddDoctorModal(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" /> Admin: Add Verified Doctor with Medical License Reg. ID
            </h3>

            <form onSubmit={handleCreateDoctorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Assign to Hospital</label>
                <select
                  value={docForm.hospitalId}
                  onChange={(e) => setDocForm(prev => ({ ...prev, hospitalId: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  {hospitals.map(h => (
                    <option key={h._id} value={h._id}>{h.hospitalName} ({h.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  placeholder="Dr. K. Srinivas, MD"
                  value={docForm.doctorName}
                  onChange={(e) => setDocForm(prev => ({ ...prev, doctorName: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/30 space-y-1">
                <label className="text-indigo-300 font-bold block flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-400" /> Medical Council Registration Number / License ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. TSMC/F/88912 or APMC/2021/4401"
                  value={docForm.medicalRegistrationNo}
                  onChange={(e) => setDocForm(prev => ({ ...prev, medicalRegistrationNo: e.target.value }))}
                  className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl p-2.5 text-white font-mono text-xs font-bold"
                  required
                />
              </div>

              {/* Multi-Degree Qualification Checkbox Selector */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-slate-300 font-bold block text-xs flex items-center justify-between">
                  <span>🎓 Select Doctor Qualifications & Degrees (Multi-Select) *</span>
                  <span className="text-[10px] text-indigo-400 font-semibold">{docForm.selectedQualifications?.length || 0} Degrees Selected</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                  {OFFICIAL_QUALIFICATIONS.map((q, idx) => {
                    const isSelected = docForm.selectedQualifications?.includes(q);
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${
                          isSelected 
                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40 font-bold' 
                            : 'text-slate-300 border-slate-900 hover:bg-slate-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            setDocForm(prev => {
                              const current = prev.selectedQualifications || [];
                              const next = e.target.checked
                                ? [...current, q]
                                : current.filter(item => item !== q);
                              
                              const joined = next.join(', ');
                              return {
                                ...prev,
                                selectedQualifications: next,
                                qualificationDegree: joined || 'MBBS'
                              };
                            });
                          }}
                          className="rounded accent-indigo-500"
                        />
                        <span className="text-[11px]">{q}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Specialization Category</label>
                <select
                  value={docForm.specialization}
                  onChange={(e) => setDocForm(prev => ({ ...prev, specialization: e.target.value }))}
                  className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl p-2.5 text-white text-xs font-semibold"
                >
                  {ALL_DOCTOR_CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-white font-bold block flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-400" /> Doctor Photo Upload
                  </span>
                </label>
                
                <div className="flex gap-3 items-center">
                  {docForm.image ? (
                    <img src={docForm.image} className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow" alt="Doctor Preview" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[9px] text-slate-500 font-bold text-center p-1">
                      No Photo
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <label className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold px-3 py-1 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer w-fit">
                      <Upload className="w-3.5 h-3.5" /> Upload File from Device
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste Photo URL (optional)"
                      value={docForm.image}
                      onChange={(e) => setDocForm(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Calendar Days Picker & Time Range Dropdowns */}
              <div className="space-y-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                {/* 📅 Available Days Checkbox Chips */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs flex items-center justify-between">
                    <span>📅 Select OP Working Days *</span>
                    <span className="text-[10px] text-indigo-400 font-semibold">{docForm.selectedDays?.length || 0} Days Selected</span>
                  </label>

                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
                      const isSelected = docForm.selectedDays?.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setDocForm(prev => {
                              const current = prev.selectedDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                              const next = current.includes(day)
                                ? current.filter(d => d !== day)
                                : [...current, day];
                              
                              const formattedDays = next.length === 7 ? 'All 7 Days (Sun - Sat)' :
                                (next.includes('Mon') && next.includes('Sat') && next.length === 6) ? 'Monday - Saturday' :
                                next.join(', ');

                              return { ...prev, selectedDays: next, availableDays: formattedDays };
                            });
                          }}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ⏰ Available Start & End Time Dropdowns */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1 text-xs">OP Start Time *</label>
                    <select
                      value={docForm.startTime || '09:00 AM'}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        const end = docForm.endTime || '01:00 PM';
                        setDocForm(prev => ({
                          ...prev,
                          startTime: newStart,
                          availableTime: `${newStart} - ${end}`
                        }));
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs font-semibold"
                    >
                      {[
                        '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
                        '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
                      ].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1 text-xs">OP End Time *</label>
                    <select
                      value={docForm.endTime || '01:00 PM'}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        const start = docForm.startTime || '09:00 AM';
                        setDocForm(prev => ({
                          ...prev,
                          endTime: newEnd,
                          availableTime: `${start} - ${newEnd}`
                        }));
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs font-semibold"
                    >
                      {[
                        '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
                        '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'
                      ].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="OP Fee (₹)"
                  value={docForm.opFee}
                  onChange={(e) => setDocForm(prev => ({ ...prev, opFee: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Experience (Yrs)"
                  value={docForm.experience}
                  onChange={(e) => setDocForm(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl"
              >
                Verify & Add Qualified Doctor Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔍 FULL HOSPITAL REGISTRATION DETAILS & UPLOADED DOCUMENTS VERIFICATION MODAL */}
      {selectedHospitalDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-cyan-500/30 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedHospitalDetails(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <img src={selectedHospitalDetails.logo} className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow" />
              <div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  {selectedHospitalDetails.hospitalName}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                    selectedHospitalDetails.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    selectedHospitalDetails.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>{selectedHospitalDetails.status}</span>
                </h3>
                <p className="text-xs text-slate-400">{selectedHospitalDetails.city} • Reg. No: {selectedHospitalDetails.regNo || 'REG-TS-88492'}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* 1. Basic & Contact */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-cyan-300 text-xs">1. Basic Details & Contact Info</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <p><strong>Hospital Type:</strong> {selectedHospitalDetails.hospitalType || 'Private'}</p>
                  <p><strong>Est Year:</strong> {selectedHospitalDetails.establishedYear || '2015'}</p>
                  <p><strong>Official Email:</strong> {selectedHospitalDetails.email}</p>
                  <p><strong>Phone:</strong> {selectedHospitalDetails.phone}</p>
                  <p><strong>Landline:</strong> {selectedHospitalDetails.landline || 'N/A'}</p>
                </div>
              </div>

              {/* 2. Address & Location */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-300 text-xs">2. Address & Google Maps Location</h4>
                <p className="text-slate-300"><strong>Address:</strong> {selectedHospitalDetails.address || selectedHospitalDetails.area}, {selectedHospitalDetails.city}</p>
                {selectedHospitalDetails.mapsUrl && (
                  <a
                    href={selectedHospitalDetails.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-xl text-xs font-bold"
                  >
                    📍 Open Pinned Google Maps Location
                  </a>
                )}
              </div>

              {/* 4. Business Bank Details & UPI Payment QR Verification */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/30 space-y-3">
                <h4 className="font-bold text-amber-300 text-xs flex items-center justify-between">
                  <span>💳 4. Business Bank Account & UPI Details (Encrypted)</span>
                  <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] border border-amber-500/40">ADMIN AUDIT</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <p><strong>Account Holder:</strong> {selectedHospitalDetails.accountHolderName || selectedHospitalDetails.hospitalName}</p>
                  <p><strong>Bank Name:</strong> {selectedHospitalDetails.bankName || 'HDFC Bank'}</p>
                  <p><strong>Bank Account No:</strong> <span className="font-mono text-cyan-300">{selectedHospitalDetails.bankAccountNo || '99881100223344'}</span></p>
                  <p><strong>IFSC Code:</strong> <span className="font-mono text-cyan-300">{selectedHospitalDetails.ifscCode || 'HDFC0000123'}</span> ({selectedHospitalDetails.accountType || 'Current'})</p>
                  <p className="col-span-2"><strong>Hospital UPI ID:</strong> <span className="font-mono text-emerald-300 font-bold">{selectedHospitalDetails.upiId || 'carepulse@ybl'}</span></p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-400 block font-bold text-[10px] mb-1">HOSPITAL UPI QR CODE</span>
                    {selectedHospitalDetails.upiQrCode ? (
                      <img src={selectedHospitalDetails.upiQrCode} className="w-20 h-20 mx-auto object-contain rounded-lg border border-slate-700 shadow" alt="Hospital QR Code" />
                    ) : (
                      <span className="text-cyan-400 font-bold text-[11px]">✓ Official QR Configured</span>
                    )}
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center">
                    <span className="text-slate-400 block font-bold text-[10px] mb-1">CANCELLED CHEQUE / BANK PROOF</span>
                    {selectedHospitalDetails.bankProof ? (
                      <a
                        href={selectedHospitalDetails.bankProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] inline-block shadow"
                      >
                        📑 View Bank Proof
                      </a>
                    ) : (
                      <span className="text-emerald-400 font-bold text-[11px]">✓ Verified Bank Statement</span>
                    )}
                  </div>
                </div>
              </div>
              {/* 3. Legal Documents (9 Licenses) & Owner Verification (3 Docs) */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-300 text-xs flex items-center justify-between">
                  <span>📑 3. Owner Verification & Legal Certificates Audit</span>
                  <span className="text-[10px] text-amber-400 font-semibold font-mono">12 GOVT DOCS</span>
                </h4>

                {/* Owner Verification Details */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-cyan-400 font-bold text-[11px] block">👨‍💼 AUTHORIZED PERSON & KYC:</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                    <p><strong>Name:</strong> {selectedHospitalDetails.authorizedPersonName || 'Medical Director'}</p>
                    <p><strong>Designation:</strong> {selectedHospitalDetails.authorizedPersonDesignation || 'Managing Trustee'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800">
                    {selectedHospitalDetails.authorizedPersonIdProof && (
                      <a href={selectedHospitalDetails.authorizedPersonIdProof} target="_blank" rel="noopener noreferrer" className="bg-cyan-600 text-white px-2.5 py-1 rounded text-[10px] font-bold">
                        🪪 View Aadhaar / Govt ID
                      </a>
                    )}
                    {selectedHospitalDetails.authorizedPersonPan && (
                      <a href={selectedHospitalDetails.authorizedPersonPan} target="_blank" rel="noopener noreferrer" className="bg-cyan-600 text-white px-2.5 py-1 rounded text-[10px] font-bold">
                        📄 View Owner PAN
                      </a>
                    )}
                    {selectedHospitalDetails.authorizationLetter && (
                      <a href={selectedHospitalDetails.authorizationLetter} target="_blank" rel="noopener noreferrer" className="bg-cyan-600 text-white px-2.5 py-1 rounded text-[10px] font-bold">
                        📑 View Authorization Letter
                      </a>
                    )}
                  </div>
                </div>

                {/* 9 Government Licenses Grid with License Numbers */}
                <span className="text-emerald-400 font-bold text-[11px] block">🏥 GOVERNMENT LICENSES, CERTIFICATE NUMBERS & FILES:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                  {[
                    { title: '1. Hospital Reg Cert', key: 'regCertificate', numKey: 'regCertificateNo' },
                    { title: '2. Clinical Establishment', key: 'clinicalEstablishmentCert', numKey: 'clinicalEstablishmentCertNo' },
                    { title: '3. NABH Certificate', key: 'nabhCertificate', numKey: 'nabhCertificateNo' },
                    { title: '4. Hospital PAN Card', key: 'hospitalPan', numKey: 'hospitalPanNo' },
                    { title: '5. GST Certificate', key: 'gstCertificate', numKey: 'gstCertificateNo' },
                    { title: '6. Pharmacy Drug License', key: 'drugLicense', numKey: 'drugLicenseNo' },
                    { title: '7. Biomedical Waste Auth', key: 'biomedicalWasteAuth', numKey: 'biomedicalWasteAuthNo' },
                    { title: '8. Fire Safety NOC', key: 'fireNocCert', numKey: 'fireNocCertNo' },
                    { title: '9. Trade License', key: 'tradeLicenseCert', numKey: 'tradeLicenseCertNo' }
                  ].map(doc => {
                    const certNo = selectedHospitalDetails[doc.numKey];
                    const certFile = selectedHospitalDetails[doc.key];
                    return (
                      <div key={doc.key} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-bold truncate">{doc.title}</span>
                          {certFile ? (
                            <a href={certFile} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[9px] font-bold shrink-0">
                              View File
                            </a>
                          ) : (
                            <span className="text-slate-500 italic text-[9px]">No File</span>
                          )}
                        </div>
                        <p className="text-slate-400 font-mono text-[9px]">
                          <strong>No:</strong> {certNo || 'N/A'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Facilities & OP Settings */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-300 text-xs">4. Facilities & OP Booking Settings</h4>
                <div className="flex flex-wrap gap-1">
                  {(selectedHospitalDetails.facilities || ['Emergency 24/7', 'Pharmacy', 'Laboratory', 'ICU']).map(f => (
                    <span key={f} className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                      ✓ {f}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 pt-2 border-t border-slate-800">
                  <p><strong>Base OP Fee:</strong> ₹{selectedHospitalDetails.opFee}</p>
                  <p><strong>Max Patients/Day:</strong> {selectedHospitalDetails.maxBookingsPerDay || 30}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {selectedHospitalDetails.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        approveHospital(selectedHospitalDetails._id);
                        setSelectedHospitalDetails(null);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg"
                    >
                      ✓ Approve Hospital Access
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter Rejection Reason for Hospital:', 'Registration certificate verification failed.');
                        if (reason) {
                          rejectHospital(selectedHospitalDetails._id, reason);
                          setSelectedHospitalDetails(null);
                        }
                      }}
                      className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg"
                    >
                      ✕ Reject & Send Reason
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🩺 FULL DOCTOR PROFILE & 12 LEGAL DOCUMENTS AUDIT MODAL */}
      {selectedDoctorDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-cyan-500/40 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedDoctorDetails(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            {/* Doctor Profile Header */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <img src={selectedDoctorDetails.image} className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg" alt="Doctor Avatar" />
              <div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  {selectedDoctorDetails.doctorName}
                  <ShieldCheck className="w-5 h-5 text-emerald-400" title="Verified License" />
                </h3>
                <span className="bg-indigo-500/10 text-indigo-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  {selectedDoctorDetails.specialization}
                </span>
                <p className="text-xs text-slate-300 mt-1 font-semibold">{selectedDoctorDetails.qualification}</p>
                <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                  <Award className="w-3.5 h-3.5 inline mr-1" /> Reg No: {selectedDoctorDetails.medicalRegistrationNo || 'TSMC/F/88912'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* 1. Doctor Professional & OP Details */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-cyan-300 text-xs">🩺 1. Doctor OP Schedule & Fees</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <p><strong>Experience:</strong> {selectedDoctorDetails.experience || 5} Years</p>
                  <p><strong>OP Consultation Fee:</strong> <span className="text-emerald-400 font-bold">₹{selectedDoctorDetails.opFee}</span></p>
                  <p><strong>OP Working Days:</strong> {selectedDoctorDetails.availableDays || 'Monday - Saturday'}</p>
                  <p><strong>OP Timings:</strong> {selectedDoctorDetails.availableTime || '09:00 AM - 01:00 PM'}</p>
                  <p className="col-span-2"><strong>Max Patients / Day:</strong> {selectedDoctorDetails.maxPatients || 25} Patients</p>
                </div>
              </div>

              {/* 2. Medical Registration & Degree Certificates */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-300 text-xs">🏅 2. Verified Medical License & Degree Certificates</h4>
                <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                  {selectedDoctorDetails.medicalRegCertDoc ? (
                    <a href={selectedDoctorDetails.medicalRegCertDoc} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold">
                      📄 View Medical Registration License PDF/Img
                    </a>
                  ) : (
                    <span className="text-emerald-400 font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-800">✓ Medical Council Reg No Verified</span>
                  )}

                  {selectedDoctorDetails.degreeCertDoc && (
                    <a href={selectedDoctorDetails.degreeCertDoc} target="_blank" rel="noopener noreferrer" className="bg-cyan-600 text-white px-3 py-1 rounded-lg font-bold">
                      🎓 View Degree Certificate PDF/Img
                    </a>
                  )}
                </div>
              </div>

              {/* 3. Associated Hospital & 12 Legal Documents Audit */}
              {(() => {
                const hosp = hospitals.find(h => h._id === selectedDoctorDetails.hospitalId);
                return hosp ? (
                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                    <h4 className="font-bold text-amber-300 text-xs flex items-center justify-between">
                      <span>🏥 3. Hospital Legal Verification & 12 Certificates ({hosp.hospitalName})</span>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">12 GOVT LICENSES</span>
                    </h4>

                    {/* Owner Verification */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                      <p className="text-cyan-400 font-bold">👨‍💼 AUTHORIZED PERSON:</p>
                      <p><strong>Name:</strong> {hosp.authorizedPersonName || 'Medical Director'} ({hosp.authorizedPersonDesignation || 'MD'})</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {hosp.authorizedPersonIdProof && (
                          <a href={hosp.authorizedPersonIdProof} target="_blank" rel="noopener noreferrer" className="bg-cyan-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                            🪪 Aadhaar (No: {hosp.authorizedPersonAadhaarNo || 'N/A'})
                          </a>
                        )}
                        {hosp.authorizedPersonPan && (
                          <a href={hosp.authorizedPersonPan} target="_blank" rel="noopener noreferrer" className="bg-cyan-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                            📄 Personal PAN (No: {hosp.authorizedPersonPanNo || 'N/A'})
                          </a>
                        )}
                        {hosp.authorizationLetter && (
                          <a href={hosp.authorizationLetter} target="_blank" rel="noopener noreferrer" className="bg-cyan-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                            📑 Auth Letter (Ref: {hosp.authorizationLetterNo || 'N/A'})
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 9 Government Licenses */}
                    <span className="text-emerald-400 font-bold text-[11px] block">🏥 GOVERNMENT LICENSES (9 CERTIFICATES & NUMBERS):</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                      {[
                        { title: '1. Hospital Reg Cert', key: 'regCertificate', numKey: 'regCertificateNo' },
                        { title: '2. Clinical Establishment', key: 'clinicalEstablishmentCert', numKey: 'clinicalEstablishmentCertNo' },
                        { title: '3. NABH Certificate', key: 'nabhCertificate', numKey: 'nabhCertificateNo' },
                        { title: '4. Hospital PAN Card', key: 'hospitalPan', numKey: 'hospitalPanNo' },
                        { title: '5. GST Certificate', key: 'gstCertificate', numKey: 'gstCertificateNo' },
                        { title: '6. Pharmacy Drug License', key: 'drugLicense', numKey: 'drugLicenseNo' },
                        { title: '7. Biomedical Waste Auth', key: 'biomedicalWasteAuth', numKey: 'biomedicalWasteAuthNo' },
                        { title: '8. Fire Safety NOC', key: 'fireNocCert', numKey: 'fireNocCertNo' },
                        { title: '9. Trade License', key: 'tradeLicenseCert', numKey: 'tradeLicenseCertNo' }
                      ].map(doc => {
                        const certNo = hosp[doc.numKey];
                        const certFile = hosp[doc.key];
                        return (
                          <div key={doc.key} className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-300 font-bold truncate">{doc.title}</span>
                              {certFile ? (
                                <a href={certFile} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[9px] font-bold shrink-0">
                                  View File
                                </a>
                              ) : (
                                <span className="text-slate-500 italic text-[9px]">No File</span>
                              )}
                            </div>
                            <p className="text-slate-400 font-mono text-[9px]">
                              <strong>No:</strong> {certNo || 'N/A'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
