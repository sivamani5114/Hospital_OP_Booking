import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Toast() {
  const { toastMessage } = useAuth();

  if (!toastMessage) return null;

  const isError = toastMessage.type === 'error';
  const isSuccess = toastMessage.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className={`px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-2 backdrop-blur-lg ${
        isError ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-900/40' :
        isSuccess ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-900/40' :
        'bg-slate-900/90 text-slate-200 border-slate-700'
      }`}>
        {toastMessage.msg}
      </div>
    </div>
  );
}
