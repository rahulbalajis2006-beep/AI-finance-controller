/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cash & Settlement Intelligence View
 * Treasury runway, cash position, Expected Net Settlement fee analysis, and settlement timing days distribution.
 */

import React from 'react';
import {
  Wallet,
  Building2,
  TrendingUp,
  Clock,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { ReconciliationResults, CompanyProfileConfig } from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';

interface Props {
  results: ReconciliationResults;
  config: CompanyProfileConfig;
  onOpenFormula: (key: string) => void;
}

export const CashSettlementView: React.FC<Props> = ({
  results,
  config,
  onOpenFormula,
}) => {
  const { cashPosition, settlementTiming, kpis } = results;

  return (
    <div className="space-y-6 pb-12">
      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Header Strip */}
      <div className="rounded-xl border border-stone-300 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Cash, Treasury & Settlement Intelligence
              </h2>
              <p className="text-xs text-stone-600">
                Live cash runway, expected net payout breakdown, and gateway settlement turnaround.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Treasury Balance Sheet & Runway */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Closing Cash Position */}
        <div className="rounded-xl border border-stone-300 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600 border-b border-stone-100 pb-3">
            <span>Treasury Balance Sheet</span>
            <button
              onClick={() => onOpenFormula('cashPosition')}
              className="text-stone-400 hover:text-stone-800 p-0.5 rounded"
              title="View cash formula"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">Opening Cash Balance:</span>
              <span className="font-mono font-semibold text-slate-900">
                ₹{cashPosition.openingCashBalance.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-emerald-800 font-medium">
              <span>+ Total Cash Inflows:</span>
              <span className="font-mono font-bold">
                + ₹{cashPosition.totalCashInflows.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-rose-800 font-medium">
              <span>− Total Cash Outflows:</span>
              <span className="font-mono font-bold">
                − ₹{cashPosition.totalCashOutflows.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-sm">Closing Cash:</span>
              <span className="font-serif text-xl font-bold text-emerald-950 font-mono">
                ₹{cashPosition.closingCashPosition.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Operating Cash Runway */}
        <div className="rounded-xl border border-stone-300 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600 border-b border-stone-100 pb-3">
              <span>Runway Intelligence</span>
              <button
                onClick={() => onOpenFormula('cashRunway')}
                className="text-stone-400 hover:text-stone-800 p-0.5 rounded"
                title="View runway formula"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-4">
              <div className="text-xs text-stone-500">Estimated Operating Runway:</div>
              <div className="mt-1 font-serif text-3xl font-bold text-slate-900">
                {cashPosition.cashRunwayMonths !== null
                  ? `${cashPosition.cashRunwayMonths} Months`
                  : 'Not meaningful'}
              </div>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Based on average monthly operating outflow of{' '}
                <strong className="font-mono text-slate-900">
                  ₹{cashPosition.averageMonthlyCashOutflow.toLocaleString('en-IN')}
                </strong>
                .
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-stone-50 rounded border border-stone-200 text-[11px] text-stone-600">
            Formula: Available Closing Cash ÷ Average Monthly Outflow.
          </div>
        </div>

        {/* Card 3: Projected Ending Cash */}
        <div className="rounded-xl border border-stone-300 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600 border-b border-stone-100 pb-3">
              <span>Forward Treasury Projection</span>
              <TrendingUp className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Expected Receivables (7d):</span>
                <span className="font-mono font-semibold text-emerald-800">
                  + ₹{cashPosition.expectedFutureReceivables.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Scheduled Payables (7d):</span>
                <span className="font-mono font-semibold text-rose-800">
                  − ₹{cashPosition.expectedFuturePayables.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">Projected Ending:</span>
                <span className="font-serif text-xl font-bold text-slate-900 font-mono">
                  ₹{cashPosition.projectedEndingCash.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-50/70 rounded border border-emerald-200 text-[11px] text-emerald-950 font-medium">
            Positive liquidity cushion maintaining working capital requirements.
          </div>
        </div>
      </div>

      {/* Expected Net Settlement Fee Analysis */}
      <div className="rounded-xl border border-stone-300 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-800" />
              Expected Net Settlement & Aggregator Fee Proof
            </h3>
            <p className="text-xs text-stone-500">
              Audit proof comparing gross captured transaction value against actual net settled payouts.
            </p>
          </div>
          <button
            onClick={() => onOpenFormula('expectedNetSettlement')}
            className="rounded-lg bg-stone-100 hover:bg-stone-200 px-3 py-1.5 text-xs font-semibold text-slate-800 border border-stone-200 flex items-center gap-1"
          >
            <HelpCircle className="h-3.5 w-3.5" /> View Math Proof
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
            <div className="text-xs font-semibold text-stone-500">Total Gross Captured</div>
            <div className="mt-1 font-serif text-xl font-bold text-slate-900 font-mono">
              ₹{kpis.totalGrossPaymentValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Sum of gross payments</div>
          </div>

          <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
            <div className="text-xs font-semibold text-stone-500">Theoretical Net Expected</div>
            <div className="mt-1 font-serif text-xl font-bold text-emerald-900 font-mono">
              ₹{kpis.totalExpectedNetSettlement.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Post MDR & 18% GST deductions</div>
          </div>

          <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
            <div className="text-xs font-semibold text-stone-500">Actual Gateway Settled</div>
            <div className="mt-1 font-serif text-xl font-bold text-slate-900 font-mono">
              ₹{kpis.totalActualSettledValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Reported in settlement batch</div>
          </div>

          <div className="p-4 rounded-lg bg-rose-50/60 border border-rose-200">
            <div className="text-xs font-semibold text-rose-900">Total Escrow / Bank Variance</div>
            <div className="mt-1 font-serif text-xl font-bold text-rose-950 font-mono">
              ₹{kpis.totalVarianceRequiringReview.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-rose-800 mt-1 font-medium">Pending or disputed payouts</div>
          </div>
        </div>
      </div>

      {/* Settlement Timing Turnaround Distribution */}
      <div className="rounded-xl border border-stone-300 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-800" />
              Settlement Turnaround Timing Distribution
            </h3>
            <p className="text-xs text-stone-500">
              Days elapsed between payment capture and settlement batch creation.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded">
            Average: {settlementTiming.averageSettlementDays} Days
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/40">
            <div className="text-xs font-bold text-emerald-900">Same-Day (T+0)</div>
            <div className="mt-1 font-serif text-2xl font-bold text-emerald-950">
              {settlementTiming.timingDistribution['T+0'] || 0}
            </div>
            <div className="text-[11px] text-emerald-800 font-medium">Instant / same-day batches</div>
          </div>

          <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/40">
            <div className="text-xs font-bold text-emerald-900">Next-Day (T+1 Standard)</div>
            <div className="mt-1 font-serif text-2xl font-bold text-emerald-950">
              {settlementTiming.timingDistribution['T+1'] || 0}
            </div>
            <div className="text-[11px] text-emerald-800 font-medium">Standard merchant cycle</div>
          </div>

          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/40">
            <div className="text-xs font-bold text-amber-950">Two Days (T+2)</div>
            <div className="mt-1 font-serif text-2xl font-bold text-amber-950">
              {settlementTiming.timingDistribution['T+2'] || 0}
            </div>
            <div className="text-[11px] text-amber-900">Weekend / bank holiday timing</div>
          </div>

          <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/40">
            <div className="text-xs font-bold text-rose-950">Lagged (&gt;T+2 Days)</div>
            <div className="mt-1 font-serif text-2xl font-bold text-rose-950">
              {settlementTiming.timingDistribution['>T+2'] || 0}
            </div>
            <div className="text-[11px] text-rose-900 font-medium">Flagged for escrow review</div>
          </div>
        </div>
      </div>
    </div>
  );
};
