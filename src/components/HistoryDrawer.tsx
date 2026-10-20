'use client';

import React, { useEffect, useState } from 'react';
import { InvoiceSummary } from '@/types/invoice';
import { formatCurrency, formatDate } from '@/lib/calculations';
import { X, FolderOpen, RefreshCw, Trash2, ArrowRight, Plus, Loader2 } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentInvoiceId: string;
  onSelectInvoice: (id: string) => void;
  onNewInvoice: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  currentInvoiceId,
  onSelectInvoice,
  onNewInvoice,
}) => {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.success && data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInvoices();
    }
  }, [isOpen]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden no-print">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          
          {/* Header */}
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Saved Invoices</h3>
                <p className="text-xs text-slate-500">
                  SQLite Database records &middot; {invoices.length} total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={fetchInvoices}
                title="Refresh list"
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 border-b border-slate-100 bg-white">
            <button
              onClick={() => {
                onNewInvoice();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Invoice</span>
            </button>
          </div>

          {/* Invoice List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <span className="text-xs">Loading database records...</span>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No invoices found in database. Click &quot;Save&quot; on any invoice to store it!
              </div>
            ) : (
              invoices.map((inv) => {
                const isSelected = inv.id === currentInvoiceId;
                return (
                  <div
                    key={inv.id}
                    onClick={() => {
                      onSelectInvoice(inv.id);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 truncate mb-1">
                      {inv.clientName}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatDate(inv.issueDate)}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(inv.grandTotal)}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-indigo-600 font-medium inline-flex items-center gap-1">
                        Load Invoice <ArrowRight className="w-3 h-3" />
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, inv.id)}
                        disabled={deletingId === inv.id}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Delete invoice"
                      >
                        {deletingId === inv.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Persistence powered by Node 25 SQLite (<code className="font-mono">data/invoices.db</code>)
          </div>

        </div>
      </div>
    </div>
  );
};
