"use client";

import React, { useState } from "react";
import { Bill } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  syncBillToSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { Share2, Copy, Check, QrCode, X, ExternalLink } from "lucide-react";

interface ShareBillModalProps {
  bill: Bill;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareBillModal({ bill, isOpen, onClose }: ShareBillModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/b/${bill.id}`;

  const handleShare = async () => {
    setIsSyncing(true);
    await syncBillToSupabase(bill);
    setIsSyncing(false);

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Share Bill with Friends
              </h3>
              <p className="text-xs text-neutral-500">
                Friends can open this link, enter their name, and pick their items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Link Box */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Collaborative Room Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400 select-all outline-hidden"
            />
            <button
              type="button"
              onClick={handleShare}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isSyncing ? "Syncing..." : "Copy Link"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* How it works info */}
        <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
          <p className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-1.5">
            <span>✨</span> How Realtime Bill Splitting Works:
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-[11px]">
            <li>Send this link in your Line / WhatsApp / Messenger group.</li>
            <li>Your friends open the link and pick their name (or type a new one).</li>
            <li>They check off the items they ate or drank.</li>
            <li>Everyone&apos;s totals update automatically on all screens!</li>
          </ol>
        </div>

        {/* Supabase status warning if not set up */}
        {!isSupabaseConfigured && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300">
            <strong>Configuration note:</strong> Please paste your Supabase anon key into{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">.env.local</code> to activate cloud sync.
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            Close
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <span>Open Room Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
