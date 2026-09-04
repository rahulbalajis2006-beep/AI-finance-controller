import React from 'react';
import { ReconciliationResultsJSON } from '../types/finance';
import { TrendingUp, Calculator } from 'lucide-react';

export default function CashPositionTab({ results }: { results: ReconciliationResultsJSON | null }) {
  if (!results) {
    return <div className="text-slate-500">Run the controller to view cash position.</div>;
  }

  const { cash_position: cash } = results;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Treasury & Cash Forecasting</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5"><TrendingUp className="w-24 h-24"/></div>
          <div className="text-sm font-medium text-slate-500 mb-2">Current Closing Balance</div>
          <div className="text-4xl font-bold text-slate-900 mb-2">
            ₹{cash.closingBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </div>
          <p className="text-xs text-slate-500">Calculated deterministically: Opening + Total Inflows - Total Outflows</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5"><Calculator className="w-24 h-24"/></div>
          <div className="text-sm font-medium text-slate-500 mb-2">Projected 7-Day Balance</div>
          <div className="text-4xl font-bold text-indigo-700 mb-2">
            ₹{cash.projected7DayBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </div>
          <p className="text-xs text-slate-500">Based on trailing 30-day inflow velocity averages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Estimated GST Payable</h3>
          <div className="text-2xl font-bold text-slate-800">
            ₹{cash.gstPayable.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </div>
          <p className="text-xs text-slate-500 mt-2">Provision based on 18% of deterministically matched inflows.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Estimated TDS Payable</h3>
          <div className="text-2xl font-bold text-slate-800">
            ₹{cash.tdsPayable.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </div>
          <p className="text-xs text-slate-500 mt-2">Provision based on 10% of total deterministic outflows.</p>
        </div>
      </div>
    </div>
  );
}
