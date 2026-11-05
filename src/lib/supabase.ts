import { createClient } from "@supabase/supabase-js";
import { Bill } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseAnonKey !== "your_supabase_anon_key_here";

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database row format
export interface BillRow {
  id: string;
  title: string;
  currency: string;
  promptpay_number?: string;
  service_charge_percent: number;
  vat_percent: number;
  discount_amount: number;
  tip_amount: number;
  people: Bill["people"];
  items: Bill["items"];
  created_at: string;
  updated_at: string;
}

export function billToRow(bill: Bill): BillRow {
  return {
    id: bill.id,
    title: bill.title,
    currency: bill.currency,
    promptpay_number: bill.promptPayNumber || "",
    service_charge_percent: bill.serviceChargePercent,
    vat_percent: bill.vatPercent,
    discount_amount: bill.discountAmount,
    tip_amount: bill.tipAmount,
    people: bill.people,
    items: bill.items,
    created_at: bill.createdAt,
    updated_at: new Date().toISOString(),
  };
}

export function rowToBill(row: BillRow): Bill {
  return {
    id: row.id,
    title: row.title,
    currency: row.currency || "฿",
    promptPayNumber: row.promptpay_number || "",
    serviceChargePercent: Number(row.service_charge_percent) || 0,
    vatPercent: Number(row.vat_percent) || 0,
    discountAmount: Number(row.discount_amount) || 0,
    tipAmount: Number(row.tip_amount) || 0,
    people: row.people || [],
    items: row.items || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Supabase cloud actions
export async function syncBillToSupabase(bill: Bill): Promise<boolean> {
  if (!supabase) return false;

  const row = billToRow(bill);
  const { error } = await supabase
    .from("bills")
    .upsert(row, { onConflict: "id" });

  if (error) {
    console.error("Error syncing bill to Supabase:", error);
    return false;
  }
  return true;
}

export async function fetchBillFromSupabase(id: string): Promise<Bill | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return rowToBill(data as BillRow);
}
