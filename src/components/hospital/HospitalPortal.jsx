import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { useLanguage } from '../../context/LanguageContext';
import { downloadCsv, printPdfReport } from '../../utils/exportUtils';
import { 
  Building2, Users, Stethoscope, Calendar, Settings, LogOut, Plus, 
  CheckCircle, XCircle, Clock, Trash2, Edit3, ShieldAlert, BarChart3, X, Image as ImageIcon, Upload, ShieldCheck, Award, FileText, FileSpreadsheet 
} from 'lucide-react';

export const ALL_DOCTOR_CATEGORIES = [
  'Cardiologist (Heart Specialist / హృద్రోగ నిపుణులు)',
  'Pediatrician (Child Specialist / పిల్లల వైద్యాధికారి)',
  'Orthopedic Surgeon (Bone & Joint / ఎముకల నిపుణులు)',
  'Dermatologist (Skin & Hair / చర్మవ్యాధి నిపుణులు)',
  'Neurologist (Brain & Nerves / నడీ సంబంధిత నిపుణులు)',
  'Gynecology & Obstetrician (Women Health / స్త్రీల నిపుణులు)',
  'ENT Specialist (Ear, Nose, Throat / చెవి, ముక్కు, గొంతు)',
  'General Physician (General Health / సాధారణ వైద్యము)',
  'General Surgeon (Surgeon / శస్త్రచికిత్స నిపుణులు)',
  'Ophthalmologist (Eye Specialist / కంటి నిపుణులు)',
  'Gastroenterologist (Stomach & Liver / జీర్ణకోశ నిపుణులు)',
  'Oncologist (Cancer Specialist / క్యాన్సర్ నిపుణులు)',
  'Pulmonologist (Lung & Chest / శ్వాసకోశ నిపుణులు)',
  'Nephrologist (Kidney Specialist / మూత్రపిండ నిపుణులు)',
  'Dentist (Dental Surgeon / దంత నిపుణులు)',
  'Psychiatrist (Mental Health / మానసిక చికిత్స)',
  'Urologist (Urinary Track / మూత్రకోశ నిపుణులు)',
  'Endocrinologist (Diabetes & Hormones / హార్మోన్ నిపుణులు)',
  'Rheumatologist (Arthritis & Joint Pain)',
  'Anesthesiologist (Pain Management)',
  'Radiologist (X-Ray & Scans)',
  'Pathologist (Lab & Diagnostics)',
  'Ayurvedic Practitioner (ఆయుర్వేద నిపుణులు)',
  'Homeopathy Specialist (హోమియోపతి నిపుణులు)',
  'OTHER (Type Custom Doctor Specialization)'
];

export const OFFICIAL_QUALIFICATIONS = [
  'MBBS (Bachelor of Medicine & Surgery)',
  'MD (Doctor of Medicine)',
  'MS (Master of Surgery)',
  'DM (Doctorate of Medicine - Super Specialty)',
  'MCh (Master of Chirurgie - Super Surgery)',
  'DNB (Diplomate of National Board)',
  'DCH (Diploma in Child Health)',
  'DGO (Diploma in Gynecology & Obstetrics)',
  'BDS (Bachelor of Dental Surgery)',
  'MDS (Master of Dental Surgery)',
  'BAMS (Ayurvedic Medicine & Surgery)',
  'BHMS (Homeopathic Medicine & Surgery)',
  'Fellowship (Post-Doctoral Fellowship)',
  'OTHER (Type Custom Medical Degree)'
];

export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813566-88855ce783d1?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80'
];

export default function HospitalPortal() {
  const { currentUser, logout } = useAuth();
  const { hospitals, updateHospital, doctors, addDoctor, updateDoctor, deleteDoctor, bookings, updateBookingStatus } = useDb();
  const { t } = useLanguage();

  // Navigation Tab State: 'DASHBOARD' | 'PROFILE' | 'DOCTORS' | 'BOOKINGS' | 'REPORTS'
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  // Active Hospital object
  const hospital = hospitals.find(h => h._id === currentUser?.hospitalId) || hospitals[0];
  const hospitalDoctors = doctors.filter(d => d.hospitalId === hospital._id);
  const hospitalBookings = bookings.filter(b => b.hospitalId === hospital._id);

  // Modal States
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [customSpecialtyText, setCustomSpecialtyText] = useState('');
  const [customQualificationText, setCustomQualificationText] = useState('');

  const [docForm, setDocForm] = useState({
    doctorName: '',
    medicalRegistrationNo: '',
    qualificationDegree: OFFICIAL_QUALIFICATIONS[0],
    specialization: ALL_DOCTOR_CATEGORIES[0],
    department: 'Cardiology',
    experience: 5,
    phone: '',
    opFee: hospital.opFee || 500,
    availableDays: 'Monday - Saturday',
    availableTime: '09:00 AM - 01:00 PM',
    maxPatients: 20,
    image: PRESET_AVATARS[0]
  });

  // Profile Form State
  const [hospProfileForm, setHospProfileForm] = useState({
    hospitalName: hospital.hospitalName || '',
    phone: hospital.phone || '',
    email: hospital.email || '',
    address: hospital.address || '',
    area: hospital.area || '',
    city: hospital.city || '',
    hospitalTimings: hospital.hospitalTimings || '',
    opFee: hospital.opFee || 500,
    emergencyAvailable: hospital.emergencyAvailable ?? true
  });

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

  const handleCreateDoctorSubmit = (e) => {
    e.preventDefault();

    if (!docForm.medicalRegistrationNo || docForm.medicalRegistrationNo.trim().length < 4) {
      alert('❌ Valid Medical Registration Number / License ID is REQUIRED to verify doctor!');
      return;
    }

    const finalSpecialty = docForm.specialization.startsWith('OTHER') ? customSpecialtyText : docForm.specialization.split(' (')[0];
    const finalQualification = docForm.qualificationDegree.startsWith('OTHER') ? customQualificationText : docForm.qualificationDegree.split(' (')[0];

    addDoctor({
      hospitalId: hospital._id,
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
    setDocForm({ doctorName: '', medicalRegistrationNo: '', qualificationDegree: OFFICIAL_QUALIFICATIONS[0], specialization: ALL_DOCTOR_CATEGORIES[0], department: 'Cardiology', experience: 5, phone: '', opFee: 500, availableDays: 'Monday - Saturday', availableTime: '09:00 AM - 01:00 PM', maxPatients: 20, image: PRESET_AVATARS[0] });
    setCustomSpecialtyText('');
    setCustomQualificationText('');
    alert('✅ Educated & Verified Doctor Added with Medical Council Reg. No!');
  };

  const handleUpdateHospitalProfile = (e) => {
    e.preventDefault();
    updateHospital(hospital._id, hospProfileForm);
    alert('✅ Hospital profile updated successfully!');
  };

  return (
    <div className="space-y-6 pb-20">

      {/* Warning Banner */}
      {hospital.status === 'PENDING' && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-300">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Hospital Registration is <strong>PENDING ADMIN APPROVAL</strong>. Patients will see your hospital once Admin approves it.
          </span>
          <span className="bg-amber-500/20 px-2.5 py-1 rounded-full font-bold">Pending Review</span>
        </div>
      )}

      {/* Navigation Sub-Bar */}
      <div className="glass-panel p-2 rounded-2xl border border-slate-800 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'DASHBOARD' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'PROFILE' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Hospital Profile
          </button>
          <button
            onClick={() => setActiveTab('DOCTORS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'DOCTORS' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctor Management ({hospitalDoctors.length})
          </button>
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'BOOKINGS' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> OP Bookings ({hospitalBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'REPORTS' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Reports
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
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white font-outfit">{hospital.hospitalName} Dashboard</h2>
              <p className="text-xs text-slate-400">{hospital.address}, {hospital.city} • Contact: {hospital.phone}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              hospital.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              Status: {hospital.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Total Hospital Doctors</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-outfit">{hospitalDoctors.length}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Total OP Bookings</span>
              <span className="text-2xl font-extrabold text-cyan-400 font-outfit">{hospitalBookings.length}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Completed Consultations</span>
              <span className="text-2xl font-extrabold text-indigo-400 font-outfit">
                {hospitalBookings.filter(b => b.status === 'Completed').length}
              </span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Total Revenue</span>
              <span className="text-2xl font-extrabold text-amber-400 font-outfit">
                ₹{hospitalBookings.reduce((sum, b) => sum + (b.status !== 'Cancelled' ? b.opFee : 0), 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- PROFILE --- */}
      {activeTab === 'PROFILE' && (
        <div className="max-w-2xl mx-auto glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" /> Manage Hospital Profile
          </h3>

          <form onSubmit={handleUpdateHospitalProfile} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Hospital Name</label>
              <input
                type="text"
                value={hospProfileForm.hospitalName}
                onChange={(e) => setHospProfileForm(prev => ({ ...prev, hospitalName: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={hospProfileForm.phone}
                  onChange={(e) => setHospProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Email</label>
                <input
                  type="email"
                  value={hospProfileForm.email}
                  onChange={(e) => setHospProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl"
            >
              Update Hospital Details
            </button>
          </form>
        </div>
      )}

      {/* --- DOCTOR MANAGEMENT --- */}
      {activeTab === 'DOCTORS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-400" /> Verified Doctors Directory
            </h3>
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Doctor (Reg. ID & Degree)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hospitalDoctors.map(doc => (
              <div key={doc._id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex gap-4 items-center">
                  <img src={doc.image} className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow" />
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-white text-sm">{doc.doctorName}</h4>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" title="Verified Medical License" />
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {doc.specialization}
                    </span>
                    <p className="text-[11px] text-slate-300 mt-1 font-semibold">{doc.qualification}</p>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <p className="text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" /> Reg No: {doc.medicalRegistrationNo || 'TSMC/F/88912'}
                  </p>
                  <p>Days: {doc.availableDays}</p>
                  <p>Timing: {doc.availableTime}</p>
                  <p>Fee: <strong className="text-emerald-400">₹{doc.opFee}</strong> | Max Patients: {doc.maxPatients}/day</p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => deleteDoctor(doc._id)}
                    className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- OP BOOKINGS MANAGEMENT --- */}
      {activeTab === 'BOOKINGS' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" /> Hospital OP Bookings
          </h3>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Booking ID</th>
                  <th className="p-3.5">Patient Details</th>
                  <th className="p-3.5">Doctor & Dept</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {hospitalBookings.map(b => (
                  <tr key={b._id} className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">#{b.bookingId}</td>
                    <td className="p-3.5 font-medium">
                      <div className="text-white font-bold">{b.userName}</div>
                      <div className="text-slate-400 text-[11px]">{b.userPhone} • {b.patientAge ? `${b.patientAge} yrs, ${b.patientGender || 'M'}` : 'Patient'}</div>
                      {b.patientReason && <div className="text-cyan-400 text-[10px] italic mt-0.5">"{b.patientReason}"</div>}
                    </td>
                    <td className="p-3.5">{b.doctorName} ({b.department})</td>
                    <td className="p-3.5">{b.date} at {b.time}</td>
                    <td className="p-3.5 font-bold">{b.status}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => updateBookingStatus(b._id, 'Confirmed')}
                        className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px]"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          const presc = prompt('Enter Medical Prescription / Doctor Advice Note for patient:');
                          if (presc) {
                            updateBookingStatus(b._id, 'Completed');
                            alert('✅ Medical Prescription attached to patient OP Record!');
                          }
                        }}
                        className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg text-[11px]"
                      >
                        + Prescription
                      </button>
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

      {/* --- REPORTS & EXPORT --- */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" /> {t('reports')}
              </h3>
              <p className="text-xs text-slate-400">Download hospital OP booking reports as PDF or Excel (CSV).</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  printPdfReport(
                    `${hospital.hospitalName} — OP Bookings Report`,
                    ['Booking ID', 'Patient', 'Phone', 'Doctor', 'Department', 'Date', 'Time', 'Fee (₹)', 'Status'],
                    hospitalBookings.map(b => [
                      `#${b.bookingId}`, b.userName, b.userPhone, b.doctorName,
                      b.department, b.date, b.time, b.opFee, b.status
                    ])
                  );
                }}
                className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                <FileText className="w-4 h-4" /> {t('downloadPdf')}
              </button>
              <button
                onClick={() => {
                  downloadCsv(
                    `${hospital.hospitalName}_OP_Bookings_${new Date().toISOString().slice(0, 10)}`,
                    ['Booking ID', 'Patient Name', 'Patient Phone', 'Doctor', 'Department', 'Date', 'Time', 'OP Fee', 'Payment Method', 'Status'],
                    hospitalBookings.map(b => [
                      `#${b.bookingId}`, b.userName, b.userPhone, b.doctorName,
                      b.department, b.date, b.time, b.opFee, b.paymentMethod || 'N/A', b.status
                    ])
                  );
                }}
                className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" /> {t('downloadCsv')}
              </button>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">{t('totalBookings')}</span>
              <span className="text-2xl font-extrabold text-cyan-400 font-outfit">{hospitalBookings.length}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Confirmed</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-outfit">{hospitalBookings.filter(b => b.status === 'Confirmed').length}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Completed</span>
              <span className="text-2xl font-extrabold text-indigo-400 font-outfit">{hospitalBookings.filter(b => b.status === 'Completed').length}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">{t('revenue')}</span>
              <span className="text-2xl font-extrabold text-amber-400 font-outfit">₹{hospitalBookings.reduce((s, b) => s + (b.status !== 'Cancelled' ? b.opFee : 0), 0)}</span>
            </div>
          </div>

          {/* Bookings Preview Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Booking ID</th>
                  <th className="p-3.5">Patient</th>
                  <th className="p-3.5">Doctor & Dept</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Fee</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {hospitalBookings.map(b => (
                  <tr key={b._id} className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-mono text-cyan-400 font-bold">#{b.bookingId}</td>
                    <td className="p-3.5">{b.userName}<br/><span className="text-slate-400">{b.userPhone}</span></td>
                    <td className="p-3.5">{b.doctorName}<br/><span className="text-slate-400">{b.department}</span></td>
                    <td className="p-3.5">{b.date}<br/><span className="text-slate-400">{b.time}</span></td>
                    <td className="p-3.5 font-bold text-emerald-400">₹{b.opFee}</td>
                    <td className="p-3.5 text-slate-400">{b.paymentMethod || 'N/A'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        b.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        b.status === 'Completed' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD DOCTOR MODAL WITH REGISTRATION ID & QUALIFICATIONS --- */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 border border-emerald-500/30 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddDoctorModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-white text-xl flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" /> Add Doctor (Medical License Reg. ID & Qualifications)
            </h3>

            <form onSubmit={handleCreateDoctorSubmit} className="space-y-4 text-xs">
              
              {/* Doctor Full Name */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ravi Kumar, MD"
                  value={docForm.doctorName}
                  onChange={(e) => setDocForm(prev => ({ ...prev, doctorName: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs font-medium"
                  required
                />
              </div>

              {/* Medical Council Registration Number / License ID */}
              <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/30 space-y-1">
                <label className="text-emerald-300 font-bold block flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" /> Medical Council Registration Number / License ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. TSMC/F/88912 or APMC/2021/4401 or MCI-77821"
                  value={docForm.medicalRegistrationNo}
                  onChange={(e) => setDocForm(prev => ({ ...prev, medicalRegistrationNo: e.target.value }))}
                  className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl p-2.5 text-white font-mono text-xs font-bold"
                  required
                />
                <span className="text-[10px] text-slate-400 block">Required by Medical Council to verify doctor's genuine license.</span>
              </div>

              {/* Medical Qualifications Dropdown */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Select Official Medical Qualification Degree</label>
                <select
                  value={docForm.qualificationDegree}
                  onChange={(e) => setDocForm(prev => ({ ...prev, qualificationDegree: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs font-semibold"
                >
                  {OFFICIAL_QUALIFICATIONS.map((q, idx) => (
                    <option key={idx} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              {docForm.qualificationDegree.startsWith('OTHER') && (
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Type Custom Qualification Degree</label>
                  <input
                    type="text"
                    placeholder="e.g. MBBS, Fellowship in Cardiology"
                    value={customQualificationText}
                    onChange={(e) => setCustomQualificationText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white text-xs"
                    required
                  />
                </div>
              )}

              {/* Specialization Category */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Select Specialization Category ({ALL_DOCTOR_CATEGORIES.length} Categories)</label>
                <select
                  value={docForm.specialization}
                  onChange={(e) => setDocForm(prev => ({ ...prev, specialization: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs font-semibold"
                >
                  {ALL_DOCTOR_CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {docForm.specialization.startsWith('OTHER') && (
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
                  <label className="text-emerald-300 font-bold block mb-1">Type Custom Specialization Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Plastic Surgery / Immunologist"
                    value={customSpecialtyText}
                    onChange={(e) => setCustomSpecialtyText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs"
                    required
                  />
                </div>
              )}

              {/* Photo Upload Section */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <label className="text-white font-bold block flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" /> Doctor Photo Upload
                  </span>
                </label>

                <div className="flex gap-4 items-center">
                  <img src={docForm.image} className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg" />
                  <div className="flex-1 space-y-2">
                    <label className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer w-fit">
                      <Upload className="w-3.5 h-3.5" /> Upload Photo from Computer
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

              {/* Fee, Experience, Max Patients */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">OP Fee (₹)</label>
                  <input
                    type="number"
                    value={docForm.opFee}
                    onChange={(e) => setDocForm(prev => ({ ...prev, opFee: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={docForm.experience}
                    onChange={(e) => setDocForm(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Max Patients/Day</label>
                  <input
                    type="number"
                    value={docForm.maxPatients}
                    onChange={(e) => setDocForm(prev => ({ ...prev, maxPatients: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              {/* Days & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Available Days</label>
                  <input
                    type="text"
                    placeholder="Mon - Sat"
                    value={docForm.availableDays}
                    onChange={(e) => setDocForm(prev => ({ ...prev, availableDays: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Available Time</label>
                  <input
                    type="text"
                    placeholder="09:00 AM - 01:00 PM"
                    value={docForm.availableTime}
                    onChange={(e) => setDocForm(prev => ({ ...prev, availableTime: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold py-3.5 rounded-xl text-xs shadow-xl shadow-emerald-500/25"
              >
                Verify & Add Qualified Doctor Profile
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
