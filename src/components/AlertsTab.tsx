import React, { useState } from "react";
import { 
  Bell, Check, AlertTriangle, ShieldCheck, Heart, MessageSquare, 
  Globe, EyeOff, ShieldAlert, BadgeHelp, Users 
} from "lucide-react";
import { SecurityAlert, TrackedContact } from "../types";

interface AlertsTabProps {
  alerts: SecurityAlert[];
  onResolveAlert: (id: string) => void;
  contacts?: TrackedContact[];
  onUpdateContactStatus?: (id: string, status: "Trusted" | "Unfamiliar" | "Blocked") => void;
}

export default function AlertsTab({ alerts, onResolveAlert, contacts, onUpdateContactStatus }: AlertsTabProps) {
  // Feature filter: "all" | "chat" | "content" | "bullying"
  const [featureFilter, setFeatureFilter] = useState<"all" | "chat" | "content" | "bullying">("all");

  const getAlertType = (alert: SecurityAlert): "Chat" | "Content" | "Bullying" => {
    if (alert.id.startsWith("img-alert") || alert.category?.toLowerCase().includes("visual") || alert.category?.toLowerCase().includes("content") || alert.imageThumbnail) {
      return "Content";
    }
    if (alert.id.startsWith("bully-alert") || alert.platform?.toLowerCase().includes("social") || alert.platform?.toLowerCase().includes("feed") || alert.appIcon === "MessageSquareWarning") {
      return "Bullying";
    }
    return "Chat";
  };

  const getAlertRiskLevel = (alert: SecurityAlert): "Suspicious" | "High Risk" | "Flagged" => {
    if (alert.id.startsWith("img-alert") || alert.category?.toLowerCase().includes("content") || alert.category?.toLowerCase().includes("visual") || alert.imageThumbnail) {
      return "Flagged";
    }
    if (alert.severity === "high") {
      return "High Risk";
    }
    return "Suspicious";
  };

  const filteredAlerts = alerts.filter(alert => {
    // Exclude active (unresolved) SOS alerts from regular feed list since they have a prominent top-level banner
    if (alert.isSOS && !alert.resolved) return false;

    if (featureFilter === "all") return true;
    const type = getAlertType(alert).toLowerCase();
    return type === featureFilter;
  });

  const getRiskStyle = (risk: "Suspicious" | "High Risk" | "Flagged") => {
    switch (risk) {
      case "High Risk":
        return {
          bg: "bg-rose-50 border-rose-150",
          badge: "bg-rose-100 text-rose-800 border border-rose-200",
          accentColor: "bg-rose-500",
          animate: "animate-pulse"
        };
      case "Flagged":
        return {
          bg: "bg-amber-50/65 border-amber-100",
          badge: "bg-amber-100 text-amber-800 border border-amber-200",
          accentColor: "bg-amber-500",
          animate: ""
        };
      default:
        return {
          bg: "bg-slate-50/50 border-slate-150",
          badge: "bg-slate-150 text-slate-700 border border-slate-200",
          accentColor: "bg-slate-400",
          animate: ""
        };
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platLower = platform.toLowerCase();
    if (platLower.includes("feed") || platLower.includes("bullying") || platLower.includes("social")) {
      return (
        <div className="relative inline-block" id="cyberbullying-platform-icon">
          <MessageSquare className="w-5 h-5 text-rose-600" />
          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-600 rounded-full flex items-center justify-center text-[9px] font-black text-white leading-none shadow-3xs">
            !
          </div>
        </div>
      );
    }
    switch (platLower) {
      case "whatsapp":
        return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      case "chrome":
      case "chrome web browser":
      case "safari":
        return <Globe className="w-5 h-5 text-blue-600" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-[#1A5276]" />;
    }
  };

  const activeSOSAlerts = alerts.filter(a => a.isSOS && !a.resolved);

  return (
    <div className="space-y-6">
      {/* Visual Distinct Full-Width RED SOS Banner */}
      {activeSOSAlerts.length > 0 && (
        <div className="space-y-3.5" id="sos-active-banners-container">
          {activeSOSAlerts.map(sos => (
            <div 
              key={sos.id} 
              id={`sos-alarm-banner-${sos.id}`}
              className="bg-red-600 text-white p-5 rounded-3xl shadow-[0_10px_30px_rgba(220,38,38,0.25)] flex flex-col md:flex-row md:items-center justify-between gap-5 border border-red-500 animate-pulse text-left relative overflow-hidden"
              style={{ animationDuration: '4s' }}
            >
              {/* Soft background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-650 to-red-650 opacity-95 z-0" />
              
              <div className="space-y-2.5 relative z-10 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-red-800 text-white py-1 px-3 rounded-full border border-red-500/30">
                    CRITICAL LIFE SAFETY EMERGENCY
                  </span>
                  <span className="text-red-200 text-[11px] font-bold font-mono">{sos.timestamp}</span>
                </div>
                
                <h3 className="font-extrabold text-lg sm:text-xl font-display tracking-tight leading-none text-white">
                  EMERGENCY: Child triggered SOS
                </h3>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-red-150 font-semibold font-display">
                  <span>
                    📍 Location: <strong className="text-white underline">Near Ikeja, Lagos (GPS active)</strong>
                  </span>
                  <span className="text-red-400 font-light hidden sm:inline">|</span>
                  <span className="font-mono text-[11px] bg-red-900/40 px-2 py-0.5 rounded border border-red-500/10">
                    Coords: 6.5979° N, 3.3444° E
                  </span>
                </div>
                
                <p className="text-xs text-red-50 leading-relaxed font-semibold bg-red-900/30 p-3 rounded-2xl border border-red-500/20 max-w-2xl">
                  {sos.aiAssessment}
                </p>
              </div>
              
              <div className="shrink-0 flex items-center pt-2 md:pt-0 relative z-10 w-full md:w-auto">
                <button
                  id={`resolve-sos-${sos.id}`}
                  onClick={() => onResolveAlert(sos.id)}
                  className="w-full md:w-auto py-3 px-5 bg-white text-rose-700 hover:bg-rose-50 font-black text-xs rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 font-display uppercase tracking-wider"
                >
                  <Check className="w-4 h-4 text-rose-600 stroke-[3]" /> Resolve Alarm
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab intro */}
      <div className="flex flex-col gap-3 text-left">
        <div>
          <h2 className="font-extrabold text-lg text-slate-900 font-display">Consolidated Alerts</h2>
          <p className="text-xs text-slate-500">Unified digital safety monitor: private chats, media filters, & social feeds</p>
        </div>

        {/* Feature Filters Pill Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl w-full text-[10px] sm:text-xs">
          <button
            onClick={() => setFeatureFilter("all")}
            className={`flex-1 py-1.5 rounded-xl font-bold uppercase transition-all text-center tracking-tight text-[10px] ${
              featureFilter === "all" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFeatureFilter("chat")}
            className={`flex-1 py-1.5 rounded-xl font-bold uppercase transition-all text-center tracking-tight text-[10px] ${
              featureFilter === "chat" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setFeatureFilter("content")}
            className={`flex-1 py-1.5 rounded-xl font-bold uppercase transition-all text-center tracking-tight text-[10px] ${
              featureFilter === "content" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setFeatureFilter("bullying")}
            className={`flex-1 py-1.5 rounded-xl font-bold uppercase transition-all text-center tracking-tight text-[10px] ${
              featureFilter === "bullying" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Bullying
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-4 shadow-3xs animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100/50">
              <ShieldCheck className="w-8 h-8 text-emerald-600 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 font-display text-sm">No Alerts Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Your child's activity is actively being monitored with GuardianEye safe-shields.
              </p>
            </div>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const type = getAlertType(alert);
            const risk = getAlertRiskLevel(alert);
            const rStyles = getRiskStyle(risk);

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden bg-white shadow-3xs ${
                  alert.resolved ? "opacity-50 border-slate-200" : `${rStyles.bg} ${rStyles.animate}`
                }`}
              >
                {/* Left accent color bar */}
                <div className={`absolute top-0 left-0 bottom-0 w-[4.5px] ${rStyles.accentColor}`} />

                {/* Top Metas */}
                <div className="flex items-center justify-between mb-3 text-left">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-xl shadow-3xs">
                      {getPlatformIcon(alert.platform)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                          Type: <span className="text-[#1A5276]">{type} Monitor</span>
                        </span>
                      </div>
                      <span className="text-xs font-extrabold font-display text-slate-900 block mt-0.5">
                        {alert.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 block font-semibold">{alert.timestamp}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider ${rStyles.badge} mt-1.5`}>
                      {risk}
                    </span>
                  </div>
                </div>

                {/* Flagged Snippet */}
                <div className="bg-white/90 border border-slate-100 rounded-2xl p-4 mb-3.5 text-left">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                    Monitored Content
                  </span>
                  <p className="text-sm italic font-medium text-slate-800 font-display leading-relaxed">
                    "{alert.snippet}"
                  </p>
                </div>

                {/* Visual Attachment Preview if any */}
                {alert.imageThumbnail && (
                  <div className="bg-white/95 border border-slate-100 rounded-2xl p-3.5 mb-3.5 text-left">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
                      Flagged Image Attachment (Quarantined)
                    </span>
                    <div className="flex gap-4 items-center">
                      <div className="relative w-32 h-24 bg-rose-50 border border-rose-100/50 rounded-xl overflow-hidden flex items-center justify-center shadow-3xs shrink-0">
                        <img
                          src={alert.imageThumbnail}
                          alt="Quarantined attachment"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover blur-xs"
                        />
                        <div className="absolute top-1 left-1 bg-rose-600 text-white font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                          Quarantined
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide block">⚠️ Threat Block Active</span>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          This media attachment contains flagged items or text blocks. The visual rendering is restricted.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Assessment analysis explanation */}
                <div className="bg-[#1A5276]/5 rounded-2xl p-3.5 flex items-start gap-3 border border-[#1A5276]/10 text-left mb-4">
                  <div className="p-1 bg-white border border-[#1A5276]/10 rounded-lg text-[#1A5276]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      AI Assessment Explanation
                    </span>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed font-semibold">
                      {alert.aiAssessment || "Analyzing safety triggers..."}
                    </p>
                  </div>
                </div>

                {/* Unknown Contact Action Suggestion Banner */}
                {(() => {
                  let extractedContactName = "";
                  if (alert.platform?.startsWith("Chat Monitor (")) {
                    const match = alert.platform.match(/Chat Monitor \(([^)]+)\)/);
                    if (match) {
                      extractedContactName = match[1];
                    }
                  }
                  
                  if (extractedContactName) {
                    const matchedContact = contacts?.find(
                      c => c.name.toLowerCase() === extractedContactName.toLowerCase() ||
                           extractedContactName.toLowerCase().includes(c.name.toLowerCase()) ||
                           c.name.toLowerCase().includes(extractedContactName.toLowerCase())
                    );

                    if (matchedContact && matchedContact.safetyStatus === "Unfamiliar") {
                      return (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-4 text-left space-y-3 shadow-3xs animate-fade-in">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-amber-500/20 text-amber-700 rounded-lg shrink-0">
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-black tracking-wider text-amber-800 block">
                                Unknown Contact Banner Suggestion
                              </span>
                              <p className="text-xs text-slate-700 leading-normal font-semibold mt-0.5">
                                <strong>{matchedContact.name}</strong> is currently an unregistered/unknown contact on this device and has triggered this alert. Review and manage their safety level directly below:
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => onUpdateContactStatus?.(matchedContact.id, "Trusted")}
                              className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all shadow-3xs active:scale-95"
                            >
                              ✓ Approve (Trusted)
                            </button>
                            <button
                              onClick={() => onUpdateContactStatus?.(matchedContact.id, "Blocked")}
                              className="py-1.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold transition-all shadow-3xs active:scale-95"
                            >
                              ⚠ Block (Hide Messages)
                            </button>
                          </div>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">
                    Device User: <strong className="text-slate-600">{alert.childName}</strong>
                  </span>
                  <div className="flex gap-2">
                    {!alert.resolved ? (
                      <button
                        onClick={() => onResolveAlert(alert.id)}
                        className="py-1.5 px-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-3xs active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Mark as Reviewed
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 py-1.5 px-3 rounded-xl inline-flex items-center gap-1">
                        ✓ Reviewed & Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cyberbullying Tip Content Card */}
      <div className="p-5 bg-gradient-to-br from-[#1A5276] to-[#123e59] text-white rounded-3xl relative overflow-hidden text-left shadow-md">
        <div className="relative z-10 space-y-2">
          <BadgeHelp className="w-8 h-8 text-blue-100" />
          <h3 className="font-bold text-base font-display">Guardian Console Advice</h3>
          <p className="text-xs text-blue-100/90 leading-relaxed max-w-sm">
            GuardianEye consolidates chat alerts, media triggers, and direct cyberbullying indicators. Review flagged summaries, talk calmly to your teen, and update your security rules in the <strong>Settings tab</strong>.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <Bell className="w-44 h-44" />
        </div>
      </div>
    </div>
  );
}

