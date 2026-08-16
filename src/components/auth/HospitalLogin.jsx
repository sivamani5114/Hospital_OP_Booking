import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Phone, Lock, ArrowLeft, ArrowRight, Stethoscope, CheckCircle2, KeyRound, Plus, HeartPulse, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen flex items-stretch justify-center relative overflow-hidden">

      {/* Ambient background glow effects */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-6xl mx-auto my-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-stretch gap-6 z-10">

        {/* ═══ LEFT BRANDING PANEL (FROSTED GLASS) ═══ */}
        <div className="flex-1 lg:max-w-md bg-gradient-to-br from-slate-900/80 via-emerald-950/50 to-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          {/* Subtle Corner Glow */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div>
            {/* Logo + Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-white font-extrabold text-xl font-outfit tracking-tight block">CarePulse</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Hospital Portal</span>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-white leading-tight mb-3 font-outfit">
              Manage OP Queues<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                & Doctors Easily.
              </span>
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Accept online OP bookings, configure doctor consultation slots, track daily revenue, and deliver digital prescriptions seamlessly.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-4 my-8">
            {[
              { icon: '👨‍⚕️', title: 'Manage Doctors & Slots', desc: 'Add verified doctors with license numbers' },
              { icon: '📋', title: 'Real-Time OP Queue', desc: 'Live token counter and queue management' },
              { icon: '📄', title: 'Digital Prescriptions', desc: 'Attach prescription notes to patient records' },
              { icon: '📊', title: 'Revenue & Reports', desc: 'Instant daily OP collection summaries' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-900/40 p-2.5 rounded-2xl border border-slate-800/60 backdrop-blur-sm">
                <span className="text-xl mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold text-xs">{f.title}</p>
                  <p className="text-slate-400 text-[11px]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-emerald-300/80 flex items-center gap-1.5 pt-4 border-t border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Secure Enterprise Portal · NABH & CEA Compliant</span>
          </div>
        </div>

        {/* ═══ RIGHT LOGIN FORM PANEL (MATCHING FROSTED GLASS + MEDICAL CROSS LOGO WATERMARK) ═══ */}
        <div className="flex-1 bg-gradient-to-br from-slate-900/85 via-slate-900/75 to-emerald-950/40 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 sm:p-10 flex flex-col justify-center relative overflow-hidden shadow-2xl">
          
          {/* 🏥 TRANSPARENT HOSPITAL MEDICAL CROSS "+" WATERMARK IN MIDDLE BACKGROUND */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.06] -z-0">
            <div className="w-80 h-80 relative flex items-center justify-center text-emerald-400">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <rect x="37" y="5" width="26" height="90" rx="10" />
                <rect x="5" y="37" width="90" height="26" rx="10" />
              </svg>
            </div>
          </div>

          {/* Secondary glowing ambient circle behind form */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl -z-0 pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-md mx-auto">
            {/* Back button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Portal Choice
              </button>
            </div>

            {/* Form Header with Hospital Icon */}
            <div className="mb-6 space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3 text-emerald-400 shadow-lg shadow-emerald-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">Hospital Desk Login</h2>
              <p className="text-xs sm:text-sm text-slate-300">Enter your hospital registered phone and password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Input with +91 badge */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Hospital Registered Phone (10 Digits)</label>
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
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-slate-300 font-bold text-xs select-none pointer-events-none border-r border-slate-700 pr-2.5">
                    <span>🇮🇳</span>
                    <span className="font-mono text-emerald-400">+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={`w-full bg-slate-950/70 border rounded-2xl pl-20 pr-4 py-3 text-sm text-white font-mono tracking-wider outline-none backdrop-blur-md transition-all shadow-inner ${
                      phone.length === 10 && /^[6-9]\d{9}$/.test(phone)
                        ? 'border-emerald-500/80 focus:border-emerald-400 shadow-emerald-500/10'
                        : phone.length > 0 && !/^[6-9]/.test(phone)
                        ? 'border-rose-500/80 focus:border-rose-400'
                        : 'border-slate-700/80 focus:border-emerald-400/80'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="Enter hospital password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-emerald-400/80 rounded-2xl pl-10 pr-4 py-3 text-sm text-white outline-none backdrop-blur-md transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-2xl text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all mt-2 cursor-pointer"
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

            {/* ⚡ Demo Autofill & 1-Click Instant Login Box (Frosted Glass Card) */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="bg-slate-950/60 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="text-left w-full sm:w-auto">
                  <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Hospital Demo Access
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    +91 9123456789 · hospital123
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleFillDemo(false)}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow"
                    title="Fill phone and password into form"
                  >
                    📝 Fill Form
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo(true)}
                    className="flex-1 sm:flex-none px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
                    title="Autofill and directly sign in"
                  >
                    ⚡ Instant Login
                  </button>
                </div>
              </div>
            </div>

            {/* Register link */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={onGoToRegister}
                className="text-xs text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <span>Want to register a new Hospital?</span>
                <span className="text-emerald-400 font-bold underline">+ Register Here</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
