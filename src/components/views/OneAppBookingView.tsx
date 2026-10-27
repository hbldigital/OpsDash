import React, { useState, useMemo } from 'react';
import { Smartphone, CheckCircle2, SkipForward, AlertTriangle, Search, Info } from 'lucide-react';
import { DailyReport, ZoneSummary } from '../../types';
import { KpiCard } from '../common/KpiCard';

interface OneAppBookingViewProps {
  currentDate: string;
  reports: DailyReport[];
  zoneSummary: ZoneSummary;
  onSelectOffice: (officeCode: string) => void;
}

export const OneAppBookingView: React.FC<OneAppBookingViewProps> = ({
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

  const hasUnaccounted = zoneSummary.oneAppRemaining > 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <span>Registration Application Reconciliation</span>
          <span>·</span>
          <span className="text-white font-mono">{currentDate}</span>
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
          OneApp Progress & Transaction ID (TID) Booking
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Rigorous reconciliation tracking between electronic TIDs issued, counter processed applications, and skipped records.
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="OneApp TIDs Issued"
          value={zoneSummary.oneAppIssued.toLocaleString()}
          subtitle="Electronic booking slots generated"
          icon={Smartphone}
        />
        <KpiCard
          title="Processed OneApp"
          value={zoneSummary.oneAppProcessed.toLocaleString()}
          subtitle="Registrations completed at counter"
          icon={CheckCircle2}
        />
        <KpiCard
          title="Skipped OneApp TIDs"
          value={zoneSummary.oneAppSkipped.toLocaleString()}
          subtitle="Bypassed or applicant no-shows"
          icon={SkipForward}
          status="info"
        />
        <KpiCard
          title="Unaccounted TIDs"
          value={zoneSummary.oneAppRemaining.toLocaleString()}
          subtitle={
            hasUnaccounted
              ? `${zoneSummary.oneAppRemaining} TIDs unaccounted for`
              : '0 Unaccounted (100% Reconciled)'
          }
          icon={AlertTriangle}
          status={hasUnaccounted ? 'warning' : 'nominal'}
        />
      </div>

      {/* Large Visual Reconciliation Bar Box */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Consolidated Zone-D Reconciliation Progress
            </h3>
            <p className="text-xs text-slate-400">
              Formula: ((Processed [{zoneSummary.oneAppProcessed}] + Skipped [{zoneSummary.oneAppSkipped}]) ÷ Issued [{zoneSummary.oneAppIssued}]) × 100
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {zoneSummary.oneAppReconciliationPercentage !== null
                ? `${zoneSummary.oneAppReconciliationPercentage}%`
                : 'N/A'}
            </span>
            <div className="text-[11px] text-slate-400">Reconciliation Rate</div>
          </div>
        </div>

        {/* Progress Visual */}
        <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              zoneSummary.oneAppRemaining > 0 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, zoneSummary.oneAppReconciliationPercentage || 0)}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Processed: <strong className="text-white tabular-nums">{zoneSummary.oneAppProcessed}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Skipped: <strong className="text-white tabular-nums">{zoneSummary.oneAppSkipped}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${hasUnaccounted ? 'bg-amber-500' : 'bg-slate-600'}`} />
              Unaccounted: <strong className={hasUnaccounted ? 'text-amber-400 tabular-nums' : 'text-slate-400 tabular-nums'}>{zoneSummary.oneAppRemaining}</strong>
            </span>
          </div>

          {hasUnaccounted && (
            <div className="text-amber-400 font-medium">
              ⚠ Warning: Reconciliation below 100% indicates missing terminal logs.
            </div>
          )}
        </div>
      </div>

      {/* Office Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Office-Wise OneApp Booking & Reconciliation Ledger
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
                <th className="py-2.5 px-3 text-right">TIDs Issued</th>
                <th className="py-2.5 px-3 text-right text-emerald-400">Processed</th>
                <th className="py-2.5 px-3 text-right text-slate-300">Skipped</th>
                <th className="py-2.5 px-3 text-right text-amber-400">Unaccounted</th>
                <th className="py-2.5 px-3 text-right">Reconciled %</th>
                <th className="py-2.5 px-3">Audit Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filtered.map((r) => {
                const recon = r.oneAppReconciliationPercentage;
                const isUnder = r.oneAppRemaining > 0;
                const isOver = r.oneAppRemaining < 0;

                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectOffice(r.officeCode)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-blue-400">{r.officeCode}</td>
                    <td className="py-2 px-3 font-sans font-medium text-white">{r.officeName}</td>
                    <td className="py-2 px-3 text-right text-slate-200 tabular-nums">{r.oneAppIssued}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 tabular-nums">{r.oneAppProcessed}</td>
                    <td className="py-2 px-3 text-right text-slate-300 tabular-nums">{r.oneAppSkipped}</td>
                    <td className={`py-2 px-3 text-right tabular-nums ${isUnder ? 'text-amber-400 font-bold' : isOver ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                      {r.oneAppRemaining}
                    </td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums">
                      {recon !== null ? (
                        <span className={recon < 100 ? 'text-amber-400' : 'text-emerald-400'}>
                          {recon}%
                        </span>
                      ) : (
                        <span className="text-slate-500 font-sans">N/A</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-sans">
                      {isUnder ? (
                        <span className="text-amber-400 font-semibold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {r.oneAppRemaining} Unaccounted
                        </span>
                      ) : isOver ? (
                        <span className="text-rose-400 font-semibold">TID Overflow Discrepancy</span>
                      ) : (
                        <span className="text-emerald-400">100% Balanced</span>
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
                <td className="py-2.5 px-3 text-right tabular-nums">{zoneSummary.oneAppIssued}</td>
                <td className="py-2.5 px-3 text-right text-emerald-300 tabular-nums">{zoneSummary.oneAppProcessed}</td>
                <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">{zoneSummary.oneAppSkipped}</td>
                <td className="py-2.5 px-3 text-right text-amber-300 tabular-nums">{zoneSummary.oneAppRemaining}</td>
                <td className="py-2.5 px-3 text-right text-emerald-300 tabular-nums">
                  {zoneSummary.oneAppReconciliationPercentage !== null
                    ? `${zoneSummary.oneAppReconciliationPercentage}%`
                    : 'N/A'}
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
