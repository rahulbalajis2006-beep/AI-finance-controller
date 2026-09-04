/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Reconciliation Operations Workspace
 * 4-Way Linkage (Invoices → Payments → Settlements → Bank Deposits)
 * Transparent KPIs, explicit denominator, invariant verification, and detailed ledger.
 */

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  ArrowRight,
  Eye,
  Layers,
  Sparkles,
  Download,
  ShieldCheck,
  Building2,
  CreditCard,
  FileText,
  Landmark,
  Clock,
} from 'lucide-react';
import {
  ReconciliationResults,
  PrimaryTransaction,
  CompanyProfileConfig,
  ReconciliationStatus,
  ActionClassification,
  DeterministicConfidence,
} from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';

interface Props {
  results: ReconciliationResults;
  config: CompanyProfileConfig;
  onOpenFormula: (key: string) => void;
  onInspectTransaction: (tx: PrimaryTransaction) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onLoadDemoBatch: () => void;
}

export const ReconciliationView: React.FC<Props> = ({
  results,
  config,
  onOpenFormula,
  onInspectTransaction,
  onExportJson,
  onExportCsv,
  onLoadDemoBatch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('ALL');

  const { kpis, transactions } = results;

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !search ||
        tx.transactionId.toLowerCase().includes(search) ||
        (tx.invoice?.customerName && tx.invoice.customerName.toLowerCase().includes(search)) ||
        (tx.invoice?.invoiceNumber && tx.invoice.invoiceNumber.toLowerCase().includes(search)) ||
        (tx.payment?.gatewayPaymentId && tx.payment.gatewayPaymentId.toLowerCase().includes(search)) ||
        (tx.settlement?.utrNumber && tx.settlement.utrNumber.toLowerCase().includes(search));

      // Status filter
      const matchStatus = statusFilter === 'ALL' || tx.status === statusFilter;

      // Action filter
      const matchAction = actionFilter === 'ALL' || tx.actionRequired === actionFilter;

      // Confidence filter
      const matchConfidence = confidenceFilter === 'ALL' || tx.confidence === confidenceFilter;

      return matchSearch && matchStatus && matchAction && matchConfidence;
    });
  }, [transactions, searchTerm, statusFilter, actionFilter, confidenceFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Mandatory Regulatory Disclaimer */}
      <DisclaimerBanner />

      {/* Hero Denominator & Invariant Strip */}
      <div
        id="batch-denominator-strip"
        className="rounded-xl border border-stone-300 bg-white p-4 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 font-serif text-base">
                India Finance Operations Batch Run
              </span>
              <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-mono font-semibold text-stone-700 border border-stone-200">
                {config.fiscalYear}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-flex">
              <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-800">
                Denominator:
              </span>
              <span>Unique primary invoice/payment records ({kpis.batchSize} records)</span>
              <button
                onClick={() => onOpenFormula('batchSize')}
                className="text-emerald-700 hover:text-emerald-950 underline flex items-center gap-0.5 ml-1"
                title="View denominator formula"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Mathematical Invariant Verification */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono font-bold border ${
                kpis.invariantSatisfied
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <span>
                Invariant: {kpis.fullyMatched} Fully + {kpis.partialMatches} Partial + {kpis.unmatched} Unmatched = {kpis.batchSize} Total
              </span>
            </div>

            <button
              onClick={onLoadDemoBatch}
              className="rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 text-xs font-semibold border border-stone-300 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Reload 65 Demo
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Batch Size */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs relative group hover:border-stone-400 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-stone-500">
            <span>Primary Batch Size</span>
            <button
              onClick={() => onOpenFormula('batchSize')}
              className="text-stone-400 hover:text-stone-700 p-0.5 rounded"
              title="How was this calculated?"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1 font-serif text-2xl font-bold text-slate-900">
            {kpis.batchSize}
          </div>
          <div className="mt-1 text-[11px] text-stone-500 truncate">
            Unique Primary Denominator
          </div>
        </div>

        {/* Card 2: Match Rate */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs relative group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-800">
            <span className="font-semibold">Reconciliation Match Rate</span>
            <button
              onClick={() => onOpenFormula('matchRate')}
              className="text-emerald-700 hover:text-emerald-950 p-0.5 rounded"
              title="How was this calculated?"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1 font-serif text-2xl font-bold text-emerald-950">
            {kpis.matchRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-emerald-800 font-medium">
            {kpis.fullyMatched} of {kpis.batchSize} fully reconciled
          </div>
        </div>

        {/* Card 3: Exception Rate */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs relative group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-amber-900">
            <span className="font-semibold">Exception Rate</span>
            <button
              onClick={() => onOpenFormula('exceptionRate')}
              className="text-amber-700 hover:text-amber-950 p-0.5 rounded"
              title="How was this calculated?"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1 font-serif text-2xl font-bold text-amber-950">
            {kpis.exceptionRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-amber-800 font-medium">
            {kpis.transactionsWithExceptions} txs ({kpis.totalExceptionItems} items)
          </div>
        </div>

        {/* Card 4: Auto-Resolution */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs relative group hover:border-stone-400 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-stone-500">
            <span>Auto-Resolution Rate</span>
            <button
              onClick={() => onOpenFormula('autoResolutionRate')}
              className="text-stone-400 hover:text-stone-700 p-0.5 rounded"
              title="How was this calculated?"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1 font-serif text-2xl font-bold text-slate-900">
            {kpis.autoResolutionRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            Deterministic rule-based
          </div>
        </div>

        {/* Card 5: Review Variance */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs relative group hover:border-rose-400 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs font-medium text-rose-900">
            <span className="font-semibold">Value for Review</span>
            <button
              onClick={() => onOpenFormula('expectedNetSettlement')}
              className="text-rose-700 hover:text-rose-950 p-0.5 rounded"
              title="How was this calculated?"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1 font-serif text-2xl font-bold text-rose-950">
            ₹{kpis.totalVarianceRequiringReview.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-rose-800 font-medium truncate">
            Discrepancy / Missing payouts
          </div>
        </div>
      </div>

      {/* 4-Way Reconciliation Pipeline Overview */}
      <div className="rounded-xl border border-stone-300 bg-[#FAF8F5] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wider">
              Deterministic 4-Way Reconciliation Pipeline
            </h3>
            <p className="text-xs text-stone-500">
              Deterministic matching from Invoices to Bank Credits with rule-based fee verification.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-export-reconcile-csv"
              onClick={onExportCsv}
              className="rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5 text-stone-500" /> Exceptions CSV
            </button>
            <button
              id="btn-export-reconcile-json"
              onClick={onExportJson}
              className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" /> Full JSON Report
            </button>
          </div>
        </div>

        {/* 4-Step Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-stone-200 bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <FileText className="h-4 w-4 text-emerald-700" />
              1. Books Invoices
            </div>
            <div className="mt-2 font-mono text-sm font-bold text-slate-900">
              ₹{transactions.reduce((sum, t) => sum + (t.invoice?.totalAmount || 0), 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-500">
              {results.inputRowCounts.invoices} invoices logged
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CreditCard className="h-4 w-4 text-emerald-700" />
              2. Payments Captured
            </div>
            <div className="mt-2 font-mono text-sm font-bold text-slate-900">
              ₹{kpis.totalGrossPaymentValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-500">
              {results.inputRowCounts.payments} payment captures
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Building2 className="h-4 w-4 text-emerald-700" />
              3. Aggregator Net
            </div>
            <div className="mt-2 font-mono text-sm font-bold text-slate-900">
              ₹{kpis.totalActualSettledValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-500">
              {results.inputRowCounts.settlements} batch settlements
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Landmark className="h-4 w-4 text-emerald-700" />
              4. Bank Credited
            </div>
            <div className="mt-2 font-mono text-sm font-bold text-slate-900">
              ₹{kpis.totalBankCreditedValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-500">
              {results.inputRowCounts.bankRecords} escrow deposits
            </div>
          </div>
        </div>
      </div>

      {/* Main Reconciliation Ledger Table */}
      <div className="rounded-xl border border-stone-300 bg-white shadow-xs overflow-hidden">
        {/* Table Filter Header */}
        <div className="border-b border-stone-200 bg-stone-50/70 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  id="search-transactions"
                  type="text"
                  placeholder="Search customer, TX ID, invoice, gateway ID, UTR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <select
                id="filter-reconcile-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">All Statuses ({transactions.length})</option>
                <option value="Fully_Matched">Fully Matched ({kpis.fullyMatched})</option>
                <option value="Partial_Match">Partial Match ({kpis.partialMatches})</option>
                <option value="Unmatched">Unmatched ({kpis.unmatched})</option>
              </select>

              {/* Action Filter */}
              <select
                id="filter-reconcile-action"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">All Actions</option>
                <option value="auto_resolve">Auto Resolve</option>
                <option value="manual_review">Manual Review</option>
                <option value="escalate">Escalate</option>
              </select>

              {/* Confidence Filter */}
              <select
                id="filter-reconcile-confidence"
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">All Confidences</option>
                <option value="High">High Confidence</option>
                <option value="Medium">Medium Confidence</option>
                <option value="Low">Low Confidence (Fallback)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dense Financial Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-100/80 font-bold uppercase tracking-wider text-stone-700 text-[11px]">
                <th className="px-3.5 py-3">Transaction / Customer</th>
                <th className="px-3 py-3">Invoice (Books)</th>
                <th className="px-3 py-3">Payment Captured</th>
                <th className="px-3 py-3">Settlement Net</th>
                <th className="px-3 py-3">Bank Credited</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Confidence</th>
                <th className="px-3 py-3">Exceptions</th>
                <th className="px-3.5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-stone-500 text-xs">
                    No transactions match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const invAmount = tx.invoice?.totalAmount;
                  const payAmount = tx.payment?.grossAmount;
                  const setlAmount = tx.settlement?.netSettlementAmount;
                  const bankAmount = tx.bankCredit?.creditedAmount;

                  return (
                    <tr
                      key={tx.transactionId}
                      className="hover:bg-amber-50/30 transition-colors group"
                    >
                      {/* TX & Customer */}
                      <td className="px-3.5 py-2.5">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {tx.transactionId}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate max-w-[160px]">
                          {tx.invoice?.customerName || tx.payment?.paymentMethod || 'Primary Record'}
                        </div>
                      </td>

                      {/* Invoice Amount */}
                      <td className="px-3 py-2.5 font-mono">
                        {invAmount !== undefined ? (
                          <span className="font-semibold text-slate-900">
                            ₹{invAmount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">Not issued</span>
                        )}
                        {tx.invoice && (
                          <div className="text-[10px] text-stone-500">{tx.invoice.date}</div>
                        )}
                      </td>

                      {/* Payment Amount */}
                      <td className="px-3 py-2.5 font-mono">
                        {payAmount !== undefined && !isNaN(payAmount) ? (
                          <span className="font-semibold text-slate-900">
                            ₹{payAmount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-amber-700 italic">
                            {tx.payment ? 'Non-numeric' : 'Missing'}
                          </span>
                        )}
                        {tx.payment && (
                          <div className="text-[10px] text-stone-500">{tx.payment.paymentMethod}</div>
                        )}
                      </td>

                      {/* Settlement Net */}
                      <td className="px-3 py-2.5 font-mono">
                        {setlAmount !== undefined ? (
                          <span className="font-semibold text-slate-900">
                            ₹{setlAmount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-amber-700 italic">Pending</span>
                        )}
                        {tx.settlement && (
                          <div className="text-[10px] text-stone-500">
                            MDR: {tx.settlement.mdrFee !== null ? `₹${tx.settlement.mdrFee}` : 'N/A'}
                          </div>
                        )}
                      </td>

                      {/* Bank Credited */}
                      <td className="px-3 py-2.5 font-mono">
                        {bankAmount !== undefined ? (
                          <span className="font-semibold text-emerald-900">
                            ₹{bankAmount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-rose-700 font-semibold italic">Missing</span>
                        )}
                        {tx.bankCredit && (
                          <div className="text-[10px] text-stone-500 truncate max-w-[90px]">
                            {tx.bankCredit.bankName.split(' ')[0]}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                            tx.status === 'Fully_Matched'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : tx.status === 'Partial_Match'
                              ? 'bg-amber-100 text-amber-950 border-amber-300'
                              : 'bg-rose-100 text-rose-950 border-rose-300'
                          }`}
                        >
                          {tx.status === 'Fully_Matched' && <CheckCircle2 className="h-3 w-3 text-emerald-700" />}
                          {tx.status === 'Partial_Match' && <AlertTriangle className="h-3 w-3 text-amber-700" />}
                          {tx.status === 'Unmatched' && <XCircle className="h-3 w-3 text-rose-700" />}
                          {tx.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Deterministic Confidence */}
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                            tx.confidence === 'High'
                              ? 'bg-emerald-50 text-emerald-800'
                              : tx.confidence === 'Medium'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                          title="Deterministic match confidence (not AI probability)"
                        >
                          {tx.confidence}
                        </span>
                      </td>

                      {/* Exceptions */}
                      <td className="px-3 py-2.5">
                        {tx.exceptions.length === 0 ? (
                          <span className="text-emerald-700 text-[11px] font-medium">None ✓</span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {tx.exceptions.slice(0, 2).map((exc, i) => (
                              <span
                                key={i}
                                className="font-mono text-[10px] text-amber-900 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded truncate max-w-[130px]"
                                title={exc.whyFlagged}
                              >
                                {exc.exceptionType}
                              </span>
                            ))}
                            {tx.exceptions.length > 2 && (
                              <span className="text-[9px] text-stone-500 font-semibold">
                                +{tx.exceptions.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-3.5 py-2.5 text-right">
                        <button
                          id={`btn-inspect-${tx.transactionId}`}
                          onClick={() => onInspectTransaction(tx)}
                          className="inline-flex items-center gap-1 rounded bg-stone-100 px-2 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-900 hover:text-white transition-colors border border-stone-200"
                        >
                          <Eye className="h-3 w-3" /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="border-t border-stone-200 bg-stone-50 px-4 py-3 flex items-center justify-between text-xs text-stone-600">
          <div>
            Showing <strong className="text-slate-900">{filteredTransactions.length}</strong> of{' '}
            <strong className="text-slate-900">{transactions.length}</strong> total primary transactions
          </div>
          <div className="font-mono text-[11px] text-stone-500">
            Tolerance: ±₹{config.amountMatchTolerance} • Timing Threshold: {config.settlementTimingReviewThresholdDays}d
          </div>
        </div>
      </div>
    </div>
  );
};
