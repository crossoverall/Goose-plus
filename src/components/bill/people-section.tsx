"use client";

import React, { useState } from "react";
import { useBillStore } from "@/lib/bill-store";
import { UserPlus, X, User, Users, CheckCircle2, Minus, Plus } from "lucide-react";

export function PeopleSection() {
  const {
    currentBill,
    addPerson,
    removePerson,
    updatePersonName,
    updateBillMeta,
    togglePersonReady,
  } = useBillStore();
  const [nameInput, setNameInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!currentBill) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    addPerson(nameInput.trim());
    setNameInput("");
  };

  const currentCount = currentBill.people.length;
  const targetCount = currentBill.targetPeopleCount || 0;
  const readyCount = currentBill.people.filter((p) => p.isReady).length;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header with Target Headcount Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-neutral-500" />
            <span>Who is splitting?</span>
          </h2>
          <p className="text-xs text-neutral-500">
            {currentCount} {currentCount === 1 ? "person" : "people"} in room ·{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {readyCount}/{currentCount} ready
            </span>
          </p>
        </div>

        {/* Expected Headcount Setter */}
        <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 px-2.5 py-1.5 rounded-xl">
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Expected:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                updateBillMeta({
                  targetPeopleCount: Math.max(0, targetCount - 1),
                })
              }
              className="w-6 h-6 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Decrease target"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-neutral-900 dark:text-neutral-100">
              {targetCount > 0 ? targetCount : "—"}
            </span>
            <button
              type="button"
              onClick={() =>
                updateBillMeta({
                  targetPeopleCount: (targetCount || currentCount) + 1,
                })
              }
              className="w-6 h-6 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Increase target"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar if target headcount is set */}
      {targetCount > 0 && (
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-600 dark:text-neutral-400">
              Room Headcount Progress
            </span>
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              {currentCount} / {targetCount} Joined{" "}
              {currentCount >= targetCount && "🎉 (Full Table)"}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                currentCount >= targetCount ? "bg-green-500" : "bg-blue-600"
              }`}
              style={{
                width: `${Math.min(100, Math.round((currentCount / targetCount) * 100))}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
            <span>
              {readyCount} of {currentCount} marked &quot;Ready&quot;
            </span>
            {currentCount < targetCount ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Waiting for {targetCount - currentCount} more
              </span>
            ) : (
              <span className="text-green-600 dark:text-green-400 font-medium">
                Everyone has joined
              </span>
            )}
          </div>
        </div>
      )}

      {/* People Badges with Ready indicator */}
      <div className="flex flex-wrap gap-2">
        {currentBill.people.map((person) => (
          <div
            key={person.id}
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
              person.isReady
                ? "bg-green-50 border-green-300 text-green-900 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300"
                : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: person.color || "#3b82f6" }}
            />

            {editingId === person.id ? (
              <input
                type="text"
                defaultValue={person.name}
                autoFocus
                onBlur={(e) => {
                  updatePersonName(person.id, e.target.value);
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updatePersonName(person.id, (e.target as HTMLInputElement).value);
                    setEditingId(null);
                  }
                }}
                className="bg-transparent text-sm font-medium outline-hidden w-24 border-b border-neutral-400"
              />
            ) : (
              <span
                onClick={() => setEditingId(person.id)}
                className="cursor-pointer hover:underline"
                title="Click to rename"
              >
                {person.name}
              </span>
            )}

            {/* Ready badge toggle button for owner */}
            <button
              type="button"
              onClick={() => togglePersonReady(person.id)}
              title={person.isReady ? "Marked as Ready" : "Click to mark Ready"}
              className={`ml-1 flex items-center gap-1 text-[11px] px-1.5 py-0.2 rounded-full font-semibold transition-colors ${
                person.isReady
                  ? "bg-green-600 text-white"
                  : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {person.isReady ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Ready</span>
                </>
              ) : (
                <span>Pending</span>
              )}
            </button>

            {currentBill.people.length > 1 && (
              <button
                type="button"
                onClick={() => removePerson(person.id)}
                aria-label={`Remove ${person.name}`}
                className="ml-0.5 text-neutral-400 hover:text-red-500 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Person Input */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <div className="relative flex-1">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Add person name (e.g. Alex, Lisa, Ken)..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add
        </button>
      </form>
    </div>
  );
}
