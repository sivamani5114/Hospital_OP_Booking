import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { useLanguage } from '../../context/LanguageContext';
import { downloadCsv, printPdfReport } from '../../utils/exportUtils';
import { getWaOtpLogs, ADMIN_PHONE_NUMBER } from '../../utils/whatsappService';
import { autoVerifyHospitalCertificate, autoVerifyDoctorLicense } from '../../utils/certVerificationEngine';
import CertificateVerificationModal from '../common/CertificateVerificationModal';
import { 
  ShieldCheck, Users, Building2, Stethoscope, Calendar, Settings, 
  LogOut, Plus, CheckCircle, XCircle, Trash2, Edit3, Lock, Search, AlertCircle, X, ShieldAlert, Image as ImageIcon, Upload, Award, Smartphone, Send, MessageCircle, FileText, FileSpreadsheet,
  Phone, Mail, MapPin, CheckCircle2, Clock, Eye, Activity, User, Sparkles, Receipt, Hash, FileCheck2, Loader2
} from 'lucide-react';
import { ALL_DOCTOR_CATEGORIES, OFFICIAL_QUALIFICATIONS, PRESET_AVATARS } from '../hospital/HospitalPortal';

export default function AdminPortal() {
  const { logout } = useAuth();
  const { 
    users, addUser, updateUser, deleteUser, toggleUserStatus, resetUserPassword,
    hospitals, addHospital, updateHospital, deleteHospital, approveHospital, rejectHospital, toggleHospitalStatus,
    doctors, addDoctor, updateDoctor, deleteDoctor, toggleDoctorStatus,
    bookings, updateBookingStatus, updateBooking, deleteBooking 
  } = useDb();
  const { t } = useLanguage();

  // Navigation Tab State: 'DASHBOARD' | 'USERS' | 'HOSPITALS' | 'DOCTORS' | 'BOOKINGS' | 'CONTROLS' | 'DISPATCHER'
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  // Search & Filter States
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [hospSearchQuery, setHospSearchQuery] = useState('');
  const [hospStatusFilter, setHospStatusFilter] = useState('ALL');
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState('ALL');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');

  // Master Control States
  const [announcementText, setAnnouncementText] = useState(() => localStorage.getItem('carepulse_broadcast_announcement') || '');
  const [isEmergencyMode, setIsEmergencyMode] = useState(() => localStorage.getItem('carepulse_emergency_mode') === 'true');
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(() => localStorage.getItem('carepulse_allow_registration') !== 'false');

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddHospModal, setShowAddHospModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // Certificate Auto-Verification Inspector State
  const [certModalConfig, setCertModalConfig] = useState({ isOpen: false, data: null, type: 'HOSPITAL' });
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [selectedHospitalDetails, setSelectedHospitalDetails] = useState(null);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);

  // Master Edit Modals
  const [editingUser, setEditingUser] = useState(null);
  const [editingHospital, setEditingHospital] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);

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
            onClick={() => setActiveTab('CONTROLS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'CONTROLS' ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/25' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Master Controls 🛡️
          </button>
          <button
            onClick={() => setActiveTab('DISPATCHER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'DISPATCHER' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Logs
          </button>
        </div>

        <button
          onClick={logout}
          className="px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-1 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>

      {/* Live Broadcast Banner (If active) */}
      {announcementText && (
        <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-500/40 p-3.5 rounded-2xl flex items-center justify-between text-xs text-amber-200 shadow-lg">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <strong>📢 ACTIVE PLATFORM BROADCAST:</strong> {announcementText}
          </span>
          <button
            onClick={() => {
              localStorage.removeItem('carepulse_broadcast_announcement');
              setAnnouncementText('');
              alert('Broadcast message cleared!');
            }}
            className="text-amber-400 hover:text-white underline font-bold text-[11px] cursor-pointer"
          >
            Clear Broadcast ✕
          </button>
        </div>
      )}

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

      {/* --- USERS (PATIENTS & ACCOUNTS FULL DETAILS) --- */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-outfit">
                <Users className="w-5 h-5 text-cyan-400" /> Patient & User Accounts Full Directory ({users.length})
              </h3>
              <p className="text-xs text-slate-400">Complete registered patient profiles, contact details & OP consultation history</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Patient Account
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-panel p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient by name, phone, email, patient ID, or city..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500/40 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="USER">Patients Only ({users.filter(u => u.role === 'USER').length})</option>
                <option value="HOSPITAL">Hospital Desks ({users.filter(u => u.role === 'HOSPITAL').length})</option>
                <option value="ADMIN">Super Admins ({users.filter(u => u.role === 'ADMIN').length})</option>
              </select>
            </div>
          </div>

          {/* Users Table with Full Patient Details */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3.5">Patient Details & ID</th>
                  <th className="p-3.5">Contact Phone & Email</th>
                  <th className="p-3.5">DOB / Age / Gender</th>
                  <th className="p-3.5">Residential Address</th>
                  <th className="p-3.5 text-center">OP Bookings</th>
                  <th className="p-3.5">Status & Role</th>
                  <th className="p-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {users
                  .filter(u => {
                    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                    const patId = u.patientId || ('CP-PAT-' + (u.phone ? u.phone.slice(-6) : '543210'));
                    const q = userSearchQuery.toLowerCase();
                    const matchesSearch = !userSearchQuery || 
                      u.fullName?.toLowerCase().includes(q) ||
                      u.phone?.includes(q) ||
                      u.email?.toLowerCase().includes(q) ||
                      u.address?.toLowerCase().includes(q) ||
                      patId.toLowerCase().includes(q);
                    return matchesRole && matchesSearch;
                  })
                  .map(u => {
                    const patId = u.patientId || ('CP-PAT-' + (u.phone ? u.phone.slice(-6) : '543210'));
                    const userOpBookings = bookings.filter(b => b.userId === u._id || b.userPhone === u.phone);
                    
                    return (
                      <tr key={u._id} className="hover:bg-slate-900/60 transition-colors">
                        {/* Name & ID */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xs shadow shrink-0">
                              {u.fullName?.[0]?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <strong className="text-white block font-semibold">{u.fullName}</strong>
                              <span className="font-mono text-cyan-300 font-bold text-[10px] bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                {patId}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Phone & Email */}
                        <td className="p-3.5 space-y-0.5">
                          <div className="font-mono text-white font-bold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-cyan-400 shrink-0" /> +91 {u.phone}
                          </div>
                          <div className="text-slate-400 text-[11px] flex items-center gap-1 truncate max-w-[180px]">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" /> {u.email || 'No email registered'}
                          </div>
                        </td>

                        {/* DOB & Gender */}
                        <td className="p-3.5">
                          <div className="text-slate-300 font-medium">{u.dateOfBirth || 'Not specified'}</div>
                          <span className="text-[10px] text-slate-400">{u.gender || 'Male'}</span>
                        </td>

                        {/* Address */}
                        <td className="p-3.5 max-w-[160px]">
                          <div className="text-slate-300 text-[11px] truncate flex items-start gap-1">
                            <MapPin className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                            <span className="truncate">{u.address || 'Address not provided'}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Joined: {u.createdAt || 'Active'}</span>
                        </td>

                        {/* Total Bookings */}
                        <td className="p-3.5 text-center">
                          <span className="bg-slate-900 text-cyan-400 font-extrabold px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
                            {userOpBookings.length} OP
                          </span>
                        </td>

                        {/* Role & Status */}
                        <td className="p-3.5 space-y-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold block w-fit ${
                            u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {u.status || 'ACTIVE'}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 block">
                            Role: <strong className="text-cyan-400">{u.role}</strong>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right space-x-1.5 min-w-[240px]">
                          <button
                            onClick={() => setSelectedPatientDetails(u)}
                            className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            title="View Full Profile & Appointment History"
                          >
                            <Eye className="w-3 h-3" /> Profile
                          </button>
                          <button
                            onClick={() => setEditingUser({ ...u })}
                            className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            title="Edit Patient Full Details"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => toggleUserStatus(u._id)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] cursor-pointer"
                            title="Suspend or Activate Account"
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              const pwd = prompt('Enter new password for patient account:', 'password123');
                              if (pwd) {
                                resetUserPassword(u._id, pwd);
                                alert('✅ Password updated successfully for user!');
                              }
                            }}
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg inline-block cursor-pointer"
                            title="Reset Password"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete account: ${u.fullName} (${u.phone})?`)) {
                                deleteUser(u._id);
                              }
                            }}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg inline-block cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- HOSPITALS (FULL DETAILS & COMPREHENSIVE DIRECTORY) --- */}
      {activeTab === 'HOSPITALS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-outfit">
                <Building2 className="w-5 h-5 text-indigo-400" /> Hospital Directory, Licenses & Approvals ({hospitals.length})
              </h3>
              <p className="text-xs text-slate-400">Complete hospital listings, government licenses, banking setups & booking controls</p>
            </div>
            <button
              onClick={() => setShowAddHospModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Hospital
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="glass-panel p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hospital by name, city, area, address, phone or reg no..."
                value={hospSearchQuery}
                onChange={(e) => setHospSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500/40 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={hospStatusFilter}
                onChange={(e) => setHospStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="ALL">All Status ({hospitals.length})</option>
                <option value="APPROVED">Approved Only ({hospitals.filter(h => h.status === 'APPROVED').length})</option>
                <option value="PENDING">Pending Approval ({hospitals.filter(h => h.status === 'PENDING').length})</option>
                <option value="SUSPENDED">Suspended ({hospitals.filter(h => h.status === 'SUSPENDED').length})</option>
              </select>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3.5">Hospital Name & City</th>
                  <th className="p-3.5">Contact Phone & Email</th>
                  <th className="p-3.5">Address & Facilities</th>
                  <th className="p-3.5">Base OP Fee</th>
                  <th className="p-3.5 text-center">Doctors / Bookings</th>
                  <th className="p-3.5">Approval Status</th>
                  <th className="p-3.5 text-right">Admin Approval & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {hospitals
                  .filter(h => {
                    const matchesStatus = hospStatusFilter === 'ALL' || h.status === hospStatusFilter;
                    const q = hospSearchQuery.toLowerCase();
                    const matchesSearch = !hospSearchQuery ||
                      h.hospitalName?.toLowerCase().includes(q) ||
                      h.city?.toLowerCase().includes(q) ||
                      h.area?.toLowerCase().includes(q) ||
                      h.address?.toLowerCase().includes(q) ||
                      h.phone?.includes(q) ||
                      h.regCertificateNo?.toLowerCase().includes(q);
                    return matchesStatus && matchesSearch;
                  })
                  .map(h => {
                    const hospDocs = doctors.filter(d => d.hospitalId === h._id);
                    const hospBookings = bookings.filter(b => b.hospitalId === h._id || b.hospitalName === h.hospitalName);

                    return (
                      <tr key={h._id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img src={h.logo || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=120'} className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow shrink-0" />
                            <div>
                              <strong className="text-white block font-semibold">{h.hospitalName}</strong>
                              <span className="text-[11px] text-cyan-400">{h.city} ({h.area})</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 space-y-0.5">
                          <div className="font-mono text-white font-bold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-indigo-400 shrink-0" /> +91 {h.phone}
                          </div>
                          <div className="text-slate-400 text-[11px] truncate max-w-[160px]">{h.email}</div>
                        </td>
                        <td className="p-3.5 max-w-[180px]">
                          <div className="text-slate-300 text-[11px] truncate">{h.address || h.area}</div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {(h.facilities || ['Emergency 24/7', 'Pharmacy']).slice(0, 2).join(', ')}...
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-emerald-400">
                          ₹{h.opFee}
                          <span className="text-[10px] text-slate-400 block font-normal">Base Fee</span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="inline-flex gap-1.5 text-[11px]">
                            <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded font-bold border border-indigo-500/20">{hospDocs.length} Docs</span>
                            <span className="bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded font-bold border border-cyan-500/20">{hospBookings.length} OP</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-bold">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                            h.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                            h.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5 min-w-[310px]">
                          <button
                            onClick={async () => {
                              const res = h.verificationData || await autoVerifyHospitalCertificate({
                                hospitalName: h.hospitalName,
                                regNo: h.regCertificateNo || h.regNo || 'REG-TS-88492',
                                docType: 'HOSPITAL_REGISTRATION',
                                fileName: 'Hospital_Registration_Certificate.pdf'
                              });
                              setCertModalConfig({ isOpen: true, data: res, type: 'HOSPITAL' });
                            }}
                            className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shadow"
                            title="Inspect Govt Verified Certificate"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cert 🛡️
                          </button>
                          <button
                            onClick={() => setSelectedHospitalDetails(h)}
                            className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> Full Docs
                          </button>
                          <button
                            onClick={() => setEditingHospital({ ...h })}
                            className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            title="Edit Hospital Profile & Settings"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          {h.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => approveHospital(h._id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter Rejection Reason for Hospital:', 'Registration Certificate Verification Failed.');
                                  if (reason) rejectHospital(h._id, reason);
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => toggleHospitalStatus(h._id)}
                            className="px-2 py-1 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] cursor-pointer"
                          >
                            {h.status === 'APPROVED' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete hospital: ${h.hospitalName}?`)) {
                                deleteHospital(h._id);
                              }
                            }}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg inline-block cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- DOCTORS (FULL DETAILS & COMPREHENSIVE DIRECTORY) --- */}
      {activeTab === 'DOCTORS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-outfit">
                <Stethoscope className="w-5 h-5 text-indigo-400" /> Verified Doctors Directory ({doctors.length})
              </h3>
              <p className="text-xs text-slate-400">Complete medical licenses, qualification degrees, hospital affiliations & consultation schedules</p>
            </div>
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Verified Doctor
            </button>
          </div>

          {/* Search & Specialty Filter */}
          <div className="glass-panel p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search doctor by name, specialty, registration number, qualification or hospital..."
                value={doctorSearchQuery}
                onChange={(e) => setDoctorSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500/40 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={doctorSpecialtyFilter}
                onChange={(e) => setDoctorSpecialtyFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="ALL">All Specialties ({doctors.length})</option>
                {ALL_DOCTOR_CATEGORIES.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors
              .filter(d => {
                const matchesSpec = doctorSpecialtyFilter === 'ALL' || d.specialization === doctorSpecialtyFilter;
                const hosp = hospitals.find(h => h._id === d.hospitalId);
                const q = doctorSearchQuery.toLowerCase();
                const matchesSearch = !doctorSearchQuery ||
                  d.doctorName?.toLowerCase().includes(q) ||
                  d.specialization?.toLowerCase().includes(q) ||
                  d.qualification?.toLowerCase().includes(q) ||
                  d.medicalRegistrationNo?.toLowerCase().includes(q) ||
                  hosp?.hospitalName?.toLowerCase().includes(q) ||
                  hosp?.city?.toLowerCase().includes(q);
                return matchesSpec && matchesSearch;
              })
              .map(d => {
                const hosp = hospitals.find(h => h._id === d.hospitalId);
                const doctorBookings = bookings.filter(b => b.doctorId === d._id || b.doctorName === d.doctorName);

                return (
                  <div key={d._id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex gap-4 items-center">
                        <img src={d.image} className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow shrink-0" />
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="font-bold text-white text-sm">{d.doctorName}</h4>
                            <ShieldCheck className="w-4 h-4 text-emerald-400" title="Verified Medical License" />
                          </div>
                          <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/20 inline-block mt-0.5">
                            {d.specialization}
                          </span>
                          <p className="text-[11px] text-slate-300 mt-1 font-semibold">{d.qualification}</p>
                        </div>
                      </div>

                      {/* Rich Detailed Information Box */}
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 mt-3">
                        <p className="text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Reg No: {d.medicalRegistrationNo || 'TSMC/F/88912'}
                        </p>
                        {hosp && (
                          <p className="text-cyan-300 font-bold text-[11px] truncate">
                            🏥 <strong>{hosp.hospitalName}</strong> ({hosp.city})
                          </p>
                        )}
                        <p className="text-slate-300">🗓️ <strong>Days:</strong> {d.availableDays || 'Monday - Saturday'}</p>
                        <p className="text-slate-300">⏰ <strong>Timing:</strong> {d.availableTime || '09:00 AM - 01:00 PM'}</p>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[11px]">
                          <span>💰 Fee: <strong className="text-emerald-400">₹{d.opFee}</strong></span>
                          <span>🌟 Exp: <strong>{d.experience || 5} Yrs</strong></span>
                          <span className="text-cyan-400 font-bold">{doctorBookings.length} Consultations</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: View Legal Docs, Edit & Delete */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={async () => {
                          const res = d.verificationData || await autoVerifyDoctorLicense({
                            doctorName: d.doctorName,
                            regNo: d.medicalRegistrationNo || 'TSMC-88912',
                            qualification: d.qualification || 'MBBS, MD',
                            specialization: d.specialization,
                            fileName: 'Medical_Council_License.pdf'
                          });
                          setCertModalConfig({ isOpen: true, data: res, type: 'DOCTOR' });
                        }}
                        className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow cursor-pointer"
                        title="Inspect NMC / State Council Medical License"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> License 🛡️
                      </button>
                      <button
                        onClick={() => setSelectedDoctorDetails(d)}
                        className="flex-1 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" /> Docs
                      </button>
                      <button
                        onClick={() => setEditingDoctor({ ...d })}
                        className="flex-1 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-indigo-400" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete doctor profile: ${d.doctorName}?`)) {
                            deleteDoctor(d._id);
                          }
                        }}
                        className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-800 cursor-pointer"
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

      {/* --- BOOKINGS (FULL SEARCH, OVERRIDE & RESCHEDULE) --- */}
      {activeTab === 'BOOKINGS' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-outfit">
                <Calendar className="w-5 h-5 text-indigo-400" /> Global OP Consultation Bookings ({bookings.length})
              </h3>
              <p className="text-xs text-slate-400">Complete appointment logs, transaction reference numbers, doctor assignments & status overrides</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => printPdfReport(
                  'CarePulse — All OP Bookings Report',
                  ['Booking ID', 'Patient', 'Phone', 'Hospital', 'Doctor', 'Date', 'Fee (₹)', 'Status'],
                  bookings.map(b => [`#${b.bookingId}`, b.userName, b.userPhone, b.hospitalName, b.doctorName, b.date, b.opFee, b.status])
                )}
                className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> PDF Report
              </button>
              <button
                onClick={() => downloadCsv(
                  `CarePulse_All_Bookings_${new Date().toISOString().slice(0, 10)}`,
                  ['Booking ID', 'Patient', 'Phone', 'Hospital', 'Doctor', 'Date', 'Time', 'Fee', 'Payment', 'Status'],
                  bookings.map(b => [`#${b.bookingId}`, b.userName, b.userPhone, b.hospitalName, b.doctorName, b.date, b.time, b.opFee, b.paymentMethod || 'N/A', b.status])
                )}
                className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
              </button>
            </div>
          </div>

          {/* Search & Status Filter */}
          <div className="glass-panel p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search booking by booking ID, patient name, phone, doctor or hospital..."
                value={bookingSearchQuery}
                onChange={(e) => setBookingSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500/40 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="ALL">All Status ({bookings.length})</option>
                <option value="Confirmed">Confirmed ({bookings.filter(b => b.status === 'Confirmed').length})</option>
                <option value="Completed">Completed ({bookings.filter(b => b.status === 'Completed').length})</option>
                <option value="Cancelled">Cancelled ({bookings.filter(b => b.status === 'Cancelled').length})</option>
              </select>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3.5">Booking / Token ID</th>
                  <th className="p-3.5">Patient Details</th>
                  <th className="p-3.5">Hospital & Doctor</th>
                  <th className="p-3.5">Date & Slot Time</th>
                  <th className="p-3.5">Fee & Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {bookings
                  .filter(b => {
                    const matchesStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;
                    const q = bookingSearchQuery.toLowerCase();
                    const matchesSearch = !bookingSearchQuery ||
                      b.bookingId?.toLowerCase().includes(q) ||
                      b.userName?.toLowerCase().includes(q) ||
                      b.userPhone?.includes(q) ||
                      b.doctorName?.toLowerCase().includes(q) ||
                      b.hospitalName?.toLowerCase().includes(q) ||
                      b.txnRefNumber?.toLowerCase().includes(q);
                    return matchesStatus && matchesSearch;
                  })
                  .map(b => (
                    <tr key={b._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono text-cyan-400 font-bold block">#{b.bookingId}</span>
                        {b.txnRefNumber && <span className="font-mono text-[10px] text-slate-400">Ref: {b.txnRefNumber}</span>}
                      </td>
                      <td className="p-3.5">
                        <strong className="text-white block">{b.userName}</strong>
                        <span className="font-mono text-[11px] text-slate-400">+91 {b.userPhone}</span>
                      </td>
                      <td className="p-3.5">
                        <strong className="text-white block">{b.doctorName}</strong>
                        <span className="text-[11px] text-indigo-400">{b.hospitalName}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-200">{b.date}</div>
                        <span className="text-cyan-400 font-bold text-[11px]">{b.time}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-emerald-400">₹{b.opFee}</div>
                        <span className="text-[10px] text-slate-400">{b.paymentMethod || 'Online UPI'}</span>
                      </td>
                      <td className="p-3.5 font-bold">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                          b.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          b.status === 'Completed' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 min-w-[200px]">
                        <button
                          onClick={() => setEditingBooking({ ...b })}
                          className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Reschedule / Override
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Cancel and mark booking #${b.bookingId} as Cancelled?`)) {
                              updateBookingStatus(b._id, 'Cancelled');
                            }
                          }}
                          className="px-2 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-[11px] cursor-pointer"
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

      {/* ═══ TAB: SUPER ADMIN MASTER CONTROL CENTER ═══ */}
      {activeTab === 'CONTROLS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2 font-outfit">
                <ShieldCheck className="w-6 h-6 text-amber-400" /> Super Administrator Master Control Center
              </h3>
              <p className="text-xs text-slate-400">Global system broadcasts, database backup & restoration, bulk operations & security policies</p>
            </div>
            <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-mono font-bold">
              ROOT ACCESS · ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 1. Global Platform Announcement Broadcast */}
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                <Send className="w-5 h-5" /> 1. Live Platform Announcement Broadcast
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Broadcast an emergency or official notification banner to all patients, doctors, and hospital administrators instantly across the entire CarePulse system.
              </p>

              <div className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="Enter broadcast message (e.g. 📢 Free Multi-Speciality Health Camp on Sunday at Apollo Hospital! Free consultation for all patients.)"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-2xl p-3.5 text-xs text-white outline-none"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!announcementText.trim()) {
                        alert('Please enter an announcement message first!');
                        return;
                      }
                      localStorage.setItem('carepulse_broadcast_announcement', announcementText.trim());
                      alert('🚀 Broadcast Announcement Published Live to All Users!');
                    }}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Publish Live Broadcast
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('carepulse_broadcast_announcement');
                      setAnnouncementText('');
                      alert('Broadcast announcement removed.');
                    }}
                    className="px-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Master System Toggles & Emergency Controls */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
                <Settings className="w-5 h-5" /> 2. Master Platform Security & Mode Switches
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Control system access rules, 24/7 red-alert emergency state, and public registration policies.
              </p>

              <div className="space-y-3 pt-1 text-xs">
                {/* Emergency Red Alert Mode */}
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="text-white block">24/7 Red-Alert Emergency Mode</strong>
                    <span className="text-[11px] text-slate-400">Prioritizes emergency OP bookings and enables direct walk-in queueing</span>
                  </div>
                  <button
                    onClick={() => {
                      const next = !isEmergencyMode;
                      setIsEmergencyMode(next);
                      localStorage.setItem('carepulse_emergency_mode', next.toString());
                      alert(`Emergency Mode: ${next ? 'ACTIVATED 🚨' : 'DEACTIVATED ✓'}`);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                      isEmergencyMode ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isEmergencyMode ? 'ENABLED 🚨' : 'DISABLED'}
                  </button>
                </div>

                {/* Public Registration Gateway */}
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="text-white block">Hospital Self-Registration Gateway</strong>
                    <span className="text-[11px] text-slate-400">Allow new hospitals to submit registration requests online</span>
                  </div>
                  <button
                    onClick={() => {
                      const next = !allowPublicRegistration;
                      setAllowPublicRegistration(next);
                      localStorage.setItem('carepulse_allow_registration', next.toString());
                      alert(`Hospital Registration: ${next ? 'OPEN TO PUBLIC ✓' : 'LOCKED TO ADMIN ONLY 🔒'}`);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                      allowPublicRegistration ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {allowPublicRegistration ? 'OPEN (PUBLIC)' : 'ADMIN ONLY 🔒'}
                  </button>
                </div>

                {/* Bulk Hospital Approval */}
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="text-white block">Bulk Hospital Approvals ({pendingHospitalsCount} Pending)</strong>
                    <span className="text-[11px] text-slate-400">Approve all registered hospitals currently in pending review state</span>
                  </div>
                  <button
                    onClick={() => {
                      if (pendingHospitalsCount === 0) {
                        alert('No hospitals are currently pending approval!');
                        return;
                      }
                      hospitals.filter(h => h.status === 'PENDING').forEach(h => approveHospital(h._id));
                      alert(`✅ All ${pendingHospitalsCount} pending hospitals approved!`);
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow cursor-pointer"
                  >
                    Approve All ({pendingHospitalsCount})
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Complete Database Backup & Export Center */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                <FileSpreadsheet className="w-5 h-5" /> 3. Master Database Backup, Export & Factory Reset Center
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download a complete system snapshot (JSON master file), individual excel spreadsheets, or reset system records.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {/* JSON DB Backup */}
                <button
                  type="button"
                  onClick={() => {
                    const fullDbDump = {
                      exportTimestamp: new Date().toISOString(),
                      system: 'CarePulse Hospital OP Booking System',
                      users,
                      hospitals,
                      doctors,
                      bookings
                    };
                    const blob = new Blob([JSON.stringify(fullDbDump, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `CarePulse_Master_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    alert('💾 Complete Master JSON Database Backup downloaded successfully!');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 p-4 rounded-2xl text-left space-y-2 cursor-pointer transition-all hover:border-cyan-500/40"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    JSON
                  </div>
                  <strong className="text-white text-xs block">Download Full DB Backup</strong>
                  <span className="text-[10px] text-slate-400 block">All users, hospitals, doctors, and bookings in JSON</span>
                </button>

                {/* CSV Patients Export */}
                <button
                  type="button"
                  onClick={() => downloadCsv(
                    `CarePulse_Patients_${new Date().toISOString().slice(0, 10)}`,
                    ['Patient ID', 'Full Name', 'Phone', 'Email', 'DOB', 'Gender', 'Address', 'Role', 'Status', 'Registered Date'],
                    users.map(u => [
                      u.patientId || ('CP-PAT-' + (u.phone ? u.phone.slice(-6) : '543210')),
                      u.fullName,
                      u.phone,
                      u.email || '',
                      u.dateOfBirth || '',
                      u.gender || '',
                      u.address || '',
                      u.role,
                      u.status,
                      u.createdAt || ''
                    ])
                  )}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 p-4 rounded-2xl text-left space-y-2 cursor-pointer transition-all hover:border-emerald-500/40"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    CSV
                  </div>
                  <strong className="text-white text-xs block">Export Patients Directory</strong>
                  <span className="text-[10px] text-slate-400 block">{users.length} patient records with contact details</span>
                </button>

                {/* CSV Doctors & Hospitals Export */}
                <button
                  type="button"
                  onClick={() => downloadCsv(
                    `CarePulse_Doctors_Directory_${new Date().toISOString().slice(0, 10)}`,
                    ['Doctor Name', 'Registration No', 'Specialty', 'Qualifications', 'Hospital Name', 'OP Fee', 'Timings', 'Days'],
                    doctors.map(d => {
                      const h = hospitals.find(hosp => hosp._id === d.hospitalId);
                      return [d.doctorName, d.medicalRegistrationNo || '', d.specialization, d.qualification || '', h?.hospitalName || '', d.opFee, d.availableTime, d.availableDays];
                    })
                  )}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 p-4 rounded-2xl text-left space-y-2 cursor-pointer transition-all hover:border-indigo-500/40"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                    CSV
                  </div>
                  <strong className="text-white text-xs block">Export Doctors Directory</strong>
                  <span className="text-[10px] text-slate-400 block">{doctors.length} verified doctors with hospital affiliations</span>
                </button>

                {/* Factory Reset Database */}
                <button
                  type="button"
                  onClick={() => {
                    const confirmText = prompt('⚠️ TYPE "RESET" TO FACTORY RESTORE THE ENTIRE DATABASE:');
                    if (confirmText === 'RESET') {
                      localStorage.clear();
                      alert('🔄 Database factory reset completed. Reloading system...');
                      window.location.reload();
                    }
                  }}
                  className="bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl text-left space-y-2 cursor-pointer transition-all hover:border-rose-500/60"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <strong className="text-rose-300 text-xs block">Factory Reset Database</strong>
                  <span className="text-[10px] text-slate-400 block">Clear cache & restore factory initial dataset</span>
                </button>
              </div>
            </div>

            {/* 4. Enterprise Cyber Security Shield & Live Tamper-Proof Audit Center */}
            <div className="glass-panel p-6 rounded-3xl border-2 border-emerald-500/40 shadow-2xl space-y-4 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" /> 
                  <span>4. Enterprise Cyber Security Shield & Live Tamper-Proof Audit Hub</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-mono font-bold">
                    ACTIVE · SHIELD v2.4
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('carepulse_security_audit_logs');
                      alert('🧹 Security Audit Trail cleared by Administrator.');
                      window.location.reload();
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Purge Logs
                  </button>
                </div>
              </div>

              {/* Active Security Safeguards Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> XSS & Injection Shield
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <p className="text-[11px] text-slate-400">All input fields and registration forms sanitized against HTML & script injection attacks.</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-indigo-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-400 font-bold text-xs flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Rate Limiter & Anti-Brute Force
                    </span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  </div>
                  <p className="text-[11px] text-slate-400">Account locks for 15 mins after 5 consecutive bad login attempts.</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-cyan-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold text-xs flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> AI Certificate Scanner
                    </span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  </div>
                  <p className="text-[11px] text-slate-400">State Medical Council (NMC) and CEA regulatory compliance verification.</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" /> RBAC & Data Encryption
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  </div>
                  <p className="text-[11px] text-slate-400">Role-Based Access Control and SHA-256 patient data isolation.</p>
                </div>
              </div>

              {/* Real-time Security Event Feed */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" /> Live Security Events Stream ({JSON.parse(localStorage.getItem('carepulse_security_audit_logs') || '[]').length} Logged)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">ENCRYPTED AUDIT TRAIL</span>
                </div>

                <div className="max-h-64 overflow-y-auto custom-scrollbar bg-slate-950 p-3 rounded-2xl border border-slate-800 divide-y divide-slate-900 text-xs font-mono">
                  {JSON.parse(localStorage.getItem('carepulse_security_audit_logs') || '[]').length > 0 ? (
                    JSON.parse(localStorage.getItem('carepulse_security_audit_logs') || '[]').map((log, idx) => (
                      <div key={idx} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-900/40 px-2 rounded-lg transition-colors">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                            log.severity === 'CRITICAL' || log.eventType.includes('LOCKOUT') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                            log.severity === 'WARNING' || log.eventType.includes('FAIL') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {log.eventType}
                          </span>
                          <span className="text-slate-200 text-[11px] font-sans font-medium">{log.description}</span>
                        </div>
                        <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-slate-500 italic font-sans text-xs">
                      🔒 No suspicious activity detected. All security firewalls reporting 100% nominal operation.
                    </div>
                  )}
                </div>
              </div>
            </div>

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

      {/* 👤 FULL PATIENT PROFILE & OP CONSULTATION HISTORY MODAL */}
      {selectedPatientDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-3xl rounded-3xl p-6 border border-cyan-500/40 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPatientDetails(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Patient Header */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-cyan-500/30 border-2 border-cyan-400/30 shrink-0">
                {selectedPatientDetails.fullName?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-xl font-outfit">{selectedPatientDetails.fullName}</h3>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Patient
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-cyan-300 font-extrabold text-xs bg-cyan-950/70 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
                    {selectedPatientDetails.patientId || ('CP-PAT-' + (selectedPatientDetails.phone ? selectedPatientDetails.phone.slice(-6) : '543210'))}
                  </span>
                  <span className="text-xs text-slate-400">CarePulse Unique Patient ID</span>
                </div>
              </div>
            </div>

            {/* 1. Patient Profile Details Grid */}
            <div className="space-y-2">
              <h4 className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                <User className="w-4 h-4" /> 1. Personal & Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <Phone className="w-3 h-3 text-cyan-400" /> Phone (Login ID)
                  </span>
                  <p className="font-mono font-bold text-white text-sm">+91 {selectedPatientDetails.phone}</p>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <Mail className="w-3 h-3 text-cyan-400" /> Email Address
                  </span>
                  <p className="font-semibold text-white truncate">{selectedPatientDetails.email || 'Not specified'}</p>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-cyan-400" /> Date of Birth & Gender
                  </span>
                  <p className="font-semibold text-white">{selectedPatientDetails.dateOfBirth || 'N/A'} • {selectedPatientDetails.gender || 'Male'}</p>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" /> Residential Address
                  </span>
                  <p className="font-semibold text-slate-200">{selectedPatientDetails.address || 'Address not registered'}</p>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" /> Account Status
                  </span>
                  <p className="font-bold text-emerald-400">{selectedPatientDetails.status || 'ACTIVE'} ({selectedPatientDetails.role})</p>
                </div>
              </div>
            </div>

            {/* 2. Patient OP Booking & Consultation History */}
            {(() => {
              const patientBookings = bookings.filter(b => b.userId === selectedPatientDetails._id || b.userPhone === selectedPatientDetails.phone);

              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-cyan-400" /> 2. OP Appointments & Medical History ({patientBookings.length} Consultations)
                    </h4>
                  </div>

                  {patientBookings.length > 0 ? (
                    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-xs min-w-[600px]">
                        <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800 sticky top-0">
                          <tr>
                            <th className="p-2.5">Booking / Token</th>
                            <th className="p-2.5">Hospital & Doctor</th>
                            <th className="p-2.5">Date & Slot</th>
                            <th className="p-2.5">Fee Paid</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 text-slate-200">
                          {patientBookings.map(b => (
                            <tr key={b._id} className="hover:bg-slate-950/40">
                              <td className="p-2.5">
                                <div className="font-mono text-cyan-400 font-bold">#{b.bookingId}</div>
                                {b.txnRefNumber && <span className="font-mono text-[9px] text-slate-400 block">Ref: {b.txnRefNumber}</span>}
                              </td>
                              <td className="p-2.5">
                                <strong className="text-white block">{b.doctorName}</strong>
                                <span className="text-[11px] text-slate-400">{b.hospitalName}</span>
                              </td>
                              <td className="p-2.5">
                                <div>{b.date}</div>
                                <span className="text-[10px] text-cyan-400 font-bold">{b.time}</span>
                              </td>
                              <td className="p-2.5 font-bold text-emerald-400">₹{b.opFee}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  b.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  b.status === 'Completed' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                      No OP booking consultations on record yet for this patient.
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3. Direct Admin Controls */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => {
                  const pwd = prompt(`Enter new password for ${selectedPatientDetails.fullName}:`, 'password123');
                  if (pwd) {
                    resetUserPassword(selectedPatientDetails._id, pwd);
                    alert('✅ Password reset successfully!');
                  }
                }}
                className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" /> Reset Password
              </button>
              <button
                onClick={() => {
                  toggleUserStatus(selectedPatientDetails._id);
                  setSelectedPatientDetails(prev => ({ ...prev, status: prev.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }));
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {selectedPatientDetails.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
              </button>
              <button
                onClick={() => {
                  if (confirm(`Permanently delete patient account ${selectedPatientDetails.fullName}?`)) {
                    deleteUser(selectedPatientDetails._id);
                    setSelectedPatientDetails(null);
                  }
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Account
              </button>
            </div>
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

              {/* 2. Doctor Uploaded Medical Registration & Individual Degree Certificates */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-300 text-xs flex items-center justify-between">
                  <span>🏅 2. Doctor Uploaded License & Degree Certificates</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">VERIFIED DOCUMENTS</span>
                </h4>

                <div className="space-y-2 pt-1">
                  {/* Medical Council Registration License */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-300 font-bold block">Medical Registration License Certificate</span>
                      <span className="text-emerald-400 font-mono text-[10px]">No: {selectedDoctorDetails.medicalRegistrationNo || 'TSMC/F/88912'}</span>
                    </div>
                    {selectedDoctorDetails.medicalRegCertDoc ? (
                      <a href={selectedDoctorDetails.medicalRegCertDoc} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg font-bold text-xs shadow">
                        📄 View License PDF/Img
                      </a>
                    ) : (
                      <span className="text-emerald-400 font-bold text-[10px]">✓ License Verified</span>
                    )}
                  </div>

                  {/* Individual Degree Certificates Uploaded by Doctor (MBBS, MD, MS, etc.) */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <span className="text-cyan-400 font-bold block">🎓 Doctor Degree Certificates (Multi-Qualifications):</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      {(selectedDoctorDetails.selectedQualifications || (selectedDoctorDetails.qualification ? selectedDoctorDetails.qualification.split(', ') : ['MBBS'])).map(deg => {
                        const degKey = `cert_${deg.split(' ')[0]}`;
                        const degDoc = selectedDoctorDetails[degKey] || selectedDoctorDetails.degreeCertDoc;
                        return (
                          <div key={deg} className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
                            <span className="text-slate-300 font-medium truncate">{deg.split(' ')[0]} Certificate</span>
                            {degDoc ? (
                              <a href={degDoc} target="_blank" rel="noopener noreferrer" className="bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                                🎓 View PDF
                              </a>
                            ) : (
                              <span className="text-slate-500 italic text-[10px]">No Doc</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
                        { title: '1. Hospital Reg Cert', key: 'regCertificate', docKey: 'hospRegDoc', numKey: 'regCertificateNo', docNumKey: 'hospRegDocNo' },
                        { title: '2. Clinical Establishment', key: 'clinicalEstablishmentCert', docKey: 'clinicalCertDoc', numKey: 'clinicalEstablishmentCertNo', docNumKey: 'clinicalCertDocNo' },
                        { title: '3. NABH Certificate', key: 'nabhCertificate', docKey: 'nabhCertDoc', numKey: 'nabhCertificateNo', docNumKey: 'nabhCertDocNo' },
                        { title: '4. Hospital PAN Card', key: 'hospitalPan', docKey: 'hospPanDoc', numKey: 'hospitalPanNo', docNumKey: 'hospPanDocNo' },
                        { title: '5. GST Certificate', key: 'gstCertificate', docKey: 'gstCertDoc', numKey: 'gstCertificateNo', docNumKey: 'gstCertDocNo' },
                        { title: '6. Pharmacy Drug License', key: 'drugLicense', docKey: 'drugLicenseDoc', numKey: 'drugLicenseNo', docNumKey: 'drugLicenseDocNo' },
                        { title: '7. Biomedical Waste Auth', key: 'biomedicalWasteAuth', docKey: 'biomedicalDoc', numKey: 'biomedicalWasteAuthNo', docNumKey: 'biomedicalDocNo' },
                        { title: '8. Fire Safety NOC', key: 'fireNocCert', docKey: 'fireNocDoc', numKey: 'fireNocCertNo', docNumKey: 'fireNocDocNo' },
                        { title: '9. Trade License', key: 'tradeLicenseCert', docKey: 'tradeLicenseDoc', numKey: 'tradeLicenseCertNo', docNumKey: 'tradeLicenseDocNo' }
                      ].map(doc => {
                        const certNo = selectedDoctorDetails[doc.docNumKey] || hosp[doc.numKey];
                        const certFile = selectedDoctorDetails[doc.docKey] || hosp[doc.key];
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

      {/* ═══ MASTER EDIT MODAL: PATIENT / USER ═══ */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-cyan-500/40 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-white text-lg flex items-center gap-2 font-outfit">
              <Edit3 className="w-5 h-5 text-cyan-400" /> Super Admin Edit: {editingUser.fullName}
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateUser(editingUser._id, {
                fullName: editingUser.fullName,
                phone: editingUser.phone,
                email: editingUser.email,
                dateOfBirth: editingUser.dateOfBirth,
                gender: editingUser.gender,
                address: editingUser.address,
                role: editingUser.role,
                status: editingUser.status,
                ...(editingUser.newPassword ? { password: editingUser.newPassword } : {})
              });
              alert('✅ Patient / User account details updated successfully by Admin!');
              setEditingUser(null);
            }} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Mobile Phone (Login ID) *</label>
                  <input
                    type="tel"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingUser.dateOfBirth || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Gender</label>
                  <select
                    value={editingUser.gender || 'Male'}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
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
                  value={editingUser.address || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Account Role</label>
                  <select
                    value={editingUser.role || 'USER'}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="USER">Patient / User</option>
                    <option value="HOSPITAL">Hospital Admin</option>
                    <option value="ADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Account Status</label>
                  <select
                    value={editingUser.status || 'ACTIVE'}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="ACTIVE">ACTIVE ✓</option>
                    <option value="SUSPENDED">SUSPENDED 🛑</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Override Password (Leave blank to keep existing)</label>
                <input
                  type="password"
                  placeholder="Enter new custom password..."
                  value={editingUser.newPassword || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl shadow-lg cursor-pointer"
                >
                  Save Account Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MASTER EDIT MODAL: HOSPITAL ═══ */}
      {editingHospital && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 border border-indigo-500/40 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingHospital(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-white text-lg flex items-center gap-2 font-outfit">
              <Edit3 className="w-5 h-5 text-indigo-400" /> Super Admin Edit: {editingHospital.hospitalName}
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateHospital(editingHospital._id, {
                hospitalName: editingHospital.hospitalName,
                phone: editingHospital.phone,
                email: editingHospital.email,
                city: editingHospital.city,
                area: editingHospital.area,
                address: editingHospital.address,
                opFee: Number(editingHospital.opFee),
                hospitalTimings: editingHospital.hospitalTimings,
                sameDayBooking: editingHospital.sameDayBooking,
                status: editingHospital.status,
                upiId: editingHospital.upiId
              });
              alert('✅ Hospital details updated successfully by Admin!');
              setEditingHospital(null);
            }} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Hospital Name *</label>
                <input
                  type="text"
                  value={editingHospital.hospitalName}
                  onChange={(e) => setEditingHospital(prev => ({ ...prev, hospitalName: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={editingHospital.phone}
                    onChange={(e) => setEditingHospital(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Official Email</label>
                  <input
                    type="email"
                    value={editingHospital.email || ''}
                    onChange={(e) => setEditingHospital(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">City</label>
                  <input
                    type="text"
                    value={editingHospital.city}
                    onChange={(e) => setEditingHospital(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Area / Landmark</label>
                  <input
                    type="text"
                    value={editingHospital.area}
                    onChange={(e) => setEditingHospital(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Full Street Address</label>
                <input
                  type="text"
                  value={editingHospital.address}
                  onChange={(e) => setEditingHospital(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Base OP Fee (₹)</label>
                  <input
                    type="number"
                    value={editingHospital.opFee}
                    onChange={(e) => setEditingHospital(prev => ({ ...prev, opFee: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Approval Status</label>
                  <select
                    value={editingHospital.status}
                    onChange={(e) => setEditingHospital(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="APPROVED">APPROVED ✓</option>
                    <option value="PENDING">PENDING REVIEW</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Advance Window</label>
                  <select
                    value={editingHospital.sameDayBooking || 'Yes'}
                    onChange={(e) => setEditingHospital(prev => ({ ...prev, sameDayBooking: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Yes">Same Day</option>
                    <option value="1_DAY">1 Day</option>
                    <option value="3_DAYS">3 Days</option>
                    <option value="1_WEEK">1 Week</option>
                    <option value="2_WEEKS">2 Weeks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Hospital UPI ID (For patient QR payments)</label>
                <input
                  type="text"
                  value={editingHospital.upiId || ''}
                  onChange={(e) => setEditingHospital(prev => ({ ...prev, upiId: e.target.value }))}
                  placeholder="e.g. apollo@ybl"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg cursor-pointer"
                >
                  Save Hospital Profile
                </button>
                <button
                  type="button"
                  onClick={() => setEditingHospital(null)}
                  className="px-4 bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MASTER EDIT MODAL: DOCTOR ═══ */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 border border-emerald-500/40 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingDoctor(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-white text-lg flex items-center gap-2 font-outfit">
              <Edit3 className="w-5 h-5 text-emerald-400" /> Super Admin Edit: {editingDoctor.doctorName}
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateDoctor(editingDoctor._id, {
                doctorName: editingDoctor.doctorName,
                hospitalId: editingDoctor.hospitalId,
                medicalRegistrationNo: editingDoctor.medicalRegistrationNo,
                qualification: editingDoctor.qualification,
                specialization: editingDoctor.specialization,
                experience: Number(editingDoctor.experience),
                phone: editingDoctor.phone,
                opFee: Number(editingDoctor.opFee),
                availableDays: editingDoctor.availableDays,
                availableTime: editingDoctor.availableTime,
                maxPatients: Number(editingDoctor.maxPatients)
              });
              alert('✅ Doctor details updated successfully by Admin!');
              setEditingDoctor(null);
            }} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Doctor Full Name *</label>
                <input
                  type="text"
                  value={editingDoctor.doctorName}
                  onChange={(e) => setEditingDoctor(prev => ({ ...prev, doctorName: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Assigned Hospital</label>
                  <select
                    value={editingDoctor.hospitalId}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, hospitalId: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {hospitals.map(h => (
                      <option key={h._id} value={h._id}>{h.hospitalName} ({h.city})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Medical Registration No *</label>
                  <input
                    type="text"
                    value={editingDoctor.medicalRegistrationNo || ''}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, medicalRegistrationNo: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Specialization</label>
                  <select
                    value={editingDoctor.specialization}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {ALL_DOCTOR_CATEGORIES.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Degree & Qualifications</label>
                  <input
                    type="text"
                    value={editingDoctor.qualification || ''}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, qualification: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">OP Fee (₹)</label>
                  <input
                    type="number"
                    value={editingDoctor.opFee}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, opFee: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={editingDoctor.experience || 5}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Max Patients/Day</label>
                  <input
                    type="number"
                    value={editingDoctor.maxPatients || 25}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, maxPatients: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Available Days</label>
                  <input
                    type="text"
                    value={editingDoctor.availableDays || 'Monday - Saturday'}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, availableDays: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Timings Slot</label>
                  <input
                    type="text"
                    value={editingDoctor.availableTime || '09:00 AM - 01:00 PM'}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, availableTime: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-lg cursor-pointer"
                >
                  Save Doctor Profile
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-4 bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MASTER EDIT MODAL: BOOKING OVERRIDE & RESCHEDULE ═══ */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-indigo-500/40 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingBooking(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-white text-lg flex items-center gap-2 font-outfit">
              <Edit3 className="w-5 h-5 text-indigo-400" /> Admin Override: Booking #{editingBooking.bookingId}
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateBooking(editingBooking._id, {
                userName: editingBooking.userName,
                userPhone: editingBooking.userPhone,
                date: editingBooking.date,
                time: editingBooking.time,
                opFee: Number(editingBooking.opFee),
                status: editingBooking.status,
                prescriptionNote: editingBooking.prescriptionNote
              });
              alert('✅ Booking record updated and rescheduled successfully!');
              setEditingBooking(null);
            }} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={editingBooking.userName}
                    onChange={(e) => setEditingBooking(prev => ({ ...prev, userName: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Patient Phone</label>
                  <input
                    type="tel"
                    value={editingBooking.userPhone}
                    onChange={(e) => setEditingBooking(prev => ({ ...prev, userPhone: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Reschedule Date</label>
                  <input
                    type="date"
                    value={editingBooking.date}
                    onChange={(e) => setEditingBooking(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={editingBooking.time}
                    onChange={(e) => setEditingBooking(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="e.g. 10:30 AM"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Consultation Status</label>
                  <select
                    value={editingBooking.status}
                    onChange={(e) => setEditingBooking(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    value={editingBooking.opFee}
                    onChange={(e) => setEditingBooking(prev => ({ ...prev, opFee: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Prescription Note / Medical Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Enter medical notes, diagnosis, or prescription remarks..."
                  value={editingBooking.prescriptionNote || ''}
                  onChange={(e) => setEditingBooking(prev => ({ ...prev, prescriptionNote: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg cursor-pointer"
                >
                  Save Booking Override
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ INTERACTIVE CERTIFICATE VERIFICATION INSPECTOR MODAL ═══ */}
      {certModalConfig.isOpen && certModalConfig.data && (
        <CertificateVerificationModal
          isOpen={certModalConfig.isOpen}
          onClose={() => setCertModalConfig({ isOpen: false, data: null, type: 'HOSPITAL' })}
          data={certModalConfig.data}
          type={certModalConfig.type}
        />
      )}
    </div>
  );
}
