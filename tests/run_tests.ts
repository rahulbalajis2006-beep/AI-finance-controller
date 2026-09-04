import { DeterministicEngine } from "../src/engine/reconciliation";
import { Invoice, Payment, Settlement, BankStatement } from "../src/types/finance";
import * as assert from "assert";

async function runTests() {
  console.log("Starting Deterministic Reconciliation Tests...");

  const engine = new DeterministicEngine();

  // Test 1: Exact Match
  const inv: Invoice[] = [{ id: "INV-1", amount: 100, date: "2026-09-01" }];
  const pay: Payment[] = [{ id: "PAY-1", invoiceId: "INV-1", amount: 100, date: "2026-09-01", merchant: "Store", description: "Sale" }];
  // Settlement: 100 - 2 (mdr) - 0.36 (gst) = 97.64
  const set: Settlement[] = [{ id: "SET-1", paymentId: "PAY-1", amount: 97.64, date: "2026-09-02", mdr: 2, gstOnMdr: 0.36, refundAmount: 0 }];
  const bank: BankStatement[] = [{ id: "BNK-1", settlementId: "SET-1", amount: 97.64, date: "2026-09-02" }];

  let res = engine.reconcile(inv, pay, set, bank, 1000);
  assert.strictEqual(res.fully_matched, 1, "Should be fully matched");
  assert.strictEqual(res.exceptions.length, 0, "Should have zero exceptions");

  // Test 2: Amount Mismatch (Deduction)
  const set2: Settlement[] = [{ id: "SET-1", paymentId: "PAY-1", amount: 95.00, date: "2026-09-02", mdr: 2, gstOnMdr: 0.36, refundAmount: 0 }];
  res = engine.reconcile(inv, pay, set2, bank, 1000);
  assert.strictEqual(res.unmatched, 1);
  assert.strictEqual(res.exceptions[0].type, "Amount_Mismatch");

  // Test 3: Missing in Settlement
  res = engine.reconcile(inv, pay, [], bank, 1000);
  assert.strictEqual(res.unmatched, 1);
  assert.strictEqual(res.exceptions[0].type, "Missing_in_Settlement");

  // Test 4: Missing in Books
  const set3: Settlement[] = [{ id: "SET-2", paymentId: "PAY-2", amount: 50, date: "2026-09-02", mdr: 1, gstOnMdr: 0.18, refundAmount: 0 }];
  res = engine.reconcile(inv, [], set3, bank, 1000);
  // payment is empty, so fully matched is 0, unmatched is 0 (relative to payments length), but we get an exception.
  assert.strictEqual(res.exceptions[0].type, "Missing_in_Books");

  // Test 5: Duplicate Payment
  const payDup: Payment[] = [
    { id: "PAY-1", invoiceId: "INV-1", amount: 100, date: "2026-09-01", merchant: "Store", description: "Sale" },
    { id: "PAY-1", invoiceId: "INV-1", amount: 100, date: "2026-09-01", merchant: "Store", description: "Sale" }
  ];
  res = engine.reconcile(inv, payDup, set, bank, 1000);
  const dupException = res.exceptions.find(e => e.type === "Duplicate");
  assert.ok(dupException !== undefined, "Duplicate exception must exist");

  console.log("All tests passed! Deterministic engine verified.");
}

runTests().catch(console.error);
