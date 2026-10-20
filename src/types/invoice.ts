export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
  isVisible: boolean;
}

export interface BusinessDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxId: string;
  website?: string;
  logoUrl?: string;
}

export interface ClientDetails {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'paid' | 'overdue';
export type InvoiceTheme = 'indigo' | 'emerald' | 'slate' | 'blue' | 'rose';
export type InvoiceLayout = 'modern' | 'classic' | 'minimal';

export interface InvoiceMetadata {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  notes: string;
  paymentTerms: string;
  currency: string;
}

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
}

export interface Invoice {
  id: string;
  metadata: InvoiceMetadata;
  business: BusinessDetails;
  client: ClientDetails;
  lineItems: LineItem[];
  customFields: CustomField[];
  totals: InvoiceTotals;
  theme: InvoiceTheme;
  layout: InvoiceLayout;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  grandTotal: number;
  status: InvoiceStatus;
  updatedAt: string;
}

export interface SendEmailPayload {
  invoiceId?: string;
  recipientEmail: string;
  subject?: string;
  message?: string;
  invoice: Invoice;
}
