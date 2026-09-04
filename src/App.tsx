import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  FileCheck, 
  Wallet,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { ReconciliationResultsJSON, Invoice, Payment, Settlement, BankStatement } from './types/finance';
import { DeterministicEngine } from './engine/reconciliation';
import ControllerTab from './components/ControllerTab';
import ReconciliationTab from './components/ReconciliationTab';
import ExceptionsTab from './components/ExceptionsTab';
import CashPositionTab from './components/CashPositionTab';
import AskControllerTab from './components/AskControllerTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'controller' | 'reconciliation' | 'exceptions' | 'cash' | 'ask'>('controller');
  const [results, setResults] = useState<ReconciliationResultsJSON | null>(null);

  const handleRunReconciliation = (autoSwitch = true) => {
    const engine = new DeterministicEngine();
    
    // Generating 50 synthetic records as requested
    const invoices: Invoice[] = Array.from({length: 50}, (_, i) => ({
      id: `INV-${1000 + i}`,
      amount: 1000 + (i * 10),
      date: '2026-09-01'
    }));

    const payments: Payment[] = invoices.map(inv => ({
      id: `PAY-${inv.id}`,
      invoiceId: inv.id,
      amount: inv.amount,
      date: '2026-09-01',
      merchant: 'Store',
      description: 'Sale'
    }));

    // Generate settlements, introduce some missing/mismatched records for exceptions
    const settlements: Settlement[] = payments.slice(0, 48).map((pay, i) => {
      let amount = pay.amount * 0.98; // 2% MDR
      if (i === 5) amount -= 50; // Force amount mismatch
      return {
        id: `SET-${pay.id}`,
        paymentId: pay.id,
        amount: amount,
        date: i === 10 ? '2026-09-05' : '2026-09-02', // Force timing difference
        mdr: pay.amount * 0.0169, 
        gstOnMdr: pay.amount * 0.0031,
        refundAmount: 0
      };
    });
    
    // Add a duplicate payment
    payments.push(payments[0]);

    // Add a missing in books settlement
    settlements.push({
      id: "SET-UNKNOWN-999",
      paymentId: "PAY-UNKNOWN",
      amount: 500,
      date: '2026-09-02',
      mdr: 10,
      gstOnMdr: 1.8,
      refundAmount: 0
    });

    const bank: BankStatement[] = settlements.map(set => ({
      id: `BNK-${set.id}`,
      settlementId: set.id,
      amount: set.amount,
      date: set.date
    }));

    const result = engine.reconcile(invoices, payments, settlements, bank, 500000);
    setResults(result);
    if (autoSwitch) {
      setActiveTab('reconciliation');
    }
  };

  const handleUploadRun = (invData: any[], payData: any[], setData: any[], bnkData: any[]) => {
    const engine = new DeterministicEngine();
    
    const invoices: Invoice[] = invData.map(d => ({
      id: String(d.id || d.invoice_id),
      amount: parseFloat(d.amount),
      date: String(d.date)
    }));

    const payments: Payment[] = payData.map(d => ({
      id: String(d.id || d.payment_id),
      invoiceId: String(d.invoiceId || d.invoice_id),
      amount: parseFloat(d.amount),
      date: String(d.date),
      merchant: String(d.merchant || 'Unknown'),
      description: String(d.description || 'N/A')
    }));

    const settlements: Settlement[] = setData.map(d => ({
      id: String(d.id || d.settlement_id),
      paymentId: String(d.paymentId || d.payment_id),
      amount: parseFloat(d.amount),
      date: String(d.date),
      mdr: parseFloat(d.mdr || "0"),
      gstOnMdr: parseFloat(d.gstOnMdr || d.gst_on_mdr || "0"),
      refundAmount: parseFloat(d.refundAmount || d.refund_amount || "0")
    }));

    const bank: BankStatement[] = bnkData.map(d => ({
      id: String(d.id || d.bank_id),
      settlementId: String(d.settlementId || d.settlement_id),
      amount: parseFloat(d.amount),
      date: String(d.date)
    }));

    const result = engine.reconcile(invoices, payments, settlements, bank, 500000);
    setResults(result);
    setActiveTab('reconciliation');
  };

  useEffect(() => {
    // Auto-run the reconciliation once on load so the user sees working data immediately
    handleRunReconciliation(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white p-4 shadow-sm z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/IMG_20260904_115728_276.jpg" alt="Predator Logo" className="h-6 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
          <ShieldAlert className="w-6 h-6 text-emerald-400 hidden" />
          <h1 className="text-xl font-bold tracking-tight">Predator AI Finance Controller</h1>
        </div>
        {results && (
          <div className="text-sm font-medium bg-slate-800 px-3 py-1 rounded-md text-slate-300">
            Batch ID: {results.batch_id}
          </div>
        )}
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex-shrink-0">
          <nav className="flex flex-row md:flex-col overflow-x-auto p-2 md:p-4 space-x-2 md:space-x-0 md:space-y-2 scrollbar-hide">
            <button 
              onClick={() => setActiveTab('controller')}
              className={`flex-shrink-0 md:w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'controller' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
              <span>Controller</span>
            </button>
            <button 
              onClick={() => setActiveTab('reconciliation')}
              className={`flex-shrink-0 md:w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'reconciliation' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <FileCheck className="w-4 h-4 md:w-5 md:h-5" />
              <span>Reconciliation</span>
            </button>
            <button 
              onClick={() => setActiveTab('exceptions')}
              className={`flex-shrink-0 md:w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'exceptions' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
              <span>Exceptions</span>
              {results && results.exceptions.length > 0 && (
                <span className="ml-2 md:ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                  {results.exceptions.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('cash')}
              className={`flex-shrink-0 md:w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'cash' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Wallet className="w-4 h-4 md:w-5 md:h-5" />
              <span>Cash Position</span>
            </button>
            <button 
              onClick={() => setActiveTab('ask')}
              className={`flex-shrink-0 md:w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ask' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
              <span>Ask AI</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-4 md:p-8">
          {activeTab === 'controller' && <ControllerTab onRun={handleRunReconciliation} onUploadRun={handleUploadRun} onClear={() => setResults(null)} results={results} />}
          {activeTab === 'reconciliation' && <ReconciliationTab results={results} />}
          {activeTab === 'exceptions' && <ExceptionsTab results={results} />}
          {activeTab === 'cash' && <CashPositionTab results={results} />}
          {activeTab === 'ask' && <AskControllerTab results={results} />}
        </main>
      </div>
    </div>
  );
}
