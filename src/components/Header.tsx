/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Shield,
  User,
  Upload,
  PlusCircle,
  Maximize2,
  Minimize2,
  ChevronDown,
  Building2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/dashboard';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  availableDates: string[];
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onUserChange: (user: UserProfile) => void;
  onOpenUpload: () => void;
  onOpenManualEntry: () => void;
  onOpenExport: () => void;
  discrepancyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  availableDates,
  currentUser,
  allUsers,
  onUserChange,
  onOpenUpload,
  onOpenManualEntry,
  onOpenExport,
  discrepancyCount,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const roleBadgeColors: Record<UserRole, string> = {
    SUPER_ADMIN: 'bg-purple-900/80 text-purple-200 border-purple-700',
    ZONE_ADMIN: 'bg-blue-900/80 text-blue-200 border-blue-700',
    REPORTING_ADMIN: 'bg-emerald-900/80 text-emerald-200 border-emerald-700',
    DATA_ENTRY_OPERATOR: 'bg-amber-900/80 text-amber-200 border-amber-700',
    VERIFICATION_OFFICER: 'bg-cyan-900/80 text-cyan-200 border-cyan-700',
    AUDITOR: 'bg-rose-900/80 text-rose-200 border-rose-700',
    VIEWER: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0b1728] text-white border-b border-slate-800 shadow-md">
      <div className="max-w-[1720px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Organization Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-800/90 border border-emerald-500/40 flex items-center justify-center shadow-inner text-emerald-100 font-bold text-lg">
            <Shield className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-slate-100 tracking-tight">
                NADRA PAKISTAN
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded">
                ZONE-D LARKANA
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              Daily Operational Progress & Statistics Portal
            </p>
          </div>
        </div>

        {/* Global Reporting Date Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-sm">
          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Reporting Date:</span>
          
          <div className="relative">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-slate-100 text-xs font-semibold focus:outline-none cursor-pointer"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
              title="Recent dates"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showDateDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Quick Select
                </div>
                <button
                  onClick={() => { onDateChange('2026-10-25'); setShowDateDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>Today (25 Oct 2026)</span>
                </button>
                <button
                  onClick={() => { onDateChange('2026-10-24'); setShowDateDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>Yesterday (24 Oct)</span>
                </button>
                <button
                  onClick={() => { onDateChange('2026-10-23'); setShowDateDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>23 Oct 2026</span>
                </button>
              </div>
            )}
          </div>

          <span className="text-[11px] text-slate-400 pl-1 border-l border-slate-800 hidden md:inline flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Asia/Karachi</span>
          </span>
        </div>

        {/* Action Controls & User Profile */}
        <div className="flex items-center gap-2">
          {/* Discrepancy indicator badge */}
          {discrepancyCount > 0 && (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/70 border border-amber-600/60 text-amber-300 text-xs font-medium cursor-pointer"
              title={`${discrepancyCount} reconciliation flags detected`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{discrepancyCount} Warnings</span>
            </div>
          )}

          {/* Upload OCR CTA */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="Upload photographed daily progress spreadsheet for automated OCR extraction"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Report (OCR)</span>
            <span className="sm:hidden">OCR</span>
          </button>

          {/* Manual Entry CTA */}
          <button
            onClick={onOpenManualEntry}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
            title="Enter or correct office daily data manually"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Manual Entry</span>
          </button>

          {/* Export CTA */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-all"
            title="Export Excel, CSV or Print Report"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
            >
              <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-medium text-slate-200 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {currentUser.role.replace(/_/g, ' ').toLowerCase()}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-50">
                <div className="px-3 pb-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold border rounded ${
                      roleBadgeColors[currentUser.role]
                    }`}
                  >
                    {currentUser.role.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Role (RBAC Testing)
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onUserChange(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      u.id === currentUser.id ? 'text-emerald-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.role}</div>
                    </div>
                    {u.id === currentUser.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
