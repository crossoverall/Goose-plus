"use client";

import React, { useState } from "react";
import { Bill } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  syncBillToSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { Share2, Copy, Check, X, ExternalLink, MessageCircle } from "lucide-react";

interface ShareBillModalProps {
  bill: Bill;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareBillModal({ bill, isOpen, onClose }: ShareBillModalProps) {
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const [copiedLine, setCopiedLine] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const generalShareUrl = `${origin}/b/${bill.id}`;
  // Append openExternalBrowser=1 so LINE opens directly in Safari/Chrome instead of transient in-app WebView
  const lineShareUrl = `${origin}/b/${bill.id}?openExternalBrowser=1`;

  const handleShare = async (url: string, type: "general" | "line") => {
    setIsSyncing(true);
    await syncBillToSupabase(bill);
    setIsSyncing(false);

    navigator.clipboard.writeText(url);
    if (type === "general") {
      setCopiedGeneral(true);
      setTimeout(() => setCopiedGeneral(false), 2500);
    } else {
      setCopiedLine(true);
      setTimeout(() => setCopiedLine(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-2xl text-blue-600 dark:text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Share Bill with Friends
              </h3>
              <p className="text-xs text-neutral-500">
                Friends enter their name and claim what they ate or drank
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

        {/* Standard Link */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
            Standard Share Link (Messenger, WhatsApp, Web)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={generalShareUrl}
              className="flex-1 px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400 select-all outline-hidden"
            />
            <button
              type="button"
              onClick={() => handleShare(generalShareUrl, "general")}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              {copiedGeneral ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isSyncing ? "Syncing..." : "Copy"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* LINE Optimized Link */}
        <div className="p-3.5 rounded-2xl bg-green-50/60 dark:bg-green-950/20 border border-green-200 dark:border-green-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-900 dark:text-green-300 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span>Recommended for LINE Groups</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
              Auto-Safari/Chrome
            </span>
          </div>
          <p className="text-[11px] text-green-800/80 dark:text-green-400/80">
            Forces LINE to open in the real phone browser so their name and claimed items are never forgotten.
          </p>
          <button
            type="button"
            onClick={() => handleShare(lineShareUrl, "line")}
            disabled={isSyncing}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors shadow-xs cursor-pointer"
          >
            {copiedLine ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied LINE Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link for LINE Chat</span>
              </>
            )}
          </button>
        </div>

        {/* Supabase status warning if not set up */}
        {!isSupabaseConfigured && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300">
            <strong>Configuration note:</strong> Please paste your Supabase anon key into{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">.env.local</code> to activate cloud sync.
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            Close
          </button>
          <a
            href={generalShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs"
          >
            <span>Preview Room</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
