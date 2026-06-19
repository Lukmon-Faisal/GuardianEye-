import { useState, useEffect, useRef } from "react";
import { 
  Shield, Bell, Users, Settings, Smartphone, RefreshCw, 
  HelpCircle, LogOut, ArrowRight, Activity, Globe, MessageSquare, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import RoleSelector from "./components/RoleSelector";
import DashboardTab from "./components/DashboardTab";
import AlertsTab from "./components/AlertsTab";
import ContactsTab from "./components/ContactsTab";
import SettingsTab from "./components/SettingsTab";
import ChildView from "./components/ChildView";
import Onboarding from "./components/Onboarding";
import { Child, SecurityAlert, ParentTab, TrackedContact } from "./types";

export default function App() {
  const [role, setRole] = useState<"selector" | "parent" | "child">("selector");
  const [currentTab, setCurrentTab] = useState<ParentTab["tab"]>("dashboard");
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem("guardianeye_onboarded") !== "true";
    } catch {
      return true;
    }
  });
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [childConnected, setChildConnected] = useState(false);
  const [activePairingCode, setActivePairingCode] = useState<string>("102833");
  const [networkLoading, setNetworkLoading] = useState(false);
  const [toast, setToast] = useState<{ id: string; title: string; message: string; type: string } | null>(null);

  const [contacts, setContacts] = useState<TrackedContact[]>([]);
  const alertsRef = useRef<SecurityAlert[]>([]);

  // Fetch state on mount and on tab transitions
  const fetchState = async () => {
    setNetworkLoading(true);
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setChildrenList(data.children || []);
      setChildConnected(data.childConnected);

      const alertsRes = await fetch("/api/alerts");
      const alertsData: SecurityAlert[] = (await alertsRes.json()) || [];

      try {
        const contactsRes = await fetch("/api/contacts");
        if (contactsRes.ok) {
          const contactsData = await contactsRes.json();
          setContacts(contactsData || []);
        }
      } catch (err) {
        console.error("Networking error syncing contacts:", err);
      }

      // Determine if there is a new unresolved alert that wasn't previously loaded
      if (alertsRef.current.length > 0) {
        const prevIds = new Set(alertsRef.current.map(a => a.id));
        const newUnresolved = alertsData.find(a => !prevIds.has(a.id) && !a.resolved);
        if (newUnresolved) {
          let alertType = "Chat";
          if (newUnresolved.isSOS) {
            alertType = "Emergency SOS";
          } else if (newUnresolved.id.startsWith("img-alert") || newUnresolved.category?.toLowerCase().includes("content") || newUnresolved.imageThumbnail) {
            alertType = "Content";
          } else if (newUnresolved.id.startsWith("bully-alert") || newUnresolved.platform?.toLowerCase().includes("social") || newUnresolved.platform?.toLowerCase().includes("feed")) {
            alertType = "Bullying";
          }

          setToast({
            id: newUnresolved.id,
            title: `New ${alertType} Alert`,
            message: newUnresolved.snippet || "Flagged content detected.",
            type: alertType
          });

          // Dismiss toast automatically after 4.5 seconds
          setTimeout(() => {
            setToast(prev => prev?.id === newUnresolved.id ? null : prev);
          }, 4500);
        }
      }

      alertsRef.current = alertsData;
      setAlerts(alertsData || []);
    } catch (e) {
      console.error("Networking error syncing server state:", e);
      // local fallback if needed
    } finally {
      setNetworkLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, [role]);

  // Poll alerts every 4 seconds when role is parent to catch newly generated alerts and show notifications
  useEffect(() => {
    if (role !== "parent") return;
    const interval = setInterval(() => {
      fetchState();
    }, 4000);
    return () => clearInterval(interval);
  }, [role, alerts.map(a => `${a.id}-${a.resolved}`).join(",")]);

  // Handle manual alert simulations
  const handleSimulateNewAlert = async (
    platform: string, 
    category: string, 
    snippet: string, 
    severity: "high" | "medium" | "low"
  ) => {
    try {
      const res = await fetch("/api/alerts/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, category, snippet, severity })
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle resolving an alert
  const handleResolveAlert = async (id: string) => {
    try {
      const res = await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle updating contact safety status
  const handleUpdateContactStatus = async (id: string, safetyStatus: "Trusted" | "Unfamiliar" | "Blocked") => {
    try {
      const res = await fetch("/api/contacts/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, safetyStatus })
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset entire simulation state
  const handleResetDemoState = async () => {
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        await fetchState();
        setRole("selector");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Callback when a child enters pairing code successfully
  const handlePairingSuccess = async () => {
    setChildConnected(true);
    await fetchState();
  };

  return (
    <div className="min-h-[100dvh] md:min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center overflow-x-hidden">
      
      {/* Main Container - Framed like a premium device shell on wide screens to reinforce Mobile-First */}
      <main className="w-full md:max-w-md bg-white min-h-[100dvh] md:min-h-[92vh] md:my-6 md:rounded-3xl md:border md:border-slate-150 md:shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Simulated Push Notification Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -70, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`absolute top-18 left-4 right-4 text-white p-4 rounded-2xl shadow-xl z-50 flex items-start gap-3 select-none text-left border ${
                toast.type === "Emergency SOS" 
                  ? "bg-red-650 border-red-500 shadow-[0_4px_25px_rgba(224,36,36,0.35)] animate-bounce" 
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              <div className={`p-2 rounded-xl ${
                toast.type === "Emergency SOS" 
                  ? "bg-red-800 text-white animate-pulse" 
                  : "bg-[#1A5276]/35 text-amber-400"
              }`}>
                <Bell className="w-4.5 h-4.5 animate-bounce" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-black tracking-widest font-sans ${
                    toast.type === "Emergency SOS" ? "text-red-100" : "text-[#4faae8]"
                  }`}>
                    {toast.title}
                  </span>
                  <button
                    onClick={() => setToast(null)}
                    className={`p-1 rounded-lg transition-all ${
                      toast.type === "Emergency SOS" 
                        ? "hover:bg-red-700 text-red-200 hover:text-white" 
                        : "hover:bg-slate-850 text-slate-400 hover:text-white"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-semibold font-display text-slate-100 leading-snug">
                  "{toast.message}"
                </p>
                <div className={`flex items-center justify-between pt-1.5 border-t mt-1 ${
                  toast.type === "Emergency SOS" ? "border-red-500/30" : "border-slate-800"
                }`}>
                  <span className={`text-[9px] font-medium ${
                    toast.type === "Emergency SOS" ? "text-red-200" : "text-slate-400"
                  }`}>
                    {toast.type === "Emergency SOS" ? "⚠️ IMMEDIATE RESPONSE REQUIRED" : "Guardian Protective Shield"}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentTab("alerts");
                      setToast(null);
                    }}
                    className={`text-[9px] font-black transition-colors flex items-center gap-0.5 uppercase tracking-wide ${
                      toast.type === "Emergency SOS" ? "text-white hover:text-red-100" : "text-blue-300 hover:text-blue-200"
                    }`}
                  >
                    Review Alert <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* App Header Branding */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-30 select-none">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#1A5276] text-white rounded-xl">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900 tracking-tight font-display mb-0">
                Guardian<span className="text-[#1A5276]">Eye</span>
              </h1>
              <span className="text-[9px] text-[#1A5276]/90 font-bold tracking-widest uppercase block">
                Online Safety Guard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {role === "parent" && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Parent Live
              </span>
            )}
            {role === "child" && (
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                </span>
                Child Shield
              </span>
            )}
            {role === "selector" && (
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                Setup
              </span>
            )}
            
            {role !== "selector" && (
              <button
                onClick={() => {
                  setRole("selector");
                  setCurrentTab("dashboard");
                }}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Return to selection"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Content Body with Animation transitions */}
        <div className="flex-1 px-5 py-6 overflow-y-auto pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${role}-${currentTab}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {role === "selector" && (
                <RoleSelector onSelectRole={(selectedRole) => setRole(selectedRole)} />
              )}

              {role === "child" && (
                <ChildView 
                  childConnected={childConnected} 
                  onPairSuccess={handlePairingSuccess} 
                  activePairingCode={activePairingCode}
                  onMessageAnalyzed={fetchState}
                  contacts={contacts}
                  onRefreshContacts={fetchState}
                />
              )}

              {role === "parent" && (
                <>
                  {currentTab === "dashboard" && (
                    <DashboardTab
                      childrenData={childrenList}
                      alerts={alerts}
                      onRefresh={fetchState}
                      onSimulateNewAlert={handleSimulateNewAlert}
                      childConnected={childConnected}
                      onResetState={handleResetDemoState}
                      activePairingCode={activePairingCode}
                      setActivePairingCode={setActivePairingCode}
                      onResolveAlert={handleResolveAlert}
                    />
                  )}

                  {currentTab === "alerts" && (
                    <AlertsTab 
                      alerts={alerts} 
                      onResolveAlert={handleResolveAlert} 
                      contacts={contacts}
                      onUpdateContactStatus={handleUpdateContactStatus}
                    />
                  )}

                  {currentTab === "contacts" && (
                    <ContactsTab 
                      contacts={contacts}
                      onRefresh={fetchState}
                    />
                  )}

                  {currentTab === "settings" && (
                    <SettingsTab onReplayOnboarding={() => setShowOnboarding(true)} />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation for PARENT VIEW */}
        {role === "parent" && (
          <nav className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-100 py-2.5 px-4 flex justify-around z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] select-none">
            {/* Dashboard Nav Button */}
            <button
              onClick={() => setCurrentTab("dashboard")}
              className={`flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition-all ${
                currentTab === "dashboard" 
                  ? "text-[#1A5276]" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px]">Dashboard</span>
            </button>

            {/* Alerts Nav Button */}
            <button
              onClick={() => setCurrentTab("alerts")}
              className={`flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition-all relative ${
                currentTab === "alerts" 
                  ? "text-[#1A5276]" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="text-[10px]">Alerts</span>
              {alerts.filter(a => !a.resolved).length > 0 && (
                <span className="absolute top-2.5 right-2 bg-rose-500 text-white min-w-4 h-4 text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white px-0.5">
                  {alerts.filter(a => !a.resolved).length}
                </span>
              )}
            </button>

            {/* Contacts Nav Button */}
            <button
              onClick={() => setCurrentTab("contacts")}
              className={`flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition-all ${
                currentTab === "contacts" 
                  ? "text-[#1A5276]" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px]">Contacts</span>
            </button>

            {/* Settings Nav Button */}
            <button
              onClick={() => setCurrentTab("settings")}
              className={`flex flex-col items-center gap-1 p-2 text-xs font-bold rounded-xl transition-all ${
                currentTab === "settings" 
                  ? "text-[#1A5276]" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px]">Settings</span>
            </button>
          </nav>
        )}

        {showOnboarding && (
          <Onboarding 
            onComplete={() => {
              try {
                localStorage.setItem("guardianeye_onboarded", "true");
              } catch (_) {}
              setShowOnboarding(false);
            }} 
          />
        )}
      </main>
    </div>
  );
}
