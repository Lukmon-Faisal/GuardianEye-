import React from "react";
import { Shield, ShieldAlert, Cpu, HeartHandshake, ArrowRight, UserCheck } from "lucide-react";

interface RoleSelectorProps {
  onSelectRole: (role: "parent" | "child") => void;
}

export default function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8">
      {/* Brand Logo & Headline */}
      <div className="text-center mb-8 max-w-sm">
        <div className="inline-flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-2xl mb-4 shadow-xs border border-blue-100">
          <Shield className="w-12 h-12 stroke-[2]" style={{ color: "#1A5276" }} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 mb-2">
          Guardian<span className="text-[#1A5276]">Eye</span>
        </h1>
        <p className="text-sm text-slate-600 font-medium">
          Protecting Nigerian children from cyberbullying, online grooming, and unsafe media.
        </p>
      </div>

      {/* Selector Cards Container */}
      <div className="w-full max-w-sm space-y-4">
        {/* Parent Role Button */}
        <button
          onClick={() => onSelectRole("parent")}
          className="group w-full text-left p-5 bg-white hover:bg-[#1A5276]/5 border-2 border-slate-200 hover:border-[#1A5276] rounded-2xl shadow-sm transition-all duration-200 flex items-start gap-4"
        >
          <div className="p-3 bg-blue-50 text-[#1A5276] rounded-xl group-hover:bg-[#1A5276]/10 transition-colors">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-slate-900 font-display">I'm a Parent</span>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#1A5276] group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Monitor connected devices, review AI safety alerts, check screen schedules, and receive alerts.
            </p>
          </div>
        </button>

        {/* Child Role Button */}
        <button
          onClick={() => onSelectRole("child")}
          className="group w-full text-left p-5 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-2xl shadow-sm transition-all duration-200 flex items-start gap-4"
        >
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl group-hover:bg-indigo-100 transition-colors">
            <Cpu className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-slate-900 font-display">I'm a Child</span>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Connect this smartphone to your family circle and activate core local security protections.
            </p>
          </div>
        </button>
      </div>

      {/* Safety highlight badges */}
      <div className="mt-12 w-full max-w-sm text-center">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">AI Safety Safeguards Included</h3>
        <div className="grid grid-cols-3 gap-2 text-slate-500">
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
            <ShieldAlert className="w-4 h-4 text-rose-500 mb-1" />
            <span className="text-[10px] font-semibold">Toxicity Guard</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
            <Cpu className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="text-[10px] font-semibold">Gemini Filter</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
            <UserCheck className="w-4 h-4 text-[#1A5276] mb-1" />
            <span className="text-[10px] font-semibold">Active Control</span>
          </div>
        </div>
      </div>
    </div>
  );
}
