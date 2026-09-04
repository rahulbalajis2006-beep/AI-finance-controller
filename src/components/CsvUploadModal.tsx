/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Local In-Browser CSV Importer Modal
 * Drag-and-drop support, zero server upload, parses completely in memory.
 */

import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import {
  parseInvoicesCsv,
  parsePaymentsCsv,
  parseSettlementsCsv,
  parseBankStatementsCsv,
} from '../utils/csvParser';
import { InvoiceRecord, PaymentRecord, SettlementRecord, BankRecord } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: {
    invoices: InvoiceRecord[];
    payments: PaymentRecord[];
    settlements: SettlementRecord[];
    bankRecords: BankRecord[];
  }) => void;
}

export const CsvUploadModal: React.FC<Props> = ({ isOpen, onClose, onDataLoaded }) => {
  const [invoicesText, setInvoicesText] = useState<string>('');
  const [paymentsText, setPaymentsText] = useState<string>('');
  const [settlementsText, setSettlementsText] = useState<string>('');
  const [bankText, setBankText] = useState<string>('');

  const [parsingErrors, setParsingErrors] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setter(content);
    };
    reader.readAsText(file);
  };

  const handleProcessUploads = () => {
    setParsingErrors([]);
    const errors: string[] = [];

    const invResult = invoicesText ? parseInvoicesCsv(invoicesText) : { records: [], warnings: [], rowErrors: [] };
    const payResult = paymentsText ? parsePaymentsCsv(paymentsText) : { records: [], warnings: [], rowErrors: [] };
    const setlResult = settlementsText ? parseSettlementsCsv(settlementsText) : { records: [], warnings: [], rowErrors: [] };
    const bankResult = bankText ? parseBankStatementsCsv(bankText) : { records: [], warnings: [], rowErrors: [] };

    if (invResult.rowErrors.length > 0) {
      errors.push(`Invoices: ${invResult.rowErrors.length} malformed rows detected.`);
    }
    if (payResult.rowErrors.length > 0) {
      errors.push(`Payments: ${payResult.rowErrors.length} malformed rows detected.`);
    }

    if (!invoicesText && !paymentsText) {
      errors.push('Please upload or paste at least Invoices or Payments CSV data.');
    }

    if (errors.length > 0) {
      setParsingErrors(errors);
      return;
    }

    onDataLoaded({
      invoices: invResult.records,
      payments: payResult.records,
      settlements: setlResult.records,
      bankRecords: bankResult.records,
    });

    setStatusMessage('Custom CSV files parsed and ingested successfully into local memory.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div
        id="csv-upload-modal"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-stone-300 bg-[#FAF8F5] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-800">
                Local-First Ingestion
              </span>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Upload Custom Finance CSVs
              </h3>
            </div>
          </div>
          <button
            id="btn-close-csv-upload"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-emerald-50/70 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
          <span>
            <strong>Local Processing Guarantee:</strong> Your uploaded CSV files are parsed directly in this browser session. No data is transmitted to external servers or cloud APIs.
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File 1: Invoices */}
          <div className="rounded-lg border border-stone-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-700" /> 1. Invoices Ledger CSV
              </label>
              {invoicesText && <span className="text-[10px] text-emerald-700 font-bold">Loaded</span>}
            </div>
            <p className="text-[11px] text-stone-500 mb-2">
              Headers: id, invoicenumber, customername, date, totalamount
            </p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => handleFileUpload(e, setInvoicesText)}
              className="w-full text-xs text-stone-600 file:mr-2 file:rounded file:border-0 file:bg-stone-100 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-slate-800 hover:file:bg-stone-200 cursor-pointer"
            />
          </div>

          {/* File 2: Payments */}
          <div className="rounded-lg border border-stone-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-700" /> 2. Gateway Payments CSV
              </label>
              {paymentsText && <span className="text-[10px] text-emerald-700 font-bold">Loaded</span>}
            </div>
            <p className="text-[11px] text-stone-500 mb-2">
              Headers: id, invoiceid, paymentmethod, date, grossamount
            </p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => handleFileUpload(e, setPaymentsText)}
              className="w-full text-xs text-stone-600 file:mr-2 file:rounded file:border-0 file:bg-stone-100 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-slate-800 hover:file:bg-stone-200 cursor-pointer"
            />
          </div>

          {/* File 3: Settlements */}
          <div className="rounded-lg border border-stone-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-700" /> 3. Razorpay Settlements CSV
              </label>
              {settlementsText && <span className="text-[10px] text-emerald-700 font-bold">Loaded</span>}
            </div>
            <p className="text-[11px] text-stone-500 mb-2">
              Headers: id, paymentid, mdrfee, gstonmdr, netsettlementamount, utrnumber
            </p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => handleFileUpload(e, setSettlementsText)}
              className="w-full text-xs text-stone-600 file:mr-2 file:rounded file:border-0 file:bg-stone-100 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-slate-800 hover:file:bg-stone-200 cursor-pointer"
            />
          </div>

          {/* File 4: Bank Statement */}
          <div className="rounded-lg border border-stone-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-700" /> 4. Bank Escrow Statement CSV
              </label>
              {bankText && <span className="text-[10px] text-emerald-700 font-bold">Loaded</span>}
            </div>
            <p className="text-[11px] text-stone-500 mb-2">
              Headers: id, settlementid, utrnumber, date, creditedamount, narration
            </p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => handleFileUpload(e, setBankText)}
              className="w-full text-xs text-stone-600 file:mr-2 file:rounded file:border-0 file:bg-stone-100 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-slate-800 hover:file:bg-stone-200 cursor-pointer"
            />
          </div>
        </div>

        {parsingErrors.length > 0 && (
          <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-rose-700" /> Parsing Warnings:
            </div>
            {parsingErrors.map((err, i) => (
              <div key={i}>• {err}</div>
            ))}
          </div>
        )}

        {statusMessage && (
          <div className="mt-4 rounded-lg bg-emerald-100 border border-emerald-300 p-3 text-xs text-emerald-950 font-semibold">
            {statusMessage}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
          <button
            id="btn-cancel-upload"
            onClick={onClose}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            id="btn-run-csv-reconcile"
            onClick={handleProcessUploads}
            className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Parse & Run Reconciliation
          </button>
        </div>
      </div>
    </div>
  );
};
