/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  MapPin,
  History,
  Sliders,
  CheckCircle2,
  Users,
  Building,
  Key,
  Save,
  Search,
  Clock,
  Phone,
  Edit3,
  RotateCcw,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Office, User, AuditLog, AppSettings } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';
import { exportToCsv } from '../../utils/exportEngine';

// ==========================================
// USER MANAGEMENT VIEW
// ==========================================
interface UserManagementViewProps {
  users: User[];
  currentUser: User | null;
  onSwitchUser: (userId: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onSwitchUser,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <span>Identity &amp; Access Control (RBAC)</span>
          <span>·</span>
          <span>Security Governance</span>
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
          User Management &amp; Role-Based Permissions
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Server-enforced access boundaries separating Zonal Supervisors, Verification Officers, and Office Data Entry Operators.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Official Email</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3">Jurisdiction</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Switch Active Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => {
                const isCurrent = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-medium text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      {u.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{u.username}</td>
                    <td className="py-2.5 px-3 text-slate-300">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-800/40">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {u.officeCode ? `Office ${u.officeCode}` : 'Zone-D Larkana (Full Zone)'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-emerald-400 font-medium">Active</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isCurrent ? (
                        <span className="text-xs text-blue-400 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Current User
                        </span>
                      ) : (
                        <button
                          onClick={() => onSwitchUser(u.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                        >
                          Simulate User
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// OFFICE MANAGEMENT VIEW
// ==========================================
export interface OfficeManagementViewProps {
  offices: Office[];
  onSelectOffice?: (officeCode: string) => void;
  onSelectOfficeProfile?: (officeCode: string) => void;
  onEditOffice?: (office: Office) => void;
}

export const OfficeManagementView: React.FC<OfficeManagementViewProps> = ({
  offices,
  onSelectOffice,
  onSelectOfficeProfile,
  onEditOffice,
}) => {
  const [search, setSearch] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('ALL');

  const filtered = offices.filter((o) => {
    const matchSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.district.toLowerCase().includes(search.toLowerCase()) ||
      (o.incharge?.name && o.incharge.name.toLowerCase().includes(search.toLowerCase()));

    const matchDistrict = filterDistrict === 'ALL' || o.district === filterDistrict;
    return matchSearch && matchDistrict;
  });

  const districts = Array.from(new Set(offices.map((o) => o.district)));

  const handleExportCsv = () => {
    const columns = [
      { key: 'code', header: 'Office Code' },
      { key: 'name', header: 'Center Name' },
      { key: 'type', header: 'Type' },
      { key: 'zoneName', header: 'Zone Name' },
      { key: 'zoneCode', header: 'Zone Code' },
      { key: 'district', header: 'District' },
      { key: 'landline', header: 'Landline' },
      { key: 'address', header: 'Physical Address' },
      { key: 'inchargeName', header: 'Incharge Name' },
      { key: 'inchargePhones', header: 'Incharge Contacts' },
      { key: 'assistantName', header: 'Assistant Name' },
      { key: 'totalStaff', header: 'Total Staff' },
      { key: 'officers', header: 'Officers (M/F)' },
      { key: 'officials', header: 'Officials (M/F)' },
      { key: 'supporting', header: 'Supporting (M/F)' },
      { key: 'outsource', header: 'Outsource (M/F)' },
    ];

    const rows = filtered.map((o) => {
      const sb = o.staffBreakdown;
      const icPhones = (o.incharge?.contacts || []).map((c) => `${c.label}: ${c.number}`).join('; ');
      return {
        code: o.code,
        name: o.name,
        type: o.type,
        zoneName: o.zoneName || 'Larkana',
        zoneCode: o.zoneCode || 'Z050D',
        district: o.district,
        landline: o.landline || '',
        address: o.address || '',
        inchargeName: o.incharge?.name || '',
        inchargePhones: icPhones,
        assistantName: o.assistant?.name || '',
        totalStaff: sb?.totalStaff || o.expectedStaff || 0,
        officers: sb ? `${sb.officersMale}M / ${sb.officersFemale}F` : '',
        officials: sb ? `${sb.officialsMale}M / ${sb.officialsFemale}F` : '',
        supporting: sb ? `${sb.supportingMale}M / ${sb.supportingFemale}F` : '',
        outsource: sb ? `${sb.outsourceMale}M / ${sb.outsourceFemale}F` : '',
      };
    });

    exportToCsv(
      columns,
      rows,
      `NADRA_Zone_D_Offices_Directory.csv`,
      'NADRA Zone-D Larkana Centers Directory & Staff Register'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <span>Infrastructure &amp; Facilities</span>
            <span>·</span>
            <span>Regional Network</span>
            <span>·</span>
            <span className="text-amber-300 font-mono">Zone: Larkana (Z050D)</span>
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
            Office &amp; Registration Center (NRC / DAU) Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete management directory of centers across Larkana, Qambar-Shahdadkot, Shikarpur, Jacobabad, and Kashmore. Click any office to view its official profile or edit details.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export Directory CSV
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Configured Centers ({filtered.length} of {offices.length} Units)
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Districts ({districts.length})</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search center, code, incharge..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Official Center Name</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3">Incharge Name</th>
                <th className="py-2.5 px-3">Primary Contact</th>
                <th className="py-2.5 px-3 text-right">Staff Count</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filtered.map((o) => {
                const totalStaff = o.staffBreakdown?.totalStaff || o.expectedStaff || 0;
                const primeContact = o.incharge?.contacts?.[0];

                return (
                  <tr key={o.code} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-blue-400">
                      <button
                        onClick={() => onSelectOfficeProfile && onSelectOfficeProfile(o.code)}
                        className="hover:underline font-bold"
                        title="View Office Profile"
                      >
                        {o.code}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-white">
                      <button
                        onClick={() => onSelectOfficeProfile && onSelectOfficeProfile(o.code)}
                        className="hover:text-blue-300 text-left font-semibold"
                        title="View Office Profile"
                      >
                        {o.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">{o.district}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-400">
                      {o.zoneName || 'Larkana'} ({o.zoneCode || 'Z050D'})
                    </td>
                    <td className="py-2.5 px-3 font-sans text-white">
                      {o.incharge?.name || 'Assigned Officer'}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">
                      {primeContact ? (
                        <span className="text-[11px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {primeContact.number}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold tabular-nums">
                      {totalStaff} Staff
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="text-emerald-400 font-medium">Operational</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectOfficeProfile && onSelectOfficeProfile(o.code)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-400 hover:text-white bg-blue-950/60 hover:bg-blue-900/60 rounded border border-blue-800/50"
                        >
                          View Profile
                        </button>
                        {onEditOffice && (
                          <button
                            onClick={() => onEditOffice(o)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 rounded border border-emerald-800/50"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// AUDIT LOGS VIEW
// ==========================================
interface AuditLogsViewProps {
  logs?: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs = [] }) => {
  const [search, setSearch] = useState('');

  const filtered = logs.filter(
    (l) =>
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <span>Security &amp; Compliance Trails</span>
          <span>·</span>
          <span>Immutable Audit Ledger</span>
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
          System Audit &amp; Verification Logs
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Complete forensic log recording user logins, image uploads, OCR extraction batches, manual figure corrections, and discrepancy resolutions.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Audit Trail ({logs.length} Logged Events)
          </h3>
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User &amp; Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-white">{l.userName}</div>
                    <div className="text-[10px] text-slate-400">{l.role}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{l.category}</td>
                  <td className="py-2.5 px-3 text-slate-200 max-w-md truncate">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SETTINGS VIEW (TIMINGS & EDITABLE TEXTS)
// ==========================================
interface SettingsViewProps {
  settings?: AppSettings;
  onUpdateSettings?: (settings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = () => {
  const {
    threshold1,
    threshold2,
    zoneName,
    zoneCode,
    customTexts,
    updateTimings,
    updateAllTexts,
    resetToDefaults,
  } = useLocalization();

  const [t1, setT1] = useState(threshold1);
  const [t2, setT2] = useState(threshold2);
  const [zName, setZName] = useState(zoneName);
  const [zCode, setZCode] = useState(zoneCode);

  const [localTexts, setLocalTexts] = useState<Record<string, string>>({ ...customTexts });
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    setT1(threshold1);
    setT2(threshold2);
    setZName(zoneName);
    setZCode(zoneCode);
    setLocalTexts({ ...customTexts });
  }, [threshold1, threshold2, zoneName, zoneCode, customTexts]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTimings(t1, t2, zName, zCode);
    await updateAllTexts(localTexts);
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 3000);
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all titles, headings, and timings to default system values?')) return;
    await resetToDefaults();
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <span>System Parameters &amp; Terminology</span>
          <span>·</span>
          <span>Configuration</span>
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
          Shift Timings &amp; Custom System Text Editor
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Adjust official shift punctuality thresholds for winter, Ramadan, or future schedules, and customize all navigation labels, titles, and headings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {savedNote && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            Configuration and custom texts saved successfully and applied instantly!
          </div>
        )}

        {/* Section 1: Shift Punctuality Timings */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" />
            1. Configurable Shift Arrival Timings &amp; Zone Identifiers
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Threshold 1 (Late Arrival Time)
              </label>
              <input
                type="time"
                value={t1}
                onChange={(e) => setT1(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 07:45 AM</span>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Threshold 2 (Critical Late Arrival)
              </label>
              <input
                type="time"
                value={t2}
                onChange={(e) => setT2(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 08:00 AM</span>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Zone Name
              </label>
              <input
                type="text"
                value={zName}
                onChange={(e) => setZName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">e.g. Larkana</span>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Zone Code
              </label>
              <input
                type="text"
                value={zCode}
                onChange={(e) => setZCode(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">e.g. Z050D</span>
            </div>
          </div>
        </div>

        {/* Section 2: Editable System Texts & Terminology */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            2. System Texts, Titles, Navigation Labels &amp; Headings
          </h3>
          <p className="text-[11px] text-slate-400">
            Edit and customize the exact wording appearing across headers, navigation menus, tables, and footers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">App Header Title</label>
              <input
                type="text"
                value={localTexts.appHeaderTitle || ''}
                onChange={(e) => setLocalTexts({ ...localTexts, appHeaderTitle: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">App Subtitle</label>
              <input
                type="text"
                value={localTexts.appHeaderSubtitle || ''}
                onChange={(e) => setLocalTexts({ ...localTexts, appHeaderSubtitle: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Consolidated Table Title</label>
              <input
                type="text"
                value={localTexts.tableTitle || ''}
                onChange={(e) => setLocalTexts({ ...localTexts, tableTitle: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Attendance Sheet Title</label>
              <input
                type="text"
                value={localTexts.attendanceTitle || ''}
                onChange={(e) => setLocalTexts({ ...localTexts, attendanceTitle: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Office Profile Modal Heading</label>
              <input
                type="text"
                value={localTexts.officeProfileTitle || ''}
                onChange={(e) => setLocalTexts({ ...localTexts, officeProfileTitle: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Footer Official Text</label>
              <input
                type="text"
                value={localTexts.footerText || ''}
                onChange={(e) => setLocalTexts({ ...localTexts, footerText: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 rounded-lg border border-rose-800/40 transition-colors"
          >
            Reset All Labels &amp; Timings to Defaults
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Save Configuration &amp; Texts
          </button>
        </div>
      </form>
    </div>
  );
};
