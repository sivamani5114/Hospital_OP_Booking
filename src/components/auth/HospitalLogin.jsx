import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Phone, Lock, ArrowLeft, ArrowRight } from 'lucide-react';

export default function HospitalLogin({ onGoBack, onBackToPortals, onGoToRegister }) {
  const { login } = useAuth();
  
  // Blank fields by default
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
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-md glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl space-y-5">
        
        {/* Back Link */}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal Choice
        </button>

        {/* Portal Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-outfit">🏥 Hospital Desk Login</h2>
          <p className="text-xs text-slate-400">Enter hospital registered phone number and password.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Phone Field */}
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Hospital Registered Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter hospital registered phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-3 text-xs text-white"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="Enter hospital password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-3 text-xs text-white"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            Login to Hospital Portal <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Fill link */}
        <div className="text-center border-t border-slate-800/80 pt-3">
          <button 
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] text-emerald-400/80 hover:text-emerald-300 underline"
          >
            💡 Click to autofill test Hospital credentials (9123456789)
          </button>
        </div>

        {/* Register Button */}
        <div className="pt-2 text-center space-y-2">
          <span className="text-xs text-slate-400 block">Want to register a new Hospital?</span>
          <button
            type="button"
            onClick={onGoToRegister}
            className="w-full border border-slate-800 hover:border-emerald-500/40 text-emerald-400 font-semibold py-3 rounded-xl text-xs"
          >
            + Register New Hospital (Pending Admin Approval)
          </button>
        </div>

      </div>
    </div>
  );
}
