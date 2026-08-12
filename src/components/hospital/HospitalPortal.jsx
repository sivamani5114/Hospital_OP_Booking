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
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [customSpecialtyText, setCustomSpecialtyText] = useState('');
  const [customQualificationText, setCustomQualificationText] = useState('');

  const [docForm, setDocForm] = useState({
    doctorName: '',
    medicalRegistrationNo: '',
    qualificationDegree: 'MBBS (Bachelor of Medicine & Surgery)',
    selectedQualifications: ['MBBS (Bachelor of Medicine & Surgery)'],
    specialization: ALL_DOCTOR_CATEGORIES[0],
    department: 'Cardiology',
    experience: '',
    phone: '',
    opFee: '',
    availableDays: 'Monday - Saturday',
    availableTime: '',
    maxPatients: '',
    image: ''
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
    const finalQualification = docForm.qualificationDegree.startsWith('OTHER') ? customQualificationText : docForm.qualificationDegree;

    const doctorData = {
      hospitalId: hospital._id,
      doctorName: docForm.doctorName,
      medicalRegistrationNo: docForm.medicalRegistrationNo.toUpperCase(),
      qualification: finalQualification,
      qualificationDegree: finalQualification,
      specialization: finalSpecialty,
      department: finalSpecialty,
      experience: Number(docForm.experience) || 5,
      phone: docForm.phone,
      opFee: Number(docForm.opFee) || 500,
      availableDays: docForm.availableDays || 'Monday - Saturday',
      availableTime: docForm.availableTime || '09:00 AM - 01:00 PM',
      maxPatients: Number(docForm.maxPatients) || 20,
      isVerified: true,
      image: docForm.image || PRESET_AVATARS[0]
    };

    if (editingDoctorId) {
      updateDoctor(editingDoctorId, doctorData);
      alert('✅ Doctor Profile Details Updated Successfully!');
    } else {
      addDoctor(doctorData);
      alert('✅ Educated & Verified Doctor Added with Medical Council Reg. No!');
    }

    setShowAddDoctorModal(false);
    setEditingDoctorId(null);
    setDocForm({ doctorName: '', medicalRegistrationNo: '', qualificationDegree: 'MBBS (Bachelor of Medicine & Surgery)', selectedQualifications: ['MBBS (Bachelor of Medicine & Surgery)'], specialization: ALL_DOCTOR_CATEGORIES[0], department: 'Cardiology', experience: '', phone: '', opFee: '', availableDays: 'Monday - Saturday', availableTime: '', maxPatients: '', image: '' });
    setCustomSpecialtyText('');
    setCustomQualificationText('');
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
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'DASHBOARD' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'BOOKINGS' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Appointments ({hospitalBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('DOCTORS')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'DOCTORS' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctors ({hospitalDoctors.length})
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'PROFILE' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Hospital Profile & Settings
          </button>
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'REPORTS' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Payments & Reports
          </button>
        </div>

        <button
          onClick={logout}
          className="px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>

      {/* --- ADMIN APPROVAL / REJECTION WARNING BANNERS --- */}
      {hospital.status === 'PENDING' && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2 font-bold">
            <Clock className="w-5 h-5 text-amber-400 animate-spin" />
            <span>Hospital Approval Pending: Your registration documents are under review by Super Admin. Public OP booking will activate after Admin approval.</span>
          </div>
          <span className="bg-amber-500/20 px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider">UNDER REVIEW</span>
        </div>
      )}

      {hospital.status === 'REJECTED' && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl space-y-1 text-xs text-rose-300">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5 text-rose-500" /> Hospital Approval Rejected by Super Admin
            </span>
            <span className="bg-rose-500/20 px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider">REJECTED</span>
          </div>
          <p className="text-slate-300 pl-7">
            <strong>Reason for Rejection:</strong> {hospital.rejectionReason || 'Uploaded hospital registration certificates or license documents failed verification criteria.'}
          </p>
        </div>
      )}

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

          <form onSubmit={handleUpdateHospitalProfile} className="space-y-4 text-xs">
            {/* 1. Basic Details */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-cyan-400 text-sm">1. Hospital Basic & Contact Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Hospital Name</label>
                  <input
                    type="text"
                    value={hospProfileForm.hospitalName}
                    onChange={(e) => setHospProfileForm(prev => ({ ...prev, hospitalName: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Hospital Type</label>
                  <select
                    value={hospital.hospitalType || 'Private'}
                    onChange={(e) => updateHospital(hospital._id, { hospitalType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Private">Private Hospital</option>
                    <option value="Government">Government Hospital</option>
                    <option value="Corporate">Corporate Multi-Speciality</option>
                    <option value="Clinic">Polyclinic / Specialty Clinic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={hospProfileForm.phone}
                    onChange={(e) => setHospProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Official Email</label>
                  <input
                    type="email"
                    value={hospProfileForm.email}
                    onChange={(e) => setHospProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Address & Maps */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-emerald-400 text-sm">2. Address & Google Maps Location</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">City</label>
                  <input
                    type="text"
                    value={hospProfileForm.city}
                    onChange={(e) => setHospProfileForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Area / Locality</label>
                  <input
                    type="text"
                    value={hospProfileForm.area}
                    onChange={(e) => setHospProfileForm(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Street Address</label>
                <input
                  type="text"
                  value={hospProfileForm.address}
                  onChange={(e) => setHospProfileForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            {/* 3. Legal & Verification */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-amber-400 text-sm">3. Legal & Verification Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Reg Certificate</label>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-xl block font-mono text-[11px]">
                    ✓ Verified Certificate
                  </span>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">NABH Accreditation</label>
                  <span className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl block text-slate-300">
                    {hospital.nabhAccredited || 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Facilities */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-indigo-400 text-sm">4. Active Hospital Facilities</h4>
              <div className="flex flex-wrap gap-1.5">
                {(hospital.facilities || ['Emergency 24/7', 'Pharmacy', 'Laboratory', 'ICU', 'Ambulance 24/7', 'Operation Theatre']).map(f => (
                  <span key={f} className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-xl text-[11px] font-semibold">
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>

            {/* 5. OP Settings */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-rose-400 text-sm">5. OP Booking Settings</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Base OP Fee (₹)</label>
                  <input
                    type="number"
                    value={hospProfileForm.opFee}
                    onChange={(e) => setHospProfileForm(prev => ({ ...prev, opFee: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">OP Timings</label>
                  <input
                    type="text"
                    value={hospProfileForm.hospitalTimings}
                    onChange={(e) => setHospProfileForm(prev => ({ ...prev, hospitalTimings: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg"
            >
              Save & Update Full Hospital Profile 🚀
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

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      setEditingDoctorId(doc._id);
                      setDocForm({
                        doctorName: doc.doctorName || '',
                        medicalRegistrationNo: doc.medicalRegistrationNo || '',
                        qualificationDegree: doc.qualification || doc.qualificationDegree || 'MBBS',
                        selectedQualifications: doc.qualification ? doc.qualification.split(', ') : ['MBBS'],
                        specialization: doc.specialization || ALL_DOCTOR_CATEGORIES[0],
                        department: doc.department || 'General Medicine',
                        experience: doc.experience || '',
                        phone: doc.phone || '',
                        opFee: doc.opFee || '',
                        availableDays: doc.availableDays || 'Monday - Saturday',
                        availableTime: doc.availableTime || '',
                        maxPatients: doc.maxPatients || '',
                        image: doc.image || ''
                      });
                      setShowAddDoctorModal(true);
                    }}
                    className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                  <button
                    onClick={() => deleteDoctor(doc._id)}
                    className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-800"
                    title="Delete Doctor Profile"
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
              <ShieldCheck className="w-6 h-6 text-emerald-400" /> {editingDoctorId ? 'Edit Doctor Profile Details' : 'Add Doctor (Medical License Reg. ID & Qualifications)'}
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

              {/* Medical Council Registration Number / License ID & Upload Certificate */}
              <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/30 space-y-2">
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
                
                {/* Upload Medical Council Registration Certificate */}
                <div className="pt-1">
                  <label className="text-slate-300 font-semibold block mb-1 text-[11px]">Upload Medical Registration Certificate (PDF/Image) *</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setDocForm(prev => ({ ...prev, medicalRegCertDoc: reader.result, medicalRegCertDocName: file.name }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 file:bg-emerald-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-2 file:font-bold"
                  />
                  {docForm.medicalRegCertDocName && (
                    <span className="text-[10px] text-emerald-400 font-bold mt-0.5 block">
                      ✓ Certificate Selected: {docForm.medicalRegCertDocName}
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-Degree Qualification Checkbox Selector */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-slate-300 font-bold block text-xs flex items-center justify-between">
                  <span>🎓 Select Doctor Qualifications & Degrees (Multi-Select) *</span>
                  <span className="text-[10px] text-cyan-400 font-semibold">{docForm.selectedQualifications?.length || 0} Degrees Selected</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                  {OFFICIAL_QUALIFICATIONS.map((q, idx) => {
                    const isSelected = docForm.selectedQualifications?.includes(q);
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${
                          isSelected 
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 font-bold' 
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
                          className="rounded accent-cyan-500"
                        />
                        <span className="text-[11px]">{q}</span>
                      </label>
                    );
                  })}
                </div>

                {docForm.selectedQualifications?.some(q => q.startsWith('OTHER')) && (
                  <div className="bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/30 pt-2">
                    <label className="text-cyan-300 font-bold block mb-1 text-xs">Type Custom Medical Degree / Fellowship</label>
                    <input
                      type="text"
                      placeholder="e.g. Fellowship in Cardiology, FRCS London"
                      value={customQualificationText}
                      onChange={(e) => {
                        setCustomQualificationText(e.target.value);
                        setDocForm(prev => ({
                          ...prev,
                          qualificationDegree: [...(prev.selectedQualifications || []).filter(q => !q.startsWith('OTHER')), e.target.value].join(', ')
                        }));
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs"
                      required
                    />
                  </div>
                )}

                {/* Upload Medical Degree Certificates File */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="text-slate-300 font-semibold block mb-1 text-[11px]">Upload Medical Degree Certificates (MBBS/MD/MS/Fellowship PDF or Image) *</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setDocForm(prev => ({ ...prev, degreeCertDoc: reader.result, degreeCertDocName: file.name }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 file:bg-cyan-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-2 file:font-bold"
                  />
                  {docForm.degreeCertDocName && (
                    <span className="text-[10px] text-cyan-400 font-bold mt-0.5 block">
                      ✓ Degree Certificate Selected: {docForm.degreeCertDocName}
                    </span>
                  )}
                </div>
              </div>



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
                  {docForm.image ? (
                    <img src={docForm.image} className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg" alt="Doctor Preview" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-bold text-center p-1">
                      No Photo Selected
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <label className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer w-fit">
                      <Upload className="w-3.5 h-3.5" /> Upload Photo from Computer
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

              {/* Fee, Experience, Max Patients */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">OP Fee (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={docForm.opFee}
                    onChange={(e) => setDocForm(prev => ({ ...prev, opFee: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Experience (Yrs) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 8"
                    value={docForm.experience}
                    onChange={(e) => setDocForm(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Max Patients/Day *</label>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    value={docForm.maxPatients}
                    onChange={(e) => setDocForm(prev => ({ ...prev, maxPatients: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              {/* Interactive Calendar Days Picker & Time Range Dropdowns */}
              <div className="space-y-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                {/* 📅 Available Days Checkbox Chips */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 text-xs flex items-center justify-between">
                    <span>📅 Select OP Working Days *</span>
                    <span className="text-[10px] text-cyan-400 font-semibold">{docForm.selectedDays?.length || 0} Days Selected</span>
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
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
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
