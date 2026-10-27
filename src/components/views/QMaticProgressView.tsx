/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Ticket, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { OfficeDailyReport, ZoneSummaryMetrics } from '../../types/dashboard';
import { formatPercentage } from '../../utils/calculations';

interface QMaticProgressViewProps {
  summary: ZoneSummaryMetrics;
  offices: OfficeDailyReport[];
  currentDate: string;
}

export const QMaticProgressView: React.FC<QMaticProgressViewProps> = ({
  summary,
  offices,
  currentDate,
}) => {
  const chartData = offices.map((o) => ({
    name: o.officeName.replace(/^(DAU|NRC)\s+/i, ''),
    issued: o.qmaticIssued,
    processed: o.qmaticProcessed,
    remaining: o.qmaticRemaining,
  }));

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-xl font-bold text-slate-100">
          Q-Matic Token Queue & Counter Processing
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Q-Matic token generation, counter turnaround rate, and queue reconciliation across Zone-D Larkana.
        </p>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Q-Matic Issued</span>
            <Ticket className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {summary.totalQmaticIssued.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tokens dispensed at reception kiosks</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Processed on OneApp</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {summary.totalQmaticProcessed.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Served at counters</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Remaining / Unserved Tokens</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            {summary.totalQmaticRemaining.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Issued minus processed</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Processing Percentage</span>
            <Ticket className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {formatPercentage(summary.zoneQmaticPercentage)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total Processed ÷ Total Issued</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-1">
          Office-wise Q-Matic Queue Performance
        </h2>
        <p className="text-xs text-slate-400 mb-3">Issued tokens vs successfully processed tokens per location.</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-30} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              />
              <Bar dataKey="issued" name="Q-Matic Issued" fill="#3b82f6" />
              <Bar dataKey="processed" name="Processed" fill="#10b981" />
              <Bar dataKey="remaining" name="Remaining" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-100">
            Office Q-Matic Statistics Table — {currentDate}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Office Name</th>
                <th className="py-2.5 px-3 text-right">Issued</th>
                <th className="py-2.5 px-3 text-right">Processed</th>
                <th className="py-2.5 px-3 text-right">Remaining</th>
                <th className="py-2.5 px-3 text-right font-semibold">Processing %</th>
                <th className="py-2.5 px-3 text-center">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {offices.map((o) => {
                const isOver = o.qmaticProcessed > o.qmaticIssued;
                return (
                  <tr key={o.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-mono text-slate-400">{o.officeCode}</td>
                    <td className="py-2 px-3 font-medium text-slate-200">{o.officeName}</td>
                    <td className="py-2 px-3 text-right">{o.qmaticIssued}</td>
                    <td className="py-2 px-3 text-right">{o.qmaticProcessed}</td>
                    <td className="py-2 px-3 text-right text-slate-400">{o.qmaticRemaining}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-200">
                      {formatPercentage(o.qmaticPercentage)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {isOver ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-rose-950 text-rose-300 border border-rose-800">
                          Processed &gt; Issued Discrepancy
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Normal Flow
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
                <td className="py-3 px-3 text-right">{summary.totalQmaticIssued}</td>
                <td className="py-3 px-3 text-right">{summary.totalQmaticProcessed}</td>
                <td className="py-3 px-3 text-right text-slate-400">{summary.totalQmaticRemaining}</td>
                <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                  {formatPercentage(summary.zoneQmaticPercentage)}
                </td>
                <td className="py-3 px-3 text-center">Reconciled</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
