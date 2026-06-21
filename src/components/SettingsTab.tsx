import React, { useState, useEffect } from "react";
import { 
  Settings, Lock, Eye, Volume2, ShieldAlert, Check, 
  Smartphone, UserCheck, Shield, BookOpen, Clock, AlertTriangle 
} from "lucide-react";
import { getSettings, saveSettings } from "../lib/api";

interface SettingsTabProps {
  onReplayOnboarding?: () => void;
}

export default function SettingsTab({ onReplayOnboarding }: SettingsTabProps) {
  const [safetyPolicies, setSafetyPolicies] = useState({
    cyberbullying: true,
    groomingDetection: true,
    gamblingBlocking: true,
    examLeakFilter: false,
    naijaSlangAudit: true
  });

  const [curfews, setCurfews] = useState({
    schoolHoursLock: true, // 8:00 AM - 2:00 PM
    sleepLock: true,       // 9:00 PM - 5:00 AM
  });

  const [carrierSafeDNS, setCarrierSafeDNS] = useState(true);
  const [sensitivity, setSensitivity] = useState<"Low" | "Medium" | "High">("Medium");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Fetch settings on mount
    const fetchSettings = () => {
      try {
        const data = getSettings();
        setSafetyPolicies({
          cyberbullying: data.cyberbullying ?? true,
          groomingDetection: data.groomingDetection ?? true,
          gamblingBlocking: data.gamblingBlocking ?? true,
          examLeakFilter: data.examLeakFilter ?? false,
          naijaSlangAudit: data.naijaSlangAudit ?? true
        });
        setCurfews({
          schoolHoursLock: data.schoolHoursLock ?? true,
          sleepLock: data.sleepLock ?? true
        });
        setCarrierSafeDNS(data.carrierSafeDNS ?? true);
        setSensitivity((data.sensitivity as "Low" | "Medium" | "High") ?? "Medium");
      } catch (e) {
        console.error("Error fetching settings:", e);
      }
    };
    fetchSettings();
  }, []);

  const handleTogglePolicy = (key: keyof typeof safetyPolicies) => {
    setSafetyPolicies(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleCurfew = (key: keyof typeof curfews) => {
    setCurfews(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = async () => {
    try {
      const payload = {
        sensitivity,
        cyberbullying: safetyPolicies.cyberbullying,
        groomingDetection: safetyPolicies.groomingDetection,
        gamblingBlocking: safetyPolicies.gamblingBlocking,
        examLeakFilter: safetyPolicies.examLeakFilter,
        naijaSlangAudit: safetyPolicies.naijaSlangAudit,
        schoolHoursLock: curfews.schoolHoursLock,
        sleepLock: curfews.sleepLock,
        carrierSafeDNS
      };

      saveSettings(payload);

      setSuccessMsg("GuardianEye safety regulations updated & synced to child device!");
      setTimeout(() => {
        setSuccessMsg("");
      }, 4000);
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  };

  return (
    <div className="space-y-5 text-left">
      <div>
        <h2 className="font-bold text-lg text-slate-900 font-display">Safety Regulations</h2>
        <p className="text-xs text-slate-500">Configure remote web firewalls, curfews, and local slang triggers</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-1 bg-emerald-100 rounded-lg text-emerald-700">
            <Check className="w-4 h-4" />
          </div>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Content Filter Sensitivity */}
      <div id="content-filter-sensitivity-card" className="bg-white rounded-3xl p-5 border border-slate-100 shadow-3xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 font-display flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Eye className="w-4 h-4 text-[#1A5276]" /> Content Filter Sensitivity
        </h3>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Configure the protective posture for media filters on the child's device. Standard and High modes trigger automated quarantine overlays if hazard patterns are discovered.
        </p>

        {/* 3-Way Selector */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          {(["Low", "Medium", "High"] as const).map((level) => {
            const isActive = sensitivity === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setSensitivity(level)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#1A5276] text-white shadow-3xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
        <div className="text-[10px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 space-y-1">
          {sensitivity === "Low" && (
            <span className="font-semibold text-slate-705 block">✓ Low: Basic Safety Screen</span>
          )}
          {sensitivity === "Medium" && (
            <span className="font-semibold text-[#1A5276] block">🛡 Medium: Recommended Guard</span>
          )}
          {sensitivity === "High" && (
            <span className="font-semibold text-rose-600 block">⚠️ High: Active Digital Quarantine</span>
          )}
          <span className="block text-[9px] text-slate-400">
            {sensitivity === "Low" && "Flags and filters only high-risk visual content and confirmed threats."}
            {sensitivity === "Medium" && "Bans common online threats, suspicious cards, online secret chats, and inappropriate files."}
            {sensitivity === "High" && "Restricts all questionable graphics, hand symbols, unverified gaming profiles, and strict secret keys."}
          </span>
        </div>
      </div>

      {/* Content Categories filter */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-3xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 font-display flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Shield className="w-4 h-4 text-[#1A5276]" /> AI Content Monitoring Filters
        </h3>

        <div className="space-y-3">
          {/* Cyberbullying */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Detect Cyberbullying</span>
              <span className="text-[10px] text-slate-500 block">Flags threats, peer-abuse & aggressive slang</span>
            </div>
            <button
              onClick={() => handleTogglePolicy("cyberbullying")}
              className={`w-11 h-6 rounded-full transition-all relative ${
                safetyPolicies.cyberbullying ? "bg-[#1A5276]" : "bg-slate-200"
              }`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                safetyPolicies.cyberbullying ? "left-6" : "left-1"
              }`} />
            </button>
          </div>

          {/* Grooming */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Grooming & Unknown Solicitation</span>
              <span className="text-[10px] text-slate-500 block">Analyses unidentified adult direct messengers</span>
            </div>
            <button
              onClick={() => handleTogglePolicy("groomingDetection")}
              className={`w-11 h-6 rounded-full transition-all relative ${
                safetyPolicies.groomingDetection ? "bg-[#1A5276]" : "bg-slate-200"
              }`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                safetyPolicies.groomingDetection ? "left-6" : "left-1"
              }`} />
            </button>
          </div>

          {/* Gambling */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Strict Betting Block</span>
              <span className="text-[10px] text-slate-500 block">Blocks popular local betting sites (Bet9ja, SportyBet)</span>
            </div>
            <button
              onClick={() => handleTogglePolicy("gamblingBlocking")}
              className={`w-11 h-6 rounded-full transition-all relative ${
                safetyPolicies.gamblingBlocking ? "bg-[#1A5276]" : "bg-slate-200"
              }`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                safetyPolicies.gamblingBlocking ? "left-6" : "left-1"
              }`} />
            </button>
          </div>

          {/* Nigerian Slang */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Naija Slang Sentiment Audit</span>
              <span className="text-[10px] text-slate-500 block">Monitors Pidgin swear word lists & local extortion tags</span>
            </div>
            <button
              onClick={() => handleTogglePolicy("naijaSlangAudit")}
              className={`w-11 h-6 rounded-full transition-all relative ${
                safetyPolicies.naijaSlangAudit ? "bg-[#1A5276]" : "bg-slate-200"
              }`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                safetyPolicies.naijaSlangAudit ? "left-6" : "left-1"
              }`} />
            </button>
          </div>

          {/* Exam Leaks */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">WAEC / JAMB Exam Leak Filter</span>
              <span className="text-[10px] text-slate-500 block">Flags searches for exam answer cheat rooms (Telegram channels)</span>
            </div>
            <button
              onClick={() => handleTogglePolicy("examLeakFilter")}
              className={`w-11 h-6 rounded-full transition-all relative ${
                safetyPolicies.examLeakFilter ? "bg-[#1A5276]" : "bg-slate-200"
              }`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                safetyPolicies.examLeakFilter ? "left-6" : "left-1"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Screen Curfews */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-3xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 font-display flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Clock className="w-4 h-4 text-emerald-600" /> Curfews & Study Schedules
        </h3>

        <div className="space-y-3">
          {/* School curfew */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Lagos School Curfew (8AM - 2PM)</span>
              <span className="text-[10px] text-slate-500 block">Restricts screen access completely during core tutoring</span>
            </div>
            <button
              onClick={() => handleToggleCurfew("schoolHoursLock")}
              className={`w-11 h-6 rounded-full transition-all relative ${
                curfews.schoolHoursLock ? "bg-emerald-600" : "bg-slate-200"
              }`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                curfews.schoolHoursLock ? "left-6" : "left-1"
              }`} />
            </button>
          </div>

          {/* Bedtime curfew */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Sleep Lock (9PM - 5AM)</span>
              <span className="text-[10px] text-slate-500 block">Forces child device into offline mode for healthy sleep cycle</span>
            </div>
            <button
              onClick={() => handleToggleCurfew("sleepLock")}
              className={`w-11 h-6 rounded-full transition-all relative ${
                curfews.sleepLock ? "bg-emerald-600" : "bg-slate-200"
              }`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                curfews.sleepLock ? "left-6" : "left-1"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Carrier Safe-DNS Integration option */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-3xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 font-display flex items-center gap-1.5 pb-1">
          <BookOpen className="w-4 h-4 text-[#1A5276]" /> Network Safe-DNS Routing
        </h3>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Route internet traffic through encrypted parental DNS endpoints. This automatically filters adult content, cyber threat sites, and malware blocks right at carrier level (MTN, Glo, Airtel).
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-700">MTN / Airtel Safe DNS Filtering</div>
          <button
            onClick={() => setCarrierSafeDNS(!carrierSafeDNS)}
            className={`w-11 h-6 rounded-full transition-all relative ${
              carrierSafeDNS ? "bg-[#1A5276]" : "bg-slate-200"
            }`}
          >
            <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
              carrierSafeDNS ? "left-6" : "left-1"
            }`} />
          </button>
        </div>
      </div>

      {/* Save Trigger Button */}
      <button
        onClick={handleSaveSettings}
        className="w-full py-4 bg-slate-900 shadow-xs text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer text-center"
      >
        Update Child Safety Matrix
      </button>

      {/* Version context & Onboarding Tour */}
      <div className="space-y-3.5 text-center pt-2">
        {onReplayOnboarding && (
          <button
            type="button"
            onClick={onReplayOnboarding}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-[11px] font-bold transition-all border border-slate-200/60 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-[#1A5276]" />
            Replay Interactive Onboarding Tour
          </button>
        )}
        <div className="text-center text-[10px] text-slate-400 font-mono">
          GuardianEye Premium Console v1.0.4 • Device Sync Token: SEC-09BFF3A
        </div>
      </div>
    </div>
  );
}
