import React, { useState } from "react";
import { Shield, Sparkles, ShieldAlert, Cpu, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Shield className="w-16 h-16 text-[#1A5276]" />,
      title: "GuardianEye Protect",
      tagline: "Your Family's Digital Safe-Shield",
      description: "Welcome to GuardianEye, a high-fidelity, real-time safety guard for Nigerian parents. Protect your kids from silent digital threats like predator grooming, cyberbullying, and inappropriate media.",
      badge: "🛡️ NIGERIA'S DIGITAL DEFENSE"
    },
    {
      icon: <Sparkles className="w-16 h-16 text-[#1A5276] animate-pulse" />,
      title: "AI Chat & Feed Classifier",
      tagline: "Always-on Local Intelligence",
      description: "Equipped with advanced Gemini classification models, GuardianEye reads chats and social activity in-situ. If a predator or bully contacts your child, you get warned instantly.",
      badge: "🧠 POWERED BY GEMINI"
    },
    {
      icon: <ShieldAlert className="w-16 h-16 text-rose-600 animate-bounce" />,
      title: "Instant Emergency SOS",
      tagline: "Direct Life Safety Panic",
      description: "When in danger, children can trigger a prominent SOS distress signal. GuardianEye instantly relays a full-width Red Alert banner with live GPS mock coordinates and notification tracking.",
      badge: "⚠️ CORE LIFE SAFETY"
    }
  ];

  const currentData = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col justify-between p-6 select-none text-white">
      {/* Background radial soft light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-blue-600/10 blur-[90px] pointer-events-none" />

      {/* Header Skip button */}
      <div className="flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#4faae8]" />
          <span className="font-extrabold text-sm font-display tracking-tight">GuardianEye</span>
        </div>
        <button 
          onClick={onComplete}
          className="text-xs text-slate-400 hover:text-white transition-colors uppercase font-bold tracking-wider"
        >
          Skip
        </button>
      </div>

      {/* Step Content Card with clean micro-transitions */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-sm mx-auto z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col items-center space-y-5"
          >
            <div className="inline-flex p-5 bg-white/5 rounded-3xl border border-white/10 shadow-2xl relative">
              <div className="absolute inset-x-0 -bottom-2 h-4 bg-[#1A5276]/30 blur-md rounded-full pointer-events-none" />
              {currentData.icon}
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest bg-blue-900/40 text-[#4faae8] py-1 px-3 rounded-full border border-blue-500/15 inline-block">
                {currentData.badge}
              </span>
              <h2 className="text-2xl font-black font-display tracking-tight leading-none text-white">
                {currentData.title}
              </h2>
              <p className="text-xs font-bold text-[#4faae8] font-display">
                {currentData.tagline}
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xs font-medium">
              {currentData.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer step indicators & Navigation */}
      <div className="space-y-6 z-10 shrink-0 select-none">
        {/* Step dots indicator */}
        <div className="flex justify-center items-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-[#4faae8]" : "w-2 bg-slate-700 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>

        {/* Dynamic CTA Button */}
        <button
          onClick={handleNext}
          className="w-full py-4 bg-[#1A5276] hover:bg-[#154360] active:scale-[0.98] text-white rounded-2xl font-bold text-xs font-display uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(26,82,118,0.3)] flex items-center justify-center gap-2 border border-[#2471a3]/30"
        >
          {step === steps.length - 1 ? (
            <>
              Protect Now <Check className="w-4 h-4 stroke-[3]" />
            </>
          ) : (
            <>
              Continue <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
