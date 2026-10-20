import { LineItem, InvoiceTotals } from '@/types/invoice';

/**
 * Rounds a number to exactly two decimal places (cents) with high floating-point precision safety.
 */
export function roundToCents(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates a single line item total:
 * Line Total = round(quantity * unitPrice) to cents.
 * Non-negative constraints applied.
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  const safeQty = Math.max(0, isNaN(quantity) ? 0 : quantity);
  const safePrice = Math.max(0, isNaN(unitPrice) ? 0 : unitPrice);
  return roundToCents(safeQty * safePrice);
}

/**
 * Calculates all invoice totals following the specification:
 * 1. Round each line to cents.
 * 2. Sum line totals to calculate Subtotal.
 * 3. Enforce discount: non-negative and cannot exceed subtotal.
 * 4. Apply discount to get Discounted Subtotal (taxable base).
 * 5. Calculate and round tax: round(Discounted Subtotal * (taxRate / 100)) to cents.
 * 6. Calculate Grand Total: Discounted Subtotal + Tax Amount.
 *
 * Check Case Verification:
 * 2 x $50 - $10 discount + 10% tax = $99.00
 */
export function calculateInvoiceTotals(
  lineItems: Array<Pick<LineItem, 'quantity' | 'unitPrice'>>,
  discount: number = 0,
  taxRate: number = 0
): InvoiceTotals {
  // Step 1 & 2: Line totals rounded to cents, then summed to subtotal
  const subtotal = lineItems.reduce((acc, item) => {
    const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
    return roundToCents(acc + lineTotal);
  }, 0);

  // Step 3: Prevent negative discount and ensure discount cannot exceed subtotal
  const rawDiscount = Math.max(0, isNaN(discount) ? 0 : discount);
  const safeDiscount = Math.min(rawDiscount, subtotal);
  const roundedDiscount = roundToCents(safeDiscount);

  // Step 4: Apply discount
  const discountedSubtotal = roundToCents(subtotal - roundedDiscount);

  // Step 5: Prevent negative tax rate, calculate and round tax
  const safeTaxRate = Math.max(0, isNaN(taxRate) ? 0 : taxRate);
  const taxAmount = roundToCents(discountedSubtotal * (safeTaxRate / 100));

  // Step 6: Grand Total
  const grandTotal = roundToCents(discountedSubtotal + taxAmount);

  return {
    subtotal,
    discount: roundedDiscount,
    discountedSubtotal,
    taxRate: safeTaxRate,
    taxAmount,
    grandTotal,
  };
}

/**
 * Currency formatter for display (e.g. $99.00)
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Formats date to a human readable format (e.g. "Oct 24, 2026")
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}
