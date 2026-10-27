import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Check,
  Search,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { ValidationIssue, Office, User } from '../../types';

interface DataQualityViewProps {
  currentDate: string;
  currentUser: User | null;
  onRefresh: () => void;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({
  currentDate,
  currentUser,
  onRefresh,
}) => {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [missingOffices, setMissingOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionReason, setResolutionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNRESOLVED' | 'RESOLVED'>('UNRESOLVED');

  const fetchDataQuality = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data-quality?date=${currentDate}`);
      const data = await res.json();
      setIssues(data.issues || []);
      setMissingOffices(data.missingOffices || []);
    } catch (err) {
      console.error('Failed to load data quality issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataQuality();
  }, [currentDate]);

  const handleResolveIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingId || !resolutionReason.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/data-quality/${resolvingId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: resolutionReason }),
      });

      if (!res.ok) {
        throw new Error((await res.json()).error || 'Failed to resolve issue');
      }

      setResolvingId(null);
      setResolutionReason('');
      await fetchDataQuality();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error resolving issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIssues = issues.filter((iss) => {
    if (statusFilter === 'ALL') return true;
    return iss.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <span>Data Governance & Audit Assurance</span>
          <span>·</span>
          <span className="text-white font-mono">{currentDate}</span>
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
          Data Quality & Operational Reconciliation Panel
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated integrity validator detecting missing office reports, token queue overflow, unaccounted OneApp TIDs, and attendance threshold inversions.
        </p>
      </div>

      {/* Summary Stat Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Unresolved Discrepancies
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {issues.filter((i) => i.status === 'UNRESOLVED').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Require supervisor justification
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
            Missing Office Reports
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {missingOffices.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Active centers with no daily report
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Audit Assurance Status
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {issues.filter((i) => i.status === 'UNRESOLVED').length === 0 && missingOffices.length === 0
              ? '100% Compliant'
              : 'Action Required'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Governed by Zonal Audit Cell
          </div>
        </div>
      </div>

      {/* Missing Offices Section */}
      {missingOffices.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Missing Daily Reports for {currentDate} ({missingOffices.length} Offices)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {missingOffices.map((off) => (
              <div
                key={off.code}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{off.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{off.code} · {off.district}</div>
                </div>
                <span className="text-[10px] font-semibold text-rose-400 uppercase">
                  Pending Submission
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discrepancies Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Validation Issues & Discrepancy Log
          </h3>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-300"
            >
              <option value="UNRESOLVED">Unresolved Only</option>
              <option value="RESOLVED">Resolved Only</option>
              <option value="ALL">All Issues</option>
            </select>

            <button
              onClick={fetchDataQuality}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Refresh issues"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No validation issues found for the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Office</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Issue Description</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredIssues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-300">{iss.reportingDate}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{iss.officeName}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          iss.severity === 'ERROR'
                            ? 'text-rose-400 bg-rose-950/60 border border-rose-800/40'
                            : 'text-amber-400 bg-amber-950/60 border border-amber-800/40'
                        }`}
                      >
                        {iss.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 max-w-md truncate">{iss.message}</td>
                    <td className="py-2.5 px-3">
                      {iss.status === 'RESOLVED' ? (
                        <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                          <Check className="w-3.5 h-3.5" /> Resolved
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs font-semibold">
                          Unresolved
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {iss.status === 'UNRESOLVED' ? (
                        <button
                          onClick={() => setResolvingId(iss.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                        >
                          Resolve Discrepancy
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          by {iss.resolvedBy}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolve Issue Dialog Modal */}
      {resolvingId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Resolve Operational Discrepancy
            </div>
            <p className="text-xs text-slate-400">
              Provide an official explanation or audit finding to clear this discrepancy. The resolution is permanently logged in the audit trail.
            </p>

            <form onSubmit={handleResolveIssue} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Resolution Justification (Minimum 5 characters):
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={5}
                  value={resolutionReason}
                  onChange={(e) => setResolutionReason(e.target.value)}
                  placeholder="e.g. Verified with DAU supervisor: 5 skipped TIDs were due to biometric sensor maintenance and logged in offline ledger."
                  className="w-full p-2.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResolvingId(null);
                    setResolutionReason('');
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || resolutionReason.trim().length < 5}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
                >
                  {isSubmitting ? 'Recording...' : 'Authorize Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
