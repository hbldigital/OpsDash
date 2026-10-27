/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  Info,
  ShieldCheck,
  Plus,
  Camera,
  Download,
  Share2,
  Filter,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Calendar,
  Building2,
  Printer,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DailyReport, ZoneSummary, Office, EmployeeAttendanceRecord } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { AttendanceManualEntryModal } from '../modals/AttendanceManualEntryModal';
import { AttendanceOcrUploadModal } from '../modals/AttendanceOcrUploadModal';
import { useLocalization } from '../../context/LocalizationContext';
import { exportElementToJpg, exportElementToPdf, exportToCsv, shareOrDownloadJpg } from '../../utils/exportEngine';

interface EmployeeAttendanceViewProps {
  currentDate: string;
  reports: DailyReport[];
  zoneSummary: ZoneSummary;
  offices?: Office[];
  onSelectOffice: (officeCode: string) => void;
  onSelectOfficeProfile?: (officeCode: string) => void;
}

export const EmployeeAttendanceView: React.FC<EmployeeAttendanceViewProps> = ({
  currentDate,
  reports,
  zoneSummary,
  offices = [],
  onSelectOffice,
  onSelectOfficeProfile,
}) => {
  const { threshold1, threshold2, zoneName, zoneCode } = useLocalization();

  const [activeTab, setActiveTab] = useState<'roster' | 'offices'>('roster');
  const [selectedOfficeCode, setSelectedOfficeCode] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);

  // Attendance Records State
  const [attendanceRecords, setAttendanceRecords] = useState<EmployeeAttendanceRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const reportCanvasRef = useRef<HTMLDivElement>(null);

  // Load employee attendance from backend
  const loadAttendance = useCallback(async () => {
    setIsLoadingRecords(true);
    try {
      let url = `/api/attendance?date=${currentDate}`;
      if (selectedOfficeCode !== 'ALL') {
        url += `&officeCode=${selectedOfficeCode}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        setAttendanceRecords(data.records);
      }
    } catch (err) {
      console.error('Failed to load employee attendance records:', err);
    } finally {
      setIsLoadingRecords(false);
    }
  }, [currentDate, selectedOfficeCode]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // Handle Manual Save
  const handleSaveManualRecord = async (record: Partial<EmployeeAttendanceRecord>) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      const data = await res.json();
      if (data.success) {
        await loadAttendance();
      }
    } catch (err) {
      console.error('Failed to save record:', err);
    }
  };

  // Handle OCR Import Success
  const handleOcrImportSuccess = async () => {
    await loadAttendance();
  };

  // Delete Attendance Record
  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee attendance record?')) return;
    try {
      const res = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete attendance record:', err);
    }
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((r) => {
      // Office match
      if (selectedOfficeCode !== 'ALL' && r.officeCode.toUpperCase() !== selectedOfficeCode.toUpperCase()) {
        return false;
      }

      // Status match
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'LATE_ANY') {
          if (r.status !== 'LATE_745' && r.status !== 'LATE_800') return false;
        } else if (r.status !== statusFilter) {
          return false;
        }
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.employeeName.toLowerCase().includes(q);
        const matchId = r.employeeId.toLowerCase().includes(q);
        const matchDesig = r.designation.toLowerCase().includes(q);
        const matchOffice = r.officeName.toLowerCase().includes(q) || r.officeCode.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDesig && !matchOffice) return false;
      }

      return true;
    });
  }, [attendanceRecords, selectedOfficeCode, statusFilter, searchQuery]);

  // Summary Metrics calculated for current view
  const metrics = useMemo(() => {
    const list = filteredRecords;
    const total = list.length;
    const late745 = list.filter((r) => r.status === 'LATE_745' || r.status === 'LATE_800').length;
    const late800 = list.filter((r) => r.status === 'LATE_800').length;
    const onTime = list.filter((r) => r.status === 'ON_TIME').length;
    const absent = list.filter((r) => r.status === 'ABSENT').length;
    return { total, late745, late800, onTime, absent };
  }, [filteredRecords]);

  // High Quality Export to JPG
  const handleExportJpg = async () => {
    if (!reportCanvasRef.current) return;
    setIsExporting(true);
    setExportMessage('Generating high-resolution official JPG...');
    try {
      const officeLabel = selectedOfficeCode === 'ALL' ? 'Zone_Consolidated' : selectedOfficeCode;
      const filename = `NADRA_${officeLabel}_Attendance_${currentDate}_${Date.now()}.jpg`;
      const res = await exportElementToJpg(reportCanvasRef.current, {
        filename,
        title: `NADRA Attendance Register - ${officeLabel} - ${currentDate}`,
      });
      if (res.success && res.dataUrl) {
        setExportMessage('JPG report downloaded successfully! Ready to share.');
        setTimeout(() => setExportMessage(null), 3500);
      }
    } catch (err) {
      console.error(err);
      setExportMessage('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // High Quality Export to PDF
  const handleExportPdf = async () => {
    if (!reportCanvasRef.current) return;
    setIsExporting(true);
    setExportMessage('Rendering official PDF document...');
    try {
      const officeLabel = selectedOfficeCode === 'ALL' ? 'Zone_Consolidated' : selectedOfficeCode;
      const filename = `NADRA_${officeLabel}_Attendance_${currentDate}.pdf`;
      await exportElementToPdf(reportCanvasRef.current, { filename });
      setExportMessage('PDF report downloaded!');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const columns = [
      { key: 'employeeId', header: 'Employee ID' },
      { key: 'employeeName', header: 'Employee Full Name' },
      { key: 'officeCode', header: 'Office Code' },
      { key: 'officeName', header: 'Office / DAU Name' },
      { key: 'designation', header: 'Designation' },
      { key: 'category', header: 'Staff Category' },
      { key: 'gender', header: 'Gender' },
      { key: 'checkInTime', header: 'Arrival Time' },
      { key: 'status', header: 'Punctuality Status' },
      { key: 'notes', header: 'Remarks' },
    ];

    const officeLabel = selectedOfficeCode === 'ALL' ? 'Zone_Consolidated' : selectedOfficeCode;
    exportToCsv(
      columns,
      filteredRecords,
      `NADRA_Attendance_${officeLabel}_${currentDate}.csv`,
      `NADRA Zone-D Larkana Employee Attendance Register (${currentDate})`
    );
  };

  // Chart data for Office-Wise comparative breakdown
  const chartData = useMemo(() => {
    return [...reports]
      .sort((a, b) => b.lateAfter745 - a.lateAfter745)
      .slice(0, 10)
      .map((r) => ({
        name: r.officeName.replace('NRC ', '').substring(0, 14),
        onTime: r.onTimeEmployees,
        late745: r.lateAfter745,
        late800: r.lateAfter800,
      }));
  }, [reports]);

  const handleOfficeClick = (code: string) => {
    if (onSelectOfficeProfile) {
      onSelectOfficeProfile(code);
    } else {
      onSelectOffice(code);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <span>Workforce Attendance Register</span>
              <span>·</span>
              <span className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {currentDate}
              </span>
              <span>·</span>
              <span className="text-amber-300 font-mono">
                Zone: {zoneName} ({zoneCode})
              </span>
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight">
              Daily Employee Attendance Sheet &amp; Biometric Log
            </h2>
            <p className="text-xs text-slate-400">
              Shift arrival monitoring based on configured official punctuality thresholds (Threshold 1: {threshold1} AM, Threshold 2: {threshold2} AM).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Attendance Manually
            </button>
            <button
              onClick={() => setIsOcrModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-sm transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              Upload Biometric Sheet (Vision OCR)
            </button>
          </div>
        </div>
      </div>

      {/* Critical Overlap Calculation Rule Callout */}
      <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-white">NADRA Punctuality Standards Enforced:</div>
          <div>
            Employees arriving after {threshold2} AM are mathematically a subset of arrivals past {threshold1} AM. These thresholds track progressive tardiness and must not be double counted. On-time compliance is calculated as Total Staff minus arrivals past {threshold1} AM.
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'roster'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Individual Employee Register ({filteredRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('offices')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'offices'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Office-Wise Statistics Table ({reports.length} Offices)
        </button>
      </div>

      {/* TAB 1: INDIVIDUAL EMPLOYEE ATTENDANCE SHEET */}
      {activeTab === 'roster' && (
        <div className="space-y-5">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              title={`Late Arrivals > ${threshold1} AM`}
              value={metrics.late745}
              subtitle="Tardy past grace threshold"
              icon={Clock}
              status={metrics.late745 > 0 ? 'warning' : 'nominal'}
            />
            <KpiCard
              title={`Late Arrivals > ${threshold2} AM`}
              value={metrics.late800}
              subtitle={`Severe tardiness past ${threshold2}`}
              icon={AlertCircle}
              status={metrics.late800 > 0 ? 'error' : 'nominal'}
            />
            <KpiCard
              title="Punctual Staff"
              value={metrics.onTime}
              subtitle={`${Math.round((metrics.onTime / (metrics.total || 1)) * 100)}% On-time compliance`}
              icon={CheckCircle2}
              status="nominal"
            />
            <KpiCard
              title="Total Staff in Register"
              value={metrics.total}
              subtitle={selectedOfficeCode === 'ALL' ? 'Across All Zone Centers' : selectedOfficeCode}
              icon={Users}
            />
          </div>

          {/* Filter Bar & Export Toolbar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Office Selector Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-400">Office:</span>
                <select
                  value={selectedOfficeCode}
                  onChange={(e) => setSelectedOfficeCode(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">All Zone Offices ({offices.length || 20})</option>
                  {offices.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.code} - {o.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">All Records</option>
                  <option value="LATE_ANY">All Late Comers ({threshold1} &amp; {threshold2})</option>
                  <option value="LATE_745">Late Comers (&gt; {threshold1} AM)</option>
                  <option value="LATE_800">Late Comers (&gt; {threshold2} AM)</option>
                  <option value="ON_TIME">Punctual (On Time)</option>
                  <option value="ABSENT">Absent / Leave</option>
                </select>
              </div>

              {/* Search by Name / Token */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff, ID, office..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                title="Export clean CSV"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                title="Export high-res PDF"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
              <button
                onClick={handleExportJpg}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all"
                title="Save high quality JPG report"
              >
                <Share2 className="w-3.5 h-3.5" />
                Save Report as JPG
              </button>
            </div>
          </div>

          {/* Export Status Notification */}
          {exportMessage && (
            <div className="p-2.5 bg-blue-900/60 border border-blue-700 text-blue-200 rounded-lg text-xs flex items-center justify-between">
              <span>{exportMessage}</span>
            </div>
          )}

          {/* High-Resolution Printable Container (Clean official report without web chrome) */}
          <div
            ref={reportCanvasRef}
            className="p-5 sm:p-6 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 space-y-4"
          >
            {/* Formal Report Header */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                    NATIONAL DATABASE &amp; REGISTRATION AUTHORITY (NADRA)
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                    Zone-D Larkana — Daily Workforce Attendance &amp; Punctuality Register
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                    <span>Date: <strong className="text-slate-200">{currentDate}</strong></span>
                    <span>•</span>
                    <span>Zone Code: <strong className="text-amber-300 font-mono">{zoneCode}</strong></span>
                    <span>•</span>
                    <span>Jurisdiction: <strong className="text-slate-200">{selectedOfficeCode === 'ALL' ? 'Zone-Wide (All DAUs/NRCs)' : selectedOfficeCode}</strong></span>
                    <span>•</span>
                    <span>Late Rules: <strong className="text-slate-200">&gt;{threshold1} AM / &gt;{threshold2} AM</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    Staff: <strong className="text-white">{metrics.total}</strong>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                    On-Time: <strong>{metrics.onTime}</strong>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-amber-950 border border-amber-800 text-amber-400">
                    &gt;{threshold1}: <strong>{metrics.late745}</strong>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-rose-950 border border-rose-800 text-rose-400">
                    &gt;{threshold2}: <strong>{metrics.late800}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Attendance Roster Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Emp ID</th>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3">Office / Center</th>
                    <th className="py-2.5 px-3">Designation</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Gender</th>
                    <th className="py-2.5 px-3 text-right">Clock-In Time</th>
                    <th className="py-2.5 px-3">Punctuality Status</th>
                    <th className="py-2.5 px-3">Remarks / Source</th>
                    <th className="py-2.5 px-3 text-right no-export">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {isLoadingRecords ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        Loading daily attendance records...
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        No employee attendance records match the selected filters. Use "+ Add Attendance Manually" or "Upload Biometric Sheet (Vision OCR)" above.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400">{r.employeeId}</td>
                        <td className="py-2.5 px-3 font-sans font-medium text-white">
                          {r.employeeName}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          {/* Universal click to view office profile */}
                          <button
                            type="button"
                            onClick={() => handleOfficeClick(r.officeCode)}
                            className="text-blue-400 hover:text-blue-300 hover:underline font-semibold text-left inline-flex items-center gap-1"
                            title="Click to view full Office Profile"
                          >
                            <span>{r.officeName}</span>
                            <span className="text-[10px] text-blue-500 font-mono">[{r.officeCode}]</span>
                          </button>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-300">{r.designation}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-400">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                            {r.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-400">{r.gender}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-white tabular-nums">
                          {r.checkInTime}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          {r.status === 'ON_TIME' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> On Time (≤ {threshold1})
                            </span>
                          )}
                          {r.status === 'LATE_745' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                              <Clock className="w-3 h-3" /> Late (&gt; {threshold1})
                            </span>
                          )}
                          {r.status === 'LATE_800' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950 text-rose-400 border border-rose-800">
                              <AlertCircle className="w-3 h-3" /> Late (&gt; {threshold2})
                            </span>
                          )}
                          {r.status === 'ABSENT' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                              Absent
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-400 max-w-[200px] truncate">
                          {r.notes || r.source}
                        </td>
                        <td className="py-2.5 px-3 text-right no-export">
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(r.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Report Sign-off Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div>
                <span>Authority: </span>
                <strong className="text-slate-200">Director Operations, NADRA Zone-D Larkana</strong>
              </div>
              <div>
                <span>Official Status: </span>
                <strong className="text-emerald-400">Verified Biometric Ledger</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICE-WISE ATTENDANCE STATISTICS TABLE & CHARTS */}
      {activeTab === 'offices' && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Comparative Attendance Breakdown (Top 10 Centers with Late Arrivals)
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Punctual staff vs late past {threshold1} AM and {threshold2} AM
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="onTime" name={`On Time (<= ${threshold1})`} fill="#10b981" stackId="a" />
                  <Bar dataKey="late745" name={`Late > ${threshold1} AM`} fill="#f59e0b" stackId="b" />
                  <Bar dataKey="late800" name={`Late > ${threshold2} AM (Subset)`} fill="#ef4444" stackId="c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Office-Wise Aggregated Table */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Office-Wise Attendance Statistics Table
                </h3>
                <p className="text-[11px] text-slate-400">
                  Click any office name or code to inspect its full Office Profile.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Office Code</th>
                    <th className="py-2.5 px-3">Office / DAU Name</th>
                    <th className="py-2.5 px-3 text-right">Total Staff</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400">On Time (≤ {threshold1} AM)</th>
                    <th className="py-2.5 px-3 text-right text-amber-400">Late (&gt; {threshold1} AM)</th>
                    <th className="py-2.5 px-3 text-right text-rose-400">Late (&gt; {threshold2} AM)</th>
                    <th className="py-2.5 px-3">Data Source</th>
                    <th className="py-2.5 px-3">Last Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {reports.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => handleOfficeClick(r.officeCode)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      title="Click to view full Office Profile"
                    >
                      <td className="py-2.5 px-3 font-semibold text-blue-400">{r.officeCode}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-white hover:text-blue-300">
                        {r.officeName}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-200 tabular-nums">{r.totalEmployees}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 tabular-nums">{r.onTimeEmployees}</td>
                      <td className="py-2.5 px-3 text-right text-amber-400 tabular-nums">{r.lateAfter745}</td>
                      <td className="py-2.5 px-3 text-right text-rose-400 tabular-nums">{r.lateAfter800}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-400">{r.sourceType}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-400">
                        {new Date(r.updatedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}

                  {/* Consolidated Total Row */}
                  <tr className="bg-blue-950/40 border-t-2 border-blue-600/60 font-bold text-white text-xs">
                    <td className="py-2.5 px-3 text-blue-300">TOTAL</td>
                    <td className="py-2.5 px-3 font-sans uppercase text-blue-200">
                      Total Consolidated Zone ({zoneSummary.reportedOfficesCount} Offices)
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{zoneSummary.totalEmployees}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-300 tabular-nums">{zoneSummary.onTimeEmployees}</td>
                    <td className="py-2.5 px-3 text-right text-amber-300 tabular-nums">{zoneSummary.lateAfter745}</td>
                    <td className="py-2.5 px-3 text-right text-rose-300 tabular-nums">{zoneSummary.lateAfter800}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">Aggregated</td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">Today</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <AttendanceManualEntryModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          offices={offices}
          currentDate={currentDate}
          defaultOfficeCode={selectedOfficeCode !== 'ALL' ? selectedOfficeCode : undefined}
          onSave={handleSaveManualRecord}
        />
      )}

      {/* Vision OCR Picture Upload Modal */}
      {isOcrModalOpen && (
        <AttendanceOcrUploadModal
          isOpen={isOcrModalOpen}
          onClose={() => setIsOcrModalOpen(false)}
          offices={offices}
          currentDate={currentDate}
          defaultOfficeCode={selectedOfficeCode !== 'ALL' ? selectedOfficeCode : undefined}
          onImportSuccess={handleOcrImportSuccess}
        />
      )}
    </div>
  );
};
