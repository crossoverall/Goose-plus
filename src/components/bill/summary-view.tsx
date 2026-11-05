"use client";

import React, { useState } from "react";
import { useBillStore } from "@/lib/bill-store";
import { calculateBill } from "@/lib/calculator";
import { formatCurrency } from "@/lib/utils";
import { PromptPayModal } from "@/components/bill/promptpay-modal";
import {
  Share2,
  Copy,
  Check,
  RotateCcw,
  Receipt,
  ArrowRight,
  Sparkles,
  QrCode,
} from "lucide-react";
import confetti from "canvas-confetti";

export function SummaryView({ onBackToEdit }: { onBackToEdit: () => void }) {
  const { currentBill } = useBillStore();
  const [copiedPersonId, setCopiedPersonId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // PromptPay modal state
  const [activePaymentPerson, setActivePaymentPerson] = useState<{
    name: string;
    amount: number;
  } | null>(null);

  if (!currentBill) return null;

  const summary = calculateBill(currentBill);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const copyPersonSummary = (personName: string, total: number, itemsText: string, personId: string) => {
    let text = `🧾 Bill: ${currentBill.title}\n👤 ${personName}'s share: ${formatCurrency(
      total,
      currentBill.currency
    )}\n\nItems:\n${itemsText}`;

    if (currentBill.promptPayNumber) {
      text += `\n\n💸 PromptPay: ${currentBill.promptPayNumber}`;
    }

    text += `\n\nSplit fairly with Goose Plus`;

    navigator.clipboard.writeText(text);
    setCopiedPersonId(personId);
    setTimeout(() => setCopiedPersonId(null), 2000);
  };

  const copyFullSummary = () => {
    let text = `🧾 ${currentBill.title} — Split Breakdown\n`;
    text += `Grand Total: ${formatCurrency(summary.grandTotal, currentBill.currency)}\n`;
    text += `------------------------------------\n`;

    summary.peopleBreakdowns.forEach((p) => {
      text += `👤 ${p.person.name}: ${formatCurrency(p.total, currentBill.currency)}\n`;
    });

    if (currentBill.promptPayNumber) {
      text += `------------------------------------\n💸 Transfer to PromptPay: ${currentBill.promptPayNumber}\n`;
    }

    text += `------------------------------------\nSplit with Goose Plus`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    triggerCelebration();
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
            Split Result
          </span>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {currentBill.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToEdit}
            className="px-3.5 py-1.5 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            Edit Items
          </button>
          <button
            type="button"
            onClick={copyFullSummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAll ? "Copied all!" : "Copy Summary"}
          </button>
        </div>
      </div>

      {/* Warning if unassigned items exist */}
      {summary.unassignedItemsCount > 0 && (
        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
          <span>
            ⚠️ <strong>{summary.unassignedItemsCount} item(s)</strong> are not assigned to anyone and excluded from the split.
          </span>
          <button
            onClick={onBackToEdit}
            className="underline font-semibold hover:text-amber-950"
          >
            Assign them
          </button>
        </div>
      )}

      {/* Individual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summary.peopleBreakdowns.map((breakdown) => {
          const itemsText = breakdown.items
            .map(
              (it) =>
                `• ${it.itemName} (x${it.quantity})${
                  it.sharedWithCount > 1 ? ` [shared /${it.sharedWithCount}]` : ""
                }: ${formatCurrency(it.cost, currentBill.currency)}`
            )
            .join("\n");

          return (
            <div
              key={breakdown.person.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Person Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-xs"
                      style={{ backgroundColor: breakdown.person.color || "#2563eb" }}
                    >
                      {breakdown.person.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                        {breakdown.person.name}
                      </h3>
                      <span className="text-[11px] text-neutral-400">
                        {breakdown.items.length} item(s)
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-neutral-400 block font-medium">To Pay</span>
                    <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(breakdown.total, currentBill.currency)}
                    </span>
                  </div>
                </div>

                {/* Items Breakdown list */}
                <div className="space-y-1.5 py-3 border-t border-neutral-100 dark:border-neutral-800">
                  {breakdown.items.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">No items assigned</p>
                  ) : (
                    breakdown.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400"
                      >
                        <div className="truncate pr-2">
                          <span>{it.itemName}</span>
                          {it.quantity > 1 && (
                            <span className="text-neutral-400 ml-1">×{it.quantity}</span>
                          )}
                          {it.sharedWithCount > 1 && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                              1/{it.sharedWithCount} share
                            </span>
                          )}
                        </div>
                        <span className="font-medium shrink-0">
                          {formatCurrency(it.cost, currentBill.currency)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Fees share breakdown */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1 text-[11px] text-neutral-500">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span>{formatCurrency(breakdown.subtotal, currentBill.currency)}</span>
                  </div>
                  {breakdown.discountShare > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount share</span>
                      <span>-{formatCurrency(breakdown.discountShare, currentBill.currency)}</span>
                    </div>
                  )}
                  {breakdown.serviceChargeShare > 0 && (
                    <div className="flex justify-between">
                      <span>Service Charge share</span>
                      <span>+{formatCurrency(breakdown.serviceChargeShare, currentBill.currency)}</span>
                    </div>
                  )}
                  {breakdown.vatShare > 0 && (
                    <div className="flex justify-between">
                      <span>VAT share</span>
                      <span>+{formatCurrency(breakdown.vatShare, currentBill.currency)}</span>
                    </div>
                  )}
                  {breakdown.tipShare > 0 && (
                    <div className="flex justify-between">
                      <span>Tip share</span>
                      <span>+{formatCurrency(breakdown.tipShare, currentBill.currency)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: PromptPay QR + Copy */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                {currentBill.promptPayNumber && (
                  <button
                    type="button"
                    onClick={() =>
                      setActivePaymentPerson({
                        name: breakdown.person.name,
                        amount: breakdown.total,
                      })
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>PromptPay QR</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    copyPersonSummary(
                      breakdown.person.name,
                      breakdown.total,
                      itemsText,
                      breakdown.person.id
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  {copiedPersonId === breakdown.person.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Info</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Grand Total Footer Card */}
      <div className="bg-neutral-900 text-white dark:bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-neutral-400" />
            <h3 className="font-semibold text-base">Bill Overview</h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-400 block font-medium">Grand Total</span>
            <span className="text-2xl font-bold tracking-tight">
              {formatCurrency(summary.grandTotal, currentBill.currency)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-800 text-xs">
          <div>
            <span className="text-neutral-400 block">Items Subtotal</span>
            <span className="font-semibold">{formatCurrency(summary.subtotal, currentBill.currency)}</span>
          </div>
          {summary.totalDiscount > 0 && (
            <div>
              <span className="text-neutral-400 block">Discount</span>
              <span className="font-semibold text-green-400">-{formatCurrency(summary.totalDiscount, currentBill.currency)}</span>
            </div>
          )}
          {summary.totalServiceCharge > 0 && (
            <div>
              <span className="text-neutral-400 block">Service Charge</span>
              <span className="font-semibold">+{formatCurrency(summary.totalServiceCharge, currentBill.currency)}</span>
            </div>
          )}
          {summary.totalVat > 0 && (
            <div>
              <span className="text-neutral-400 block">VAT / Tax</span>
              <span className="font-semibold">+{formatCurrency(summary.totalVat, currentBill.currency)}</span>
            </div>
          )}
          {summary.totalTip > 0 && (
            <div>
              <span className="text-neutral-400 block">Tip</span>
              <span className="font-semibold">+{formatCurrency(summary.totalTip, currentBill.currency)}</span>
            </div>
          )}
        </div>
      </div>

      {/* PromptPay Modal */}
      {activePaymentPerson && currentBill.promptPayNumber && (
        <PromptPayModal
          promptPayNumber={currentBill.promptPayNumber}
          amount={activePaymentPerson.amount}
          recipientName={activePaymentPerson.name}
          currency={currentBill.currency}
          isOpen={true}
          onClose={() => setActivePaymentPerson(null)}
        />
      )}
    </div>
  );
}
