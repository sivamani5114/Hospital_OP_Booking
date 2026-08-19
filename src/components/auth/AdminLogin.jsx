import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Phone, Lock, ArrowLeft, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function AdminLogin({ onGoBack, onBackToPortals }) {
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
      alert('❌ Please enter a valid 10-digit Super Admin Phone Number!');
      return;
    }
    if (!/^[6-9]/.test(cleanPhone)) {
      alert('❌ Invalid Mobile Number! Indian phone numbers must start with 6, 7, 8, or 9.');
      return;
    }
    login(cleanPhone, password);
  };

  const handleFillDemo = (autoLogin = false) => {
    setPhone('9948985114');
    setPassword('@Sivamani994898');
    if (autoLogin) {
      setTimeout(() => {
        login('9948985114', '@Sivamani994898');
      }, 100);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex-1 flex flex-col md:flex-row items-stretch w-full bg-slate-950">

      {/* ═══ LEFT BRANDING PANEL (Indigo & Royal Purple SaaS - Edge to Edge) ═══ */}
      <div className="hidden md:flex flex-col justify-between w-[440px] lg:w-[480px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-r border-slate-800/80 p-10 lg:p-14 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-white font-extrabold text-xl font-outfit tracking-tight block">CarePulse OP</span>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Super Admin</span>
            </div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3 font-outfit">
            Super Admin<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Master Controls</span>
          </h2>
          <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">
            Central authority portal for hospital approvals, system audit logs, doctor license verifications, and platform governance.
          </p>
        </div>

        {/* Highlights */}
        <div className="space-y-4 my-8 relative z-10">
          {[
            { icon: '🏥', title: 'Hospital Approvals', desc: 'Verify CEA and NABH registrations' },
            { icon: '🩺', title: 'Doctor License Verification', desc: 'NMC / State medical council checks' },
            { icon: '🛡️', title: 'Cyber Security Hub', desc: 'Real-time brute force and audit monitors' },
            { icon: '📊', title: 'Global Platform Stats', desc: 'System-wide analytics and revenue tracking' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
              <span className="text-lg shrink-0 mt-0.5">{f.icon}</span>
              <div>
                <p className="text-white font-bold text-xs">{f.title}</p>
                <p className="text-slate-400 text-[11px] font-medium">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-4 relative z-10 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>🔒 Restricted Access Only · Encrypted Session</span>
        </div>
      </div>

      {/* ═══ RIGHT LOGIN FORM PANEL (Spacious Edge to Edge) ═══ */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-slate-950/80 relative">
        <div className="w-full max-w-md lg:max-w-lg space-y-6">

          {/* Top Back Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Portal Choice
            </button>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-3 text-indigo-400 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">Super Admin Login</h2>
            <p className="text-xs sm:text-sm text-slate-400">Master Control Portal — Restricted Authority Access Only.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-300 font-semibold">Super Admin Phone (10 Digits)</label>
                {phone.length === 10 && /^[6-9]\d{9}$/.test(phone) ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid Mobile Number
                  </span>
                ) : phone.length > 0 && !/^[6-9]/.test(phone) ? (
                  <span className="text-[10px] text-rose-400 font-bold">
                    ⚠️ Must start with 6, 7, 8, or 9
                  </span>
                ) : phone.length > 0 ? (
                  <span className="text-[10px] text-indigo-400 font-mono">
                    {phone.length}/10 digits
                  </span>
                ) : null}
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1 text-slate-400 font-bold text-xs select-none pointer-events-none border-r border-slate-700 pr-2.5">
                  <span>🇮🇳</span>
                  <span className="font-mono text-slate-300">+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter Super Admin Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`w-full bg-slate-900/90 border rounded-xl pl-20 pr-4 py-3.5 text-sm text-white font-mono tracking-wider outline-none transition-colors ${
                    phone.length === 10 && /^[6-9]\d{9}$/.test(phone)
                      ? 'border-indigo-500/80 focus:border-indigo-400 ring-2 ring-indigo-500/20'
                      : phone.length > 0 && !/^[6-9]/.test(phone)
                      ? 'border-rose-500/80 focus:border-rose-400 ring-2 ring-rose-500/20'
                      : 'border-slate-800 focus:border-indigo-500/60'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-300 font-semibold">Super Admin Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
                <input
                  type="password"
                  placeholder="Enter Super Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500/60 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer mt-2"
            >
              Login to Admin Control Portal <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Forgot Password Modal */}
          <ForgotPasswordModal
            isOpen={showForgotPassword}
            onClose={() => setShowForgotPassword(false)}
            role="ADMIN"
            onPasswordResetSuccess={(resetPhone, newPwd) => {
              setPhone(resetPhone);
              setPassword(newPwd);
            }}
          />

          {/* ⚡ Demo Autofill & 1-Click Instant Login Box */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="text-left w-full sm:w-auto">
                <span className="text-xs text-indigo-300 font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" /> Super Admin Demo Access
                </span>
                <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                  +91 9948985114 · @Sivamani994898
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleFillDemo(false)}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95"
                  title="Fill phone and password into form"
                >
                  📝 Fill Form
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo(true)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
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
