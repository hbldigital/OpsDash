/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  X,
  Save,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { Office, DailyReport } from '../../types';
import { calculateQMatic, calculateOneApp, calculateAttendance } from '../../utils/calculations';

interface DailyReportManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  offices: Office[];
  currentDate: string;
  onSaveReport: (report: DailyReport) => Promise<void>;
}

export const DailyReportManualEntryModal: React.FC<DailyReportManualEntryModalProps> = ({
  isOpen,
  onClose,
  offices,
  currentDate,
  onSaveReport,
}) => {
  if (!isOpen) return null;

  const [selectedOfficeCode, setSelectedOfficeCode] = useState<string>(offices[0]?.code || '');
  const [date, setDate] = useState<string>(currentDate);

  // Metrics
  const [totalEmployees, setTotalEmployees] = useState<number>(() => {
    const off = offices.find((o) => o.code === selectedOfficeCode);
    return off?.expectedStaff || 10;
  });
  const [lateAfter745, setLateAfter745] = useState<number>(0);
  const [lateAfter800, setLateAfter800] = useState<number>(0);

  const [qmaticIssued, setQmaticIssued] = useState<number>(150);
  const [qmaticProcessed, setQmaticProcessed] = useState<number>(140);

  const [oneappIssued, setOneappIssued] = useState<number>(140);
  const [oneappProcessed, setOneappProcessed] = useState<number>(135);
  const [oneappSkipped, setOneappSkipped] = useState<number>(5);

  const [approvedOneApp, setApprovedOneApp] = useState<number>(130);
  const [prevDayApprovedOneApp, setPrevDayApprovedOneApp] = useState<number>(125);

  const [diminishedMBVS, setDiminishedMBVS] = useState<number>(4);
  const [proofOfLife, setProofOfLife] = useState<number>(2);

  const [pakidApproved, setPakidApproved] = useState<number>(15);
  const [pakidDeferred, setPakidDeferred] = useState<number>(2);
  const [pakidCorrection, setPakidCorrection] = useState<number>(1);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOffice = offices.find((o) => o.code === selectedOfficeCode) || offices[0];

  const handleOfficeSelect = (code: string) => {
    setSelectedOfficeCode(code);
    const off = offices.find((o) => o.code === code);
    if (off) {
      setTotalEmployees(off.expectedStaff || off.staffBreakdown?.totalStaff || 10);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffice) {
      setError('Please select an office.');
      return;
    }

    if (lateAfter800 > lateAfter745) {
      setError('Late arrivals after 08:00 AM cannot exceed late arrivals after 07:45 AM.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const qCalc = calculateQMatic(qmaticIssued, qmaticProcessed);
      const oneCalc = calculateOneApp(oneappIssued, oneappProcessed, oneappSkipped);
      const attCalc = calculateAttendance(totalEmployees, lateAfter745, lateAfter800);

      const report: DailyReport = {
        id: `rep-${date}-${selectedOffice.code}`,
        date,
        reportingDate: date,
        zone: selectedOffice.zone || 'Zone-D Larkana',
        zoneCode: selectedOffice.zoneCode || 'Z050D',
        officeCode: selectedOffice.code,
        officeName: selectedOffice.name,
        reportingStatus: 'REPORTED',
        submissionTime: new Date().toLocaleTimeString('en-US', { hour12: false }),

        totalEmployees,
        lateAfter745,
        lateAfter800,
        onTimeEmployees: attCalc.onTime,

        qmaticIssued,
        qmaticProcessed,
        qmaticRemaining: qCalc.remaining,
        qmaticPercentage: qCalc.percentage,

        oneAppIssued: oneappIssued,
        oneAppProcessed: oneappProcessed,
        oneAppSkipped: oneappSkipped,
        oneAppRemaining: oneCalc.remaining,
        oneAppReconciliationPercentage: oneCalc.percentage,

        approvedOneApp,
        previousDayApproved: prevDayApprovedOneApp,
        approvedDifference: approvedOneApp - prevDayApprovedOneApp,

        diminishedFingerprintsMBVS: diminishedMBVS,
        proofOfLife,

        pakidApproved,
        pakidDeferred,
        pakidCorrection,

        hasDiscrepancy: qCalc.hasDiscrepancy || oneCalc.hasDiscrepancy || attCalc.hasDiscrepancy,
        discrepancies: [
          ...(qCalc.error ? [qCalc.error] : []),
          ...(oneCalc.error ? [oneCalc.error] : []),
          ...(attCalc.error ? [attCalc.error] : []),
        ],
        sourceType: 'MANUAL',
        submittedBy: 'Manual Operator',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSaveReport(report);
      onClose();
    } catch (err: any) {
      console.error('Failed to submit manual daily report:', err);
      setError(err.message || 'Failed to save daily operational report.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Manual Daily Operational Progress Entry
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Office and Date Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Select Center / NRC / Counter *</label>
              <select
                value={selectedOfficeCode}
                onChange={(e) => handleOfficeSelect(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 focus:outline-none"
              >
                {offices.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.name} [{o.code}] ({o.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Operational Reporting Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 1: Workforce & Punctuality */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              1. Employee Attendance &amp; Punctuality
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Total Staff on Duty</label>
                <input
                  type="number"
                  min="0"
                  value={totalEmployees}
                  onChange={(e) => setTotalEmployees(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Late (&gt; 07:45 AM)</label>
                <input
                  type="number"
                  min="0"
                  value={lateAfter745}
                  onChange={(e) => setLateAfter745(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Late (&gt; 08:00 AM)</label>
                <input
                  type="number"
                  min="0"
                  value={lateAfter800}
                  onChange={(e) => setLateAfter800(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-rose-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Q-Matic Token Management */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              2. Q-Matic Queue Tokens
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Tokens Issued</label>
                <input
                  type="number"
                  min="0"
                  value={qmaticIssued}
                  onChange={(e) => setQmaticIssued(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Tokens Processed</label>
                <input
                  type="number"
                  min="0"
                  value={qmaticProcessed}
                  onChange={(e) => setQmaticProcessed(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: OneApp Booking Reconciliation */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              3. OneApp Electronic Application TIDs
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">TIDs Issued</label>
                <input
                  type="number"
                  min="0"
                  value={oneappIssued}
                  onChange={(e) => setOneappIssued(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Processed</label>
                <input
                  type="number"
                  min="0"
                  value={oneappProcessed}
                  onChange={(e) => setOneappProcessed(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-emerald-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Skipped / Abandoned</label>
                <input
                  type="number"
                  min="0"
                  value={oneappSkipped}
                  onChange={(e) => setOneappSkipped(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Verified Applications & Facial Recognition */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              4. Approved OneApp &amp; Biometric Bypasses
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Approved Today</label>
                <input
                  type="number"
                  min="0"
                  value={approvedOneApp}
                  onChange={(e) => setApprovedOneApp(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-emerald-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Previous Day Approved</label>
                <input
                  type="number"
                  min="0"
                  value={prevDayApprovedOneApp}
                  onChange={(e) => setPrevDayApprovedOneApp(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">MBVS (Diminished FP)</label>
                <input
                  type="number"
                  min="0"
                  value={diminishedMBVS}
                  onChange={(e) => setDiminishedMBVS(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Proof of Life Cert</label>
                <input
                  type="number"
                  min="0"
                  value={proofOfLife}
                  onChange={(e) => setProofOfLife(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Pak-ID Outcomes */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              5. Pak-ID Online Portal Approvals &amp; Corrections
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Approved</label>
                <input
                  type="number"
                  min="0"
                  value={pakidApproved}
                  onChange={(e) => setPakidApproved(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-emerald-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Deferred / Sent</label>
                <input
                  type="number"
                  min="0"
                  value={pakidDeferred}
                  onChange={(e) => setPakidDeferred(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Correction Required</label>
                <input
                  type="number"
                  min="0"
                  value={pakidCorrection}
                  onChange={(e) => setPakidCorrection(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-rose-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Submitting Report...' : 'Save Operational Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
