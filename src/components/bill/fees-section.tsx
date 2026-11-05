"use client";

import React from "react";
import { useBillStore } from "@/lib/bill-store";
import { Percent, DollarSign, Tag, HeartHandshake, QrCode } from "lucide-react";

export function FeesSection() {
  const { currentBill, updateBillMeta } = useBillStore();

  if (!currentBill) return null;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          PromptPay & Extra Charges
        </h2>
        <p className="text-xs text-neutral-500">
          Set your PromptPay for friend transfers, plus optional tax & service charge
        </p>
      </div>

      {/* PromptPay Phone / ID Input */}
      <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1.5">
          <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Your PromptPay Number (Phone or National ID)</span>
        </label>
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <input
            type="text"
            value={currentBill.promptPayNumber || ""}
            onChange={(e) => updateBillMeta({ promptPayNumber: e.target.value })}
            placeholder="e.g. 0812345678 or 1100200300400"
            className="flex-1 px-3 py-2 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-1.5">
          💡 When friends open the shared link or summary, they will see a <strong>&quot;Pay via PromptPay&quot;</strong> button with an auto-generated QR code for their exact amount.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Service Charge % */}
        <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
          <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-neutral-500" />
            Service Charge (%)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={currentBill.serviceChargePercent || 0}
              onChange={(e) =>
                updateBillMeta({
                  serviceChargePercent: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full pl-3 pr-7 py-1.5 text-sm font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
              %
            </span>
          </div>
          <div className="flex gap-1.5 mt-2">
            {[0, 10].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => updateBillMeta({ serviceChargePercent: val })}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                  currentBill.serviceChargePercent === val
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>

        {/* VAT / Tax % */}
        <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
          <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
            <Percent className="w-3.5 h-3.5 text-neutral-500" />
            VAT / Tax (%)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={currentBill.vatPercent || 0}
              onChange={(e) =>
                updateBillMeta({
                  vatPercent: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full pl-3 pr-7 py-1.5 text-sm font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
              %
            </span>
          </div>
          <div className="flex gap-1.5 mt-2">
            {[0, 7].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => updateBillMeta({ vatPercent: val })}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                  currentBill.vatPercent === val
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {val}% {val === 7 && "(TH)"}
              </button>
            ))}
          </div>
        </div>

        {/* Lump Sum Discount */}
        <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
          <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-neutral-500" />
            Discount ({currentBill.currency})
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
              {currentBill.currency}
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={currentBill.discountAmount || ""}
              onChange={(e) =>
                updateBillMeta({
                  discountAmount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0"
              className="w-full pl-7 pr-3 py-1.5 text-sm font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Deducted before tax & SC</p>
        </div>

        {/* Tip */}
        <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
          <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
            <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
            Tip ({currentBill.currency})
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
              {currentBill.currency}
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={currentBill.tipAmount || ""}
              onChange={(e) =>
                updateBillMeta({
                  tipAmount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0"
              className="w-full pl-7 pr-3 py-1.5 text-sm font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Shared proportionally</p>
        </div>
      </div>
    </div>
  );
}
