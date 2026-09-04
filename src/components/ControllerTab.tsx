import React, { useState } from 'react';
import { ReconciliationResultsJSON } from '../types/finance';
import { parseCSV, downloadBlob } from '../utils/csvParser';
import { Upload, Download, Play, Trash2 } from 'lucide-react';

export default function ControllerTab({ onRun, onUploadRun, onClear, results }: { 
  onRun: () => void, 
  onUploadRun: (inv: any[], pay: any[], set: any[], bnk: any[]) => void, 
  onClear: () => void,
  results: ReconciliationResultsJSON | null 
}) {
  const [files, setFiles] = useState({
    invoices: null as File | null,
    payments: null as File | null,
    settlements: null as File | null,
    bank: null as File | null
  });

  const [errors, setErrors] = useState({
    invoices: null as string | null,
    payments: null as string | null,
    settlements: null as string | null,
    bank: null as string | null
  });

  const checkHeaders = (headers: string[], requirements: (string | string[])[]) => {
    const missing: string[] = [];
    requirements.forEach(req => {
      if (Array.isArray(req)) {
        if (!req.some(r => headers.includes(r.toLowerCase()))) {
          missing.push(req[1]); // use snake_case for display
        }
      } else {
        if (!headers.includes(req.toLowerCase())) {
          missing.push(req);
        }
      }
    });
    return missing;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof files) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setFiles(prev => ({ ...prev, [type]: file }));
      
      const text = await file.text();
      const firstLine = text.split('\n')[0] || '';
      const headers = firstLine.split(',').map(h => h.trim().toLowerCase());
      
      const requiredColumns = {
        invoices: ['amount', 'date', ['id', 'invoice_id']],
        payments: ['amount', 'date', ['id', 'payment_id'], ['invoiceid', 'invoice_id']],
        settlements: ['amount', 'date', ['id', 'settlement_id'], ['paymentid', 'payment_id'], 'mdr', ['gstonmdr', 'gst_on_mdr']],
        bank: ['amount', 'date', ['id', 'bank_id'], ['settlementid', 'settlement_id']]
      };
      
      const missing = checkHeaders(headers, requiredColumns[type]);
      if (missing.length > 0) {
        setErrors(prev => ({ ...prev, [type]: `Missing: ${missing.join(', ')}` }));
      } else {
        setErrors(prev => ({ ...prev, [type]: null }));
      }
    }
  };

  const handleUpload = async () => {
    if (!files.invoices || !files.payments || !files.settlements || !files.bank) {
      alert("Please upload all 4 CSV files before running the engine.");
      return;
    }
    if (Object.values(errors).some(err => err !== null)) {
      alert("Please fix the CSV format errors before running.");
      return;
    }
    try {
      const invData = await parseCSV(files.invoices);
      const payData = await parseCSV(files.payments);
      const setData = await parseCSV(files.settlements);
      const bnkData = await parseCSV(files.bank);
      onUploadRun(invData, payData, setData, bnkData);
    } catch (e) {
      alert("Error parsing CSVs. Please check the file formats.");
    }
  };

  const handleClear = () => {
    setFiles({ invoices: null, payments: null, settlements: null, bank: null });
    setErrors({ invoices: null, payments: null, settlements: null, bank: null });
    onClear();
  };

  const generateSamples = () => {
    const invCsv = `invoice_id,amount,date
INV-1,1000,2026-09-01
INV-2,2000,2026-09-01
INV-3,3000,2026-09-01
INV-4,4000,2026-09-01`;

    const payCsv = `payment_id,invoice_id,amount,date,merchant,description
PAY-1,INV-1,1000,2026-09-01,Store,Sale
PAY-2,INV-2,2000,2026-09-01,Store,Sale
PAY-DUP,INV-2,2000,2026-09-01,Store,Sale
PAY-3,INV-3,3000,2026-09-01,Store,Sale
PAY-4,INV-4,4000,2026-09-01,Store,Sale`;

    // Exceptions introduced: SET-3 amount mismatch, SET-99 missing in books, PAY-4 missing in settlement
    const setCsv = `settlement_id,payment_id,amount,date,mdr,gst_on_mdr,refund_amount
SET-1,PAY-1,980,2026-09-02,16.95,3.05,0
SET-2,PAY-2,1960,2026-09-02,33.9,6.1,0
SET-3,PAY-3,2800,2026-09-02,50.85,9.15,0
SET-99,PAY-99,500,2026-09-02,10,1.8,0`;

    const bnkCsv = `bank_id,settlement_id,amount,date
BNK-1,SET-1,980,2026-09-02
BNK-2,SET-2,1960,2026-09-02
BNK-3,SET-3,2800,2026-09-02
BNK-99,SET-99,500,2026-09-02`;

    downloadBlob(invCsv, "1_invoices_sample.csv");
    downloadBlob(payCsv, "2_payments_sample.csv");
    downloadBlob(setCsv, "3_settlements_sample.csv");
    downloadBlob(bnkCsv, "4_bank_statements_sample.csv");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Predator AI Finance Controller</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Welcome to Predator AI Finance Controller. This tool performs a strict deterministic 4-way reconciliation. All arithmetic and rule matching is executed purely in TypeScript to guarantee privacy, accuracy, and zero cost. Gemini is used sparsely and strictly for unstructured reasoning (classification & Q&A) only.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-2">Layer A: Deterministic Engine</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Transaction & Phase Matching</li>
              <li>• Exception Flagging</li>
              <li>• Cash Position Calculation</li>
              <li>• GST & TDS Arithmetic</li>
            </ul>
          </div>
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-2">Layer B: AI Reasoning</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Exception Classification</li>
              <li>• Probable Cause Analysis</li>
              <li>• Natural Language Queries</li>
              <li>• Graceful Degradation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-slate-900">Run Engine</h3>
          <button 
            onClick={generateSamples}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
          >
            <Download className="w-4 h-4" /> Download Sample CSVs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Synthetic Auto-Run */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">1. Instant Synthetic Batch</h4>
            <p className="text-sm text-slate-500 mb-4">Automatically generate and reconcile 50 complex synthetic records with embedded exceptions in memory.</p>
            <button 
              onClick={() => onRun()}
              className="w-full bg-slate-100 text-slate-900 border border-slate-300 px-4 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Auto-Generate & Run
            </button>
          </div>

          {/* Custom Upload */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">2. Test with Custom CSVs</h4>
            <div className="grid grid-cols-2 gap-3">
              {(['invoices', 'payments', 'settlements', 'bank'] as const).map(type => (
                <div key={type} className="flex flex-col">
                  <label className={`border border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                    errors[type] ? 'border-red-500 bg-red-50 text-red-700' :
                    files[type] ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 
                    'border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-600'
                  }`}>
                    <Upload className={`w-4 h-4 mx-auto mb-1 ${errors[type] ? 'text-red-500' : 'opacity-60'}`} />
                    <span className="text-xs font-medium capitalize">{type}</span>
                    <input type="file" accept=".csv" className="hidden" onChange={e => handleFileChange(e, type)} />
                  </label>
                  {errors[type] && <span className="text-[10px] leading-tight text-red-600 mt-1 font-medium text-center">{errors[type]}</span>}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleClear}
                className="bg-white text-slate-700 border border-slate-300 px-4 py-3 rounded-lg font-medium hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm flex items-center justify-center gap-2"
                title="Clear Data"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleUpload}
                className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                Run Uploaded Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
