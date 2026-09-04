# AI Finance Controller

## 1. What the AI Finance Controller does
The AI Finance Controller is a local-first, zero-cost reconciliation agent designed for synthetic merchant batches. It ingests CSV data (Invoices, Payments, Settlements, Bank Statements) and automatically performs a deterministic 4-way match to ensure that every cent recorded in the books actually lands in the bank.

## 2. Architecture
The system is built on a strict two-layer architecture to guarantee safety, zero cost, and determinism:
- **Layer A: Deterministic Truth Layer (TypeScript/Node):** Handles all arithmetic, data parsing, validation, transaction matching, exception generation, and cash position calculations. (Implemented locally in Node/TypeScript instead of Python to run seamlessly without backend infrastructure).
- **Layer B: Gemini Reasoning Layer:** Handles only unstructured reasoning, such as exception classification, probable cause analysis, and answering natural-language queries via the "Ask Controller" feature.
- **Layer C: Graceful Degradation:** If Gemini is unavailable, quota-limited, or fails to parse, the system instantly falls back to deterministic results, displaying: "AI reasoning temporarily unavailable. Deterministic reconciliation completed successfully."

## 3. Why TypeScript/Node handles arithmetic (Python equivalent)
In this architecture, TypeScript acts as the strict deterministic engine (fulfilling the same role as a Python backend). LLMs are notoriously unreliable at arithmetic and strict matching. By isolating all math (match rates, GST, TDS, balances) into compiled code, we guarantee 100% accuracy and preserve data privacy.

## 4. Why Gemini handles reasoning
Gemini is used sparsely and strictly for classification and natural language Q&A. It is never trusted with computing a balance. We only send exception summaries (not the entire database) to the Gemini API, ensuring zero-cost scaling.

## 5. Synthetic data methodology
To strictly enforce privacy and avoid any risk with real financial data, the app uses 100% synthetic data generated deterministically. No real financial data is processed.

## 6. Reconciliation algorithm
1. **Phase 1 (Deterministic Exact Match):** Transaction_ID + Amount + Date. 100% Confidence.
2. **Phase 2 (Batch Aggregation):** Payout_ID + SUM(amounts). Tolerance ±0.01%.
3. **Phase 3 (Cross-period):** Original_Transaction_ID + Refund_Amount checked over a ±30 day window.
4. **Phase 4 (Fuzzy/Probabilistic):** Missing_in_Books checks based on Weighted score: Amount 40%, Merchant 30%, Date 20%, Description 10%. Auto-match >0.85.

## 7. Exception taxonomy
The system generates exactly 6 types of exceptions:
- `Amount_Mismatch`
- `Missing_in_Books`
- `Missing_in_Settlement`
- `Duplicate`
- `Timing_Difference`
- `Partial_Match`

## 8. Accuracy methodology
Invariants are enforced mathematically. The formula `Expected Settlement = Transaction Amount - MDR - GST on MDR` must hold exactly. Valid MDR/GST deductions are never flagged as errors.

## 9. Failure recovery
If invalid JSON is returned by the AI, it is rejected, and the UI degrades gracefully. No infinite retries.

## 10. Zero-cost architecture
By doing the heavy lifting locally and using Gemini sparsely, the application runs 100% free. No paid databases or cloud hosting.

## 11. No live Razorpay API
We parse synthetic CSVs. There is absolutely no connection to live Razorpay or Stripe APIs.

## 12. No real financial data
All data processed is fictional. No billing account or credit card is required.
