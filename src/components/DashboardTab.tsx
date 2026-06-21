import React, { useState, useEffect } from "react";
import { 
  Smartphone, Plus, RefreshCw, QrCode, Clipboard, Clock, 
  AlertTriangle, Check, ShieldCheck, Battery, Zap, MessageSquare, Globe, Sparkles, Bot, ArrowRight,
  ShieldAlert
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Child, SecurityAlert } from "../types";
import { getWeeklySummaryAI, createPairingSession } from "../lib/api";

interface DashboardTabProps {
  childrenData: Child[];
  alerts: SecurityAlert[];
  onRefresh: () => void;
  onSimulateNewAlert: (platform: string, category: string, snippet: string, severity: "high" | "medium" | "low") => void;
  childConnected: boolean;
  onResetState: () => void;
  activePairingCode: string;
  setActivePairingCode: (code: string) => void;
  onResolveAlert?: (id: string) => void;
}

export default function DashboardTab({
  childrenData,
  alerts,
  onRefresh,
  onSimulateNewAlert,
  childConnected,
  onResetState,
  activePairingCode,
  setActivePairingCode,
  onResolveAlert
}: DashboardTabProps) {
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [pairingCode, setPairingCode] = useState(activePairingCode || "102833");
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [simText, setSimText] = useState("");
  const [simPlatform, setSimPlatform] = useState("WhatsApp");
  const [simSeverity, setSimSeverity] = useState<"high" | "medium" | "low">("high");

  // Gemini AI Weekly summary state
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);

  const fetchWeeklySummary = async () => {
    setLoadingSummary(true);
    try {
      const data = await getWeeklySummaryAI();
      setAiSummary(data.summary);
    } catch (e) {
      console.error("Failed to fetch weekly summary:", e);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (childConnected) {
      fetchWeeklySummary();
    } else {
      setAiSummary("");
    }
  }, [childConnected, alerts.length, alerts.filter(a => a.resolved).length]);

  // Recharts application screen time data
  const chartData = [
    { name: "WhatsApp", minutes: 85, color: "#25D366" },
    { name: "TikTok", minutes: 50, color: "#000000" },
    { name: "YouTube Kids", minutes: 40, color: "#FF0000" },
    { name: "Chrome", minutes: 25, color: "#4285F4" },
    { name: "Telegram", minutes: 15, color: "#0088cc" },
  ];

  // Daily screen time chart data (last 7 days)
  const dailyScreenTimeData = [
    { day: "Mon", hours: 1.8, label: "1h 48m" },
    { day: "Tue", hours: 2.2, label: "2h 12m" },
    { day: "Wed", hours: 1.5, label: "1h 30m" },
    { day: "Thu", hours: 2.5, label: "2h 30m" },
    { day: "Fri", hours: 2.9, label: "2h 54m" },
    { day: "Sat", hours: 3.4, label: "3h 24m" },
    { day: "Sun", hours: 2.25, label: "2h 15m" } // Today
  ];

  const mostUsedApps = [
    { name: "WhatsApp", time: "2h 15m", percentage: 45, color: "bg-emerald-500", icon: "💬" },
    { name: "TikTok", time: "1h 30m", percentage: 30, color: "bg-stone-900", icon: "🎵" },
    { name: "Instagram", time: "1h 00m", percentage: 20, color: "bg-rose-500", icon: "📸" },
    { name: "Chrome", time: "15m", percentage: 5, color: "bg-blue-500", icon: "🌐" }
  ];

  // Quick pre-packaged toxicity templates from West African schools & online scenarios
  const threatTemplates = [
    { text: "Send me the picture of your school badge or I will post online", label: "Grooming/Extortion", platform: "Instagram", severity: "high" as const },
    { text: "Your boy on the street says you are a dummy. You will run when you see us", label: "Cyberbullying", platform: "WhatsApp", severity: "high" as const },
    { text: "How to download modified school exams exam leaks cheat free", label: "Unsafe Browsing", platform: "Chrome", severity: "medium" as const },
    { text: "Baba send the card details or MTN pin I will double it now", label: "Phishing Scams (Naija Target)", platform: "WhatsApp", severity: "medium" as const },
  ];

  const handleFetchPairingCode = async () => {
    setGeneratingCode(true);
    // Secure 6-digit random code generation (Parent view)
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await createPairingSession(randomCode);
    } catch (e) {
      console.error("Failed to register pairing session in Firebase:", e);
    }
    setPairingCode(randomCode);
    setActivePairingCode(randomCode);
    setGeneratingCode(false);
    setShowPairingModal(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerSimul = () => {
    let cat = "Local Slang/Threat";
    if (simPlatform === "Chrome") cat = "Inappropriate Search";
    if (simPlatform === "Instagram") cat = "Social Threat";
    onSimulateNewAlert(simPlatform, cat, simText || "Simulated chat warning triggers on mobile", simSeverity);
    setSimText("");
  };

  const activeSOSAlerts = alerts.filter(a => a.isSOS && !a.resolved);

  return (
    <div className="space-y-6">
      {/* Visual Distinct Full-Width RED SOS Banner for Dashboard */}
      {activeSOSAlerts.length > 0 && (
        <div className="space-y-3.5" id="dashboard-sos-banners">
          {activeSOSAlerts.map(sos => (
            <div 
              key={sos.id} 
              id={`dashboard-sos-alarm-${sos.id}`}
              className="bg-red-650 text-white p-5 rounded-3xl shadow-[0_10px_25px_rgba(220,38,38,0.2)] border border-red-500/80 animate-pulse text-left relative overflow-hidden"
              style={{ animationDuration: '3.5s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-650 to-red-600 opacity-95 z-0" />
              
              <div className="space-y-2 relative z-10 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-red-8D0 bg-red-800 text-red-100 py-0.5 px-2 rounded-full border border-red-500/30">
                    URGENT SOS panic
                  </span>
                  <span className="text-red-200 text-xs font-bold font-mono">{sos.timestamp}</span>
                </div>
                
                <h3 className="font-extrabold text-base sm:text-lg font-display tracking-tight leading-snug">
                  EMERGENCY: Child triggered SOS
                </h3>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-red-100 font-medium">
                  <span>📍 near Ikeja, Lagos</span>
                  <span className="text-red-400">|</span>
                  <span className="font-mono text-[10px] bg-red-900/40 px-2 py-0.5 rounded border border-red-500/20">
                    6.5979° N, 3.3444° E
                  </span>
                </div>
              </div>
              
              <div className="mt-3.5 pt-3.5 border-t border-red-500/20 relative z-10 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => onResolveAlert?.(sos.id)}
                  className="w-full sm:w-auto py-2 px-4 bg-white text-rose-700 hover:bg-rose-50 font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1 font-display uppercase tracking-wider"
                >
                  <Check className="w-3.5 h-3.5 text-rose-600 stroke-[3]" /> Resolve & Dismiss
                </button>
                <div className="text-[10px] text-red-100/90 font-medium text-center sm:text-left">
                  Alarm active on child device. GPS coordinates logging live.
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1A5276]/5 border border-[#1A5276]/15 rounded-2xl p-3.5 text-center transition-all hover:shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-[#1A5276]" /> Screen Time
          </div>
          <p className="text-xl font-extrabold font-display text-slate-900 mt-1">
            {childConnected ? "2h 15m" : "0m"}
          </p>
          <span className="text-[9px] text-[#1A5276] font-bold bg-blue-50 px-1.5 py-0.5 rounded-full mt-1.5 inline-block">
            Limit: 3h 0m
          </span>
        </div>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3.5 text-center transition-all hover:shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-500" /> Weekly Alerts
          </div>
          <p className="text-xl font-extrabold font-display text-rose-700 mt-1">
            {alerts.length}
          </p>
          <span className="text-[9px] text-rose-650 font-bold bg-rose-100/50 px-1.5 py-0.5 rounded-full mt-1.5 inline-block">
            {alerts.filter(a => !a.resolved).length} Unreviewed
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-center transition-all hover:shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Safe Zone
          </div>
          <p className="text-xl font-extrabold font-display text-emerald-750 mt-1">
            {childConnected ? "Active" : "Awaiting"}
          </p>
          <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1.5 inline-block">
            Shield On
          </span>
        </div>
      </div>

      {/* Weekly AI Protection Summary */}
      {childConnected && (
        <div className="bg-gradient-to-br from-[#1A5276]/10 to-blue-50 border border-blue-150/80 rounded-3xl p-5 text-left relative overflow-hidden shadow-2xs">
          <div className="absolute right-[-15px] top-[-15px] text-[#1A5276]/10 pointer-events-none">
            <Bot className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 bg-blue-100 text-[#1A5276] rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </span>
            <div>
              <span className="font-extrabold text-xs text-slate-800 font-display block">Weekly AI Safety Summary</span>
              <span className="text-[9px] font-bold text-[#1A5276] uppercase tracking-wider block">GuardianEye AI Analytics</span>
            </div>
            
            <button 
              onClick={fetchWeeklySummary}
              disabled={loadingSummary}
              className="ml-auto p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-[#1A5276] transition-all disabled:opacity-45"
              title="Regenerate summary"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="bg-white/90 border border-white rounded-2xl p-4 relative z-10 shadow-3xs">
            {loadingSummary ? (
              <div className="space-y-2 py-1">
                <div className="h-3.5 bg-slate-100 rounded-md animate-pulse w-full"></div>
                <div className="h-3.5 bg-slate-100 rounded-md animate-pulse w-5/6"></div>
                <div className="h-3 bg-slate-100 rounded-md animate-pulse w-2/3"></div>
              </div>
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed font-semibold font-sans">
                {aiSummary || "Standard behavior observed. Connect child device & generate test logs under Settings or using the simulator to parse safety analysis."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Children Status Board */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg text-slate-900 font-display">Monitored Kids</h2>
            <p className="text-xs text-slate-500">Connected devices on current license</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onRefresh}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleFetchPairingCode}
              disabled={generatingCode}
              className="py-1.5 px-3 bg-[#1A5276] hover:bg-[#154360] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Pair Device
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {childrenData.map((child) => (
            <div 
              key={child.id}
              className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-white rounded-2xl border border-slate-100 inline-block shadow-2xs">
                  {child.avatar}
                </span>
                <div>
                  <h3 className="font-bold text-slate-800 font-display">{child.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      childConnected 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {childConnected ? (
                        <>
                          <span className="relative flex h-2 w-2 mr-0.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          Active
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-0.5 animate-pulse"></span>
                          Awaiting Code Setup
                        </>
                      )}
                    </span>
                    <span className="text-slate-400 text-[10px] flex items-center gap-0.5">
                      <Battery className="w-3.5 h-3.5 text-slate-500" /> {childConnected ? child.battery : "??%"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400">Last Synced</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  {childConnected ? "Just now" : child.lastActive}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Screen Time and App Usage Panel */}
      {childConnected && (
        <div className="grid grid-cols-1 gap-4">
          {/* Daily Screen Time Chart */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-3 text-left">
              <div>
                <h3 className="font-extrabold text-[#1A5276] text-base font-display">Daily Screen Time</h3>
                <p className="text-[10px] text-slate-400">Total active hours during last 7 days</p>
              </div>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                Avg: 2.3h /day
              </span>
            </div>

            <div className="h-44 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyScreenTimeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} unit="h" />
                  <Tooltip 
                    contentStyle={{ background: "#0f172a", color: "#f8fafc", borderRadius: "12px", border: "none", fontSize: "11px" }}
                    formatter={(value) => [`${value} hours`, "Active"]}
                    labelStyle={{ fontWeight: "bold", color: "#38bdf8" }}
                  />
                  <Bar dataKey="hours" fill="#1A5276" radius={[6, 6, 0, 0]} barSize={22}>
                    {dailyScreenTimeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === dailyScreenTimeData.length - 1 ? "#38bdf8" : "#1A5276"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Most Used Apps */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs text-left">
            <div>
              <h3 className="font-extrabold text-[#1A5276] text-base font-display">Most Used Screen Apps</h3>
              <p className="text-[10px] text-slate-400 mb-4">Top social and communication platforms on child device</p>
            </div>

            <div className="space-y-3.5">
              {mostUsedApps.map((app) => (
                <div key={app.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{app.icon}</span>
                      <span className="text-slate-800">{app.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>{app.time}</span>
                      <span className="text-[9px] text-[#1A5276] bg-blue-50 px-1.5 py-0.5 rounded font-black">{app.percentage}%</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`${app.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${app.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Safety Threat Demonstrator Panel */}
      <div className="bg-[#1A5276]/5 rounded-3xl p-5 border border-[#1A5276]/10">
        <h2 className="font-bold text-base text-slate-900 font-display flex items-center gap-1.5">
          <Zap className="w-5 h-5 text-amber-500" /> Safety Alert Simulator
        </h2>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          Demo tool to verify cyberbullying flags & toxicity guards. Pick a real-world Nigerian online risk below to trigger an instant warning alert.
        </p>

        {/* Templates */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {threatTemplates.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSimulateNewAlert(item.platform, item.label, item.text, item.severity);
              }}
              className="text-left p-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] leading-snug font-medium transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#1A5276] text-[10px]">{item.platform}</span>
                <span className="text-[9px] bg-rose-50 text-rose-600 font-bold px-1 rounded">Pre-made</span>
              </div>
              <span className="text-slate-600 line-clamp-2 italic">"{item.text}"</span>
            </button>
          ))}
        </div>

        {/* Custom manual simulation input */}
        <div className="mt-4 pt-4 border-t border-slate-200/60">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Or write custom dialogue to monitor:</label>
          <div className="flex flex-col gap-2">
            <input 
              type="text"
              value={simText}
              onChange={(e) => setSimText(e.target.value)}
              placeholder="e.g., 'Go kill yourself, nobody wants you'"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276]"
            />
            <div className="flex gap-2">
              <select
                value={simPlatform}
                onChange={(e) => setSimPlatform(e.target.value)}
                className="flex-1 min-w-0 bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs focus:outline-none"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Chrome">Chrome Search</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok comments</option>
              </select>
              <button
                onClick={triggerSimul}
                disabled={!simText}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Policy Reset - Admin Tool */}
      <div className="text-center pt-2">
        <button
          onClick={onResetState}
          className="text-slate-400 hover:text-slate-600 text-xs inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-all"
        >
          <RefreshCw className="w-3 h-3" /> Reset App Demo State
        </button>
      </div>

      {/* Pairing Drawer / Modal Dialog */}
      {showPairingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-100 text-center relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-xl font-display text-slate-900">Pair Child Smartphone</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Open GuardianEye app on your child's phone, select **"I'm a Child"**, and enter this pairing code.
            </p>

            {/* QR Code Placeholder with Custom Visual SVG */}
            <div className="my-6 bg-slate-50 p-4 rounded-2xl inline-block border border-slate-200">
              <div className="w-36 h-36 mx-auto bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center p-3 relative">
                <QrCode className="w-full h-full text-slate-800" />
                <div className="absolute inset-0 flex items-center justify-center bg-white/10">
                  <div className="p-1 px-2.5 bg-[#1A5276] text-white rounded-lg text-[9px] font-bold shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> SECURE PIN
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-3">Scan to Auto-Pair Device</p>
            </div>

            {/* 6 Digit Numeric Code */}
            <div className="mb-6">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">OR ENTER 6-DIGIT CODE</span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-3xl font-bold font-mono tracking-widest text-[#1A5276] bg-blue-50/80 px-4 py-2.5 rounded-2xl border border-[#1A5276]/10">
                  {pairingCode}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-300 text-slate-600 transition-all"
                  title="Copy Code"
                >
                  {copied ? <Check className="text-emerald-600 w-5 h-5" /> : <Clipboard className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[10px] text-rose-500 font-semibold mt-2.5">Expires in 5 minutes</p>
            </div>

            {/* Simulated Live Connection Wait Status */}
            <div className="bg-slate-50/80 rounded-2xl p-3 flex items-center justify-center gap-2 border border-slate-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-600">Waiting for local device pair socket-handshake...</span>
            </div>

            {/* Close */}
            <button
              onClick={() => setShowPairingModal(false)}
              className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Done / Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
