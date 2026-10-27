import React, { useMemo, useState } from 'react';
import { FileCheck2, Clock, AlertTriangle, Search, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DailyReport, ZoneSummary } from '../../types';
import { KpiCard } from '../common/KpiCard';

interface PakIdViewProps {
  currentDate: string;
  reports: DailyReport[];
  zoneSummary: ZoneSummary;
  prevSummary: ZoneSummary | null;
  onSelectOffice: (officeCode: string) => void;
}

export const PakIdView: React.FC<PakIdViewProps> = ({
  currentDate,
  reports,
  zoneSummary,
  prevSummary,
  onSelectOffice,
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return reports.filter(
      (r) =>
        r.officeName.toLowerCase().includes(search.toLowerCase()) ||
        r.officeCode.toLowerCase().includes(search.toLowerCase())
    );
  }, [reports, search]);

  const chartData = useMemo(() => {
    return [...reports]
      .sort((a, b) => b.pakidApproved - a.pakidApproved)
      .slice(0, 8)
      .map((r) => ({
        name: r.officeName.replace('NRC ', '').substring(0, 12),
        approved: r.pakidApproved,
        deferred: r.pakidDeferred,
        correction: r.pakidCorrection,
      }));
  }, [reports]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <span>NADRA Pak-ID Online Services</span>
          <span>·</span>
          <span className="text-white font-mono">{currentDate}</span>
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
          Pak-ID Identity Document Approval Dashboard
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tracking national identity card applications processed through the Pak-ID web portal and mobile app by status.
        </p>
      </div>

      {/* Distinction Standard Callout */}
      <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-white">Pak-ID Status Preservation Rule:</div>
          <div>
            <strong>Approved</strong> cases represent finalized clearances; <strong>Deferred / Sent for Approval</strong> cases indicate pending zonal supervisor or scrutiny board reviews; and <strong>Correction</strong> cases indicate citizen or biometric amendment requests. Each status is preserved independently and never conflated.
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Pak-ID Approved"
          value={zoneSummary.pakidApproved.toLocaleString()}
          subtitle="Finalized & verified CNIC/NICOP cases"
          icon={FileCheck2}
          change={prevSummary ? zoneSummary.pakidApproved - prevSummary.pakidApproved : undefined}
          status="nominal"
        />
        <KpiCard
          title="Deferred / Sent for Approval"
          value={zoneSummary.pakidDeferred.toLocaleString()}
          subtitle="Under zonal scrutiny board review"
          icon={Clock}
          status="warning"
        />
        <KpiCard
          title="Pak-ID Corrections"
          value={zoneSummary.pakidCorrection.toLocaleString()}
          subtitle="Citizens flagged for data/photo resubmission"
          icon={AlertTriangle}
          status="info"
        />
      </div>

      {/* Comparative Bar Chart */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
          Pak-ID Outcomes by Center (Top 8 Offices by Volume)
        </h3>
        <p className="text-[11px] text-slate-400 mb-4">
          Approved vs deferred vs correction distribution
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="approved" name="Approved" fill="#10b981" />
              <Bar dataKey="deferred" name="Deferred / Sent" fill="#f59e0b" />
              <Bar dataKey="correction" name="Correction" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Office-Wise Pak-ID Applications Ledger
          </h3>
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search office..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Office Name</th>
                <th className="py-2.5 px-3 text-right text-emerald-400">Approved</th>
                <th className="py-2.5 px-3 text-right text-amber-400">Deferred / Sent</th>
                <th className="py-2.5 px-3 text-right text-rose-400">Correction</th>
                <th className="py-2.5 px-3">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onSelectOffice(r.officeCode)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-semibold text-blue-400">{r.officeCode}</td>
                  <td className="py-2 px-3 font-sans font-medium text-white">{r.officeName}</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-bold tabular-nums">{r.pakidApproved}</td>
                  <td className="py-2 px-3 text-right text-amber-400 tabular-nums">{r.pakidDeferred}</td>
                  <td className="py-2 px-3 text-right text-rose-400 tabular-nums">{r.pakidCorrection}</td>
                  <td className="py-2 px-3 font-sans text-slate-300">
                    Audit Logged
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-blue-950/40 border-t-2 border-blue-600/60 font-bold text-white text-xs">
                <td className="py-2.5 px-3 text-blue-300">TOTAL</td>
                <td className="py-2.5 px-3 font-sans uppercase text-blue-200">
                  Consolidated Zone-D Larkana
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-300 tabular-nums">{zoneSummary.pakidApproved}</td>
                <td className="py-2.5 px-3 text-right text-amber-300 tabular-nums">{zoneSummary.pakidDeferred}</td>
                <td className="py-2.5 px-3 text-right text-rose-300 tabular-nums">{zoneSummary.pakidCorrection}</td>
                <td className="py-2.5 px-3 font-sans text-blue-200">Zone Total</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
