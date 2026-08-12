import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialHospitals, initialDoctors, initialBookings, initialPrescriptions } from '../data/initialData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation Route State: '/login' | '/patient' | '/hospital' | '/admin'
  const [currentRoute, setCurrentRoute] = useState(() => {
    return window.location.pathname !== '/' ? window.location.pathname : '/login';
  });

  // Logged-in User State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('op_current_user');
    return saved ? JSON.parse(saved) : null; // null means logged out
  });

  // Core App Data (stored in state & local storage)
  const [hospitals, setHospitals] = useState(() => {
    const saved = localStorage.getItem('op_hospitals');
    return saved ? JSON.parse(saved) : initialHospitals;
  });

  const [doctors, setDoctors] = useState(() => {
    const saved = localStorage.getItem('op_doctors');
    return saved ? JSON.parse(saved) : initialDoctors;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('op_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [prescriptions, setPrescriptions] = useState(() => {
    const saved = localStorage.getItem('op_prescriptions');
    return saved ? JSON.parse(saved) : initialPrescriptions;
  });

  // Selected Doctor for Queue Counter (Hospital Portal)
  const [selectedDoctorForDesk, setSelectedDoctorForDesk] = useState('doc-1');

  // Digital Ticket Modal State
  const [activeDigitalTicket, setActiveDigitalTicket] = useState(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('op_hospitals', JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem('op_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('op_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('op_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('op_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('op_current_user');
    }
  }, [currentUser]);

  // Navigate helper
  const navigateTo = (path) => {
    setCurrentRoute(path);
    window.history.pushState({}, '', path);
  };

  // --- AUTHENTICATION METHODS ---
  const login = (role, userData) => {
    const userObj = {
      role: role, // 'PATIENT' | 'HOSPITAL' | 'ADMIN'
      name: userData?.name || (role === 'PATIENT' ? 'Siva Kumar' : role === 'HOSPITAL' ? 'Apollo Admin Desk' : 'System Super Admin'),
      email: userData?.email || `${role.toLowerCase()}@carepulse.com`,
      hospitalId: userData?.hospitalId || 'hosp-1'
    };
    setCurrentUser(userObj);

    if (role === 'PATIENT') navigateTo('/patient');
    else if (role === 'HOSPITAL') navigateTo('/hospital');
    else if (role === 'ADMIN') navigateTo('/admin');
  };

  const logout = () => {
    setCurrentUser(null);
    navigateTo('/login');
  };

  // --- ACTIONS & CRUD METHODS ---
  const createBooking = (newBookingData) => {
    const doctor = doctors.find(d => d.id === newBookingData.doctorId);
    const hospital = hospitals.find(h => h.id === newBookingData.hospitalId);

    const doctorBookings = bookings.filter(b => b.doctorId === newBookingData.doctorId && b.slotId === newBookingData.slotId);
    const tokenNumber = doctorBookings.length + 1;

    const newBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      tokenNumber: tokenNumber,
      slotId: newBookingData.slotId,
      doctorId: newBookingData.doctorId,
      doctorName: doctor ? doctor.name : 'Doctor',
      hospitalId: newBookingData.hospitalId,
      hospitalName: hospital ? hospital.name : 'Hospital',
      patientName: newBookingData.patientName,
      patientAge: Number(newBookingData.patientAge),
      patientGender: newBookingData.patientGender,
      patientPhone: newBookingData.patientPhone,
      bookingDate: newBookingData.bookingDate || new Date().toISOString().split('T')[0],
      slotTime: newBookingData.slotTime,
      status: 'PENDING',
      paymentStatus: newBookingData.paymentMethod === 'ONLINE' ? 'PAID' : 'PAY_AT_COUNTER',
      amount: doctor ? doctor.fee : 500,
      reason: newBookingData.reason || 'General OP Consultation'
    };

    setBookings(prev => [newBooking, ...prev]);

    setDoctors(prevDocs => prevDocs.map(doc => {
      if (doc.id === newBookingData.doctorId) {
        return {
          ...doc,
          availableSlots: doc.availableSlots.map(slot => {
            if (slot.id === newBookingData.slotId) {
              return { ...slot, totalBooked: slot.totalBooked + 1 };
            }
            return slot;
          })
        };
      }
      return doc;
    }));

    setActiveDigitalTicket(newBooking);
    return newBooking;
  };

  const callNextToken = (doctorId, slotId) => {
    setDoctors(prevDocs => prevDocs.map(doc => {
      if (doc.id === doctorId) {
        return {
          ...doc,
          availableSlots: doc.availableSlots.map(slot => {
            if (slot.id === slotId) {
              const nextToken = slot.currentToken + 1;

              setBookings(prevBookings => prevBookings.map(b => {
                if (b.doctorId === doctorId && b.slotId === slotId && b.tokenNumber === nextToken) {
                  return { ...b, status: 'IN_CONSULTATION' };
                }
                if (b.doctorId === doctorId && b.slotId === slotId && b.tokenNumber === slot.currentToken) {
                  return { ...b, status: 'COMPLETED' };
                }
                return b;
              }));

              return { ...slot, currentToken: nextToken };
            }
            return slot;
          })
        };
      }
      return doc;
    }));
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
  };

  const addPrescription = (presData) => {
    const newPres = {
      id: `PRES-${Math.floor(500 + Math.random() * 900)}`,
      bookingId: presData.bookingId,
      doctorName: presData.doctorName,
      patientName: presData.patientName,
      date: new Date().toISOString().split('T')[0],
      diagnosis: presData.diagnosis,
      medicines: presData.medicines,
      notes: presData.notes
    };
    setPrescriptions(prev => [newPres, ...prev]);
    updateBookingStatus(presData.bookingId, 'COMPLETED');
  };

  const addHospital = (hosp) => {
    const newHosp = { ...hosp, id: `hosp-${Date.now()}`, rating: 4.5, status: 'ACTIVE' };
    setHospitals(prev => [...prev, newHosp]);
  };

  const updateHospital = (id, updatedFields) => {
    setHospitals(prev => prev.map(h => h.id === id ? { ...h, ...updatedFields } : h));
  };

  const deleteHospital = (id) => {
    setHospitals(prev => prev.filter(h => h.id !== id));
  };

  const addDoctor = (doc) => {
    const newDoc = {
      ...doc,
      id: `doc-${Date.now()}`,
      availableSlots: [
        { id: `slot-${Date.now()}`, time: '09:00 AM - 01:00 PM', maxTokens: 25, currentToken: 0, totalBooked: 0 }
      ]
    };
    setDoctors(prev => [...prev, newDoc]);
  };

  const updateDoctor = (id, updatedFields) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));
  };

  const deleteDoctor = (id) => {
    setDoctors(prev => prev.filter(d => d.id !== id));
  };

  return (
    <AppContext.Provider value={{
      currentRoute, navigateTo,
      currentUser, login, logout,
      hospitals, addHospital, updateHospital, deleteHospital,
      doctors, addDoctor, updateDoctor, deleteDoctor,
      bookings, createBooking, updateBookingStatus, callNextToken,
      prescriptions, addPrescription,
      selectedDoctorForDesk, setSelectedDoctorForDesk,
      activeDigitalTicket, setActiveDigitalTicket
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
