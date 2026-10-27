import React, { useMemo } from 'react';
import { TrendingUp, Calendar, ArrowUpRight, BarChart2 } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DailyReport, ZoneSummary } from '../../types';
import { aggregateZone } from '../../utils/calculations';

interface HistoricalAnalyticsViewProps {
  reports: DailyReport[];
  totalOfficesCount: number;
}

export const HistoricalAnalyticsView: React.FC<HistoricalAnalyticsViewProps> = ({
  reports,
  totalOfficesCount,
}) => {
  // Group reports by date
  const dateWiseStats = useMemo(() => {
    const groups: Record<string, DailyReport[]> = {};
    for (const r of reports) {
      if (!groups[r.reportingDate]) {
        groups[r.reportingDate] = [];
      }
      groups[r.reportingDate].push(r);
    }

    return Object.entries(groups)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, dateReports]) => {
        const zone = aggregateZone(totalOfficesCount, dateReports);
        return {
          date,
          qmaticIssued: zone.qmaticIssued,
          qmaticProcessed: zone.qmaticProcessed,
          oneAppIssued: zone.oneAppIssued,
          approvedOneApp: zone.approvedOneApp,
          lateAfter745: zone.lateAfter745,
          lateAfter800: zone.lateAfter800,
          mbvs: zone.diminishedFingerprintsMBVS,
          lifeCert: zone.proofOfLife,
          reconRate: zone.oneAppReconciliationPercentage || 0,
        };
      });
  }, [reports, totalOfficesCount]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <span>Time-Series Trends & Operational Forecasting</span>
          <span>·</span>
          <span>Multi-Day Comparative Analytics</span>
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
          Historical Operational Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tracking day-over-day operational throughput, registration volumes, employee punctuality trajectories, and biometric verifications.
        </p>
      </div>

      {/* Grid of Historical Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Application & Token Velocity */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
            Token & OneApp Issuance Velocity (Daily Trend)
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Total Q-Matic tokens vs OneApp bookings across Zone-D Larkana
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dateWiseStats} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="qmaticIssued" name="Q-Matic Issued" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="oneAppIssued" name="OneApp Issued" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="approvedOneApp" name="Approved OneApp" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Late Arrival Shift Trajectory */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
            Workforce Punctuality Trajectory (Daily)
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Staff late arrivals past 07:45 AM and 08:00 AM thresholds
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dateWiseStats} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="late745" name="Late > 07:45 AM" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late800" name="Late > 08:00 AM" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Biometric Verification Trend */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
            Specialized Biometric Verifications Trajectory
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Diminished Fingerprints MBVS vs Proof of Life Certificates
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dateWiseStats} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="mbvs" name="Diminished Fingerprints MBVS" stroke="#0ea5e9" strokeWidth={2} />
                <Line type="monotone" dataKey="lifeCert" name="Proof of Life Certificates" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Reconciliation Stability */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
            Zone Reconciliation Health (% Completion)
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Consistency of OneApp TID balancing over historical dates
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dateWiseStats} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[80, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="reconRate" name="Reconciliation Rate %" stroke="#10b981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
