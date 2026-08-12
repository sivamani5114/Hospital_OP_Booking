import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Phone, Lock, ArrowRight, UserPlus, ShieldAlert, Sparkles, User, Building2, ShieldCheck } from 'lucide-react';

export default function Login({ onGoToRegister }) {
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login(phone, password);
  };

  const handleDemoLogin = (demoPhone, demoPassword) => {
    setPhone(demoPhone);
    setPassword(demoPassword);
    login(demoPhone, demoPassword);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 mb-1">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-outfit">
            CarePulse <span className="text-cyan-400">OP Login</span>
          </h1>
          <p className="text-xs text-slate-400">Sign in with your registered phone number & password.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter 10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-400 font-semibold">Password</label>
              <button 
                type="button" 
                onClick={() => alert('Please contact hospital desk or admin to reset password.')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 text-xs transition-all"
          >
            Login to Account <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Register Redirect Button */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400 mb-2">Don't have an account yet?</p>
          <button
            onClick={onGoToRegister}
            className="w-full bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Create New Patient Account
          </button>
        </div>

        {/* Quick Demo Shortcuts */}
        <div className="pt-2 space-y-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block text-center">
            ⚡ Quick Demo Accounts (Click to test):
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('9876543210', 'password123')}
              className="p-2 bg-slate-900/90 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 rounded-xl text-[10px] font-bold text-cyan-300 text-center"
            >
              <User className="w-3.5 h-3.5 mx-auto mb-1" /> Patient
            </button>

            <button
              onClick={() => handleDemoLogin('9123456789', 'hospital123')}
              className="p-2 bg-slate-900/90 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 rounded-xl text-[10px] font-bold text-emerald-300 text-center"
            >
              <Building2 className="w-3.5 h-3.5 mx-auto mb-1" /> Hospital Desk
            </button>

            <button
              onClick={() => handleDemoLogin('9000000000', 'admin123')}
              className="p-2 bg-slate-900/90 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/30 rounded-xl text-[10px] font-bold text-indigo-300 text-center"
            >
              <ShieldCheck className="w-3.5 h-3.5 mx-auto mb-1" /> Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
