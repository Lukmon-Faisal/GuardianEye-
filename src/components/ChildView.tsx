import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, ArrowRight, QrCode, Cpu, Wifi, RefreshCw, 
  MessageSquare, Send, Bot, AlertTriangle, AlertOctagon, Sparkles, User, ShieldAlert,
  Smartphone, HelpCircle, Lock, EyeOff, UserX
} from "lucide-react";
import { TrackedContact } from "../types";
import { triggerSOS, pairDevice, pairChildDevice, analyzeMessageAI, analyzeImageAI, analyzeCommentAI } from "../lib/api";

interface ChildViewProps {
  childConnected: boolean;
  onPairSuccess: () => void;
  activePairingCode: string;
  onMessageAnalyzed?: () => void;
  contacts?: TrackedContact[];
  onRefreshContacts?: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: string;
  classification?: "safe" | "suspicious" | "high risk" | "appropriate" | "flagged for review";
  reason?: string;
  loading?: boolean;
  imageType?: "dog" | "sunset" | "unsafe";
  imageUrl?: string;
  imageName?: string;
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  status: string;
  relationship: string;
}

// Client-side canvas image-generator to generate standard base64 PNGs for Gemini Vision analysis
function generateCanvasImage(type: "dog" | "sunset" | "unsafe"): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 1. Draw Background
  if (type === "dog") {
    // Soft pastel green
    ctx.fillStyle = "#DCFCE7";
    ctx.fillRect(0, 0, 300, 200);
    ctx.fillStyle = "#BBF7D0";
    ctx.beginPath(); ctx.arc(50, 50, 40, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(250, 160, 60, 0, Math.PI * 2); ctx.fill();
    
    ctx.font = "60px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🐶", 150, 85);

    ctx.font = "14px Inter, sans-serif";
    ctx.fillStyle = "#15803D";
    ctx.fillText("Happy Puppy Cartoon", 150, 145);
    ctx.font = "10px Inter, sans-serif";
    ctx.fillStyle = "#166534";
    ctx.fillText("Safe Cartoon Element - Approved", 150, 165);

  } else if (type === "sunset") {
    // Warm sunrise gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 200);
    grad.addColorStop(0, "#FFEDD5");
    grad.addColorStop(1, "#FED7AA");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 200);

    ctx.fillStyle = "#FDBA74";
    ctx.beginPath(); ctx.arc(280, 40, 50, 0, Math.PI * 2); ctx.fill();

    ctx.font = "60px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🌅", 150, 85);

    ctx.font = "14px Inter, sans-serif";
    ctx.fillStyle = "#C2410C";
    ctx.fillText("Scenic Mountain Sunset", 150, 145);
    ctx.font = "10px Inter, sans-serif";
    ctx.fillStyle = "#9A3412";
    ctx.fillText("Breathtaking landscape - Approved", 150, 165);

  } else {
    // Unsafe: Red grid alert
    ctx.fillStyle = "#FEE2E2";
    ctx.fillRect(0, 0, 300, 200);

    ctx.strokeStyle = "#FCA5A5";
    ctx.lineWidth = 1;
    for (let x = 0; x < 300; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 200); ctx.stroke();
    }
    for (let y = 0; y < 200; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(300, y); ctx.stroke();
    }

    ctx.font = "50px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎰🔞⚠️", 150, 75);

    ctx.font = "bold 13px Inter, sans-serif";
    ctx.fillStyle = "#B91C1C";
    ctx.fillText("WIN FREE BATTLE SKINS CASH NOW!", 150, 130);
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillStyle = "#991B1B";
    ctx.fillText("JOIN NO ADULTS PRIVATE LINK CHAT", 150, 150);
    ctx.font = "9px monospace";
    ctx.fillStyle = "#7F1D1D";
    ctx.fillText("UUID: flagged-content-demo", 150, 175);
  }

  return canvas.toDataURL("image/png");
}

export default function ChildView({ 
  childConnected, 
  onPairSuccess, 
  activePairingCode,
  onMessageAnalyzed,
  contacts,
  onRefreshContacts
}: ChildViewProps) {
  const parentSyncedContacts = contacts;
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pairingProgress, setPairingProgress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showQRScannerSim, setShowQRScannerSim] = useState(false);
  const [qrMessage, setQrMessage] = useState("");

  const [activeTab, setActiveTab] = useState<"status" | "messages" | "social">("messages");

  const [sosSending, setSosSending] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);

  const handleTriggerSOS = async () => {
    if (sosSending) return;
    setSosSending(true);
    setSosSuccess(false);

    try {
      triggerSOS();
      setSosSuccess(true);
      if (onMessageAnalyzed) {
        onMessageAnalyzed();
      }
      if (onRefreshContacts) {
        onRefreshContacts();
      }
      // Keep active banner feedback for 6 seconds
      setTimeout(() => {
        setSosSuccess(false);
      }, 6000);
    } catch (e) {
      console.error("SOS trigger error:", e);
    } finally {
      setSosSending(false);
    }
  };

  // Mock social feed comments for Cyberbullying Detector
  const [feedComments, setFeedComments] = useState<Array<{
    id: string;
    author: string;
    avatar: string;
    time: string;
    text: string;
    postContext: string;
    classification?: "neutral" | "negative" | "bullying/harassment";
    reason?: string;
    loading?: boolean;
  }>>([
    {
      id: "feed-c1",
      author: "Chinedu (School Friend)",
      avatar: "👦",
      time: "10 mins ago",
      text: "Yo, that gaming clip you posted was insane! 🔥 We gotta run some co-op this evening.",
      postContext: "Replied to your post on BuzzNet:"
    },
    {
      id: "feed-c2",
      author: "Anons_Nig_99 (Unverified User)",
      avatar: "👹",
      time: "22 mins ago",
      text: "You are a pathetic loser. Genuinely stop streaming and get off this app, nobody wants you here.",
      postContext: "Replied to your video clip:"
    },
    {
      id: "feed-c3",
      author: "Kelechi_Vlogs",
      avatar: "📷",
      time: "1 hour ago",
      text: "Honestly, the video editing could be improved, the background audio is way too loud.",
      postContext: "Replied to your video clip:"
    },
    {
      id: "feed-c4",
      author: "Amina_Tech",
      avatar: "👩‍💻",
      time: "2 hours ago",
      text: "Nice job coding that mini game interface! Looking forward to the beta testing.",
      postContext: "Replied to your project preview:"
    }
  ]);

  const [localChatContacts] = useState<ChatContact[]>([
    { id: "strangeGamer", name: "StrangeGamer_99", avatar: "👾", status: "Active in Chatroom", relationship: "Unfamiliar Stranger / Met Online" },
    { id: "chinedu", name: "Chinedu (School Friend)", avatar: "👦", status: "Recent chat", relationship: "Junior Classmate" }
  ]);
  const [selectedContact, setSelectedContact] = useState<string>("strangeGamer");

  // Check if a contact is blocked in the parent's synced database
  const getContactSafetyStatus = (contactId: string) => {
    if (!parentSyncedContacts) return "Unfamiliar"; // fallback
    const parentContact = parentSyncedContacts.find(
      c => c.id === contactId || 
           c.name.toLowerCase().includes(contactId.toLowerCase()) || 
           contactId.toLowerCase().includes(c.id.toLowerCase())
    );
    if (!parentContact) {
      // Fallback matching name
      const localContact = localChatContacts.find(c => c.id === contactId);
      if (localContact) {
        const matchedByName = parentSyncedContacts.find(
          pc => pc.name.toLowerCase() === localContact.name.toLowerCase() ||
                pc.name.toLowerCase().includes(localContact.name.toLowerCase()) ||
                localContact.name.toLowerCase().includes(pc.name.toLowerCase())
        );
        if (matchedByName) return matchedByName.safetyStatus;
      }
    }
    return parentContact ? parentContact.safetyStatus : "Unfamiliar";
  };

  const isBlocked = getContactSafetyStatus(selectedContact) === "Blocked";

  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({
    chinedu: [
      { id: "c1", text: "Yo, did you finish the math homework for tomorrow?", sender: "them", timestamp: "Yesterday, 3:15 PM", classification: "safe" },
      { id: "c2", text: "Yeah, but I'm still stuck on question 4. Did you get it?", sender: "me", timestamp: "Yesterday, 3:16 PM", classification: "safe" },
      { id: "c3", text: "Yes! I used the quadratic formula. Let's call on Discord later to compare answers.", sender: "them", timestamp: "Yesterday, 3:18 PM", classification: "safe" },
      { id: "c4", text: "Perfect, sound good. Talk to you after dinner!", sender: "me", timestamp: "Yesterday, 3:20 PM", classification: "safe" },
    ],
    strangeGamer: [
      { id: "sg1", text: "Hey! You play really well. Want to team up for the next match?", sender: "them", timestamp: "15 mins ago", classification: "safe" },
      { id: "sg2", text: "Thanks! I'm down. What skins do you use?", sender: "me", timestamp: "12 mins ago", classification: "safe" },
      { id: "sg3", text: "I can buy you some rare battle passes and battle skins, but please keep it our secret. Parents always get dramatic about game stuff, so don't tell them or they might lock your console.", sender: "them", timestamp: "10 mins ago" },
      { id: "sg4", text: "Wait, really? That's super generous! But aren't they expensive?", sender: "me", timestamp: "8 mins ago" },
      { id: "sg5", text: "Let me show you a clip screenshot! We can unlock this together.", sender: "them", timestamp: "7 mins ago", imageType: "dog", imageName: "puppy_stickers.png" },
      { id: "sg6", text: "And look at this sunset, so clean!", sender: "them", timestamp: "6 mins ago", imageType: "sunset", imageName: "scenic_preview.png" },
      { id: "sg7", text: "Click this entry voucher template and enter your details to verify immediately! Absolute secret prize room!", sender: "them", timestamp: "5 mins ago", imageType: "unsafe", imageName: "flagged-content-demo.png" },
    ]
  });

  const [typedMessage, setTypedMessage] = useState("");
  const [globalLoading, setGlobalLoading] = useState(false);

  // Auto-generate canvas base64 image data-URLs on mount
  useEffect(() => {
    setChats(prev => {
      let updated = false;
      const nextChats = { ...prev };
      for (const contactId in nextChats) {
        nextChats[contactId] = nextChats[contactId].map(msg => {
          if (msg.imageType && !msg.imageUrl) {
            const dataUrl = generateCanvasImage(msg.imageType);
            updated = true;
            return { ...msg, imageUrl: dataUrl };
          }
          return msg;
        });
      }
      return updated ? nextChats : prev;
    });
  }, []);

  // Trigger Gemini Analysis on a single message
  const analyzeMessage = async (contactId: string, messageId: string, text: string, senderType: "me" | "them") => {
    setChats(prev => ({
      ...prev,
      [contactId]: prev[contactId].map(m => m.id === messageId ? { ...m, loading: true } : m)
    }));

    try {
      const contactObj = contacts.find(c => c.id === contactId);
      const sender = senderType === "me" ? "Child" : contactObj?.name || "Stranger";
      const contactName = contactObj?.name || "Unfamiliar contact";

      const data = await analyzeMessageAI(messageId, text, sender, contactName);

      setChats(prev => ({
        ...prev,
        [contactId]: prev[contactId].map(m => m.id === messageId ? { 
          ...m, 
          classification: data.classification as any,
          reason: data.reason,
          loading: false 
        } : m)
      }));

      if (data.classification !== "safe" && onMessageAnalyzed) {
        onMessageAnalyzed();
      }
    } catch (err) {
      console.error("Failed message safety scan:", err);
      setChats(prev => ({
        ...prev,
        [contactId]: prev[contactId].map(m => m.id === messageId ? { ...m, loading: false } : m)
      }));
    }
  };

  // Trigger Gemini Vision capability to evaluate image attachments
  const analyzeImage = async (contactId: string, messageId: string, imageStr: string, nameImg: string, senderType: "me" | "them") => {
    setChats(prev => ({
      ...prev,
      [contactId]: prev[contactId].map(m => m.id === messageId ? { ...m, loading: true } : m)
    }));

    try {
      const contactObj = contacts.find(c => c.id === contactId);
      const sender = senderType === "me" ? "Child" : contactObj?.name || "Stranger";
      const contactName = contactObj?.name || "Unfamiliar contact";

      const data = await analyzeImageAI(messageId, imageStr, nameImg, sender, contactName);

      setChats(prev => ({
        ...prev,
        [contactId]: prev[contactId].map(m => m.id === messageId ? { 
          ...m, 
          classification: data.classification as any,
          reason: data.reason,
          loading: false 
        } : m)
      }));

      if (data.classification === "flagged for review" && onMessageAnalyzed) {
        onMessageAnalyzed();
      }
    } catch (err) {
      console.error("Failed image vision scan:", err);
      setChats(prev => ({
        ...prev,
        [contactId]: prev[contactId].map(m => m.id === messageId ? { ...m, loading: false } : m)
      }));
    }
  };

  // Trigger cyberbullying classification for social feed comments
  const analyzeFeedComment = async (commentId: string, text: string, author: string) => {
    setFeedComments(prev => prev.map(c => c.id === commentId ? { ...c, loading: true } : c));
    try {
      const data = await analyzeCommentAI(commentId, text, author);
      setFeedComments(prev => prev.map(c => c.id === commentId ? {
        ...c,
        classification: data.classification as any,
        reason: data.reason,
        loading: false
      } : c));

      if (data.classification === "bullying/harassment" && onMessageAnalyzed) {
        onMessageAnalyzed();
      }
    } catch (err) {
      console.error("Failed social feed comment scan:", err);
      setFeedComments(prev => prev.map(c => c.id === commentId ? { ...c, loading: false } : c));
    }
  };

  // Run audit on all unanalyzed messages in current active conversation
  const runFullConversationAudit = async () => {
    setGlobalLoading(true);
    const msgs = chats[selectedContact] || [];
    for (const msg of msgs) {
      if (!msg.classification && !msg.loading) {
        if (msg.imageType && msg.imageUrl) {
          await analyzeImage(selectedContact, msg.id, msg.imageUrl, msg.imageName || "attachment.png", msg.sender);
        } else {
          await analyzeMessage(selectedContact, msg.id, msg.text, msg.sender);
        }
      }
    }
    setGlobalLoading(false);
  };

  // Create unique conversation sequence state signature to trigger clean auto-audits without loops
  const conversationStateSig = (chats[selectedContact] || [])
    .map(m => `${m.id}-${m.classification || ""}-${m.loading || ""}-${!!m.imageUrl}`)
    .join(",");

  // Run audit automatically on mount or contact swap
  useEffect(() => {
    if (childConnected) {
      const msgs = chats[selectedContact] || [];
      const unclassified = msgs.filter(m => !m.classification && !m.loading);
      if (unclassified.length > 0) {
        unclassified.forEach(m => {
          if (m.imageType) {
            if (m.imageUrl) {
              analyzeImage(selectedContact, m.id, m.imageUrl, m.imageName || "attachment.png", m.sender);
            }
          } else {
            analyzeMessage(selectedContact, m.id, m.text, m.sender);
          }
        });
      }
    }
  }, [childConnected, selectedContact, conversationStateSig]);

  // Run cyberbullying comment audit automatically
  useEffect(() => {
    if (childConnected) {
      const unclassified = feedComments.filter(c => !c.classification && !c.loading);
      if (unclassified.length > 0) {
        unclassified.forEach(c => {
          analyzeFeedComment(c.id, c.text, c.author);
        });
      }
    }
  }, [childConnected, feedComments.map(c => `${c.id}-${c.classification || ""}`).join(",")]);

  const handlePairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit pairing code.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setPairingProgress("Verifying pairing credentials with Firestore...");

    // Simulated multi-step realistic pairing delay
    setTimeout(() => {
      setPairingProgress("Fetching parent digital certificate authority...");
    }, 600);

    setTimeout(() => {
      setPairingProgress("Confirming direct handshakes & securing protect tunnel...");
    }, 1200);

    setTimeout(async () => {
      try {
        const childSessionId = "child-" + Math.random().toString(36).substring(2, 8);
        await pairChildDevice(code, childSessionId);
        
        // Success! Keep track of pairing code in local storage
        localStorage.setItem("guardianeye_active_pairing_code", code);
        pairDevice(code);
        onPairSuccess();
      } catch (err: any) {
        console.warn("Firestore pairing failed, checking fallback activePairingCode:", err);
        if (code === activePairingCode) {
          localStorage.setItem("guardianeye_active_pairing_code", code);
          pairDevice(code);
          onPairSuccess();
        } else {
          setErrorMsg("Pairing code not found or expired on Firebase. Please generate a new code on the Parent App first.");
        }
      } finally {
        setSubmitting(false);
        setPairingProgress("");
      }
    }, 1800);
  };

  const simulateQRScan = () => {
    setShowQRScannerSim(true);
    setQrMessage("Initializing integrated device viewfinder...");
    setTimeout(() => {
      setQrMessage("Scanning for parent QR matrix...");
    }, 800);
    setTimeout(() => {
      setQrMessage(`QR matrix found! Transmitting pairing authorization: ${activePairingCode}...`);
    }, 1600);
    setTimeout(() => {
      setQrMessage("Authorizing certificate handshakes and securing Protect Tunnel...");
    }, 2400);
    setTimeout(async () => {
      try {
        const childSessionId = "child-qr-" + Math.random().toString(36).substring(2, 8);
        await pairChildDevice(activePairingCode, childSessionId);
        localStorage.setItem("guardianeye_active_pairing_code", activePairingCode);
      } catch (err) {
        console.warn("QR Firebase pairing failed:", err);
        localStorage.setItem("guardianeye_active_pairing_code", activePairingCode);
      }
      pairDevice(activePairingCode);
      onPairSuccess();
      setShowQRScannerSim(false);
    }, 3200);
  };

  // Add a new message manually inside simulation to test Gemini AI
  const handleSendMessage = (messageSender: "me" | "them") => {
    if (!typedMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      text: typedMessage.trim(),
      sender: messageSender,
      timestamp: "Just now"
    };

    const targetContact = selectedContact;
    setChats(prev => ({
      ...prev,
      [targetContact]: [...prev[targetContact], newMsg]
    }));

    setTypedMessage("");

    // Trigger analysis immediately on addition
    setTimeout(() => {
      analyzeMessage(targetContact, newMsg.id, newMsg.text, newMsg.sender);
    }, 650);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full px-2 py-2">
      {!childConnected ? (
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xs border border-slate-100 text-center space-y-6">
          <div className="space-y-2">
            <div className="inline-flex p-3.5 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 animate-pulse">
              <Cpu className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 font-display">Pair This Smartphone</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Enter the unique 6-digit synchronization code displayed on your Parent's GuardianEye console dashboard.
            </p>
          </div>

          <form onSubmit={handlePairSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                6-Digit Pairing PIN
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  setCode(cleaned);
                  setErrorMsg("");
                }}
                placeholder="e.g. 102833"
                className="w-full py-3.5 px-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-xl font-bold font-mono tracking-widest text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#1A5276] focus:bg-white transition-all"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                {errorMsg}
              </p>
            )}

            {submitting && pairingProgress && (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1.5 animate-in fade-in duration-200">
                <p className="text-[11px] font-bold text-[#1A5276] animate-pulse">{pairingProgress}</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1A5276] h-full rounded-full animate-pulse" style={{ width: "100%", transition: "all 1s ease" }}></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="w-full py-3.5 bg-[#1A5276] hover:bg-[#154360] text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Establishing Pair...
                </>
              ) : (
                <>
                  Connect Monitor <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-400">or scan screen</span>
            </div>
          </div>

          <button
            onClick={simulateQRScan}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-slate-200"
          >
            <QrCode className="w-4 h-4 text-[#1A5276]" /> Scan Parent QR Code
          </button>

          <p className="text-[10px] text-slate-400 leading-normal bg-slate-50 p-3 rounded-xl">
            GuardianEye parental tools protect your messaging logs. System settings remain locked against unauthorized manual removal.
          </p>
        </div>
      ) : (
        /* Connected Shield Layout with Sub-Navigation */
        <div className="w-full space-y-4 animate-in fade-in duration-300">
          
          {/* Sub Tab Navigation */}
          <div className="flex bg-slate-150 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab("messages")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "messages" 
                  ? "bg-white text-[#1A5276] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Chats Monitor
            </button>
            <button
              onClick={() => setActiveTab("social")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "social" 
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Bot className="w-4 h-4 text-rose-500" /> Social Feed
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "status" 
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Safe-Shield Status
            </button>
          </div>

          {activeTab === "status" && (
            <div className="w-full bg-white rounded-3xl p-6 border border-emerald-100 text-center space-y-6">
              <div className="space-y-3">
                <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
                  <ShieldCheck className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 font-display">Connected to Parent</h2>
                <p className="text-xs font-bold text-[#1A5276]">GuardianEye active monitoring is enabled</p>
              </div>

              {/* Live system state indicators */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-left text-xs font-medium text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Shield Status:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5" /> Direct Protection Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Message Auditing:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#1A5276] animate-pulse" /> Gemini Classifier Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active Account:</span>
                  <span className="font-bold text-slate-800">Child Sandbox Terminal</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Background Sync Active</span>
                <p className="text-[11px] text-slate-500 leading-normal max-w-xs mx-auto">
                  This device's interactive messaging layers undergo automatic toxicity audits. Alerts will immediately log to GuardianEye Parental Circle.
                </p>
              </div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 font-display text-sm flex items-center gap-1.5">
                    <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                      <Bot className="w-4 h-4" />
                    </span>
                    Cyberbullying Detector Feed
                  </h3>
                  <p className="text-[10px] text-slate-500">Demo feed containing real-time toxicity scanning</p>
                </div>

                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md">
                  Active Shield
                </span>
              </div>

              {/* Feed Comments List */}
              <div className="space-y-4">
                {feedComments.map((comment) => {
                  let badgeColor = "bg-slate-100 text-slate-600";
                  let badgeText = "Pending Scan";
                  if (comment.classification === "neutral") {
                    badgeColor = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                    badgeText = "✓ Neutral";
                  } else if (comment.classification === "negative") {
                    badgeColor = "bg-amber-50 text-amber-800 border border-amber-100";
                    badgeText = "⚠ Negative Tone";
                  } else if (comment.classification === "bullying/harassment") {
                    badgeColor = "bg-rose-50 text-rose-800 border border-rose-100 animate-pulse";
                    badgeText = "🚨 Bullying & Harassment Detected";
                  }

                  return (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-2xl border transition-all duration-300 space-y-2.5 ${
                        comment.classification === "bullying/harassment"
                          ? "bg-rose-50/30 border-rose-150 shadow-3xs"
                          : "bg-slate-50/50 border-slate-100"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm shadow-3xs">
                            {comment.avatar}
                          </span>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block font-display">
                              {comment.author}
                            </span>
                            <span className="text-[9px] text-slate-400 block">
                              {comment.postContext}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="text-[9px] text-slate-400 block">{comment.time}</span>
                          {comment.loading ? (
                            <span className="inline-flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-widest text-[#1A5276]">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Scanning...
                            </span>
                          ) : (
                            <span className={`inline-block text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${badgeColor}`}>
                              {badgeText}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment body */}
                      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-3xs relative">
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed font-display">
                          "{comment.text}"
                        </p>
                      </div>

                      {/* AI Assessment / Action Pill */}
                      {!comment.loading && (
                        <div className="flex items-center justify-between pt-1">
                          {comment.classification ? (
                            <div className="space-y-1 text-left">
                              <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 block">
                                GuardianEye Assessment
                              </span>
                              <p className="text-[10px] text-slate-600 font-semibold leading-normal">
                                {comment.reason || "Neutral standard comments. No cyberbullying triggers identified."}
                              </p>
                            </div>
                          ) : (
                            <button
                              onClick={() => analyzeFeedComment(comment.id, comment.text, comment.author)}
                              className="inline-flex items-center gap-1.5 py-1 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-bold transition-all shadow-3xs"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Auto-scan comment
                            </button>
                          )}

                          {comment.classification === "bullying/harassment" && (
                            <span className="text-[8px] font-black uppercase text-rose-700 bg-rose-100/80 px-2 py-1 rounded-md tracking-wider flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Reported to Guardian Console
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Simulation Helper */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5 text-left">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#1A5276]">How the detector works:</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Our advanced cyberbullying processor leverages the real-time Gemini API to scan teen comments. If aggressive, threatening, or demeaning language matches bullying behaviors, GuardianEye automatically blocks the hazard and escalates a warning to the Parent console immediately.
                </p>
              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="w-full bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs flex flex-col min-h-[58vh]">
              
              {/* Chat Screen Header */}
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[#1A5276]/10 text-[#1A5276] rounded-lg">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-950 font-display">Chat Monitor Emulator</h3>
                  </div>
                  
                  {/* Bulk scan action */}
                  <button
                    onClick={runFullConversationAudit}
                    disabled={globalLoading}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 rounded-full text-[10px] font-bold transition-all shadow-3xs"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                    {globalLoading ? "Auditing..." : "Audit All Logs"}
                  </button>
                </div>

                {/* Sender selector tabs */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                  {localChatContacts.map((contact) => {
                    const isSelected = selectedContact === contact.id;
                    const contactStatus = getContactSafetyStatus(contact.id);
                    const isBlockedStatus = contactStatus === "Blocked";

                    return (
                      <button
                        key={contact.id}
                        onClick={() => setSelectedContact(contact.id)}
                        className={`p-2 rounded-xl text-left border transition-all relative ${
                          isSelected 
                            ? "bg-white border-[#1A5276] ring-1 ring-blue-100 shadow-3xs" 
                            : "bg-slate-100/60 border-slate-200/65 hover:bg-slate-100"
                        } ${isBlockedStatus ? "opacity-60 grayscale-[40%]" : ""}`}
                      >
                        <div className="flex items-center gap-1.5 font-display">
                          <span className="text-sm">{contact.avatar}</span>
                          <span className="text-[11px] font-bold text-slate-800 truncate block">
                            {contact.name.split(" ")[0]}
                          </span>
                          {isBlockedStatus && (
                            <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse absolute top-2 right-2" />
                          )}
                        </div>
                        <span className={`text-[8px] font-bold block truncate mt-0.5 leading-none ${
                          isBlockedStatus ? "text-rose-650 font-extrabold uppercase scale-95 origin-left" : "text-slate-400"
                        }`}>
                          {isBlockedStatus ? "Blocked — Messages Hidden" : contact.relationship.split(" / ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Bubble Window Container */}
              {isBlocked ? (
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-slate-100/40">
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-full ring-4 ring-rose-100 animate-bounce">
                    <EyeOff className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm font-display text-slate-800 uppercase tracking-wide">
                      Blocked — Messages Hidden
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-semibold">
                      Your parent has restricted communications with <strong>{localChatContacts.find(c => c.id === selectedContact)?.name}</strong>. Chat history has been completely hidden and protected.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-3.5 space-y-4 max-h-[38vh] overflow-y-auto bg-slate-50/40">
                  {(chats[selectedContact] || []).length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No logs recorded in this session.
                    </div>
                  ) : (
                    (chats[selectedContact] || []).map((msg) => {
                    const isMe = msg.sender === "me";
                    
                    // Style by Gemini classification output
                    let classificationColor = "text-slate-400 bg-slate-100";
                    let classificationLabel = "";
                    if (msg.classification === "safe" || msg.classification === "appropriate") {
                      classificationColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
                      classificationLabel = msg.imageType ? "✓ Media Clean" : "✓ Clean";
                    } else if (msg.classification === "suspicious") {
                      classificationColor = "text-amber-800 bg-amber-50 border-amber-200 animate-pulse";
                      classificationLabel = "! Warn: Secrecy Risk";
                    } else if (msg.classification === "high risk" || msg.classification === "flagged for review") {
                      classificationColor = "text-rose-800 bg-rose-50 border-rose-200 animate-pulse";
                      classificationLabel = msg.imageType ? "⚠ Media Blocked by GuardianEye" : "⚠ Critical: Grooming Threat";
                    }

                    return (
                      <div key={msg.id} className="space-y-1">
                        {/* Bubble row */}
                        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className="max-w-[85%] text-left">
                            {/* Message label */}
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5 px-0.5">
                              {isMe ? "Sent by Me (Child)" : contacts.find(c => c.id === selectedContact)?.name}
                            </span>
                            
                            {/* Actual bubble */}
                            <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-3xs ${
                              isMe 
                                ? "bg-[#1A5276] text-white rounded-tr-none" 
                                : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                            }`}>
                              {msg.text && <p className={msg.imageUrl ? "mb-2" : ""}>{msg.text}</p>}

                              {/* Attached Image with optional Blur/Overlay if flagged by GuardianEye */}
                              {msg.imageUrl && (
                                <div className="relative rounded-xl overflow-hidden mt-1 border border-slate-100 shadow-3xs group max-w-[240px]">
                                  <img
                                    src={msg.imageUrl}
                                    alt={msg.imageName || "attachment"}
                                    referrerPolicy="no-referrer"
                                    className={`w-full max-h-[160px] object-cover transition-all duration-350 ${
                                      msg.classification === "flagged for review"
                                        ? "blur-xl saturate-150 scale-105"
                                        : ""
                                    }`}
                                  />
                                  
                                  {/* Flagged Quarantine Overlay */}
                                  {(msg.classification === "flagged for review") && (
                                    <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center transition-all duration-300">
                                      <EyeOff className="w-8 h-8 text-white mb-1.5 animate-pulse" />
                                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-300 block mb-1">
                                        Content Blocked
                                      </span>
                                      <span className="text-[8px] font-bold text-white max-w-[150px] leading-relaxed block">
                                        Blocked by GuardianEye
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Appropriate Overlay Label */}
                                  {msg.classification === "appropriate" && (
                                    <div className="absolute bottom-1 right-1 bg-emerald-600/95 backdrop-blur-xs text-white font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-3xs">
                                      ✓ Safe Media
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
 
                            {/* Timestamp */}
                            <span className="text-[8px] text-slate-400 block mt-1 text-right px-1">
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
 
                        {/* Analysis results pill attached to bubble */}
                        <div className={`flex ${isMe ? "justify-end" : "justify-start"} px-1`}>
                          {msg.loading ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 animate-pulse border border-indigo-100">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> auditing message with Gemini...
                            </div>
                          ) : msg.classification ? (
                            <div className={`flex flex-col gap-1 max-w-[80%] p-2 rounded-xl border text-[9px] font-semibold leading-normal mt-0.5 text-left shadow-3xs ${classificationColor}`}>
                              <div className="flex items-center gap-1 font-bold">
                                <Sparkles className="w-3 h-3" />
                                <span>AI Classification: {classificationLabel}</span>
                              </div>
                              {msg.reason && (
                                <p className="text-[9px] font-medium leading-relaxed opacity-90 mt-0.5">
                                  Why: &quot;{msg.reason}&quot;
                                </p>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (msg.imageType && msg.imageUrl) {
                                  analyzeImage(selectedContact, msg.id, msg.imageUrl, msg.imageName || "media.png", msg.sender);
                                } else {
                                  analyzeMessage(selectedContact, msg.id, msg.text, msg.sender);
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full text-[9px] font-bold transition-all"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-[#1A5276]" /> Tap to scan
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              )}

              {/* Simulation Sandbox Input Console */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2">
                {isBlocked ? (
                  <div className="bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-100/50 text-[10px] font-bold text-center flex items-center justify-center gap-1.5 font-display">
                    <UserX className="w-4 h-4 shadow-3xs" /> Messaging disabled. Contact has been blocked by parent console.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        placeholder="Type customized test messages here..."
                        className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276] placeholder-slate-450"
                      />
                    </div>

                    {/* Simulator-Only Dual buttons row to test safely: "Me" sending or "Them" sending */}
                    <div className="flex justify-between items-center bg-slate-100/60 p-1.5 rounded-xl border border-slate-200">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-[#1A5276] pl-1.5 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Testing Sandbox:
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSendMessage("me")}
                          disabled={!typedMessage.trim()}
                          className="px-2.5 py-1.5 bg-[#1A5276] hover:bg-opacity-90 disabled:opacity-40 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                          title="Add message as Child"
                        >
                          <User className="w-3 h-3" /> Child Send
                        </button>
                        <button
                          onClick={() => handleSendMessage("them")}
                          disabled={!typedMessage.trim()}
                          className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                          title="Simulate incoming predatory text"
                        >
                          <Bot className="w-3 h-3 text-red-100" /> Contacts incoming
                        </button>
                      </div>
                    </div>

                    {/* Simulation helpful instructions and guide */}
                    <p className="text-[9px] leading-relaxed text-slate-400 text-center">
                      💡 Type high-risk phrases (e.g. <em>&quot;don't tell your dad, it is our secret&quot;</em> or <em>&quot;send me photopic&quot;</em>) then click <strong>Contacts incoming</strong> to trigger real-time Gemini alarms and instant parent warnings!
                    </p>
                  </>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* QR Code Scanner Simulation Drawer */}
      {showQRScannerSim && (
        <div className="fixed inset-0 bg-slate-950 flex flex-col justify-center items-center p-6 z-50 text-white select-none">
          <div className="w-full max-w-sm text-center space-y-6">
            <h3 className="font-bold text-lg font-display tracking-tight text-white/95">Integrated Cam Scanner</h3>
            <p className="text-xs text-white/50">{qrMessage}</p>

            <div className="relative w-64 h-64 border-2 border-indigo-500 rounded-3xl mx-auto flex items-center justify-center overflow-hidden bg-zinc-900/90 shadow-2xl">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-tr-lg"></div>

              <div className="w-full h-1 bg-indigo-500 absolute top-1/2 left-0 animate-bounce shadow-[0_0_8px_#6366f1]"></div>

              <div className="space-y-2 text-center opacity-70">
                <QrCode className="w-16 h-16 text-white/50 mx-auto" />
                <span className="text-[10px] text-white/40 block">Align Parent QR inside frame</span>
              </div>
            </div>

            <button
              onClick={() => setShowQRScannerSim(false)}
              className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition-colors"
            >
              Cancel Scan
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button - Emergency SOS */}
      {childConnected && (
        <div className="fixed bottom-6 right-6 z-40 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
          {sosSuccess ? (
            <div className="bg-rose-600 text-white rounded-2xl p-3.5 pr-5 border border-rose-500 shadow-2xl flex items-center gap-3 max-w-xs animate-bounce" style={{ WebkitBackfaceVisibility: 'hidden' }}>
              <div className="p-2 bg-white/10 rounded-xl relative">
                <span className="absolute inset-0 bg-white/25 rounded-xl animate-ping" />
                <ShieldAlert className="w-5 h-5 text-red-100" />
              </div>
              <div className="text-left">
                <h5 className="font-extrabold text-[11px] uppercase tracking-wider block">SOS Transmitted!</h5>
                <p className="text-[10px] text-red-100 leading-normal font-semibold font-display">
                  Alert sent. GPS location shared near Ikeja, Lagos. Help is coming.
                </p>
              </div>
            </div>
          ) : (
            <button
              id="sos-button"
              onClick={handleTriggerSOS}
              disabled={sosSending}
              className="group relative flex items-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-85 text-white rounded-full font-bold text-xs transition-all duration-300 shadow-[0_4px_20px_rgba(225,29,72,0.4)] hover:shadow-[0_6px_25px_rgba(225,29,72,0.6)] cursor-pointer hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-25 group-hover:opacity-40" />
              
              {sosSending ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
              )}
              
              <span className="font-display uppercase tracking-widest text-[11px] font-black">
                {sosSending ? "Alerting..." : "I Need Help"}
              </span>
              
              <span className="text-[10px] bg-red-800 px-1.5 py-0.5 rounded-md text-red-100 border border-red-500/30 uppercase font-black tracking-wider scale-95 transition-transform duration-250">
                SOS
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
