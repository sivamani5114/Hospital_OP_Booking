import React, { useState } from 'react';
import { DbProvider } from './context/DbContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Toast from './components/common/Toast';
import PortalSelection from './components/auth/PortalSelection';
import UserLogin from './components/auth/UserLogin';
import HospitalLogin from './components/auth/HospitalLogin';
import AdminLogin from './components/auth/AdminLogin';
import PatientRegister from './components/auth/PatientRegister';
import HospitalRegister from './components/auth/HospitalRegister';
import UserPortal from './components/user/UserPortal';
import HospitalPortal from './components/hospital/HospitalPortal';
import AdminPortal from './components/admin/AdminPortal';

import ErrorBoundary from './components/common/ErrorBoundary';

function MainApp() {
  const { currentUser } = useAuth();
  
  // Auth View State: 'PORTAL_SELECT' | 'USER_LOGIN' | 'HOSPITAL_LOGIN' | 'ADMIN_LOGIN' | 'PATIENT_REGISTER' | 'HOSPITAL_REGISTER'
  const [authView, setAuthView] = useState('PORTAL_SELECT');

  const handleBackToPortals = () => {
    setAuthView('PORTAL_SELECT');
  };

  // Dynamic theme class:
  // Patient -> 'theme-patient' (Crisp Light Medical)
  // Hospital -> 'theme-hospital' (Crisp Light Clinical Emerald)
  // Super Admin -> 'theme-admin' (Deep Futuristic Dark Command Center)
  const currentTheme = currentUser ? (
    currentUser.role === 'ADMIN' ? 'theme-admin' :
    currentUser.role === 'HOSPITAL' ? 'theme-hospital' :
    'theme-patient'
  ) : (
    authView === 'ADMIN_LOGIN' ? 'theme-admin' :
    authView === 'HOSPITAL_LOGIN' || authView === 'HOSPITAL_REGISTER' ? 'theme-hospital' :
    authView === 'USER_LOGIN' || authView === 'PATIENT_REGISTER' ? 'theme-patient' :
    'theme-patient'
  );

  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white ${currentTheme}`}>
      <div>
        <Navbar authView={authView} onNavigate={(view) => setAuthView(view)} />
        <Toast />

        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          {!currentUser ? (
            <>
              {authView === 'PORTAL_SELECT' && (
                <PortalSelection onSelectPortal={(view) => setAuthView(view)} />
              )}

              {authView === 'USER_LOGIN' && (
                <UserLogin 
                  onGoBack={handleBackToPortals}
                  onBackToPortals={handleBackToPortals} 
                  onGoToRegister={() => setAuthView('PATIENT_REGISTER')}
                  onGoToHospitalLogin={() => setAuthView('HOSPITAL_LOGIN')}
                  onGoToAdminLogin={() => setAuthView('ADMIN_LOGIN')}
                />
              )}

              {authView === 'HOSPITAL_LOGIN' && (
                <HospitalLogin 
                  onGoBack={handleBackToPortals} 
                  onBackToPortals={handleBackToPortals}
                  onGoToRegister={() => setAuthView('HOSPITAL_REGISTER')} 
                />
              )}

              {authView === 'ADMIN_LOGIN' && (
                <AdminLogin 
                  onGoBack={handleBackToPortals} 
                  onBackToPortals={handleBackToPortals} 
                />
              )}

              {authView === 'PATIENT_REGISTER' && (
                <PatientRegister 
                  onGoToLogin={() => setAuthView('USER_LOGIN')} 
                  onGoToHospitalRegister={() => setAuthView('HOSPITAL_REGISTER')}
                />
              )}

              {authView === 'HOSPITAL_REGISTER' && (
                <HospitalRegister 
                  onGoToLogin={() => setAuthView('HOSPITAL_LOGIN')} 
                  onGoToPatientRegister={() => setAuthView('PATIENT_REGISTER')}
                />
              )}
            </>
          ) : (
            <>
              {currentUser.role === 'USER' && <UserPortal />}
              {currentUser.role === 'HOSPITAL' && <HospitalPortal />}
              {currentUser.role === 'ADMIN' && <AdminPortal />}
              {currentUser.role !== 'USER' && currentUser.role !== 'HOSPITAL' && currentUser.role !== 'ADMIN' && (
                <AdminPortal />
              )}
            </>
          )}
        </main>
      </div>

      <footer className="border-t border-slate-900 glass-panel py-4 text-center text-xs text-slate-500 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 CarePulse Hospital OP Booking System. All rights reserved.</p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Patient App</span> • <span>Hospital App</span> • <span>Super Admin App</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DbProvider>
        <AuthProvider>
          <LanguageProvider>
            <MainApp />
          </LanguageProvider>
        </AuthProvider>
      </DbProvider>
    </ErrorBoundary>
  );
}
