export interface Person {
  id: string;
  name: string;
  color?: string;
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedPersonIds: string[]; // IDs of people sharing this item
}

export interface Bill {
  id: string;
  title: string;
  currency: string;
  promptPayNumber?: string; // Phone number or National ID for PromptPay
  createdAt: string;
  updatedAt: string;
  serviceChargePercent: number; // e.g. 10
  vatPercent: number; // e.g. 7 for Thailand
  discountAmount: number; // lump sum discount
  tipAmount: number; // lump sum tip
  people: Person[];
  items: BillItem[];
}

export interface PersonItemDetail {
  itemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  sharedWithCount: number;
  cost: number;
}

export interface PersonBreakdown {
  person: Person;
  subtotal: number;
  discountShare: number;
  serviceChargeShare: number;
  vatShare: number;
  tipShare: number;
  total: number;
  items: PersonItemDetail[];
}

export interface BillSummary {
  subtotal: number;
  totalDiscount: number;
  subtotalAfterDiscount: number;
  totalServiceCharge: number;
  totalVat: number;
  totalTip: number;
  grandTotal: number;
  unassignedItemsCount: number;
  peopleBreakdowns: PersonBreakdown[];
}
