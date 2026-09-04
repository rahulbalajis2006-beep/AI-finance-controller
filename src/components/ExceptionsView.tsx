/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Exceptions & Discrepancies Workbench
 * Detailed breakdown across all 10 canonical exception types with triage tools.
 */

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  ShieldAlert,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ReconciliationResults,
  PrimaryTransaction,
  ExceptionItem,
  ExceptionType,
  ActionClassification,
} from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';

interface Props {
  results: ReconciliationResults;
  onInspectTransaction: (tx: PrimaryTransaction) => void;
  onExportCsv: () => void;
}

export const ExceptionsView: React.FC<Props> = ({
  results,
  onInspectTransaction,
  onExportCsv,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Collect all exception items with their parent transaction
  const allExceptionsWithTx = useMemo(() => {
    const list: { exception: ExceptionItem; transaction: PrimaryTransaction }[] = [];
    results.transactions.forEach((tx) => {
      tx.exceptions.forEach((exc) => {
        list.push({ exception: exc, transaction: tx });
      });
    });
    return list;
  }, [results.transactions]);

  // Filtered exceptions
  const filteredExceptions = useMemo(() => {
    return allExceptionsWithTx.filter(({ exception, transaction }) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        transaction.transactionId.toLowerCase().includes(search) ||
        exception.exceptionType.toLowerCase().includes(search) ||
        exception.whyFlagged.toLowerCase().includes(search) ||
        (transaction.invoice?.customerName &&
          transaction.invoice.customerName.toLowerCase().includes(search));

      const matchesType =
        selectedType === 'ALL' || exception.exceptionType === selectedType;

      const matchesAction =
        selectedAction === 'ALL' ||
        exception.recommendedAction === selectedAction;

      return matchesSearch && matchesType && matchesAction;
    });
  }, [allExceptionsWithTx, searchTerm, selectedType, selectedAction]);

  // Exception summary counts by type
  const countsByType = useMemo(() => {
    const map: Record<string, number> = {};
    allExceptionsWithTx.forEach(({ exception }) => {
      map[exception.exceptionType] = (map[exception.exceptionType] || 0) + 1;
    });
    return map;
  }, [allExceptionsWithTx]);

  return (
    <div className="space-y-6 pb-12">
      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Header & Metric Strip */}
      <div className="rounded-xl border border-stone-300 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Exceptions & Discrepancies Triage Workbench
              </h2>
              <span className="rounded bg-amber-100 text-amber-950 px-2 py-0.5 text-xs font-bold font-mono border border-amber-300">
                {allExceptionsWithTx.length} Items Flagged
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Screening across all 10 canonical exception types. Triage, review evidence, and export audit sheets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-exceptions-csv-workbench"
              onClick={onExportCsv}
              className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export Exceptions CSV
            </button>
          </div>
        </div>
      </div>

      {/* 10 Exception Type Badges / Quick Filter Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {Object.entries(countsByType).map(([type, count]) => {
          const isSelected = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(isSelected ? 'ALL' : type)}
              className={`rounded-lg p-2.5 text-left border transition-all text-xs ${
                isSelected
                  ? 'bg-amber-100/80 border-amber-400 text-amber-950 shadow-2xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="truncate max-w-[120px] font-mono text-[11px]">{type}</span>
                <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[10px] text-slate-900 font-mono">
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-stone-300 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-stone-200 bg-stone-50/70 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                id="search-exceptions-input"
                type="text"
                placeholder="Search exception description, transaction ID, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                id="filter-exception-type-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">All Exception Types ({allExceptionsWithTx.length})</option>
                {Object.keys(countsByType).map((type) => (
                  <option key={type} value={type}>
                    {type} ({countsByType[type]})
                  </option>
                ))}
              </select>

              <select
                id="filter-exception-action-select"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">All Actions</option>
                <option value="auto_resolve">Auto Resolve</option>
                <option value="manual_review">Manual Review</option>
                <option value="escalate">Escalate</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exceptions List */}
        <div className="divide-y divide-stone-200">
          {filteredExceptions.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No exception items match your search and filter criteria.
            </div>
          ) : (
            filteredExceptions.map(({ exception, transaction }, idx) => (
              <div
                key={idx}
                className="p-4 hover:bg-stone-50/60 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
                      TX: {transaction.transactionId}
                    </span>
                    <span className="rounded bg-amber-100 text-amber-950 px-2 py-0.5 text-[10px] font-bold uppercase font-mono border border-amber-300">
                      {exception.exceptionType}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        exception.recommendedAction === 'auto_resolve'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : exception.recommendedAction === 'manual_review'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-rose-50 text-rose-900 border-rose-200'
                      }`}
                    >
                      Action: {exception.recommendedAction.replace('_', ' ')}
                    </span>
                    {transaction.invoice?.customerName && (
                      <span className="text-xs text-stone-600">
                        Party: <strong className="text-slate-900">{transaction.invoice.customerName}</strong>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {exception.whyFlagged}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-2.5 rounded border border-stone-200">
                    <div>
                      <span className="font-bold text-stone-700">Evidence Available: </span>
                      <span className="text-stone-600">{exception.evidenceAvailable}</span>
                    </div>
                    <div>
                      <span className="font-bold text-stone-700">Evidence Missing: </span>
                      <span className="text-stone-600">{exception.evidenceMissing}</span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-end justify-between gap-2 shrink-0">
                  <div className="text-right font-mono text-xs">
                    <div className="text-stone-500 text-[10px]">Invoice / Paid</div>
                    <div className="font-bold text-slate-900">
                      {transaction.invoice ? `₹${transaction.invoice.totalAmount.toLocaleString('en-IN')}` : 'N/A'}
                    </div>
                  </div>

                  <button
                    onClick={() => onInspectTransaction(transaction)}
                    className="inline-flex items-center gap-1 rounded bg-stone-100 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-900 hover:text-white transition-colors border border-stone-200 shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5" /> Inspect 4-Way Trail
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-600">
          Showing <strong className="text-slate-900">{filteredExceptions.length}</strong> of{' '}
          <strong className="text-slate-900">{allExceptionsWithTx.length}</strong> total exception items across all transactions.
        </div>
      </div>
    </div>
  );
};
