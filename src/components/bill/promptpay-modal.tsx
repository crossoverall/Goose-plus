"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import generatePayload from "promptpay-qr";
import { formatCurrency } from "@/lib/utils";
import { QrCode, Copy, Check, X, ShieldCheck } from "lucide-react";

interface PromptPayModalProps {
  promptPayNumber: string;
  amount: number;
  recipientName?: string;
  currency?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptPayModal({
  promptPayNumber,
  amount,
  recipientName = "Bill Host",
  currency = "฿",
  isOpen,
  onClose,
}: PromptPayModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Clean promptpay number (remove hyphens and spaces)
  const cleanNumber = (promptPayNumber || "").replace(/[^0-9]/g, "");

  let qrPayload = "";
  let errorMsg = "";

  if (cleanNumber.length === 10 || cleanNumber.length === 13) {
    try {
      qrPayload = generatePayload(cleanNumber, { amount: amount > 0 ? amount : undefined });
    } catch (e) {
      errorMsg = "Invalid PromptPay number format.";
    }
  } else {
    errorMsg = "Enter a valid 10-digit mobile number or 13-digit ID.";
  }

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(cleanNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* PromptPay Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PromptPay QR</span>
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Pay {recipientName}
          </h3>
          <p className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            {formatCurrency(amount, currency)}
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-inner inline-block mx-auto">
          {qrPayload ? (
            <QRCodeSVG
              value={qrPayload}
              size={180}
              level="M"
              includeMargin={false}
            />
          ) : (
            <div className="w-[180px] h-[180px] flex items-center justify-center text-xs text-red-500 p-4">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Account Info and Copy */}
        <div className="space-y-2">
          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-medium font-mono">
              PromptPay: {promptPayNumber}
            </span>
            <button
              type="button"
              onClick={handleCopyNumber}
              className="inline-flex items-center gap-1 font-semibold text-neutral-900 dark:text-neutral-100 hover:underline"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-neutral-400">
            Open your Thai banking app (K PLUS, SCB EASY, Krungthai, etc.) and scan to pay.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs"
        >
          Done
        </button>
      </div>
    </div>
  );
}
