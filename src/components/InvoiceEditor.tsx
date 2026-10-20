'use client';

import React from 'react';
import {
  Invoice,
  LineItem,
  CustomField,
  InvoiceTheme,
  InvoiceLayout,
  InvoiceStatus,
} from '@/types/invoice';
import { formatCurrency } from '@/lib/calculations';
import {
  Building2,
  User,
  Calendar,
  FileSpreadsheet,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Percent,
  DollarSign,
  AlertCircle,
  Palette,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface InvoiceEditorProps {
  invoice: Invoice;
  onChange: (updatedInvoice: Invoice) => void;
  onReset: () => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice,
  onChange,
  onReset,
}) => {
  // Helpers to update nested sections
  const updateBusiness = (field: string, value: string) => {
    onChange({
      ...invoice,
      business: { ...invoice.business, [field]: value },
    });
  };

  const updateClient = (field: string, value: string) => {
    onChange({
      ...invoice,
      client: { ...invoice.client, [field]: value },
    });
  };

  const updateMetadata = (field: string, value: any) => {
    onChange({
      ...invoice,
      metadata: { ...invoice.metadata, [field]: value },
    });
  };

  // Line Item Handlers
  const handleItemChange = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const updated = [...invoice.lineItems];
    const current = { ...updated[index] };

    if (field === 'quantity') {
      const parsed = parseFloat(value as string);
      current.quantity = isNaN(parsed) ? 0 : Math.max(0, parsed);
    } else if (field === 'unitPrice') {
      const parsed = parseFloat(value as string);
      current.unitPrice = isNaN(parsed) ? 0 : Math.max(0, parsed);
    } else if (field === 'description') {
      current.description = value as string;
    }

    current.lineTotal = Math.round((current.quantity * current.unitPrice + Number.EPSILON) * 100) / 100;
    updated[index] = current;

    onChange({
      ...invoice,
      lineItems: updated,
    });
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0,
    };
    onChange({
      ...invoice,
      lineItems: [...invoice.lineItems, newItem],
    });
  };

  const removeLineItem = (index: number) => {
    if (invoice.lineItems.length <= 1) {
      // Keep at least one empty item
      onChange({
        ...invoice,
        lineItems: [
          {
            id: `item-${Date.now()}`,
            description: '',
            quantity: 1,
            unitPrice: 0,
            lineTotal: 0,
          },
        ],
      });
      return;
    }
    const updated = invoice.lineItems.filter((_, i) => i !== index);
    onChange({
      ...invoice,
      lineItems: updated,
    });
  };

  // Custom Fields Handlers
  const addCustomField = () => {
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      label: 'New Field',
      value: '',
      isVisible: true,
    };
    onChange({
      ...invoice,
      customFields: [...invoice.customFields, newField],
    });
  };

  const updateCustomField = (
    index: number,
    field: keyof CustomField,
    value: any
  ) => {
    const updated = [...invoice.customFields];
    updated[index] = { ...updated[index], [field]: value };
    onChange({
      ...invoice,
      customFields: updated,
    });
  };

  const removeCustomField = (index: number) => {
    onChange({
      ...invoice,
      customFields: invoice.customFields.filter((_, i) => i !== index),
    });
  };

  // Quick Due Date setter
  const setDueDateOffset = (days: number) => {
    const baseDate = invoice.metadata.issueDate
      ? new Date(invoice.metadata.issueDate)
      : new Date();
    const newDate = new Date(baseDate.getTime() + days * 86400000);
    const dateStr = newDate.toISOString().split('T')[0];
    updateMetadata('dueDate', dateStr);
    if (days === 0) updateMetadata('paymentTerms', 'Due on Receipt');
    else if (days === 15) updateMetadata('paymentTerms', 'Net 15 Days');
    else if (days === 30) updateMetadata('paymentTerms', 'Net 30 Days');
    else if (days === 60) updateMetadata('paymentTerms', 'Net 60 Days');
  };

  // Discount & Tax rate changes
  const handleDiscountChange = (val: string) => {
    const parsed = parseFloat(val);
    const discount = isNaN(parsed) ? 0 : Math.max(0, parsed);
    onChange({
      ...invoice,
      totals: {
        ...invoice.totals,
        discount,
      },
    });
  };

  const handleTaxRateChange = (val: string) => {
    const parsed = parseFloat(val);
    const taxRate = isNaN(parsed) ? 0 : Math.max(0, parsed);
    onChange({
      ...invoice,
      totals: {
        ...invoice.totals,
        taxRate,
      },
    });
  };

  const isDiscountOverSubtotal =
    invoice.totals.discount > invoice.totals.subtotal &&
    invoice.totals.subtotal > 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header & Quick Reset */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Invoice Editor
          </h2>
          <p className="text-xs text-slate-500">
            Configure line items, business details, custom fields & styling
          </p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          title="Reset to blank invoice"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Form</span>
        </button>
      </div>

      {/* 2. Invoice Meta & Status */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-900">
              Invoice Details
            </span>
          </div>
          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={invoice.metadata.status}
              onChange={(e) => updateMetadata('status', e.target.value as InvoiceStatus)}
              className="text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoice.metadata.invoiceNumber}
              onChange={(e) => updateMetadata('invoiceNumber', e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all font-mono"
              placeholder="INV-2026-0001"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={invoice.metadata.issueDate}
              onChange={(e) => updateMetadata('issueDate', e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Due Date
              </label>
              {/* Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDueDateOffset(15)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium px-1 rounded hover:bg-indigo-50"
                >
                  +15d
                </button>
                <button
                  type="button"
                  onClick={() => setDueDateOffset(30)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium px-1 rounded hover:bg-indigo-50"
                >
                  +30d
                </button>
              </div>
            </div>
            <input
              type="date"
              value={invoice.metadata.dueDate}
              onChange={(e) => updateMetadata('dueDate', e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. Business & Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Business Details (From) */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-900">
              Your Business (Sender)
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Business / Trading Name
            </label>
            <input
              type="text"
              value={invoice.business.name}
              onChange={(e) => updateBusiness('name', e.target.value)}
              placeholder="e.g. Beacon Financial Advisory LLC"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={invoice.business.email}
                onChange={(e) => updateBusiness('email', e.target.value)}
                placeholder="billing@company.com"
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={invoice.business.phone}
                onChange={(e) => updateBusiness('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Address
            </label>
            <input
              type="text"
              value={invoice.business.address}
              onChange={(e) => updateBusiness('address', e.target.value)}
              placeholder="Street address, Suite"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <input
                type="text"
                value={invoice.business.city}
                onChange={(e) => updateBusiness('city', e.target.value)}
                placeholder="City"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <input
                type="text"
                value={invoice.business.state}
                onChange={(e) => updateBusiness('state', e.target.value)}
                placeholder="State"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <input
                type="text"
                value={invoice.business.zip}
                onChange={(e) => updateBusiness('zip', e.target.value)}
                placeholder="Zip"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Tax ID / EIN / VAT
            </label>
            <input
              type="text"
              value={invoice.business.taxId}
              onChange={(e) => updateBusiness('taxId', e.target.value)}
              placeholder="e.g. EIN: 84-2910384"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Customer Details (To) */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-900">
              Billed To (Customer)
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Customer / Company Name
            </label>
            <input
              type="text"
              value={invoice.client.company}
              onChange={(e) => updateClient('company', e.target.value)}
              placeholder="e.g. Pinnacle Analytics Inc"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={invoice.client.name}
                onChange={(e) => updateClient('name', e.target.value)}
                placeholder="David Mitchell"
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Client Email
              </label>
              <input
                type="email"
                value={invoice.client.email}
                onChange={(e) => updateClient('email', e.target.value)}
                placeholder="ap@company.com"
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Billing Address
            </label>
            <input
              type="text"
              value={invoice.client.address}
              onChange={(e) => updateClient('address', e.target.value)}
              placeholder="Billing street address"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <input
                type="text"
                value={invoice.client.city}
                onChange={(e) => updateClient('city', e.target.value)}
                placeholder="City"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <input
                type="text"
                value={invoice.client.state}
                onChange={(e) => updateClient('state', e.target.value)}
                placeholder="State"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <input
                type="text"
                value={invoice.client.zip}
                onChange={(e) => updateClient('zip', e.target.value)}
                placeholder="Zip"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Client Phone
            </label>
            <input
              type="text"
              value={invoice.client.phone}
              onChange={(e) => updateClient('phone', e.target.value)}
              placeholder="+1 (555) 890-1234"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* 4. Line Items Table */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-900">
              Line Items
            </span>
            <span className="text-xs text-slate-500">
              ({invoice.lineItems.length} {invoice.lineItems.length === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button
            type="button"
            onClick={addLineItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {invoice.lineItems.map((item, index) => (
            <div
              key={item.id || index}
              className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors space-y-3"
            >
              <div className="grid grid-cols-12 gap-3 items-center">
                {/* Description */}
                <div className="col-span-12 sm:col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Services, work item, or product description..."
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={item.quantity === 0 ? '' : item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    placeholder="1"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none font-mono text-center"
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Price ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice === 0 ? '' : item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full text-sm pl-6 pr-2.5 py-2 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none font-mono text-right"
                    />
                  </div>
                </div>

                {/* Line Total & Remove */}
                <div className="col-span-4 sm:col-span-2 flex items-center justify-between gap-2 pt-4 sm:pt-0">
                  <div className="text-right flex-1">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    title="Remove item"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Totals, Discount & Tax Calculation */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-900">
              Totals & Tax Adjustments
            </span>
          </div>
          <span className="text-xs text-slate-500">
            USD currency &middot; Rounded to cents
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Fixed Discount Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Fixed Discount ($)
              </label>
              <span className="text-[10px] text-slate-400">
                Cannot exceed subtotal
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={invoice.totals.discount === 0 ? '' : invoice.totals.discount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                placeholder="0.00"
                className={`w-full text-sm pl-7 pr-3 py-2 rounded-lg border bg-white focus:ring-2 focus:outline-none font-mono ${
                  isDiscountOverSubtotal
                    ? 'border-amber-400 focus:ring-amber-500/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
            </div>
            {isDiscountOverSubtotal && (
              <p className="mt-1 text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Discount capped at subtotal ({formatCurrency(invoice.totals.subtotal)})
              </p>
            )}
          </div>

          {/* Tax Rate Percentage Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Tax Rate (%)
              </label>
              <span className="text-[10px] text-slate-400">
                Applied after discount
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={invoice.totals.taxRate === 0 ? '' : invoice.totals.taxRate}
                onChange={(e) => handleTaxRateChange(e.target.value)}
                placeholder="0.00"
                className="w-full text-sm pr-7 pl-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none font-mono text-left"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                %
              </span>
            </div>
          </div>

        </div>

        {/* Live Calculation Proof Card */}
        <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal (sum of line totals):</span>
            <span className="font-mono font-medium">{formatCurrency(invoice.totals.subtotal)}</span>
          </div>

          {invoice.totals.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Fixed Discount:</span>
              <span className="font-mono">-{formatCurrency(invoice.totals.discount)}</span>
            </div>
          )}

          {invoice.totals.discount > 0 && (
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Taxable Base (Subtotal - Discount):</span>
              <span className="font-mono">{formatCurrency(invoice.totals.discountedSubtotal)}</span>
            </div>
          )}

          {invoice.totals.taxRate > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Tax ({invoice.totals.taxRate}% of taxable base):</span>
              <span className="font-mono font-medium">{formatCurrency(invoice.totals.taxAmount)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 text-sm font-bold">
            <span>Grand Total:</span>
            <span className="font-mono text-indigo-700 text-base">
              {formatCurrency(invoice.totals.grandTotal)}
            </span>
          </div>

          {/* Explicit prompt check verification banner */}
          <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Verification Rule:</span> Round each line to cents &rarr; sum &rarr; apply discount &rarr; calculate &amp; round tax.
          </div>
        </div>

      </div>

      {/* 6. Custom Fields Section */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-900">
                Custom Fields
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visible fields appear on invoice &middot; Do not affect financial totals
            </p>
          </div>
          <button
            type="button"
            onClick={addCustomField}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Field</span>
          </button>
        </div>

        {invoice.customFields.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No custom fields added yet. Click &quot;Add Field&quot; to include PO numbers, Project codes, or bank details.
          </div>
        ) : (
          <div className="space-y-2.5">
            {invoice.customFields.map((field, idx) => (
              <div
                key={field.id || idx}
                className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${
                  field.isVisible
                    ? 'bg-slate-50/80 border-slate-200'
                    : 'bg-slate-100/60 border-slate-200/60 opacity-60'
                }`}
              >
                {/* Field Label */}
                <div className="w-full sm:w-1/3">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateCustomField(idx, 'label', e.target.value)}
                    placeholder="Field Label (e.g. PO Number)"
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Field Value */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateCustomField(idx, 'value', e.target.value)}
                    placeholder="Value (e.g. PO-2026-9041)"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Controls: Visibility Toggle & Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <button
                    type="button"
                    onClick={() => updateCustomField(idx, 'isVisible', !field.isVisible)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      field.isVisible
                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                    title={field.isVisible ? 'Visible on printed invoice' : 'Hidden from printed invoice'}
                  >
                    {field.isVisible ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeCustomField(idx)}
                    title="Delete field"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Notes & Payment Terms */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Terms & Bank Instructions
          </label>
          <input
            type="text"
            value={invoice.metadata.paymentTerms}
            onChange={(e) => updateMetadata('paymentTerms', e.target.value)}
            placeholder="e.g. Net 30 Days. Wire transfer preferred."
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Thank You Message
          </label>
          <textarea
            rows={3}
            value={invoice.metadata.notes}
            onChange={(e) => updateMetadata('notes', e.target.value)}
            placeholder="Thank you for your business..."
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-y"
          />
        </div>
      </div>

      {/* 8. Styling & Theme Palette */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Palette className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-900">
            Invoice Styling &amp; Accent
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2.5">
              {(
                [
                  { id: 'indigo', color: 'bg-indigo-600' },
                  { id: 'emerald', color: 'bg-emerald-600' },
                  { id: 'slate', color: 'bg-slate-800' },
                  { id: 'blue', color: 'bg-blue-600' },
                  { id: 'rose', color: 'bg-rose-600' },
                ] as const
              ).map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => onChange({ ...invoice, theme: th.id })}
                  className={`w-7 h-7 rounded-full ${th.color} transition-all ${
                    invoice.theme === th.id
                      ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Select ${th.id} theme`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Template Layout
            </label>
            <div className="flex items-center gap-2">
              {(['modern', 'classic', 'minimal'] as InvoiceLayout[]).map((layout) => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => onChange({ ...invoice, layout })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize border transition-all ${
                    invoice.layout === layout
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {layout}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
