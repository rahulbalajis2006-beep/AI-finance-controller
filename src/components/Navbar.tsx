/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Top Navigation Bar & Operations Toolbar
 * Editorial Ledger aesthetic with local-processing badge and quick batch loaders.
 */

import React from 'react';
import {
  Layers,
  Scale,
  AlertTriangle,
  Wallet,
  FileCheck,
  Upload,
  RefreshCw,
  Trash2,
  Download,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CompanyProfileConfig } from '../types';

export type NavTab = 'reconciliation' | 'rules' | 'exceptions' | 'cash' | 'audit';

interface Props {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onLoadDemoBatch: () => void;
  onOpenCsvUpload: () => void;
  onClearData: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  totalExceptionsCount: number;
  config: CompanyProfileConfig;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onLoadDemoBatch,
  onOpenCsvUpload,
  onClearData,
  onExportJson,
  onExportCsv,
  totalExceptionsCount,
  config,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-300 bg-[#0F172A] text-white shadow-md">
      {/* Brand & Global Metadata Strip */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 font-serif font-bold text-white shadow-xs">
            L
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-bold tracking-tight text-white">
                Ledgerly
              </h1>
              <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800 tracking-wider uppercase">
                Finance Controller
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-700 font-mono">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                Local Processing (In-Browser)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
              {config.companyName} • {config.fiscalYear} • Track 04 Buildathon Prototype
            </div>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-load-demo-batch-top"
            onClick={onLoadDemoBatch}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors shadow-2xs cursor-pointer"
            title="Load 65+ synthetic Indian finance records"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Load Demo Batch</span>
            <span className="md:hidden">Demo</span>
          </button>

          <button
            id="btn-upload-csv-top"
            onClick={onOpenCsvUpload}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Upload CSVs</span>
          </button>

          <div className="hidden lg:flex items-center gap-1 border-l border-slate-700 pl-2">
            <button
              id="btn-quick-export-json"
              onClick={onExportJson}
              className="rounded bg-slate-800/80 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Export JSON
            </button>
            <button
              id="btn-quick-export-csv"
              onClick={onExportCsv}
              className="rounded bg-slate-800/80 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Export CSV
            </button>
          </div>

          <button
            id="btn-clear-local-data-top"
            onClick={onClearData}
            title="Clear locally stored data"
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="border-t border-slate-800 bg-[#0B1120]">
        <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6 scrollbar-none">
          <nav className="flex space-x-1 py-1.5">
            <button
              id="nav-tab-reconciliation"
              onClick={() => onSelectTab('reconciliation')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-bold transition-colors ${
                activeTab === 'reconciliation'
                  ? 'bg-slate-800 text-emerald-400 shadow-2xs border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Layers className="h-4 w-4" />
              Reconciliation Workspace
            </button>

            <button
              id="nav-tab-rules"
              onClick={() => onSelectTab('rules')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-bold transition-colors ${
                activeTab === 'rules'
                  ? 'bg-slate-800 text-emerald-400 shadow-2xs border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Scale className="h-4 w-4" />
              Rules & Compliance
              <span className="rounded bg-emerald-950 text-[10px] px-1 py-0.2 text-emerald-300 font-mono border border-emerald-800">
                v1.0
              </span>
            </button>

            <button
              id="nav-tab-exceptions"
              onClick={() => onSelectTab('exceptions')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-bold transition-colors ${
                activeTab === 'exceptions'
                  ? 'bg-slate-800 text-emerald-400 shadow-2xs border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Exceptions & Discrepancies
              {totalExceptionsCount > 0 && (
                <span className="rounded-full bg-amber-500/20 text-amber-300 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                  {totalExceptionsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-cash"
              onClick={() => onSelectTab('cash')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-bold transition-colors ${
                activeTab === 'cash'
                  ? 'bg-slate-800 text-emerald-400 shadow-2xs border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Wallet className="h-4 w-4" />
              Cash & Settlement Intelligence
            </button>

            <button
              id="nav-tab-audit"
              onClick={() => onSelectTab('audit')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-bold transition-colors ${
                activeTab === 'audit'
                  ? 'bg-slate-800 text-emerald-400 shadow-2xs border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <FileCheck className="h-4 w-4" />
              Audit Trail & Reports
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
