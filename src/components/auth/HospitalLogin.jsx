import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Phone, Lock, ArrowLeft, ArrowRight, Stethoscope } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function HospitalLogin({ onGoBack, onBackToPortals, onGoToRegister }) {
  const { login } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleBack = () => {
    if (onBackToPortals) onBackToPortals();
    else if (onGoBack) onGoBack();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      alert('❌ Please enter a valid 10-digit Hospital Phone Number!');
      return;
    }
    if (!/^[6-9]/.test(cleanPhone)) {
      alert('❌ Invalid Mobile Number! Indian phone numbers must start with 6, 7, 8, or 9.');
      return;
    }
    login(cleanPhone, password);
  };

  const handleFillDemo = (autoLogin = false) => {
    setPhone('9123456789');
    setPassword('hospital123');
    if (autoLogin) {
      setTimeout(() => {
        login('9123456789', 'hospital123');
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-slate-950">

      {/* ═══ LEFT BRANDING PANEL (hidden on mobile) ═══ */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 border-r border-slate-800 p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>

        {/* Logo + Brand */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-extrabold text-lg font-outfit tracking-tight">CarePulse</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Manage OP Queues<br />
            <span className="text-emerald-400">& Doctors Easily.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Accept online OP bookings, configure doctor consultation slots, track daily revenue, and deliver digital prescriptions seamlessly.
          </p>
        </div>

        {/* Highlights */}
        <div className="space-y-4">
          {[
            { icon: '👨‍⚕️', title: 'Manage Doctors & Slots', desc: 'Add verified doctors with license numbers' },
            { icon: '📋', title: 'Real-Time OP Queue', desc: 'Live token counter and queue management' },
            { icon: '📄', title: 'Digital Prescriptions', desc: 'Attach prescription notes to patient records' },
            { icon: '📊', title: 'Revenue & Reports', desc: 'Instant daily OP collection summaries' },
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
          🔒 Secure Enterprise Portal · NABH & CEA Compliant · Encrypted System
        </div>
      </div>

      {/* ═══ RIGHT LOGIN FORM PANEL ═══ */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12">
        {/* Back button */}
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
          {/* Title */}
          <div className="mb-8 space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">Hospital Desk Login</h2>
            <p className="text-sm text-slate-400">Enter your hospital registered phone and password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-400 font-semibold">Hospital Registered Phone (10 Digits)</label>
                {phone.length === 10 && /^[6-9]\d{9}$/.test(phone) ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid Mobile Number
                  </span>
                ) : phone.length > 0 && !/^[6-9]/.test(phone) ? (
                  <span className="text-[10px] text-rose-400 font-bold">
                    ⚠️ Must start with 6, 7, 8, or 9
                  </span>
                ) : phone.length > 0 ? (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {phone.length}/10 digits
                  </span>
                ) : null}
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1 text-slate-400 font-bold text-xs select-none pointer-events-none border-r border-slate-700 pr-2">
                  <span>🇮🇳</span>
                  <span className="font-mono text-slate-300">+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter hospital registered phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`w-full bg-slate-900 border rounded-xl pl-20 pr-4 py-3 text-sm text-white font-mono tracking-wider outline-none transition-colors ${
                    phone.length === 10 && /^[6-9]\d{9}$/.test(phone)
                      ? 'border-emerald-500/80 focus:border-emerald-400'
                      : phone.length > 0 && !/^[6-9]/.test(phone)
                      ? 'border-rose-500/80 focus:border-rose-400'
                      : 'border-slate-800 focus:border-emerald-500/60'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-400 font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
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
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-2 cursor-pointer"
            >
              Login to Hospital Portal <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Forgot Password Modal */}
          <ForgotPasswordModal
            isOpen={showForgotPassword}
            onClose={() => setShowForgotPassword(false)}
            role="HOSPITAL"
            onPasswordResetSuccess={(resetPhone, newPwd) => {
              setPhone(resetPhone);
              setPassword(newPwd);
            }}
          />

          {/* ⚡ Demo Autofill & 1-Click Instant Login Box */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-lg">
              <div className="text-left w-full sm:w-auto">
                <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Hospital Demo Access
                </span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  +91 9123456789 · hospital123
                </span>
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleFillDemo(false)}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95"
                  title="Fill phone and password into form"
                >
                  📝 Fill Form
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo(true)}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
                  title="Autofill and directly sign in"
                >
                  ⚡ Instant Login
                </button>
              </div>
            </div>
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
