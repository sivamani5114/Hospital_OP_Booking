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
    experience: 5,
    phone: '',
    opFee: 500,
    availableDays: 'Monday - Saturday',
    availableTime: '09:00 AM - 01:00 PM',
    maxPatients: 20,
    image: PRESET_AVATARS[0]
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
                      <p className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">
                        <Award className="w-3 h-3 inline mr-1" /> Reg No: {d.medicalRegistrationNo || 'TSMC/F/88912'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <span>Fee: ₹{d.opFee}</span>
                    <button
                      onClick={() => deleteDoctor(d._id)}
                      className="p-2 bg-slate-900 text-rose-400 rounded-xl"
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

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Official Medical Qualification Degree</label>
                <select
                  value={docForm.qualificationDegree}
                  onChange={(e) => setDocForm(prev => ({ ...prev, qualificationDegree: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white text-xs font-semibold"
                >
                  {OFFICIAL_QUALIFICATIONS.map((q, idx) => (
                    <option key={idx} value={q}>{q}</option>
                  ))}
                </select>
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
                  <img src={docForm.image} className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow" />
                  <div className="flex-1 space-y-1.5">
                    <label className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold px-3 py-1 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer w-fit">
                      <Upload className="w-3.5 h-3.5" /> Upload File from Device
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste Photo URL"
                      value={docForm.image}
                      onChange={(e) => setDocForm(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs"
                    />
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

              {/* 3. Legal & Uploaded Documents */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-300 text-xs">3. Legal Details & Uploaded Certificates</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <p><strong>Authorized Person:</strong> {selectedHospitalDetails.authorizedPersonName || 'Medical Director'}</p>
                  <p><strong>NABH Certified:</strong> {selectedHospitalDetails.nabhAccredited || 'No'}</p>
                  <p><strong>PAN:</strong> {selectedHospitalDetails.pan || 'N/A'}</p>
                  <p><strong>GST No:</strong> {selectedHospitalDetails.gstNo || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-400 block font-bold text-[10px] mb-1">REGISTRATION CERTIFICATE</span>
                    {selectedHospitalDetails.regCertificate ? (
                      <a
                        href={selectedHospitalDetails.regCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] inline-block shadow"
                      >
                        📄 View Certificate PDF
                      </a>
                    ) : (
                      <span className="text-emerald-400 font-bold text-[11px]">✓ Uploaded Verified PDF</span>
                    )}
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-400 block font-bold text-[10px] mb-1">AUTHORIZED ID PROOF</span>
                    {selectedHospitalDetails.authorizedPersonIdProof ? (
                      <a
                        href={selectedHospitalDetails.authorizedPersonIdProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] inline-block shadow"
                      >
                        🪪 View ID Proof Doc
                      </a>
                    ) : (
                      <span className="text-cyan-400 font-bold text-[11px]">✓ Uploaded Verified ID</span>
                    )}
                  </div>
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

    </div>
  );
}
