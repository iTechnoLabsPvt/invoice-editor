import { Invoice } from '@/types/invoice';
import { calculateInvoiceTotals, calculateLineTotal } from './calculations';

export const CHECK_CASE_INVOICE: Invoice = (() => {
  const lineItems = [
    {
      id: 'item-1',
      description: 'Bookkeeping & General Ledger Reconciliation (Standard Block)',
      quantity: 2,
      unitPrice: 50,
      lineTotal: calculateLineTotal(2, 50),
    },
  ];

  const totals = calculateInvoiceTotals(lineItems, 10, 10);

  return {
    id: 'inv-check-case-001',
    metadata: {
      invoiceNumber: 'INV-2026-0099',
      issueDate: '2026-10-20',
      dueDate: '2026-11-04',
      status: 'pending',
      notes: 'Prompt check case: 2 units × $50.00 - $10.00 discount + 10% tax = $99.00.',
      paymentTerms: 'Net 15 Days. Wire transfer preferred.',
      currency: 'USD',
    },
    business: {
      name: 'Beacon Financial Advisory LLC',
      email: 'billing@beaconfinancial.io',
      phone: '+1 (555) 234-8900',
      address: '100 Financial Way, Suite 400',
      city: 'San Francisco',
      state: 'CA',
      zip: '94104',
      country: 'United States',
      taxId: 'EIN: 84-2910384',
      website: 'www.beaconfinancial.io',
    },
    client: {
      name: 'David Mitchell',
      company: 'Pinnacle Analytics Inc',
      email: 'dmitchell@pinnacleanalytics.com',
      phone: '+1 (555) 890-1234',
      address: '742 Evergreen Boulevard',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'United States',
    },
    lineItems,
    customFields: [
      {
        id: 'cf-1',
        label: 'Purchase Order #',
        value: 'PO-2026-9041',
        isVisible: true,
      },
      {
        id: 'cf-2',
        label: 'Project Code',
        value: 'FIN-AUDIT-Q4',
        isVisible: true,
      },
      {
        id: 'cf-3',
        label: 'Payment Method',
        value: 'ACH Direct Transfer',
        isVisible: true,
      },
      {
        id: 'cf-4',
        label: 'Internal Audit Ref',
        value: 'INT-REF-SEC-99',
        isVisible: false, // Demonstrates hidden field requirement
      },
    ],
    totals,
    theme: 'indigo',
    layout: 'modern',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  };
})();

export const DEFAULT_INVOICE: Invoice = (() => {
  const lineItems = [
    {
      id: 'item-101',
      description: 'Monthly Accounting & Financial Reporting (October 2026)',
      quantity: 1,
      unitPrice: 1250,
      lineTotal: calculateLineTotal(1, 1250),
    },
    {
      id: 'item-102',
      description: 'Multi-Entity Bank Reconciliation & Journal Entries',
      quantity: 8,
      unitPrice: 95,
      lineTotal: calculateLineTotal(8, 95),
    },
    {
      id: 'item-103',
      description: 'Tax Preparation & Depreciation Schedule Audit',
      quantity: 4.5,
      unitPrice: 140,
      lineTotal: calculateLineTotal(4.5, 140),
    },
  ];

  const totals = calculateInvoiceTotals(lineItems, 150, 8.25);

  return {
    id: 'inv-sample-apex-101',
    metadata: {
      invoiceNumber: 'INV-2026-0842',
      issueDate: '2026-10-20',
      dueDate: '2026-11-19',
      status: 'pending',
      notes: 'Thank you for partnering with LedgerCraft Advisory. Please transfer payment to our Chase Commercial checking account indicated below within 30 days.',
      paymentTerms: 'Net 30 Days. Late fee of 1.5% applied after 30 days.',
      currency: 'USD',
    },
    business: {
      name: 'LedgerCraft Financial Group',
      email: 'invoicing@ledgercraft.io',
      phone: '+1 (415) 604-3200',
      address: '500 Howard Street, Suite 900',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'United States',
      taxId: 'EIN: 94-8172635',
      website: 'www.ledgercraft.io',
    },
    client: {
      name: 'Elena Rostova',
      company: 'Quantum Dynamics Corp',
      email: 'accounting@quantumdynamics.co',
      phone: '+1 (212) 555-0199',
      address: '350 Fifth Avenue, 42nd Floor',
      city: 'New York',
      state: 'NY',
      zip: '10118',
      country: 'United States',
    },
    lineItems,
    customFields: [
      {
        id: 'cf-10',
        label: 'Client PO Number',
        value: 'QD-2026-OCT-77',
        isVisible: true,
      },
      {
        id: 'cf-11',
        label: 'Engagement Lead',
        value: 'Sarah Jenkins, CPA',
        isVisible: true,
      },
      {
        id: 'cf-12',
        label: 'Wire Routing (ABA)',
        value: '121000358',
        isVisible: true,
      },
      {
        id: 'cf-13',
        label: 'Bank Account Number',
        value: '****-****-9402',
        isVisible: true,
      },
      {
        id: 'cf-14',
        label: 'Confidential Internal Cost Center',
        value: 'CC-990-RESTRICTED',
        isVisible: false, // Hidden field!
      },
    ],
    totals,
    theme: 'indigo',
    layout: 'modern',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  };
})();

export function createEmptyInvoice(): Invoice {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  const initialItems = [
    {
      id: `item-${Date.now()}`,
      description: 'Professional Accounting Services',
      quantity: 1,
      unitPrice: 100,
      lineTotal: 100,
    },
  ];

  const totals = calculateInvoiceTotals(initialItems, 0, 0);

  return {
    id: `inv-${Date.now()}-${randomSuffix}`,
    metadata: {
      invoiceNumber: `INV-2026-${randomSuffix}`,
      issueDate: today,
      dueDate: nextMonth,
      status: 'draft',
      notes: 'Payment is due within 30 days. Thank you for your business!',
      paymentTerms: 'Net 30 Days',
      currency: 'USD',
    },
    business: {
      name: 'Your Business Name',
      email: 'billing@yourbusiness.com',
      phone: '+1 (555) 000-0000',
      address: '123 Business Boulevard',
      city: 'City',
      state: 'State',
      zip: '10001',
      country: 'United States',
      taxId: 'EIN: XX-XXXXXXX',
    },
    client: {
      name: 'Client Contact Name',
      company: 'Client Company Name',
      email: 'client@company.com',
      phone: '+1 (555) 111-2222',
      address: '456 Client Street',
      city: 'City',
      state: 'State',
      zip: '90210',
      country: 'United States',
    },
    lineItems: initialItems,
    customFields: [
      {
        id: `cf-${Date.now()}-1`,
        label: 'Purchase Order #',
        value: 'PO-1001',
        isVisible: true,
      },
    ],
    totals,
    theme: 'indigo',
    layout: 'modern',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
