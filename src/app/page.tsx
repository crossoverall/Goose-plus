"use client";

import React, { useState, useEffect, useRef } from "react";
import { useBillStore } from "@/lib/bill-store";
import { PeopleSection } from "@/components/bill/people-section";
import { ItemsSection } from "@/components/bill/items-section";
import { FeesSection } from "@/components/bill/fees-section";
import { SummaryView } from "@/components/bill/summary-view";
import { ShareBillModal } from "@/components/bill/share-modal";
import { LandingView } from "@/components/bill/landing-view";
import { calculateBill } from "@/lib/calculator";
import { formatCurrency } from "@/lib/utils";
import {
  supabase,
  syncBillToSupabase,
  rowToBill,
  BillRow,
} from "@/lib/supabase";
import {
  Receipt,
  Calculator,
  PlusCircle,
  FileText,
  Trash2,
  ChevronDown,
  Share2,
  Cloud,
  ArrowLeft,
} from "lucide-react";

export default function Home() {
  const {
    currentBill,
    bills,
    setCurrentBill,
    closeCurrentBill,
    updateBillMeta,
    createNewBill,
    loadBill,
    deleteBill,
  } = useBillStore();

  const [activeTab, setActiveTab] = useState<"edit" | "summary">("edit");
  const [showSavedBills, setShowSavedBills] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "synced">("idle");

  const isRemoteUpdateRef = useRef(false);

  // 1. Two-way Realtime Subscription
  useEffect(() => {
    if (!supabase || !currentBill?.id) return;

    const channel = supabase
      .channel(`bill-owner-${currentBill.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bills",
          filter: `id=eq.${currentBill.id}`,
        },
        (payload) => {
          if (payload.new) {
            const updated = rowToBill(payload.new as BillRow);
            isRemoteUpdateRef.current = true;
            setCurrentBill(updated);
            setTimeout(() => {
              isRemoteUpdateRef.current = false;
            }, 300);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentBill?.id, setCurrentBill]);

  // 2. Realtime Auto-Push
  useEffect(() => {
    if (!supabase || !currentBill?.id) return;
    if (isRemoteUpdateRef.current) return;

    setSyncStatus("saving");
    const timeout = setTimeout(async () => {
      await syncBillToSupabase(currentBill);
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 1800);
    }, 400);

    return () => clearTimeout(timeout);
  }, [currentBill]);

  // If no bill is active, render the clean 2-input landing page
  if (!currentBill) {
    return (
      <LandingView
        onStart={(ownerName, billTitle) => createNewBill(ownerName, billTitle)}
        savedBills={bills}
        onLoadBill={(id) => loadBill(id)}
        onDeleteBill={(id) => deleteBill(id)}
      />
    );
  }

  const summary = calculateBill(currentBill);

  return (
    <div className="min-h-screen bg-neutral-100/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeCurrentBill}
              className="p-1.5 -ml-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-bold text-xs shadow-xs">
              🪿
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                Goose Plus
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Sync Indicator */}
            {syncStatus === "saving" && (
              <span className="text-[10px] text-neutral-400 animate-pulse flex items-center gap-1">
                <Cloud className="w-3 h-3" /> Syncing...
              </span>
            )}
            {syncStatus === "synced" && (
              <span className="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <Cloud className="w-3 h-3" /> Live
              </span>
            )}

            {/* Share Room Button */}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Room</span>
            </button>

            {/* Saved Bills Dropdown */}
            {bills.length > 1 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSavedBills(!showSavedBills)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Bills ({bills.length})</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {showSavedBills && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg p-2 z-50">
                    <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-neutral-100 dark:border-neutral-800">
                      <span className="text-[11px] font-semibold text-neutral-400 uppercase">
                        Saved Bills
                      </span>
                      <button
                        onClick={closeCurrentBill}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        + New
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {bills.map((b) => (
                        <div
                          key={b.id}
                          className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            b.id === currentBill.id
                              ? "bg-neutral-100 dark:bg-neutral-800 font-semibold"
                              : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                          }`}
                          onClick={() => {
                            loadBill(b.id);
                            setShowSavedBills(false);
                          }}
                        >
                          <div className="truncate pr-2">
                            <p className="truncate text-neutral-900 dark:text-neutral-100">
                              {b.title}
                            </p>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(b.createdAt).toLocaleDateString()} · {b.people.length} people
                            </span>
                          </div>
                          {bills.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBill(b.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={closeCurrentBill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Bill Title Banner */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[240px]">
            <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Restaurant / Occasion Name
            </label>
            <input
              type="text"
              value={currentBill.title}
              onChange={(e) => updateBillMeta({ title: e.target.value })}
              placeholder="e.g. Somtum Der, Friday Hotpot..."
              className="w-full text-xl sm:text-2xl font-bold bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-neutral-900 dark:focus:border-neutral-100 outline-hidden transition-all text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-medium text-neutral-400 block uppercase">
                Estimated Total
              </span>
              <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {formatCurrency(summary.grandTotal, currentBill.currency)}
              </span>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl px-2.5 py-1 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              {currentBill.currency}
            </div>
          </div>
        </div>

        {/* Tab Switcher (Edit vs Summary) */}
        <div className="flex p-1 bg-neutral-200/70 dark:bg-neutral-900 rounded-2xl border border-neutral-200/50 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "edit"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Bill Editor ({currentBill.items.length} items)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "summary"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Split Summary ({currentBill.people.length} people)</span>
          </button>
        </div>

        {/* Tab Body */}
        {activeTab === "edit" ? (
          <div className="space-y-6">
            <PeopleSection />
            <ItemsSection />
            <FeesSection />

            {/* Calculate & Share Button floating action */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 transition-all shadow-xs cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Share Room</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-2xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>View Fair Split Summary</span>
                <Calculator className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <SummaryView onBackToEdit={() => setActiveTab("edit")} />
        )}
      </main>

      {/* Share Modal */}
      <ShareBillModal
        bill={currentBill}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-400">
        <p>Goose Plus — Minimalist, Fair Restaurant Bill Splitting (THB)</p>
      </footer>
    </div>
  );
}
