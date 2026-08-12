import React from 'react';
import { Stethoscope, User, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PortalSelection({ onSelectPortal }) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-2xl glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-8 text-center">
        
        {/* Branding Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 mb-1">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-outfit tracking-tight">
            CarePulse <span className="text-cyan-400">Hospital OP System</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Welcome! Please choose your portal login page below to continue.
          </p>
        </div>

        {/* 3 Separate Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* 1. Patient Portal Entrance */}
          <div 
            onClick={() => onSelectPortal('USER_LOGIN')}
            className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 text-left space-y-4 cursor-pointer group transition-all"
          >
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 w-fit group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors">Patient Login</h3>
              <p className="text-xs text-slate-400 mt-1">Book OP tokens, search doctors, and view tickets.</p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-bold text-cyan-400">
              Open Patient Login <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Hospital Portal Entrance */}
          <div 
            onClick={() => onSelectPortal('HOSPITAL_LOGIN')}
            className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 text-left space-y-4 cursor-pointer group transition-all"
          >
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 w-fit group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">Hospital Desk Login</h3>
              <p className="text-xs text-slate-400 mt-1">Manage doctor schedules, live queue counter & bookings.</p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-bold text-emerald-400">
              Open Hospital Login <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Super Admin Entrance */}
          <div 
            onClick={() => onSelectPortal('ADMIN_LOGIN')}
            className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 text-left space-y-4 cursor-pointer group transition-all"
          >
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 w-fit group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">Super Admin Login</h3>
              <p className="text-xs text-slate-400 mt-1">Full CRUD control over Users, Hospitals, and System Settings.</p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-bold text-indigo-400">
              Open Admin Login <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
