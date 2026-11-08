export interface Person {
  id: string;
  name: string;
  color?: string;
  isReady?: boolean; // Guest pressed "Ready / Checked All"
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
  promptPayNumber?: string;
  targetPeopleCount?: number; // Expected total people (e.g. 5)
  createdAt: string;
  updatedAt: string;
  serviceChargePercent: number;
  vatPercent: number;
  discountAmount: number;
  tipAmount: number;
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
