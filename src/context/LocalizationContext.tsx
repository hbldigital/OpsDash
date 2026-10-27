/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface SystemConfig {
  zoneName: string;
  zoneCode: string;
  thresholdTime1: string; // e.g. "07:45"
  thresholdTime2: string; // e.g. "08:00"
  organizationName: string;
  customTexts: Record<string, string>;
}

export const DEFAULT_TEXTS: Record<string, string> = {
  appHeaderTitle: 'NADRA Zone-D Larkana Operational Intelligence',
  appHeaderSubtitle: 'National Database & Registration Authority — Regional Operations Dashboard',
  zoneTitle: 'Zone-D Larkana',
  zoneCode: 'Z050D',
  tableTitle: 'Consolidated Zone-D Larkana Office Operations Table',
  attendanceTitle: 'Workforce Attendance & Late-Arrival Analytics',
  attendanceSheetTitle: 'Daily Employees Attendance Sheet & Biometric Log',
  officeProfileTitle: 'NADRA Registration Center / DAU Official Profile',
  officeManagementTitle: 'Office & Registration Center (NRC / DAU) Directory',
  navExecutiveOverview: 'Executive Overview',
  navOfficeWise: 'Office Operations',
  navAttendance: 'Attendance Sheet',
  navQMatic: 'Q-Matic Ledger',
  navOneAppBooking: 'OneApp Booking',
  navApprovedOneApp: 'Approved OneApp',
  navFacialRecognition: 'Facial Certificates',
  navPakId: 'Pak-ID Processing',
  navUploadOcr: 'OCR Document Intake',
  navDailyReports: 'Daily Reports Archive',
  navHistoricalAnalytics: 'Trend Analytics',
  navDataQuality: 'Data Quality & Audit',
  navUserManagement: 'User Management',
  navOfficeManagement: 'Office Management',
  navAuditLogs: 'Audit Logs',
  navSettings: 'System Settings',
  footerText: 'National Database & Registration Authority (NADRA) Pakistan — Zone-D Larkana Operations',
};

interface LocalizationContextType {
  customTexts: Record<string, string>;
  threshold1: string;
  threshold2: string;
  zoneName: string;
  zoneCode: string;
  getText: (key: string, defaultFallback?: string) => string;
  updateText: (key: string, value: string) => Promise<void>;
  updateAllTexts: (newTexts: Record<string, string>) => Promise<void>;
  updateTimings: (t1: string, t2: string, newZoneName?: string, newZoneCode?: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isLoaded: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customTexts, setCustomTexts] = useState<Record<string, string>>(DEFAULT_TEXTS);
  const [threshold1, setThreshold1] = useState('07:45');
  const [threshold2, setThreshold2] = useState('08:00');
  const [zoneName, setZoneName] = useState('Larkana');
  const [zoneCode, setZoneCode] = useState('Z050D');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load configuration from server settings API
  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        if (s.thresholdTime1) setThreshold1(s.thresholdTime1.slice(0, 5));
        if (s.thresholdTime2) setThreshold2(s.thresholdTime2.slice(0, 5));
        if (s.zoneName) setZoneName(s.zoneName);
        if (s.zoneCode) setZoneCode(s.zoneCode);
        if (s.customTexts && Object.keys(s.customTexts).length > 0) {
          setCustomTexts((prev) => ({
            ...prev,
            ...s.customTexts,
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to load settings from server, using local defaults:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const getText = useCallback(
    (key: string, defaultFallback?: string): string => {
      if (customTexts[key] !== undefined && customTexts[key].trim() !== '') {
        return customTexts[key];
      }
      return defaultFallback !== undefined ? defaultFallback : DEFAULT_TEXTS[key] || key;
    },
    [customTexts]
  );

  const updateText = async (key: string, value: string) => {
    const updated = { ...customTexts, [key]: value };
    setCustomTexts(updated);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customTexts: updated }),
      });
    } catch (err) {
      console.error('Failed to sync custom text to server:', err);
    }
  };

  const updateAllTexts = async (newTexts: Record<string, string>) => {
    const merged = { ...customTexts, ...newTexts };
    setCustomTexts(merged);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customTexts: merged }),
      });
    } catch (err) {
      console.error('Failed to update texts:', err);
    }
  };

  const updateTimings = async (
    t1: string,
    t2: string,
    newZoneName?: string,
    newZoneCode?: string
  ) => {
    setThreshold1(t1);
    setThreshold2(t2);
    if (newZoneName) setZoneName(newZoneName);
    if (newZoneCode) setZoneCode(newZoneCode);

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thresholdTime1: t1,
          thresholdTime2: t2,
          zoneName: newZoneName || zoneName,
          zoneCode: newZoneCode || zoneCode,
        }),
      });
    } catch (err) {
      console.error('Failed to sync updated timings to server:', err);
    }
  };

  const resetToDefaults = async () => {
    setCustomTexts(DEFAULT_TEXTS);
    setThreshold1('07:45');
    setThreshold2('08:00');
    setZoneName('Larkana');
    setZoneCode('Z050D');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thresholdTime1: '07:45',
          thresholdTime2: '08:00',
          zoneName: 'Larkana',
          zoneCode: 'Z050D',
          customTexts: DEFAULT_TEXTS,
        }),
      });
    } catch (err) {
      console.error('Failed to reset settings:', err);
    }
  };

  return (
    <LocalizationContext.Provider
      value={{
        customTexts,
        threshold1,
        threshold2,
        zoneName,
        zoneCode,
        getText,
        updateText,
        updateAllTexts,
        updateTimings,
        resetToDefaults,
        isLoaded,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const ctx = useContext(LocalizationContext);
  if (!ctx) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return ctx;
};
