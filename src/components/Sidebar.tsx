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
  CheckCircle2,
  ScanFace,
  CreditCard,
  UploadCloud,
  FileText,
  TrendingUp,
  AlertOctagon,
  Settings,
  History,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export type NavigationPage =
  | 'EXECUTIVE'
  | 'OFFICE_WISE'
  | 'ATTENDANCE'
  | 'QMATIC'
  | 'ONEAPP'
  | 'APPROVED_ONEAPP'
  | 'FACIAL_RECOGNITION'
  | 'PAK_ID'
  | 'OCR_UPLOAD'
  | 'DAILY_REPORTS'
  | 'HISTORICAL_ANALYTICS'
  | 'DATA_QUALITY'
  | 'OFFICE_MANAGEMENT'
  | 'USER_MANAGEMENT'
  | 'AUDIT_LOGS'
  | 'SETTINGS';

interface SidebarProps {
  currentPage: NavigationPage;
  onPageSelect: (page: NavigationPage) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  discrepancyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageSelect,
  isCollapsed,
  onToggleCollapse,
  discrepancyCount,
}) => {
  const navSections = [
    {
      title: 'Operational Monitoring',
      items: [
        { id: 'EXECUTIVE', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'OFFICE_WISE', label: 'Office-wise Performance', icon: Building },
        { id: 'ATTENDANCE', label: 'Employee Attendance', icon: Users },
        { id: 'QMATIC', label: 'Q-Matic Token Progress', icon: Ticket },
        { id: 'ONEAPP', label: 'Progress / Booking — OneApp', icon: Smartphone },
      ],
    },
    {
      title: 'Verification & Processing',
      items: [
        { id: 'APPROVED_ONEAPP', label: 'Approved OneApp', icon: CheckCircle2 },
        { id: 'FACIAL_RECOGNITION', label: 'Facial Recognition Certificates', icon: ScanFace },
        { id: 'PAK_ID', label: 'Pak-ID Approval', icon: CreditCard },
      ],
    },
    {
      title: 'Data Ingestion & Reports',
      items: [
        { id: 'OCR_UPLOAD', label: 'Image Upload & OCR Review', icon: UploadCloud, highlight: true },
        { id: 'DAILY_REPORTS', label: 'Daily Reports Archive', icon: FileText },
        { id: 'HISTORICAL_ANALYTICS', label: 'Historical Analytics', icon: TrendingUp },
        {
          id: 'DATA_QUALITY',
          label: 'Data Quality & Reconciliation',
          icon: AlertOctagon,
          badge: discrepancyCount > 0 ? discrepancyCount : undefined,
        },
      ],
    },
    {
      title: 'Administration & Governance',
      items: [
        { id: 'OFFICE_MANAGEMENT', label: 'Office Configuration', icon: ShieldCheck },
        { id: 'USER_MANAGEMENT', label: 'User Management', icon: Users },
        { id: 'AUDIT_LOGS', label: 'Audit Logs', icon: History },
        { id: 'SETTINGS', label: 'System Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`bg-[#081220] border-r border-slate-800 flex flex-col shrink-0 transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header Collapse Control */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation Menu
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors mx-auto"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {!isCollapsed && (
              <div className="px-2.5 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageSelect(item.id as NavigationPage)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-emerald-600/90 text-white font-semibold shadow-sm'
                        : item.highlight
                        ? 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-emerald-400'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge !== undefined && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info Box */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Zone-D Live Sync</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            20 DAUs / NRCs Registered
          </div>
        </div>
      )}
    </aside>
  );
};
