import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Phone, Lock, ArrowLeft, ArrowRight } from 'lucide-react';

export default function AdminLogin({ onGoBack, onBackToPortals }) {
  const { login } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleBack = () => {
    if (onBackToPortals) onBackToPortals();
    else if (onGoBack) onGoBack();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(phone, password);
  };

  const handleFillDemo = () => {
    setPhone('9948985114');
    setPassword('@Sivamani994898');
  };

  return (
    <div className="min-h-screen flex items-stretch bg-slate-950">

      {/* ═══ LEFT BRANDING PANEL ═══ */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border-r border-slate-800 p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-extrabold text-lg font-outfit tracking-tight">CarePulse</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
            System Admin<br />
            <span className="text-indigo-400">Control Panel</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Full CRUD control over all hospitals, patients, doctors, bookings, analytics, and system-wide settings with complete access authority.
          </p>
        </div>

        {/* Highlights */}
        <div className="space-y-4">
          {[
            { icon: '🏥', title: 'Hospital Management', desc: 'Approve, edit, suspend hospitals' },
            { icon: '👥', title: 'User Management', desc: 'Full patient & user control' },
            { icon: '📊', title: 'System Analytics', desc: 'Bookings, revenue & insights' },
            { icon: '🛡️', title: 'Security Controls', desc: 'Access, roles & permissions' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{f.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-slate-500 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-slate-600">
          🔐 Restricted Access · Super Admin Credentials Only · Activity Logged
        </div>
      </div>

      {/* ═══ RIGHT LOGIN FORM PANEL ═══ */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12">
        <div className="mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portal Choice
          </button>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">Super Admin Login</h2>
            <p className="text-sm text-slate-400">Master Control Portal — Restricted Access Only.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1.5">Super Admin Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Enter Super Admin Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1.5">Super Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="Enter Super Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-2"
            >
              Login to Admin Control Portal <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center mt-4 border-t border-slate-800/60 pt-4">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-indigo-400/80 hover:text-indigo-300 underline"
            >
              💡 Click to autofill Super Admin credentials (9948985114)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
