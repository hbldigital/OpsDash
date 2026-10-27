import React, { useState } from 'react';
import {
  Building2,
  Ticket,
  Smartphone,
  CheckCircle2,
  Fingerprint,
  ScanFace,
  FileCheck2,
  Clock,
  AlertTriangle,
  Edit3,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { DailyReport, Office, User } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';

interface OfficeDashboardProps {
  offices: Office[];
  currentOfficeCode: string;
  onOfficeChange: (code: string) => void;
  reports: DailyReport[];
  currentDate: string;
  onBackToOverview: () => void;
  currentUser: User | null;
  onOpenCorrectionModal: (report: DailyReport) => void;
  onSelectOfficeProfile?: (officeCode: string) => void;
}

export const OfficeDashboard: React.FC<OfficeDashboardProps> = ({
  offices,
  currentOfficeCode,
  onOfficeChange,
  reports,
  currentDate,
  onBackToOverview,
  currentUser,
  onOpenCorrectionModal,
  onSelectOfficeProfile,
}) => {
  const currentOffice = offices.find((o) => o.code === currentOfficeCode) || offices[0];
  const report = reports.find((r) => r.officeCode === currentOffice?.code);

  const canEdit =
    currentUser?.role === 'Super Administrator' ||
    currentUser?.role === 'Zone Administrator' ||
    currentUser?.role === 'Reporting Administrator' ||
    (currentUser?.role === 'Office Data Entry Operator' && currentUser.officeCode === currentOffice?.code);

  return (
    <div className="space-y-6">
      {/* Top Office Selector & Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={onBackToOverview}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
              title="Return to Executive Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-400 font-mono">
                  {currentOffice?.code}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">
                  District: {currentOffice?.district}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">Type: {currentOffice?.type}</span>
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
                {currentOffice?.name}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Office Switcher Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="office-select" className="text-xs text-slate-400 whitespace-nowrap">
                Select DAU / NRC:
              </label>
              <select
                id="office-select"
                value={currentOffice?.code}
                onChange={(e) => onOfficeChange(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {offices.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.code} — {o.name}
                  </option>
                ))}
              </select>
            </div>

            {onSelectOfficeProfile && currentOffice && (
              <button
                onClick={() => onSelectOfficeProfile(currentOffice.code)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 rounded-lg border border-emerald-800/50 transition-colors"
                title="View full office profile and staff contacts"
              >
                <Building2 className="w-3.5 h-3.5" />
                Office Profile
              </button>
            )}

            {report && canEdit && (
              <button
                onClick={() => onOpenCorrectionModal(report)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Correct Figures
              </button>
            )}
          </div>
        </div>

        {/* Office Status Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              Reporting Status:{' '}
              {report ? <StatusBadge status={report.reportingStatus} /> : <span className="text-rose-400 font-semibold">Missing Report</span>}
            </span>
            <span>·</span>
            <span>Date: <strong className="text-white font-mono">{currentDate}</strong></span>
            <span>·</span>
            <span>Daily Capacity: <strong className="text-white tabular-nums">{currentOffice?.dailyCapacity || 250} tokens/day</strong></span>
          </div>
          {report && (
            <div className="text-[11px] text-slate-400">
              Submitted: {(() => {
                const ts = report.updatedAt || report.createdAt;
                if (!ts) return 'Recorded';
                const d = new Date(ts);
                return isNaN(d.getTime()) ? 'Recorded' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              })()} by {report.submittedBy || 'Operations Desk'}
            </div>
          )}
        </div>
      </div>

      {!report ? (
        <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Report Submitted for Selected Date</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            This office has not submitted operational progress figures for {currentDate}. You can record manual data or upload the daily scanned report sheet.
          </p>
        </div>
      ) : (
        <>
          {/* Discrepancy Alert */}
          {report.hasDiscrepancy && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-amber-300">Operational Discrepancy Flagged</div>
                <div>{report.discrepancyDetails || 'Reconciliation mismatch detected.'}</div>
              </div>
            </div>
          )}

          {/* Core Office KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <KpiCard
              title="Q-Matic Tokens Issued"
              value={report.qmaticIssued}
              subtitle="Citizens in token queue"
              icon={Ticket}
            />
            <KpiCard
              title="Q-Matic Processed"
              value={report.qmaticProcessed}
              subtitle={`Processing Rate: ${report.qmaticPercentage !== null ? `${report.qmaticPercentage}%` : 'N/A'}`}
              icon={CheckCircle2}
              status={report.qmaticPercentage && report.qmaticPercentage < 90 ? 'warning' : 'nominal'}
            />
            <KpiCard
              title="OneApp TIDs Issued"
              value={report.oneAppIssued}
              subtitle="Registered service bookings"
              icon={Smartphone}
            />
            <KpiCard
              title="OneApp Reconciliation"
              value={
                report.oneAppReconciliationPercentage !== null
                  ? `${report.oneAppReconciliationPercentage}%`
                  : 'N/A'
              }
              subtitle={
                report.oneAppRemaining > 0
                  ? `${report.oneAppRemaining} Unaccounted TIDs`
                  : '100% Fully reconciled'
              }
              icon={Smartphone}
              status={report.oneAppRemaining > 0 ? 'warning' : 'nominal'}
            />
            <KpiCard
              title="Approved OneApp"
              value={report.approvedOneApp}
              subtitle={`Prev Day: ${report.previousDayApproved}`}
              change={report.approvedOneApp - report.previousDayApproved}
              icon={CheckCircle2}
            />
            <KpiCard
              title="Diminished MBVS"
              value={report.diminishedFingerprintsMBVS}
              subtitle="Fingerprint bypass verifications"
              icon={Fingerprint}
            />
            <KpiCard
              title="Proof of Life"
              value={report.proofOfLife}
              subtitle="Life certificate issues"
              icon={ScanFace}
            />
            <KpiCard
              title="Pak-ID Approved"
              value={report.pakidApproved}
              subtitle={`Deferred: ${report.pakidDeferred} | Corr: ${report.pakidCorrection}`}
              icon={FileCheck2}
            />
          </div>

          {/* Attendance & Processed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Attendance Details */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Employee Attendance Statistics
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Staff Reported</div>
                  <div className="text-xl font-bold text-white tabular-nums">{report.totalEmployees}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Punctual (On-Time)</div>
                  <div className="text-xl font-bold text-emerald-400 tabular-nums">{report.onTimeEmployees}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-amber-400">Late after 07:45 AM</div>
                  <div className="text-xl font-bold text-amber-400 tabular-nums">{report.lateAfter745}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-rose-400">Late after 08:00 AM</div>
                  <div className="text-xl font-bold text-rose-400 tabular-nums">{report.lateAfter800}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                Note: Late arrivals after 08:00 AM are a subset of arrivals after 07:45 AM. Punctual count is derived as Total ({report.totalEmployees}) - Late after 07:45 ({report.lateAfter745}) = {report.onTimeEmployees}.
              </div>
            </div>

            {/* Reconciliation Progress Details */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  OneApp Reconciliation Formula
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">
                  Formula: ((Processed [{report.oneAppProcessed}] + Skipped [{report.oneAppSkipped}]) / Issued [{report.oneAppIssued}]) × 100
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Reconciliation Completion</span>
                    <span className="font-bold text-white tabular-nums">
                      {report.oneAppReconciliationPercentage !== null ? `${report.oneAppReconciliationPercentage}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        (report.oneAppReconciliationPercentage || 0) < 100 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, report.oneAppReconciliationPercentage || 0)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
                <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Processed</div>
                  <div className="text-sm font-bold text-emerald-400 tabular-nums">{report.oneAppProcessed}</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Skipped</div>
                  <div className="text-sm font-bold text-slate-300 tabular-nums">{report.oneAppSkipped}</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Unaccounted</div>
                  <div
                    className={`text-sm font-bold tabular-nums ${
                      report.oneAppRemaining > 0 ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {report.oneAppRemaining}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
