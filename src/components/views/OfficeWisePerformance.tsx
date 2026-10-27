/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Calendar,
  Users,
  Ticket,
  Smartphone,
  CheckCircle,
  ScanFace,
  CreditCard,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Edit,
  History,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Office, OfficeDailyReport } from '../../types/dashboard';
import { formatPercentage } from '../../utils/calculations';

interface OfficeWisePerformanceProps {
  offices: Office[];
  dailyReports: OfficeDailyReport[];
  selectedOfficeCode: string;
  onSelectOfficeCode: (code: string) => void;
  currentDate: string;
  onOpenManualEntry: (officeCode: string) => void;
  onBackToExecutive: () => void;
}

export const OfficeWisePerformance: React.FC<OfficeWisePerformanceProps> = ({
  offices,
  dailyReports,
  selectedOfficeCode,
  onSelectOfficeCode,
  currentDate,
  onOpenManualEntry,
  onBackToExecutive,
}) => {
  const currentOffice = useMemo(() => {
    return offices.find((o) => o.code === selectedOfficeCode) || offices[0];
  }, [offices, selectedOfficeCode]);

  const currentReport = useMemo(() => {
    return dailyReports.find(
      (r) => r.officeCode.toUpperCase() === (currentOffice?.code || '').toUpperCase() && r.date === currentDate
    );
  }, [dailyReports, currentOffice, currentDate]);

  // Office reporting history across dates
  const officeHistory = useMemo(() => {
    if (!currentOffice) return [];
    return dailyReports
      .filter((r) => r.officeCode.toUpperCase() === currentOffice.code.toUpperCase())
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dailyReports, currentOffice]);

  // Trend data for small chart
  const trendData = useMemo(() => {
    return [...officeHistory]
      .reverse()
      .map((r) => ({
        date: r.date.substring(5), // MM-DD
        issued: r.oneappIssued,
        processed: r.oneappProcessed,
        approved: r.approvedOneApp,
        qmatic: r.qmaticProcessed,
      }));
  }, [officeHistory]);

  if (!currentOffice) {
    return <div className="text-slate-400 p-8 text-center">No office data available.</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Office Header & Selection Dropdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToExecutive}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
              title="Return to Executive Overview"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                  {currentOffice.code}
                </span>
                <h1 className="text-lg font-bold text-slate-100">
                  {currentOffice.name}
                </h1>
                <span className="px-2 py-0.5 text-xs rounded bg-blue-950 text-blue-300 border border-blue-800">
                  {currentOffice.type}
                </span>
                <span className="text-xs text-slate-400">
                  District {currentOffice.district}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {currentOffice.totalCounters} Operational Counters | Expected Staff: {currentOffice.expectedStaff} | Zone-D Larkana
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Office Switcher */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5">
              <span className="text-xs text-slate-400 font-medium">Switch Office:</span>
              <select
                value={currentOffice.code}
                onChange={(e) => onSelectOfficeCode(e.target.value)}
                className="bg-transparent text-slate-100 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {offices.map((o) => (
                  <option key={o.code} value={o.code} className="bg-slate-900 text-slate-100">
                    {o.code} - {o.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onOpenManualEntry(currentOffice.code)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Correct Office Data</span>
            </button>
          </div>
        </div>

        {/* Status Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <div>
              Status:{' '}
              {currentReport ? (
                <span className="text-emerald-400 font-semibold">Reported & Validated</span>
              ) : (
                <span className="text-amber-400 font-semibold">Report Pending for {currentDate}</span>
              )}
            </div>
            {currentReport?.submissionTime && (
              <div>Last Sync: {new Date(currentReport.submissionTime).toLocaleTimeString()}</div>
            )}
            {currentReport?.verifiedBy && (
              <div>Verified By: {currentReport.verifiedBy}</div>
            )}
          </div>
          {currentReport?.hasDiscrepancy && (
            <div className="flex items-center gap-1 text-amber-400 font-medium bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              <AlertTriangle className="w-3 h-3" />
              <span>{currentReport.discrepancies.join(' | ')}</span>
            </div>
          )}
        </div>
      </div>

      {currentReport ? (
        <>
          {/* Detailed Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Attendance Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Staff Attendance</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {currentReport.totalEmployees} <span className="text-xs text-slate-400 font-normal">present</span>
              </div>
              <div className="mt-3 space-y-1 text-xs border-t border-slate-800/80 pt-2">
                <div className="flex justify-between text-slate-300">
                  <span>On-time Staff:</span>
                  <span className="text-emerald-400 font-semibold">{currentReport.onTimeEmployees}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Late after 07:45 AM:</span>
                  <span className="text-amber-400 font-semibold">{currentReport.lateAfter745}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Late after 08:00 AM:</span>
                  <span className="text-rose-400 font-semibold">{currentReport.lateAfter800}</span>
                </div>
              </div>
            </div>

            {/* Q-Matic Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Q-Matic Token Rate</span>
                <Ticket className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                {formatPercentage(currentReport.qmaticPercentage)}
              </div>
              <div className="mt-3 space-y-1 text-xs border-t border-slate-800/80 pt-2">
                <div className="flex justify-between text-slate-300">
                  <span>Tokens Issued:</span>
                  <span className="font-semibold">{currentReport.qmaticIssued}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tokens Processed:</span>
                  <span className="font-semibold">{currentReport.qmaticProcessed}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Remaining / Unserved:</span>
                  <span className="font-semibold text-slate-400">{currentReport.qmaticRemaining}</span>
                </div>
              </div>
            </div>

            {/* OneApp Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>OneApp Reconciliation</span>
                <Smartphone className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-400">
                {formatPercentage(currentReport.oneappReconciliationPercentage)}
              </div>
              <div className="mt-3 space-y-1 text-xs border-t border-slate-800/80 pt-2">
                <div className="flex justify-between text-slate-300">
                  <span>TIDs Issued:</span>
                  <span className="font-semibold">{currentReport.oneappIssued}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Processed / Skipped:</span>
                  <span className="font-semibold">
                    {currentReport.oneappProcessed} / {currentReport.oneappSkipped}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Unaccounted TIDs:</span>
                  <span className={currentReport.oneappRemaining > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                    {currentReport.oneappRemaining}
                  </span>
                </div>
              </div>
            </div>

            {/* Approved & Certificates Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Approvals & Certificates</span>
                <CheckCircle className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-teal-400">
                {currentReport.approvedOneApp} <span className="text-xs text-slate-400 font-normal">apps</span>
              </div>
              <div className="mt-3 space-y-1 text-xs border-t border-slate-800/80 pt-2">
                <div className="flex justify-between text-slate-300">
                  <span>Diminished MBVS:</span>
                  <span className="font-semibold">{currentReport.diminishedFingerprintsMBVS}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Proof of Life:</span>
                  <span className="font-semibold">{currentReport.proofOfLifeCertificates}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Pak-ID (App/Def/Corr):</span>
                  <span className="font-semibold">
                    {currentReport.pakidApproved} / {currentReport.pakidDeferred} / {currentReport.pakidCorrection}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Office Historical Volume Trend Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-1">
              Multi-Day Performance Trajectory for {currentOffice.name}
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              OneApp volume and approval trajectory over recent reporting cycles.
            </p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="issued" name="OneApp Issued" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="processed" name="OneApp Processed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approved" name="Approved" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Submissions Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <span>Historical Reports Archive — {currentOffice.name}</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Staff</th>
                    <th className="py-2.5 px-3 text-right text-amber-400">Late &gt;07:45</th>
                    <th className="py-2.5 px-3 text-right">Q-Issued</th>
                    <th className="py-2.5 px-3 text-right">Q-Proc</th>
                    <th className="py-2.5 px-3 text-right">Q-%</th>
                    <th className="py-2.5 px-3 text-right">OneApp Issued</th>
                    <th className="py-2.5 px-3 text-right">OneApp Proc</th>
                    <th className="py-2.5 px-3 text-right">Recon %</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400">Approved OneApp</th>
                    <th className="py-2.5 px-3 text-right">Pak-ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {officeHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-medium text-slate-200">{h.date}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {h.reportingStatus}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">{h.totalEmployees}</td>
                      <td className="py-2 px-3 text-right text-amber-400">{h.lateAfter745}</td>
                      <td className="py-2 px-3 text-right">{h.qmaticIssued}</td>
                      <td className="py-2 px-3 text-right">{h.qmaticProcessed}</td>
                      <td className="py-2 px-3 text-right">{formatPercentage(h.qmaticPercentage)}</td>
                      <td className="py-2 px-3 text-right">{h.oneappIssued}</td>
                      <td className="py-2 px-3 text-right">{h.oneappProcessed}</td>
                      <td className="py-2 px-3 text-right">{formatPercentage(h.oneappReconciliationPercentage)}</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-bold">{h.approvedOneApp}</td>
                      <td className="py-2 px-3 text-right">{h.pakidApproved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-200">
            No Daily Report Filed for {currentOffice.name} on {currentDate}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            This office has not submitted its daily spreadsheet or manual entry for the selected date.
          </p>
          <button
            onClick={() => onOpenManualEntry(currentOffice.code)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Create Daily Entry for {currentOffice.code}
          </button>
        </div>
      )}
    </div>
  );
};
