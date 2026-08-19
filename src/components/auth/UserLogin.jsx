import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Lock, ArrowLeft, ArrowRight, Stethoscope, CheckCircle2, KeyRound, ShieldCheck, Sparkles } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-3 sm:p-6 lg:p-10 w-full">
      <div className="w-full max-w-4xl glass-panel rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden flex flex-col md:flex-row items-stretch">

        {/* ═══ LEFT BRANDING PANEL (Cyberpunk Medical Gradient) ═══ */}
        <div className="hidden md:flex flex-col justify-between w-[380px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border-r border-slate-800 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

          {/* Logo + Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-extrabold text-lg font-outfit tracking-tight">CarePulse OP</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2.5 font-outfit">
              Your Health,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Our Priority.</span>
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Book live OP queue tokens, check doctor consultation availability in real-time, and download verified digital receipts.
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-3.5 my-6 relative z-10">
            {[
              { icon: '🏥', title: 'Instant OP Token Booking', desc: 'Skip the physical queue completely' },
              { icon: '📱', title: 'UPI QR Fast Payment', desc: 'Direct secure digital OP fee payment' },
              { icon: '🎟️', title: 'Downloadable PDF Tickets', desc: 'Printable appointment passes with QR' },
              { icon: '⭐', title: 'Verified Doctor Reviews', desc: 'Top specialist doctors across departments' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
                <span className="text-base shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-white font-bold text-xs">{f.title}</p>
                  <p className="text-slate-400 text-[11px] font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 relative z-10 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>NABH Verified · 256-Bit Encrypted Security</span>
          </div>
        </div>

        {/* ═══ RIGHT LOGIN FORM PANEL ═══ */}
        <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between bg-slate-950/40">
          
          <div>
            {/* Top Back Navigation & Register Switch */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Portal Choice
              </button>

              {onGoToRegister && (
                <button
                  type="button"
                  onClick={onGoToRegister}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                >
                  New Patient? Register →
                </button>
              )}
            </div>

            {/* Title */}
            <div className="mb-6 space-y-1.5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 text-cyan-400 shadow-md">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-white font-outfit">Patient Login</h2>
              <p className="text-xs text-slate-400">Enter your 10-digit mobile number and password to sign in.</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Phone Number (10 Digits)</label>
                  {phone.length === 10 && /^[6-9]\d{9}$/.test(phone) ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid Mobile Number
                    </span>
                  ) : phone.length > 0 && !/^[6-9]/.test(phone) ? (
                    <span className="text-[10px] text-rose-400 font-bold">
                      ⚠️ Must start with 6, 7, 8, or 9
                    </span>
                  ) : phone.length > 0 ? (
                    <span className="text-[10px] text-cyan-400 font-mono">
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
                    placeholder="Enter 10-Digit Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={`w-full bg-slate-900/90 border rounded-xl pl-20 pr-4 py-3 text-sm text-white font-mono tracking-wider outline-none transition-colors ${
                      phone.length === 10 && /^[6-9]\d{9}$/.test(phone)
                        ? 'border-cyan-500/80 focus:border-cyan-400 ring-2 ring-cyan-500/20'
                        : phone.length > 0 && !/^[6-9]/.test(phone)
                        ? 'border-rose-500/80 focus:border-rose-400 ring-2 ring-rose-500/20'
                        : 'border-slate-800 focus:border-cyan-500/60'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Account Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="Enter Account Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer mt-2"
              >
                Login to Patient Portal <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

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
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="bg-cyan-950/40 p-3.5 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-lg">
              <div className="text-left w-full sm:w-auto">
                <span className="text-xs text-cyan-300 font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> Patient Demo Access
                </span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  +91 9876543210 · password123
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
                  className="flex-1 sm:flex-none px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
                  title="Autofill and directly sign in"
                >
                  ⚡ Instant Login
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
