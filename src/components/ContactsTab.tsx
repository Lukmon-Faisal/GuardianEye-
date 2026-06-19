import React, { useState } from "react";
import { 
  Users, UserCheck, UserX, UserMinus, Plus, ShieldCheck, 
  Phone, ShieldAlert, MessageCircleCode, Check, Search, Smartphone 
} from "lucide-react";
import { TrackedContact } from "../types";

interface ContactsTabProps {
  contacts?: TrackedContact[];
  onRefresh?: () => void;
}

export default function ContactsTab({ contacts: propContacts, onRefresh }: ContactsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localContacts, setLocalContacts] = useState<TrackedContact[]>([
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
  ]);

  const activeContacts = propContacts || localContacts;

  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactCarrier, setNewContactCarrier] = useState("MTN Nigeria");
  const [newContactRelationship, setNewContactRelationship] = useState("Friend");
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleSafetyStatus = async (id: string, newStatus: "Trusted" | "Unfamiliar" | "Blocked") => {
    try {
      const res = await fetch("/api/contacts/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, safetyStatus: newStatus })
      });
      if (res.ok) {
        if (onRefresh) {
          onRefresh();
        } else {
          setLocalContacts(prev => prev.map(c => {
            if (c.id === id) {
              return { 
                ...c, 
                safetyStatus: newStatus,
                alertsCount: newStatus === "Trusted" ? 0 : c.alertsCount
              };
            }
            return c;
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNewContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;

    try {
      const res = await fetch("/api/contacts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newContactName,
          phone: newContactPhone,
          networkCarrier: newContactCarrier,
          relationship: newContactRelationship
        })
      });
      if (res.ok) {
        if (onRefresh) {
          onRefresh();
        } else {
          const added: TrackedContact = {
            id: "c-" + Date.now(),
            name: newContactName,
            phone: newContactPhone,
            networkCarrier: newContactCarrier,
            relationship: newContactRelationship,
            safetyStatus: "Trusted",
            alertsCount: 0,
            lastMessaged: "Never"
          };
          setLocalContacts(prev => [added, ...prev]);
        }
        setNewContactName("");
        setNewContactPhone("");
        setShowAddModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredContacts = activeContacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      {/* Intro section */}
      <div className="flex items-center justify-between mb-2 text-left">
        <div>
          <h2 className="font-bold text-lg text-slate-900 font-display">Contact Sync</h2>
          <p className="text-xs text-slate-500">Live directory monitoring on child's paired device</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="py-1.5 px-3 bg-[#1A5276] hover:bg-[#154360] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Track Number
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, phone, or carrier..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276] transition-all"
        />
      </div>

      {/* Directory list */}
      <div className="space-y-3">
        {filteredContacts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-2.5 shadow-3xs">
            <Users className="w-10 h-10 text-slate-350 mx-auto animate-pulse" />
            <h3 className="font-bold text-slate-800 text-xs font-display">No Contacts Found</h3>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              No matching phone entries were discovered in the directory database matching your term.
            </p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
          <div 
            key={contact.id}
            className={`p-4 bg-white rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-left ${
              contact.safetyStatus === "Blocked" ? "border-rose-100 bg-rose-50/10 opacity-70" : "border-slate-100"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${
                contact.safetyStatus === "Trusted" ? "bg-emerald-50 text-emerald-600" :
                contact.safetyStatus === "Blocked" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
              }`}>
                {contact.safetyStatus === "Trusted" ? <UserCheck className="w-5 h-5" /> :
                 contact.safetyStatus === "Blocked" ? <UserX className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 font-display">{contact.name}</h3>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                    {contact.relationship}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{contact.phone}</p>
                
                <div className="flex items-center gap-3 mt-1.5 text-slate-400 text-[10px]">
                  <span>Carrier: <strong>{contact.networkCarrier}</strong></span>
                  <span>•</span>
                  <span>Last Chat: <strong>{contact.lastMessaged}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Status Pill Filters / Block operations */}
            <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 justify-between md:justify-end">
              {contact.alertsCount > 0 && (
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                  {contact.alertsCount} AI Flags
                </span>
              )}
              
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  onClick={() => toggleSafetyStatus(contact.id, "Trusted")}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    contact.safetyStatus === "Trusted" ? "bg-white text-emerald-700 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Trust
                </button>
                <button
                  onClick={() => toggleSafetyStatus(contact.id, "Unfamiliar")}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all  ${
                    contact.safetyStatus === "Unfamiliar" ? "bg-white text-amber-700 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Review
                </button>
                <button
                  onClick={() => toggleSafetyStatus(contact.id, "Blocked")}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all  ${
                    contact.safetyStatus === "Blocked" ? "bg-white text-rose-700 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Block
                </button>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Unfamiliar Call warning message */}
      <div className="bg-slate-50/80 p-4 border border-slate-200 rounded-3xl text-left text-xs text-slate-600 flex gap-3 items-start">
        <ShieldCheck className="w-5 h-5 text-[#1A5276] shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 block mb-0.5 font-display">Nigeria SIM Registry Sync</strong>
          Unfamiliar numbers are matched against active local carrier prefixes. Redundant flags automatically alert parents if they make persistent repetitive calls past Lagos educational curfew hours (9:00 PM).
        </div>
      </div>

      {/* Track phone Modal Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleAddNewContact}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-100 text-left relative animate-in fade-in zoom-in-95 duration-200"
          >
            <h3 className="font-extrabold text-lg font-display text-slate-900 mb-2">Track New Phone Contact</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Manually add a contact to watch specifically. Security rules automatically activate.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Name</label>
                <input 
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g., Segun Cybercafe Owner"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (+234 format)</label>
                <input 
                  type="text"
                  required
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="e.g. +234 802 449 0123"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#1A5276]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Local Carrier</label>
                  <select
                    value={newContactCarrier}
                    onChange={(e) => setNewContactCarrier(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none"
                  >
                    <option value="MTN Nigeria">MTN Nigeria</option>
                    <option value="Airtel Nigeria">Airtel Nigeria</option>
                    <option value="Globacom">Globacom (Glo)</option>
                    <option value="9mobile">9mobile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                  <input 
                    type="text"
                    value={newContactRelationship}
                    onChange={(e) => setNewContactRelationship(e.target.value)}
                    placeholder="e.g., Neighbor, Cousin"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276]"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#1A5276] hover:bg-[#154360] text-white rounded-xl text-xs font-bold transition-all text-center"
              >
                Add & Safe-Track
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
