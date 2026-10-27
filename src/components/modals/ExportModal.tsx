/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { X, Download, Printer, FileSpreadsheet, FileText, CheckCircle } from 'lucide-react';
import { OfficeDailyReport, ZoneSummaryMetrics } from '../../types/dashboard';
import { formatPercentage } from '../../utils/calculations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ZoneSummaryMetrics;
  offices: OfficeDailyReport[];
  currentDate: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  summary,
  offices,
  currentDate,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Generate CSV content
  const handleExportCsv = () => {
    const headers = [
      'Zone',
      'Office Code',
      'Office Name',
      'Reporting Status',
      'Total Staff',
      'Late >07:45',
      'Late >08:00',
      'On Time Staff',
      'Q-Matic Issued',
      'Q-Matic Processed',
      'Q-Matic %',
      'OneApp Issued',
      'OneApp Processed',
      'OneApp Skipped',
      'OneApp Recon %',
      'Approved OneApp',
      'Diminished MBVS',
      'Proof of Life',
      'Pak-ID Approved',
      'Pak-ID Deferred',
      'Pak-ID Correction',
    ];

    const rows = offices.map((o) => [
      `"${o.zone}"`,
      `"${o.officeCode}"`,
      `"${o.officeName}"`,
      `"${o.reportingStatus}"`,
      o.totalEmployees,
      o.lateAfter745,
      o.lateAfter800,
      o.onTimeEmployees,
      o.qmaticIssued,
      o.qmaticProcessed,
      `"${formatPercentage(o.qmaticPercentage)}"`,
      o.oneappIssued,
      o.oneappProcessed,
      o.oneappSkipped,
      `"${formatPercentage(o.oneappReconciliationPercentage)}"`,
      o.approvedOneApp,
      o.diminishedFingerprintsMBVS,
      o.proofOfLifeCertificates,
      o.pakidApproved,
      o.pakidDeferred,
      o.pakidCorrection,
    ]);

    // Append TOTAL row
    rows.push([
      `"Zone-D Larkana Consolidated"`,
      `"TOTAL"`,
      `"All Offices (${summary.officesReported} reported)"`,
      `"${summary.coveragePercentage}%"`,
      summary.totalEmployees,
      summary.totalLateAfter745,
      summary.totalLateAfter800,
      summary.totalOnTimeEmployees,
      summary.totalQmaticIssued,
      summary.totalQmaticProcessed,
      `"${formatPercentage(summary.zoneQmaticPercentage)}"`,
      summary.totalOneappIssued,
      summary.totalOneappProcessed,
      summary.totalOneappSkipped,
      `"${formatPercentage(summary.zoneOneappReconciliationPercentage)}"`,
      summary.totalApprovedOneApp,
      summary.totalDiminishedMBVS,
      summary.totalProofOfLife,
      summary.totalPakidApproved,
      summary.totalPakidDeferred,
      summary.totalPakidCorrection,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NADRA_Zone-D_Larkana_Daily_Report_${currentDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Print View
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full shadow-2xl my-8">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Export & Official Report Generation
              </h2>
              <p className="text-[11px] text-slate-400">
                Zone-D Larkana — Daily Progress Report ({currentDate})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Export Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportCsv}
              className="flex items-center justify-center gap-2 p-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 transition-all hover:border-emerald-500 shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download CSV Spreadsheet (Excel Compatible)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 p-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 transition-all hover:border-blue-500 shadow-sm"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Print Official Daily Progress Ledger</span>
            </button>
          </div>

          {/* Printable Report Preview */}
          <div
            ref={printAreaRef}
            className="p-4 bg-white text-slate-900 rounded-lg border border-slate-300 text-xs font-sans space-y-4 max-h-[420px] overflow-y-auto"
          >
            <div className="text-center border-b pb-3">
              <h1 className="font-extrabold text-base tracking-tight text-slate-950 uppercase">
                National Database and Registration Authority (NADRA)
              </h1>
              <h2 className="font-bold text-sm text-slate-700">
                Zone-D Larkana — Daily Operational Progress Report
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Reporting Date: <strong>{currentDate}</strong> | Generated:{' '}
                {new Date().toLocaleString()} (Asia/Karachi)
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[11px] bg-slate-100 p-2 rounded">
              <div>
                <span className="text-slate-500 block">Coverage:</span>
                <strong>{summary.coveragePercentage}%</strong> ({summary.officesReported}/
                {summary.totalActiveOffices})
              </div>
              <div>
                <span className="text-slate-500 block">Q-Matic Rate:</span>
                <strong>{formatPercentage(summary.zoneQmaticPercentage)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">OneApp Recon:</span>
                <strong>{formatPercentage(summary.zoneOneappReconciliationPercentage)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Approved OneApp:</span>
                <strong>{summary.totalApprovedOneApp}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="p-1 border border-slate-300">Code</th>
                    <th className="p-1 border border-slate-300">Office Name</th>
                    <th className="p-1 border border-slate-300 text-right">Staff</th>
                    <th className="p-1 border border-slate-300 text-right">Late &gt;07:45</th>
                    <th className="p-1 border border-slate-300 text-right">Q-Issued</th>
                    <th className="p-1 border border-slate-300 text-right">Q-Proc</th>
                    <th className="p-1 border border-slate-300 text-right">OneApp Issued</th>
                    <th className="p-1 border border-slate-300 text-right">OneApp Proc</th>
                    <th className="p-1 border border-slate-300 text-right">Approved</th>
                    <th className="p-1 border border-slate-300 text-right">Pak-ID</th>
                  </tr>
                </thead>
                <tbody>
                  {offices.map((o) => (
                    <tr key={o.id}>
                      <td className="p-1 border border-slate-300 font-mono">{o.officeCode}</td>
                      <td className="p-1 border border-slate-300 font-medium">{o.officeName}</td>
                      <td className="p-1 border border-slate-300 text-right">{o.totalEmployees}</td>
                      <td className="p-1 border border-slate-300 text-right">{o.lateAfter745}</td>
                      <td className="p-1 border border-slate-300 text-right">{o.qmaticIssued}</td>
                      <td className="p-1 border border-slate-300 text-right">{o.qmaticProcessed}</td>
                      <td className="p-1 border border-slate-300 text-right">{o.oneappIssued}</td>
                      <td className="p-1 border border-slate-300 text-right">{o.oneappProcessed}</td>
                      <td className="p-1 border border-slate-300 text-right font-bold text-emerald-700">
                        {o.approvedOneApp}
                      </td>
                      <td className="p-1 border border-slate-300 text-right">{o.pakidApproved}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-slate-200">
                    <td className="p-1 border border-slate-400">TOTAL</td>
                    <td className="p-1 border border-slate-400">Zone-D Larkana Consolidated</td>
                    <td className="p-1 border border-slate-400 text-right">{summary.totalEmployees}</td>
                    <td className="p-1 border border-slate-400 text-right">{summary.totalLateAfter745}</td>
                    <td className="p-1 border border-slate-400 text-right">{summary.totalQmaticIssued}</td>
                    <td className="p-1 border border-slate-400 text-right">{summary.totalQmaticProcessed}</td>
                    <td className="p-1 border border-slate-400 text-right">{summary.totalOneappIssued}</td>
                    <td className="p-1 border border-slate-400 text-right">{summary.totalOneappProcessed}</td>
                    <td className="p-1 border border-slate-400 text-right text-emerald-800">
                      {summary.totalApprovedOneApp}
                    </td>
                    <td className="p-1 border border-slate-400 text-right">{summary.totalPakidApproved}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-4 flex justify-between text-[10px] text-slate-500 border-t">
              <div>Verified by Director Operations Zone-D Larkana</div>
              <div>Official Signature & Seal: _______________________</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
