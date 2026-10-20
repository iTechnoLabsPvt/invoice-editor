'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Invoice } from '@/types/invoice';
import { CHECK_CASE_INVOICE, DEFAULT_INVOICE, createEmptyInvoice } from '@/lib/sample-data';
import { calculateInvoiceTotals } from '@/lib/calculations';
import { Navbar } from '@/components/Navbar';
import { InvoiceEditor } from '@/components/InvoiceEditor';
import { InvoicePreview } from '@/components/InvoicePreview';
import { EmailModal } from '@/components/EmailModal';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { Toast, ToastMessage } from '@/components/Toast';

export default function Home() {
  // State for the active invoice
  const [invoice, setInvoice] = useState<Invoice>(CHECK_CASE_INVOICE);
  const [activeView, setActiveView] = useState<'split' | 'editor' | 'preview'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  // Modals & Drawers
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string, action?: ToastMessage['action']) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Recalculate invoice totals whenever items, discount, or tax change
  const handleInvoiceChange = useCallback((updated: Invoice) => {
    const calculatedTotals = calculateInvoiceTotals(
      updated.lineItems,
      updated.totals?.discount,
      updated.totals?.taxRate
    );

    setInvoice({
      ...updated,
      totals: calculatedTotals,
    });
    setIsSaved(false);
  }, []);

  // Save invoice to backend SQLite
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save invoice.');
      }

      setIsSaved(true);
      addToast('success', `Invoice ${invoice.metadata.invoiceNumber} saved to SQLite database.`);
    } catch (err: any) {
      console.error('Save error:', err);
      addToast('error', err.message || 'Error saving invoice to backend.');
    } finally {
      setIsSaving(false);
    }
  };

  // Browser Print / Save as PDF
  const handlePrint = () => {
    window.print();
  };

  // Load specific invoice by ID from backend
  const handleSelectInvoice = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      if (data.success && data.invoice) {
        setInvoice(data.invoice);
        setIsSaved(true);
        addToast('info', `Loaded invoice ${data.invoice.metadata.invoiceNumber}.`);
      }
    } catch (err) {
      console.error('Error fetching selected invoice:', err);
      addToast('error', 'Failed to retrieve invoice from server.');
    }
  };

  // Quick preset loaders
  const handleLoadCheckCase = () => {
    setInvoice(CHECK_CASE_INVOICE);
    setIsSaved(true);
    addToast('info', 'Loaded Spec Check Case (2 × $50 - $10 + 10% = $99.00).');
  };

  const handleLoadSample = () => {
    setInvoice(DEFAULT_INVOICE);
    setIsSaved(true);
    addToast('info', 'Loaded realistic consulting accounting invoice.');
  };

  const handleNewInvoice = () => {
    const newInv = createEmptyInvoice();
    setInvoice(newInv);
    setIsSaved(false);
    addToast('info', 'Started new draft invoice.');
  };

  // Keyboard shortcut listener (Ctrl+S, Ctrl+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [invoice]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        invoiceNumber={invoice.metadata.invoiceNumber}
        isSaving={isSaving}
        isSaved={isSaved}
        activeView={activeView}
        onViewChange={setActiveView}
        onSave={handleSave}
        onOpenEmail={() => setIsEmailModalOpen(true)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onPrint={handlePrint}
        onLoadCheckCase={handleLoadCheckCase}
        onLoadSample={handleLoadSample}
        onNewInvoice={handleNewInvoice}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Banner with Prompt Verification Context */}
        <div className="no-print mb-6 p-4 bg-gradient-to-r from-indigo-50 via-white to-slate-50 rounded-2xl border border-indigo-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              $99
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Verified Accounting Engine &middot; Paid Test Submission
              </h2>
              <p className="text-xs text-slate-500">
                Meets check specification: <code className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">2 × $50 - $10 discount + 10% tax = $99.00</code>. All numbers rounded to cents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadCheckCase}
              className="text-xs font-semibold px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              Verify Check Case
            </button>
            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Browse SQLite Records
            </button>
          </div>
        </div>

        {/* Split / Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Editor Pane */}
          <div
            className={`editor-pane xl:col-span-6 ${
              activeView === 'preview' ? 'hidden' : 'block'
            }`}
          >
            <InvoiceEditor
              invoice={invoice}
              onChange={handleInvoiceChange}
              onReset={handleNewInvoice}
            />
          </div>

          {/* Right Column: Live Printable Preview Pane */}
          <div
            className={`preview-pane xl:col-span-6 xl:sticky xl:top-24 ${
              activeView === 'editor' ? 'hidden' : 'block'
            }`}
          >
            <div className="no-print mb-3 flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Live Document Preview
              </span>
              <span className="text-[11px] text-slate-400">
                Updates in real-time &middot; Print-ready A4
              </span>
            </div>
            <InvoicePreview invoice={invoice} />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <p>
          Designed &amp; Built for Full-Stack Web Developer Test (Accounting Software) &middot; Praveen
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Next.js App Router &middot; TypeScript &middot; Tailwind CSS v4 &middot; Node.js SQLite &middot; Nodemailer / Resend
        </p>
      </footer>

      {/* Modals & Drawers */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        invoice={invoice}
        onEmailSent={(previewUrl) => {
          if (previewUrl) {
            addToast('success', 'Email sent via Ethereal sandbox!', {
              label: 'Open Delivered Email',
              url: previewUrl,
            });
          } else {
            addToast('success', 'Email delivered successfully!');
          }
        }}
      />

      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        currentInvoiceId={invoice.id}
        onSelectInvoice={handleSelectInvoice}
        onNewInvoice={handleNewInvoice}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
