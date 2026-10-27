/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  UserCheck,
  ChevronDown,
  Building2,
  Menu,
  Sliders,
} from 'lucide-react';
import { User } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  dateRangeMode?: 'single' | 'range';
  onDateRangeModeChange?: (mode: 'single' | 'range') => void;
  currentUser: User | null;
  availableUsers: User[];
  onSwitchUser: (userId: string) => void;
  lastUpdated?: string;
  onPrint?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  currentUser,
  availableUsers,
  onSwitchUser,
  lastUpdated = 'Just now',
  onPrint,
  onToggleMobileMenu,
  onOpenSettings,
}) => {
  const { getText, zoneName, zoneCode } = useLocalization();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const title = getText('appHeaderTitle', 'NADRA Zone-D Larkana Operational Intelligence');
  const subtitle = getText('appHeaderSubtitle', 'National Database & Registration Authority — Operations Dashboard');

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 lg:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & Organization Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Mobile hamburger menu toggle */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
            <Building2 className="w-5 h-5" />
          </div>

          <div className="max-w-[280px] sm:max-w-md lg:max-w-xl truncate">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                NADRA Pakistan
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-[11px] font-semibold text-amber-300 font-mono">
                {zoneName} ({zoneCode})
              </span>
            </div>
            <h1 className="text-xs sm:text-sm lg:text-base font-bold text-white tracking-tight truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2">
          {/* Global Quick Date Buttons */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onDateChange('2026-10-25')}
              className={`px-2.5 py-1 font-medium rounded transition-colors whitespace-nowrap ${
                currentDate === '2026-10-25'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Today (Oct 25)
            </button>
            <button
              onClick={() => onDateChange('2026-10-24')}
              className={`px-2.5 py-1 font-medium rounded transition-colors whitespace-nowrap ${
                currentDate === '2026-10-24'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yesterday (Oct 24)
            </button>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-white border-none focus:outline-none cursor-pointer font-mono text-xs"
              />
            </div>
          </div>

          {/* Quick Date Picker for Mobile */}
          <div className="flex md:hidden items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-white border-none focus:outline-none cursor-pointer font-mono text-xs w-28"
            />
          </div>

          {/* User Profile / Simulator */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-xs transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left truncate max-w-[120px]">
                <div className="font-semibold text-white leading-tight truncate">
                  {currentUser?.name || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {currentUser?.role || 'Operator'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="font-semibold text-white">{currentUser?.name}</div>
                  <div className="text-[10px] text-slate-400">{currentUser?.email}</div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-semibold">{currentUser?.role}</div>
                </div>

                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Switch Active Simulation
                </div>

                <div className="max-h-48 overflow-y-auto">
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        u.id === currentUser?.id ? 'text-blue-400 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <span className="truncate">{u.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{u.role}</span>
                    </button>
                  ))}
                </div>

                {onOpenSettings && (
                  <div className="pt-1 mt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSettings();
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Custom Labels &amp; Shift Timings</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            title={isFullscreen ? 'Exit full screen' : 'View full screen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
