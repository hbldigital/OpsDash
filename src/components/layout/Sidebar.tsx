/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Building,
  Users,
  Ticket,
  Smartphone,
  CheckCircle,
  ScanFace,
  FileCheck2,
  ScanLine,
  FileSpreadsheet,
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  MapPin,
  History,
  Sliders,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { NavView } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  discrepancyCount: number;
  missingOfficesCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItemConfig {
  id: NavView;
  textKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
  badgeColor?: string;
  group?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  discrepancyCount,
  missingOfficesCount,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { getText, zoneName, zoneCode } = useLocalization();

  const navItems: NavItemConfig[] = [
    { id: 'overview', textKey: 'navExecutiveOverview', defaultLabel: 'Executive Overview', icon: LayoutDashboard, group: 'OPERATIONS' },
    { id: 'office_performance', textKey: 'navOfficeWise', defaultLabel: 'Office Operations', icon: Building, group: 'OPERATIONS' },
    { id: 'attendance', textKey: 'navAttendance', defaultLabel: 'Attendance Sheet', icon: Users, group: 'OPERATIONS' },
    { id: 'qmatic', textKey: 'navQMatic', defaultLabel: 'Q-Matic Ledger', icon: Ticket, group: 'SERVICES' },
    { id: 'oneapp_booking', textKey: 'navOneAppBooking', defaultLabel: 'OneApp Booking', icon: Smartphone, group: 'SERVICES' },
    { id: 'approved_oneapp', textKey: 'navApprovedOneApp', defaultLabel: 'Approved OneApp', icon: CheckCircle, group: 'SERVICES' },
    { id: 'facial_certificates', textKey: 'navFacialRecognition', defaultLabel: 'Facial Certificates', icon: ScanFace, group: 'SERVICES' },
    { id: 'pakid', textKey: 'navPakId', defaultLabel: 'Pak-ID Approval', icon: FileCheck2, group: 'SERVICES' },
    { id: 'upload_ocr', textKey: 'navUploadOcr', defaultLabel: 'OCR Document Intake', icon: ScanLine, group: 'DATA PIPELINE' },
    { id: 'daily_reports', textKey: 'navDailyReports', defaultLabel: 'Daily Reports', icon: FileSpreadsheet, group: 'DATA PIPELINE' },
    { id: 'historical_analytics', textKey: 'navHistoricalAnalytics', defaultLabel: 'Historical Analytics', icon: TrendingUp, group: 'DATA PIPELINE' },
    {
      id: 'data_quality',
      textKey: 'navDataQuality',
      defaultLabel: 'Data Quality & Audit',
      icon: AlertOctagon,
      badgeCount: discrepancyCount + missingOfficesCount,
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      group: 'GOVERNANCE',
    },
    { id: 'office_management', textKey: 'navOfficeManagement', defaultLabel: 'Office Management', icon: MapPin, group: 'GOVERNANCE' },
    { id: 'user_management', textKey: 'navUserManagement', defaultLabel: 'User Management', icon: ShieldCheck, group: 'GOVERNANCE' },
    { id: 'audit_logs', textKey: 'navAuditLogs', defaultLabel: 'Audit Logs', icon: History, group: 'GOVERNANCE' },
    { id: 'settings', textKey: 'navSettings', defaultLabel: 'System Settings', icon: Sliders, group: 'GOVERNANCE' },
  ];

  const handleItemClick = (id: NavView) => {
    onSelectView(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'lg:w-16' : 'lg:w-64'
        } ${
          isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header inside sidebar */}
        <div className="flex items-center justify-between px-3.5 py-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <div className="truncate">
              <span className="text-xs font-bold text-white tracking-wider uppercase block truncate">
                {zoneName}
              </span>
              <span className="text-[10px] text-amber-300 font-mono block">
                {zoneCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const label = getText(item.textKey, item.defaultLabel);
            const showGroup =
              !isCollapsed &&
              (idx === 0 || navItems[idx - 1].group !== item.group);

            return (
              <React.Fragment key={item.id}>
                {showGroup && item.group && (
                  <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {item.group}
                  </div>
                )}

                <button
                  onClick={() => handleItemClick(item.id)}
                  title={isCollapsed ? label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate flex-1">{label}</span>
                  )}
                  {(!isCollapsed || isMobileOpen) && item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${
                        item.badgeColor || 'text-rose-400 bg-rose-950/60 border-rose-800/60'
                      }`}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Bottom Status / Footer info */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 space-y-0.5 shrink-0">
            <div className="font-semibold text-slate-400">Zone-D Regional Operations</div>
            <div>Strict Governance Standards</div>
          </div>
        )}
      </aside>
    </>
  );
};
