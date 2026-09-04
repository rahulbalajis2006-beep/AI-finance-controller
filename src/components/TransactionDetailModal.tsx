/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Transaction 4-Way Reconciliation Lifecycle Inspector Modal
 * Shows full audit trail, invoice, payment, settlement MDR breakdown, and bank deposit.
 */

import React from 'react';
import {
  X,
  FileText,
  CreditCard,
  Building2,
  Landmark,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { PrimaryTransaction, CompanyProfileConfig } from '../types';

interface Props {
  transaction: PrimaryTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  config: CompanyProfileConfig;
}

export const TransactionDetailModal: React.FC<Props> = ({
  transaction,
  isOpen,
  onClose,
  config,
}) => {
  if (!isOpen || !transaction) return null;

  const inv = transaction.invoice;
  const pay = transaction.payment;
  const setl = transaction.settlement;
  const bank = transaction.bankCredit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div
        id="transaction-detail-modal"
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-stone-300 bg-[#FAF8F5] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500 bg-stone-200 px-2 py-0.5 rounded">
                TX: {transaction.transactionId}
              </span>
              <span
                className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${
                  transaction.status === 'Fully_Matched'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : transaction.status === 'Partial_Match'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}
              >
                {transaction.status.replace('_', ' ')}
              </span>
              <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
                Confidence: <strong className="text-slate-900">{transaction.confidence}</strong>
              </span>
            </div>
            <h3 className="mt-1 font-serif text-xl font-bold text-slate-900">
              4-Way Transaction Audit & Lifecycle Inspection
            </h3>
          </div>
          <button
            id="btn-close-tx-modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4-Way Stepper Visualizer */}
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3">
            Reconciliation Pipeline Sequence
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Step 1: Invoice */}
            <div className={`rounded-lg border p-3 ${inv ? 'border-emerald-200 bg-emerald-50/40' : 'border-stone-200 bg-stone-50'}`}>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-700" /> 1. Invoice
                </span>
                {inv ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
              </div>
              <div className="mt-2 font-mono text-sm font-bold text-slate-900">
                {inv ? `₹${inv.totalAmount.toLocaleString('en-IN')}` : 'Not issued'}
              </div>
              <div className="text-[11px] text-stone-500 truncate">
                {inv ? inv.invoiceNumber : 'No primary invoice'}
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className={`rounded-lg border p-3 ${pay ? 'border-emerald-200 bg-emerald-50/40' : 'border-stone-200 bg-stone-50'}`}>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-slate-700" /> 2. Payment
                </span>
                {pay ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
              </div>
              <div className="mt-2 font-mono text-sm font-bold text-slate-900">
                {pay ? (isNaN(pay.grossAmount) ? 'Invalid' : `₹${pay.grossAmount.toLocaleString('en-IN')}`) : 'Not captured'}
              </div>
              <div className="text-[11px] text-stone-500 truncate">
                {pay ? `${pay.paymentMethod} • ${pay.gatewayPaymentId}` : 'Missing capture'}
              </div>
            </div>

            {/* Step 3: Settlement */}
            <div className={`rounded-lg border p-3 ${setl ? 'border-emerald-200 bg-emerald-50/40' : 'border-stone-200 bg-stone-50'}`}>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-slate-700" /> 3. Settlement
                </span>
                {setl ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
              </div>
              <div className="mt-2 font-mono text-sm font-bold text-slate-900">
                {setl ? `₹${setl.netSettlementAmount.toLocaleString('en-IN')}` : 'Pending payout'}
              </div>
              <div className="text-[11px] text-stone-500 truncate">
                {setl ? `MDR: ${setl.mdrFee !== null ? `₹${setl.mdrFee}` : 'N/A'}` : 'No batch generated'}
              </div>
            </div>

            {/* Step 4: Bank Credit */}
            <div className={`rounded-lg border p-3 ${bank ? 'border-emerald-200 bg-emerald-50/40' : 'border-stone-200 bg-stone-50'}`}>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span className="flex items-center gap-1.5">
                  <Landmark className="h-4 w-4 text-slate-700" /> 4. Bank Credit
                </span>
                {bank ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />}
              </div>
              <div className="mt-2 font-mono text-sm font-bold text-slate-900">
                {bank ? `₹${bank.creditedAmount.toLocaleString('en-IN')}` : 'Credit missing'}
              </div>
              <div className="text-[11px] text-stone-500 truncate">
                {bank ? bank.bankName.split(' ')[0] : 'Pending statement'}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Books & Invoice Data */}
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <h4 className="flex items-center gap-2 font-serif text-sm font-bold text-slate-900 border-b border-stone-100 pb-2">
              <FileText className="h-4 w-4 text-emerald-700" /> Primary Invoice & Customer
            </h4>
            {inv ? (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Customer Name:</span>
                  <span className="font-semibold text-slate-900">{inv.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Customer GSTIN:</span>
                  <span className="font-mono text-slate-800">{inv.customerGstin || 'Unregistered / B2C'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Invoice Date:</span>
                  <span className="font-mono text-slate-800">{inv.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Taxable Supply:</span>
                  <span className="font-mono text-slate-800">₹{inv.taxableAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Output GST:</span>
                  <span className="font-mono text-slate-800">₹{inv.gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-stone-100 font-bold">
                  <span className="text-slate-900">Total Books Invoice:</span>
                  <span className="font-mono text-emerald-800">₹{inv.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-stone-50 rounded text-xs text-stone-500 italic text-center">
                No linked invoice record found in books.
              </div>
            )}
          </div>

          {/* Card 2: Settlement Fee & Math Breakdown */}
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <h4 className="flex items-center gap-2 font-serif text-sm font-bold text-slate-900 border-b border-stone-100 pb-2">
              <Building2 className="h-4 w-4 text-emerald-700" /> Aggregator Settlement & Fee Audit
            </h4>
            {setl ? (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Settlement ID:</span>
                  <span className="font-mono text-slate-800">{setl.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Settlement Batch:</span>
                  <span className="font-mono text-slate-800">{setl.settlementBatchId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">MDR / Gateway Fee:</span>
                  <span className="font-mono text-slate-800">
                    {setl.mdrFee !== null ? `₹${setl.mdrFee.toFixed(2)}` : 'Not supplied'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">GST on MDR (18%):</span>
                  <span className="font-mono text-slate-800">
                    {setl.gstOnMdr !== null ? `₹${setl.gstOnMdr.toFixed(2)}` : 'Not supplied'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Expected Net Settlement:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {transaction.expectedNetSettlement !== null ? `₹${transaction.expectedNetSettlement.toFixed(2)}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-stone-100 font-bold">
                  <span className="text-slate-900">Actual Payout Net:</span>
                  <span className="font-mono text-emerald-800">₹{setl.netSettlementAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200/60 rounded text-xs text-amber-900">
                Payment captured but missing aggregator settlement record. Funds awaiting batch disbursement.
              </div>
            )}
          </div>
        </div>

        {/* Exceptions & Variances for this Transaction */}
        {transaction.exceptions.length > 0 && (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50/50 p-4">
            <h4 className="flex items-center gap-2 font-serif text-sm font-bold text-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-800" />
              Flagged Exceptions ({transaction.exceptions.length})
            </h4>
            <div className="mt-3 space-y-3">
              {transaction.exceptions.map((exc, idx) => (
                <div key={idx} className="rounded-lg border border-amber-200 bg-white p-3 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-mono text-[11px]">
                      {exc.exceptionType}
                    </span>
                    <span className="font-semibold text-slate-700">
                      Recommended: <span className="uppercase text-stone-900 underline">{exc.recommendedAction.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <p className="mt-2 text-slate-800 font-medium leading-relaxed">
                    {exc.whyFlagged}
                  </p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600 bg-stone-50 p-2 rounded border border-stone-200">
                    <div>
                      <strong className="text-stone-800">Evidence Available:</strong> {exc.evidenceAvailable}
                    </div>
                    <div>
                      <strong className="text-stone-800">Evidence Missing:</strong> {exc.evidenceMissing}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Notes Log */}
        <div className="mt-6 rounded-xl border border-stone-200 bg-stone-100/60 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
            Deterministic Engine Audit Trail
          </div>
          <ul className="space-y-1 text-xs text-stone-700 font-mono">
            {transaction.auditNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            id="btn-close-tx-details"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
