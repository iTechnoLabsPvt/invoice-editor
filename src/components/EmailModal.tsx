'use client';

import React, { useState } from 'react';
import { Invoice } from '@/types/invoice';
import { Mail, Send, X, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onEmailSent?: (previewUrl?: string | null) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onEmailSent,
}) => {
  const [recipient, setRecipient] = useState(invoice.client.email || '');
  const [subject, setSubject] = useState(
    `Invoice ${invoice.metadata.invoiceNumber} from ${invoice.business.name || 'LedgerCraft'}`
  );
  const [message, setMessage] = useState(
    `Hi ${invoice.client.name || 'there'},\n\nPlease find attached the breakdown for Invoice ${invoice.metadata.invoiceNumber}. Let us know if you have any questions.\n\nThank you!`
  );
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    previewUrl?: string | null;
    provider?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) {
      setError('Please provide a recipient email address.');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccessResult(null);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipient.trim(),
          subject,
          message,
          invoice,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send invoice email.');
      }

      setSuccessResult({
        previewUrl: data.previewUrl,
        provider: data.provider,
      });

      if (onEmailSent) {
        onEmailSent(data.previewUrl);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while sending email.');
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setSuccessResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Send Invoice by Email
              </h3>
              <p className="text-xs text-slate-500">
                Deliver {invoice.metadata.invoiceNumber} with formatted HTML table
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successResult ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Invoice Email Delivered!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                The formatted invoice email was processed via{' '}
                <span className="font-semibold uppercase text-indigo-700">
                  {successResult.provider}
                </span>
                .
              </p>

              {successResult.previewUrl && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-left space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900">
                      Live Ethereal Mailbox Sandbox
                    </span>
                    <span className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                      Zero-Config
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700">
                    Click the preview link below to inspect the rendered HTML email in your browser:
                  </p>
                  <a
                    href={successResult.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>View Delivered Email</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Personal Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2">
                <span className="font-semibold text-slate-700">Delivery:</span>
                Uses Resend / SMTP if configured in .env, or automatic Ethereal sandbox with instant preview link.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
