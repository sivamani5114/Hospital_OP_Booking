import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers, initialHospitals, initialDoctors, initialBookings } from '../data/database';

const DbContext = createContext();

export function DbProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('op_db_users');
    let loadedUsers = saved ? JSON.parse(saved) : [...initialUsers];

    // Ensure all default demo users (Patient, Hospital, Admin) are ALWAYS present & accurate
    initialUsers.forEach(initUser => {
      const idx = loadedUsers.findIndex(u => u.phone === initUser.phone || u._id === initUser._id);
      if (idx >= 0) {
        loadedUsers[idx] = { ...initUser, ...loadedUsers[idx], password: initUser.password, role: initUser.role };
      } else {
        loadedUsers.push(initUser);
      }
    });

    return loadedUsers;
  });

  const [hospitals, setHospitals] = useState(() => {
    const saved = localStorage.getItem('op_db_hospitals');
    return saved ? JSON.parse(saved) : initialHospitals;
  });

  const [doctors, setDoctors] = useState(() => {
    const saved = localStorage.getItem('op_db_doctors');
    return saved ? JSON.parse(saved) : initialDoctors;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('op_db_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('op_db_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('op_db_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [prescriptions, setPrescriptions] = useState(() => {
    const saved = localStorage.getItem('op_db_prescriptions');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastLiveSync, setLastLiveSync] = useState(Date.now());

  // ═══ REAL-TIME CROSS-TAB & MULTI-DEVICE BROADCAST CHANNEL ENGINE ═══
  useEffect(() => {
    let liveChannel = null;
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        liveChannel = new BroadcastChannel('carepulse_live_db_sync');
        liveChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'DB_STATE_UPDATE') {
            const { entity } = event.data;
            if (entity === 'ALL' || entity === 'bookings') {
              const b = localStorage.getItem('op_db_bookings');
              if (b) setBookings(JSON.parse(b));
            }
            if (entity === 'ALL' || entity === 'hospitals') {
              const h = localStorage.getItem('op_db_hospitals');
              if (h) setHospitals(JSON.parse(h));
            }
            if (entity === 'ALL' || entity === 'doctors') {
              const d = localStorage.getItem('op_db_doctors');
              if (d) setDoctors(JSON.parse(d));
            }
            if (entity === 'ALL' || entity === 'users') {
              const u = localStorage.getItem('op_db_users');
              if (u) setUsers(JSON.parse(u));
            }
            if (entity === 'ALL' || entity === 'notifications') {
              const n = localStorage.getItem('op_db_notifications');
              if (n) setNotifications(JSON.parse(n));
            }
            if (entity === 'ALL' || entity === 'prescriptions') {
              const p = localStorage.getItem('op_db_prescriptions');
              if (p) setPrescriptions(JSON.parse(p));
            }
            if (entity === 'ALL' || entity === 'reviews') {
              const r = localStorage.getItem('op_db_reviews');
              if (r) setReviews(JSON.parse(r));
            }
            setLastLiveSync(Date.now());
          }
        };
      }
    } catch (e) {
      console.log('BroadcastChannel fallback:', e);
    }

    // Storage Event Listener (Cross-window multi-browser real-time sync)
    const handleStorageChange = (e) => {
      if (e.key === 'op_db_bookings' && e.newValue) setBookings(JSON.parse(e.newValue));
      if (e.key === 'op_db_hospitals' && e.newValue) setHospitals(JSON.parse(e.newValue));
      if (e.key === 'op_db_doctors' && e.newValue) setDoctors(JSON.parse(e.newValue));
      if (e.key === 'op_db_users' && e.newValue) setUsers(JSON.parse(e.newValue));
      if (e.key === 'op_db_notifications' && e.newValue) setNotifications(JSON.parse(e.newValue));
      if (e.key === 'op_db_prescriptions' && e.newValue) setPrescriptions(JSON.parse(e.newValue));
      if (e.key === 'op_db_reviews' && e.newValue) setReviews(JSON.parse(e.newValue));
      setLastLiveSync(Date.now());
    };

    window.addEventListener('storage', handleStorageChange);

    // Periodic Heartbeat Reconciler (Ensures live accuracy every 2.5s)
    const syncInterval = setInterval(() => {
      try {
        const b = localStorage.getItem('op_db_bookings');
        if (b) {
          const parsed = JSON.parse(b);
          setBookings(prev => JSON.stringify(prev) !== b ? parsed : prev);
        }
        const h = localStorage.getItem('op_db_hospitals');
        if (h) {
          const parsed = JSON.parse(h);
          setHospitals(prev => JSON.stringify(prev) !== h ? parsed : prev);
        }
        const d = localStorage.getItem('op_db_doctors');
        if (d) {
          const parsed = JSON.parse(d);
          setDoctors(prev => JSON.stringify(prev) !== d ? parsed : prev);
        }
      } catch (err) {}
    }, 2500);

    return () => {
      if (liveChannel) liveChannel.close();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(syncInterval);
    };
  }, []);

  const broadcastLiveChange = (entity) => {
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const ch = new BroadcastChannel('carepulse_live_db_sync');
        ch.postMessage({ type: 'DB_STATE_UPDATE', entity, timestamp: Date.now() });
        ch.close();
      }
    } catch (e) {}
  };

  // Sync to LocalStorage & Trigger Live Broadcast
  useEffect(() => {
    localStorage.setItem('op_db_users', JSON.stringify(users));
    broadcastLiveChange('users');
  }, [users]);

  useEffect(() => {
    localStorage.setItem('op_db_hospitals', JSON.stringify(hospitals));
    broadcastLiveChange('hospitals');
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem('op_db_doctors', JSON.stringify(doctors));
    broadcastLiveChange('doctors');
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('op_db_bookings', JSON.stringify(bookings));
    broadcastLiveChange('bookings');
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('op_db_reviews', JSON.stringify(reviews));
    broadcastLiveChange('reviews');
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('op_db_notifications', JSON.stringify(notifications));
    broadcastLiveChange('notifications');
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('op_db_prescriptions', JSON.stringify(prescriptions));
    broadcastLiveChange('prescriptions');
  }, [prescriptions]);

  // --- USER CRUD ---
  const addUser = (userData) => {
    const newUser = {
      _id: `usr-${Date.now()}`,
      patientId: userData.patientId || ('CP-PAT-' + Math.floor(100000 + Math.random() * 900000)),
      ...userData,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (id, fields) => {
    setUsers(prev => prev.map(u => u._id === id ? { ...u, ...fields } : u));
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => u._id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u));
  };

  const resetUserPassword = (id, newPassword) => {
    setUsers(prev => prev.map(u => u._id === id ? { ...u, password: newPassword } : u));
  };

  // --- HOSPITAL CRUD ---
  const addHospital = (hospData) => {
    const newHosp = {
      _id: `hosp-${Date.now()}`,
      status: 'APPROVED',
      createdAt: new Date().toISOString().split('T')[0],
      logo: hospData.logo || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80',
      ...hospData
    };
    setHospitals(prev => [newHosp, ...prev]);
    return newHosp;
  };

  const registerHospitalSelf = (hospData, password) => {
    const newHosp = {
      _id: `hosp-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
      logo: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80',
      ...hospData
    };
    setHospitals(prev => [newHosp, ...prev]);

    addUser({
      fullName: `${hospData.hospitalName} Desk`,
      phone: hospData.phone,
      email: hospData.email,
      password: password,
      role: 'HOSPITAL',
      hospitalId: newHosp._id
    });

    return newHosp;
  };

  const updateHospital = (id, fields) => {
    setHospitals(prev => prev.map(h => h._id === id ? { ...h, ...fields } : h));
  };

  const deleteHospital = (id) => {
    setHospitals(prev => prev.filter(h => h._id !== id));
  };

  const approveHospital = (id) => {
    setHospitals(prev => prev.map(h => h._id === id ? { ...h, status: 'APPROVED', rejectionReason: '' } : h));
  };

  const rejectHospital = (id, reason) => {
    setHospitals(prev => prev.map(h => h._id === id ? { ...h, status: 'REJECTED', rejectionReason: reason || 'Documents verification failed.' } : h));
  };

  const toggleHospitalStatus = (id) => {
    setHospitals(prev => prev.map(h => h._id === id ? { ...h, status: h.status === 'ACTIVE' || h.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED' } : h));
  };

  // --- DOCTOR CRUD ---
  const addDoctor = (docData) => {
    const newDoc = {
      _id: `doc-${Date.now()}`,
      status: 'ACTIVE',
      image: docData.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
      ...docData
    };
    setDoctors(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const updateDoctor = (id, fields) => {
    setDoctors(prev => prev.map(d => d._id === id ? { ...d, ...fields } : d));
  };

  const deleteDoctor = (id) => {
    setDoctors(prev => prev.filter(d => d._id !== id));
  };

  const toggleDoctorStatus = (id) => {
    setDoctors(prev => prev.map(d => d._id === id ? { ...d, status: d.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : d));
  };

  // --- BOOKING CRUD ---
  const createBooking = (bookingData) => {
    const newBooking = {
      _id: `bk-${Date.now()}`,
      bookingId: `OP-BK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Confirmed',
      createdAt: new Date().toISOString().split('T')[0],
      ...bookingData
    };
    setBookings(prev => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBookingStatus = (id, newStatus) => {
    setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
  };

  const updateBooking = (id, fields) => {
    setBookings(prev => prev.map(b => b._id === id ? { ...b, ...fields } : b));
  };

  const deleteBooking = (id) => {
    setBookings(prev => prev.filter(b => b._id !== id));
  };

  // --- REVIEWS CRUD ---
  const addReview = (reviewData) => {
    const newReview = {
      _id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      ...reviewData
    };
    setReviews(prev => [newReview, ...prev]);
    // Also update doctor's average rating
    const doctorReviews = [...reviews, newReview].filter(r => r.doctorId === reviewData.doctorId);
    const avgRating = doctorReviews.reduce((s, r) => s + r.stars, 0) / doctorReviews.length;
    setDoctors(prev => prev.map(d => d._id === reviewData.doctorId ? { ...d, avgRating: Math.round(avgRating * 10) / 10, totalReviews: doctorReviews.length } : d));
    return newReview;
  };

  const getReviewsByDoctor = (doctorId) => reviews.filter(r => r.doctorId === doctorId);

  const hasUserReviewedBooking = (bookingId) => reviews.some(r => r.bookingId === bookingId);

  // --- NOTIFICATIONS ---
  const addNotification = (notif) => {
    const newNotif = {
      _id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => setNotifications([]);

  // --- PRESCRIPTIONS ---
  const addPrescription = (prescData) => {
    const newPresc = {
      _id: `presc-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      ...prescData
    };
    setPrescriptions(prev => [newPresc, ...prev]);
    return newPresc;
  };

  const getPrescriptionsByUser = (userId, userPhone) => {
    return prescriptions.filter(p => p.userId === userId || p.userPhone === userPhone);
  };

  const getPrescriptionsByBooking = (bookingId) => {
    return prescriptions.filter(p => p.bookingId === bookingId);
  };

  return (
    <DbContext.Provider value={{
      users, addUser, updateUser, deleteUser, toggleUserStatus, resetUserPassword,
      hospitals, addHospital, registerHospitalSelf, updateHospital, deleteHospital, approveHospital, rejectHospital, toggleHospitalStatus,
      doctors, addDoctor, updateDoctor, deleteDoctor, toggleDoctorStatus,
      bookings, createBooking, updateBookingStatus, updateBooking, deleteBooking,
      reviews, addReview, getReviewsByDoctor, hasUserReviewedBooking,
      notifications, addNotification, markNotificationRead, clearNotifications,
      prescriptions, addPrescription, getPrescriptionsByUser, getPrescriptionsByBooking,
      lastLiveSync, broadcastLiveChange
    }}>
      {children}
    </DbContext.Provider>
  );
}

export function useDb() {
  return useContext(DbContext);
}
