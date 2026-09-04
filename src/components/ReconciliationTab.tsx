import React from 'react';
import { ReconciliationResultsJSON } from '../types/finance';
import { CheckCircle2, AlertCircle, XCircle, Download } from 'lucide-react';

export default function ReconciliationTab({ results }: { results: ReconciliationResultsJSON | null }) {
  if (!results) {
    return <div className="text-slate-500">Run the controller to view reconciliation results.</div>;
  }

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `reconciliation_results_${results.batch_id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">4-Way Reconciliation Match</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">Processed: {new Date(results.processing_timestamp).toLocaleString()}</div>
          <button
            onClick={downloadJson}
            className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Total Transactions</div>
          <div className="text-3xl font-bold text-slate-900">{results.total_transactions}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Fully Matched</div>
          <div className="text-3xl font-bold text-emerald-700">{results.fully_matched}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-amber-600 mb-1 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Partially Matched</div>
          <div className="text-3xl font-bold text-amber-700">{results.partially_matched}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-red-600 mb-1 flex items-center gap-1"><XCircle className="w-4 h-4"/> Unmatched</div>
          <div className="text-3xl font-bold text-red-700">{results.unmatched}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-6">
         <h3 className="text-lg font-semibold text-slate-900 mb-4">Compliance & Monitoring Flags</h3>
         <div className="space-y-3">
           <div className="flex justify-between items-center py-2 border-b border-slate-100">
             <span className="text-slate-600 font-medium">RBI Settlement Timing</span>
             <span className="text-slate-800">{results.compliance_flags.rbiSettlement}</span>
           </div>
           <div className="flex justify-between items-center py-2 border-b border-slate-100">
             <span className="text-slate-600 font-medium">GST Monitoring Thresholds</span>
             <span className="text-slate-800">{results.compliance_flags.gstMonitoring}</span>
           </div>
           <div className="flex justify-between items-center py-2 border-b border-slate-100">
             <span className="text-slate-600 font-medium">GSTR-2B vs Books</span>
             <span className="text-slate-800">{results.compliance_flags.gstr2b}</span>
           </div>
           <div className="flex justify-between items-center py-2 border-b border-slate-100">
             <span className="text-slate-600 font-medium">TDS/TCS Screening</span>
             <span className="text-slate-800">{results.compliance_flags.tdsTcs}</span>
           </div>
           <div className="pt-2 text-xs text-slate-400 italic text-right">
             {results.compliance_flags.disclaimer}
           </div>
         </div>
      </div>
    </div>
  );
}
