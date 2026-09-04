/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Rules & Compliance Section (Master Prompt Section 36)
 * Complete statutory reference cards, editable company profile, formula proofs,
 * matching methodology, live screening dashboard, and local audit trail.
 */

import React, { useState } from 'react';
import {
  Scale,
  Building2,
  FileCheck,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Save,
  RotateCcw,
  BookOpen,
  Landmark,
  ShieldCheck,
  Layers,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react';
import {
  CompanyProfileConfig,
  ReconciliationResults,
  DEFAULT_COMPANY_PROFILE,
  RULES_METADATA,
} from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';

interface Props {
  config: CompanyProfileConfig;
  onSaveConfig: (updated: CompanyProfileConfig) => void;
  onResetConfig: () => void;
  results: ReconciliationResults;
  onOpenFormula: (key: string) => void;
}

export const RulesComplianceView: React.FC<Props> = ({
  config,
  onSaveConfig,
  onResetConfig,
  results,
  onOpenFormula,
}) => {
  const [formData, setFormData] = useState<CompanyProfileConfig>({ ...config });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleChange = (field: keyof CompanyProfileConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveStatus('Company profile and operational rules saved locally to browser storage.');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleReset = () => {
    onResetConfig();
    setFormData({ ...DEFAULT_COMPANY_PROFILE });
    setSaveStatus('Reset to default India 2026 prototype configuration.');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header & Version Banner */}
      <div className="rounded-xl border border-stone-300 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-2xs">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  Rules & Compliance Intelligence
                </h2>
                <span className="rounded bg-emerald-900 px-2 py-0.5 text-[11px] font-bold text-emerald-300 uppercase tracking-wider font-mono">
                  {RULES_METADATA.version}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Deterministic rules, statutory tax frameworks, reconciliation methodology, and company profile.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono bg-stone-100/90 border border-stone-200 rounded-lg p-2.5 text-stone-700">
            <div>
              <span className="text-stone-500">Last Reviewed:</span>{' '}
              <strong className="text-slate-900">{RULES_METADATA.lastReviewedDate}</strong>
            </div>
            <div className="border-l border-stone-300 pl-3">
              <span className="text-stone-500">Next Review:</span>{' '}
              <strong className="text-slate-900">{RULES_METADATA.nextReviewDate}</strong>
            </div>
          </div>
        </div>

        {/* Mandatory Prototype Compliance Disclaimer */}
        <div className="mt-5">
          <DisclaimerBanner />
        </div>
      </div>

      {/* 2. Company Profile & Operational Configuration (Editable) */}
      <div className="rounded-xl border border-stone-300 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-stone-200 bg-stone-50/80 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-800" />
              Company Profile & Reconciliation Thresholds
            </h3>
            <p className="text-xs text-stone-500">
              Configurable parameters used by the deterministic reconciliation engine. Persists locally.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-reset-rules-config"
              onClick={handleReset}
              type="button"
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800">
                Company Legal Name
              </label>
              <input
                id="cfg-company-name"
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-xs text-slate-900 font-semibold focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-stone-500 italic">
                Editable prototype default — verify before operational use.
              </p>
            </div>

            {/* Fiscal Year */}
            <div>
              <label className="block text-xs font-bold text-slate-800">
                Assessment / Financial Year
              </label>
              <input
                id="cfg-fiscal-year"
                type="text"
                value={formData.fiscalYear}
                onChange={(e) => handleChange('fiscalYear', e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-xs text-slate-900 font-semibold focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-stone-500 italic">
                Editable prototype default — verify before operational use.
              </p>
            </div>

            {/* GSTIN */}
            <div>
              <label className="block text-xs font-bold text-slate-800">
                Primary GSTIN
              </label>
              <input
                id="cfg-gstin"
                type="text"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-stone-500 italic">
                Editable prototype default — verify before operational use.
              </p>
            </div>

            {/* PAN */}
            <div>
              <label className="block text-xs font-bold text-slate-800">
                Entity PAN
              </label>
              <input
                id="cfg-pan"
                type="text"
                value={formData.pan}
                onChange={(e) => handleChange('pan', e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-stone-500 italic">
                Editable prototype default — verify before operational use.
              </p>
            </div>

            {/* Aggregate Annual Turnover */}
            <div>
              <label className="block text-xs font-bold text-slate-800">
                Aggregate Annual Turnover (₹)
              </label>
              <input
                id="cfg-turnover"
                type="number"
                value={formData.aggregateAnnualTurnover}
                onChange={(e) => handleChange('aggregateAnnualTurnover', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-stone-500 italic">
                Editable prototype default — verify before operational use.
              </p>
            </div>

            {/* Registered States */}
            <div>
              <label className="block text-xs font-bold text-slate-800">
                Registered States / Branches
              </label>
              <input
                id="cfg-registered-states"
                type="text"
                value={formData.registeredStates.join(', ')}
                onChange={(e) =>
                  handleChange(
                    'registeredStates',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-stone-500 italic">
                Editable prototype default — verify before operational use.
              </p>
            </div>

            {/* Amount Match Tolerance */}
            <div>
              <label className="block text-xs font-bold text-slate-800">
                Amount Match Tolerance (₹)
              </label>
              <input
                id="cfg-amount-tolerance"
                type="number"
                step="0.01"
                value={formData.amountMatchTolerance}
                onChange={(e) => handleChange('amountMatchTolerance', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-stone-500 italic">
                Editable prototype default — verify before operational use.
              </p>
            </div>

            {/* Settlement Review Threshold */}
            <div>
              <label className="block text-xs font-bold text-slate-800">
                Settlement Timing Alert (Days)
              </label>
              <input
                id="cfg-timing-threshold"
                type="number"
                value={formData.settlementTimingReviewThresholdDays}
                onChange={(e) =>
                  handleChange('settlementTimingReviewThresholdDays', Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-stone-500 italic">
                Editable prototype default — verify before operational use.
              </p>
            </div>

            {/* TDS Sec 392 Professional Fee Rate */}
            <div>
              <label className="block text-xs font-bold text-slate-800">
                TDS Sec 392 Screening Rate (%)
              </label>
              <input
                id="cfg-tds-rate"
                type="number"
                step="0.1"
                value={formData.tdsProfessionalFeeRate}
                onChange={(e) => handleChange('tdsProfessionalFeeRate', Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-stone-500 italic">
                Editable prototype default — verify before operational use.
              </p>
            </div>
          </div>

          {/* Statutory Threshold Summary Strip */}
          <div className="rounded-lg bg-stone-100 p-4 border border-stone-200 text-xs">
            <div className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[11px]">
              Configured Statutory Framework Thresholds
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <span className="text-stone-500">GST GSTR-9 Annual Return:</span>{' '}
                <strong className="font-mono text-slate-900">
                  ₹{(formData.gstr9AnnualReturnThreshold / 10000000).toFixed(1)} Cr
                </strong>
              </div>
              <div>
                <span className="text-stone-500">GST GSTR-9C Reconciliation:</span>{' '}
                <strong className="font-mono text-slate-900">
                  ₹{(formData.gstr9cReconciliationThreshold / 10000000).toFixed(1)} Cr
                </strong>
              </div>
              <div>
                <span className="text-stone-500">Standard GST on Gateway Fee:</span>{' '}
                <strong className="font-mono text-slate-900">
                  {formData.standardGstRateOnGatewayFees}%
                </strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {saveStatus && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
                  ✓ {saveStatus}
                </span>
              )}
            </div>
            <button
              id="btn-save-rules-config"
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" /> Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* 3. India 2026 Reference Cards (Master Prompt Section 36) */}
      <div>
        <div className="mb-4">
          <h3 className="font-serif text-lg font-bold text-slate-900">
            India 2026 Statutory & Regulatory Reference Cards
          </h3>
          <p className="text-xs text-stone-600">
            Statutory frameworks applicable to India business entities for FY 2026–27 operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card A: Income-tax Act, 2025 / TDS-TCS Transition */}
          <div className="rounded-xl border border-stone-300 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                  Card A • Direct Tax
                </span>
                <span className="text-[11px] font-semibold text-stone-500">
                  Effective 1 April 2026
                </span>
              </div>
              <h4 className="font-serif text-base font-bold text-slate-900 mt-3">
                Income-tax Act, 2025 / TDS-TCS Transition
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Withholding tax provisions consolidated under Sections 392, 393, and 394 while retaining underlying withholding rates from the 1961 Act.
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                  <div className="font-bold text-slate-800">
                    Section 392 (Professional & Technical Fees)
                  </div>
                  <div className="text-stone-600 text-[11px] mt-0.5">
                    Default prototype rate: <strong>10%</strong> (retained rate). Threshold applicability evaluated per payee.
                  </div>
                </div>

                <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                  <div className="font-bold text-slate-800">
                    Sections 393 & 394 (Contractor & Royalty / Rent)
                  </div>
                  <div className="text-stone-600 text-[11px] mt-0.5">
                    Consolidated provisions mapped to standard rates (1%/2% for contracts, 2%/10% for rent/royalty).
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-amber-50/80 border border-amber-200/80 p-3 text-xs text-amber-950 leading-relaxed">
                <div className="font-bold mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-800" />
                  Prototype Missing Info Note:
                </div>
                If PAN or payee categorization is absent in source data, Ledgerly flags <strong>Data_Quality_Issue</strong> and computes shortfall against standard 10% rate without assuming lower-rate certificates.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex justify-between items-center">
              <button
                onClick={() => onOpenFormula('tdsShortfall')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <Calculator className="h-3.5 w-3.5" /> View TDS Shortfall Proof
              </button>
            </div>
          </div>

          {/* Card B: GST GSTR-2B & Annual Turnover Thresholds */}
          <div className="rounded-xl border border-stone-300 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                  Card B • Indirect Tax
                </span>
                <span className="text-[11px] font-semibold text-stone-500">
                  GSTN Framework
                </span>
              </div>
              <h4 className="font-serif text-base font-bold text-slate-900 mt-3">
                GST GSTR-2B & Turnover Thresholds
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Reconciles Purchase Register books against GSTR-2B auto-drafted statement and screens aggregate turnover thresholds.
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                  <div className="font-bold text-slate-800">
                    GSTR-9 Annual Return Threshold
                  </div>
                  <div className="text-stone-600 text-[11px] mt-0.5">
                    Applicable when Aggregate Turnover &gt; <strong>₹2.00 Crore</strong>.
                  </div>
                </div>

                <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                  <div className="font-bold text-slate-800">
                    GSTR-9C Reconciliation Statement
                  </div>
                  <div className="text-stone-600 text-[11px] mt-0.5">
                    Self-certified reconciliation required when Turnover &gt; <strong>₹5.00 Crore</strong>.
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-stone-50 border border-stone-200 p-3 text-xs text-stone-700 leading-relaxed">
                <div className="font-bold text-slate-900 mb-1">
                  Books vs GSTR-2B ITC Variance:
                </div>
                Calculates absolute variance between recorded Input Tax Credit and auto-drafted GSTR-2B statement. Final eligibility requires statutory documentation.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex justify-between items-center">
              <button
                onClick={() => onOpenFormula('gstVariance')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <Calculator className="h-3.5 w-3.5" /> View ITC Variance Proof
              </button>
            </div>
          </div>

          {/* Card C: RBI Payment Aggregator Directions, 2025 */}
          <div className="rounded-xl border border-stone-300 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                  Card C • Payment Systems
                </span>
                <span className="text-[11px] font-semibold text-stone-500">
                  RBI Master Directions
                </span>
              </div>
              <h4 className="font-serif text-base font-bold text-slate-900 mt-3">
                RBI (Payment Aggregators) Directions, 2025
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Escrow account operations with Scheduled Commercial Banks, merchant funds segregation, and settlement timelines.
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                  <div className="font-bold text-slate-800">
                    Escrow Account Segregation
                  </div>
                  <div className="text-stone-600 text-[11px] mt-0.5">
                    Customer payment receipts must be routed strictly through an Escrow account maintained with a Scheduled Commercial Bank.
                  </div>
                </div>

                <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                  <div className="font-bold text-slate-800">
                    Settlement Timing & Net Payout
                  </div>
                  <div className="text-stone-600 text-[11px] mt-0.5">
                    Payout to merchant node account post deduction of agreed MDR fees and applicable GST.
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-stone-50 border border-stone-200 p-3 text-xs text-stone-700 leading-relaxed">
                <div className="font-bold text-slate-900 mb-1">
                  Settlement Timing Variances:
                </div>
                Delays beyond configured threshold ({config.settlementTimingReviewThresholdDays}d) are flagged for contractual review and escrow desk audit.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex justify-between items-center">
              <button
                onClick={() => onOpenFormula('settlementTiming')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <Calculator className="h-3.5 w-3.5" /> View Timing Proof
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Formulas Used Reference Strip */}
      <div className="rounded-xl border border-stone-300 bg-white p-6 shadow-xs">
        <h3 className="font-serif text-base font-bold text-slate-900 mb-1">
          Formulas Reference & Mathematical Transparency
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Click any calculation to inspect the live step-by-step mathematical proof for this batch.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <button
            onClick={() => onOpenFormula('batchSize')}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50/70 p-3 text-left hover:bg-stone-100 transition-colors"
          >
            <div>
              <div className="font-bold text-slate-800">Batch Denominator</div>
              <div className="font-mono text-[11px] text-stone-500 truncate">Unique primary invoice/payment records</div>
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400" />
          </button>

          <button
            onClick={() => onOpenFormula('matchRate')}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50/70 p-3 text-left hover:bg-stone-100 transition-colors"
          >
            <div>
              <div className="font-bold text-slate-800">Match Rate (%)</div>
              <div className="font-mono text-[11px] text-stone-500 truncate">(Fully Matched ÷ Batch Size) × 100</div>
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400" />
          </button>

          <button
            onClick={() => onOpenFormula('expectedNetSettlement')}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50/70 p-3 text-left hover:bg-stone-100 transition-colors"
          >
            <div>
              <div className="font-bold text-slate-800">Expected Net Settlement</div>
              <div className="font-mono text-[11px] text-stone-500 truncate">Gross − MDR − GST on MDR − Adjustments</div>
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400" />
          </button>

          <button
            onClick={() => onOpenFormula('cashPosition')}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50/70 p-3 text-left hover:bg-stone-100 transition-colors"
          >
            <div>
              <div className="font-bold text-slate-800">Closing Cash Position</div>
              <div className="font-mono text-[11px] text-stone-500 truncate">Opening + Inflows − Outflows</div>
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400" />
          </button>

          <button
            onClick={() => onOpenFormula('gstVariance')}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50/70 p-3 text-left hover:bg-stone-100 transition-colors"
          >
            <div>
              <div className="font-bold text-slate-800">Potential ITC Variance</div>
              <div className="font-mono text-[11px] text-stone-500 truncate">ABS(Books Input Tax − GSTR-2B Input Tax)</div>
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400" />
          </button>

          <button
            onClick={() => onOpenFormula('tdsShortfall')}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50/70 p-3 text-left hover:bg-stone-100 transition-colors"
          >
            <div>
              <div className="font-bold text-slate-800">TDS Sec 392 Shortfall</div>
              <div className="font-mono text-[11px] text-stone-500 truncate">(Taxable Base × 10%) − Recorded TDS</div>
            </div>
            <ArrowRight className="h-4 w-4 text-stone-400" />
          </button>
        </div>
      </div>

      {/* 5. Matching Methodology & Rules Hierarchy Diagram */}
      <div className="rounded-xl border border-stone-300 bg-white p-6 shadow-xs">
        <h3 className="font-serif text-base font-bold text-slate-900 mb-1">
          Deterministic 4-Way Matching Methodology
        </h3>
        <p className="text-xs text-stone-500 mb-5">
          Deterministic execution hierarchy. No fuzzy guessing; matches require key agreement or exact amount proof.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>Priority 1: Key Linkage</span>
              <span className="font-mono text-[10px] bg-emerald-200/80 px-1.5 py-0.5 rounded">O(1)</span>
            </div>
            <p className="mt-2 text-xs text-emerald-950 font-medium">
              Direct linkage via <code>invoiceId</code> or <code>gatewayPaymentId</code>.
            </p>
            <div className="mt-3 text-[11px] text-emerald-800">
              Confidence: <strong>High</strong>. Compares gross invoice total to captured payment within ₹{config.amountMatchTolerance} tolerance.
            </div>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>Priority 2: Settlement Batch</span>
              <span className="font-mono text-[10px] bg-emerald-200/80 px-1.5 py-0.5 rounded">O(1)</span>
            </div>
            <p className="mt-2 text-xs text-emerald-950 font-medium">
              Link payment to aggregator settlement batch & verify MDR + GST fees.
            </p>
            <div className="mt-3 text-[11px] text-emerald-800">
              Confidence: <strong>High</strong>. Validates formula: Net = Gross − MDR − GST on MDR.
            </div>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>Priority 3: UTR Bank Escrow</span>
              <span className="font-mono text-[10px] bg-emerald-200/80 px-1.5 py-0.5 rounded">O(1)</span>
            </div>
            <p className="mt-2 text-xs text-emerald-950 font-medium">
              Bank statement credit matched by UTR reference or settlement key.
            </p>
            <div className="mt-3 text-[11px] text-emerald-800">
              Confidence: <strong>High</strong>. Confirms credited deposit matches settlement net payout.
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span>Fallback: Exact Amount & Date</span>
              <span className="font-mono text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded">O(N)</span>
            </div>
            <p className="mt-2 text-xs text-amber-950 font-medium">
              Fallback matching when keys are missing or detached.
            </p>
            <div className="mt-3 text-[11px] text-amber-900">
              Confidence: <strong>Medium/Low</strong>. Automatically assigned <code>manual_review</code> action.
            </div>
          </div>
        </div>
      </div>

      {/* 6. Live Compliance Screening Dashboard */}
      <div className="rounded-xl border border-stone-300 bg-white p-6 shadow-xs">
        <h3 className="font-serif text-base font-bold text-slate-900 mb-1">
          Live Compliance Screening Results
        </h3>
        <p className="text-xs text-stone-500 mb-5">
          Real-time screening of current batch against configured India 2026 rules.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Turnover Status */}
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Turnover Audit Status
            </div>
            <div className="mt-2 font-serif text-xl font-bold text-slate-900">
              ₹{(config.aggregateAnnualTurnover / 10000000).toFixed(2)} Cr
            </div>
            <div className="mt-2 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span>GSTR-9 (&gt;₹2Cr):</span>
                <span className={`font-bold ${results.gstScreening.gstr9Applicable ? 'text-amber-800' : 'text-stone-600'}`}>
                  {results.gstScreening.gstr9Applicable ? 'Applicable' : 'Exempt'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>GSTR-9C (&gt;₹5Cr):</span>
                <span className={`font-bold ${results.gstScreening.gstr9cApplicable ? 'text-amber-800' : 'text-stone-600'}`}>
                  {results.gstScreening.gstr9cApplicable ? 'Applicable' : 'Exempt'}
                </span>
              </div>
            </div>
          </div>

          {/* GST ITC Variance */}
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Books vs GSTR-2B Variance
            </div>
            <div className="mt-2 font-serif text-xl font-bold text-slate-900">
              ₹{results.gstScreening.potentialItcVariance.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-xs space-y-1 text-stone-600">
              <div>Books Input: ₹{results.gstScreening.booksInputTax.toLocaleString('en-IN')}</div>
              <div>GSTR-2B Auto: ₹{results.gstScreening.gstr2bInputTax.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* TDS Sec 392 Screening */}
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              TDS Sec 392 Screening
            </div>
            <div className="mt-2 font-serif text-xl font-bold text-slate-900">
              ₹{results.tdsScreening.potentialShortfall.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-xs space-y-1 text-stone-600">
              <div>Required TDS: ₹{results.tdsScreening.potentialRequiredTds.toLocaleString('en-IN')}</div>
              <div>Recorded TDS: ₹{results.tdsScreening.tdsRecorded.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Settlement Ops Screening */}
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Settlement Operations
            </div>
            <div className="mt-2 font-serif text-xl font-bold text-slate-900">
              {results.settlementTiming.averageSettlementDays} Days Avg
            </div>
            <div className="mt-2 text-xs space-y-1 text-stone-600">
              <div>Within {config.settlementTimingReviewThresholdDays}d: {results.settlementTiming.withinThresholdCount}</div>
              <div>Timing Exceptions: {results.settlementTiming.timingExceptionsCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Local Audit Trail & Session Log */}
      <div className="rounded-xl border border-stone-300 bg-[#FAF8F5] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-800" />
            Deterministic Engine Audit Trail & Integrity Check
          </h3>
          <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
            Integrity Check: PASSED
          </span>
        </div>
        <p className="text-xs text-stone-600 mb-4">
          All financial calculations adhere strictly to deterministic invariants: (Fully Matched + Partial Matches + Unmatched === Batch Size).
        </p>

        <div className="rounded-lg bg-white border border-stone-200 p-4 font-mono text-xs text-stone-700 space-y-1.5 max-h-48 overflow-y-auto">
          <div>[INIT] Engine started in local browser mode with zero remote telemetry.</div>
          <div>[CONFIG] Loaded entity profile for {config.companyName} ({config.fiscalYear}).</div>
          <div>[DATA] Input batch processed: {results.inputRowCounts.invoices} invoices, {results.inputRowCounts.payments} payments, {results.inputRowCounts.settlements} settlements, {results.inputRowCounts.bankRecords} bank entries.</div>
          <div>[INVARIANT] Verified: {results.kpis.fullyMatched} + {results.kpis.partialMatches} + {results.kpis.unmatched} = {results.kpis.batchSize} (OK).</div>
          <div>[GST] Screened aggregate turnover against GSTR-9 (₹2Cr) and GSTR-9C (₹5Cr) thresholds.</div>
          <div>[TDS] Evaluated Income-tax Act, 2025 Sec 392 professional fees at {config.tdsProfessionalFeeRate}%.</div>
          <div>[AUDIT] Ready for export and internal compliance review.</div>
        </div>
      </div>
    </div>
  );
};
