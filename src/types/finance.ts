export type ExceptionType =
  | "Amount_Mismatch"
  | "Missing_in_Books"
  | "Missing_in_Settlement"
  | "Duplicate"
  | "Timing_Difference"
  | "Partial_Match";

export interface Exception {
  id: string;
  type: ExceptionType;
  transactionId: string;
  booksAmount: number;
  settlementAmount: number;
  difference: number;
  probableCause: string;
  confidence: number;
  recommendedAction: "auto_resolve" | "manual_review" | "escalate";
  reasoning: string;
}

export interface CashPosition {
  closingBalance: number;
  gstPayable: number;
  tdsPayable: number;
  projected7DayBalance: number;
}

export interface ComplianceFlags {
  rbiSettlement: string;
  gstMonitoring: string;
  gstr2b: string;
  tdsTcs: string;
  disclaimer: string;
}

export interface ReconciliationResultsJSON {
  batch_id: string;
  processing_timestamp: string;
  match_rate: number;
  total_transactions: number;
  fully_matched: number;
  partially_matched: number;
  unmatched: number;
  exceptions: Exception[];
  cash_position: CashPosition;
  compliance_flags: ComplianceFlags;
}

export interface Invoice {
  id: string;
  amount: number;
  date: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  merchant: string;
  description: string;
}

export interface Settlement {
  id: string;
  paymentId: string;
  amount: number;
  date: string;
  mdr: number;
  gstOnMdr: number;
  refundAmount: number;
}

export interface BankStatement {
  id: string;
  settlementId: string;
  amount: number;
  date: string;
}
