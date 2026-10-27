import React, { useState, useMemo, useRef } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Ticket,
  Smartphone,
  ShieldAlert,
  FileCheck2,
  Users,
  Clock,
  ScanFace,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  ChevronRight,
  Fingerprint,
  Share2,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DailyReport, ZoneSummary, NavView } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { exportElementToJpg, exportElementToPdf } from '../../utils/exportEngine';

export interface ExecutiveOverviewProps {
  currentDate?: string;
  reports?: any[];
  offices?: any[];
  zoneSummary?: any;
  summary?: any;
  prevSummary?: any;
  onSelectOffice: (officeCode: string) => void;
  onSelectOfficeProfile?: (officeCode: string) => void;
  onNavigate?: (view: any) => void;
  onNavigateSection?: (section: any) => void;
  onOpenExport?: () => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  currentDate = '2026-10-25',
  reports,
  offices,
  zoneSummary: propZoneSummary,
  summary,
  prevSummary,
  onSelectOffice,
  onSelectOfficeProfile,
  onNavigate: propOnNavigate,
  onNavigateSection,
  onOpenExport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [sortField, setSortField] = useState<string>('officeName');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const tableRef = useRef<HTMLDivElement>(null);
  const [isExportingJpg, setIsExportingJpg] = useState(false);
  const [jpgExportMessage, setJpgExportMessage] = useState<string | null>(null);

  const handleExportTableJpg = async () => {
    if (!tableRef.current) return;
    setIsExportingJpg(true);
    setJpgExportMessage('Generating high-resolution JPG of Consolidated Operations Table...');
    try {
      const filename = `NADRA_Zone_D_Larkana_Operations_Table_${currentDate}_${Date.now()}.jpg`;
      const res = await exportElementToJpg(tableRef.current, {
        filename,
        title: `Consolidated Zone-D Larkana Office Operations Table (${currentDate})`,
      });
      if (res.success) {
        setJpgExportMessage('Consolidated Table JPG downloaded successfully! Ready to share.');
        setTimeout(() => setJpgExportMessage(null), 3500);
      }
    } catch (err) {
      console.error(err);
      setJpgExportMessage('Export failed');
    } finally {
      setIsExportingJpg(false);
    }
  };

  const nav = (v: any) => {
    if (onNavigateSection) {
      const map: Record<string, string> = {
        upload_ocr: 'OCR_UPLOAD',
        data_quality: 'DATA_QUALITY',
        office_performance: 'OFFICE_WISE',
        qmatic: 'QMATIC',
        oneapp_booking: 'ONEAPP',
        approved_oneapp: 'APPROVED_ONEAPP',
        facial_certificates: 'FACIAL_RECOGNITION',
        pakid: 'PAK_ID',
        attendance: 'ATTENDANCE',
      };
      onNavigateSection(map[v] || v);
    } else if (propOnNavigate) {
      propOnNavigate(v);
    }
  };

  const activeReports = useMemo(() => {
    const list = offices || reports || [];
    return list.map((r: any) => ({
      ...r,
      oneAppIssued: r.oneAppIssued ?? r.oneappIssued ?? 0,
      oneAppProcessed: r.oneAppProcessed ?? r.oneappProcessed ?? 0,
      oneAppSkipped: r.oneAppSkipped ?? r.oneappSkipped ?? 0,
      oneAppRemaining: r.oneAppRemaining ?? r.oneappRemaining ?? 0,
      oneAppReconciliationPercentage:
        r.oneAppReconciliationPercentage ?? r.oneappReconciliationPercentage ?? null,
      proofOfLife: r.proofOfLife ?? r.proofOfLifeCertificates ?? 0,
    }));
  }, [offices, reports]);

  const activeSummary = useMemo(() => {
    if (summary) {
      return {
        activeOfficesCount: summary.totalActiveOffices ?? 20,
        reportedOfficesCount: summary.officesReported ?? activeReports.length,
        missingOfficesCount: summary.officesMissing ?? 0,
        coveragePercentage: summary.coveragePercentage ?? 100,
        totalEmployees: summary.totalEmployees ?? 0,
        lateAfter745: summary.totalLateAfter745 ?? 0,
        lateAfter800: summary.totalLateAfter800 ?? 0,
        onTimeEmployees: summary.totalOnTimeEmployees ?? 0,
        qmaticIssued: summary.totalQmaticIssued ?? 0,
        qmaticProcessed: summary.totalQmaticProcessed ?? 0,
        qmaticRemaining: summary.totalQmaticRemaining ?? 0,
        qmaticPercentage: summary.zoneQmaticPercentage ?? null,
        oneAppIssued: summary.totalOneappIssued ?? 0,
        oneAppProcessed: summary.totalOneappProcessed ?? 0,
        oneAppSkipped: summary.totalOneappSkipped ?? 0,
        oneAppRemaining: summary.totalOneappRemaining ?? 0,
        oneAppReconciliationPercentage: summary.zoneOneappReconciliationPercentage ?? null,
        approvedOneApp: summary.totalApprovedOneApp ?? 0,
        diminishedFingerprintsMBVS: summary.totalDiminishedMBVS ?? 0,
        proofOfLife: summary.totalProofOfLife ?? 0,
        pakidApproved: summary.totalPakidApproved ?? 0,
        pakidDeferred: summary.totalPakidDeferred ?? 0,
        pakidCorrection: summary.totalPakidCorrection ?? 0,
        discrepancyCount: summary.discrepancyCount ?? 0,
      };
    }
    return (
      propZoneSummary || {
        activeOfficesCount: 20,
        reportedOfficesCount: activeReports.length,
        missingOfficesCount: 0,
        coveragePercentage: 100,
        totalEmployees: 0,
        lateAfter745: 0,
        lateAfter800: 0,
        onTimeEmployees: 0,
        qmaticIssued: 0,
        qmaticProcessed: 0,
        qmaticRemaining: 0,
        qmaticPercentage: null,
        oneAppIssued: 0,
        oneAppProcessed: 0,
        oneAppSkipped: 0,
        oneAppRemaining: 0,
        oneAppReconciliationPercentage: null,
        approvedOneApp: 0,
        diminishedFingerprintsMBVS: 0,
        proofOfLife: 0,
        pakidApproved: 0,
        pakidDeferred: 0,
        pakidCorrection: 0,
        discrepancyCount: 0,
      }
    );
  }, [summary, propZoneSummary, activeReports]);

  // Filter & sort reports
  const filteredReports = useMemo(() => {
    return activeReports
      .filter((r) => {
        const matchSearch =
          (r.officeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.officeCode || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || r.reportingStatus === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (valA < valB) return sortAsc ? -1 : 1;
        return sortAsc ? 1 : -1;
      });
  }, [activeReports, searchQuery, statusFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Chart data: Top offices by volume
  const topVolumeOffices = useMemo(() => {
    return [...activeReports]
      .sort((a, b) => (b.qmaticIssued || 0) - (a.qmaticIssued || 0))
      .slice(0, 8)
      .map((r) => ({
        name: (r.officeName || '').replace('NRC ', '').replace(' (Executive Center)', ' Ex'),
        issued: r.qmaticIssued || 0,
        processed: r.qmaticProcessed || 0,
        oneAppReconciled: r.oneAppReconciliationPercentage || 0,
      }));
  }, [activeReports]);

  // Chart data: Attendance late arrivals
  const attendanceTopLate = useMemo(() => {
    return [...activeReports]
      .filter((r) => (r.lateAfter745 || 0) > 0)
      .sort((a, b) => (b.lateAfter745 || 0) - (a.lateAfter745 || 0))
      .slice(0, 7)
      .map((r) => ({
        name: (r.officeName || '').replace('NRC ', '').substring(0, 12),
        late745: r.lateAfter745 || 0,
        late800: r.lateAfter800 || 0,
        onTime: r.onTimeEmployees || 0,
      }));
  }, [activeReports]);

  const zoneSummary = activeSummary;
  const onNavigate = nav;

  // Donut chart: Pak-ID status breakdown
  const pakidPieData = [
    { name: 'Approved', value: zoneSummary.pakidApproved, color: '#10B981' },
    { name: 'Deferred / Sent', value: zoneSummary.pakidDeferred, color: '#F59E0B' },
    { name: 'Correction', value: zoneSummary.pakidCorrection, color: '#EF4444' },
  ];

  const handleExportCsv = () => {
    window.location.href = `/api/export?date=${currentDate}&format=csv`;
  };

  return (
    <div className="space-y-6">
      {/* Date & Context Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <span>Official Reporting Date</span>
            <span>·</span>
            <span className="text-white font-mono">{currentDate}</span>
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
            Zone-D Larkana Consolidated Operational Progress
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-office monitoring, biometric verification statistics, token queues, and OneApp reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-right">
            <div className="text-[11px] text-slate-400">Reporting Coverage</div>
            <div className="text-base font-bold text-emerald-400 tabular-nums">
              {zoneSummary.coveragePercentage}%
              <span className="text-xs font-normal text-slate-400 ml-1">
                ({zoneSummary.reportedOfficesCount}/{zoneSummary.activeOfficesCount} Offices)
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('upload_ocr')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            + Upload Report Image
          </button>
        </div>
      </div>

      {/* Discrepancy Alert Banner if discrepancies exist */}
      {zoneSummary.discrepancyCount > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-amber-300">
                {zoneSummary.discrepancyCount} Reconciliation Warning(s) Detected:
              </span>{' '}
              Unaccounted OneApp TIDs or token processing variances require supervisory review.
            </div>
          </div>
          <button
            onClick={() => onNavigate('data_quality')}
            className="text-xs font-semibold text-amber-300 hover:text-white underline underline-offset-2 ml-4 whitespace-nowrap"
          >
            Review Discrepancies →
          </button>
        </div>
      )}

      {/* SECTION 1: ORGANIZATION SUMMARY KPI CARDS */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          1. Operational Key Performance Indicators
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {/* Active Offices */}
          <KpiCard
            title="Active Offices"
            value={`${zoneSummary.reportedOfficesCount} / ${zoneSummary.activeOfficesCount}`}
            subtitle={`${zoneSummary.missingOfficesCount} Missing report`}
            icon={Building2}
            status={zoneSummary.missingOfficesCount > 0 ? 'warning' : 'nominal'}
            onClick={() => onNavigate('office_performance')}
          />

          {/* Q-Matic Issued */}
          <KpiCard
            title="Q-Matic Tokens Issued"
            value={zoneSummary.qmaticIssued.toLocaleString()}
            subtitle="Total tokens issued across zone"
            icon={Ticket}
            change={prevSummary ? zoneSummary.qmaticIssued - prevSummary.qmaticIssued : undefined}
            onClick={() => onNavigate('qmatic')}
          />

          {/* Q-Matic Processed */}
          <KpiCard
            title="Q-Matic Processed"
            value={zoneSummary.qmaticProcessed.toLocaleString()}
            subtitle={`Rate: ${zoneSummary.qmaticPercentage !== null ? `${zoneSummary.qmaticPercentage}%` : 'N/A'}`}
            icon={CheckCircle2}
            status={zoneSummary.qmaticPercentage && zoneSummary.qmaticPercentage < 90 ? 'warning' : 'nominal'}
            onClick={() => onNavigate('qmatic')}
          />

          {/* OneApp Issued */}
          <KpiCard
            title="OneApp TIDs Issued"
            value={zoneSummary.oneAppIssued.toLocaleString()}
            subtitle="Electronic application bookings"
            icon={Smartphone}
            change={prevSummary ? zoneSummary.oneAppIssued - prevSummary.oneAppIssued : undefined}
            onClick={() => onNavigate('oneapp_booking')}
          />

          {/* OneApp Reconciliation */}
          <KpiCard
            title="OneApp Reconciliation"
            value={
              zoneSummary.oneAppReconciliationPercentage !== null
                ? `${zoneSummary.oneAppReconciliationPercentage}%`
                : 'N/A'
            }
            subtitle={
              zoneSummary.oneAppRemaining > 0
                ? `${zoneSummary.oneAppRemaining} Unaccounted TIDs`
                : '100% Fully reconciled'
            }
            icon={Smartphone}
            status={zoneSummary.oneAppRemaining > 0 ? 'warning' : 'nominal'}
            discrepancyNote={
              zoneSummary.oneAppRemaining > 0
                ? `${zoneSummary.oneAppRemaining} Unaccounted TIDs`
                : undefined
            }
            onClick={() => onNavigate('oneapp_booking')}
          />

          {/* Approved OneApp */}
          <KpiCard
            title="Approved OneApp"
            value={zoneSummary.approvedOneApp.toLocaleString()}
            subtitle="Verified citizen registrations"
            icon={CheckCircle2}
            change={prevSummary ? zoneSummary.approvedOneApp - prevSummary.approvedOneApp : undefined}
            onClick={() => onNavigate('approved_oneapp')}
          />

          {/* Diminished Fingerprints MBVS */}
          <KpiCard
            title="Diminished MBVS Cases"
            value={zoneSummary.diminishedFingerprintsMBVS.toLocaleString()}
            subtitle="Manual biometric bypasses"
            icon={Fingerprint}
            change={
              prevSummary
                ? zoneSummary.diminishedFingerprintsMBVS - prevSummary.diminishedFingerprintsMBVS
                : undefined
            }
            onClick={() => onNavigate('facial_certificates')}
          />

          {/* Proof of Life Certificate */}
          <KpiCard
            title="Proof of Life Certificates"
            value={zoneSummary.proofOfLife.toLocaleString()}
            subtitle="Pensioners & elderly verifications"
            icon={ScanFace}
            change={prevSummary ? zoneSummary.proofOfLife - prevSummary.proofOfLife : undefined}
            onClick={() => onNavigate('facial_certificates')}
          />

          {/* Pak-ID Approved */}
          <KpiCard
            title="Pak-ID Approved"
            value={zoneSummary.pakidApproved.toLocaleString()}
            subtitle="Online portal approvals"
            icon={FileCheck2}
            change={prevSummary ? zoneSummary.pakidApproved - prevSummary.pakidApproved : undefined}
            onClick={() => onNavigate('pakid')}
          />

          {/* Pak-ID Deferred & Correction */}
          <KpiCard
            title="Pak-ID Deferred / Sent"
            value={`${zoneSummary.pakidDeferred} / ${zoneSummary.pakidCorrection}`}
            subtitle="Deferred / Corrections"
            icon={ShieldAlert}
            status={zoneSummary.pakidDeferred > 0 ? 'info' : 'nominal'}
            onClick={() => onNavigate('pakid')}
          />
        </div>
      </div>

      {/* SECTION 2: ATTENDANCE HIGHLIGHT CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            2. Employee Attendance & Late Arrivals
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            View Full Attendance Report →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            title="Total Employees Reported"
            value={zoneSummary.totalEmployees}
            subtitle="Staff on duty across 24 units"
            icon={Users}
          />
          <KpiCard
            title="Late Arrivals (> 07:45 AM)"
            value={zoneSummary.lateAfter745}
            subtitle="Arrivals past first threshold"
            icon={Clock}
            status={zoneSummary.lateAfter745 > 10 ? 'warning' : 'nominal'}
          />
          <KpiCard
            title="Late Arrivals (> 08:00 AM)"
            value={zoneSummary.lateAfter800}
            subtitle="Subset of late arrivals (>07:45 AM)"
            icon={AlertCircle}
            status={zoneSummary.lateAfter800 > 5 ? 'error' : 'nominal'}
          />
          <KpiCard
            title="Employees On Time"
            value={zoneSummary.onTimeEmployees}
            subtitle={`${Math.round(
              (zoneSummary.onTimeEmployees / (zoneSummary.totalEmployees || 1)) * 100
            )}% punctual attendance rate`}
            icon={CheckCircle2}
          />
        </div>
      </div>

      {/* SECTION 3: ZONE-WIDE PERFORMANCE CHARTS */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          3. Zone Performance & Comparative Analytics
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar Chart: Q-Matic Issued vs Processed by Top Offices */}
          <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Q-Matic Processing Volume (Top 8 Offices)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Tokens issued vs processed on OneApp for {currentDate}
                </p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topVolumeOffices} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="issued" name="Issued Tokens" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="processed" name="Processed Tokens" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart: Pak-ID Outcome Distribution */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Pak-ID Approval Status Distribution
              </h3>
              <p className="text-[11px] text-slate-400">
                Online registration approval outcomes
              </p>
            </div>
            <div className="h-48 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pakidPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pakidPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
              {pakidPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-semibold text-white tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: CONSOLIDATED ZONE SUMMARY TABLE */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Consolidated Zone-D Larkana Office Operations Table
            </h3>
            <p className="text-xs text-slate-400">
              Complete office-wise performance ledger with calculated totals row. Click any office to view its full profile.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search office or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Submitted">Submitted</option>
              <option value="Discrepancy">Discrepancy</option>
            </select>

            {/* CSV Export */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>

            {/* Save Table as High-Quality JPG */}
            <button
              onClick={handleExportTableJpg}
              disabled={isExportingJpg}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg shadow-sm transition-all"
              title="Download high-resolution JPG report ready to share"
            >
              <Share2 className="w-3.5 h-3.5" />
              Save Table as JPG
            </button>
          </div>
        </div>

        {jpgExportMessage && (
          <div className="mb-3 p-2 bg-blue-900/60 border border-blue-700 text-blue-200 rounded-lg text-xs flex items-center justify-between">
            <span>{jpgExportMessage}</span>
          </div>
        )}

        {/* Scrollable Table & Export Canvas */}
        <div ref={tableRef} className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950 p-2 sm:p-3">
          {/* Printable Formal Header (visible on export) */}
          <div className="pb-3 mb-2 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                NATIONAL DATABASE &amp; REGISTRATION AUTHORITY (NADRA)
              </div>
              <div className="text-sm font-bold text-white">
                Zone-D Larkana (Z050D) — Consolidated Operations Performance Ledger
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Date: {currentDate} | Reported Centers: {zoneSummary.reportedOfficesCount} / {zoneSummary.activeOfficesCount}
              </div>
            </div>
          </div>

          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('officeCode')}>
                  <div className="flex items-center gap-1">
                    Code
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('officeName')}>
                  <div className="flex items-center gap-1">
                    Office / DAU Name
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Staff</th>
                <th className="py-2.5 px-3 text-right text-amber-400">&gt;07:45</th>
                <th className="py-2.5 px-3 text-right text-rose-400">&gt;08:00</th>
                <th className="py-2.5 px-3 text-right">Q-Issued</th>
                <th className="py-2.5 px-3 text-right">Q-Proc</th>
                <th className="py-2.5 px-3 text-right">Q-Rate</th>
                <th className="py-2.5 px-3 text-right">OneApp Issued</th>
                <th className="py-2.5 px-3 text-right">Processed</th>
                <th className="py-2.5 px-3 text-right">Skipped</th>
                <th className="py-2.5 px-3 text-right">Reconciled %</th>
                <th className="py-2.5 px-3 text-right">Apprv OneApp</th>
                <th className="py-2.5 px-3 text-right">MBVS</th>
                <th className="py-2.5 px-3 text-right">Proof Life</th>
                <th className="py-2.5 px-3 text-right">Pak-ID Apprv</th>
                <th className="py-2.5 px-3 text-right">Deferred</th>
                <th className="py-2.5 px-3 text-right">Corr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedReports.map((r) => (
                <tr
                  key={r.id}
                  onClick={() =>
                    onSelectOfficeProfile ? onSelectOfficeProfile(r.officeCode) : onSelectOffice(r.officeCode)
                  }
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  title="Click to view full Office Profile"
                >
                  <td className="py-2 px-3 font-semibold text-blue-400">{r.officeCode}</td>
                  <td className="py-2 px-3 font-sans font-medium text-white max-w-[200px] truncate hover:text-blue-300">
                    {r.officeName}
                  </td>
                  <td className="py-2 px-3 font-sans">
                    <StatusBadge status={r.reportingStatus} />
                  </td>
                  <td className="py-2 px-3 text-right text-slate-200 tabular-nums">{r.totalEmployees}</td>
                  <td className="py-2 px-3 text-right text-amber-400 tabular-nums">{r.lateAfter745}</td>
                  <td className="py-2 px-3 text-right text-rose-400 tabular-nums">{r.lateAfter800}</td>
                  <td className="py-2 px-3 text-right text-slate-200 tabular-nums">{r.qmaticIssued}</td>
                  <td className="py-2 px-3 text-right text-slate-200 tabular-nums">{r.qmaticProcessed}</td>
                  <td className="py-2 px-3 text-right tabular-nums">
                    {r.qmaticPercentage !== null ? (
                      <span className={r.qmaticPercentage < 90 ? 'text-amber-400' : 'text-emerald-400'}>
                        {r.qmaticPercentage}%
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-200 tabular-nums">{r.oneAppIssued}</td>
                  <td className="py-2 px-3 text-right text-slate-200 tabular-nums">{r.oneAppProcessed}</td>
                  <td className="py-2 px-3 text-right text-slate-400 tabular-nums">{r.oneAppSkipped}</td>
                  <td className="py-2 px-3 text-right tabular-nums">
                    {r.oneAppReconciliationPercentage !== null ? (
                      <span
                        className={
                          r.oneAppReconciliationPercentage < 100
                            ? 'text-amber-400 font-semibold'
                            : 'text-emerald-400'
                        }
                      >
                        {r.oneAppReconciliationPercentage}%
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-200 tabular-nums">{r.approvedOneApp}</td>
                  <td className="py-2 px-3 text-right text-slate-300 tabular-nums">{r.diminishedFingerprintsMBVS}</td>
                  <td className="py-2 px-3 text-right text-slate-300 tabular-nums">{r.proofOfLife}</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-semibold tabular-nums">{r.pakidApproved}</td>
                  <td className="py-2 px-3 text-right text-amber-400 tabular-nums">{r.pakidDeferred}</td>
                  <td className="py-2 px-3 text-right text-rose-400 tabular-nums">{r.pakidCorrection}</td>
                </tr>
              ))}

              {/* FINAL CONSOLIDATED TOTAL ROW */}
              <tr className="bg-blue-950/40 border-t-2 border-blue-600/60 font-bold text-white text-xs">
                <td className="py-3 px-3 uppercase text-blue-300">TOTAL</td>
                <td className="py-3 px-3 font-sans uppercase text-blue-200" colSpan={2}>
                  CONSOLIDATED ZONE TOTAL ({zoneSummary.reportedOfficesCount} OFFICES)
                </td>
                <td className="py-3 px-3 text-right tabular-nums">{zoneSummary.totalEmployees}</td>
                <td className="py-3 px-3 text-right text-amber-300 tabular-nums">{zoneSummary.lateAfter745}</td>
                <td className="py-3 px-3 text-right text-rose-300 tabular-nums">{zoneSummary.lateAfter800}</td>
                <td className="py-3 px-3 text-right tabular-nums">{zoneSummary.qmaticIssued}</td>
                <td className="py-3 px-3 text-right tabular-nums">{zoneSummary.qmaticProcessed}</td>
                <td className="py-3 px-3 text-right text-emerald-300 tabular-nums">
                  {zoneSummary.qmaticPercentage !== null ? `${zoneSummary.qmaticPercentage}%` : 'N/A'}
                </td>
                <td className="py-3 px-3 text-right tabular-nums">{zoneSummary.oneAppIssued}</td>
                <td className="py-3 px-3 text-right tabular-nums">{zoneSummary.oneAppProcessed}</td>
                <td className="py-3 px-3 text-right text-slate-300 tabular-nums">{zoneSummary.oneAppSkipped}</td>
                <td className="py-3 px-3 text-right text-emerald-300 tabular-nums">
                  {zoneSummary.oneAppReconciliationPercentage !== null
                    ? `${zoneSummary.oneAppReconciliationPercentage}%`
                    : 'N/A'}
                </td>
                <td className="py-3 px-3 text-right tabular-nums">{zoneSummary.approvedOneApp}</td>
                <td className="py-3 px-3 text-right tabular-nums">{zoneSummary.diminishedFingerprintsMBVS}</td>
                <td className="py-3 px-3 text-right tabular-nums">{zoneSummary.proofOfLife}</td>
                <td className="py-3 px-3 text-right text-emerald-300 tabular-nums">{zoneSummary.pakidApproved}</td>
                <td className="py-3 px-3 text-right text-amber-300 tabular-nums">{zoneSummary.pakidDeferred}</td>
                <td className="py-3 px-3 text-right text-rose-300 tabular-nums">{zoneSummary.pakidCorrection}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination & Office count */}
        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredReports.length)} of {filteredReports.length} reporting offices
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
            >
              Previous
            </button>
            <span className="px-2 font-mono text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
