'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
  };
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full no-print pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border transition-all duration-300 animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : toast.type === 'error'
              ? 'bg-rose-950 text-white border-rose-800'
              : 'bg-slate-800 text-white border-slate-700'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
          </div>
          <div className="flex-1 text-sm leading-relaxed">
            <p>{toast.message}</p>
            {toast.action && (
              <div className="mt-2">
                {toast.action.url ? (
                  <a
                    href={toast.action.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                  >
                    {toast.action.label} &rarr;
                  </a>
                ) : (
                  <button
                    onClick={toast.action.onClick}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white transition-colors p-0.5 rounded"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
