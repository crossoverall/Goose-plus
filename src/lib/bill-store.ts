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

function createDefaultBill(): Bill {
  const p1: Person = { id: generateId(), name: "You", color: AVATAR_COLORS[0] };
  const p2: Person = { id: generateId(), name: "Friend", color: AVATAR_COLORS[1] };

  return {
    id: generateId(),
    title: "Dinner with friends",
    currency: "฿",
    promptPayNumber: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serviceChargePercent: 10,
    vatPercent: 7,
    discountAmount: 0,
    tipAmount: 0,
    people: [p1, p2],
    items: [
      {
        id: generateId(),
        name: "Pad Thai",
        price: 150,
        quantity: 1,
        assignedPersonIds: [p1.id],
      },
      {
        id: generateId(),
        name: "Tom Yum Soup",
        price: 240,
        quantity: 1,
        assignedPersonIds: [p1.id, p2.id],
      },
    ],
  };
}

interface BillStoreState {
  currentBill: Bill;
  bills: Bill[];
  setCurrentBill: (bill: Bill) => void;
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
  createNewBill: (title?: string) => void;
  loadBill: (id: string) => void;
  deleteBill: (id: string) => void;
  saveCurrentBill: () => void;
}

export const useBillStore = create<BillStoreState>()(
  persist(
    (set, get) => {
      const initial = createDefaultBill();

      return {
        currentBill: initial,
        bills: [initial],

        setCurrentBill: (bill) => set({ currentBill: bill }),

        updateBillMeta: (updates) =>
          set((state) => {
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
            const trimmed = name.trim();
            if (!trimmed) return state;
            const color = AVATAR_COLORS[state.currentBill.people.length % AVATAR_COLORS.length];
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

        createNewBill: (title = "New Restaurant Bill") => {
          const fresh = createDefaultBill();
          fresh.title = title;
          set((state) => ({
            currentBill: fresh,
            bills: [fresh, ...state.bills],
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
            let nextCurrent = state.currentBill;
            if (state.currentBill.id === id) {
              nextCurrent = remaining[0] || createDefaultBill();
            }
            return {
              bills: remaining.length > 0 ? remaining : [nextCurrent],
              currentBill: nextCurrent,
            };
          });
        },

        saveCurrentBill: () => {
          set((state) => {
            const current = state.currentBill;
            const exists = state.bills.some((b) => b.id === current.id);
            const bills = exists
              ? state.bills.map((b) => (b.id === current.id ? current : b))
              : [current, ...state.bills];
            return { bills };
          });
        },
      };
    },
    {
      name: "goose_plus_bills_storage",
    }
  )
);
