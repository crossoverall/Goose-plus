"use client";

import React, { useState } from "react";
import { useBillStore } from "@/lib/bill-store";
import { Plus, Trash2, Users, Check, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function ItemsSection() {
  const {
    currentBill,
    addItem,
    updateItem,
    removeItem,
    toggleItemAssignment,
    selectAllPeopleForItem,
    clearAllPeopleForItem,
  } = useBillStore();

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const priceNum = parseFloat(newItemPrice) || 0;

    addItem({
      name: newItemName.trim(),
      price: priceNum,
      quantity: 1,
    });

    setNewItemName("");
    setNewItemPrice("");
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Bill Items
          </h2>
          <p className="text-xs text-neutral-500">
            Add items and select who is sharing each item
          </p>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3 mb-5">
        {currentBill.items.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-sm border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
            No items yet. Add the first menu item below!
          </div>
        ) : (
          currentBill.items.map((item) => {
            const isAssignedToAll =
              item.assignedPersonIds.length === currentBill.people.length &&
              currentBill.people.length > 0;
            const isUnassigned = item.assignedPersonIds.length === 0;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                {/* Item Details Row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    placeholder="Item name"
                    className="flex-1 min-w-[140px] px-2.5 py-1.5 text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                  />

                  {/* Quantity controls */}
                  <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 px-1 py-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })
                      }
                      className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                      className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Price input */}
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
                      {currentBill.currency}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.price === 0 ? "" : item.price}
                      onChange={(e) =>
                        updateItem(item.id, {
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                      className="w-full pl-7 pr-2.5 py-1.5 text-sm font-medium text-right rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>

                  {/* Total line price */}
                  <div className="w-24 text-right text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {formatCurrency(item.price * item.quantity, currentBill.currency)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Assignment Row */}
                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mr-1">
                      Split with:
                    </span>
                    {currentBill.people.map((person) => {
                      const isAssigned = item.assignedPersonIds.includes(person.id);
                      return (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => toggleItemAssignment(item.id, person.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            isAssigned
                              ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs"
                              : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300 dark:hover:border-neutral-600"
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: person.color || "#3b82f6" }}
                          />
                          <span>{person.name}</span>
                          {isAssigned && <Check className="w-3 h-3 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Select buttons */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        isAssignedToAll
                          ? clearAllPeopleForItem(item.id)
                          : selectAllPeopleForItem(item.id)
                      }
                      className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline"
                    >
                      {isAssignedToAll ? "Deselect all" : "All"}
                    </button>
                    {isUnassigned && (
                      <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                        ⚠️ Not assigned to anyone
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleQuickAdd} className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="New item (e.g. Fried Rice, Iced Lemon Tea)..."
          className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-neutral-400 transition-all"
        />
        <div className="relative w-32">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
            {currentBill.currency}
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            placeholder="Price"
            className="w-full pl-8 pr-3 py-2 text-sm text-right rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-neutral-400 transition-all font-medium"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </form>
    </div>
  );
}
