import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDb } from './DbContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { users, addUser } = useDb();

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('op_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('op_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('op_auth_user');
    }
  }, [currentUser]);

  // LOGIN VALIDATION (Phone + Password)
  const login = (phone, password) => {
    const user = users.find(u => u.phone === phone && u.password === password);

    if (!user) {
      showToast('❌ Invalid phone number or password.', 'error');
      return { success: false, error: 'Invalid phone number or password.' };
    }

    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      showToast('❌ Your account has been deactivated. Please contact admin.', 'error');
      return { success: false, error: 'Account deactivated.' };
    }

    setCurrentUser(user);
    showToast(`✅ Welcome back, ${user.fullName}!`, 'success');
    return { success: true, user };
  };

  // REGISTER USER (PATIENT)
  const registerUser = (patientData) => {
    // 1. Phone number unique check
    const existingPhone = users.find(u => u.phone === patientData.phone);
    if (existingPhone) {
      showToast('❌ Phone number already registered!', 'error');
      return { success: false, error: 'Phone number already registered.' };
    }

    // 2. Email unique check
    const existingEmail = users.find(u => u.email.toLowerCase() === patientData.email.toLowerCase());
    if (existingEmail) {
      showToast('❌ Email address already registered!', 'error');
      return { success: false, error: 'Email address already registered.' };
    }

    // 3. Password match check
    if (patientData.password !== patientData.confirmPassword) {
      showToast('❌ Passwords do not match!', 'error');
      return { success: false, error: 'Passwords do not match.' };
    }

    const newUser = addUser({
      fullName: patientData.fullName,
      phone: patientData.phone,
      email: patientData.email,
      dateOfBirth: patientData.dateOfBirth,
      gender: patientData.gender,
      address: patientData.address,
      password: patientData.password,
      role: 'USER'
    });

    showToast('✅ Registration successful. Please login.', 'success');
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider value={{
      currentUser, setCurrentUser, login, registerUser, logout, toastMessage, showToast
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
