/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScanFace, Fingerprint, HeartHandshake, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { OfficeDailyReport, ZoneSummaryMetrics } from '../../types/dashboard';

interface FacialRecognitionViewProps {
  summary: ZoneSummaryMetrics;
  offices: OfficeDailyReport[];
  currentDate: string;
}

export const FacialRecognitionView: React.FC<FacialRecognitionViewProps> = ({
  summary,
  offices,
  currentDate,
}) => {
  const chartData = offices.map((o) => ({
    name: o.officeName.replace(/^(DAU|NRC)\s+/i, ''),
    mbvs: o.diminishedFingerprintsMBVS,
    proofOfLife: o.proofOfLifeCertificates,
  }));

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-xl font-bold text-slate-100">
          Facial Recognition & Specialized Biometric Verification
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Monitoring for Diminished Fingerprints (Multi-Biometric Verification System) and Senior Citizen Proof of Life Certificates.
        </p>
      </div>

      {/* 2 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card A: Diminished Fingerprints MBVS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Category A
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Fingerprint className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-sm font-bold text-slate-200 mt-2">
            Diminished Fingerprints MBVS Cases
          </h2>
          <div className="text-3xl font-extrabold text-indigo-400 mt-2">
            {summary.totalDiminishedMBVS.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Multi-Biometric Verification System cases processed where citizens have worn, faded, or diminished fingerprint ridges, verified through facial matching.
          </p>
        </div>

        {/* Card B: Proof of Life Certificate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Category B
            </span>
            <div className="w-9 h-9 rounded-lg bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-sm font-bold text-slate-200 mt-2">
            Proof of Life Certificates
          </h2>
          <div className="text-3xl font-extrabold text-teal-400 mt-2">
            {summary.totalProofOfLife.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Biometric and live facial verification certificates issued for senior citizens, pensioners, and elderly beneficiaries.
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-1">
          Office-wise Facial & Biometric Certificate Distribution
        </h2>
        <p className="text-xs text-slate-400 mb-3">Comparing Diminished MBVS and Proof of Life certificates across Zone-D.</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-30} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              />
              <Bar dataKey="mbvs" name="Diminished Fingerprints MBVS" fill="#6366f1" />
              <Bar dataKey="proofOfLife" name="Proof of Life Certificates" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-100">
            Biometric Certification Office Ledger — {currentDate}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Office Name</th>
                <th className="py-2.5 px-3 text-right text-indigo-400">Diminished Fingerprints MBVS</th>
                <th className="py-2.5 px-3 text-right text-teal-400">Proof of Life Certificate</th>
                <th className="py-2.5 px-3 text-right">Combined Specialized Verifications</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {offices.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-mono text-slate-400">{o.officeCode}</td>
                  <td className="py-2 px-3 font-medium text-slate-200">{o.officeName}</td>
                  <td className="py-2 px-3 text-right text-indigo-300 font-semibold">
                    {o.diminishedFingerprintsMBVS}
                  </td>
                  <td className="py-2 px-3 text-right text-teal-300 font-semibold">
                    {o.proofOfLifeCertificates}
                  </td>
                  <td className="py-2 px-3 text-right font-medium">
                    {o.diminishedFingerprintsMBVS + o.proofOfLifeCertificates}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Validated
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950 font-bold text-slate-100 border-t-2 border-slate-700">
                <td className="py-3 px-3">TOTAL</td>
                <td className="py-3 px-3">Zone-D Larkana Consolidated</td>
                <td className="py-3 px-3 text-right text-indigo-400 font-bold">
                  {summary.totalDiminishedMBVS}
                </td>
                <td className="py-3 px-3 text-right text-teal-400 font-bold">
                  {summary.totalProofOfLife}
                </td>
                <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                  {summary.totalDiminishedMBVS + summary.totalProofOfLife}
                </td>
                <td className="py-3 px-3 text-center">Verified</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
