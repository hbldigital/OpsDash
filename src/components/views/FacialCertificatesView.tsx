import React, { useMemo, useState } from 'react';
import { Fingerprint, ScanFace, Search, Info } from 'lucide-react';
import { DailyReport, ZoneSummary } from '../../types';
import { KpiCard } from '../common/KpiCard';

interface FacialCertificatesViewProps {
  currentDate: string;
  reports: DailyReport[];
  zoneSummary: ZoneSummary;
  prevSummary: ZoneSummary | null;
  onSelectOffice: (officeCode: string) => void;
}

export const FacialCertificatesView: React.FC<FacialCertificatesViewProps> = ({
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <span>Biometric & Life Verification Systems</span>
          <span>·</span>
          <span className="text-white font-mono">{currentDate}</span>
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
          Facial Recognition & Specialized Biometric Certificates
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tracking Diminished Fingerprints MBVS verifications and Proof of Life Certificates for elderly pensioners.
        </p>
      </div>

      {/* Distinction Policy Callout */}
      <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-white">Strict Category Separation Standard:</div>
          <div>
            <strong>Diminished Fingerprints MBVS</strong> (manual biometric verification bypass for citizens with worn or damaged ridge patterns) and <strong>Proof of Life Certificates</strong> (facial and biometric verification for pension disbursement) are distinct legal and operational processes. They are tracked in separate registries and must never be merged.
          </div>
        </div>
      </div>

      {/* Two Dedicated Category KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Diminished Fingerprints MBVS */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              Category A: Diminished Fingerprints
            </span>
            <div className="p-2 rounded-lg bg-sky-950/60 text-sky-400 border border-sky-800/50">
              <Fingerprint className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white font-mono tabular-nums">
              {zoneSummary.diminishedFingerprintsMBVS.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Zone-wide daily MBVS bypass cases
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Previous reporting day:</span>
            <span className="text-slate-300 font-mono">
              {prevSummary?.diminishedFingerprintsMBVS || 0}
            </span>
          </div>
        </div>

        {/* Proof of Life Certificate */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Category B: Proof of Life Certificates
            </span>
            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
              <ScanFace className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white font-mono tabular-nums">
              {zoneSummary.proofOfLife.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Verified pensioners & social safety net recipients
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Previous reporting day:</span>
            <span className="text-slate-300 font-mono">
              {prevSummary?.proofOfLife || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Table with separated columns */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Office-Wise Biometric Certification Statistics
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
                <th className="py-2.5 px-3">Office / DAU Name</th>
                <th className="py-2.5 px-3 text-right text-sky-400">Diminished MBVS Cases</th>
                <th className="py-2.5 px-3 text-right text-emerald-400">Proof of Life Certificates</th>
                <th className="py-2.5 px-3">Verification Integrity</th>
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
                  <td className="py-2 px-3 text-right text-sky-300 font-bold tabular-nums">
                    {r.diminishedFingerprintsMBVS}
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-300 font-bold tabular-nums">
                    {r.proofOfLife}
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-400">
                    Audit Certified
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-blue-950/40 border-t-2 border-blue-600/60 font-bold text-white text-xs">
                <td className="py-2.5 px-3 text-blue-300">TOTAL</td>
                <td className="py-2.5 px-3 font-sans uppercase text-blue-200">
                  Consolidated Zone-D Larkana
                </td>
                <td className="py-2.5 px-3 text-right text-sky-300 tabular-nums">
                  {zoneSummary.diminishedFingerprintsMBVS}
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-300 tabular-nums">
                  {zoneSummary.proofOfLife}
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
