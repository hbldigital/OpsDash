/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Building2,
  Phone,
  MessageSquare,
  MapPin,
  Users,
  ShieldCheck,
  UserCheck,
  Download,
  Share2,
  Edit3,
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Office, DailyReport } from '../../types';
import { exportElementToJpg, exportElementToPdf, exportToCsv, shareOrDownloadJpg } from '../../utils/exportEngine';

interface OfficeProfileModalProps {
  office: Office | null;
  report?: DailyReport | null;
  onClose: () => void;
  onEditOffice: (office: Office) => void;
  onViewLedger?: (officeCode: string) => void;
}

export const OfficeProfileModal: React.FC<OfficeProfileModalProps> = ({
  office,
  report,
  onClose,
  onEditOffice,
  onViewLedger,
}) => {
  const profileRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  if (!office) return null;

  const staff = office.staffBreakdown || {
    officersMale: 2,
    officersFemale: 1,
    officialsMale: 6,
    officialsFemale: 2,
    supportingMale: 2,
    supportingFemale: 0,
    outsourceMale: 1,
    outsourceFemale: 0,
    totalStaff: 14,
  };

  const totalMale =
    (staff.officersMale || 0) +
    (staff.officialsMale || 0) +
    (staff.supportingMale || 0) +
    (staff.outsourceMale || 0);

  const totalFemale =
    (staff.officersFemale || 0) +
    (staff.officialsFemale || 0) +
    (staff.supportingFemale || 0) +
    (staff.outsourceFemale || 0);

  const totalStaffCalculated = staff.totalStaff || totalMale + totalFemale;

  const handleExportJpg = async () => {
    if (!profileRef.current) return;
    setIsExporting(true);
    setExportMessage('Generating high-resolution official report...');
    try {
      const filename = `NADRA_${office.code}_Profile_${Date.now()}.jpg`;
      const res = await exportElementToJpg(profileRef.current, {
        filename,
        title: `${office.name} [${office.code}] Official Profile`,
      });
      if (res.success && res.dataUrl) {
        setExportMessage('Report generated successfully!');
        setTimeout(() => setExportMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setExportMessage('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!profileRef.current) return;
    setIsExporting(true);
    setExportMessage('Generating high-quality PDF document...');
    try {
      const filename = `NADRA_${office.code}_Official_Profile_${Date.now()}.pdf`;
      await exportElementToPdf(profileRef.current, { filename });
      setExportMessage('PDF saved!');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = () => {
    const columns = [
      { key: 'category', header: 'Staff Classification' },
      { key: 'male', header: 'Male Personnel' },
      { key: 'female', header: 'Female Personnel' },
      { key: 'total', header: 'Total Headcount' },
    ];

    const rows = [
      {
        category: 'Officers',
        male: staff.officersMale,
        female: staff.officersFemale,
        total: (staff.officersMale || 0) + (staff.officersFemale || 0),
      },
      {
        category: 'Officials',
        male: staff.officialsMale,
        female: staff.officialsFemale,
        total: (staff.officialsMale || 0) + (staff.officialsFemale || 0),
      },
      {
        category: 'Supporting Staff',
        male: staff.supportingMale,
        female: staff.supportingFemale,
        total: (staff.supportingMale || 0) + (staff.supportingFemale || 0),
      },
      {
        category: 'Outsource Staff',
        male: staff.outsourceMale,
        female: staff.outsourceFemale,
        total: (staff.outsourceMale || 0) + (staff.outsourceFemale || 0),
      },
      {
        category: 'TOTAL CONSOLIDATED STAFF',
        male: totalMale,
        female: totalFemale,
        total: totalStaffCalculated,
      },
    ];

    exportToCsv(
      columns,
      rows,
      `NADRA_${office.code}_Staff_Profile.csv`,
      `${office.name} [${office.code}] - Official Staff Profile`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Top Action Bar (hidden during export via no-export class) */}
        <div className="no-export flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Official Center Profile & Staff Register
            </span>
            <span className="text-xs text-blue-400 font-mono font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
              {office.code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditOffice(office)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 rounded-lg border border-emerald-800/50 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Office Details
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Export Notification Badge */}
        {exportMessage && (
          <div className="no-export bg-blue-900/80 text-blue-200 text-xs px-4 py-2 flex items-center justify-between border-b border-blue-700">
            <span>{exportMessage}</span>
          </div>
        )}

        {/* Printable/Exportable Canvas Container */}
        <div id="office-profile-card" ref={profileRef} className="p-5 sm:p-7 space-y-6 bg-slate-950 text-slate-100">
          {/* Formal NADRA Header */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    GOVERNMENT OF PAKISTAN
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">·</span>
                  <span className="text-[11px] text-blue-300 font-semibold">
                    REGIONAL HEADQUARTERS
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {office.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  <span className="font-mono font-semibold text-blue-400">Code: {office.code}</span>
                  <span>•</span>
                  <span>Zone: <strong className="text-slate-200">{office.zoneName || 'Larkana'}</strong></span>
                  <span>•</span>
                  <span>Zone Code: <strong className="text-amber-300 font-mono">{office.zoneCode || 'Z050D'}</strong></span>
                  <span>•</span>
                  <span>District: <strong className="text-slate-200">{office.district}</strong></span>
                  <span>•</span>
                  <span>Type: <strong className="text-emerald-400">{office.type}</strong></span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-end">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active & Operational
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Capacity: {office.dailyCapacity || 300} tokens/day
                </div>
              </div>
            </div>

            {/* Address & GPS */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{office.address || 'Civil Lines / Station Road, Larkana, Sindh'}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                {office.landline && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-blue-400" /> Landline: {office.landline}
                  </span>
                )}
                {office.latitude && office.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${office.latitude},${office.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-export flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
                  >
                    GPS: {office.latitude.toFixed(4)}, {office.longitude.toFixed(4)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Leadership & Key Contact Persons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Incharge Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" /> Current Office Incharge
                  </div>
                  <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800/40">
                    Primary Authority
                  </span>
                </div>
                <div className="text-base font-bold text-white mt-2">
                  {office.incharge?.name || 'Muhammad Aslam Chandio'}
                </div>
                <div className="text-xs text-slate-400">
                  {office.incharge?.designation || 'Senior Assistant Director / Incharge'}
                </div>
              </div>

              {/* Incharge Contacts (1-4 options) */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400">Direct Contact Options:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(office.incharge?.contacts && office.incharge.contacts.length > 0
                    ? office.incharge.contacts
                    : [
                        { id: '1', label: 'WhatsApp', number: '0300-1234567', type: 'whatsapp' as const },
                        { id: '2', label: 'Official Call', number: '0333-7654321', type: 'call' as const },
                      ]
                  ).map((c, i) => (
                    <div
                      key={c.id || i}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="truncate">
                        <div className="text-[10px] text-slate-400 uppercase font-medium">{c.label}</div>
                        <div className="font-mono text-white font-semibold truncate">{c.number}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 no-export">
                        {(c.type === 'whatsapp' || c.type === 'both') && (
                          <a
                            href={`https://wa.me/${c.number.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {(c.type === 'call' || c.type === 'both' || c.type === 'landline') && (
                          <a
                            href={`tel:${c.number}`}
                            className="p-1.5 rounded bg-blue-950 text-blue-400 hover:bg-blue-900 border border-blue-800 transition-colors"
                            title="Voice Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Assistant Incharge Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-400" /> Office Assistant / Second Incharge
                  </div>
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40">
                    Operations Support
                  </span>
                </div>
                <div className="text-base font-bold text-white mt-2">
                  {office.assistant?.name || 'Rashid Ali Solangi'}
                </div>
                <div className="text-xs text-slate-400">
                  {office.assistant?.designation || 'Assistant Incharge / Superintendent'}
                </div>
              </div>

              {/* Assistant Contacts */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400">Direct Contact Options:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(office.assistant?.contacts && office.assistant.contacts.length > 0
                    ? office.assistant.contacts
                    : [
                        { id: '1', label: 'WhatsApp & Call', number: '0301-2345678', type: 'both' as const },
                        { id: '2', label: 'Official Phone', number: '0345-8765432', type: 'call' as const },
                      ]
                  ).map((c, i) => (
                    <div
                      key={c.id || i}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="truncate">
                        <div className="text-[10px] text-slate-400 uppercase font-medium">{c.label}</div>
                        <div className="font-mono text-white font-semibold truncate">{c.number}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 no-export">
                        {(c.type === 'whatsapp' || c.type === 'both') && (
                          <a
                            href={`https://wa.me/${c.number.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {(c.type === 'call' || c.type === 'both' || c.type === 'landline') && (
                          <a
                            href={`tel:${c.number}`}
                            className="p-1.5 rounded bg-blue-950 text-blue-400 hover:bg-blue-900 border border-blue-800 transition-colors"
                            title="Voice Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STAFF QUANTITY BREAKDOWN (GENDER & CATEGORY SEGREGATION) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Staff Headcount Breakdown by Category & Gender
                </h3>
                <p className="text-[11px] text-slate-400">
                  Detailed distribution across Officers, Officials, Supporting Staff, and Outsource Personnel
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Total Sanctioned Staff:</span>
                <span className="text-emerald-400 font-mono text-sm">{totalStaffCalculated}</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Personnel Category</th>
                    <th className="py-2.5 px-3 text-right text-blue-400">Male Staff</th>
                    <th className="py-2.5 px-3 text-right text-purple-400">Female Staff</th>
                    <th className="py-2.5 px-3 text-right text-white">Total Headcount</th>
                    <th className="py-2.5 px-3 text-right text-slate-400">Proportion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {/* Officers */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Officers (Grade 16 & Above)
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-400 tabular-nums">{staff.officersMale}</td>
                    <td className="py-2.5 px-3 text-right text-purple-400 tabular-nums">{staff.officersFemale}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white tabular-nums">
                      {(staff.officersMale || 0) + (staff.officersFemale || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">
                      {Math.round((((staff.officersMale || 0) + (staff.officersFemale || 0)) / (totalStaffCalculated || 1)) * 100)}%
                    </td>
                  </tr>

                  {/* Officials */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Officials (Supervisors / DEOs / Registration Staff)
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-400 tabular-nums">{staff.officialsMale}</td>
                    <td className="py-2.5 px-3 text-right text-purple-400 tabular-nums">{staff.officialsFemale}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white tabular-nums">
                      {(staff.officialsMale || 0) + (staff.officialsFemale || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">
                      {Math.round((((staff.officialsMale || 0) + (staff.officialsFemale || 0)) / (totalStaffCalculated || 1)) * 100)}%
                    </td>
                  </tr>

                  {/* Supporting Staff */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Supporting Staff (Naib Qasid / Office Attendants)
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-400 tabular-nums">{staff.supportingMale}</td>
                    <td className="py-2.5 px-3 text-right text-purple-400 tabular-nums">{staff.supportingFemale}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white tabular-nums">
                      {(staff.supportingMale || 0) + (staff.supportingFemale || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">
                      {Math.round((((staff.supportingMale || 0) + (staff.supportingFemale || 0)) / (totalStaffCalculated || 1)) * 100)}%
                    </td>
                  </tr>

                  {/* Out Source Staff */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Outsource Staff (Security Guards / Sanitation)
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-400 tabular-nums">{staff.outsourceMale}</td>
                    <td className="py-2.5 px-3 text-right text-purple-400 tabular-nums">{staff.outsourceFemale}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white tabular-nums">
                      {(staff.outsourceMale || 0) + (staff.outsourceFemale || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">
                      {Math.round((((staff.outsourceMale || 0) + (staff.outsourceFemale || 0)) / (totalStaffCalculated || 1)) * 100)}%
                    </td>
                  </tr>

                  {/* CONSOLIDATED TOTALS ROW */}
                  <tr className="bg-blue-950/40 border-t-2 border-blue-600/60 font-bold text-white text-xs">
                    <td className="py-3 px-3 uppercase text-blue-200">
                      Total Staff Headcount
                    </td>
                    <td className="py-3 px-3 text-right text-blue-300 tabular-nums">{totalMale}</td>
                    <td className="py-3 px-3 text-right text-purple-300 tabular-nums">{totalFemale}</td>
                    <td className="py-3 px-3 text-right text-emerald-400 text-sm tabular-nums">
                      {totalStaffCalculated}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-300 tabular-nums">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Performance Summary (if report available) */}
          {report && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Daily Operational Activity ({report.reportingDate})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Q-Matic Tokens</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {report.qmaticProcessed} / {report.qmaticIssued}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    {report.qmaticPercentage !== null ? `${report.qmaticPercentage}% Rate` : 'N/A'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">OneApp TIDs</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {report.oneAppProcessed} Processed
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    {report.oneAppReconciliationPercentage !== null ? `${report.oneAppReconciliationPercentage}% Reconciled` : 'N/A'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Punctuality</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {report.onTimeEmployees} On Time
                  </div>
                  <div className="text-[10px] text-amber-400 mt-0.5">
                    {report.lateAfter745} past 07:45 | {report.lateAfter800} past 08:00
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Pak-ID Approvals</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {report.pakidApproved} Approved
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {report.pakidDeferred} Deferred | {report.pakidCorrection} Corr
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Official Verification Sign-off Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              <span>Verified Official Record: </span>
              <strong className="text-slate-200">NADRA Zone-D Larkana (Zone Code: {office.zoneCode || 'Z050D'})</strong>
            </div>
            <div className="text-right">
              <span>Date Generated: </span>
              <strong className="text-slate-200">{new Date().toLocaleDateString('en-GB')}</strong>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Toolbar (Strips during export) */}
        <div className="no-export flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {onViewLedger && (
              <button
                onClick={() => onViewLedger(office.code)}
                className="px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-white bg-blue-950/60 hover:bg-blue-900/60 rounded-lg border border-blue-800/50 transition-colors"
              >
                View Daily Operations Ledger
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={handleExportJpg}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Save Report as High-Quality JPG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
