"use client";

import React, { useState } from "react";
import { useBillStore } from "@/lib/bill-store";
import { UserPlus, X, User } from "lucide-react";

export function PeopleSection() {
  const { currentBill, addPerson, removePerson, updatePersonName } = useBillStore();
  const [nameInput, setNameInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    addPerson(nameInput.trim());
    setNameInput("");
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Who is splitting?
          </h2>
          <p className="text-xs text-neutral-500">
            {currentBill.people.length} {currentBill.people.length === 1 ? "person" : "people"} in this bill
          </p>
        </div>
      </div>

      {/* People Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {currentBill.people.map((person) => (
          <div
            key={person.id}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-medium transition-all hover:border-neutral-300 dark:hover:border-neutral-600"
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
                className="cursor-pointer text-neutral-800 dark:text-neutral-200 hover:underline"
                title="Click to rename"
              >
                {person.name}
              </span>
            )}

            {currentBill.people.length > 1 && (
              <button
                type="button"
                onClick={() => removePerson(person.id)}
                aria-label={`Remove ${person.name}`}
                className="ml-1 text-neutral-400 hover:text-red-500 rounded-full p-0.5 transition-colors"
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
            placeholder="Add person name (e.g. Alex, Mom, John)..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Add
        </button>
      </form>
    </div>
  );
}
