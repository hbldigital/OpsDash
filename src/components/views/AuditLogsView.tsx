/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { History, Shield, Search, Filter, Lock } from 'lucide-react';
import { AuditLogEntry } from '../../types/dashboard';

interface AuditLogsViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.officeCode && l.officeCode.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchSearch) return false;
      if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
      return true;
    });
  }, [logs, searchTerm, actionFilter]);

  const actionColors: Record<string, string> = {
    CONFIRM_IMPORT: 'text-emerald-400 bg-emerald-950 border-emerald-800',
    CORRECT_REPORT: 'text-amber-400 bg-amber-950 border-amber-800',
    EXECUTE_OCR: 'text-blue-400 bg-blue-950 border-blue-800',
    LOGIN: 'text-slate-300 bg-slate-800 border-slate-700',
    CONFIG_CHANGE: 'text-purple-400 bg-purple-950 border-purple-800',
    RESOLVE_DISCREPANCY: 'text-cyan-400 bg-cyan-950 border-cyan-800',
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <span>Immutable Audit Log & Governance Records</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically sealed activity log recording all report submissions, OCR runs, corrections, and administrative modifications.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audit Logging Active</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search logs by officer, action, office..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-64"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Actions</option>
          <option value="CONFIRM_IMPORT">Confirm Import</option>
          <option value="CORRECT_REPORT">Correct Report</option>
          <option value="EXECUTE_OCR">Execute OCR</option>
          <option value="RESOLVE_DISCREPANCY">Resolve Discrepancy</option>
          <option value="CONFIG_CHANGE">Config Change</option>
          <option value="LOGIN">Login</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-2.5 px-3">Timestamp (UTC / PKT)</th>
                <th className="py-2.5 px-3">Officer</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3 min-w-[280px]">Audit Event Details</th>
                <th className="py-2.5 px-3">Target Office</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-100">{log.userName}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{log.userRole}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                        actionColors[log.action] || 'text-slate-300 bg-slate-800 border-slate-700'
                      }`}
                    >
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{log.details}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{log.officeCode || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
