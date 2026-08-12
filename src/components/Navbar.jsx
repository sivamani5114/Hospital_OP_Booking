import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from './common/NotificationBell';
import { Stethoscope, LogOut, Globe } from 'lucide-react';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Role Badge */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-outfit">
                CarePulse <span className="text-cyan-400">OP</span>
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                currentUser.role === 'USER' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                currentUser.role === 'HOSPITAL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
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
            <span className="text-xs font-bold text-white">{currentUser.fullName}</span>
            <span className="text-[10px] text-slate-400">{currentUser.phone} • {currentUser.email}</span>
          </div>

          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            title={language === 'EN' ? 'Switch to Telugu' : 'Switch to English'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 hover:border-indigo-400/60 text-indigo-300 hover:text-indigo-200 text-xs font-bold transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            {language === 'EN' ? 'తె Telugu' : 'EN English'}
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> {t('logout')}
          </button>
        </div>

      </div>
    </header>
  );
}
