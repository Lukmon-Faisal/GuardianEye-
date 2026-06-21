import { GoogleGenAI, Type } from "@google/genai";
import { SecurityAlert, TrackedContact, Child } from "../types";

// Setup API key with fallback to what Vite embeds or direct process.env
const getApiKey = (): string => {
  // Try import.meta.env first
  const metaKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (metaKey && metaKey !== "MY_GEMINI_API_KEY") {
    return metaKey;
  }
  // Fallback to compiled global process.env or process.env.GEMINI_API_KEY
  try {
    const procKey = process.env.GEMINI_API_KEY;
    if (procKey && procKey !== "MY_GEMINI_API_KEY") {
      return procKey;
    }
  } catch (e) {
    // Ignore ReferenceError in pure browser if process is undefined
  }
  return "";
};

// Lazy initialization of Gemini SDK
let aiClient: GoogleGenAI | null = null;
export const getGeminiClient = (): GoogleGenAI | null => {
  if (!aiClient) {
    const key = getApiKey();
    if (!key) {
      console.warn("GuardianEye: GEMINI_API_KEY is not defined. Falling back to local heuristic rules.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
};

// Default States
const DEFAULT_SETTINGS = {
  sensitivity: "Medium",
  cyberbullying: true,
  groomingDetection: true,
  gamblingBlocking: true,
  examLeakFilter: false,
  naijaSlangAudit: true,
  schoolHoursLock: true,
  sleepLock: true,
  carrierSafeDNS: true
};

const DEFAULT_ALERTS: SecurityAlert[] = [
  {
    id: "a1",
    childName: "Child Device",
    platform: "WhatsApp",
    appIcon: "MessageSquare",
    severity: "high",
    category: "Blocked Content",
    snippet: "I will deal with you at school tomorrow, nobody will save you",
    timestamp: "Today, 10:42 AM",
    aiAssessment: "Threat of physical violence or high-severity cyberbullying. Action advised.",
    resolved: false
  },
  {
    id: "a2",
    childName: "Child Device",
    platform: "Chrome Web Browser",
    appIcon: "Globe",
    severity: "medium",
    category: "Inappropriate Site",
    snippet: "Searched: 'how to bypass parental lock standard password'",
    timestamp: "Today, 08:15 AM",
    aiAssessment: "Inquisitive behavior regarding privacy. Standard lock remains active.",
    resolved: false
  }
];

const DEFAULT_CONTACTS: TrackedContact[] = [
  {
    id: "c1",
    name: "Ayo (School Friend)",
    phone: "+234 803 112 3456",
    networkCarrier: "MTN Nigeria",
    relationship: "Classmate",
    safetyStatus: "Trusted",
    alertsCount: 0,
    lastMessaged: "Today, 11:20 AM"
  },
  {
    id: "strangeGamer",
    name: "StrangeGamer_99",
    phone: "+234 812 887 0901",
    networkCarrier: "Airtel Nigeria",
    relationship: "Unfamiliar Stranger / Met Online",
    safetyStatus: "Unfamiliar",
    alertsCount: 3,
    lastMessaged: "5 mins ago"
  },
  {
    id: "c3",
    name: "Tobi (Senior School)",
    phone: "+234 905 442 1199",
    networkCarrier: "Globacom",
    relationship: "Senior Peer",
    safetyStatus: "Blocked",
    alertsCount: 4,
    lastMessaged: "3 days ago"
  },
  {
    id: "c4",
    name: "Chioma (Aunt)",
    phone: "+234 809 333 5511",
    networkCarrier: "9mobile",
    relationship: "Aunt / Family",
    safetyStatus: "Trusted",
    alertsCount: 0,
    lastMessaged: "4 days ago"
  },
  {
    id: "c5",
    name: "Unknown Number (Lagos)",
    phone: "+234 703 555 9922",
    networkCarrier: "MTN Nigeria",
    relationship: "Anonymous Group Peer",
    safetyStatus: "Unfamiliar",
    alertsCount: 2,
    lastMessaged: "Yesterday, 06:12 PM"
  },
  {
    id: "c6",
    name: "Emeka Cybercafe",
    phone: "+234 816 777 8888",
    networkCarrier: "Airtel Nigeria",
    relationship: "Cybercafe Attendant",
    safetyStatus: "Unfamiliar",
    alertsCount: 1,
    lastMessaged: "2 hours ago"
  }
];

// Helper to initialize LocalStorage securely (or memory fallback if cookies/storage blocked)
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const val = localStorage.getItem(key);
    if (val === null) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(val);
  } catch (e) {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Memory fallback
  }
};

// Database API Methods (All operations persisted locally in browser)
export const getSettings = () => loadFromStorage("guardian_settings", DEFAULT_SETTINGS);
export const saveSettings = (settings: typeof DEFAULT_SETTINGS) => {
  saveToStorage("guardian_settings", settings);
  return settings;
};

export const getAlerts = (): SecurityAlert[] => loadFromStorage("guardian_alerts", DEFAULT_ALERTS);
export const saveAlerts = (alerts: SecurityAlert[]) => saveToStorage("guardian_alerts", alerts);

export const getContacts = (): TrackedContact[] => loadFromStorage("guardian_contacts", DEFAULT_CONTACTS);
export const saveContacts = (contacts: TrackedContact[]) => saveToStorage("guardian_contacts", contacts);

export const isChildConnected = (): boolean => loadFromStorage("guardian_child_connected", false);
export const setChildConnected = (connected: boolean) => {
  saveToStorage("guardian_child_connected", connected);
  return connected;
};

// Combined Status
export const getStatus = () => {
  const connected = isChildConnected();
  const alertsList = getAlerts();
  return {
    childConnected: connected,
    children: [
      {
        id: "child-1",
        name: "Child Device",
        avatar: "👦",
        status: connected ? "Online" : "Awaiting Setup",
        battery: "84%",
        lastActive: connected ? "Just now" : "3 hrs ago",
        screenTimeToday: connected ? "2h 15m" : "0m",
        alertsToday: connected ? alertsList.length : 2,
      } as Child
    ]
  };
};

export const pairDevice = (code: string) => {
  setChildConnected(true);
  return { success: true, message: "Device paired successfully with GuardianEye Parent Console." };
};

export const addContact = (name: string, phone: string, relationship: string, carrier: string) => {
  const contacts = getContacts();
  const newContact: TrackedContact = {
    id: "contact-" + Date.now(),
    name,
    phone,
    networkCarrier: carrier || "MTN Nigeria",
    relationship,
    safetyStatus: "Trusted",
    alertsCount: 0,
    lastMessaged: "Never"
  };
  contacts.unshift(newContact);
  saveContacts(contacts);
  return { success: true, contacts };
};

export const updateContactStatus = (id: string, safetyStatus: "Trusted" | "Unfamiliar" | "Blocked") => {
  const contacts = getContacts();
  const index = contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    contacts[index].safetyStatus = safetyStatus;
    saveContacts(contacts);
  }
  return { success: true, contacts };
};

export const resolveAlert = (id: string) => {
  const alerts = getAlerts();
  const alert = alerts.find(a => a.id === id);
  if (alert) {
    alert.resolved = true;
    saveAlerts(alerts);
  }
  return { success: true, alerts };
};

export const simulateAlert = (platform: string, category: string, snippet: string, severity: "high" | "medium" | "low") => {
  const alerts = getAlerts();
  const newAlert: SecurityAlert = {
    id: "alert-" + Date.now(),
    childName: "Child Device",
    platform: platform || "Telegram",
    appIcon: "AlertTriangle",
    severity: severity || "medium",
    category: category || "Keyword Flag",
    snippet: snippet || "Example flagged text message monitored on device",
    timestamp: "Just now",
    aiAssessment: "Simulated alert from local safety policy trigger.",
    resolved: false
  };
  alerts.unshift(newAlert);
  saveAlerts(alerts);
  return { success: true, alert: newAlert };
};

export const triggerSOS = () => {
  const alerts = getAlerts();
  const timeString = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const textAlert: SecurityAlert = {
    id: "sos-" + Date.now(),
    childName: "Child Device",
    platform: "EMERGENCY: Child triggered SOS",
    appIcon: "ShieldAlert",
    severity: "high",
    category: "Emergency SOS",
    snippet: "Location: Near Ikeja, Lagos",
    timestamp: `Today, ${timeString}`,
    aiAssessment: "IMMEDIATE ATTENTION REQUIRED: Child pressed the SOS panic button on their device. Current mock location resolved to Near Ikeja, Lagos. Please check on your child immediately.",
    resolved: false,
    isSOS: true
  };
  alerts.unshift(textAlert);
  saveAlerts(alerts);
  return { success: true, alert: textAlert };
};

export const resetDb = () => {
  saveToStorage("guardian_settings", DEFAULT_SETTINGS);
  saveToStorage("guardian_alerts", DEFAULT_ALERTS);
  saveToStorage("guardian_contacts", DEFAULT_CONTACTS);
  saveToStorage("guardian_child_connected", false);
  return { success: true, childConnected: false };
};

// Client-side AI Image Analysis calling Gemini directly
export const analyzeImageAI = async (messageId: string, imageBytes: string, imageName: string, sender: string, contactName: string) => {
  let rawBase64 = imageBytes;
  if (rawBase64.includes("base64,")) {
    rawBase64 = rawBase64.split("base64,")[1];
  }

  // Local Rule-Engine Fallbacks
  let finalClassification = "appropriate";
  let finalReason = "";
  const isFlaggedDemo = imageName && imageName.toLowerCase().includes("flagged-content-demo");

  if (isFlaggedDemo) {
    finalClassification = "flagged for review";
    finalReason = "Inappropriate media: Flagged Content Demo matches betting or unsafe solicitation indicators.";
  }

  let isUsingAI = false;
  const settings = getSettings();

  try {
    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: rawBase64,
              mimeType: "image/png"
            }
          },
          `Strictly evaluate the attached image for child safety, taking the parent sensitivity rule into account. Context: Child received this on contact stream "${contactName}" from sender "${sender}".`
        ],
        config: {
          systemInstruction: `You are an expert AI child-safety digital image auditor and classifier for GuardianEye.
The current Content Filter Sensitivity is configured as: "${settings.sensitivity}".
Analyze the provided image in detail. Classify it as "appropriate" or "flagged for review".
Look out for:
- gambling/betting content, spam advertisements targeting kids.
- sexualized, violent, or explicit material.
- text prompts asking the child to keep secrets, meet up, or switch applications (e.g. move to private Snapchat or Discord).
- Any reference to inappropriate photos or personal details.

Under the current sensitivity mode:
- Low: Only flag extreme threats containing graphic content, real-world weapons or adult theme items.
- Medium: Flag common concerns of online grooming (requests for photos, requests to keep secrets, invitations to private rooms, or obvious betting cards).
- High: Extremely restrictive. Flag any potential risks or anything showing guns (even virtual/games), any adult references, hand symbols, scary elements, or invitations from strangers.

Your output must be returned strictly as a JSON object with:
- "classification": either "appropriate" or "flagged for review" (or if you are uncertain under High sensitivity, flag for review!)
- "reason": a short, precise child-safety-focused reason explaining why the image was flagged (or blank if appropriate).`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              classification: {
                type: Type.STRING,
                description: "Must be exactly 'appropriate' or 'flagged for review'"
              },
              reason: {
                type: Type.STRING,
                description: "A short, precise explanation why this visual or text was flagged. Blank if completely appropriate."
              }
            },
            required: ["classification", "reason"]
          }
        }
      });

      const txt = response.text?.trim();
      if (txt) {
        const parsed = JSON.parse(txt);
        const aiClass = parsed.classification?.toLowerCase();
        if (["appropriate", "flagged for review"].includes(aiClass)) {
          finalClassification = aiClass;
          finalReason = parsed.reason || "";
          isUsingAI = true;
        }
      }
    }
  } catch (e) {
    console.warn("Client Gemini Vision service failed or key not configured, falling back to local heuristics:", e);
  }

  // Force flag if sensitivity is High and it's a suspicious contact/image
  if (settings.sensitivity === "High" && imageName && (imageName.includes("unsafe") || imageName.includes("demo"))) {
    finalClassification = "flagged for review";
    finalReason = "Strict Sandbox High Sensitivity Rule: Flagged unverified image containing text symbols.";
  }

  // Log alert if flagged
  if (finalClassification === "flagged for review") {
    const alerts = getAlerts();
    const alreadyLogged = alerts.some(a => a.snippet && a.snippet.includes(imageName));
    if (!alreadyLogged) {
      const newAlert: SecurityAlert = {
        id: "img-alert-" + messageId,
        childName: "Child Device",
        platform: "Chat Monitor (" + (contactName || "Stranger") + ")",
        appIcon: "EyeOff",
        severity: "high",
        category: "Visual Content Filter Warning",
        snippet: `Media attachment flagged: ${imageName}`,
        timestamp: "Just now",
        aiAssessment: finalReason || "Blocked media file. Contains suspicious elements.",
        resolved: false,
        imageThumbnail: imageBytes
      };
      alerts.unshift(newAlert);
      saveAlerts(alerts);
    }
  }

  return {
    messageId,
    classification: finalClassification,
    reason: finalReason,
    usingAI: isUsingAI
  };
};

// Client-side AI Message Analysis calling Gemini directly
export const analyzeMessageAI = async (messageId: string, text: string, sender: string, contactName: string) => {
  const textLower = text.toLowerCase();
  let finalClassification = "safe";
  let finalReason = "";

  // Local Rule-Engine fallbacks
  if (
    textLower.includes("secret") || 
    textLower.includes("don't tell") || 
    textLower.includes("dont tell") || 
    textLower.includes("keep it quiet") ||
    textLower.includes("shh")
  ) {
    finalClassification = "suspicious";
    finalReason = "Potential grooming pattern: Request for secrecy from parent or guardians.";
  } else if (
    textLower.includes("photo") || 
    textLower.includes("pic") || 
    textLower.includes("snapchat") || 
    textLower.includes("discord") || 
    textLower.includes("whatsapp") || 
    textLower.includes("instagram") ||
    textLower.includes("snap") ||
    textLower.includes("telegram") ||
    textLower.includes("move to") ||
    textLower.includes("private") ||
    textLower.includes("how old") ||
    textLower.includes("where do you live") ||
    textLower.includes("your phone number")
  ) {
    finalClassification = "high risk";
    finalReason = "Risk Alert: Attempting to bypass device filters by moving platforms or requests for inappropriate photos/personal information.";
  }

  let isUsingAI = false;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const completion = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze this chat log message sent to a child/teen. Message context: Sender is "${sender}" chatting in a contact channel named "${contactName}". Message content text to audit: "${text}"`,
        config: {
          systemInstruction: "You are an expert child-safety message classifier. Analyze the text of an incoming message to a child. Classify it as 'safe', 'suspicious', or 'high risk'. Look specifically for grooming language, requests for secrecy, attempts to move the conversation to private platforms (e.g., Snapchat, Discord, WhatsApp), questions asking for inappropriate personal/location info, or requests for photos. Return a JSON object with keys 'classification' (either 'safe', 'suspicious', or 'high risk') and 'reason' (brief explanation if flagged critical/suspicious, or empty if safe).",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              classification: {
                type: Type.STRING,
                description: "Must be exactly 'safe', 'suspicious', or 'high risk'"
              },
              reason: {
                type: Type.STRING,
                description: "A short, precise explanation why this message is suspicious or high risk, highlighting signs of grooming, secrecy requests, private platform redirection, or inappropriate requests. Blank if safe."
              }
            },
            required: ["classification", "reason"]
          }
        }
      });

      const txt = completion.text?.trim();
      if (txt) {
        const parsed = JSON.parse(txt);
        const aiClass = parsed.classification?.toLowerCase();
        if (["safe", "suspicious", "high risk"].includes(aiClass)) {
          finalClassification = aiClass;
          finalReason = parsed.reason || "";
          isUsingAI = true;
        }
      }
    }
  } catch (e) {
    console.warn("Client Gemini service failed or key not configured, falling back to local heuristics:", e);
  }

  // If marked as suspicious or high risk, insert alert
  if (finalClassification !== "safe") {
    const alerts = getAlerts();
    const alreadyLogged = alerts.some(a => a.snippet === text);
    if (!alreadyLogged) {
      const newAlert: SecurityAlert = {
        id: "msg-alert-" + messageId,
        childName: "Child Device",
        platform: "Chat Monitor (" + (contactName || "Stranger") + ")",
        appIcon: "MessageSquare",
        severity: finalClassification === "high risk" ? "high" : "medium",
        category: finalClassification === "high risk" ? "Grooming Patterns Detected" : "Safety Warning",
        snippet: text,
        timestamp: "Just now",
        aiAssessment: finalReason,
        resolved: false
      };
      alerts.unshift(newAlert);
      saveAlerts(alerts);
    }
  }

  return {
    messageId,
    classification: finalClassification,
    reason: finalReason,
    usingAI: isUsingAI
  };
};

// Client-side AI Comment Analysis direct calling Gemini
export const analyzeCommentAI = async (commentId: string, text: string, author: string) => {
  const textLower = text.toLowerCase();
  let finalClassification = "neutral";
  let finalReason = "";

  // Local Fallback Heuristics
  if (
    textLower.includes("loser") ||
    textLower.includes("pathetic") ||
    textLower.includes("ugly") ||
    textLower.includes("hate") ||
    textLower.includes("kick you out") ||
    textLower.includes("no one wants you") ||
    textLower.includes("shut up")
  ) {
    finalClassification = "bullying/harassment";
    finalReason = "Hostile language typical of cyberbullying. Direct insult/demeaning action detected.";
  } else if (
    textLower.includes("bad") ||
    textLower.includes("dont like") ||
    textLower.includes("didn't like") ||
    textLower.includes("terrible") ||
    textLower.includes("annoying")
  ) {
    finalClassification = "negative";
    finalReason = "Slightly negative tone, but does not constitute critical bullying/harassment.";
  }

  let isUsingAI = false;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const completion = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Audit this public comment/post directed at a teenager for cyberbullying or toxicity.
Comment Author: "${author}"
Comment Text: "${text}"`,
        config: {
          systemInstruction: `You are an expert digital safety auditor specializing in social media toxicity and cyberbullying detection for adolescents.
Your job is to classify the comment into exactly one of three categories:
1. "neutral" — positive, friendly, benign, standard chat, or supportive comments.
2. "negative" — critical, complaining, or slightly sour but not abusive or systemic harassment.
3. "bullying/harassment" — threatening, extremely hostile, degrading, discriminatory, body-shaming, or exclusionary language designed to hurt the child.

Return a JSON object with:
- "classification": exactly one of "neutral", "negative", or "bullying/harassment"
- "reason": a short, clear human explanation detailing the tone and intent of the comment. Keep it under 20 words.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              classification: {
                type: Type.STRING,
                description: "Must be exactly 'neutral', 'negative', or 'bullying/harassment'"
              },
              reason: {
                type: Type.STRING,
                description: "Short clinical explanation of the comment tone."
              }
            },
            required: ["classification", "reason"]
          }
        }
      });

      const txt = completion.text?.trim();
      if (txt) {
        const parsed = JSON.parse(txt);
        const aiClass = parsed.classification?.toLowerCase();
        if (["neutral", "negative", "bullying/harassment"].includes(aiClass)) {
          finalClassification = aiClass;
          finalReason = parsed.reason || "";
          isUsingAI = true;
        }
      }
    }
  } catch (e) {
    console.warn("Client Gemini Comment Analysis failed or key not configured, falling back to local heuristics:", e);
  }

  // If bullying, trigger parent alert
  if (finalClassification === "bullying/harassment") {
    const alerts = getAlerts();
    const alertId = "bully-alert-" + commentId;
    const alreadyLogged = alerts.some(a => a.id === alertId);
    if (!alreadyLogged) {
      const newAlert: SecurityAlert = {
        id: alertId,
        childName: "Child Device",
        platform: "Social Feed Monitor",
        appIcon: "MessageSquareWarning",
        severity: "high",
        category: "Cyberbullying Alert",
        snippet: `${author}: "${text}"`,
        timestamp: "Just now",
        aiAssessment: finalReason || "Detected hostile, threatening, or demeaning cyberbullying comment directed at the child.",
        resolved: false
      };
      alerts.unshift(newAlert);
      saveAlerts(alerts);
    }
  }

  return {
    commentId,
    classification: finalClassification,
    reason: finalReason,
    usingAI: isUsingAI
  };
};

// Client-side AI Weekly Summary generation calling Gemini directly
export const getWeeklySummaryAI = async () => {
  const alertsList = getAlerts();
  const totalAlerts = alertsList.length;
  const unresolvedAlerts = alertsList.filter(a => !a.resolved).length;

  // Fallback simple summary text
  let summaryText = `This week, GuardianEye flagged ${totalAlerts} total security alerts (${unresolvedAlerts} currently unreviewed). Safe proxy limits are active, and overall peer chat behaviors have been monitored.`;
  if (totalAlerts === 0) {
    summaryText = "This week, GuardianEye has not flagged any security alerts. Overall digital behaviors of the child appear balanced and completely safe.";
  } else {
    const chatAlerts = alertsList.filter((a: any) => a.id.startsWith("msg-alert") || a.platform.includes("Chat")).length;
    const contentAlerts = alertsList.filter((a: any) => a.id.startsWith("img-alert") || a.category.includes("Visual") || a.imageThumbnail).length;
    const bullyingAlerts = alertsList.filter((a: any) => a.id.startsWith("bully-alert") || a.platform.includes("Social") || a.appIcon === "MessageSquareWarning").length;

    const parts = [];
    if (chatAlerts > 0) parts.push(`${chatAlerts} potential chat grooming concern${chatAlerts > 1 ? 's' : ''}`);
    if (contentAlerts > 0) parts.push(`${contentAlerts} flagged image attachment${contentAlerts > 1 ? 's' : ''}`);
    if (bullyingAlerts > 0) parts.push(`${bullyingAlerts} hostile cyberbullying comment${bullyingAlerts > 1 ? 's' : ''}`);

    if (parts.length > 0) {
      summaryText = `This week, GuardianEye flagged ${parts.join(" and ")}. Under the currently active safety rules, protective shields blocked these exposures immediately. Overall online behaviors were otherwise normal.`;
    }
  }

  let usingAI = false;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const alertsDescription = alertsList
        .map(a => `- Platform: ${a.platform}, Severity: ${a.severity}, Category: ${a.category}, Snippet/Content: "${a.snippet}", Status: ${a.resolved ? 'Reviewed' : 'Unreviewed'}`)
        .join("\n");

      const promptMsg = `Write a short, professional, friendly 1-paragraph (maximum 2-3 sentences) digital behavior summary for a parent.
Based on these alerts observed on the child's device this week:
${alertsDescription || "No alerts observed."}

The child is connected. If there are alerts, summarize what was flagged (e.g., suspicious messages, flagged images, or cyberbullying remarks) and mention that GuardianEye shields kept them safe. Keep the tone comforting, reassuring, objective, and clear for a parent. Use plain language. Do not mention system-level metrics or internal IDs. Max 60 words.`;

      const completion = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptMsg,
        config: {
          systemInstruction: "You are the GuardianEye digital parent assistant. Your goal is to write a short, friendly, plain-language digital safety summary of the child's week for a parent, and keep it extremely brief and high-quality."
        }
      });

      const txt = completion.text?.trim();
      if (txt) {
        summaryText = txt;
        usingAI = true;
      }
    }
  } catch (e) {
    console.warn("Client Gemini weekly summary generation failed or key not configured, using fallback summary:", e);
  }

  return { summary: summaryText, usingAI };
};
