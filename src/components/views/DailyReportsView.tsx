import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  Clock,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { DailyReport, Office } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface DailyReportsViewProps {
  reports: DailyReport[];
  offices: Office[];
  currentDate: string;
  onSelectOffice: (officeCode: string) => void;
  onSelectReport: (report: DailyReport) => void;
  onSelectOfficeProfile?: (officeCode: string) => void;
}

export const DailyReportsView: React.FC<DailyReportsViewProps> = ({
  reports,
  offices,
  currentDate,
  onSelectOffice,
  onSelectReport,
  onSelectOfficeProfile,
}) => {
  const [search, setSearch] = useState('');
  const [selectedOfficeCode, setSelectedOfficeCode] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.officeName.toLowerCase().includes(search.toLowerCase()) ||
        r.officeCode.toLowerCase().includes(search.toLowerCase());
      const matchOffice = selectedOfficeCode === 'ALL' || r.officeCode === selectedOfficeCode;
      const matchStatus = statusFilter === 'ALL' || r.reportingStatus === statusFilter;
      return matchSearch && matchOffice && matchStatus;
    });
  }, [reports, search, selectedOfficeCode, statusFilter]);

  const handleExportCsv = () => {
    window.location.href = `/api/export?date=${currentDate}&format=csv`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <span>Historical Records & Archival Registers</span>
            <span>·</span>
            <span className="text-white font-mono">{currentDate}</span>
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
            Daily Operational Reports Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete database of confirmed office submissions, OCR batches, and supervisor verifications.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          Export All Records (CSV)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search report by office or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedOfficeCode}
          onChange={(e) => setSelectedOfficeCode(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-300"
        >
          <option value="ALL">All DAUs / NRCs</option>
          {offices.map((o) => (
            <option key={o.code} value={o.code}>
              {o.code} — {o.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-300"
        >
          <option value="ALL">All Statuses</option>
          <option value="Verified">Verified</option>
          <option value="Submitted">Submitted</option>
          <option value="Discrepancy">Discrepancy</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Office Code</th>
                <th className="py-2.5 px-3">Office Name</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Staff</th>
                <th className="py-2.5 px-3 text-right">Q-Matic</th>
                <th className="py-2.5 px-3 text-right">OneApp Issued</th>
                <th className="py-2.5 px-3 text-right">Approved</th>
                <th className="py-2.5 px-3 text-right">Reconciled %</th>
                <th className="py-2.5 px-3">Data Source</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-300">{r.reportingDate}</td>
                  <td className="py-2.5 px-3 font-semibold text-blue-400">
                    <button
                      onClick={() => (onSelectOfficeProfile ? onSelectOfficeProfile(r.officeCode) : onSelectOffice(r.officeCode))}
                      className="hover:underline font-bold"
                      title="View Office Profile"
                    >
                      {r.officeCode}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 font-sans font-medium text-white">
                    <button
                      onClick={() => (onSelectOfficeProfile ? onSelectOfficeProfile(r.officeCode) : onSelectOffice(r.officeCode))}
                      className="hover:text-blue-300 text-left font-semibold"
                      title="View Office Profile"
                    >
                      {r.officeName}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <StatusBadge status={r.reportingStatus} />
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-200 tabular-nums">{r.totalEmployees}</td>
                  <td className="py-2.5 px-3 text-right text-slate-200 tabular-nums">
                    {r.qmaticProcessed} / {r.qmaticIssued}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-200 tabular-nums">{r.oneAppIssued}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-bold tabular-nums">
                    {r.approvedOneApp}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {r.oneAppReconciliationPercentage !== null ? (
                      <span className={r.oneAppReconciliationPercentage < 100 ? 'text-amber-400' : 'text-emerald-400'}>
                        {r.oneAppReconciliationPercentage}%
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">{r.sourceType}</td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <button
                      onClick={() => onSelectReport(r)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
