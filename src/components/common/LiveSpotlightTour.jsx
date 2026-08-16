import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, ArrowLeft, X, Sparkles, CheckCircle2, User, Building2, ShieldCheck, 
  ChevronRight, Compass, MousePointer
} from 'lucide-react';

export default function LiveSpotlightTour({ isOpen, onClose, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [targetRect, setTargetRect] = useState(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const tourSteps = [
    {
      step: 1,
      targetId: 'tour-patient-card',
      title: '👤 Step 1: Patient OP Booking Portal',
      description: 'Click this card to search top specialist doctors across hospitals, book OP consultation tokens, pay via UPI QR, and get instant digital tickets with live queue tracking!',
      badgeColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/60',
      arrowDirection: 'down',
      accentColor: 'cyan'
    },
    {
      step: 2,
      targetId: 'tour-hospital-card',
      title: '🏥 Step 2: Hospital Desk & Doctor Portal',
      description: 'Hospital receptionists & doctors use this desk to manage doctor consultation slots, call live queue tokens to the OPD counter, issue prescriptions, and export revenue reports.',
      badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60',
      arrowDirection: 'down',
      accentColor: 'emerald'
    },
    {
      step: 3,
      targetId: 'tour-admin-btn',
      title: '🛡️ Step 3: Super Admin Command Center',
      description: 'Located right here on top-right! Click this button to access the Master Super Admin portal to audit hospital documents, auto-verify govt licenses with AI, and oversee system analytics.',
      badgeColor: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/60',
      arrowDirection: 'up-right',
      accentColor: 'indigo'
    }
  ];

  const activeStep = tourSteps.find(s => s.step === currentStep) || tourSteps[0];

  // Update target rect when step changes or window resizes
  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      const el = document.getElementById(activeStep.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          viewportTop: rect.top,
          viewportLeft: rect.left
        });

        // Scroll element into view smoothly if out of viewport
        if (rect.top < 80 || rect.bottom > window.innerHeight) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timeout = setTimeout(updateRect, 300);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [currentStep, isOpen, activeStep.targetId]);

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem('carepulse_live_tour_dismissed', 'true');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto select-none transition-all duration-300">
      
      {/* 🌑 Semi-Transparent Dim Overlay Background */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-[2px] transition-opacity"
        onClick={handleFinish}
      />

      {/* 🎯 Target Element Spotlight Glow Ring */}
      {targetRect && (
        <div
          className={`fixed pointer-events-none rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 z-50 shadow-2xl animate-pulse ${
            activeStep.accentColor === 'cyan' 
              ? 'border-cyan-400 shadow-cyan-500/50 bg-cyan-500/5 ring-4 ring-cyan-500/30' 
              : activeStep.accentColor === 'emerald'
              ? 'border-emerald-400 shadow-emerald-500/50 bg-emerald-500/5 ring-4 ring-emerald-500/30'
              : 'border-indigo-400 shadow-indigo-500/50 bg-indigo-500/5 ring-4 ring-indigo-500/30'
          }`}
          style={{
            top: `${Math.max(10, targetRect.viewportTop - 8)}px`,
            left: `${Math.max(10, targetRect.viewportLeft - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
        />
      )}

      {/* 🏹 Animated Pointing Arrow Indicator */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-50 transition-all duration-300 flex items-center justify-center animate-bounce"
          style={{
            top: activeStep.arrowDirection === 'up-right' 
              ? `${targetRect.viewportTop + targetRect.height + 12}px` 
              : `${Math.max(20, targetRect.viewportTop - 56)}px`,
            left: activeStep.arrowDirection === 'up-right'
              ? `${targetRect.viewportLeft + targetRect.width / 2 - 20}px`
              : `${targetRect.viewportLeft + targetRect.width / 2 - 24}px`
          }}
        >
          {activeStep.arrowDirection === 'down' ? (
            <div className="flex flex-col items-center">
              <div className="bg-cyan-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-lg">
                POINTING HERE 👇
              </div>
              <svg className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] fill-current" viewBox="0 0 24 24">
                <path d="M12 2L12 18M12 18L5 11M12 18L19 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)] fill-current rotate-180" viewBox="0 0 24 24">
                <path d="M12 2L12 18M12 18L5 11M12 18L19 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="bg-indigo-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-lg">
                POINTING HERE 👆
              </div>
            </div>
          )}
        </div>
      )}

      {/* 💬 Live Floating Interactive Tooltip Bubble */}
      <div 
        className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg glass-panel p-5 sm:p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-4 text-left pointer-events-auto bg-slate-900/95 backdrop-blur-xl animate-fadeIn"
      >
        {/* Top Header Badge & Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${activeStep.badgeColor}`}>
              Step {currentStep} of {tourSteps.length} Live Tour
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Interactive Navigation</span>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
            title="Close Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Title & Live Pointing Explanation */}
        <div className="space-y-1.5">
          <h4 className="text-base sm:text-lg font-bold text-white font-outfit flex items-center gap-2">
            {activeStep.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {activeStep.description}
          </p>
        </div>

        {/* Action Controls & Steps Progress */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {tourSteps.map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStep(s.step)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === s.step ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Jump to step ${s.step}`}
              />
            ))}
          </div>

          {/* Navigation Next / Prev / Finish Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer"
              >
                ← Back
              </button>
            )}

            {currentStep < tourSteps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                Next Element →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                Done & Start Exploring! ✓
              </button>
            )}
          </div>
        </div>

        {/* Don't show again checkbox */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-800/60">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded accent-cyan-500"
            />
            <span>Don't show this live tour on next visit</span>
          </label>

          <button
            type="button"
            onClick={handleFinish}
            className="text-cyan-400 hover:underline font-semibold cursor-pointer"
          >
            Skip Tour ✕
          </button>
        </div>

      </div>

    </div>
  );
}
