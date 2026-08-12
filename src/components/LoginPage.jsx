import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Building2, ShieldCheck, Stethoscope, Lock, Mail, ArrowRight, Activity, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState('PATIENT'); // PATIENT | HOSPITAL | ADMIN
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(selectedRole, { email });
  };

  const handleQuickDemoLogin = (role) => {
    login(role, {
      name: role === 'PATIENT' ? 'Siva Kumar' : role === 'HOSPITAL' ? 'Apollo Admin Desk' : 'System Administrator',
      email: `${role.toLowerCase()}@carepulse.com`
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 mb-1">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-cyan-400 animate-pulse-slow" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-outfit tracking-tight">
            CarePulse <span className="text-cyan-400">OP Portal Login</span>
          </h1>
          <p className="text-xs text-slate-400">Select your portal role below to access your dedicated dashboard.</p>
        </div>

        {/* Portal Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedRole('PATIENT')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRole === 'PATIENT'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4 mb-1" />
            Patient Portal
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('HOSPITAL')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRole === 'HOSPITAL'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 mb-1" />
            Hospital Desk
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('ADMIN')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRole === 'ADMIN'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-1" />
            Super Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">
              {selectedRole === 'PATIENT' ? 'Phone Number / Email' : selectedRole === 'HOSPITAL' ? 'Hospital Desk ID' : 'Super Admin Username'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder={selectedRole === 'PATIENT' ? 'siva@gmail.com or +91 9876543210' : selectedRole === 'HOSPITAL' ? 'apollo_desk_hyderabad' : 'admin@carepulse.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold py-3.5 rounded-xl shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 text-sm transition-all"
          >
            Login to {selectedRole === 'PATIENT' ? 'Patient Portal' : selectedRole === 'HOSPITAL' ? 'Hospital Desk' : 'Super Admin'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Shortcut Section */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block text-center">
            ⚡ Quick 1-Click Demo Login:
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('PATIENT')}
              className="p-2.5 bg-slate-900 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 rounded-xl text-[11px] font-semibold text-cyan-300 text-center transition-all"
            >
              👤 Patient Login
            </button>

            <button
              onClick={() => handleQuickDemoLogin('HOSPITAL')}
              className="p-2.5 bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 rounded-xl text-[11px] font-semibold text-emerald-300 text-center transition-all"
            >
              🏥 Hospital Desk
            </button>

            <button
              onClick={() => handleQuickDemoLogin('ADMIN')}
              className="p-2.5 bg-slate-900 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/30 rounded-xl text-[11px] font-semibold text-indigo-300 text-center transition-all"
            >
              🛡️ Admin Login
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
