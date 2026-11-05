import { Bill, BillSummary, PersonBreakdown, PersonItemDetail } from "./types";

/**
 * Standard Restaurant Calculation Flow in Thailand / Southeast Asia:
 * 1. Subtotal = sum of all items (price * quantity)
 * 2. Discount = lump sum discount applied proportionally to subtotal
 * 3. Service Charge = % applied to (Subtotal - Discount)
 * 4. VAT (e.g. 7%) = % applied to (Subtotal - Discount + Service Charge)
 * 5. Tip = flat tip added afterwards
 * 6. Grand Total = Subtotal - Discount + Service Charge + VAT + Tip
 */
export function calculateBill(bill: Bill): BillSummary {
  const people = bill.people || [];
  const items = bill.items || [];

  // Compute total item subtotal
  let rawSubtotal = 0;
  let unassignedCount = 0;

  // Track each person's item costs
  const personItemMap = new Map<string, PersonItemDetail[]>();
  people.forEach((p) => personItemMap.set(p.id, []));

  for (const item of items) {
    const totalItemPrice = (item.price || 0) * (item.quantity || 1);
    rawSubtotal += totalItemPrice;

    const assigned = (item.assignedPersonIds || []).filter((id) =>
      people.some((p) => p.id === id)
    );

    if (assigned.length === 0) {
      unassignedCount++;
      continue;
    }

    const sharePerPerson = totalItemPrice / assigned.length;

    for (const personId of assigned) {
      const details = personItemMap.get(personId);
      if (details) {
        details.push({
          itemId: item.id,
          itemName: item.name || "Untitled item",
          itemPrice: item.price,
          quantity: item.quantity,
          sharedWithCount: assigned.length,
          cost: sharePerPerson,
        });
      }
    }
  }

  // Calculate each person's item subtotal
  const personSubtotals = new Map<string, number>();
  let totalAssignedSubtotal = 0;

  people.forEach((p) => {
    const details = personItemMap.get(p.id) || [];
    const sum = details.reduce((acc, d) => acc + d.cost, 0);
    personSubtotals.set(p.id, sum);
    totalAssignedSubtotal += sum;
  });

  const baseForDistribution = totalAssignedSubtotal > 0 ? totalAssignedSubtotal : 1;

  // Overall bill totals
  const totalDiscount = Math.min(bill.discountAmount || 0, rawSubtotal);
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - totalDiscount);

  const scPercent = (bill.serviceChargePercent || 0) / 100;
  const totalServiceCharge = subtotalAfterDiscount * scPercent;

  const vatPercent = (bill.vatPercent || 0) / 100;
  const totalVat = (subtotalAfterDiscount + totalServiceCharge) * vatPercent;

  const totalTip = bill.tipAmount || 0;
  const grandTotal = subtotalAfterDiscount + totalServiceCharge + totalVat + totalTip;

  // Build individual breakdowns with proportional extra fee distribution
  const breakdowns: PersonBreakdown[] = people.map((person) => {
    const pSubtotal = personSubtotals.get(person.id) || 0;
    const ratio = totalAssignedSubtotal > 0 ? pSubtotal / baseForDistribution : 0;

    const discountShare = totalDiscount * ratio;
    const pAfterDiscount = Math.max(0, pSubtotal - discountShare);
    const serviceChargeShare = pAfterDiscount * scPercent;
    const vatShare = (pAfterDiscount + serviceChargeShare) * vatPercent;
    const tipShare = totalTip * ratio;
    const total = pAfterDiscount + serviceChargeShare + vatShare + tipShare;

    return {
      person,
      subtotal: round2(pSubtotal),
      discountShare: round2(discountShare),
      serviceChargeShare: round2(serviceChargeShare),
      vatShare: round2(vatShare),
      tipShare: round2(tipShare),
      total: round2(total),
      items: personItemMap.get(person.id) || [],
    };
  });

  return {
    subtotal: round2(rawSubtotal),
    totalDiscount: round2(totalDiscount),
    subtotalAfterDiscount: round2(subtotalAfterDiscount),
    totalServiceCharge: round2(totalServiceCharge),
    totalVat: round2(totalVat),
    totalTip: round2(totalTip),
    grandTotal: round2(grandTotal),
    unassignedItemsCount: unassignedCount,
    peopleBreakdowns: breakdowns,
  };
}

function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}
