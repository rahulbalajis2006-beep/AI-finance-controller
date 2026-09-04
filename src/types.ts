/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Ledgerly — AI Finance Controller (Local-First India Finance Operations)
 * Core Type Definitions & Schemas
 */

export type ExceptionType =
  | 'Amount_Mismatch'
  | 'Missing_in_Payment'
  | 'Missing_in_Settlement'
  | 'Missing_in_Bank'
  | 'Duplicate'
  | 'Timing_Difference'
  | 'Partial_Match'
  | 'Data_Quality_Issue'
  | 'Potential_GST_ITC_Variance'
  | 'Potential_TDS_Shortfall';

export type ActionClassification = 'auto_resolve' | 'manual_review' | 'escalate';

export type DeterministicConfidence = 'High' | 'Medium' | 'Low';

export type ReconciliationStatus = 'Fully_Matched' | 'Partial_Match' | 'Unmatched';

export interface CompanyProfileConfig {
  companyName: string;
  financialYearStartDate: string;
  gstRegistrationStatus: 'Registered' | 'Unregistered' | 'Unknown';
  gstin?: string;
  pan?: string;
  registeredStates?: string[];
  aggregateAnnualTurnover: number;
  gstr9Threshold: number;
  gstr9cThreshold: number;
  gstr9AnnualReturnThreshold: number;
  gstr9cReconciliationThreshold: number;
  standardGstRateOnGatewayFees: number; // e.g. 18 for 18%
  tdsProfessionalFeeRate: number; // e.g. 10 for 10%
  tdsContractorRate: number; // e.g. 2 for 2%
  amountMatchTolerance: number; // e.g. 1.00 INR
  settlementTimingReviewThresholdDays: number; // e.g. 1 calendar day
  materialityThreshold: number; // e.g. 10,000 INR
  fiscalYear: string; // e.g. "Tax Year 2026–27"
  lastRulesReviewDate: string; // e.g. "2026-08-15"
  rulesSourceUrl: string;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfileConfig = {
  companyName: 'FinNova Technologies Pvt Ltd',
  financialYearStartDate: '2026-04-01',
  gstRegistrationStatus: 'Registered',
  gstin: '29ABCDE1234F1Z5',
  pan: 'ABCDE1234F',
  registeredStates: ['Karnataka', 'Maharashtra', 'Delhi'],
  aggregateAnnualTurnover: 35000000, // ₹3.50 Cr
  gstr9Threshold: 20000000, // ₹2.00 Cr
  gstr9cThreshold: 50000000, // ₹5.00 Cr
  gstr9AnnualReturnThreshold: 20000000, // ₹2.00 Cr
  gstr9cReconciliationThreshold: 50000000, // ₹5.00 Cr
  standardGstRateOnGatewayFees: 18, // 18%
  tdsProfessionalFeeRate: 10, // 10%
  tdsContractorRate: 2, // 2%
  amountMatchTolerance: 1.0, // ₹1.00 tolerance
  settlementTimingReviewThresholdDays: 1, // 1 calendar day
  materialityThreshold: 10000, // ₹10,000
  fiscalYear: 'Tax Year 2026–27',
  lastRulesReviewDate: '2026-03-01',
  rulesSourceUrl: 'https://incometax.gov.in/rules2025/sec392',
};

export const RULES_METADATA = {
  version: 'India Finance Operations Rules v1.0 — Buildathon Prototype',
  lastReviewedDate: '2026-03-01',
  nextReviewDate: '2026-06-01',
};

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerGstin?: string;
  date: string;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  status?: string;
  raw?: Record<string, any>;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  gatewayPaymentId: string;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'Other';
  date: string;
  grossAmount: number;
  currency: string;
  customerEmail?: string;
  customerPhone?: string;
  status: 'captured' | 'failed' | 'refunded' | 'authorized';
  raw?: Record<string, any>;
}

export interface SettlementRecord {
  id: string;
  paymentId: string;
  settlementBatchId: string;
  date: string;
  grossAmount: number;
  mdrFee: number | null; // null if not supplied
  gstOnMdr: number | null; // null if not supplied
  refundDeductions: number;
  chargebackDeductions: number;
  adjustments: number;
  netSettlementAmount: number;
  utrNumber?: string;
  status: 'settled' | 'pending' | 'failed';
  raw?: Record<string, any>;
}

export interface BankRecord {
  id: string;
  settlementId?: string;
  utrNumber?: string;
  date: string;
  bankName: string;
  accountNumberMasked: string;
  creditedAmount: number;
  narration: string;
  balanceAfter: number;
  raw?: Record<string, any>;
}

export interface Gstr2bRecord {
  id: string;
  supplierGstin: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  totalItcAvailable: number;
  filingPeriod: string; // e.g. "2026-07"
  raw?: Record<string, any>;
}

export interface TdsExpenseRecord {
  id: string;
  vendorName: string;
  vendorPan?: string;
  vendorCategory?: 'Professional' | 'Contractor' | 'Rent' | 'Other' | 'Unknown';
  invoiceNumber: string;
  date: string;
  taxableBase: number;
  configuredRateUsed: number;
  tdsRecorded: number;
  sectionCode?: string; // e.g. "Sec 392 (2025 Act)"
  raw?: Record<string, any>;
}

export type TdsRecord = TdsExpenseRecord;

export interface ReconciledException {
  exceptionId: string;
  transactionId: string;
  sourceRecordIds: {
    invoiceId?: string;
    paymentId?: string;
    settlementId?: string;
    bankId?: string;
    gstr2bId?: string;
    tdsExpenseId?: string;
  };
  exceptionType: ExceptionType;
  booksAmount: number | null;
  paymentAmount: number | null;
  settlementAmount: number | null;
  bankAmount: number | null;
  difference: number;
  paymentDate?: string;
  settlementDate?: string;
  daysDifference?: number;
  ruleApplied: string;
  whyFlagged: string;
  deterministicConfidence: DeterministicConfidence;
  recommendedAction: ActionClassification;
  evidenceAvailable: string;
  evidenceMissing: string;
  userResolved?: boolean;
  userResolutionNotes?: string;
}

export type ExceptionItem = ReconciledException;

export interface PrimaryTransaction {
  transactionId: string;
  primaryKey: string; // e.g. invoice id or payment id
  invoice?: InvoiceRecord;
  payment?: PaymentRecord;
  settlement?: SettlementRecord;
  bankCredit?: BankRecord;
  status: ReconciliationStatus;
  exceptions: ReconciledException[];
  confidence: DeterministicConfidence;
  actionRequired: ActionClassification;
  expectedNetSettlement: number | null;
  actualSettlementDifference: number | null;
  bankCreditDifference: number | null;
  settlementDays: number | null;
  auditNotes: string[];
}

export interface ReconciliationKPIs {
  batchSize: number; // Unique primary transactions denominator
  fullyMatched: number;
  partialMatches: number;
  unmatched: number;
  matchRate: number; // (fullyMatched / batchSize) * 100
  exceptionRate: number; // (transactionsWithExceptions / batchSize) * 100
  autoResolutionRate: number; // (autoResolvedTransactions / batchSize) * 100
  totalExceptionItems: number; // Count of all exception objects
  transactionsWithExceptions: number; // Count of unique transactions with >=1 exception
  totalGrossPaymentValue: number;
  totalExpectedNetSettlement: number;
  totalActualSettledValue: number;
  totalBankCreditedValue: number;
  totalVarianceRequiringReview: number;
  invariantSatisfied: boolean; // fullyMatched + partialMatches + unmatched === batchSize
}

export interface CashPositionMetrics {
  openingCashBalance: number;
  totalCashInflows: number;
  totalCashOutflows: number;
  closingCashPosition: number;
  expectedFutureInflows: number;
  expectedFutureOutflows: number;
  expectedFutureReceivables: number;
  expectedFuturePayables: number;
  projectedEndingCash: number;
  averageMonthlyCashOutflow: number;
  cashRunwayMonths: number | null; // null if outflow <= 0
  runwayStatusText: string;
}

export interface GstScreeningMetrics {
  gstr9Applicable?: boolean;
  gstr9cApplicable?: boolean;
  turnoverThresholdGstr9Triggered: boolean;
  turnoverThresholdGstr9cTriggered: boolean;
  turnoverStatusText: string;
  booksInputTax: number;
  gstr2bInputTax: number;
  potentialItcVariance: number;
  taxableOutwardSupplyValue: number;
  potentialOutputGst: number;
  potentialNetGstPosition: number;
  netPositionStatusText: string;
  screeningObservations: string[];
}

export interface TdsScreeningMetrics {
  totalProfessionalPayments: number;
  configuredTdsRate: number;
  potentialRequiredTds: number;
  tdsRecorded: number;
  potentialShortfall: number;
  shortfallStatusText: string;
  dataQualityIssuesCount: number;
  screeningObservations: string[];
}

export interface SettlementTimingMetrics {
  totalSettledPayments: number;
  withinThresholdCount: number;
  timingExceptionsCount: number;
  averageSettlementDays: number;
  maxSettlementDays: number;
  totalAwaitingSettlementAmount: number;
  totalAwaitingBankCreditAmount: number;
  timingDistribution: Record<string, number>;
  timingObservations: string[];
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
  processingMode: string;
}

export interface ReconciliationResults {
  transactions: PrimaryTransaction[];
  kpis: ReconciliationKPIs;
  exceptions: ReconciledException[];
  cashPosition: CashPositionMetrics;
  gstScreening: GstScreeningMetrics;
  tdsScreening: TdsScreeningMetrics;
  settlementTiming: SettlementTimingMetrics;
  dataQualityWarnings: string[];
  recommendedNextActions: {
    category: string;
    action: string;
    priority: 'High' | 'Medium' | 'Low';
    affectedCount: number;
    financialImpact: number;
  }[];
  auditTrail: AuditTrailEntry[];
  inputRowCounts: {
    invoices: number;
    payments: number;
    settlements: number;
    bankRecords: number;
    gstr2bRecords: number;
    tdsRecords: number;
  };
  processedAt: string;
}
