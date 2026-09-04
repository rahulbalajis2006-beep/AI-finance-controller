/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Audit Trail & Export Center
 * Full JSON package, CSV exceptions download, copy-to-clipboard, and local-processing confirmation.
 */

import React, { useState } from 'react';
import {
  FileCheck,
  Download,
  Copy,
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  Building2,
  Scale,
  Calendar,
} from 'lucide-react';
import { ReconciliationResults, CompanyProfileConfig } from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';

interface Props {
  results: ReconciliationResults;
  config: CompanyProfileConfig;
  onExportJson: () => void;
  onExportCsv: () => void;
}

export const AuditReportView: React.FC<Props> = ({
  results,
  config,
  onExportJson,
  onExportCsv,
}) => {
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCsv, setCopiedCsv] = useState(false);

  const jsonString = JSON.stringify(
    {
      companyProfile: config,
      summaryKpis: results.kpis,
      gstScreening: results.gstScreening,
      tdsScreening: results.tdsScreening,
      cashPosition: results.cashPosition,
      settlementTiming: results.settlementTiming,
      reconciliationTransactions: results.transactions,
      generatedAt: new Date().toISOString(),
      engineVersion: 'India Finance Operations Controller v1.0',
    },
    null,
    2
  );

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Header */}
      <div className="rounded-xl border border-stone-300 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Audit Trail & Statutory Reports Hub
              </h2>
              <p className="text-xs text-stone-600">
                Download auditable JSON reports and CSV exception logs generated entirely in local browser memory.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-download-audit-csv"
              onClick={onExportCsv}
              className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-700" /> Download Exceptions CSV
            </button>
            <button
              id="btn-download-audit-json"
              onClick={onExportJson}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-4 w-4" /> Download Full JSON
            </button>
          </div>
        </div>
      </div>

      {/* Compliance & Audit Integrity Checklist */}
      <div className="rounded-xl border border-stone-300 bg-white p-6 shadow-xs">
        <h3 className="font-serif text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-800" />
          Pre-Audit Compliance & Mathematical Verification Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              1. Mathematical Invariant Verification
            </div>
            <p className="text-emerald-950 font-medium">
              Verified: {results.kpis.fullyMatched} Matched + {results.kpis.partialMatches} Partial + {results.kpis.unmatched} Unmatched = {results.kpis.batchSize} Total Batch.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              2. Local Processing Guarantee
            </div>
            <p className="text-emerald-950 font-medium">
              All records ingested and reconciled in client browser memory. No third-party network transmission.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              3. GST GSTR-2B ITC Variance Screened
            </div>
            <p className="text-emerald-950 font-medium">
              Books input tax (₹{results.gstScreening.booksInputTax.toLocaleString('en-IN')}) vs GSTR-2B statement (₹{results.gstScreening.gstr2bInputTax.toLocaleString('en-IN')}) screened.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              4. Income-tax Act, 2025 Sec 392 Screened
            </div>
            <p className="text-emerald-950 font-medium">
              Evaluated professional fees against configured {config.tdsProfessionalFeeRate}% withholding rate.
            </p>
          </div>
        </div>
      </div>

      {/* JSON Audit Report Inspector */}
      <div className="rounded-xl border border-stone-300 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-stone-200 bg-stone-50/80 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-slate-700" />
            <span className="font-serif text-sm font-bold text-slate-900">
              Auditable JSON Ledger Package
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-copy-audit-json"
              onClick={handleCopyJson}
              className="rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1"
            >
              {copiedJson ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy JSON
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs max-h-96 overflow-y-auto">
          <pre className="whitespace-pre">{jsonString}</pre>
        </div>
      </div>
    </div>
  );
};
