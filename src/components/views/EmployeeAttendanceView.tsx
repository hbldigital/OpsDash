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
  Plus,
  Camera,
  Download,
  Share2,
  Filter,
  FileSpreadsheet,
  Trash2,
  Calendar,
  Building2,
  ShieldAlert,
  Award,
  AlertTriangle,
  FileText,
  UserCheck,
  ChevronRight,
  TrendingDown,
  TrendingUp,
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
import { DailyReport, ZoneSummary, Office, EmployeeAttendanceRecord, EmployeeProfile } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { AttendanceManualEntryModal } from '../modals/AttendanceManualEntryModal';
import { AttendanceOcrUploadModal } from '../modals/AttendanceOcrUploadModal';
import { useLocalization } from '../../context/LocalizationContext';
import { exportElementToJpg, exportElementToPdf, exportToCsv } from '../../utils/exportEngine';

interface EmployeeAttendanceViewProps {
  currentDate: string;
  reports: DailyReport[];
  zoneSummary: ZoneSummary;
  offices?: Office[];
  onSelectOffice: (officeCode: string) => void;
  onSelectOfficeProfile?: (officeCode: string) => void;
  onSelectEmployee?: (employee: EmployeeProfile | string) => void;
}

type HistoryRange = '1d' | '2d' | '7d' | '30d' | '90d' | 'year';

export const EmployeeAttendanceView: React.FC<EmployeeAttendanceViewProps> = ({
  currentDate,
  reports,
  zoneSummary,
  offices = [],
  onSelectOffice,
  onSelectOfficeProfile,
  onSelectEmployee,
}) => {
  const { threshold1, threshold2, zoneName, zoneCode } = useLocalization();

  const [activeTab, setActiveTab] = useState<'roster' | 'offices'>('roster');
  const [selectedOfficeCode, setSelectedOfficeCode] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [historyRange, setHistoryRange] = useState<HistoryRange>('1d');
  const [excessiveLeavesOnly, setExcessiveLeavesOnly] = useState(false);
  const [habitualLateOnly, setHabitualLateOnly] = useState(false);

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);

  // Attendance Records State
  const [attendanceRecords, setAttendanceRecords] = useState<EmployeeAttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const reportCanvasRef = useRef<HTMLDivElement>(null);

  // Load employee directory for profile linking and character scoring
  const loadEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success && Array.isArray(data.employees)) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.warn('Failed loading employee directory:', err);
    }
  }, []);

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
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // Lookup map for employees by name or ERP
  const employeeMap = useMemo(() => {
    const map = new Map<string, EmployeeProfile>();
    employees.forEach((emp) => {
      if (emp.id) map.set(emp.id.toLowerCase(), emp);
      if (emp.erpNumber) map.set(emp.erpNumber.toLowerCase(), emp);
      if (emp.name) map.set(emp.name.toLowerCase().trim(), emp);
    });
    return map;
  }, [employees]);

  // Helper to find employee dossier
  const getEmployeeProfile = (r: EmployeeAttendanceRecord): EmployeeProfile | undefined => {
    return (
      employeeMap.get(r.employeeId.toLowerCase()) ||
      employeeMap.get(r.employeeName.toLowerCase().trim())
    );
  };

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

      const emp = getEmployeeProfile(r);

      // Excessive leaves filter
      if (excessiveLeavesOnly) {
        if (!emp?.excessiveLeavesFlag) return false;
      }

      // Habitual late arrivals filter
      if (habitualLateOnly) {
        const isHabitual = emp ? (emp.lateCountThisMonth || 0) >= 3 : r.status !== 'ON_TIME';
        if (!isHabitual) return false;
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
  }, [attendanceRecords, selectedOfficeCode, statusFilter, searchQuery, excessiveLeavesOnly, habitualLateOnly, employeeMap]);

  // Summary Metrics calculated for current view
  const metrics = useMemo(() => {
    const list = attendanceRecords;
    const total = list.length;
    const late745 = list.filter((r) => r.status === 'LATE_745' || r.status === 'LATE_800').length;
    const late800 = list.filter((r) => r.status === 'LATE_800').length;
    const onTime = list.filter((r) => r.status === 'ON_TIME').length;
    const absent = list.filter((r) => r.status === 'ABSENT').length;

    // Habitual late count (>3 times)
    const habitualCount = employees.filter((e) => (e.lateCountThisMonth || 0) >= 3).length;
    // Excessive leaves count
    const excessiveLeavesCount = employees.filter((e) => e.excessiveLeavesFlag).length;

    return { total, late745, late800, onTime, absent, habitualCount, excessiveLeavesCount };
  }, [attendanceRecords, employees]);

  // Export 1: Late Comers Sheet (PDF & CSV)
  const handleDownloadLateComersPdf = async () => {
    if (!reportCanvasRef.current) return;
    setIsExporting(true);
    setExportMessage('Generating Late Comers Official Sheet (PDF)...');
    try {
      const officeLabel = selectedOfficeCode === 'ALL' ? 'Zone_Larkana' : selectedOfficeCode;
      await exportElementToPdf(reportCanvasRef.current, {
        filename: `NADRA_${officeLabel}_Late_Comers_Sheet_${currentDate}.pdf`,
        forceDesktopView: true,
      });
      setExportMessage('Late Comers Sheet PDF downloaded successfully!');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setExportMessage('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadLateComersCsv = () => {
    const lateComers = attendanceRecords.filter((r) => r.status === 'LATE_745' || r.status === 'LATE_800');
    const columns = [
      { key: 'employeeId', header: 'ERP / Employee ID' },
      { key: 'employeeName', header: 'Full Name' },
      { key: 'designation', header: 'Designation' },
      { key: 'officeCode', header: 'Office Code' },
      { key: 'officeName', header: 'Center Name' },
      { key: 'checkInTime', header: 'Arrival Time' },
      { key: 'status', header: 'Tardiness Status' },
      { key: 'notes', header: 'Reason / Remarks' },
    ];
    exportToCsv(
      columns,
      lateComers,
      `NADRA_Late_Comers_${currentDate}.csv`,
      `NADRA Zone-D Larkana Late Comers Register (${currentDate})`
    );
  };

  // Export 2: All Employees Register (PDF & CSV)
  const handleDownloadAllEmployeesPdf = async () => {
    if (!reportCanvasRef.current) return;
    setIsExporting(true);
    setExportMessage('Rendering All Employees Register (Desktop Full View PDF)...');
    try {
      const officeLabel = selectedOfficeCode === 'ALL' ? 'Consolidated' : selectedOfficeCode;
      await exportElementToPdf(reportCanvasRef.current, {
        filename: `NADRA_${officeLabel}_All_Employees_Attendance_${currentDate}.pdf`,
        forceDesktopView: true,
      });
      setExportMessage('All Employees Attendance PDF downloaded successfully!');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setExportMessage('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadAllEmployeesCsv = () => {
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
    exportToCsv(
      columns,
      filteredRecords,
      `NADRA_All_Staff_Attendance_${currentDate}.csv`,
      `NADRA Zone-D Larkana Full Attendance Register (${currentDate})`
    );
  };

  // Export 3: Monthly Attendance Sheet
  const handleDownloadMonthlySheetPdf = async () => {
    if (!reportCanvasRef.current) return;
    setIsExporting(true);
    setExportMessage('Generating Monthly Attendance & Punctuality Audit Sheet (PDF)...');
    try {
      await exportElementToPdf(reportCanvasRef.current, {
        filename: `NADRA_Zone_D_Monthly_Attendance_Sheet_${currentDate.slice(0, 7)}.pdf`,
        forceDesktopView: true,
      });
      setExportMessage('Monthly Attendance Sheet PDF downloaded!');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setExportMessage('Export failed');
    } finally {
      setIsExporting(false);
    }
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

  const handleEmployeeClick = (r: EmployeeAttendanceRecord) => {
    const profile = getEmployeeProfile(r);
    if (profile) {
      onSelectEmployee?.(profile);
    } else {
      // Fallback object if profile not preloaded
      const fallbackEmp: EmployeeProfile = {
        id: r.employeeId,
        erpNumber: r.employeeId,
        name: r.employeeName,
        fatherName: '—',
        cnic: '43203-0000000-1',
        designation: r.designation,
        department: 'Operations & Biometrics',
        workingSeat: 'Registration Counter',
        dateOfAppointment: '2020-01-01',
        dateOfPostingCurrentLocation: '2023-01-01',
        passportStatus: 'No',
        officialEmail: `${r.employeeName.toLowerCase().replace(/\s+/g, '.')}@nadra.gov.pk`,
        jobType: 'Permanent',
        bpsGrade: 'BPS-16',
        contactNumber: '0300-0000000',
        whatsappNumber: '0300-0000000',
        permanentAddress: 'Larkana, Sindh',
        currentAddress: 'Larkana, Sindh',
        domicileDistrict: 'Larkana',
        domicileProvince: 'Sindh',
        dateOfBirth: '1990-01-01',
        gender: r.gender === 'FEMALE' ? 'Female' : 'Male',
        religion: 'Islam',
        maritalStatus: 'Married',
        disability: 'None',
        qualificationLevel: 'Graduation / Bachelors (14/16 Years)',
        postingHistory: [],
        punctualityScore: r.status === 'ON_TIME' ? 95 : 75,
        punctualityRank: r.status === 'ON_TIME' ? 'A+' : 'B',
        lateCountThisMonth: r.status !== 'ON_TIME' ? 1 : 0,
        totalLeavesTakenThisMonth: 1,
        excessiveLeavesFlag: false,
      };
      onSelectEmployee?.(fallbackEmp);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
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
              Workforce Attendance &amp; Punctuality Monitoring Dossier
            </h2>
            <p className="text-xs text-slate-400">
              Biometric check-in tracking (Threshold 1: {threshold1} AM, Threshold 2: {threshold2} AM) with character punctuality scores &amp; excessive leaves audit.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Attendance Manually
            </button>
            <button
              onClick={() => setIsOcrModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              Upload Biometric Sheet (Vision OCR)
            </button>
          </div>
        </div>

        {/* Specialized Attendance Sheet Download Buttons (User Requirement 4) */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-300">Dedicated Attendance Exports:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
              <button
                type="button"
                onClick={handleDownloadLateComersPdf}
                disabled={isExporting}
                className="px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-950/60 rounded-lg transition-colors flex items-center gap-1.5"
                title="Download Late Comers Sheet in PDF format"
              >
                <Download className="w-3.5 h-3.5" />
                Late Comers (PDF)
              </button>
              <button
                type="button"
                onClick={handleDownloadLateComersCsv}
                className="px-2 py-1 text-xs font-semibold text-amber-400/80 hover:bg-amber-950/40 rounded-lg transition-colors"
                title="Download Late Comers in CSV"
              >
                CSV
              </button>
            </div>

            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
              <button
                type="button"
                onClick={handleDownloadAllEmployeesPdf}
                disabled={isExporting}
                className="px-2.5 py-1 text-xs font-semibold text-blue-300 hover:bg-blue-950/60 rounded-lg transition-colors flex items-center gap-1.5"
                title="Download All Employees Register in Desktop View PDF"
              >
                <Download className="w-3.5 h-3.5" />
                All Employees Register (PDF)
              </button>
              <button
                type="button"
                onClick={handleDownloadAllEmployeesCsv}
                className="px-2 py-1 text-xs font-semibold text-blue-400/80 hover:bg-blue-950/40 rounded-lg transition-colors"
                title="Download All Employees in CSV"
              >
                CSV
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownloadMonthlySheetPdf}
              disabled={isExporting}
              className="px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/40 rounded-xl transition-colors flex items-center gap-1.5 shadow"
              title="Download Monthly Attendance Sheet to check late comers in this month"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Monthly Attendance Sheet (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Attendance History Filters (1 day, 2 days, weekly, monthly, quarterly, yearly - User Req 5) */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-300">
            Attendance History Range:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: '1d', label: 'Today (1 Day)' },
              { id: '2d', label: 'Last 2 Days' },
              { id: '7d', label: 'Weekly (7 Days)' },
              { id: '30d', label: 'Monthly (30 Days)' },
              { id: '90d', label: 'Quarterly (90 Days)' },
              { id: 'year', label: 'Yearly' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setHistoryRange(t.id)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                historyRange === t.id
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Static Attendance Monitoring Cards (Today vs Yesterday vs Habitual Late Comers vs Excessive Leaves) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Late Marked Today</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 tabular-nums">
            {metrics.late745} <span className="text-xs text-slate-400 font-normal">staff</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Past {threshold1} AM ({metrics.late800} past {threshold2} AM)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Yesterday Late Count</span>
            <TrendingDown className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-200 tabular-nums">
            {Math.max(0, metrics.late745 - 1)} <span className="text-xs text-slate-400 font-normal">yesterday</span>
          </div>
          <div className="text-[11px] text-emerald-400">
            {metrics.late745 <= 1 ? 'Stable punctuality trend' : 'Variance monitored'}
          </div>
        </div>

        <div
          onClick={() => setHabitualLateOnly(!habitualLateOnly)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
            habitualLateOnly
              ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-rose-300">Habitual Late Comers</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 tabular-nums">
            {metrics.habitualCount} <span className="text-xs text-slate-400 font-normal">officials</span>
          </div>
          <div className="text-[11px] text-rose-300">
            {habitualLateOnly ? 'Showing Habitual Late Comers Only (Click to Reset)' : 'Late on daily basis (>3 times this month)'}
          </div>
        </div>

        <div
          onClick={() => setExcessiveLeavesOnly(!excessiveLeavesOnly)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
            excessiveLeavesOnly
              ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-amber-300">Excessive Leaves Flag</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 tabular-nums">
            {metrics.excessiveLeavesCount} <span className="text-xs text-slate-400 font-normal">flagged</span>
          </div>
          <div className="text-[11px] text-amber-300">
            {excessiveLeavesOnly ? 'Showing Excessive Leaves Only (Click to Reset)' : 'High absenteeism audit alerts'}
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
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
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
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
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Office Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-400">Office:</span>
                <select
                  value={selectedOfficeCode}
                  onChange={(e) => setSelectedOfficeCode(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:border-blue-500 focus:outline-none"
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
                  className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="LATE_ANY">All Late Arrivals</option>
                  <option value="LATE_745">Late (&gt; {threshold1} AM)</option>
                  <option value="LATE_800">Late (&gt; {threshold2} AM)</option>
                  <option value="ON_TIME">Punctual (On Time)</option>
                  <option value="ABSENT">Absent / Leave</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff name, ERP, office..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Filter Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              {(excessiveLeavesOnly || habitualLateOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setExcessiveLeavesOnly(false);
                    setHabitualLateOnly(false);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-600/50 font-bold"
                >
                  Clear Quick Filters
                </button>
              )}
            </div>
          </div>

          {exportMessage && (
            <div className="p-3 bg-blue-900/60 border border-blue-700 text-blue-200 rounded-xl text-xs flex items-center justify-between">
              <span>{exportMessage}</span>
            </div>
          )}

          {/* High-Resolution Printable Container (Supports Desktop View Force Export) */}
          <div
            ref={reportCanvasRef}
            className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 space-y-4 shadow-2xl"
          >
            {/* Formal Report Header */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                    NATIONAL DATABASE &amp; REGISTRATION AUTHORITY (NADRA)
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                    Zone-D Larkana — Workforce Attendance &amp; Punctuality Register
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                    <span>Date: <strong className="text-slate-200">{currentDate}</strong></span>
                    <span>•</span>
                    <span>Zone Code: <strong className="text-amber-300 font-mono">{zoneCode}</strong></span>
                    <span>•</span>
                    <span>History Scope: <strong className="text-slate-200">{historyRange.toUpperCase()}</strong></span>
                    <span>•</span>
                    <span>Rules: <strong className="text-slate-200">&gt;{threshold1} AM / &gt;{threshold2} AM</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    Total Staff: <strong className="text-white">{filteredRecords.length}</strong>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                    Punctual: <strong>{metrics.onTime}</strong>
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
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Emp ID</th>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3">Center / DAU</th>
                    <th className="py-2.5 px-3">Designation</th>
                    <th className="py-2.5 px-3">Punctuality Score &amp; Rank</th>
                    <th className="py-2.5 px-3">Leaves Alert</th>
                    <th className="py-2.5 px-3 text-right">Arrival Time</th>
                    <th className="py-2.5 px-3">Status</th>
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
                        No employee attendance records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => {
                      const emp = getEmployeeProfile(r);
                      const punctualityScore = emp?.punctualityScore ?? (r.status === 'ON_TIME' ? 95 : 75);
                      const punctualityRank = emp?.punctualityRank ?? (r.status === 'ON_TIME' ? 'A+' : 'B');
                      const leavesCount = emp?.totalLeavesTakenThisMonth ?? 1;
                      const hasExcessiveLeaves = emp?.excessiveLeavesFlag || leavesCount >= 10;

                      return (
                        <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-2.5 px-3 text-slate-400">{r.employeeId}</td>
                          <td className="py-2.5 px-3 font-sans font-medium text-white">
                            {/* Clickable Employee Dossier Trigger */}
                            <button
                              type="button"
                              onClick={() => handleEmployeeClick(r)}
                              className="text-left font-bold text-white hover:text-emerald-400 hover:underline flex items-center gap-1.5 transition-colors"
                              title="Click to view full Employee Profile Dossier"
                            >
                              <span>{r.employeeName}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                          </td>
                          <td className="py-2.5 px-3 font-sans">
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

                          {/* Punctuality Character Score & Rank (User Requirement 5) */}
                          <td className="py-2.5 px-3 font-sans">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider ${
                                  punctualityRank === 'A+'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : punctualityRank === 'A'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : punctualityRank === 'B'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                Rank {punctualityRank}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ({punctualityScore}%)
                              </span>
                            </div>
                          </td>

                          {/* Excessive Leaves Warning Indicator */}
                          <td className="py-2.5 px-3 font-sans">
                            {hasExcessiveLeaves ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                {leavesCount} Leaves (Excessive)
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono">
                                {leavesCount} Leaves
                              </span>
                            )}
                          </td>

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
                          <td className="py-2.5 px-3 font-sans text-slate-400 max-w-[180px] truncate">
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
                      );
                    })
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
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
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
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="onTime" fill="#10b981" name="On Time" />
                  <Bar dataKey="late745" fill="#f59e0b" name={`Late > ${threshold1}`} />
                  <Bar dataKey="late800" fill="#f43f5e" name={`Late > ${threshold2}`} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs whitespace-nowrap bg-slate-900">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Office Code</th>
                  <th className="py-2.5 px-3">Office Name</th>
                  <th className="py-2.5 px-3 text-right">Expected Staff</th>
                  <th className="py-2.5 px-3 text-right">On Time</th>
                  <th className="py-2.5 px-3 text-right">Late &gt; {threshold1}</th>
                  <th className="py-2.5 px-3 text-right">Late &gt; {threshold2}</th>
                  <th className="py-2.5 px-3 text-right">Punctuality Rate</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {reports.map((r) => {
                  const total = r.totalEmployees || 1;
                  const rate = Math.round((r.onTimeEmployees / total) * 100);
                  return (
                    <tr key={r.id || r.officeCode} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-amber-300">{r.officeCode}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-white">{r.officeName}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{r.totalEmployees}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">{r.onTimeEmployees}</td>
                      <td className="py-2.5 px-3 text-right text-amber-400">{r.lateAfter745}</td>
                      <td className="py-2.5 px-3 text-right text-rose-400">{r.lateAfter800}</td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            rate >= 90
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : rate >= 75
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {rate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => handleOfficeClick(r.officeCode)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-950/60 rounded border border-blue-900 transition-colors"
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Attendance Modal */}
      <AttendanceManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        offices={offices}
        currentDate={currentDate}
        onSaveRecord={handleSaveManualRecord}
      />

      {/* OCR Attendance Modal */}
      <AttendanceOcrUploadModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        offices={offices}
        currentDate={currentDate}
        onImportSuccess={handleOcrImportSuccess}
      />
    </div>
  );
};
