'use client';

import React from 'react';
import { Invoice, InvoiceTheme, InvoiceLayout } from '@/types/invoice';
import { formatCurrency, formatDate } from '@/lib/calculations';

interface InvoicePreviewProps {
  invoice: Invoice;
}

const themeStyles: Record<
  InvoiceTheme,
  {
    headerBg: string;
    headerText: string;
    accentText: string;
    borderAccent: string;
    tableHeaderBg: string;
    totalBg: string;
    badgeBg: string;
  }
> = {
  indigo: {
    headerBg: 'bg-indigo-600',
    headerText: 'text-white',
    accentText: 'text-indigo-600',
    borderAccent: 'border-indigo-600',
    tableHeaderBg: 'bg-indigo-50/70',
    totalBg: 'bg-indigo-50/50',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  emerald: {
    headerBg: 'bg-emerald-600',
    headerText: 'text-white',
    accentText: 'text-emerald-600',
    borderAccent: 'border-emerald-600',
    tableHeaderBg: 'bg-emerald-50/70',
    totalBg: 'bg-emerald-50/50',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  slate: {
    headerBg: 'bg-slate-900',
    headerText: 'text-white',
    accentText: 'text-slate-900',
    borderAccent: 'border-slate-900',
    tableHeaderBg: 'bg-slate-100',
    totalBg: 'bg-slate-50',
    badgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
  },
  blue: {
    headerBg: 'bg-blue-600',
    headerText: 'text-white',
    accentText: 'text-blue-600',
    borderAccent: 'border-blue-600',
    tableHeaderBg: 'bg-blue-50/70',
    totalBg: 'bg-blue-50/50',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  rose: {
    headerBg: 'bg-rose-600',
    headerText: 'text-white',
    accentText: 'text-rose-600',
    borderAccent: 'border-rose-600',
    tableHeaderBg: 'bg-rose-50/70',
    totalBg: 'bg-rose-50/50',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
  },
};

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const currentTheme = themeStyles[invoice.theme || 'indigo'];
  const layout = invoice.layout || 'modern';

  // Filter to visible custom fields ONLY
  const visibleCustomFields = invoice.customFields.filter((cf) => cf.isVisible);

  return (
    <div className="print-area-wrapper w-full flex justify-center py-2 sm:py-6">
      <div
        id="invoice-document"
        className="w-full max-w-[850px] bg-white min-h-[1050px] shadow-xl rounded-2xl border border-slate-200 flex flex-col justify-between overflow-hidden print:shadow-none print:border-none print:rounded-none transition-all duration-200"
      >
        <div>
          {/* Layout-specific Header */}
          {layout === 'modern' && (
            <div className={`${currentTheme.headerBg} ${currentTheme.headerText} p-8 sm:p-10 transition-colors`}>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {invoice.business.name || 'Your Business Name'}
                  </h1>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">
                    {invoice.business.email}
                  </p>
                  {invoice.business.phone && (
                    <p className="text-xs opacity-80 mt-0.5">{invoice.business.phone}</p>
                  )}
                  {invoice.business.taxId && (
                    <p className="text-xs opacity-80 mt-0.5 font-mono">{invoice.business.taxId}</p>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs mb-2">
                    INVOICE
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight">
                    {invoice.metadata.invoiceNumber}
                  </div>
                  <div className="text-xs opacity-90 mt-1 capitalize font-medium">
                    Status: <span className="font-bold underline">{invoice.metadata.status}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {layout === 'classic' && (
            <div className="p-8 sm:p-10 border-b-4 border-slate-900 bg-white">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Official Invoice</span>
                  <h1 className="text-3xl font-serif font-bold text-slate-900 mt-1">
                    {invoice.business.name || 'Your Business Name'}
                  </h1>
                  <p className="text-xs text-slate-600 mt-1">{invoice.business.email} &middot; {invoice.business.phone}</p>
                  {invoice.business.taxId && (
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{invoice.business.taxId}</p>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-3xl font-serif font-bold text-slate-900">
                    {invoice.metadata.invoiceNumber}
                  </div>
                  <div className="mt-2 inline-block px-2.5 py-0.5 rounded text-xs font-semibold uppercase border border-slate-300 text-slate-700">
                    {invoice.metadata.status}
                  </div>
                </div>
              </div>
            </div>
          )}

          {layout === 'minimal' && (
            <div className="p-8 sm:p-10 border-b border-slate-200">
              <div className="flex justify-between items-baseline">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    {invoice.business.name || 'Your Business Name'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">{invoice.business.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono uppercase text-slate-400">INVOICE</span>
                  <p className="text-base font-bold font-mono text-slate-900">{invoice.metadata.invoiceNumber}</p>
                </div>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="p-8 sm:p-10 space-y-8">
            
            {/* Parties & Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
              
              {/* Billed To */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Billed To
                </span>
                <div className="text-base font-bold text-slate-900">
                  {invoice.client.company || invoice.client.name || 'Client Name'}
                </div>
                {invoice.client.name && invoice.client.company && (
                  <div className="text-xs text-slate-600 mt-0.5">
                    Attn: {invoice.client.name}
                  </div>
                )}
                {invoice.client.address && (
                  <div className="text-slate-600 mt-1 leading-relaxed">
                    {invoice.client.address}
                    {(invoice.client.city || invoice.client.state || invoice.client.zip) && (
                      <div>
                        {invoice.client.city}
                        {invoice.client.city && invoice.client.state ? ', ' : ''}
                        {invoice.client.state} {invoice.client.zip}
                      </div>
                    )}
                  </div>
                )}
                {invoice.client.email && (
                  <div className="text-slate-600 mt-1">{invoice.client.email}</div>
                )}
                {invoice.client.phone && (
                  <div className="text-slate-600 mt-0.5">{invoice.client.phone}</div>
                )}
              </div>

              {/* Invoice Dates & Terms */}
              <div className="space-y-2 sm:text-right">
                <div className="flex sm:justify-end gap-3 text-slate-600">
                  <span className="font-semibold text-slate-400 uppercase text-[11px] tracking-wider">
                    Issue Date:
                  </span>
                  <span className="font-medium text-slate-800">
                    {formatDate(invoice.metadata.issueDate)}
                  </span>
                </div>
                <div className="flex sm:justify-end gap-3 text-slate-600">
                  <span className="font-semibold text-slate-400 uppercase text-[11px] tracking-wider">
                    Due Date:
                  </span>
                  <span className="font-medium text-slate-900 font-bold">
                    {formatDate(invoice.metadata.dueDate)}
                  </span>
                </div>
                {invoice.metadata.paymentTerms && (
                  <div className="flex sm:justify-end gap-3 text-slate-600">
                    <span className="font-semibold text-slate-400 uppercase text-[11px] tracking-wider">
                      Terms:
                    </span>
                    <span className="text-slate-800">
                      {invoice.metadata.paymentTerms}
                    </span>
                  </div>
                )}
                {invoice.business.address && (
                  <div className="pt-2 text-[11px] text-slate-500 sm:text-right leading-relaxed">
                    <span className="text-slate-400 uppercase text-[10px] block font-bold">From:</span>
                    {invoice.business.address}, {invoice.business.city} {invoice.business.state} {invoice.business.zip}
                  </div>
                )}
              </div>

            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b-2 border-slate-200 ${currentTheme.tableHeaderBg}`}>
                    <th className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Description
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 text-center w-20">
                      Qty
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 text-right w-28">
                      Unit Price
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 text-right w-28">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {invoice.lineItems.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-3 text-slate-900 font-medium leading-relaxed">
                        {item.description || <span className="text-slate-300 italic">No description</span>}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 text-center font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 text-right font-mono">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-900 text-right font-bold font-mono">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
              
              {/* Visible Custom Fields (Hidden fields strictly omitted per requirements) */}
              <div className="w-full sm:w-1/2">
                {visibleCustomFields.length > 0 && (
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                      Additional Information
                    </span>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      {visibleCustomFields.map((field) => (
                        <div key={field.id} className="border-b border-slate-200/50 pb-1">
                          <dt className="text-slate-500 text-[11px] font-medium">
                            {field.label}
                          </dt>
                          <dd className="text-slate-900 font-semibold font-mono text-xs mt-0.5">
                            {field.value || '—'}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>

              {/* Totals Breakdown */}
              <div className="w-full sm:w-72 space-y-2 text-xs">
                
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatCurrency(invoice.totals.subtotal)}
                  </span>
                </div>

                {invoice.totals.discount > 0 && (
                  <div className="flex justify-between py-1 text-emerald-700 font-medium">
                    <span>Discount:</span>
                    <span className="font-mono">
                      -{formatCurrency(invoice.totals.discount)}
                    </span>
                  </div>
                )}

                {invoice.totals.discount > 0 && (
                  <div className="flex justify-between py-0.5 text-slate-400 text-[11px]">
                    <span>Discounted Base:</span>
                    <span className="font-mono">
                      {formatCurrency(invoice.totals.discountedSubtotal)}
                    </span>
                  </div>
                )}

                {invoice.totals.taxRate > 0 && (
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Tax ({invoice.totals.taxRate}%):</span>
                    <span className="font-mono font-medium text-slate-900">
                      {formatCurrency(invoice.totals.taxAmount)}
                    </span>
                  </div>
                )}

                {/* Grand Total */}
                <div className={`mt-2 pt-3 border-t-2 border-slate-900 flex justify-between items-baseline ${currentTheme.totalBg} p-3 rounded-lg`}>
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                    Grand Total:
                  </span>
                  <span className={`text-xl font-bold font-mono ${currentTheme.accentText}`}>
                    {formatCurrency(invoice.totals.grandTotal)}
                  </span>
                </div>

              </div>

            </div>

            {/* Notes & Terms Section */}
            {(invoice.metadata.notes || invoice.metadata.paymentTerms) && (
              <div className="pt-6 border-t border-slate-100 space-y-3">
                {invoice.metadata.paymentTerms && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Payment Terms &amp; Instructions
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-mono">
                      {invoice.metadata.paymentTerms}
                    </p>
                  </div>
                )}

                {invoice.metadata.notes && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Notes
                    </span>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                      {invoice.metadata.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/60 border-t border-slate-100 text-center text-[11px] text-slate-400">
          <p>
            Thank you for your business. For billing inquiries, contact{' '}
            <span className="font-medium text-slate-600">{invoice.business.email || 'support'}</span>.
          </p>
        </div>

      </div>
    </div>
  );
};
