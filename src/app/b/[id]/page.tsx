"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { Bill, Person, BillItem } from "@/lib/types";
import { calculateBill } from "@/lib/calculator";
import { formatCurrency } from "@/lib/utils";
import { PromptPayModal } from "@/components/bill/promptpay-modal";
import {
  supabase,
  fetchBillFromSupabase,
  syncBillToSupabase,
  rowToBill,
  BillRow,
} from "@/lib/supabase";
import {
  User,
  Check,
  Plus,
  Receipt,
  Users,
  Utensils,
  Share2,
  Sparkles,
  ArrowRight,
  QrCode,
} from "lucide-react";

const AVATAR_COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#9333ea",
  "#e11d48",
  "#0d9488",
  "#ea580c",
  "#4f46e5",
];

function GuestBillContent() {
  const routeParams = useParams();
  const billId = routeParams?.id as string;

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePersonId, setActivePersonId] = useState<string | null>(null);
  const [nameModalInput, setNameModalInput] = useState("");
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPromptPayModal, setShowPromptPayModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Load bill and check existing session
  useEffect(() => {
    if (!billId) return;
    let channel: any = null;

    async function init() {
      setLoading(true);
      const data = await fetchBillFromSupabase(billId);
      if (data) {
        setBill(data);
        const storedPersonId = localStorage.getItem(`goose_person_${billId}`);
        if (storedPersonId && data.people.some((p) => p.id === storedPersonId)) {
          setActivePersonId(storedPersonId);
          setShowWelcomeModal(false);
        } else {
          setShowWelcomeModal(true);
        }
      }
      setLoading(false);

      if (supabase) {
        channel = supabase
          .channel(`bill-room-${billId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "bills",
              filter: `id=eq.${billId}`,
            },
            (payload) => {
              if (payload.new) {
                const updated = rowToBill(payload.new as BillRow);
                setBill(updated);
              }
            }
          )
          .subscribe();
      }
    }

    init();

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [billId]);

  // Persist updates to cloud
  const handleUpdateBill = async (updated: Bill) => {
    setBill(updated);
    setSaveStatus("saving");
    await syncBillToSupabase(updated);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  // Join via the Welcome Modal
  const handleJoinFromNameModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill || !nameModalInput.trim()) return;

    const trimmed = nameModalInput.trim();
    const existing = bill.people.find(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      setActivePersonId(existing.id);
      localStorage.setItem(`goose_person_${billId}`, existing.id);
      setShowWelcomeModal(false);
      return;
    }

    const newPerson: Person = {
      id: Math.random().toString(36).substring(2, 9),
      name: trimmed,
      color: AVATAR_COLORS[bill.people.length % AVATAR_COLORS.length],
    };

    const updated: Bill = {
      ...bill,
      people: [...bill.people, newPerson],
      updatedAt: new Date().toISOString(),
    };

    setActivePersonId(newPerson.id);
    localStorage.setItem(`goose_person_${billId}`, newPerson.id);
    setShowWelcomeModal(false);
    handleUpdateBill(updated);
  };

  const handleSelectExistingPerson = (person: Person) => {
    setActivePersonId(person.id);
    localStorage.setItem(`goose_person_${billId}`, person.id);
    setShowWelcomeModal(false);
  };

  // Toggle item check for active person
  const toggleItemForActivePerson = (itemId: string) => {
    if (!bill || !activePersonId) {
      setShowWelcomeModal(true);
      return;
    }

    const updatedItems = bill.items.map((item) => {
      if (item.id !== itemId) return item;
      const isAssigned = item.assignedPersonIds.includes(activePersonId);
      const assignedPersonIds = isAssigned
        ? item.assignedPersonIds.filter((id) => id !== activePersonId)
        : [...item.assignedPersonIds, activePersonId];
      return { ...item, assignedPersonIds };
    });

    const updated: Bill = {
      ...bill,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    handleUpdateBill(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-500">Joining bill room...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-center space-y-3">
          <span className="text-3xl">🧾</span>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Bill Not Found
          </h2>
          <p className="text-xs text-neutral-500">
            This bill room does not exist or hasn&apos;t been synced by the host yet.
          </p>
          <a
            href="/"
            className="inline-block mt-3 px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
          >
            Create a Bill
          </a>
        </div>
      </div>
    );
  }

  const summary = calculateBill(bill);
  const activePerson = bill.people.find((p) => p.id === activePersonId);
  const activeBreakdown = summary.peopleBreakdowns.find(
    (b) => b.person.id === activePersonId
  );

  return (
    <div className="min-h-screen bg-neutral-100/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans pb-28">
      {/* Welcome Name Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl mx-auto shadow-xs">
                🪿
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Join {bill.title}
              </h2>
              <p className="text-xs text-neutral-500">
                What should we call you? Enter your name to choose what you ate or drank.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleJoinFromNameModal} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  autoFocus
                  required
                  value={nameModalInput}
                  onChange={(e) => setNameModalInput(e.target.value)}
                  placeholder="Your Name (e.g. Alex, Lisa, Ken)..."
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-medium rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!nameModalInput.trim()}
                className="w-full py-2.5 text-sm font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Existing names picker if host already created names */}
            {bill.people.length > 0 && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block text-center">
                  Or pick existing person
                </span>
                <div className="flex flex-wrap justify-center gap-1.5 max-h-32 overflow-y-auto">
                  {bill.people.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectExistingPerson(p)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: p.color || "#3b82f6" }}
                      />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-lg">🪿</span>
            <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
              Goose+
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
              BILL SPLITTER
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              v1.0.0
            </span>
          </div>

          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="text-[10px] text-neutral-400 animate-pulse">
                Syncing...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                Saved ✓
              </span>
            )}
            <div className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900 text-[10px] font-semibold text-green-700 dark:text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live Room
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl w-full mx-auto p-4 space-y-4">
        {/* Active Identity Bar */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs"
              style={{ backgroundColor: activePerson?.color || "#3b82f6" }}
            >
              {activePerson ? activePerson.name.slice(0, 2).toUpperCase() : "?"}
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                You are participating as
              </span>
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {activePerson ? activePerson.name : "Guest (Not selected)"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowWelcomeModal(true)}
            className="px-3 py-1 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Switch Name
          </button>
        </div>

        {/* Menu Items Checkbox Section */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-neutral-500" />
                <span>What did you eat or drink?</span>
              </h2>
              <p className="text-xs text-neutral-500">
                Tap items to claim. Shared dishes divide the cost automatically.
              </p>
            </div>
          </div>

          {/* Items Checkbox List */}
          <div className="space-y-2 pt-1">
            {bill.items.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-400">
                No items on this bill yet.
              </div>
            ) : (
              bill.items.map((item) => {
                const isSelected = activePersonId
                  ? item.assignedPersonIds.includes(activePersonId)
                  : false;
                const sharingCount = item.assignedPersonIds.length;
                const costForOne =
                  sharingCount > 0
                    ? (item.price * item.quantity) / (isSelected ? sharingCount : sharingCount + 1)
                    : item.price * item.quantity;

                const sharingPeople = bill.people.filter((p) =>
                  item.assignedPersonIds.includes(p.id)
                );

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItemForActivePerson(item.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                      isSelected
                        ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/70 shadow-2xs"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                            : "border-neutral-300 dark:border-neutral-700"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {item.name}
                          {item.quantity > 1 && (
                            <span className="text-neutral-400 font-normal ml-1">
                              ×{item.quantity}
                            </span>
                          )}
                        </p>

                        <div className="flex items-center gap-1 mt-1">
                          {sharingPeople.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <div className="flex -space-x-1.5">
                                {sharingPeople.slice(0, 4).map((p) => (
                                  <span
                                    key={p.id}
                                    title={p.name}
                                    className="w-4 h-4 rounded-full border border-white dark:border-neutral-900 flex items-center justify-center text-[8px] font-bold text-white shadow-2xs"
                                    style={{ backgroundColor: p.color || "#3b82f6" }}
                                  >
                                    {p.name.slice(0, 1)}
                                  </span>
                                ))}
                              </div>
                              <span className="text-[10px] text-neutral-400 ml-0.5">
                                {sharingPeople.length === 1
                                  ? sharingPeople[0].name
                                  : `${sharingPeople.length} sharing`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400">
                              Unclaimed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block">
                        {formatCurrency(item.price * item.quantity, bill.currency)}
                      </span>
                      {isSelected && sharingCount > 1 && (
                        <span className="text-[10px] text-neutral-400">
                          Your share: {formatCurrency(costForOne, bill.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Total for Everyone */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Live Total for Everyone
            </h2>
            <span className="text-xs font-semibold text-neutral-500">
              Grand Total: {formatCurrency(summary.grandTotal, bill.currency)}
            </span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {summary.peopleBreakdowns.map((b) => {
              const isMe = b.person.id === activePersonId;
              return (
                <div
                  key={b.person.id}
                  className={`py-2.5 flex items-center justify-between text-xs ${
                    isMe ? "font-bold text-blue-600 dark:text-blue-400" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: b.person.color || "#3b82f6" }}
                    />
                    <span>
                      {b.person.name} {isMe && "(You)"}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-normal">
                      ({b.items.length} items)
                    </span>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(b.total, bill.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Floating Bottom Bar with PromptPay Pay Button */}
      {activeBreakdown && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 z-40">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                {activeBreakdown.person.name}&apos;s Total (Inc. Tax & SC)
              </span>
              <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {formatCurrency(activeBreakdown.total, bill.currency)}
              </span>
            </div>

            {bill.promptPayNumber ? (
              <button
                type="button"
                onClick={() => setShowPromptPayModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <QrCode className="w-4 h-4" />
                <span>Pay via PromptPay</span>
              </button>
            ) : (
              <div className="text-right text-xs text-neutral-400">
                {activeBreakdown.items.length} items checked
              </div>
            )}
          </div>
        </div>
      )}

      {/* PromptPay Modal */}
      {showPromptPayModal && bill.promptPayNumber && activeBreakdown && (
        <PromptPayModal
          promptPayNumber={bill.promptPayNumber}
          amount={activeBreakdown.total}
          recipientName="Host"
          currency={bill.currency}
          isOpen={true}
          onClose={() => setShowPromptPayModal(false)}
        />
      )}
    </div>
  );
}

export default function GuestBillPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-500">Joining bill room...</p>
          </div>
        </div>
      }
    >
      <GuestBillContent />
    </Suspense>
  );
}
