import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { Invoice } from '@/types/invoice';
import { calculateInvoiceTotals, calculateLineTotal } from '@/lib/calculations';

export async function GET() {
  try {
    const db = getDatabase();
    const invoices = db.list();
    return NextResponse.json({ success: true, invoices });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Invoice;

    if (!body || !body.id || !body.metadata?.invoiceNumber) {
      return NextResponse.json(
        { success: false, error: 'Invoice must include an id and invoiceNumber' },
        { status: 400 }
      );
    }

    // Ensure line items are sanitized and recalculated for data integrity
    const sanitizedLineItems = (body.lineItems || []).map((item, idx) => {
      const quantity = Math.max(0, Number(item.quantity) || 0);
      const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
      return {
        id: item.id || `item-${idx + 1}`,
        description: item.description || '',
        quantity,
        unitPrice,
        lineTotal: calculateLineTotal(quantity, unitPrice),
      };
    });

    const discount = Math.max(0, Number(body.totals?.discount) || 0);
    const taxRate = Math.max(0, Number(body.totals?.taxRate) || 0);
    const calculatedTotals = calculateInvoiceTotals(sanitizedLineItems, discount, taxRate);

    const invoiceToSave: Invoice = {
      ...body,
      lineItems: sanitizedLineItems,
      totals: calculatedTotals,
    };

    const db = getDatabase();
    const saved = db.save(invoiceToSave);

    return NextResponse.json({ success: true, invoice: saved });
  } catch (error: any) {
    console.error('Error saving invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save invoice' },
      { status: 500 }
    );
  }
}
