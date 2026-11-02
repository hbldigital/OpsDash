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
  History,
  Briefcase,
  Award,
  FileText,
  FileDown,
} from 'lucide-react';
import { Office, DailyReport } from '../../types';
import { exportElementToJpg, exportElementToPdf, exportToCsv, shareOrDownloadJpg } from '../../utils/exportEngine';
import { calculateTenureDetails } from '../../utils/tenureHelper';

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
  const [isExporting, setIsExporting] = useState<string | null>(null);
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

  const inchargeTenure = calculateTenureDetails(office.incharge?.startDate);
  const secondInchargeTenure = calculateTenureDetails(office.secondIncharge?.startDate);
  const oaTenure = calculateTenureDetails(office.assistant?.startDate);

  const handleExportJpg = async () => {
    if (!profileRef.current) return;
    setIsExporting('jpg');
    setExportMessage('Generating high-resolution official report...');
    try {
      const filename = `NADRA_${office.code}_Profile_${Date.now()}.jpg`;
      const res = await exportElementToJpg(profileRef.current, {
        filename,
        title: `${office.name} [${office.code}] Official Profile Report`,
      });
      if (res.success) {
        setExportMessage('JPG Report generated and saved!');
        setTimeout(() => setExportMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setExportMessage('Export failed');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPdf = async () => {
    if (!profileRef.current) return;
    setIsExporting('pdf');
    setExportMessage('Generating high-quality PDF document...');
    try {
      const filename = `NADRA_${office.code}_Official_Profile_${Date.now()}.pdf`;
      await exportElementToPdf(profileRef.current, {
        filename,
        title: `${office.name} [${office.code}] Official Profile`,
      });
      setExportMessage('PDF saved!');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(null);
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
        category: 'Officers (Grade 16+)',
        male: staff.officersMale,
        female: staff.officersFemale,
        total: (staff.officersMale || 0) + (staff.officersFemale || 0),
      },
      {
        category: 'Officials (DEO / Executives)',
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
        category: 'Outsource Personnel',
        male: staff.outsourceMale,
        female: staff.outsourceFemale,
        total: (staff.outsourceMale || 0) + (staff.outsourceFemale || 0),
      },
      {
        category: 'TOTAL SANCTIONED WORKFORCE',
        male: totalMale,
        female: totalFemale,
        total: totalStaffCalculated,
      },
    ];

    exportToCsv(
      columns,
      rows,
      `NADRA_${office.code}_Staff_Breakdown.csv`,
      `${office.name} [${office.code}] Staff Headcount Breakdown`
    );
  };

  const historyRecords = office.leadershipHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        {/* Top Floating Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Official Center Profile &amp; Governance Ledger
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 ml-2 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                {office.code}
              </span>
              {office.shift && (
                <span className="text-[10px] font-semibold text-blue-300 ml-1.5 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/40">
                  {office.shift} Shift
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEditOffice(office);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Office Details</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-6 flex-1 text-xs">
          {exportMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-600 text-emerald-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{exportMessage}</span>
            </div>
          )}

          {/* Printable / Shareable Official Card */}
          <div ref={profileRef} className="space-y-6 bg-slate-950 p-2 sm:p-4 rounded-xl">
            {/* Header / Meta Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      Zone: {office.zoneName || 'Larkana'} ({office.zoneCode || 'Z050D'})
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60">
                      {office.type}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-300">
                      District: {office.district}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    {office.name}
                  </h1>

                  <div className="flex items-center gap-4 text-slate-300 text-xs flex-wrap pt-1">
                    {office.address && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{office.address}</span>
                      </div>
                    )}
                    {office.landline && (
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{office.landline}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Staff</div>
                    <div className="text-xl font-bold font-mono text-emerald-400">{totalStaffCalculated}</div>
                    <div className="text-[10px] text-slate-400">
                      {totalMale} M / {totalFemale} F
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Counters</div>
                    <div className="text-xl font-bold font-mono text-blue-400">{office.totalCounters || 4}</div>
                    <div className="text-[10px] text-slate-400">{office.dailyCapacity || 200} tokens/day</div>
                  </div>
                </div>
              </div>
            </div>

            {/* LEADERSHIP CARDS (OIC, 2IC & OFFICE ASSISTANT) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Office Incharge (OIC) */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-400" /> Office Incharge (OIC)
                    </div>
                    {office.incharge?.grade && (
                      <span className="text-[10px] font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800/40">
                        {office.incharge.grade}
                      </span>
                    )}
                  </div>

                  <div className="text-base font-bold text-white mt-2">
                    {office.incharge?.name || 'Muhammad Aslam Chandio'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {office.incharge?.designation || 'Senior Assistant Director'}
                  </div>

                  {/* Active Tenure Display */}
                  <div className="mt-3 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" /> Active Service Tenure
                    </div>
                    <div className="font-mono text-emerald-300 font-semibold mt-0.5">
                      {inchargeTenure.text}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Serving since: {office.incharge?.startDate || '2023-08-15'}
                    </div>
                  </div>
                </div>

                {/* Incharge Contacts */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-1.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Direct Contact Channels:
                  </div>
                  <div className="space-y-1.5">
                    {(office.incharge?.contacts || []).map((c, i) => (
                      <div
                        key={c.id || i}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 font-medium mr-1.5 uppercase">{c.label}:</span>
                          <span className="font-mono text-white font-semibold">{c.number}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 no-export">
                          {(c.type === 'whatsapp' || c.type === 'both') && (
                            <a
                              href={`https://wa.me/${c.number.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </a>
                          )}
                          {(c.type === 'call' || c.type === 'both' || c.type === 'landline') && (
                            <a
                              href={`tel:${c.number}`}
                              className="p-1 rounded bg-blue-950 text-blue-400 hover:bg-blue-900 border border-blue-800"
                              title="Voice Call"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: Second Incharge (2IC) */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-400" /> Second Incharge (2IC)
                    </div>
                    {office.secondIncharge?.grade && (
                      <span className="text-[10px] font-bold bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/40">
                        {office.secondIncharge.grade}
                      </span>
                    )}
                  </div>

                  <div className="text-base font-bold text-white mt-2">
                    {office.secondIncharge?.name || 'Rashid Ali Solangi'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {office.secondIncharge?.designation || 'Assistant Incharge / Superintendent'}
                  </div>

                  {/* Active Tenure Display */}
                  <div className="mt-3 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" /> Active Service Tenure
                    </div>
                    <div className="font-mono text-indigo-300 font-semibold mt-0.5">
                      {secondInchargeTenure.text}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Serving since: {office.secondIncharge?.startDate || '2024-01-10'}
                    </div>
                  </div>
                </div>

                {/* 2IC Contacts */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-1.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Direct Contact Channels:
                  </div>
                  <div className="space-y-1.5">
                    {(office.secondIncharge?.contacts || []).map((c, i) => (
                      <div
                        key={c.id || i}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 font-medium mr-1.5 uppercase">{c.label}:</span>
                          <span className="font-mono text-white font-semibold">{c.number}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 no-export">
                          {(c.type === 'whatsapp' || c.type === 'both') && (
                            <a
                              href={`https://wa.me/${c.number.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </a>
                          )}
                          <a
                            href={`tel:${c.number}`}
                            className="p-1 rounded bg-blue-950 text-blue-400 hover:bg-blue-900 border border-blue-800"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: Office Assistant (OA) (User Requirement 5) */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-amber-400" /> Office Assistant (OA)
                    </div>
                    <span className="text-[10px] font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40">
                      {office.assistant?.grade || 'BPS-14'}
                    </span>
                  </div>

                  <div className="text-base font-bold text-white mt-2">
                    {office.assistant?.name || 'Naveed Ahmed Kalhoro'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {office.assistant?.designation || 'Office Assistant (OA)'}
                  </div>

                  {/* Tasks & Responsibilities */}
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-200">
                    <div className="text-[10px] uppercase font-bold text-amber-400 mb-0.5">Tasks &amp; Responsibilities:</div>
                    <div className="line-clamp-3 text-slate-300">
                      {office.assistant?.responsibilities ||
                        'Token queue coordination, staff daily duty registers, public facilitation and archive reconciliations.'}
                    </div>
                  </div>

                  {/* Active Tenure Display */}
                  <div className="mt-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> Active Service Tenure
                    </div>
                    <div className="font-mono text-amber-300 font-semibold mt-0.5">
                      {oaTenure.text}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Serving since: {office.assistant?.startDate || '2024-02-01'}
                    </div>
                  </div>
                </div>

                {/* OA Mobile & WhatsApp */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-1.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Official Mobile &amp; WhatsApp:
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <div className="truncate">
                      <span className="text-[10px] text-slate-400 font-medium mr-1.5">MOBILE:</span>
                      <span className="font-mono text-white font-semibold">
                        {office.assistant?.mobileNumber || '0302-3456789'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 no-export">
                      {office.assistant?.whatsappNumber && (
                        <a
                          href={`https://wa.me/${office.assistant.whatsappNumber.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 text-[11px] font-semibold flex items-center gap-1"
                          title="Direct WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {office.assistant?.mobileNumber && (
                        <a
                          href={`tel:${office.assistant.mobileNumber}`}
                          className="p-1 rounded bg-blue-950 text-blue-400 hover:bg-blue-900 border border-blue-800"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: DAY-BY-DAY LEADERSHIP TENURE HISTORY (User Requirement 4) */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    Day-by-Day Leadership Tenure History (OIC, 2IC &amp; OA)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Permanent chronological record of all officers serving at this center with calculated tenure durations.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  {historyRecords.length + 2} Total Records
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Officer Name</th>
                      <th className="py-2.5 px-3">Designation &amp; Grade</th>
                      <th className="py-2.5 px-3">Tenure Period</th>
                      <th className="py-2.5 px-3">Tenure Duration (Days / Wks / Yrs)</th>
                      <th className="py-2.5 px-3">Transfer Order / Reassignment Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {/* Active Incharge Row */}
                    <tr className="bg-blue-950/20 font-medium">
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold">
                          CURRENT OIC
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans font-bold text-white">
                        {office.incharge?.name || 'Muhammad Aslam Chandio'}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">
                        {office.incharge?.designation || 'Incharge'} ({office.incharge?.grade || 'BPS-17'})
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400">
                        {office.incharge?.startDate || '2023-08-15'} → Present
                      </td>
                      <td className="py-2.5 px-3 text-emerald-300 font-bold">
                        {inchargeTenure.text}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-400 italic">
                        Currently in active operational command
                      </td>
                    </tr>

                    {/* Active OA Row */}
                    <tr className="bg-amber-950/20 font-medium">
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                          CURRENT OA
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans font-bold text-white">
                        {office.assistant?.name || 'Naveed Ahmed Kalhoro'}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">
                        {office.assistant?.designation || 'Office Assistant'} ({office.assistant?.grade || 'BPS-14'})
                      </td>
                      <td className="py-2.5 px-3 text-amber-400">
                        {office.assistant?.startDate || '2024-02-01'} → Present
                      </td>
                      <td className="py-2.5 px-3 text-amber-300 font-bold">
                        {oaTenure.text}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-400 italic">
                        Currently serving as center Office Assistant
                      </td>
                    </tr>

                    {/* Archived History Records */}
                    {historyRecords.map((rec) => {
                      const dur = rec.tenureDuration || calculateTenureDetails(rec.startDate, rec.endDate).text;
                      return (
                        <tr key={rec.id} className="hover:bg-slate-900/60">
                          <td className="py-2.5 px-3 font-sans">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                              {rec.roleTitle || rec.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-sans font-medium text-white">{rec.name}</td>
                          <td className="py-2.5 px-3 font-sans text-slate-300">
                            {rec.designation} {rec.grade ? `(${rec.grade})` : ''}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {rec.startDate} → {rec.endDate || 'Ongoing'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-200">{dur}</td>
                          <td className="py-2.5 px-3 font-sans text-slate-400 truncate max-w-sm">
                            {rec.remarks || rec.transferOrderNo || 'Completed regular operational tenure'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* STAFF HEADCOUNT BREAKDOWN */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Staff Headcount Breakdown by Category &amp; Gender
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Officially sanctioned distribution across Officers, Officials, Supporting Staff, and Outsource Personnel
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
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Officers (Grade 16 &amp; Above)
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
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Officials (DEO &amp; Registration Executives)
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
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Supporting Staff (Drivers, Attendants, Naib Qasid)
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
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Outsource Personnel (Security, Janitorial Staff)
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
                    <tr className="bg-slate-950 font-bold border-t-2 border-slate-700">
                      <td className="py-2.5 px-3 font-sans text-white">CONSOLIDATED OFFICE WORKFORCE</td>
                      <td className="py-2.5 px-3 text-right text-blue-400 tabular-nums">{totalMale}</td>
                      <td className="py-2.5 px-3 text-right text-purple-400 tabular-nums">{totalFemale}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 text-sm tabular-nums">
                        {totalStaffCalculated}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-slate-900 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportJpg}
              disabled={isExporting !== null}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isExporting === 'jpg' ? 'Saving...' : 'Save in JPG'}</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExporting !== null}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isExporting === 'pdf' ? 'Saving...' : 'Save in PDF'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {onViewLedger && (
              <button
                onClick={() => {
                  onClose();
                  onViewLedger(office.code);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                View Performance Ledger
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
