import React, { useMemo, useState } from 'react';
import { CheckCircle2, TrendingUp, TrendingDown, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { DailyReport, ZoneSummary } from '../../types';
import { KpiCard } from '../common/KpiCard';

interface ApprovedOneAppViewProps {
  currentDate: string;
  reports: DailyReport[];
  zoneSummary: ZoneSummary;
  prevSummary: ZoneSummary | null;
  onSelectOffice: (officeCode: string) => void;
}

export const ApprovedOneAppView: React.FC<ApprovedOneAppViewProps> = ({
  currentDate,
  reports,
  zoneSummary,
  prevSummary,
  onSelectOffice,
}) => {
  const [search, setSearch] = useState('');

  const sortedOffices = useMemo(() => {
    return [...reports].sort((a, b) => b.approvedOneApp - a.approvedOneApp);
  }, [reports]);

  const highestVolume = sortedOffices[0];
  const lowestVolume = sortedOffices[sortedOffices.length - 1];

  const filtered = useMemo(() => {
    return sortedOffices.filter(
      (r) =>
        r.officeName.toLowerCase().includes(search.toLowerCase()) ||
        r.officeCode.toLowerCase().includes(search.toLowerCase())
    );
  }, [sortedOffices, search]);

  const zoneDelta = prevSummary ? zoneSummary.approvedOneApp - prevSummary.approvedOneApp : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <span>Application Quality & Approvals</span>
          <span>·</span>
          <span className="text-white font-mono">{currentDate}</span>
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
          Approved OneApp Registration Applications
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Final approved citizen applications submitted through OneApp across Zone-D Larkana.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Total Approved OneApp"
          value={zoneSummary.approvedOneApp.toLocaleString()}
          subtitle="Final approved identity applications"
          icon={CheckCircle2}
          change={zoneDelta}
        />
        <KpiCard
          title="Highest Volume Center"
          value={highestVolume?.approvedOneApp || 0}
          subtitle={highestVolume?.officeName || 'N/A'}
          icon={TrendingUp}
          status="info"
        />
        <KpiCard
          title="Lowest Volume Center"
          value={lowestVolume?.approvedOneApp || 0}
          subtitle={lowestVolume?.officeName || 'N/A'}
          icon={TrendingDown}
        />
        <KpiCard
          title="Avg Applications / Office"
          value={Math.round(zoneSummary.approvedOneApp / (zoneSummary.reportedOfficesCount || 1))}
          subtitle="Across active reporting units"
          icon={CheckCircle2}
        />
      </div>

      {/* Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Office-Wise Approved OneApp Ledger & Previous-Day Comparison
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
                <th className="py-2.5 px-3 text-right text-emerald-400">Approved Today</th>
                <th className="py-2.5 px-3 text-right text-slate-400">Previous Day</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filtered.map((r) => {
                const diff = r.approvedOneApp - r.previousDayApproved;
                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectOffice(r.officeCode)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-blue-400">{r.officeCode}</td>
                    <td className="py-2 px-3 font-sans font-medium text-white">{r.officeName}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold tabular-nums">
                      {r.approvedOneApp}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                      {r.previousDayApproved}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      <span
                        className={`inline-flex items-center ${
                          diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {diff > 0 ? <ArrowUp className="w-3 h-3 mr-0.5" /> : diff < 0 ? <ArrowDown className="w-3 h-3 mr-0.5" /> : null}
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-300">
                      {r.reportingStatus}
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-blue-950/40 border-t-2 border-blue-600/60 font-bold text-white text-xs">
                <td className="py-2.5 px-3 text-blue-300">TOTAL</td>
                <td className="py-2.5 px-3 font-sans uppercase text-blue-200">
                  Consolidated Zone Total
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-300 tabular-nums">
                  {zoneSummary.approvedOneApp}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">
                  {prevSummary?.approvedOneApp || 0}
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-300 tabular-nums">
                  {zoneDelta > 0 ? `+${zoneDelta}` : zoneDelta}
                </td>
                <td className="py-2.5 px-3 font-sans text-blue-200">Zone Total</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
