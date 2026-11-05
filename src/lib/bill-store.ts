import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Bill, BillItem, Person } from "@/lib/types";

const AVATAR_COLORS = [
  "#2563eb", // blue
  "#16a34a", // green
  "#d97706", // amber
  "#9333ea", // purple
  "#e11d48", // rose
  "#0d9488", // teal
  "#ea580c", // orange
  "#4f46e5", // indigo
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createEmptyBill(ownerName: string = "Me", title?: string): Bill {
  const trimmedName = ownerName.trim() || "Me";
  const owner: Person = {
    id: generateId(),
    name: trimmedName,
    color: AVATAR_COLORS[0],
  };

  return {
    id: generateId(),
    title: title?.trim() || `${trimmedName}'s Bill`,
    currency: "฿",
    promptPayNumber: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serviceChargePercent: 0,
    vatPercent: 0,
    discountAmount: 0,
    tipAmount: 0,
    people: [owner],
    items: [], // Completely empty!
  };
}

interface BillStoreState {
  currentBill: Bill | null;
  bills: Bill[];
  setCurrentBill: (bill: Bill | null) => void;
  updateBillMeta: (
    updates: Partial<
      Pick<
        Bill,
        | "title"
        | "currency"
        | "promptPayNumber"
        | "serviceChargePercent"
        | "vatPercent"
        | "discountAmount"
        | "tipAmount"
      >
    >
  ) => void;
  // People actions
  addPerson: (name: string) => void;
  removePerson: (id: string) => void;
  updatePersonName: (id: string, name: string) => void;
  // Item actions
  addItem: (item?: Partial<BillItem>) => void;
  updateItem: (id: string, updates: Partial<BillItem>) => void;
  removeItem: (id: string) => void;
  toggleItemAssignment: (itemId: string, personId: string) => void;
  selectAllPeopleForItem: (itemId: string) => void;
  clearAllPeopleForItem: (itemId: string) => void;
  // Bill management
  createNewBill: (ownerName: string, title?: string) => void;
  loadBill: (id: string) => void;
  deleteBill: (id: string) => void;
  closeCurrentBill: () => void;
}

export const useBillStore = create<BillStoreState>()(
  persist(
    (set, get) => ({
      currentBill: null, // Start on landing page by default
      bills: [],

      setCurrentBill: (bill) => set({ currentBill: bill }),

      closeCurrentBill: () => set({ currentBill: null }),

      updateBillMeta: (updates) =>
        set((state) => {
          if (!state.currentBill) return state;
          const updated = {
            ...state.currentBill,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return {
            currentBill: updated,
            bills: state.bills.map((b) => (b.id === updated.id ? updated : b)),
          };
        }),

      addPerson: (name) =>
        set((state) => {
          if (!state.currentBill) return state;
          const trimmed = name.trim();
          if (!trimmed) return state;
          const color =
            AVATAR_COLORS[state.currentBill.people.length % AVATAR_COLORS.length];
          const newPerson: Person = {
            id: generateId(),
            name: trimmed,
            color,
          };
          const updated: Bill = {
            ...state.currentBill,
            people: [...state.currentBill.people, newPerson],
            updatedAt: new Date().toISOString(),
          };
          return {
            currentBill: updated,
            bills: state.bills.map((b) => (b.id === updated.id ? updated : b)),
          };
        }),

      removePerson: (id) =>
        set((state) => {
          if (!state.currentBill) return state;
          const updatedPeople = state.currentBill.people.filter((p) => p.id !== id);
          const updatedItems = state.currentBill.items.map((item) => ({
            ...item,
            assignedPersonIds: item.assignedPersonIds.filter((pId) => pId !== id),
          }));

          const updated: Bill = {
            ...state.currentBill,
            people: updatedPeople,
            items: updatedItems,
            updatedAt: new Date().toISOString(),
          };
          return {
            currentBill: updated,
            bills: state.bills.map((b) => (b.id === updated.id ? updated : b)),
          };
        }),

      updatePersonName: (id, name) =>
        set((state) => {
          if (!state.currentBill) return state;
          const updated: Bill = {
            ...state.currentBill,
            people: state.currentBill.people.map((p) =>
              p.id === id ? { ...p, name: name.trim() || p.name } : p
            ),
            updatedAt: new Date().toISOString(),
          };
          return {
            currentBill: updated,
            bills: state.bills.map((b) => (b.id === updated.id ? updated : b)),
          };
        }),

      addItem: (partial) =>
        set((state) => {
          if (!state.currentBill) return state;
          const allPersonIds = state.currentBill.people.map((p) => p.id);
          const newItem: BillItem = {
            id: generateId(),
            name: partial?.name || "",
            price: partial?.price ?? 0,
            quantity: partial?.quantity ?? 1,
            assignedPersonIds: partial?.assignedPersonIds ?? allPersonIds,
          };

          const updated: Bill = {
            ...state.currentBill,
            items: [...state.currentBill.items, newItem],
            updatedAt: new Date().toISOString(),
          };
          return {
            currentBill: updated,
            bills: state.bills.map((b) => (b.id === updated.id ? updated : b)),
          };
        }),

      updateItem: (id, updates) =>
        set((state) => {
          if (!state.currentBill) return state;
          const updated: Bill = {
            ...state.currentBill,
            items: state.currentBill.items.map((it) =>
              it.id === id ? { ...it, ...updates } : it
            ),
            updatedAt: new Date().toISOString(),
          };
          return {
            currentBill: updated,
            bills: state.bills.map((b) => (b.id === updated.id ? updated : b)),
          };
        }),

      removeItem: (id) =>
        set((state) => {
          if (!state.currentBill) return state;
          const updated: Bill = {
            ...state.currentBill,
            items: state.currentBill.items.filter((it) => it.id !== id),
            updatedAt: new Date().toISOString(),
          };
          return {
            currentBill: updated,
            bills: state.bills.map((b) => (b.id === updated.id ? updated : b)),
          };
        }),

      toggleItemAssignment: (itemId, personId) =>
        set((state) => {
          if (!state.currentBill) return state;
          const updatedItems = state.currentBill.items.map((item) => {
            if (item.id !== itemId) return item;
            const exists = item.assignedPersonIds.includes(personId);
            const assignedPersonIds = exists
              ? item.assignedPersonIds.filter((id) => id !== personId)
              : [...item.assignedPersonIds, personId];
            return { ...item, assignedPersonIds };
          });

          const updated: Bill = {
            ...state.currentBill,
            items: updatedItems,
            updatedAt: new Date().toISOString(),
          };
          return {
            currentBill: updated,
            bills: state.bills.map((b) => (b.id === updated.id ? updated : b)),
          };
        }),

      selectAllPeopleForItem: (itemId) =>
        set((state) => {
          if (!state.currentBill) return state;
          const allIds = state.currentBill.people.map((p) => p.id);
          const updatedItems = state.currentBill.items.map((it) =>
            it.id === itemId ? { ...it, assignedPersonIds: allIds } : it
          );
          const updated: Bill = {
            ...state.currentBill,
            items: updatedItems,
            updatedAt: new Date().toISOString(),
          };
          return {
            currentBill: updated,
            bills: state.bills.map((b) => (b.id === updated.id ? updated : b)),
          };
        }),

      clearAllPeopleForItem: (itemId) =>
        set((state) => {
          if (!state.currentBill) return state;
          const updatedItems = state.currentBill.items.map((it) =>
            it.id === itemId ? { ...it, assignedPersonIds: [] } : it
          );
          const updated: Bill = {
            ...state.currentBill,
            items: updatedItems,
            updatedAt: new Date().toISOString(),
          };
          return {
            currentBill: updated,
            bills: state.bills.map((b) => (b.id === updated.id ? updated : b)),
          };
        }),

      createNewBill: (ownerName: string, title?: string) => {
        const fresh = createEmptyBill(ownerName, title);
        set((state) => ({
          currentBill: fresh,
          bills: [fresh, ...state.bills.filter((b) => b.id !== fresh.id)],
        }));
      },

      loadBill: (id) => {
        const found = get().bills.find((b) => b.id === id);
        if (found) {
          set({ currentBill: found });
        }
      },

      deleteBill: (id) => {
        set((state) => {
          const remaining = state.bills.filter((b) => b.id !== id);
          const nextCurrent = state.currentBill?.id === id ? null : state.currentBill;
          return {
            bills: remaining,
            currentBill: nextCurrent,
          };
        });
      },
    }),
    {
      name: "goose_plus_bills_storage_v2",
    }
  )
);
