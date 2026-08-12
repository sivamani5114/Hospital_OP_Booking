export const initialHospitals = [
  {
    id: 'hosp-1',
    name: 'Apollo Health City',
    city: 'Hyderabad',
    address: 'Jubilee Hills, Road No 72, Hyderabad',
    rating: 4.9,
    licenseNo: 'TS-MED-88491',
    status: 'ACTIVE',
    phone: '+91 98765 43210',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80',
    specialties: ['Cardiology', 'Neurology', 'Pediatrics', 'General Medicine']
  },
  {
    id: 'hosp-2',
    name: 'Sunshine Multi-Speciality Hospital',
    city: 'Vijayawada',
    address: 'MG Road, Opposite Benchmark, Vijayawada',
    rating: 4.8,
    licenseNo: 'AP-MED-55120',
    status: 'ACTIVE',
    phone: '+91 91234 56789',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
    specialties: ['Orthopedics', 'Dermatology', 'Cardiology']
  },
  {
    id: 'hosp-3',
    name: 'KIMS Hospitals & Care Center',
    city: 'Visakhapatnam',
    address: 'Health City, Arilova, Visakhapatnam',
    rating: 4.7,
    licenseNo: 'AP-MED-33901',
    status: 'ACTIVE',
    phone: '+91 99887 76655',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=80',
    specialties: ['Pediatrics', 'Dermatology', 'Neurology']
  }
];

export const initialDoctors = [
  {
    id: 'doc-1',
    hospitalId: 'hosp-1',
    name: 'Dr. Ramesh Chandra, MD',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD, DM (Cardiology - AIIMS)',
    experience: 16,
    fee: 700,
    availableSlots: [
      { id: 'slot-101', time: '09:00 AM - 12:00 PM', maxTokens: 20, currentToken: 7, totalBooked: 12 },
      { id: 'slot-102', time: '05:00 PM - 08:00 PM', maxTokens: 15, currentToken: 0, totalBooked: 5 }
    ],
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'doc-2',
    hospitalId: 'hosp-1',
    name: 'Dr. Ananya Sharma',
    specialty: 'Pediatrics',
    qualification: 'MBBS, DCH, MD (Child Health)',
    experience: 11,
    fee: 500,
    availableSlots: [
      { id: 'slot-103', time: '10:00 AM - 01:00 PM', maxTokens: 25, currentToken: 12, totalBooked: 18 }
    ],
    image: 'https://images.unsplash.com/photo-1594824813566-88855ce783d1?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'doc-3',
    hospitalId: 'hosp-2',
    name: 'Dr. Vikram Reddy',
    specialty: 'Orthopedics',
    qualification: 'MBBS, MS (Ortho), Fellowship (Joint Replacement)',
    experience: 14,
    fee: 650,
    availableSlots: [
      { id: 'slot-104', time: '09:30 AM - 01:00 PM', maxTokens: 20, currentToken: 3, totalBooked: 8 }
    ],
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'doc-4',
    hospitalId: 'hosp-2',
    name: 'Dr. Sneha Verma',
    specialty: 'Dermatology',
    qualification: 'MBBS, MD (Dermatology)',
    experience: 9,
    fee: 600,
    availableSlots: [
      { id: 'slot-105', time: '04:00 PM - 07:30 PM', maxTokens: 15, currentToken: 2, totalBooked: 6 }
    ],
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'doc-5',
    hospitalId: 'hosp-3',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Neurology',
    qualification: 'MBBS, DM (Neurology - NIMHANS)',
    experience: 18,
    fee: 800,
    availableSlots: [
      { id: 'slot-106', time: '11:00 AM - 02:00 PM', maxTokens: 15, currentToken: 5, totalBooked: 10 }
    ],
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80'
  }
];

export const initialBookings = [
  {
    id: 'BK-1001',
    tokenNumber: 8,
    slotId: 'slot-101',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Chandra, MD',
    hospitalId: 'hosp-1',
    hospitalName: 'Apollo Health City',
    patientName: 'Siva Kumar',
    patientAge: 28,
    patientGender: 'Male',
    patientPhone: '+91 98765 12345',
    bookingDate: '2026-08-12',
    slotTime: '09:00 AM - 12:00 PM',
    status: 'IN_CONSULTATION', // PENDING, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW
    paymentStatus: 'PAID',
    amount: 700,
    reason: 'Chest pain & routine ECG checkup'
  },
  {
    id: 'BK-1002',
    tokenNumber: 9,
    slotId: 'slot-101',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Chandra, MD',
    hospitalId: 'hosp-1',
    hospitalName: 'Apollo Health City',
    patientName: 'Lakshmi Narayana',
    patientAge: 54,
    patientGender: 'Male',
    patientPhone: '+91 94401 22334',
    bookingDate: '2026-08-12',
    slotTime: '09:00 AM - 12:00 PM',
    status: 'PENDING',
    paymentStatus: 'PAY_AT_COUNTER',
    amount: 700,
    reason: 'BP consultation & medication review'
  },
  {
    id: 'BK-1003',
    tokenNumber: 13,
    slotId: 'slot-103',
    doctorId: 'doc-2',
    doctorName: 'Dr. Ananya Sharma',
    hospitalId: 'hosp-1',
    hospitalName: 'Apollo Health City',
    patientName: 'Master Ryan',
    patientAge: 5,
    patientGender: 'Male',
    patientPhone: '+91 98480 11223',
    bookingDate: '2026-08-12',
    slotTime: '10:00 AM - 01:00 PM',
    status: 'IN_CONSULTATION',
    paymentStatus: 'PAID',
    amount: 500,
    reason: 'Fever & viral infection'
  }
];

export const initialPrescriptions = [
  {
    id: 'PRES-501',
    bookingId: 'BK-1000',
    doctorName: 'Dr. Ramesh Chandra, MD',
    patientName: 'Siva Kumar',
    date: '2026-08-10',
    diagnosis: 'Mild Hypertension & Tachycardia',
    medicines: [
      { name: 'Telmisartan 40mg', dosage: '1-0-0 (Morning after food)', duration: '30 Days' },
      { name: 'Atorvastatin 10mg', dosage: '0-0-1 (Night before sleep)', duration: '30 Days' },
      { name: 'Ecosprin 75mg', dosage: '0-1-0 (After lunch)', duration: '15 Days' }
    ],
    notes: 'Reduce salt intake. Walk 30 mins daily. Repeat Lipid profile after 1 month.'
  }
];
