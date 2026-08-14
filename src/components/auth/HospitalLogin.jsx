import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Phone, Lock, ArrowLeft, ArrowRight, Stethoscope } from 'lucide-react';

export default function HospitalLogin({ onGoBack, onBackToPortals, onGoToRegister }) {
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
    setPhone('9123456789');
    setPassword('hospital123');
  };

  return (
    <div className="min-h-screen flex items-stretch bg-slate-950">

      {/* ═══ LEFT BRANDING PANEL ═══ */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 border-r border-slate-800 p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>

        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-extrabold text-lg font-outfit tracking-tight">CarePulse</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Hospital Desk<br />
            <span className="text-emerald-400">Management Portal</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Manage your OP appointments, doctor schedules, live queue counter, patient records, and real-time analytics from a single dashboard.
          </p>
        </div>

        {/* Highlights */}
        <div className="space-y-4">
          {[
            { icon: '🗓️', title: 'Live OP Queue Counter', desc: 'Real-time patient slot management' },
            { icon: '👨‍⚕️', title: 'Doctor Schedule Management', desc: 'Set availability & specialties' },
            { icon: '📊', title: 'Booking Analytics', desc: 'Track daily OP statistics' },
            { icon: '🔔', title: 'Patient Notification System', desc: 'Auto alerts for appointments' },
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
          🔒 Secure Hospital Portal · NABH Certified System · Admin-Approved Access Only
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">Hospital Desk Login</h2>
            <p className="text-sm text-slate-400">Enter your hospital registered phone and password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1.5">Hospital Registered Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Enter hospital registered phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="Enter hospital password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-2"
            >
              Login to Hospital Portal <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center mt-4 border-t border-slate-800/60 pt-4">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-emerald-400/80 hover:text-emerald-300 underline"
            >
              💡 Click to autofill test Hospital credentials (9123456789)
            </button>
          </div>

          <div className="mt-4 text-center space-y-2">
            <span className="text-xs text-slate-400 block">Want to register a new Hospital?</span>
            <button
              type="button"
              onClick={onGoToRegister}
              className="w-full border border-slate-800 hover:border-emerald-500/40 text-emerald-400 font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              + Register New Hospital (Pending Admin Approval)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
