/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { OfficeDailyReport, ZoneSummaryMetrics } from '../../types/dashboard';

interface PakIdApprovalViewProps {
  summary: ZoneSummaryMetrics;
  offices: OfficeDailyReport[];
  currentDate: string;
}

export const PakIdApprovalView: React.FC<PakIdApprovalViewProps> = ({
  summary,
  offices,
  currentDate,
}) => {
  const chartData = offices.map((o) => ({
    name: o.officeName.replace(/^(DAU|NRC)\s+/i, ''),
    approved: o.pakidApproved,
    deferred: o.pakidDeferred,
    correction: o.pakidCorrection,
  }));

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-xl font-bold text-slate-100">
          Pak-ID Online Application Approval Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tracking Pak-ID identity document submissions, deferrals, and correction reviews across Zone-D Larkana.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pak-ID Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            {summary.totalPakidApproved.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Successfully approved applications</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Deferred / Sent for Approval</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">
            {summary.totalPakidDeferred.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Pending verification / escalation</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Correction Required</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 mt-2">
            {summary.totalPakidCorrection.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Discrepancy / citizen resubmission</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-1">
          Pak-ID Outcome Breakdown by Office
        </h2>
        <p className="text-xs text-slate-400 mb-3">Comparing Approved, Deferred, and Correction counts.</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-30} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="approved" name="Approved" fill="#10b981" />
              <Bar dataKey="deferred" name="Deferred / Sent for Approval" fill="#f59e0b" />
              <Bar dataKey="correction" name="Correction Required" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-100">
            Office Pak-ID Submissions Ledger — {currentDate}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Office Name</th>
                <th className="py-2.5 px-3 text-right text-emerald-400">Approved</th>
                <th className="py-2.5 px-3 text-right text-amber-400">Deferred / Sent for Approval</th>
                <th className="py-2.5 px-3 text-right text-rose-400">Correction</th>
                <th className="py-2.5 px-3 text-right">Total Cases</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {offices.map((o) => {
                const total = (o.pakidApproved || 0) + (o.pakidDeferred || 0) + (o.pakidCorrection || 0);
                return (
                  <tr key={o.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-mono text-slate-400">{o.date}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">{o.officeCode}</td>
                    <td className="py-2 px-3 font-medium text-slate-200">{o.officeName}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">{o.pakidApproved}</td>
                    <td className="py-2 px-3 text-right text-amber-400 font-medium">{o.pakidDeferred}</td>
                    <td className="py-2 px-3 text-right text-rose-400 font-medium">{o.pakidCorrection}</td>
                    <td className="py-2 px-3 text-right font-medium">{total}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Synchronized
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950 font-bold text-slate-100 border-t-2 border-slate-700">
                <td className="py-3 px-3">-</td>
                <td className="py-3 px-3">TOTAL</td>
                <td className="py-3 px-3">Zone-D Larkana Consolidated</td>
                <td className="py-3 px-3 text-right text-emerald-400 font-bold">{summary.totalPakidApproved}</td>
                <td className="py-3 px-3 text-right text-amber-400 font-bold">{summary.totalPakidDeferred}</td>
                <td className="py-3 px-3 text-right text-rose-400 font-bold">{summary.totalPakidCorrection}</td>
                <td className="py-3 px-3 text-right text-slate-100 font-bold">
                  {summary.totalPakidApproved + summary.totalPakidDeferred + summary.totalPakidCorrection}
                </td>
                <td className="py-3 px-3 text-center">Verified</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
