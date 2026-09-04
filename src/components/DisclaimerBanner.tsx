/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Mandatory Prototype Compliance Screening Disclaimer
 * Required by Master Prompt Section 6
 */

import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface Props {
  className?: string;
  variant?: 'banner' | 'card';
}

export const MANDATORY_DISCLAIMER_TEXT =
  'Prototype compliance screening only. This application does not replace professional advice, official government portals, contractual settlement terms, statutory filings, bank records, or a qualified accountant, tax adviser, or auditor. Verify all filing requirements, tax rates, thresholds, and payment timelines against current official sources before acting.';

export const DisclaimerBanner: React.FC<Props> = ({ className = '', variant = 'banner' }) => {
  return (
    <div
      id="mandatory-prototype-disclaimer"
      className={`rounded-lg border border-amber-300/80 bg-amber-50/90 p-4 text-amber-950 shadow-xs ${className}`}
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
        <div className="flex-1 text-xs leading-relaxed font-medium">
          <span className="font-bold text-amber-900 tracking-wide uppercase mr-1.5 text-[11px] inline-block px-1.5 py-0.5 bg-amber-200/80 rounded">
            Mandatory Disclaimer
          </span>
          {MANDATORY_DISCLAIMER_TEXT}
        </div>
      </div>
    </div>
  );
};
