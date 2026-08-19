import React from 'react';
import { Stethoscope, User, Building2, ArrowRight, ShieldCheck, CheckCircle2, Lock, Sparkles, Clock, Calendar } from 'lucide-react';

export default function PortalSelection({ onSelectPortal }) {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative">
      
      {/* Ambient Radial Accent Backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full max-w-2xl glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl space-y-8 text-center relative overflow-hidden">
        
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
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-outfit tracking-tight">
            CarePulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Hospital OP System</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Universal Healthcare Outpatient (OP) Booking & Reception Queue Management Network across verified specialty hospitals.
          </p>
        </div>

        {/* 2 Main Portal Selection Cards (Patient & Hospital Desk) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
          
          {/* 1. Patient Portal Entrance */}
          <div 
            onClick={() => onSelectPortal('USER_LOGIN')}
            className="glass-card p-6 rounded-2xl border border-slate-800/90 hover:border-cyan-500/50 space-y-4 cursor-pointer group transition-all relative overflow-hidden bg-slate-900/50 hover:bg-slate-900/80 shadow-lg hover:shadow-cyan-500/15"
          >
            <div className="flex items-center justify-between">
              <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 w-fit group-hover:scale-110 transition-transform shadow-md">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                Patient Portal
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-white text-lg group-hover:text-cyan-400 transition-colors font-outfit">
                Patient Login
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-snug">
                Book verified doctor OP tokens, view live queue position, make instant UPI payments & print digital tickets.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
              <span>Sign In as Patient</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* 2. Hospital Portal Entrance */}
          <div 
            onClick={() => onSelectPortal('HOSPITAL_LOGIN')}
            className="glass-card p-6 rounded-2xl border border-slate-800/90 hover:border-emerald-500/50 space-y-4 cursor-pointer group transition-all relative overflow-hidden bg-slate-900/50 hover:bg-slate-900/80 shadow-lg hover:shadow-emerald-500/15"
          >
            <div className="flex items-center justify-between">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 w-fit group-hover:scale-110 transition-transform shadow-md">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Hospital Desk
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-white text-lg group-hover:text-emerald-400 transition-colors font-outfit">
                Hospital Desk Login
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-snug">
                Manage doctor schedules, call OP queue tokens in real-time, issue digital prescriptions & monitor daily collections.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>Sign In to Hospital Desk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>

        {/* Live Network Metrics Bar */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block font-semibold">Active Hospitals</span>
            <span className="text-sm font-extrabold text-white font-mono">100% CEA Verified</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-semibold">Queue Waiting Time</span>
            <span className="text-sm font-extrabold text-cyan-400 font-mono">Zero Physical Queues</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-semibold">Security Protocol</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">SHA-256 Tamper-Proof</span>
          </div>
        </div>

      </div>
    </div>
  );
}
