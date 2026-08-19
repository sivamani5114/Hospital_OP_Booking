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
  
  // Read Portal Type from Environment Variable or URL Query
  const getAppPortalMode = () => {
    // 1. Env variable (Vercel Project specific if set)
    const envPortal = import.meta.env.VITE_PORTAL_TYPE;
    if (envPortal && envPortal !== 'ALL') return envPortal.toUpperCase();

    // 2. URL Search Param ?portal=patient | ?portal=hospital | ?portal=admin
    if (typeof window !== 'undefined' && window.location) {
      const searchParams = new URLSearchParams(window.location.search);
      const paramPortal = searchParams.get('portal');
      if (paramPortal) return paramPortal.toUpperCase();
    }

    // 3. Default: All/Multi-portal selector (Main Portal Choice Landing Page)
    return 'ALL';
  };

  const appPortalMode = getAppPortalMode(); // 'PATIENT' | 'HOSPITAL' | 'ADMIN' | 'ALL'

  // Auth View State: 'PORTAL_SELECT' | 'USER_LOGIN' | 'HOSPITAL_LOGIN' | 'ADMIN_LOGIN' | 'PATIENT_REGISTER' | 'HOSPITAL_REGISTER'
  const [authView, setAuthView] = useState(() => {
    if (appPortalMode === 'PATIENT') return 'USER_LOGIN';
    if (appPortalMode === 'HOSPITAL') return 'HOSPITAL_LOGIN';
    if (appPortalMode === 'ADMIN') return 'ADMIN_LOGIN';
    return 'PORTAL_SELECT';
  });

  const handleBackToPortals = () => {
    setAuthView('PORTAL_SELECT');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white bg-slate-50 text-slate-900">
      <div className="flex-1 flex flex-col w-full">
        <Navbar 
          authView={authView} 
          onNavigate={(view) => setAuthView(view)} 
          appPortalMode={appPortalMode} 
        />
        <Toast />

        {!currentUser ? (
          <div className="flex-1 flex flex-col w-full">
            {authView === 'PORTAL_SELECT' && (
              <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 w-full flex-1 flex items-center justify-center">
                <PortalSelection onSelectPortal={(view) => setAuthView(view)} />
              </main>
            )}

            {authView === 'USER_LOGIN' && (
              <div className="flex-1 w-full flex">
                <UserLogin 
                  onGoBack={handleBackToPortals}
                  onBackToPortals={handleBackToPortals} 
                  onGoToRegister={() => setAuthView('PATIENT_REGISTER')}
                  onGoToHospitalLogin={() => setAuthView('HOSPITAL_LOGIN')}
                  onGoToAdminLogin={() => setAuthView('ADMIN_LOGIN')}
                />
              </div>
            )}

            {authView === 'HOSPITAL_LOGIN' && (
              <div className="flex-1 w-full flex">
                <HospitalLogin 
                  onGoBack={handleBackToPortals} 
                  onBackToPortals={handleBackToPortals}
                  onGoToRegister={() => setAuthView('HOSPITAL_REGISTER')} 
                />
              </div>
            )}

            {authView === 'ADMIN_LOGIN' && (
              <div className="flex-1 w-full flex">
                <AdminLogin 
                  onGoBack={handleBackToPortals} 
                  onBackToPortals={handleBackToPortals} 
                />
              </div>
            )}

            {authView === 'PATIENT_REGISTER' && (
              <div className="flex-1 w-full flex">
                <PatientRegister 
                  onGoToLogin={() => setAuthView('USER_LOGIN')} 
                  onGoToHospitalRegister={() => setAuthView('HOSPITAL_REGISTER')}
                />
              </div>
            )}

            {authView === 'HOSPITAL_REGISTER' && (
              <div className="flex-1 w-full flex">
                <HospitalRegister 
                  onGoToLogin={() => setAuthView('HOSPITAL_LOGIN')} 
                  onGoToPatientRegister={() => setAuthView('PATIENT_REGISTER')}
                />
              </div>
            )}
          </div>
        ) : (
          <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 w-full flex-1">
            {currentUser.role === 'USER' && <UserPortal />}
            {currentUser.role === 'HOSPITAL' && <HospitalPortal />}
            {currentUser.role === 'ADMIN' && <AdminPortal />}
            {currentUser.role !== 'USER' && currentUser.role !== 'HOSPITAL' && currentUser.role !== 'ADMIN' && (
              <AdminPortal />
            )}
          </main>
        )}
      </div>

      {authView === 'PORTAL_SELECT' && (
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 CarePulse Hospital OP Booking System. All rights reserved.</p>
            <div className="flex items-center gap-3 text-slate-600 font-medium">
              <span>Patient App</span> • <span>Hospital App</span> • <span>Super Admin App</span>
            </div>
          </div>
        </footer>
      )}
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
