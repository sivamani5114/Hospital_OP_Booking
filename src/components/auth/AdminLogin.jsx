import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Phone, Lock, ArrowLeft, ArrowRight } from 'lucide-react';

export default function AdminLogin({ onGoBack, onBackToPortals }) {
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
    setPhone('9948985114');
    setPassword('@Sivamani994898');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-md glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-indigo-500/30 shadow-2xl space-y-5">
        
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
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-outfit">👨‍💼 Super Admin Login</h2>
          <p className="text-xs text-slate-400">Master Control Portal Access</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Phone Field */}
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Super Admin Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter Super Admin Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-3 text-xs text-white"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Super Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="Enter Super Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-3 text-xs text-white"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            Login to Admin Control Portal <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Fill link */}
        <div className="text-center border-t border-slate-800/80 pt-3">
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
  );
}
