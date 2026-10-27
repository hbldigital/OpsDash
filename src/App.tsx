/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveOverview } from './components/views/ExecutiveOverview';
import { OfficeDashboard } from './components/views/OfficeDashboard';
import { EmployeeAttendanceView } from './components/views/EmployeeAttendanceView';
import { QMaticView } from './components/views/QMaticView';
import { OneAppBookingView } from './components/views/OneAppBookingView';
import { ApprovedOneAppView } from './components/views/ApprovedOneAppView';
import { FacialCertificatesView } from './components/views/FacialCertificatesView';
import { PakIdView } from './components/views/PakIdView';
import { UploadOcrView } from './components/views/UploadOcrView';
import { DailyReportsView } from './components/views/DailyReportsView';
import { HistoricalAnalyticsView } from './components/views/HistoricalAnalyticsView';
import { DataQualityView } from './components/views/DataQualityView';
import {
  UserManagementView,
  OfficeManagementView,
  AuditLogsView,
  SettingsView,
} from './components/views/GovernanceViews';
import { ReportCorrectionModal } from './components/modals/ReportCorrectionModal';
import { ExportModal } from './components/modals/ExportModal';
import { OfficeProfileModal } from './components/modals/OfficeProfileModal';
import { OfficeEditModal } from './components/modals/OfficeEditModal';
import { LocalizationProvider, useLocalization } from './context/LocalizationContext';

import {
  Office,
  DailyReport,
  ZoneSummary,
  User,
  NavView,
} from './types';

function AppContent() {
  const { getText } = useLocalization();

  const [currentDate, setCurrentDate] = useState('2026-10-25');
  const [dateRangeMode, setDateRangeMode] = useState<'single' | 'range'>('single');
  const [currentView, setCurrentView] = useState<NavView>('overview');
  const [selectedOfficeCode, setSelectedOfficeCode] = useState<string>('LKR-01');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

  // Office Profile & Office Edit Modals
  const [selectedOfficeProfileCode, setSelectedOfficeProfileCode] = useState<string | null>(null);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);

  // Data states
  const [zoneSummary, setZoneSummary] = useState<ZoneSummary | null>(null);
  const [prevSummary, setPrevSummary] = useState<ZoneSummary | null>(null);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [allHistoricalReports, setAllHistoricalReports] = useState<DailyReport[]>([]);
  const [discrepancyCount, setDiscrepancyCount] = useState(0);

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load Executive Dashboard Data
  const loadDashboardData = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/dashboard/executive?date=${date}`);
      const data = await res.json();
      if (data.success) {
        setZoneSummary(data.zoneSummary || data.summary);
        setDailyReports(data.reports || data.offices || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, []);

  // Load Previous Day Data for day-over-day variance
  const loadPrevDayData = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/executive?date=2026-10-24`);
      const data = await res.json();
      if (data.success) {
        setPrevSummary(data.zoneSummary || data.summary);
      }
    } catch (err) {
      console.error('Failed to load previous day data:', err);
    }
  }, []);

  // Load Offices
  const loadOffices = useCallback(async () => {
    try {
      const res = await fetch('/api/offices');
      const data = await res.json();
      if (data.success) {
        setOffices(data.offices);
      }
    } catch (err) {
      console.error('Failed to load offices:', err);
    }
  }, []);

  // Load Users
  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success && data.users.length > 0) {
        const mappedUsers: User[] = data.users.map((u: any) => ({
          id: u.id,
          username: u.email.split('@')[0],
          name: u.name,
          email: u.email,
          role: u.role,
          officeCode: u.assignedOfficeCode,
          zoneCode: u.zone || 'Zone-D Larkana',
          isActive: true,
        }));
        setUsers(mappedUsers);
        setCurrentUser(mappedUsers[0]);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }, []);

  // Load History
  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/reports/history');
      const data = await res.json();
      if (data.success) {
        const mapped: DailyReport[] = (data.reports || []).map((r: any) => ({
          ...r,
          reportingDate: r.date || r.reportingDate,
          zoneCode: r.zone || r.zoneCode,
          oneAppIssued: r.oneAppIssued ?? r.oneappIssued ?? 0,
          oneAppProcessed: r.oneAppProcessed ?? r.oneappProcessed ?? 0,
          oneAppSkipped: r.oneAppSkipped ?? r.oneappSkipped ?? 0,
          oneAppRemaining: r.oneAppRemaining ?? r.oneappRemaining ?? 0,
          oneAppReconciliationPercentage: r.oneAppReconciliationPercentage ?? r.oneappReconciliationPercentage ?? null,
          proofOfLife: r.proofOfLife ?? r.proofOfLifeCertificates ?? 0,
          previousDayApproved: r.previousDayApproved ?? r.prevDayApprovedOneApp ?? 0,
        }));
        setAllHistoricalReports(mapped);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  // Load Data Quality Issue Counts
  const loadDataQualityCount = useCallback(async () => {
    try {
      const res = await fetch('/api/data-quality?unresolved=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.issues)) {
        setDiscrepancyCount(data.issues.length);
      }
    } catch (err) {
      console.error('Failed to load discrepancies count:', err);
    }
  }, []);

  // Refresh all core data
  const loadAll = useCallback(async (date: string) => {
    setIsLoading(true);
    await Promise.all([
      loadDashboardData(date),
      loadPrevDayData(),
      loadOffices(),
      loadUsers(),
      loadHistory(),
      loadDataQualityCount(),
    ]);
    setIsLoading(false);
  }, [loadDashboardData, loadPrevDayData, loadOffices, loadUsers, loadHistory, loadDataQualityCount]);

  useEffect(() => {
    loadAll(currentDate);
  }, [loadAll, currentDate]);

  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
    loadDashboardData(newDate);
  };

  const handleSwitchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleSelectOffice = (officeCode: string) => {
    setSelectedOfficeCode(officeCode);
    setCurrentView('office_performance');
  };

  // Universal Office Profile Click Handler
  const handleSelectOfficeProfile = (officeCode: string) => {
    setSelectedOfficeProfileCode(officeCode);
  };

  // Save Office Edits
  const handleSaveOffice = async (updatedOffice: Office) => {
    try {
      const res = await fetch(`/api/offices/${updatedOffice.code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'u-1',
        },
        body: JSON.stringify(updatedOffice),
      });
      const data = await res.json();
      if (data.success && data.office) {
        setOffices((prev) =>
          prev.map((o) => (o.code === updatedOffice.code ? { ...o, ...data.office } : o))
        );
        setEditingOffice(null);
      }
    } catch (err) {
      console.error('Failed to save office updates:', err);
    }
  };

  const handleOpenCorrection = (report: DailyReport) => {
    setEditingReport(report);
    setIsCorrectionModalOpen(true);
  };

  const handleSaveCorrection = async (reportId: string, updates: Partial<DailyReport>, reason: string) => {
    try {
      const target = dailyReports.find((r) => r.id === reportId) || editingReport;
      if (!target) return;

      const payload = {
        ...target,
        ...updates,
        date: target.reportingDate || currentDate,
        officeCode: target.officeCode,
        officeName: target.officeName,
        correctionReason: reason,
      };

      const res = await fetch('/api/reports/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'u-1',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsCorrectionModalOpen(false);
        setEditingReport(null);
        await Promise.all([
          loadDashboardData(currentDate),
          loadHistory(),
          loadDataQualityCount(),
        ]);
      }
    } catch (err) {
      console.error('Failed to save correction:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Selected office for profile popup
  const selectedOfficeForProfile = useMemo(() => {
    if (!selectedOfficeProfileCode) return null;
    return offices.find((o) => o.code.toUpperCase() === selectedOfficeProfileCode.toUpperCase()) || null;
  }, [offices, selectedOfficeProfileCode]);

  const selectedReportForProfile = useMemo(() => {
    if (!selectedOfficeProfileCode) return null;
    return dailyReports.find((r) => r.officeCode.toUpperCase() === selectedOfficeProfileCode.toUpperCase()) || null;
  }, [dailyReports, selectedOfficeProfileCode]);

  return (
    <div className="min-h-screen bg-[#070e18] text-slate-100 flex flex-col font-sans">
      {/* Main Header */}
      <Header
        currentDate={currentDate}
        onDateChange={handleDateChange}
        dateRangeMode={dateRangeMode}
        onDateRangeModeChange={setDateRangeMode}
        currentUser={currentUser}
        availableUsers={users}
        onSwitchUser={handleSwitchUser}
        lastUpdated="Just now"
        onPrint={handlePrint}
        onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onOpenSettings={() => setCurrentView('settings')}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          discrepancyCount={discrepancyCount}
          missingOfficesCount={zoneSummary ? zoneSummary.missingOfficesCount : 0}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 md:px-6 lg:px-8">
          <div className="max-w-[1720px] mx-auto">
            {isLoading || !zoneSummary ? (
              <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="text-sm font-semibold text-slate-300">
                    Loading Zone-D Larkana Operational Intelligence...
                  </div>
                </div>
              </div>
            ) : (
              <>
                {currentView === 'overview' && (
                  <ExecutiveOverview
                    currentDate={currentDate}
                    reports={dailyReports}
                    zoneSummary={zoneSummary}
                    prevSummary={prevSummary}
                    onSelectOffice={handleSelectOffice}
                    onSelectOfficeProfile={handleSelectOfficeProfile}
                    onNavigate={setCurrentView}
                  />
                )}

                {currentView === 'office_performance' && (
                  <OfficeDashboard
                    offices={offices}
                    currentOfficeCode={selectedOfficeCode}
                    onOfficeChange={setSelectedOfficeCode}
                    reports={allHistoricalReports}
                    currentDate={currentDate}
                    onBackToOverview={() => setCurrentView('overview')}
                    currentUser={currentUser}
                    onOpenCorrectionModal={handleOpenCorrection}
                    onSelectOfficeProfile={handleSelectOfficeProfile}
                  />
                )}

                {currentView === 'attendance' && (
                  <EmployeeAttendanceView
                    currentDate={currentDate}
                    reports={dailyReports}
                    zoneSummary={zoneSummary}
                    offices={offices}
                    onSelectOffice={handleSelectOffice}
                    onSelectOfficeProfile={handleSelectOfficeProfile}
                  />
                )}

                {currentView === 'qmatic' && (
                  <QMaticView
                    currentDate={currentDate}
                    reports={dailyReports}
                    zoneSummary={zoneSummary}
                    onSelectOffice={handleSelectOffice}
                  />
                )}

                {currentView === 'oneapp_booking' && (
                  <OneAppBookingView
                    currentDate={currentDate}
                    reports={dailyReports}
                    zoneSummary={zoneSummary}
                    onSelectOffice={handleSelectOffice}
                  />
                )}

                {currentView === 'approved_oneapp' && (
                  <ApprovedOneAppView
                    currentDate={currentDate}
                    reports={dailyReports}
                    zoneSummary={zoneSummary}
                    prevSummary={prevSummary}
                    onSelectOffice={handleSelectOffice}
                  />
                )}

                {currentView === 'facial_certificates' && (
                  <FacialCertificatesView
                    currentDate={currentDate}
                    reports={dailyReports}
                    zoneSummary={zoneSummary}
                    prevSummary={prevSummary}
                    onSelectOffice={handleSelectOffice}
                  />
                )}

                {currentView === 'pakid' && (
                  <PakIdView
                    currentDate={currentDate}
                    reports={dailyReports}
                    zoneSummary={zoneSummary}
                    prevSummary={prevSummary}
                    onSelectOffice={handleSelectOffice}
                  />
                )}

                {currentView === 'upload_ocr' && (
                  <UploadOcrView
                    onImportSuccess={(importedDate) => {
                      setCurrentDate(importedDate);
                      loadAll(importedDate);
                      setCurrentView('overview');
                    }}
                    currentUser={currentUser}
                  />
                )}

                {currentView === 'daily_reports' && (
                  <DailyReportsView
                    reports={dailyReports}
                    offices={offices}
                    currentDate={currentDate}
                    onSelectOffice={handleSelectOffice}
                    onSelectOfficeProfile={handleSelectOfficeProfile}
                    onSelectReport={(rep) => {
                      setSelectedOfficeCode(rep.officeCode);
                      setCurrentView('office_performance');
                    }}
                  />
                )}

                {currentView === 'historical_analytics' && (
                  <HistoricalAnalyticsView
                    reports={allHistoricalReports}
                    totalOfficesCount={offices.length}
                  />
                )}

                {currentView === 'data_quality' && (
                  <DataQualityView
                    currentDate={currentDate}
                    currentUser={currentUser}
                    onRefresh={() => loadAll(currentDate)}
                  />
                )}

                {currentView === 'user_management' && (
                  <UserManagementView
                    users={users}
                    currentUser={currentUser}
                    onSwitchUser={handleSwitchUser}
                  />
                )}

                {currentView === 'office_management' && (
                  <OfficeManagementView
                    offices={offices}
                    onSelectOffice={handleSelectOffice}
                    onSelectOfficeProfile={handleSelectOfficeProfile}
                    onEditOffice={(o) => setEditingOffice(o)}
                  />
                )}

                {currentView === 'audit_logs' && (
                  <AuditLogsView />
                )}

                {currentView === 'settings' && (
                  <SettingsView />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Universal Office Profile Modal */}
      {selectedOfficeForProfile && (
        <OfficeProfileModal
          office={selectedOfficeForProfile}
          report={selectedReportForProfile}
          onClose={() => setSelectedOfficeProfileCode(null)}
          onEditOffice={(o) => {
            setSelectedOfficeProfileCode(null);
            setEditingOffice(o);
          }}
          onViewLedger={(code) => {
            setSelectedOfficeCode(code);
            setSelectedOfficeProfileCode(null);
            setCurrentView('office_performance');
          }}
        />
      )}

      {/* Office Edit Modal */}
      {editingOffice && (
        <OfficeEditModal
          office={editingOffice}
          isOpen={!!editingOffice}
          onClose={() => setEditingOffice(null)}
          onSave={handleSaveOffice}
        />
      )}

      {/* Report Correction Modal */}
      {editingReport && isCorrectionModalOpen && (
        <ReportCorrectionModal
          report={editingReport}
          onClose={() => {
            setIsCorrectionModalOpen(false);
            setEditingReport(null);
          }}
          onSaveCorrection={handleSaveCorrection}
        />
      )}

      {/* Export Modal */}
      {zoneSummary && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          summary={zoneSummary as any}
          offices={dailyReports as any}
          currentDate={currentDate}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LocalizationProvider>
      <AppContent />
    </LocalizationProvider>
  );
}
