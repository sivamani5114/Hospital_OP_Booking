import React, { useState, useEffect } from 'react';
import { 
  Compass, User, Building2, ShieldCheck, ArrowRight, X, Sparkles, 
  CheckCircle2, Clock, Smartphone, QrCode, FileText, ChevronRight, HelpCircle
} from 'lucide-react';

export default function FirstTimeVisitorGuideModal({ isOpen, onClose, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (dontShowAgain) {
      localStorage.setItem('carepulse_guide_dismissed', 'true');
    }
  }, [dontShowAgain]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('carepulse_guide_dismissed', 'true');
    }
    onClose();
  };

  const steps = [
    {
      stepNumber: 1,
      title: 'Welcome to CarePulse OP System! 🏥',
      subtitle: 'Complete Guide on how to navigate and use the platform.',
      icon: <Sparkles className="w-7 h-7 text-cyan-400" />,
      color: 'cyan',
      content: (
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-300 leading-relaxed">
            CarePulse is an end-to-end digital Hospital OP Token & Doctor Queue Management platform connecting <strong>Patients</strong>, <strong>Hospital Desks</strong>, and <strong>Super Admins</strong> in real-time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-1 text-cyan-400 font-bold text-xs">
                <User className="w-4 h-4" /> Patient Portal
              </div>
              <p className="text-[11px] text-slate-400">Search doctors, book OP slots, and track live queue tokens.</p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-1 text-emerald-400 font-bold text-xs">
                <Building2 className="w-4 h-4" /> Hospital Desk
              </div>
              <p className="text-[11px] text-slate-400">Manage doctors, call next live tokens, & issue prescriptions.</p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-indigo-500/30">
              <div className="flex items-center gap-2 mb-1 text-indigo-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" /> Super Admin
              </div>
              <p className="text-[11px] text-slate-400">Verify hospital licenses, audit records, and manage system.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      stepNumber: 2,
      title: 'Patient Portal Workflow 👤',
      subtitle: 'How patients book digital OP appointments without waiting in physical lines.',
      icon: <User className="w-7 h-7 text-cyan-400" />,
      color: 'cyan',
      content: (
        <div className="space-y-3 text-left text-xs">
          {[
            { num: '1', title: 'Search & Choose Doctor', desc: 'Filter specialist doctors by City, Hospital, or Medical Speciality (Cardiology, Urology, etc.).' },
            { num: '2', title: 'Pick Consultation Slot', desc: 'Select your preferred morning, afternoon, or evening OP consultation time.' },
            { num: '3', title: 'Pay & Download Ticket', desc: 'Pay OP fee securely via UPI QR or at hospital counter, and get instant downloadable PDF appointment ticket with QR.' },
            { num: '4', title: 'Live Queue Tracking', desc: 'Check live counter token status from your phone and arrive just in time for consultation.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-xs">
                {item.num}
              </div>
              <div>
                <strong className="text-white block font-semibold">{item.title}</strong>
                <span className="text-slate-400 text-[11px]">{item.desc}</span>
              </div>
            </div>
          ))}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                handleClose();
                onNavigate('USER_LOGIN');
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow cursor-pointer transition-all active:scale-95 inline-flex items-center gap-1.5"
            >
              🚀 Try Patient Portal <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )
    },
    {
      stepNumber: 3,
      title: 'Hospital Desk Workflow 🏥',
      subtitle: 'How hospitals manage daily OP queues, doctor rosters, and patient billing.',
      icon: <Building2 className="w-7 h-7 text-emerald-400" />,
      color: 'emerald',
      content: (
        <div className="space-y-3 text-left text-xs">
          {[
            { num: '1', title: 'Doctor Roster Management', desc: 'Add new specialist doctors with license registration numbers and configure consultation time slots.' },
            { num: '2', title: 'Smart Live Token Caller', desc: 'Click "Call Next Token" on the live queue counter to notify the next waiting patient via SMS/Dashboard.' },
            { num: '3', title: 'Digital Prescriptions', desc: 'Add medicine dosages and diagnosis notes attached directly to patient booking record.' },
            { num: '4', title: 'Daily Revenue & Reports', desc: 'Instantly download daily OP collection reports in CSV Spreadsheet or printable PDF format.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                {item.num}
              </div>
              <div>
                <strong className="text-white block font-semibold">{item.title}</strong>
                <span className="text-slate-400 text-[11px]">{item.desc}</span>
              </div>
            </div>
          ))}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                handleClose();
                onNavigate('HOSPITAL_LOGIN');
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow cursor-pointer transition-all active:scale-95 inline-flex items-center gap-1.5"
            >
              🚀 Try Hospital Desk <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )
    },
    {
      stepNumber: 4,
      title: 'Demo Test Credentials ⚡',
      subtitle: 'Use these pre-configured demo accounts to instantly test all portals.',
      icon: <QrCode className="w-7 h-7 text-indigo-400" />,
      color: 'indigo',
      content: (
        <div className="space-y-3 text-left text-xs">
          <div className="bg-slate-900 p-3 rounded-2xl border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-cyan-400 font-bold block text-xs">👤 Patient Demo Account</span>
              <span className="text-slate-400 text-[11px] font-mono">Phone: 9876543210 · Pwd: password123</span>
            </div>
            <button
              type="button"
              onClick={() => {
                handleClose();
                onNavigate('USER_LOGIN');
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl cursor-pointer shadow"
            >
              Test Patient
            </button>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-emerald-400 font-bold block text-xs">🏥 Hospital Desk Demo Account</span>
              <span className="text-slate-400 text-[11px] font-mono">Phone: 9123456789 · Pwd: hospital123</span>
            </div>
            <button
              type="button"
              onClick={() => {
                handleClose();
                onNavigate('HOSPITAL_LOGIN');
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl cursor-pointer shadow"
            >
              Test Hospital
            </button>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
            <div>
              <span className="text-indigo-400 font-bold block text-xs">🛡️ Super Admin Demo Account</span>
              <span className="text-slate-400 text-[11px] font-mono">Phone: 9999999999 · Pwd: admin123</span>
            </div>
            <button
              type="button"
              onClick={() => {
                handleClose();
                onNavigate('ADMIN_LOGIN');
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl cursor-pointer shadow"
            >
              Test Admin
            </button>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps.find(s => s.stepNumber === currentStep) || steps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-5 text-center">
        
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 hover:bg-slate-800 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 shadow-lg mb-1">
            {currentStepData.icon}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
            <span>Guide Step {currentStep} of {steps.length}</span>
          </div>
          <h3 className="text-xl font-extrabold text-white font-outfit">
            {currentStepData.title}
          </h3>
          <p className="text-xs text-slate-400">
            {currentStepData.subtitle}
          </p>
        </div>

        {/* Step Content */}
        <div className="min-h-[220px] flex items-center justify-center py-2">
          {currentStepData.content}
        </div>

        {/* Step Progress Indicators & Controls */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((s) => (
              <button
                key={s.stepNumber}
                type="button"
                onClick={() => setCurrentStep(s.stepNumber)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === s.stepNumber ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to step ${s.stepNumber}`}
              />
            ))}
          </div>

          {/* Navigation Next / Back Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                ← Back
              </button>
            )}

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                Next Step <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 cursor-pointer transition-all"
              >
                Got It, Start Using! ✓
              </button>
            )}
          </div>
        </div>

        {/* Don't show again checkbox */}
        <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-500">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded accent-cyan-500"
            />
            <span>Don't show this guide automatically on next visit</span>
          </label>
        </div>

      </div>
    </div>
  );
}
