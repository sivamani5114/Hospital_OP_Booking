import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from './common/NotificationBell';
import { Stethoscope, LogOut, Globe, ShieldCheck } from 'lucide-react';

export default function Navbar({ authView, onNavigate, appPortalMode = 'ALL' }) {
  const { currentUser, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  // If not logged in, render the Portal Header
  if (!currentUser) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 px-4 lg:px-8 py-3 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => onNavigate && onNavigate('PORTAL_SELECT')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className={`h-10 w-10 rounded-xl p-0.5 shadow-md group-hover:scale-105 transition-transform ${
              appPortalMode === 'HOSPITAL' ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/20' :
              appPortalMode === 'ADMIN' ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-indigo-500/20' :
              'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/20'
            }`}>
              <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center">
                <Stethoscope className={`w-5 h-5 ${
                  appPortalMode === 'HOSPITAL' ? 'text-emerald-600' :
                  appPortalMode === 'ADMIN' ? 'text-indigo-600' :
                  'text-cyan-600'
                }`} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 font-outfit tracking-tight">
                CarePulse <span className={
                  appPortalMode === 'HOSPITAL' ? 'text-emerald-600' :
                  appPortalMode === 'ADMIN' ? 'text-indigo-600' :
                  'text-cyan-600'
                }>OP</span>
              </h1>
              <p className="text-[10px] text-slate-500 hidden sm:block font-medium">
                {appPortalMode === 'PATIENT' ? 'Online Patient OP Booking Network' :
                 appPortalMode === 'HOSPITAL' ? 'Hospital OP Queue & Doctor Management' :
                 appPortalMode === 'ADMIN' ? 'Super Admin Command & Verification Center' :
                 'Multi-Portal Hospital OP Booking Network'}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Super Admin Login Button - ONLY VISIBLE ON MAIN LANDING PAGE */}
            {authView === 'PORTAL_SELECT' && (
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('ADMIN_LOGIN')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 border border-indigo-200"
                title="Super Admin Master Control Login"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin Login</span>
              </button>
            )}

            {/* Language Toggle Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              title={language === 'EN' ? 'Switch to Telugu' : 'Switch to English'}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-600" />
              {language === 'EN' ? 'తె' : 'EN'}
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 px-4 lg:px-8 py-3.5 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Role Badge */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/20">
            <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-outfit">
                CarePulse <span className="text-cyan-600">OP</span>
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                currentUser.role === 'USER' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                currentUser.role === 'HOSPITAL' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {currentUser.role === 'USER' ? 'PATIENT PORTAL' : currentUser.role === 'HOSPITAL' ? 'HOSPITAL PORTAL' : 'ADMIN PORTAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: NotificationBell + Lang Toggle + User Info + Logout */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900">{currentUser.fullName}</span>
            <span className="text-[10px] text-slate-500 font-medium">{currentUser.phone} • {currentUser.email}</span>
          </div>

          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            title={language === 'EN' ? 'Switch to Telugu' : 'Switch to English'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:border-indigo-300 text-indigo-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            {language === 'EN' ? 'తె Telugu' : 'EN English'}
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" /> {t('logout')}
          </button>
        </div>

      </div>
    </header>
  );
}
