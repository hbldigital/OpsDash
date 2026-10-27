/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Building2, CheckCircle2 } from 'lucide-react';
import { Office, OfficeDailyReport } from '../../types/dashboard';
import {
  calculateQMatic,
  calculateOneApp,
  calculateAttendance,
  formatPercentage,
} from '../../utils/calculations';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  offices: Office[];
  initialOfficeCode?: string;
  currentDate: string;
  onSaveReport: (reportData: any) => Promise<boolean>;
  existingReports: OfficeDailyReport[];
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  offices,
  initialOfficeCode,
  currentDate,
  onSaveReport,
  existingReports,
}) => {
  const [selectedCode, setSelectedCode] = useState(initialOfficeCode || offices[0]?.code || 'LKR-01');
  const [reportDate, setReportDate] = useState(currentDate);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [totalEmployees, setTotalEmployees] = useState(10);
  const [lateAfter745, setLateAfter745] = useState(1);
  const [lateAfter800, setLateAfter800] = useState(0);
  const [qmaticIssued, setQmaticIssued] = useState(120);
  const [qmaticProcessed, setQmaticProcessed] = useState(115);
  const [oneappIssued, setOneappIssued] = useState(115);
  const [oneappProcessed, setOneappProcessed] = useState(108);
  const [oneappSkipped, setOneappSkipped] = useState(7);
  const [approvedOneApp, setApprovedOneApp] = useState(105);
  const [mbvs, setMbvs] = useState(4);
  const [proofOfLife, setProofOfLife] = useState(2);
  const [pakidApproved, setPakidApproved] = useState(12);
  const [pakidDeferred, setPakidDeferred] = useState(2);
  const [pakidCorrection, setPakidCorrection] = useState(1);

  // Sync when office or date changes
  useEffect(() => {
    if (initialOfficeCode) {
      setSelectedCode(initialOfficeCode);
    }
    const existing = existingReports.find(
      (r) => r.officeCode.toUpperCase() === (initialOfficeCode || selectedCode).toUpperCase() && r.date === reportDate
    );
    if (existing) {
      setTotalEmployees(existing.totalEmployees);
      setLateAfter745(existing.lateAfter745);
      setLateAfter800(existing.lateAfter800);
      setQmaticIssued(existing.qmaticIssued);
      setQmaticProcessed(existing.qmaticProcessed);
      setOneappIssued(existing.oneappIssued);
      setOneappProcessed(existing.oneappProcessed);
      setOneappSkipped(existing.oneappSkipped);
      setApprovedOneApp(existing.approvedOneApp);
      setMbvs(existing.diminishedFingerprintsMBVS);
      setProofOfLife(existing.proofOfLifeCertificates);
      setPakidApproved(existing.pakidApproved);
      setPakidDeferred(existing.pakidDeferred);
      setPakidCorrection(existing.pakidCorrection);
    }
  }, [initialOfficeCode, selectedCode, reportDate, existingReports]);

  if (!isOpen) return null;

  const currentOffice = offices.find((o) => o.code === selectedCode);

  // Live calculations
  const qmaticCalc = calculateQMatic(Number(qmaticIssued) || 0, Number(qmaticProcessed) || 0);
  const oneappCalc = calculateOneApp(
    Number(oneappIssued) || 0,
    Number(oneappProcessed) || 0,
    Number(oneappSkipped) || 0
  );
  const attCalc = calculateAttendance(
    Number(totalEmployees) || 0,
    Number(lateAfter745) || 0,
    Number(lateAfter800) || 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (attCalc.hasDiscrepancy) {
      setErrorMsg(attCalc.error || 'Attendance validation error');
      return;
    }

    setIsSubmitting(true);
    const success = await onSaveReport({
      date: reportDate,
      officeCode: selectedCode,
      officeName: currentOffice?.name || selectedCode,
      totalEmployees: Number(totalEmployees),
      lateAfter745: Number(lateAfter745),
      lateAfter800: Number(lateAfter800),
      qmaticIssued: Number(qmaticIssued),
      qmaticProcessed: Number(qmaticProcessed),
      oneappIssued: Number(oneappIssued),
      oneappProcessed: Number(oneappProcessed),
      oneappSkipped: Number(oneappSkipped),
      approvedOneApp: Number(approvedOneApp),
      diminishedFingerprintsMBVS: Number(mbvs),
      proofOfLifeCertificates: Number(proofOfLife),
      pakidApproved: Number(pakidApproved),
      pakidDeferred: Number(pakidDeferred),
      pakidCorrection: Number(pakidCorrection),
      correctionReason: reason || 'Manual verification update',
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl my-8">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Manual Office Daily Entry & Correction Form
              </h2>
              <p className="text-[11px] text-slate-400">Zone-D Larkana Operational Records</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Office & Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select DAU / NRC Office <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-semibold focus:outline-none"
              >
                {offices.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.code} — {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reporting Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-semibold focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Attendance Section */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Employee Attendance</span>
              <span className="text-[11px] text-emerald-400 font-normal">
                On-Time: {attCalc.onTime}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Total Reported</label>
                <input
                  type="number"
                  min="0"
                  value={totalEmployees}
                  onChange={(e) => setTotalEmployees(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-amber-400 mb-1">Late &gt; 07:45 AM</label>
                <input
                  type="number"
                  min="0"
                  value={lateAfter745}
                  onChange={(e) => setLateAfter745(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 text-amber-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-rose-400 mb-1">Late &gt; 08:00 AM</label>
                <input
                  type="number"
                  min="0"
                  value={lateAfter800}
                  onChange={(e) => setLateAfter800(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 text-rose-300 rounded text-xs"
                />
              </div>
            </div>
            {attCalc.hasDiscrepancy && (
              <p className="text-[11px] text-rose-400 font-medium">{attCalc.error}</p>
            )}
          </div>

          {/* Q-Matic Section */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Q-Matic Token Queue</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Rate: <strong className="text-emerald-400">{formatPercentage(qmaticCalc.percentage)}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tokens Issued</label>
                <input
                  type="number"
                  min="0"
                  value={qmaticIssued}
                  onChange={(e) => setQmaticIssued(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tokens Processed</label>
                <input
                  type="number"
                  min="0"
                  value={qmaticProcessed}
                  onChange={(e) => setQmaticProcessed(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* OneApp Section */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>OneApp Booking & Reconciliation</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Reconciliation:{' '}
                <strong className="text-indigo-400">{formatPercentage(oneappCalc.percentage)}</strong>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">TIDs Issued</label>
                <input
                  type="number"
                  min="0"
                  value={oneappIssued}
                  onChange={(e) => setOneappIssued(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Processed</label>
                <input
                  type="number"
                  min="0"
                  value={oneappProcessed}
                  onChange={(e) => setOneappProcessed(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Skipped</label>
                <input
                  type="number"
                  min="0"
                  value={oneappSkipped}
                  onChange={(e) => setOneappSkipped(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
            </div>
            {oneappCalc.remaining > 0 && (
              <p className="text-[11px] text-amber-400">
                Notice: {oneappCalc.remaining} OneApp TIDs remain unaccounted for.
              </p>
            )}
          </div>

          {/* Approvals & Certificates */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-300">Approvals & Specialized Certificates</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-emerald-400 mb-1">Approved OneApp</label>
                <input
                  type="number"
                  min="0"
                  value={approvedOneApp}
                  onChange={(e) => setApprovedOneApp(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 text-emerald-300 font-bold rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Diminished MBVS</label>
                <input
                  type="number"
                  min="0"
                  value={mbvs}
                  onChange={(e) => setMbvs(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Proof of Life</label>
                <input
                  type="number"
                  min="0"
                  value={proofOfLife}
                  onChange={(e) => setProofOfLife(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Pak-ID Approved</label>
                <input
                  type="number"
                  min="0"
                  value={pakidApproved}
                  onChange={(e) => setPakidApproved(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Pak-ID Deferred</label>
                <input
                  type="number"
                  min="0"
                  value={pakidDeferred}
                  onChange={(e) => setPakidDeferred(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Pak-ID Correction</label>
                <input
                  type="number"
                  min="0"
                  value={pakidCorrection}
                  onChange={(e) => setPakidCorrection(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Audit Reason */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Audit Reason / Verification Note
            </label>
            <input
              type="text"
              placeholder="e.g. Counter shift adjustment verified by DAU incharge"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Commit Daily Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
