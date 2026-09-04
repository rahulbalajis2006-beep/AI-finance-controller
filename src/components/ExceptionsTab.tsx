import React, { useState } from 'react';
import { ReconciliationResultsJSON, Exception } from '../types/finance';
import { Bot, RefreshCw } from 'lucide-react';

export default function ExceptionsTab({ results }: { results: ReconciliationResultsJSON | null }) {
  const [classifying, setClassifying] = useState<string | null>(null);
  const [exceptions, setExceptions] = useState<Exception[]>(results?.exceptions || []);

  // Sync state if results change
  React.useEffect(() => {
    if (results) setExceptions(results.exceptions);
  }, [results]);

  if (!results) {
    return <div className="text-slate-500">Run the controller to view exceptions.</div>;
  }

  const handleClassify = async (ex: Exception) => {
    setClassifying(ex.id);
    try {
      const res = await fetch('/api/classify-exception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exception: ex })
      });
      const data = await res.json();
      
      setExceptions(prev => prev.map(e => {
        if (e.id === ex.id) {
          return {
            ...e,
            probableCause: data.probableCause,
            recommendedAction: data.recommendedAction,
            reasoning: data.reasoning
          };
        }
        return e;
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setClassifying(null);
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'auto_resolve': return 'bg-emerald-100 text-emerald-800';
      case 'escalate': return 'bg-red-100 text-red-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Exception Inbox</h2>
        <div className="text-sm font-medium bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-100">
          {exceptions.length} Exceptions Detected
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Exception ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Transaction</th>
                <th className="px-4 py-3 text-right">Books Amt</th>
                <th className="px-4 py-3 text-right">Settled Amt</th>
                <th className="px-4 py-3 text-right text-red-600">Variance</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3 text-center">AI Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exceptions.map(ex => (
                <React.Fragment key={ex.id}>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{ex.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{ex.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{ex.transactionId}</td>
                    <td className="px-4 py-3 text-right">₹{ex.booksAmount.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                    <td className="px-4 py-3 text-right">₹{ex.settlementAmount.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">₹{ex.difference.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(ex.recommendedAction)}`}>
                        {ex.recommendedAction.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleClassify(ex)}
                        disabled={classifying === ex.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        {classifying === ex.id ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Bot className="w-3 h-3"/>}
                        Ask AI
                      </button>
                    </td>
                  </tr>
                  <tr className="bg-slate-50/30">
                    <td colSpan={8} className="px-4 py-3 border-b border-slate-100">
                      <div className="flex gap-4 text-xs">
                        <div className="flex-1">
                          <span className="font-semibold text-slate-700">Probable Cause:</span> <span className="text-slate-600">{ex.probableCause}</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-700">AI Reasoning:</span> <span className="text-slate-600">{ex.reasoning}</span>
                        </div>
                        <div className="w-24 text-right">
                          <span className="font-semibold text-slate-700">Confidence:</span> <span className="text-slate-600">{ex.confidence}%</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
              {exceptions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No exceptions found in this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
