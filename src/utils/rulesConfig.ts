/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Rules Configuration & Company Profile Storage Manager
 * Persisted in browser localStorage
 */

import { CompanyProfileConfig, DEFAULT_COMPANY_PROFILE } from '../types';

export const DEFAULT_RULES_CONFIG: CompanyProfileConfig = DEFAULT_COMPANY_PROFILE;

const STORAGE_KEY = 'ledgerly_rules_config_v1';

export function getStoredRulesConfig(): CompanyProfileConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_COMPANY_PROFILE, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to load rules configuration from localStorage:', err);
  }
  return { ...DEFAULT_COMPANY_PROFILE };
}

export const getRulesConfig = getStoredRulesConfig;

export function saveRulesConfig(config: CompanyProfileConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save rules configuration to localStorage:', err);
  }
}

export function resetRulesConfig(): CompanyProfileConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset rules configuration:', err);
  }
  return { ...DEFAULT_COMPANY_PROFILE };
}
