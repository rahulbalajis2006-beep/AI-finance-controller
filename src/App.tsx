import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  FileCheck, 
  Wallet,
  MessageSquare,
  Settings,
  X
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
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSaveSettings = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setShowSettings(false);
  };

  const executeRun = (autoSwitch = true) => {
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

  const handleRunReconciliation = (autoSwitch = true, manual = true) => {
    if (manual) {
      setIsProcessing(true);
      setTimeout(() => {
        executeRun(autoSwitch);
        setIsProcessing(false);
      }, 5000);
    } else {
      executeRun(autoSwitch);
    }
  };

  const handleUploadRun = (invData: any[], payData: any[], setData: any[], bnkData: any[]) => {
    setIsProcessing(true);
    setTimeout(() => {
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
      setIsProcessing(false);
    }, 5000);
  };

  useEffect(() => {
    // Auto-run the reconciliation once on load so the user sees working data immediately
    handleRunReconciliation(false, false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 text-white">
          <style>{`
            @keyframes loadProgress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
            .animate-load-progress {
              animation: loadProgress 5s linear forwards;
            }
          `}</style>
          <svg className="h-24 w-24 mb-8 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="p-lightning-loader" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="40%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path fillRule="evenodd" clipRule="evenodd" d="M5.5 2 H14.5 A4 4 0 0 1 14.5 10 H13.5 L7.5 22 V15 H5.5 Z M10.5 4.5 H14.5 A1.5 1.5 0 0 1 14.5 7.5 H10.5 Z" fill="url(#p-lightning-loader)" />
          </svg>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Reconciling Ledgers...</h2>
          <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 animate-load-progress rounded-full"></div>
          </div>
          <p className="text-sm text-slate-400 mt-4 animate-pulse font-mono">Running deterministic 4-way matching</p>
        </div>
      )}

      <header className="bg-slate-900 text-white p-4 shadow-sm z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="h-7 w-7 flex-shrink-0 drop-shadow-md" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="p-lightning-app" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="40%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path fillRule="evenodd" clipRule="evenodd" d="M5.5 2 H14.5 A4 4 0 0 1 14.5 10 H13.5 L7.5 22 V15 H5.5 Z M10.5 4.5 H14.5 A1.5 1.5 0 0 1 14.5 7.5 H10.5 Z" fill="url(#p-lightning-app)" />
          </svg>
          <h1 className="text-xl font-bold tracking-tight">Predator AI Finance Controller</h1>
        </div>
        <div className="flex items-center gap-4">
          {results && (
            <div className="text-sm font-medium bg-slate-800 px-3 py-1 rounded-md text-slate-300 hidden sm:block">
              Batch ID: {results.batch_id}
            </div>
          )}
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="API Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">API Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Gemini API Key (Optional)
                </label>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Provide your own Gemini API key to override the default system key. Your key is stored securely in your browser's local storage.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

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
