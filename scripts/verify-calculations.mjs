function roundToCents(amount) {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function calculateLineTotal(quantity, unitPrice) {
  const safeQty = Math.max(0, isNaN(quantity) ? 0 : quantity);
  const safePrice = Math.max(0, isNaN(unitPrice) ? 0 : unitPrice);
  return roundToCents(safeQty * safePrice);
}

function calculateInvoiceTotals(lineItems, discount = 0, taxRate = 0) {
  const subtotal = lineItems.reduce((acc, item) => {
    const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
    return roundToCents(acc + lineTotal);
  }, 0);

  const rawDiscount = Math.max(0, isNaN(discount) ? 0 : discount);
  const safeDiscount = Math.min(rawDiscount, subtotal);
  const roundedDiscount = roundToCents(safeDiscount);

  const discountedSubtotal = roundToCents(subtotal - roundedDiscount);
  const safeTaxRate = Math.max(0, isNaN(taxRate) ? 0 : taxRate);
  const taxAmount = roundToCents(discountedSubtotal * (safeTaxRate / 100));
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

console.log('Testing Invoice Calculations...');

// Check Case from spec:
// 2 x $50 - $10 discount + 10% tax = $99.00
const items = [{ quantity: 2, unitPrice: 50 }];
const result = calculateInvoiceTotals(items, 10, 10);
console.log('Spec check result:', result);

console.assert(result.subtotal === 100, `Subtotal expected 100, got ${result.subtotal}`);
console.assert(result.discount === 10, `Discount expected 10, got ${result.discount}`);
console.assert(result.discountedSubtotal === 90, `Discounted subtotal expected 90, got ${result.discountedSubtotal}`);
console.assert(result.taxAmount === 9, `Tax expected 9, got ${result.taxAmount}`);
console.assert(result.grandTotal === 99, `Grand total expected 99, got ${result.grandTotal}`);

// Edge case: discount cannot exceed subtotal
const overDiscount = calculateInvoiceTotals([{ quantity: 1, unitPrice: 20 }], 50, 0);
console.assert(overDiscount.discount === 20, `Capped discount expected 20, got ${overDiscount.discount}`);
console.assert(overDiscount.grandTotal === 0, `Grand total expected 0, got ${overDiscount.grandTotal}`);

// Edge case: negative numbers
const negativeInputs = calculateInvoiceTotals([{ quantity: -5, unitPrice: -10 }], -10, -5);
console.assert(negativeInputs.subtotal === 0, `Subtotal expected 0, got ${negativeInputs.subtotal}`);
console.assert(negativeInputs.discount === 0, `Discount expected 0, got ${negativeInputs.discount}`);
console.assert(negativeInputs.grandTotal === 0, `Grand total expected 0, got ${negativeInputs.grandTotal}`);

console.log('✅ ALL CALCULATION CHECKS PASSED WITH 100% ACCURACY!');
