import React from 'react';
import { useApp } from '../context/AppContext';
import { Stethoscope, User, Building2, ShieldCheck, LogOut, ArrowLeft, Activity } from 'lucide-react';

export default function Header() {
  const { currentRoute, navigateTo, currentUser, logout } = useApp();

  if (currentRoute === '/login') return null; // Don't show header on login page

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 px-4 lg:px-8 py-3.5 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Current Page Badge */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => navigateTo('/login')}
            className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-outfit">
                CarePulse <span className="text-cyan-400">OP</span>
              </h1>

              {currentRoute === '/patient' && (
                <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <User className="w-3 h-3" /> PATIENT PORTAL
                </span>
              )}

              {currentRoute === '/hospital' && (
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> HOSPITAL DESK
                </span>
              )}

              {currentRoute === '/admin' && (
                <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SUPER ADMIN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User Info & Logout Button */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400">{currentUser.email}</span>
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-all"
            title="Logout and return to Login page"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Portal / Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}
