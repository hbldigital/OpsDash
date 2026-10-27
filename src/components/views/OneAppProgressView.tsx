/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Smartphone, AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { OfficeDailyReport, ZoneSummaryMetrics } from '../../types/dashboard';
import { formatPercentage } from '../../utils/calculations';

interface OneAppProgressViewProps {
  summary: ZoneSummaryMetrics;
  offices: OfficeDailyReport[];
  currentDate: string;
}

export const OneAppProgressView: React.FC<OneAppProgressViewProps> = ({
  summary,
  offices,
  currentDate,
}) => {
  const chartData = offices.map((o) => ({
    name: o.officeName.replace(/^(DAU|NRC)\s+/i, ''),
    issued: o.oneappIssued,
    processed: o.oneappProcessed,
    skipped: o.oneappSkipped,
    remaining: o.oneappRemaining,
  }));

  const handledTotal = summary.totalOneappProcessed + summary.totalOneappSkipped;

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-xl font-bold text-slate-100">
          OneApp Progress & Booking Reconciliation
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          OneApp transaction identifier (TID) tracking, booking completion, skip log analysis, and audit reconciliation.
        </p>
      </div>

      {/* Primary Reconciliation Banner Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">Zone OneApp Reconciliation Rate</div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {formatPercentage(summary.zoneOneappReconciliationPercentage)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Handled ({handledTotal.toLocaleString()} = {summary.totalOneappProcessed.toLocaleString()} Processed + {summary.totalOneappSkipped.toLocaleString()} Skipped) of {summary.totalOneappIssued.toLocaleString()} Issued TIDs.
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Unaccounted / Open TIDs</div>
            <div
              className={`text-2xl font-bold mt-1 ${
                summary.totalOneappRemaining > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {summary.totalOneappRemaining.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Must equal 0 for full audit closure</div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden flex border border-slate-800">
            <div
              style={{
                width: `${summary.totalOneappIssued > 0 ? (summary.totalOneappProcessed / summary.totalOneappIssued) * 100 : 0}%`,
              }}
              className="bg-emerald-500 h-full"
              title={`Processed: ${summary.totalOneappProcessed}`}
            />
            <div
              style={{
                width: `${summary.totalOneappIssued > 0 ? (summary.totalOneappSkipped / summary.totalOneappIssued) * 100 : 0}%`,
              }}
              className="bg-amber-500 h-full"
              title={`Skipped: ${summary.totalOneappSkipped}`}
            />
            {summary.totalOneappRemaining > 0 && (
              <div
                style={{
                  width: `${summary.totalOneappIssued > 0 ? (summary.totalOneappRemaining / summary.totalOneappIssued) * 100 : 0}%`,
                }}
                className="bg-slate-700 h-full"
                title={`Unaccounted: ${summary.totalOneappRemaining}`}
              />
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
              Processed ({summary.totalOneappProcessed.toLocaleString()})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
              Skipped ({summary.totalOneappSkipped.toLocaleString()})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-700 inline-block"></span>
              Unaccounted ({summary.totalOneappRemaining.toLocaleString()})
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>OneApp TIDs Issued</span>
            <Smartphone className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {summary.totalOneappIssued.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Booked customer sessions</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Processed OneApp</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {summary.totalOneappProcessed.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Biometrics and form completed</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Skipped OneApp TIDs</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            {summary.totalOneappSkipped.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cancelled, absent or skipped</div>
        </div>
      </div>

      {/* Office Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-1">
          OneApp Handling Breakdown by Office
        </h2>
        <p className="text-xs text-slate-400 mb-3">Issued TIDs vs Processed and Skipped outcomes.</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-30} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              />
              <Bar dataKey="issued" name="Issued" fill="#3b82f6" />
              <Bar dataKey="processed" name="Processed" fill="#10b981" />
              <Bar dataKey="skipped" name="Skipped" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Office-wise Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-100">
            Office OneApp Booking & Reconciliation Status — {currentDate}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Office Name</th>
                <th className="py-2.5 px-3 text-right">TIDs Issued</th>
                <th className="py-2.5 px-3 text-right">Processed</th>
                <th className="py-2.5 px-3 text-right">Skipped</th>
                <th className="py-2.5 px-3 text-right">Remaining Unaccounted</th>
                <th className="py-2.5 px-3 text-right font-semibold">Reconciliation %</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {offices.map((o) => {
                const isOver = o.oneappProcessed + o.oneappSkipped > o.oneappIssued;
                const isClean = o.oneappRemaining === 0 && o.oneappIssued > 0;
                return (
                  <tr key={o.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-mono text-slate-400">{o.officeCode}</td>
                    <td className="py-2 px-3 font-medium text-slate-200">{o.officeName}</td>
                    <td className="py-2 px-3 text-right">{o.oneappIssued}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-medium">{o.oneappProcessed}</td>
                    <td className="py-2 px-3 text-right text-amber-400">{o.oneappSkipped}</td>
                    <td className="py-2 px-3 text-right font-semibold">
                      {o.oneappRemaining > 0 ? (
                        <span className="text-amber-400">{o.oneappRemaining}</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-100">
                      {formatPercentage(o.oneappReconciliationPercentage)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {isOver ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-rose-950 text-rose-300 border border-rose-800">
                          Overcounted Discrepancy
                        </span>
                      ) : isClean ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Reconciled (100%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-950 text-amber-300 border border-amber-800">
                          {o.oneappRemaining} Open
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950 font-bold text-slate-100 border-t-2 border-slate-700">
                <td className="py-3 px-3">TOTAL</td>
                <td className="py-3 px-3">Zone-D Larkana Consolidated</td>
                <td className="py-3 px-3 text-right">{summary.totalOneappIssued}</td>
                <td className="py-3 px-3 text-right text-emerald-400">{summary.totalOneappProcessed}</td>
                <td className="py-3 px-3 text-right text-amber-400">{summary.totalOneappSkipped}</td>
                <td className="py-3 px-3 text-right">{summary.totalOneappRemaining}</td>
                <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                  {formatPercentage(summary.zoneOneappReconciliationPercentage)}
                </td>
                <td className="py-3 px-3 text-center">Audit Total</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
