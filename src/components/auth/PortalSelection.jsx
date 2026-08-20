import React from 'react';
import { Stethoscope, User, Building2, ArrowRight, ShieldCheck, CheckCircle2, Lock, Sparkles, Clock, Calendar } from 'lucide-react';

export default function PortalSelection({ onSelectPortal }) {
  return (
    <div className="w-full max-w-full overflow-hidden min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-2.5 sm:p-6 lg:p-10 relative">
      
      {/* Ambient Radial Accent Backdrops (Contained) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full max-w-2xl glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl space-y-6 sm:space-y-8 text-center relative overflow-hidden bg-white">
        
        {/* Top Trust & Verification Banner */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> NABH Verified Healthcare Network
          </span>
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit Encrypted
          </span>
        </div>

        {/* Branding Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 mb-1">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-outfit tracking-tight">
            CarePulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Hospital OP System</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
            Universal Healthcare Outpatient (OP) Booking & Reception Queue Management Network across verified specialty hospitals.
          </p>
        </div>

        {/* 2 Main Portal Selection Cards (Patient & Hospital Desk) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-left">
          
          {/* 1. Patient Portal Entrance */}
          <div 
            onClick={() => onSelectPortal('USER_LOGIN')}
            className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 hover:border-cyan-500/60 space-y-4 cursor-pointer group transition-all relative overflow-hidden bg-white shadow-sm hover:shadow-cyan-500/10"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl text-cyan-700 w-fit group-hover:scale-110 transition-transform shadow-xs">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                Patient Portal
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-cyan-700 transition-colors font-outfit">
                Patient Login
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Book verified doctor OP tokens, view live queue position, make instant UPI payments & print digital tickets.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700 group-hover:text-cyan-800">
              <span>Sign In as Patient</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* 2. Hospital Portal Entrance */}
          <div 
            onClick={() => onSelectPortal('HOSPITAL_LOGIN')}
            className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 hover:border-emerald-500/60 space-y-4 cursor-pointer group transition-all relative overflow-hidden bg-white shadow-sm hover:shadow-emerald-500/10"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 w-fit group-hover:scale-110 transition-transform shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Hospital Desk
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-emerald-700 transition-colors font-outfit">
                Hospital Desk Login
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Manage doctor schedules, call OP queue tokens in real-time, issue digital prescriptions & monitor daily collections.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
              <span>Sign In to Hospital Desk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>

        {/* Live Network Metrics Bar */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-slate-500 text-[10px] block font-semibold">Active Hospitals</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono">100% Verified</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block font-semibold">Queue Waiting</span>
            <span className="text-xs sm:text-sm font-extrabold text-cyan-700 font-mono">Zero Physical Queues</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block font-semibold">Security Protocol</span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-700 font-mono">SHA-256 Encrypted</span>
          </div>
        </div>

      </div>
    </div>
  );
}
