import React, { useState, useMemo } from 'react';
import { Ticket, CheckCircle2, Clock, AlertTriangle, Search, Info } from 'lucide-react';
import { DailyReport, ZoneSummary } from '../../types';
import { KpiCard } from '../common/KpiCard';

interface QMaticViewProps {
  currentDate: string;
  reports: DailyReport[];
  zoneSummary: ZoneSummary;
  onSelectOffice: (officeCode: string) => void;
}

export const QMaticView: React.FC<QMaticViewProps> = ({
  currentDate,
  reports,
  zoneSummary,
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <span>Citizen Queue Management</span>
          <span>·</span>
          <span className="text-white font-mono">{currentDate}</span>
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
          Q-Matic Token Progress & Counter Velocity
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tracking physical token issuance versus electronic counter processing rates across all reporting centers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Total Q-Matic Issued"
          value={zoneSummary.qmaticIssued.toLocaleString()}
          subtitle="Tokens generated at entrance kiosks"
          icon={Ticket}
        />
        <KpiCard
          title="Processed on OneApp"
          value={zoneSummary.qmaticProcessed.toLocaleString()}
          subtitle="Counter transactions completed"
          icon={CheckCircle2}
        />
        <KpiCard
          title="Remaining Unprocessed"
          value={zoneSummary.qmaticRemaining.toLocaleString()}
          subtitle="Unserved citizens or walkouts"
          icon={Clock}
          status={zoneSummary.qmaticRemaining > 200 ? 'warning' : 'nominal'}
        />
        <KpiCard
          title="Processing Rate %"
          value={
            zoneSummary.qmaticPercentage !== null ? `${zoneSummary.qmaticPercentage}%` : 'N/A'
          }
          subtitle="Processed ÷ Issued × 100"
          icon={Ticket}
          status={zoneSummary.qmaticPercentage && zoneSummary.qmaticPercentage < 90 ? 'warning' : 'nominal'}
        />
      </div>

      {/* Rules Information Box */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
        <div className="font-semibold text-white flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          Standard Q-Matic Business Logic:
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-400">
          <li>
            <strong>Processing Percentage:</strong> (Processed on OneApp ÷ Q-Matic Issued) × 100, formatted to two decimal places.
          </li>
          <li>
            <strong>Remaining Tokens:</strong> Q-Matic Issued − Processed on OneApp.
          </li>
          <li>
            <strong>Zero Handling:</strong> If both issued and processed are zero, display <em>N/A</em> rather than 100%.
          </li>
          <li>
            <strong>Reconciliation Discrepancy:</strong> If processed tokens exceed issued tokens, the row is flagged with a warning rather than silently clamped.
          </li>
        </ul>
      </div>

      {/* Office-wise Q-Matic Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Office-Wise Q-Matic Token Performance Ledger
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
                <th className="py-2.5 px-3 text-right">Tokens Issued</th>
                <th className="py-2.5 px-3 text-right text-emerald-400">Processed on OneApp</th>
                <th className="py-2.5 px-3 text-right text-slate-400">Remaining</th>
                <th className="py-2.5 px-3 text-right">Processing Rate %</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filtered.map((r) => {
                const rate = r.qmaticPercentage;
                const isOverFlow = r.qmaticProcessed > r.qmaticIssued;
                const isZeroIssuedWithProc = r.qmaticIssued === 0 && r.qmaticProcessed > 0;

                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectOffice(r.officeCode)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-blue-400">{r.officeCode}</td>
                    <td className="py-2 px-3 font-sans font-medium text-white">{r.officeName}</td>
                    <td className="py-2 px-3 text-right text-slate-200 tabular-nums">{r.qmaticIssued}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 tabular-nums">{r.qmaticProcessed}</td>
                    <td className="py-2 px-3 text-right text-slate-400 tabular-nums">{r.qmaticRemaining}</td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums">
                      {rate !== null ? (
                        <span className={rate < 90 ? 'text-amber-400' : 'text-emerald-400'}>
                          {rate}%
                        </span>
                      ) : (
                        <span className="text-slate-500 font-sans">N/A</span>
                      )}
                    </td>
                    <td className="py-2 px-3 w-32">
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${
                            rate !== null && rate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, rate || 0)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-3 font-sans">
                      {isOverFlow ? (
                        <span className="text-rose-400 font-semibold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Overflow Discrepancy
                        </span>
                      ) : isZeroIssuedWithProc ? (
                        <span className="text-rose-400 font-semibold">Zero Issued Error</span>
                      ) : (
                        <span className="text-emerald-400">Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-blue-950/40 border-t-2 border-blue-600/60 font-bold text-white text-xs">
                <td className="py-2.5 px-3 text-blue-300">TOTAL</td>
                <td className="py-2.5 px-3 font-sans uppercase text-blue-200">
                  Consolidated Zone-D Larkana
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums">{zoneSummary.qmaticIssued}</td>
                <td className="py-2.5 px-3 text-right text-emerald-300 tabular-nums">{zoneSummary.qmaticProcessed}</td>
                <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">{zoneSummary.qmaticRemaining}</td>
                <td className="py-2.5 px-3 text-right text-emerald-300 tabular-nums">
                  {zoneSummary.qmaticPercentage !== null ? `${zoneSummary.qmaticPercentage}%` : 'N/A'}
                </td>
                <td className="py-2.5 px-3">
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${Math.min(100, zoneSummary.qmaticPercentage || 0)}%` }}
                    />
                  </div>
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
