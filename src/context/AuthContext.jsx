import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDb } from './DbContext';
import { sanitizeInput, checkRateLimit, recordFailedAttempt, resetRateLimit, logSecurityEvent } from '../utils/securityEngine';

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

  // LOGIN VALIDATION (With Cyber Security Rate Limiting & Anti-Brute-Force Shield)
  const login = (phone, password) => {
    const cleanPhone = sanitizeInput(phone || '').replace(/[^0-9]/g, '').slice(-10);

    // 1. Check Rate Limiter for Brute-Force Defense
    const rateCheck = checkRateLimit(cleanPhone);
    if (!rateCheck.allowed) {
      showToast(rateCheck.message, 'error');
      return { success: false, error: rateCheck.message };
    }

    const user = users.find(u => u.phone === cleanPhone && u.password === password);

    if (!user) {
      const failInfo = recordFailedAttempt(cleanPhone);
      const remaining = 5 - (failInfo.attempts || 0);
      if (remaining > 0) {
        showToast(`❌ Invalid credentials. (${remaining} attempt(s) remaining before security lockout)`, 'error');
      } else {
        showToast('🚫 Account temporarily locked for 15 minutes due to multiple failed attempts.', 'error');
      }
      return { success: false, error: 'Invalid phone number or password.' };
    }

    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      logSecurityEvent('BLOCKED_LOGIN_ATTEMPT', `Deactivated user +91 ${cleanPhone} attempted sign in.`, 'WARNING');
      showToast('❌ Your account has been suspended by Administration.', 'error');
      return { success: false, error: 'Account deactivated.' };
    }

    // Reset rate limiter on successful authentication
    resetRateLimit(cleanPhone);
    setCurrentUser(user);
    logSecurityEvent('AUTH_LOGIN_SUCCESS', `User [${user.fullName}] signed in as ${user.role}.`, 'INFO');
    showToast(`✅ Welcome back, ${user.fullName}!`, 'success');
    return { success: true, user };
  };

  // REGISTER USER (With Input Sanitization)
  const registerUser = (patientData) => {
    const cleanFullName = sanitizeInput(patientData.fullName);
    const cleanPhone = sanitizeInput(patientData.phone).replace(/[^0-9]/g, '').slice(-10);
    const cleanEmail = sanitizeInput(patientData.email).toLowerCase();
    const cleanAddress = sanitizeInput(patientData.address);

    // 1. Phone number unique check
    const existingPhone = users.find(u => u.phone === cleanPhone);
    if (existingPhone) {
      showToast('❌ Phone number already registered!', 'error');
      return { success: false, error: 'Phone number already registered.' };
    }

    // 2. Email unique check
    const existingEmail = users.find(u => u.email.toLowerCase() === cleanEmail);
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
      fullName: cleanFullName,
      phone: cleanPhone,
      email: cleanEmail,
      dateOfBirth: patientData.dateOfBirth,
      gender: patientData.gender,
      address: cleanAddress,
      password: patientData.password,
      role: 'USER'
    });

    logSecurityEvent('PATIENT_REGISTERED', `New patient account created for +91 ${cleanPhone} (${cleanFullName}).`, 'INFO');
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
