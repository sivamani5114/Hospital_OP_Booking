import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Lock, ArrowLeft, ArrowRight, Stethoscope, Calendar, CheckCircle2, KeyRound } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function UserLogin({ onGoBack, onBackToPortals, onGoToRegister, onGoToHospitalLogin, onGoToAdminLogin }) {
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
      alert('❌ Please enter a valid 10-digit Indian Mobile Number!');
      return;
    }
    if (!/^[6-9]/.test(cleanPhone)) {
      alert('❌ Invalid Mobile Number! Indian mobile numbers must start with 6, 7, 8, or 9.');
      return;
    }
    login(cleanPhone, password);
  };

  const handleFillDemo = (autoLogin = false) => {
    setPhone('9876543210');
    setPassword('password123');
    if (autoLogin) {
      setTimeout(() => {
        login('9876543210', 'password123');
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-white dark:bg-slate-950">

      {/* ═══ LEFT BRANDING PANEL (hidden on mobile) ═══ */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border-r border-slate-800 p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

        {/* Logo + Brand */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-extrabold text-lg font-outfit tracking-tight">CarePulse</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Your Health,<br />
            <span className="text-cyan-400">Our Priority.</span>
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Access your digital OP tokens, appointment history, doctor reviews, and real-time queue status — all in one place.
          </p>
        </div>

        {/* Highlights */}
        <div className="space-y-4">
          {[
            { icon: '🏥', title: 'Book OP Tokens Instantly', desc: 'Skip the physical queue forever' },
            { icon: '📱', title: 'UPI QR Payment', desc: 'Secure digital payment at booking' },
            { icon: '🎟️', title: 'Digital Ticket with PDF', desc: 'Download & print your appointment' },
            { icon: '⭐', title: 'Rate Your Doctor', desc: 'Share your consultation experience' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 backdrop-blur-sm">
              <span className="text-xl mt-0.5">{f.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-slate-400 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-cyan-300/80">
          🔒 Trusted by 10,000+ Patients · Secure Login · NABH Verified Hospitals
        </div>
      </div>

      {/* ═══ RIGHT LOGIN FORM PANEL (Clean Light Normal Theme) ═══ */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 bg-slate-50/70">
        {/* Back button */}
        <div className="mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-cyan-600 font-semibold cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portal Choice
          </button>
        </div>

        <div className="w-full max-w-md mx-auto glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl bg-white">
          {/* Title */}
          <div className="mb-6 space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mb-3 text-cyan-600">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit">Patient Login</h2>
            <p className="text-xs text-slate-500">Enter your registered phone number and password to access OP booking.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-700 font-semibold">Mobile Number (10 Digits)</label>
                {phone.length === 10 && /^[6-9]\d{9}$/.test(phone) ? (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid Mobile Number
                  </span>
                ) : phone.length > 0 && !/^[6-9]/.test(phone) ? (
                  <span className="text-[10px] text-rose-500 font-bold">
                    ⚠️ Must start with 6, 7, 8, or 9
                  </span>
                ) : phone.length > 0 ? (
                  <span className="text-[10px] text-cyan-600 font-mono">
                    {phone.length}/10 digits
                  </span>
                ) : null}
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1 text-slate-500 font-bold text-xs select-none pointer-events-none border-r border-slate-300 pr-2">
                  <span>🇮🇳</span>
                  <span className="font-mono">+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`w-full bg-white border rounded-xl pl-20 pr-4 py-3 text-xs text-slate-900 font-mono tracking-wider outline-none transition-colors ${
                    phone.length === 10 && /^[6-9]\d{9}$/.test(phone)
                      ? 'border-emerald-500 focus:border-emerald-600'
                      : phone.length > 0 && !/^[6-9]/.test(phone)
                      ? 'border-rose-500 focus:border-rose-600'
                      : 'border-slate-300 focus:border-cyan-500'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-700 font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline cursor-pointer font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-2 cursor-pointer"
            >
              Login to Patient Portal <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Forgot Password Modal */}
          <ForgotPasswordModal
            isOpen={showForgotPassword}
            onClose={() => setShowForgotPassword(false)}
            role="USER"
            onPasswordResetSuccess={(resetPhone, newPwd) => {
              setPhone(resetPhone);
              setPassword(newPwd);
            }}
          />

          {/* ⚡ Demo Autofill & 1-Click Instant Login Box */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <div className="bg-cyan-50 p-3 rounded-2xl border border-cyan-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-sm">
              <div className="text-left w-full sm:w-auto">
                <span className="text-xs text-cyan-800 font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-600" /> Patient Demo Access
                </span>
                <span className="text-[10px] text-slate-600 font-mono block mt-0.5">
                  +91 9876543210 · password123
                </span>
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleFillDemo(false)}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow-xs"
                  title="Fill phone and password into form"
                >
                  📝 Fill Form
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo(true)}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
                  title="Autofill and directly sign in"
                >
                  ⚡ Instant Login
                </button>
              </div>
            </div>
          </div>

          {/* Register link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onGoToRegister}
              className="w-full bg-slate-50 border border-slate-300 hover:border-cyan-500 text-cyan-700 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
            >
              + Create New Patient Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
