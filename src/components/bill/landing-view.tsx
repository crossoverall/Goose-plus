"use client";

import React, { useState } from "react";
import { User, ArrowRight, Sparkles, Clock, Receipt, Trash2 } from "lucide-react";
import { Bill } from "@/lib/types";

interface LandingViewProps {
  onStart: (ownerName: string, billTitle?: string) => void;
  savedBills: Bill[];
  onLoadBill: (id: string) => void;
  onDeleteBill: (id: string) => void;
}

export function LandingView({
  onStart,
  savedBills,
  onLoadBill,
  onDeleteBill,
}: LandingViewProps) {
  const [ownerName, setOwnerName] = useState("");
  const [billTitle, setBillTitle] = useState("");
  const [showSaved, setShowSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim()) return;
    onStart(ownerName.trim(), billTitle.trim() || undefined);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full mx-auto my-auto py-12 space-y-8">
        {/* Brand / Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-3xl mx-auto shadow-sm">
            🪿
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
                Goose+
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                BILL SPLITTER
              </span>
              <span className="text-[10px] font-mono font-medium text-neutral-400">
                v1.0.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5">
              Split restaurant bills fairly with friends in real-time
            </p>
          </div>
        </div>

        {/* Clean 2-input Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4"
        >
          {/* Owner Name Input (Required) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                autoFocus
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Alex, Lisa, Ken..."
                className="w-full pl-10 pr-3.5 py-3 text-sm font-medium rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Optional Bill / Restaurant Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 block">
              Occasion or Restaurant Name{" "}
              <span className="text-[10px] text-neutral-400">(optional)</span>
            </label>
            <div className="relative">
              <Receipt className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                placeholder="e.g. Somtum Der, Friday Hotpot..."
                className="w-full pl-10 pr-3.5 py-2.5 text-sm font-medium rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-neutral-400 transition-all text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={!ownerName.trim()}
            className="w-full mt-2 py-3.5 text-sm font-bold rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Create Bill</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Saved Bills Section (if any exist) */}
        {savedBills.length > 0 && (
          <div className="space-y-2 text-center">
            <button
              type="button"
              onClick={() => setShowSaved(!showSaved)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {showSaved ? "Hide past bills" : `Or view past bills (${savedBills.length})`}
              </span>
            </button>

            {showSaved && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3 shadow-md space-y-1.5 text-left max-h-52 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                {savedBills.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onLoadBill(b.id)}
                    className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {b.title}
                      </p>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(b.createdAt).toLocaleDateString()} · {b.items.length} items
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBill(b.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-neutral-400 py-2">
        Goose+ — Minimalist, Fair Restaurant Bill Splitting (THB)
      </footer>
    </div>
  );
}
