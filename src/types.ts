export interface Child {
  id: string;
  name: string;
  avatar: string;
  status: "Online" | "Awaiting Setup" | "Offline";
  battery: string;
  lastActive: string;
  screenTimeToday: string;
  alertsToday: number;
}

export interface SecurityAlert {
  id: string;
  childName: string;
  platform: string;
  appIcon: string;
  severity: "high" | "medium" | "low";
  category: string;
  snippet: string;
  timestamp: string;
  aiAssessment: string;
  resolved: boolean;
  imageThumbnail?: string;
  isSOS?: boolean;
}

export interface TrackedContact {
  id: string;
  name: string;
  phone: string;
  networkCarrier?: string; // MTN, Airtel, Glo, 9mobile
  relationship: string;
  safetyStatus: "Trusted" | "Unfamiliar" | "Blocked";
  alertsCount: number;
  lastMessaged: string;
}

export interface ActiveView {
  role: "selector" | "parent" | "child";
}

export interface ParentTab {
  tab: "dashboard" | "alerts" | "contacts" | "settings";
}
