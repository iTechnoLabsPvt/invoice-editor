'use client';

import React from 'react';
import {
  FileText,
  Save,
  Printer,
  Mail,
  FolderOpen,
  Plus,
  Sparkles,
  CheckCircle,
  Eye,
  Edit3,
  Columns,
} from 'lucide-react';

interface NavbarProps {
  invoiceNumber: string;
  isSaving: boolean;
  isSaved: boolean;
  activeView: 'split' | 'editor' | 'preview';
  onViewChange: (view: 'split' | 'editor' | 'preview') => void;
  onSave: () => void;
  onOpenEmail: () => void;
  onOpenHistory: () => void;
  onPrint: () => void;
  onLoadCheckCase: () => void;
  onLoadSample: () => void;
  onNewInvoice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  invoiceNumber,
  isSaving,
  isSaved,
  activeView,
  onViewChange,
  onSave,
  onOpenEmail,
  onOpenHistory,
  onPrint,
  onLoadCheckCase,
  onLoadSample,
  onNewInvoice,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">LedgerCraft</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  Accounting Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Professional Invoice Studio &middot; {invoiceNumber}
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100/80 p-1 rounded-lg border border-slate-200">
            <button
              onClick={onLoadCheckCase}
              title="2 × $50 - $10 discount + 10% tax = $99.00"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-indigo-700 shadow-xs hover:bg-indigo-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Check Case ($99.00)</span>
            </button>
            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-slate-700 hover:bg-white/80 transition-colors"
            >
              <span>Sample Invoice</span>
            </button>
            <button
              onClick={onNewInvoice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-slate-700 hover:bg-white/80 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>New</span>
            </button>
          </div>

          {/* Responsive View Switcher */}
          <div className="flex xl:hidden items-center bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => onViewChange('editor')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeView === 'editor' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editor</span>
              </span>
            </button>
            <button
              onClick={() => onViewChange('split')}
              className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeView === 'split' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => onViewChange('preview')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeView === 'preview' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHistory}
              title="View all saved invoices"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
            >
              <FolderOpen className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Invoices</span>
            </button>

            <button
              onClick={onSave}
              disabled={isSaving}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all shadow-xs ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Saved</span>
                </>
              ) : (
                <>
                  <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenEmail}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
            >
              <Mail className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Email</span>
            </button>

            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
