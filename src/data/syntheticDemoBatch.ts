/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Synthetic India Finance Operations Demo Batch (65+ Primary Records)
 * Built for Razorpay AI Buildathon Track 04
 * 
 * Intentionally contains realistic mix of:
 * - Exact matches (4-way linkage: Invoice -> Payment -> Settlement -> Bank)
 * - Amount mismatches
 * - Missing in payments
 * - Missing in settlements
 * - Missing in bank credits
 * - Timing differences (exceeding configured threshold)
 * - Duplicate candidates
 * - Data quality issues (missing fields, non-numeric values)
 * - GST ITC books vs GSTR-2B variances
 * - TDS Section 392/393 (Income-tax Act 2025) shortfalls & missing category issues
 */

import {
  InvoiceRecord,
  PaymentRecord,
  SettlementRecord,
  BankRecord,
  Gstr2bRecord,
  TdsExpenseRecord,
} from '../types';

export interface DemoBatchData {
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
  settlements: SettlementRecord[];
  bankRecords: BankRecord[];
  gstr2bRecords: Gstr2bRecord[];
  tdsRecords: TdsExpenseRecord[];
  openingCashBalance: number;
  monthlyOutflowAverage: number;
  expectedFutureInflows: number;
  expectedFutureOutflows: number;
}

export function generateDemoBatch(): DemoBatchData {
  const invoices: InvoiceRecord[] = [];
  const payments: PaymentRecord[] = [];
  const settlements: SettlementRecord[] = [];
  const bankRecords: BankRecord[] = [];

  const customerNames = [
    'Reliance Retail Ltd',
    'Tata Digital Pvt Ltd',
    'Zomato Media Ltd',
    'Swiggy Bundl Tech',
    'Flipkart Internet',
    'Nykaa E-Retail',
    'Delhivery Logistics',
    'PhonePe Private Ltd',
    'Zerodha Broking Ltd',
    'Groww Invest Tech',
    'Paytm Payments Bank',
    'Cred Financial Tech',
    'Urban Company Tech',
    'Lenskart Solutions',
    'PolicyBazaar FinTech',
    'CarDekho Auto Services',
    'Oyo Rooms Hospitality',
    'Blinkit Commerce Pvt',
    'BigBasket Supermarket',
    'Zepto Quick Commerce',
  ];

  // Helper to format ISO date string
  const createDate = (day: number, month = 8, year = 2026) => {
    const d = day.toString().padStart(2, '0');
    const m = month.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Helper to round to 2 decimals
  const round2 = (num: number) => Math.round(num * 100) / 100;

  // 1. GENERATE 42 EXACT MATCHES (Indices 1 to 42)
  for (let i = 1; i <= 42; i++) {
    const invId = `INV-2026-${(1000 + i).toString()}`;
    const payId = `PAY-RZP-${(2000 + i).toString()}`;
    const setlId = `SETL-RZP-${(3000 + i).toString()}`;
    const bankId = `BANK-ICICI-${(4000 + i).toString()}`;
    const utr = `UTR202608${(100000 + i).toString()}`;

    const baseAmount = 5000 + i * 750;
    const gst = round2(baseAmount * 0.18);
    const totalAmount = round2(baseAmount + gst);

    const mdrFee = round2(totalAmount * 0.02); // 2% MDR
    const gstOnMdr = round2(mdrFee * 0.18); // 18% GST on MDR
    const netSettlement = round2(totalAmount - mdrFee - gstOnMdr);

    const day = (i % 25) + 1;
    const invDate = createDate(day);
    const payDate = createDate(day);
    const setlDate = createDate(day + 1); // 1 day timing -> within normal threshold
    const bankDate = createDate(day + 1);

    const cust = customerNames[i % customerNames.length];

    invoices.push({
      id: invId,
      invoiceNumber: `FIN/26-27/${(1000 + i).toString()}`,
      customerName: cust,
      customerGstin: `27AAACF${(1000 + i).toString()}M1ZV`,
      date: invDate,
      taxableAmount: baseAmount,
      gstAmount: gst,
      totalAmount: totalAmount,
      status: 'Issued',
    });

    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: `pay_gwy_${(8000 + i).toString()}`,
      paymentMethod: i % 3 === 0 ? 'UPI' : i % 3 === 1 ? 'Card' : 'NetBanking',
      date: payDate,
      grossAmount: totalAmount,
      currency: 'INR',
      customerEmail: `billing@${cust.toLowerCase().replace(/[^a-z]/g, '')}.in`,
      status: 'captured',
    });

    settlements.push({
      id: setlId,
      paymentId: payId,
      settlementBatchId: `BATCH-RZP-202608-${Math.floor(i / 5) + 1}`,
      date: setlDate,
      grossAmount: totalAmount,
      mdrFee: mdrFee,
      gstOnMdr: gstOnMdr,
      refundDeductions: 0,
      chargebackDeductions: 0,
      adjustments: 0,
      netSettlementAmount: netSettlement,
      utrNumber: utr,
      status: 'settled',
    });

    bankRecords.push({
      id: bankId,
      settlementId: setlId,
      utrNumber: utr,
      date: bankDate,
      bankName: 'ICICI Bank Current A/c (Escrow Ops)',
      accountNumberMasked: 'XXXX-XXXX-8921',
      creditedAmount: netSettlement,
      narration: `CMS/RAZORPAY/${setlId}/${utr}/NETPAY`,
      balanceAfter: 4500000 + i * 5000,
    });
  }

  // 2. AMOUNT MISMATCH CASES (Records 43, 44, 45, 46)
  // Case 43: Payment amount does not match invoice (Partial/Under-payment)
  {
    const invId = 'INV-2026-1043';
    const payId = 'PAY-RZP-2043';
    const setlId = 'SETL-RZP-3043';
    const bankId = 'BANK-ICICI-4043';
    const utr = 'UTR202608100043';

    invoices.push({
      id: invId,
      invoiceNumber: 'FIN/26-27/1043',
      customerName: 'Zomato Media Ltd',
      date: createDate(5),
      taxableAmount: 40000,
      gstAmount: 7200,
      totalAmount: 47200,
    });

    // Customer paid only ₹40,000 instead of ₹47,200
    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: 'pay_gwy_8043',
      paymentMethod: 'NetBanking',
      date: createDate(5),
      grossAmount: 40000,
      currency: 'INR',
      status: 'captured',
    });

    const mdr = 800;
    const gstMdr = 144;
    const net = 40000 - mdr - gstMdr;

    settlements.push({
      id: setlId,
      paymentId: payId,
      settlementBatchId: 'BATCH-RZP-202608-9',
      date: createDate(6),
      grossAmount: 40000,
      mdrFee: mdr,
      gstOnMdr: gstMdr,
      refundDeductions: 0,
      chargebackDeductions: 0,
      adjustments: 0,
      netSettlementAmount: net,
      utrNumber: utr,
      status: 'settled',
    });

    bankRecords.push({
      id: bankId,
      settlementId: setlId,
      utrNumber: utr,
      date: createDate(6),
      bankName: 'ICICI Bank Current A/c (Escrow Ops)',
      accountNumberMasked: 'XXXX-XXXX-8921',
      creditedAmount: net,
      narration: `CMS/RAZORPAY/${setlId}/${utr}/NETPAY`,
      balanceAfter: 5120000,
    });
  }

  // Case 44: Settlement difference beyond tolerance (Disputed gateway charge)
  {
    const invId = 'INV-2026-1044';
    const payId = 'PAY-RZP-2044';
    const setlId = 'SETL-RZP-3044';
    const bankId = 'BANK-ICICI-4044';
    const utr = 'UTR202608100044';

    invoices.push({
      id: invId,
      invoiceNumber: 'FIN/26-27/1044',
      customerName: 'Delhivery Logistics',
      date: createDate(7),
      taxableAmount: 25000,
      gstAmount: 4500,
      totalAmount: 29500,
    });

    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: 'pay_gwy_8044',
      paymentMethod: 'Card',
      date: createDate(7),
      grossAmount: 29500,
      currency: 'INR',
      status: 'captured',
    });

    // Gateway settled with unexplained ₹450 deduction beyond documented MDR
    settlements.push({
      id: setlId,
      paymentId: payId,
      settlementBatchId: 'BATCH-RZP-202608-9',
      date: createDate(8),
      grossAmount: 29500,
      mdrFee: 590,
      gstOnMdr: 106.2,
      refundDeductions: 0,
      chargebackDeductions: 0,
      adjustments: 0,
      netSettlementAmount: 28353.8, // Expected was 28803.8 (₹450 shortfall)
      utrNumber: utr,
      status: 'settled',
    });

    bankRecords.push({
      id: bankId,
      settlementId: setlId,
      utrNumber: utr,
      date: createDate(8),
      bankName: 'ICICI Bank Current A/c (Escrow Ops)',
      accountNumberMasked: 'XXXX-XXXX-8921',
      creditedAmount: 28353.8,
      narration: `CMS/RAZORPAY/${setlId}/${utr}/NETPAY`,
      balanceAfter: 5180000,
    });
  }

  // Case 45: Bank credited amount does not match settlement
  {
    const invId = 'INV-2026-1045';
    const payId = 'PAY-RZP-2045';
    const setlId = 'SETL-RZP-3045';
    const bankId = 'BANK-ICICI-4045';
    const utr = 'UTR202608100045';

    invoices.push({
      id: invId,
      invoiceNumber: 'FIN/26-27/1045',
      customerName: 'Swiggy Bundl Tech',
      date: createDate(8),
      taxableAmount: 18000,
      gstAmount: 3240,
      totalAmount: 21240,
    });

    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: 'pay_gwy_8045',
      paymentMethod: 'UPI',
      date: createDate(8),
      grossAmount: 21240,
      currency: 'INR',
      status: 'captured',
    });

    const mdr = 424.8;
    const gstMdr = 76.46;
    const netExpected = 20738.74;

    settlements.push({
      id: setlId,
      paymentId: payId,
      settlementBatchId: 'BATCH-RZP-202608-10',
      date: createDate(9),
      grossAmount: 21240,
      mdrFee: mdr,
      gstOnMdr: gstMdr,
      refundDeductions: 0,
      chargebackDeductions: 0,
      adjustments: 0,
      netSettlementAmount: netExpected,
      utrNumber: utr,
      status: 'settled',
    });

    // Bank statement shows unexpected bank debit charge of ₹50
    bankRecords.push({
      id: bankId,
      settlementId: setlId,
      utrNumber: utr,
      date: createDate(9),
      bankName: 'HDFC Bank Corporate A/c',
      accountNumberMasked: 'XXXX-XXXX-4190',
      creditedAmount: 20688.74, // ₹50 difference
      narration: `NEFT-RZP-${setlId}-${utr}-DED50`,
      balanceAfter: 5210000,
    });
  }

  // Case 46: Overcharge/Overpayment variance
  {
    const invId = 'INV-2026-1046';
    const payId = 'PAY-RZP-2046';
    const setlId = 'SETL-RZP-3046';
    const bankId = 'BANK-ICICI-4046';
    const utr = 'UTR202608100046';

    invoices.push({
      id: invId,
      invoiceNumber: 'FIN/26-27/1046',
      customerName: 'Zerodha Broking Ltd',
      date: createDate(10),
      taxableAmount: 15000,
      gstAmount: 2700,
      totalAmount: 17700,
    });

    // Customer overpaid ₹18,500
    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: 'pay_gwy_8046',
      paymentMethod: 'NetBanking',
      date: createDate(10),
      grossAmount: 18500,
      currency: 'INR',
      status: 'captured',
    });

    const mdr = 370;
    const gstMdr = 66.6;
    const net = 18500 - mdr - gstMdr;

    settlements.push({
      id: setlId,
      paymentId: payId,
      settlementBatchId: 'BATCH-RZP-202608-10',
      date: createDate(11),
      grossAmount: 18500,
      mdrFee: mdr,
      gstOnMdr: gstMdr,
      refundDeductions: 0,
      chargebackDeductions: 0,
      adjustments: 0,
      netSettlementAmount: net,
      utrNumber: utr,
      status: 'settled',
    });

    bankRecords.push({
      id: bankId,
      settlementId: setlId,
      utrNumber: utr,
      date: createDate(11),
      bankName: 'ICICI Bank Current A/c (Escrow Ops)',
      accountNumberMasked: 'XXXX-XXXX-8921',
      creditedAmount: net,
      narration: `CMS/RAZORPAY/${setlId}/${utr}/NETPAY`,
      balanceAfter: 5245000,
    });
  }

  // 3. MISSING IN PAYMENT (Invoices issued, payment not found) (Records 47, 48, 49)
  for (let i = 47; i <= 49; i++) {
    const invId = `INV-2026-${(1000 + i).toString()}`;
    const base = 20000 + i * 1000;
    const gst = round2(base * 0.18);
    const total = round2(base + gst);

    invoices.push({
      id: invId,
      invoiceNumber: `FIN/26-27/${(1000 + i).toString()}`,
      customerName: customerNames[i % customerNames.length],
      customerGstin: `27AAACF${(1000 + i).toString()}M1ZV`,
      date: createDate(12 + (i - 47)),
      taxableAmount: base,
      gstAmount: gst,
      totalAmount: total,
      status: 'Unpaid',
    });
    // No payment record created
  }

  // 4. MISSING IN SETTLEMENT (Payment captured, settlement missing) (Records 50, 51, 52)
  for (let i = 50; i <= 52; i++) {
    const invId = `INV-2026-${(1000 + i).toString()}`;
    const payId = `PAY-RZP-${(2000 + i).toString()}`;
    const base = 12000 + i * 500;
    const gst = round2(base * 0.18);
    const total = round2(base + gst);

    invoices.push({
      id: invId,
      invoiceNumber: `FIN/26-27/${(1000 + i).toString()}`,
      customerName: customerNames[i % customerNames.length],
      date: createDate(14 + (i - 50)),
      taxableAmount: base,
      gstAmount: gst,
      totalAmount: total,
      status: 'Issued',
    });

    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: `pay_gwy_${(8000 + i).toString()}`,
      paymentMethod: 'UPI',
      date: createDate(14 + (i - 50)),
      grossAmount: total,
      currency: 'INR',
      status: 'captured',
    });
    // No settlement record created (Awaiting aggregator batch payout)
  }

  // 5. MISSING IN BANK CREDIT (Settlement batch exists, credit missing in bank statement) (Records 53, 54, 55)
  for (let i = 53; i <= 55; i++) {
    const invId = `INV-2026-${(1000 + i).toString()}`;
    const payId = `PAY-RZP-${(2000 + i).toString()}`;
    const setlId = `SETL-RZP-${(3000 + i).toString()}`;
    const base = 28000 + i * 400;
    const gst = round2(base * 0.18);
    const total = round2(base + gst);

    const mdr = round2(total * 0.02);
    const gstMdr = round2(mdr * 0.18);
    const net = round2(total - mdr - gstMdr);

    invoices.push({
      id: invId,
      invoiceNumber: `FIN/26-27/${(1000 + i).toString()}`,
      customerName: customerNames[i % customerNames.length],
      date: createDate(16 + (i - 53)),
      taxableAmount: base,
      gstAmount: gst,
      totalAmount: total,
      status: 'Issued',
    });

    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: `pay_gwy_${(8000 + i).toString()}`,
      paymentMethod: 'NetBanking',
      date: createDate(16 + (i - 53)),
      grossAmount: total,
      currency: 'INR',
      status: 'captured',
    });

    settlements.push({
      id: setlId,
      paymentId: payId,
      settlementBatchId: `BATCH-RZP-202608-${Math.floor(i / 5) + 1}`,
      date: createDate(17 + (i - 53)),
      grossAmount: total,
      mdrFee: mdr,
      gstOnMdr: gstMdr,
      refundDeductions: 0,
      chargebackDeductions: 0,
      adjustments: 0,
      netSettlementAmount: net,
      utrNumber: `UTR202608${(100000 + i).toString()}`,
      status: 'settled',
    });
    // No bank record created (Bank credit dropped / pending reconciliation with Escrow)
  }

  // 6. TIMING DIFFERENCES (Payment to Settlement > 1 calendar day threshold) (Records 56, 57, 58, 59)
  const timingDeltas = [3, 4, 5, 4];
  for (let idx = 0; idx < 4; idx++) {
    const i = 56 + idx;
    const invId = `INV-2026-${(1000 + i).toString()}`;
    const payId = `PAY-RZP-${(2000 + i).toString()}`;
    const setlId = `SETL-RZP-${(3000 + i).toString()}`;
    const bankId = `BANK-ICICI-${(4000 + i).toString()}`;
    const utr = `UTR202608${(100000 + i).toString()}`;

    const base = 22000 + i * 300;
    const gst = round2(base * 0.18);
    const total = round2(base + gst);

    const mdr = round2(total * 0.02);
    const gstMdr = round2(mdr * 0.18);
    const net = round2(total - mdr - gstMdr);

    const payDay = 1 + idx * 3;
    const setlDay = payDay + timingDeltas[idx]; // 3 to 5 days delay

    invoices.push({
      id: invId,
      invoiceNumber: `FIN/26-27/${(1000 + i).toString()}`,
      customerName: customerNames[i % customerNames.length],
      date: createDate(payDay),
      taxableAmount: base,
      gstAmount: gst,
      totalAmount: total,
      status: 'Issued',
    });

    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: `pay_gwy_${(8000 + i).toString()}`,
      paymentMethod: 'Card',
      date: createDate(payDay),
      grossAmount: total,
      currency: 'INR',
      status: 'captured',
    });

    settlements.push({
      id: setlId,
      paymentId: payId,
      settlementBatchId: `BATCH-RZP-202608-${Math.floor(i / 5) + 1}`,
      date: createDate(setlDay),
      grossAmount: total,
      mdrFee: mdr,
      gstOnMdr: gstMdr,
      refundDeductions: 0,
      chargebackDeductions: 0,
      adjustments: 0,
      netSettlementAmount: net,
      utrNumber: utr,
      status: 'settled',
    });

    bankRecords.push({
      id: bankId,
      settlementId: setlId,
      utrNumber: utr,
      date: createDate(setlDay),
      bankName: 'ICICI Bank Current A/c (Escrow Ops)',
      accountNumberMasked: 'XXXX-XXXX-8921',
      creditedAmount: net,
      narration: `CMS/RAZORPAY/${setlId}/${utr}/NETPAY`,
      balanceAfter: 5350000 + i * 2000,
    });
  }

  // 7. DUPLICATE CANDIDATE (Record 60 - Two settlements referencing the same payment ID)
  {
    const i = 60;
    const invId = `INV-2026-1060`;
    const payId = `PAY-RZP-2060`;
    const setlId1 = `SETL-RZP-3060-A`;
    const setlId2 = `SETL-RZP-3060-B`; // Duplicate settlement link
    const bankId = `BANK-ICICI-4060`;
    const utr = `UTR202608100060`;

    const base = 35000;
    const gst = round2(base * 0.18);
    const total = round2(base + gst);

    const mdr = round2(total * 0.02);
    const gstMdr = round2(mdr * 0.18);
    const net = round2(total - mdr - gstMdr);

    invoices.push({
      id: invId,
      invoiceNumber: 'FIN/26-27/1060',
      customerName: 'PhonePe Private Ltd',
      date: createDate(18),
      taxableAmount: base,
      gstAmount: gst,
      totalAmount: total,
      status: 'Issued',
    });

    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: 'pay_gwy_8060',
      paymentMethod: 'UPI',
      date: createDate(18),
      grossAmount: total,
      currency: 'INR',
      status: 'captured',
    });

    settlements.push({
      id: setlId1,
      paymentId: payId,
      settlementBatchId: 'BATCH-RZP-202608-12',
      date: createDate(19),
      grossAmount: total,
      mdrFee: mdr,
      gstOnMdr: gstMdr,
      refundDeductions: 0,
      chargebackDeductions: 0,
      adjustments: 0,
      netSettlementAmount: net,
      utrNumber: utr,
      status: 'settled',
    });

    settlements.push({
      id: setlId2,
      paymentId: payId, // Duplicate payment reference!
      settlementBatchId: 'BATCH-RZP-202608-12-DUP',
      date: createDate(19),
      grossAmount: total,
      mdrFee: mdr,
      gstOnMdr: gstMdr,
      refundDeductions: 0,
      chargebackDeductions: 0,
      adjustments: 0,
      netSettlementAmount: net,
      utrNumber: `${utr}-DUP`,
      status: 'settled',
    });

    bankRecords.push({
      id: bankId,
      settlementId: setlId1,
      utrNumber: utr,
      date: createDate(19),
      bankName: 'ICICI Bank Current A/c (Escrow Ops)',
      accountNumberMasked: 'XXXX-XXXX-8921',
      creditedAmount: net,
      narration: `CMS/RAZORPAY/${setlId1}/${utr}/NETPAY`,
      balanceAfter: 5490000,
    });
  }

  // 8. DATA QUALITY ISSUES (Records 61, 62, 63)
  // Record 61: Missing MDR Fee in Settlement record (Not supplied)
  {
    const invId = 'INV-2026-1061';
    const payId = 'PAY-RZP-2061';
    const setlId = 'SETL-RZP-3061';
    const bankId = 'BANK-ICICI-4061';
    const utr = 'UTR202608100061';

    const total = 14160;

    invoices.push({
      id: invId,
      invoiceNumber: 'FIN/26-27/1061',
      customerName: 'Groww Invest Tech',
      date: createDate(20),
      taxableAmount: 12000,
      gstAmount: 2160,
      totalAmount: total,
    });

    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: 'pay_gwy_8061',
      paymentMethod: 'UPI',
      date: createDate(20),
      grossAmount: total,
      currency: 'INR',
      status: 'captured',
    });

    // MDR fee and GST on MDR missing (null)
    settlements.push({
      id: setlId,
      paymentId: payId,
      settlementBatchId: 'BATCH-RZP-202608-13',
      date: createDate(21),
      grossAmount: total,
      mdrFee: null, // NOT SUPPLIED!
      gstOnMdr: null, // NOT SUPPLIED!
      refundDeductions: 0,
      chargebackDeductions: 0,
      adjustments: 0,
      netSettlementAmount: 13820.16,
      utrNumber: utr,
      status: 'settled',
    });

    bankRecords.push({
      id: bankId,
      settlementId: setlId,
      utrNumber: utr,
      date: createDate(21),
      bankName: 'ICICI Bank Current A/c (Escrow Ops)',
      accountNumberMasked: 'XXXX-XXXX-8921',
      creditedAmount: 13820.16,
      narration: `CMS/RAZORPAY/${setlId}/${utr}/NETPAY`,
      balanceAfter: 5510000,
    });
  }

  // Record 62: Ambiguous / Unparseable Date in Invoice
  {
    const invId = 'INV-2026-1062';
    const payId = 'PAY-RZP-2062';
    const setlId = 'SETL-RZP-3062';
    const bankId = 'BANK-ICICI-4062';
    const utr = 'UTR202608100062';

    invoices.push({
      id: invId,
      invoiceNumber: 'FIN/26-27/1062',
      customerName: 'Urban Company Tech',
      date: 'INVALID_DATE_32/13/2026', // Unparseable Date!
      taxableAmount: 18000,
      gstAmount: 3240,
      totalAmount: 21240,
    });

    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: 'pay_gwy_8062',
      paymentMethod: 'Card',
      date: createDate(22),
      grossAmount: 21240,
      currency: 'INR',
      status: 'captured',
    });

    const mdr = 424.8;
    const gstMdr = 76.46;
    const net = 20738.74;

    settlements.push({
      id: setlId,
      paymentId: payId,
      settlementBatchId: 'BATCH-RZP-202608-13',
      date: createDate(23),
      grossAmount: 21240,
      mdrFee: mdr,
      gstOnMdr: gstMdr,
      refundDeductions: 0,
      chargebackDeductions: 0,
      adjustments: 0,
      netSettlementAmount: net,
      utrNumber: utr,
      status: 'settled',
    });

    bankRecords.push({
      id: bankId,
      settlementId: setlId,
      utrNumber: utr,
      date: createDate(23),
      bankName: 'ICICI Bank Current A/c (Escrow Ops)',
      accountNumberMasked: 'XXXX-XXXX-8921',
      creditedAmount: net,
      narration: `CMS/RAZORPAY/${setlId}/${utr}/NETPAY`,
      balanceAfter: 5535000,
    });
  }

  // Record 63: Non-numeric amount in Payment raw record
  {
    const invId = 'INV-2026-1063';
    const payId = 'PAY-RZP-2063';

    invoices.push({
      id: invId,
      invoiceNumber: 'FIN/26-27/1063',
      customerName: 'CarDekho Auto Services',
      date: createDate(23),
      taxableAmount: 30000,
      gstAmount: 5400,
      totalAmount: 35400,
    });

    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: 'pay_gwy_8063',
      paymentMethod: 'Other',
      date: createDate(23),
      grossAmount: NaN, // Malformed non-numeric value in CSV
      currency: 'INR',
      status: 'captured',
      raw: { amount: 'N/A_CORRUPT' },
    });
  }

  // Records 64 & 65: Fallback Settlement to Bank matching
  // Bank statement has missing settlement_id, but narration contains settlement reference and matching amount
  for (let idx = 0; idx < 2; idx++) {
    const i = 64 + idx;
    const invId = `INV-2026-${(1000 + i).toString()}`;
    const payId = `PAY-RZP-${(2000 + i).toString()}`;
    const setlId = `SETL-RZP-${(3000 + i).toString()}`;
    const bankId = `BANK-HDFC-${(4000 + i).toString()}`;

    const base = 25000;
    const gst = round2(base * 0.18);
    const total = round2(base + gst);

    const mdr = round2(total * 0.02);
    const gstMdr = round2(mdr * 0.18);
    const net = round2(total - mdr - gstMdr);

    invoices.push({
      id: invId,
      invoiceNumber: `FIN/26-27/${(1000 + i).toString()}`,
      customerName: 'Zepto Quick Commerce',
      date: createDate(24 + idx),
      taxableAmount: base,
      gstAmount: gst,
      totalAmount: total,
      status: 'Issued',
    });

    payments.push({
      id: payId,
      invoiceId: invId,
      gatewayPaymentId: `pay_gwy_${(8000 + i).toString()}`,
      paymentMethod: 'UPI',
      date: createDate(24 + idx),
      grossAmount: total,
      currency: 'INR',
      status: 'captured',
    });

    settlements.push({
      id: setlId,
      paymentId: payId,
      settlementBatchId: 'BATCH-RZP-202608-14',
      date: createDate(25 + idx),
      grossAmount: total,
      mdrFee: mdr,
      gstOnMdr: gstMdr,
      refundDeductions: 0,
      chargebackDeductions: 0,
      adjustments: 0,
      netSettlementAmount: net,
      utrNumber: `UTR2026081000${i}`,
      status: 'settled',
    });

    // Bank statement is missing settlementId field (Fallback Narration Match required!)
    bankRecords.push({
      id: bankId,
      settlementId: undefined, // Missing ID in bank ledger!
      date: createDate(25 + idx),
      bankName: 'HDFC Bank Corporate A/c',
      accountNumberMasked: 'XXXX-XXXX-4190',
      creditedAmount: net,
      narration: `UPI-SETTLEMENT-CREDIT-REF-${setlId}-RZP-PAYOUT`,
      balanceAfter: 5610000,
    });
  }

  // 9. GST GSTR-2B RECORDS & BOOKS ITC DATA
  const gstr2bRecords: Gstr2bRecord[] = [
    {
      id: 'GSTR2B-202608-01',
      supplierGstin: '27AABCU9603R1ZM',
      supplierName: 'Amazon Web Services India Pvt Ltd',
      invoiceNumber: 'AWS/IN/2026/89412',
      invoiceDate: '2026-08-02',
      invoiceValue: 236000,
      taxableValue: 200000,
      igst: 36000,
      cgst: 0,
      sgst: 0,
      totalItcAvailable: 36000,
      filingPeriod: '2026-08',
    },
    {
      id: 'GSTR2B-202608-02',
      supplierGstin: '29AAGCB3941M1ZY',
      supplierName: 'Google Cloud India Pvt Ltd',
      invoiceNumber: 'GCP/INV/98231',
      invoiceDate: '2026-08-05',
      invoiceValue: 177000,
      taxableValue: 150000,
      igst: 27000,
      cgst: 0,
      sgst: 0,
      totalItcAvailable: 27000,
      filingPeriod: '2026-08',
    },
    {
      id: 'GSTR2B-202608-03',
      supplierGstin: '27AAACR1234F1Z8',
      supplierName: 'Razorpay Software Private Limited',
      invoiceNumber: 'RZP/MDR/202608',
      invoiceDate: '2026-08-31',
      invoiceValue: 70800,
      taxableValue: 60000,
      igst: 0,
      cgst: 5400,
      sgst: 5400,
      totalItcAvailable: 10800,
      filingPeriod: '2026-08',
    },
    {
      id: 'GSTR2B-202608-04',
      supplierGstin: '27AABCT5512Q1ZX',
      supplierName: 'Microsoft Regional Sales Pte',
      invoiceNumber: 'MS/AZURE/44910',
      invoiceDate: '2026-08-10',
      invoiceValue: 118000,
      taxableValue: 100000,
      igst: 18000,
      cgst: 0,
      sgst: 0,
      totalItcAvailable: 18000,
      filingPeriod: '2026-08',
    },
    {
      id: 'GSTR2B-202608-05',
      supplierGstin: '27AABCO7890N1Z2',
      supplierName: 'Oracle India Private Ltd',
      invoiceNumber: 'ORCL/2026/1029',
      invoiceDate: '2026-08-12',
      invoiceValue: 88500,
      taxableValue: 75000,
      igst: 13500,
      cgst: 0,
      sgst: 0,
      totalItcAvailable: 13500,
      filingPeriod: '2026-08',
    },
  ];

  // 10. TDS EXPENSE RECORDS (Income-tax Act 2025 Section 392/393)
  const tdsRecords: TdsExpenseRecord[] = [
    {
      id: 'TDS-2026-01',
      vendorName: 'Shardul Amarchand Mangaldas (Legal Counsel)',
      vendorPan: 'AABCS1234M',
      vendorCategory: 'Professional',
      invoiceNumber: 'SAM/LEGAL/26-01',
      date: '2026-08-03',
      taxableBase: 150000,
      configuredRateUsed: 10,
      tdsRecorded: 15000, // Exact 10% match under Sec 392
      sectionCode: 'Sec 392 (Income-tax Act, 2025)',
    },
    {
      id: 'TDS-2026-02',
      vendorName: 'Deloitte Touche Tohmatsu India (Audit & Tax Advisory)',
      vendorPan: 'AABCD5678K',
      vendorCategory: 'Professional',
      invoiceNumber: 'DEL/TAX/26-08',
      date: '2026-08-07',
      taxableBase: 200000,
      configuredRateUsed: 10,
      tdsRecorded: 14000, // Potential Shortfall! (10% is ₹20,000, recorded ₹14,000 -> ₹6,000 variance)
      sectionCode: 'Sec 392 (Income-tax Act, 2025)',
    },
    {
      id: 'TDS-2026-03',
      vendorName: 'KPMG India Advisory Services',
      vendorPan: 'AABCK9012P',
      vendorCategory: 'Professional',
      invoiceNumber: 'KPMG/CON/26-44',
      date: '2026-08-14',
      taxableBase: 100000,
      configuredRateUsed: 10,
      tdsRecorded: 7000, // Potential Shortfall! (10% is ₹10,000, recorded ₹7,000 -> ₹3,000 shortfall)
      sectionCode: 'Sec 392 (Income-tax Act, 2025)',
    },
    {
      id: 'TDS-2026-04',
      vendorName: 'Apex Security & Facility Management Services',
      vendorPan: 'AABCA3456L',
      vendorCategory: 'Contractor',
      invoiceNumber: 'APEX/FAC/26-102',
      date: '2026-08-16',
      taxableBase: 80000,
      configuredRateUsed: 2,
      tdsRecorded: 1600, // 2% Contractor TDS under Sec 393
      sectionCode: 'Sec 393 (Income-tax Act, 2025)',
    },
    {
      id: 'TDS-2026-05',
      vendorName: 'TechOps Cloud Infrastructure Contractor',
      vendorPan: '', // Missing PAN!
      vendorCategory: 'Unknown', // Missing Vendor Category!
      invoiceNumber: 'TECHOPS/26-88',
      date: '2026-08-20',
      taxableBase: 120000,
      configuredRateUsed: 10,
      tdsRecorded: 0, // Missing Data Quality Issue!
      sectionCode: 'Pending Determination',
    },
  ];

  return {
    invoices,
    payments,
    settlements,
    bankRecords,
    gstr2bRecords,
    tdsRecords,
    openingCashBalance: 4250000, // ₹42.50 Lakhs
    monthlyOutflowAverage: 1850000, // ₹18.50 Lakhs monthly burn
    expectedFutureInflows: 850000,
    expectedFutureOutflows: 620000,
  };
}

const _defaultDemo = generateDemoBatch();
export const SYNTHETIC_INVOICES = _defaultDemo.invoices;
export const SYNTHETIC_PAYMENTS = _defaultDemo.payments;
export const SYNTHETIC_SETTLEMENTS = _defaultDemo.settlements;
export const SYNTHETIC_BANK_RECORDS = _defaultDemo.bankRecords;
export const SYNTHETIC_GSTR2B = _defaultDemo.gstr2bRecords;
export const SYNTHETIC_TDS = _defaultDemo.tdsRecords;
export const SYNTHETIC_CASH_PARAMS = {
  openingCashBalance: _defaultDemo.openingCashBalance,
  monthlyOutflowAverage: _defaultDemo.monthlyOutflowAverage,
  expectedFutureInflows: _defaultDemo.expectedFutureInflows,
  expectedFutureOutflows: _defaultDemo.expectedFutureOutflows,
};
