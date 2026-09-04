/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Formula Transparency Modal & Popovers
 * Shows "How was this calculated?" mathematical derivations and formulas.
 */

import React from 'react';
import { X, HelpCircle, Calculator, CheckCircle2, ChevronRight } from 'lucide-react';
import { ReconciliationResults, CompanyProfileConfig } from '../types';

export interface FormulaDetails {
  title: string;
  category: 'Reconciliation' | 'Cash & Treasury' | 'GST Compliance' | 'TDS Income Tax' | 'Settlement Ops';
  formulaString: string;
  variables: { name: string; value: string | number; description: string }[];
  resultString: string;
  notes?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  formulaKey: string | null;
  results: ReconciliationResults;
  config: CompanyProfileConfig;
}

export const FormulaModal: React.FC<Props> = ({ isOpen, onClose, formulaKey, results, config }) => {
  if (!isOpen || !formulaKey) return null;

  const getFormulaData = (key: string): FormulaDetails => {
    switch (key) {
      case 'batchSize':
        return {
          title: 'Batch Size (Reconciliation Denominator)',
          category: 'Reconciliation',
          formulaString: 'Batch Size = Count of unique primary invoice/payment records',
          variables: [
            { name: 'Unique Invoices', value: results.inputRowCounts.invoices, description: 'Direct sales invoice records' },
            { name: 'Standalone Payments', value: Math.max(0, results.kpis.batchSize - results.inputRowCounts.invoices), description: 'Payments without invoice key' },
            { name: 'Total Unique Denominator', value: results.kpis.batchSize, description: 'Selected primary denominator' },
          ],
          resultString: `${results.kpis.batchSize} unique primary transactions`,
          notes: 'Every primary transaction has exactly one final classification: Fully Matched, Partial Match, or Unmatched.',
        };

      case 'matchRate':
        return {
          title: 'Reconciliation Match Rate (%)',
          category: 'Reconciliation',
          formulaString: 'Match Rate (%) = (Fully Matched Transactions ÷ Batch Size) × 100',
          variables: [
            { name: 'Fully Matched', value: results.kpis.fullyMatched, description: '4-way clean linkage (Inv → Pay → Setl → Bank)' },
            { name: 'Batch Size (Denominator)', value: results.kpis.batchSize, description: 'Total unique primary transactions' },
          ],
          resultString: `(${results.kpis.fullyMatched} ÷ ${results.kpis.batchSize}) × 100 = ${results.kpis.matchRate.toFixed(1)}%`,
          notes: 'Matches require amount agreement within configured tolerance (₹' + config.amountMatchTolerance + ') with no unresolved exceptions.',
        };

      case 'exceptionRate':
        return {
          title: 'Exception Rate (%)',
          category: 'Reconciliation',
          formulaString: 'Exception Rate (%) = (Transactions with ≥1 Exception ÷ Batch Size) × 100',
          variables: [
            { name: 'Transactions with Exceptions', value: results.kpis.transactionsWithExceptions, description: 'Distinct transactions affected' },
            { name: 'Total Exception Items', value: results.kpis.totalExceptionItems, description: 'Aggregate exception count' },
            { name: 'Batch Size', value: results.kpis.batchSize, description: 'Denominator' },
          ],
          resultString: `(${results.kpis.transactionsWithExceptions} ÷ ${results.kpis.batchSize}) × 100 = ${results.kpis.exceptionRate.toFixed(1)}%`,
          notes: 'A single transaction may contain multiple exception items (e.g. MDR missing + timing delta), but it is counted once in the numerator.',
        };

      case 'autoResolutionRate':
        return {
          title: 'Auto-Resolution Rate (%)',
          category: 'Reconciliation',
          formulaString: 'Auto-Resolution Rate (%) = (Auto-Resolved Unique Transactions ÷ Batch Size) × 100',
          variables: [
            { name: 'Auto-Resolved Count', value: results.transactions.filter(t => t.actionRequired === 'auto_resolve').length, description: 'Passed deterministic rules without escalation' },
            { name: 'Batch Size', value: results.kpis.batchSize, description: 'Denominator' },
          ],
          resultString: `${results.kpis.autoResolutionRate.toFixed(1)}% of primary transactions auto-resolved`,
          notes: 'Auto-resolution is applied strictly to deterministic exact matches within tolerance.',
        };

      case 'expectedNetSettlement':
        return {
          title: 'Expected Net Settlement Formula',
          category: 'Settlement Ops',
          formulaString: 'Expected Net Settlement = Gross Payment − MDR Fee − GST on MDR (18%) − Refunds − Chargebacks − Adjustments',
          variables: [
            { name: 'Gross Payment', value: `₹${results.kpis.totalGrossPaymentValue.toLocaleString('en-IN')}`, description: 'Gross transaction amount' },
            { name: 'Configured GST Rate on MDR', value: `${config.standardGstRateOnGatewayFees}%`, description: 'Rule-based gateway tax rate' },
            { name: 'Total Expected Net Payout', value: `₹${results.kpis.totalExpectedNetSettlement.toLocaleString('en-IN')}`, description: 'Theoretical net expected in bank' },
            { name: 'Actual Gateway Settled', value: `₹${results.kpis.totalActualSettledValue.toLocaleString('en-IN')}`, description: 'Reported by aggregator batch' },
          ],
          resultString: `Expected: ₹${results.kpis.totalExpectedNetSettlement.toLocaleString('en-IN')} vs Actual Settled: ₹${results.kpis.totalActualSettledValue.toLocaleString('en-IN')}`,
          notes: 'If MDR or GST is missing in source records, Ledgerly surfaces "Not supplied" and flags Data_Quality_Issue rather than assuming zero.',
        };

      case 'cashPosition':
        return {
          title: 'Closing Cash Position & Treasury Formula',
          category: 'Cash & Treasury',
          formulaString: 'Closing Cash = Opening Cash Balance + Total Cash Inflows − Total Cash Outflows',
          variables: [
            { name: 'Opening Cash Balance', value: `₹${results.cashPosition.openingCashBalance.toLocaleString('en-IN')}`, description: 'Starting treasury position' },
            { name: 'Total Cash Inflows', value: `+ ₹${results.cashPosition.totalCashInflows.toLocaleString('en-IN')}`, description: 'Bank credited settlement deposits' },
            { name: 'Total Cash Outflows', value: `− ₹${results.cashPosition.totalCashOutflows.toLocaleString('en-IN')}`, description: 'Vendor disbursements & payroll' },
          ],
          resultString: `Closing Cash = ₹${results.cashPosition.closingCashPosition.toLocaleString('en-IN')}`,
          notes: 'Projected Ending Cash incorporates expected future receivables and payables.',
        };

      case 'cashRunway':
        return {
          title: 'Cash Runway Formula',
          category: 'Cash & Treasury',
          formulaString: 'Cash Runway (Months) = Available Closing Cash ÷ Average Monthly Cash Outflow',
          variables: [
            { name: 'Closing Cash Position', value: `₹${results.cashPosition.closingCashPosition.toLocaleString('en-IN')}`, description: 'Liquid cash in bank' },
            { name: 'Average Monthly Outflow', value: `₹${results.cashPosition.averageMonthlyCashOutflow.toLocaleString('en-IN')}`, description: 'Monthly operating burn' },
          ],
          resultString: results.cashPosition.cashRunwayMonths !== null
            ? `${results.cashPosition.cashRunwayMonths} Months of Operating Runway`
            : 'Runway not meaningful because average monthly outflow is zero or not positive.',
          notes: 'If average monthly outflow is zero or negative, the runway calculation is explicitly marked not meaningful.',
        };

      case 'gstVariance':
        return {
          title: 'Potential GST / ITC Variance Formula',
          category: 'GST Compliance',
          formulaString: 'Potential ITC Variance = ABS(Books Input Tax − GSTR-2B Input Tax)',
          variables: [
            { name: 'Books Input Tax Amount', value: `₹${results.gstScreening.booksInputTax.toLocaleString('en-IN')}`, description: 'Input GST recorded in purchase register' },
            { name: 'GSTR-2B Auto-Drafted ITC', value: `₹${results.gstScreening.gstr2bInputTax.toLocaleString('en-IN')}`, description: 'Statement downloaded from GSTN portal' },
            { name: 'Annual Turnover', value: `₹${config.aggregateAnnualTurnover.toLocaleString('en-IN')}`, description: 'Compared to GSTR-9 (₹2Cr) & GSTR-9C (₹5Cr)' },
          ],
          resultString: `Potential ITC Variance = ₹${results.gstScreening.potentialItcVariance.toLocaleString('en-IN')}`,
          notes: 'Ledgerly performs a prototype books-versus-statement comparison only. Final ITC eligibility depends on statutory conditions, vendor filing, and valid invoices.',
        };

      case 'tdsShortfall':
        return {
          title: 'TDS Section 392 Screening & Shortfall Formula',
          category: 'TDS Income Tax',
          formulaString: 'TDS Shortfall = (Applicable Taxable Base × Configured TDS Rate) − TDS Recorded in Books',
          variables: [
            { name: 'Professional Fees Base', value: `₹${results.tdsScreening.totalProfessionalPayments.toLocaleString('en-IN')}`, description: 'Sum of professional fee disbursements' },
            { name: 'Configured TDS Rate (Sec 392)', value: `${config.tdsProfessionalFeeRate}%`, description: 'Income-tax Act, 2025 screening rate' },
            { name: 'Required TDS', value: `₹${results.tdsScreening.potentialRequiredTds.toLocaleString('en-IN')}`, description: 'Expected withholding tax' },
            { name: 'TDS Recorded in Books', value: `₹${results.tdsScreening.tdsRecorded.toLocaleString('en-IN')}`, description: 'Actual withholding recorded' },
          ],
          resultString: results.tdsScreening.potentialShortfall <= 0
            ? 'No shortfall detected from supplied data.'
            : `Potential TDS Shortfall = ₹${results.tdsScreening.potentialShortfall.toLocaleString('en-IN')}`,
          notes: 'Under the Income-tax Act, 2025 (effective 1 April 2026), withholding provisions are consolidated under Sections 392/393 while retaining underlying rates.',
        };

      case 'settlementTiming':
        return {
          title: 'Settlement Timing Delta Screening Formula',
          category: 'Settlement Ops',
          formulaString: 'Settlement Timing Days = Settlement Date − Payment Date',
          variables: [
            { name: 'Configured Review Threshold', value: `${config.settlementTimingReviewThresholdDays} calendar day`, description: 'Alert threshold for timing differences' },
            { name: 'Average Settlement Days', value: `${results.settlementTiming.averageSettlementDays} days`, description: 'Average turnaround across batch' },
            { name: 'Timing Exceptions Flagged', value: results.settlementTiming.timingExceptionsCount, description: 'Batches exceeding threshold' },
          ],
          resultString: `${results.settlementTiming.withinThresholdCount} on-time, ${results.settlementTiming.timingExceptionsCount} timing exceptions flagged`,
          notes: 'Timing exceptions represent operational variances for merchant agreement review and are never automatically labeled an RBI violation.',
        };

      default:
        return {
          title: 'Financial Calculation Formula',
          category: 'Reconciliation',
          formulaString: 'Formula definition',
          variables: [],
          resultString: 'Calculation complete',
        };
    }
  };

  const data = getFormulaData(formulaKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div
        id="formula-transparency-modal"
        className="w-full max-w-2xl rounded-xl border border-stone-300 bg-[#FAF8F5] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-800">
                {data.category} • Transparency Proof
              </span>
              <h3 className="font-serif text-lg font-bold text-slate-900 leading-tight">
                {data.title}
              </h3>
            </div>
          </div>
          <button
            id="btn-close-formula-modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Mathematical Formula Box */}
          <div className="rounded-lg border border-stone-300 bg-white p-4 font-mono text-sm shadow-2xs">
            <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Mathematical Formula:
            </div>
            <div className="text-slate-900 font-bold bg-amber-50/60 p-2.5 rounded border border-amber-200/70 text-xs sm:text-sm overflow-x-auto">
              {data.formulaString}
            </div>
          </div>

          {/* Variables Table */}
          <div className="rounded-lg border border-stone-200 bg-white overflow-hidden shadow-2xs">
            <div className="border-b border-stone-200 bg-stone-100/70 px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-700">
              Underlying Batch Variables
            </div>
            <div className="divide-y divide-stone-100 text-xs">
              {data.variables.map((v, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-stone-50/80">
                  <div>
                    <div className="font-semibold text-slate-900">{v.name}</div>
                    <div className="text-stone-500 text-[11px]">{v.description}</div>
                  </div>
                  <div className="font-mono font-bold text-slate-900 bg-stone-100 px-2 py-1 rounded text-right">
                    {v.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Computed Result Box */}
          <div className="rounded-lg border border-emerald-300 bg-emerald-50/80 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" /> Computed Batch Value:
            </div>
            <div className="font-mono text-base font-bold text-emerald-950">
              {data.resultString}
            </div>
          </div>

          {data.notes && (
            <div className="rounded-lg bg-stone-100 p-3 text-xs leading-relaxed text-stone-600 border border-stone-200">
              <span className="font-semibold text-stone-800">Compliance & Audit Note: </span>
              {data.notes}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            id="btn-dismiss-formula"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Close Proof
          </button>
        </div>
      </div>
    </div>
  );
};
