/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Save, Clock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Office, EmployeeAttendanceRecord } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';

interface AttendanceManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  offices: Office[];
  currentDate: string;
  defaultOfficeCode?: string;
  onSave: (record: Partial<EmployeeAttendanceRecord>) => Promise<void>;
}

export const AttendanceManualEntryModal: React.FC<AttendanceManualEntryModalProps> = ({
  isOpen,
  onClose,
  offices,
  currentDate,
  defaultOfficeCode,
  onSave,
}) => {
  const { threshold1, threshold2 } = useLocalization();
  const [selectedOfficeCode, setSelectedOfficeCode] = useState(defaultOfficeCode || offices[0]?.code || 'LKR-01');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Registration Executive');
  const [category, setCategory] = useState<'OFFICER' | 'OFFICIAL' | 'SUPPORTING' | 'OUTSOURCE'>('OFFICIAL');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [checkInTime, setCheckInTime] = useState('07:35');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Derive status automatically against shift timings
  let computedStatus: 'ON_TIME' | 'LATE_745' | 'LATE_800' = 'ON_TIME';
  if (checkInTime > threshold2) {
    computedStatus = 'LATE_800';
  } else if (checkInTime > threshold1) {
    computedStatus = 'LATE_745';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName.trim()) {
      setError('Please provide the employee name');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const selOffice = offices.find((o) => o.code === selectedOfficeCode);

    try {
      await onSave({
        date: currentDate,
        officeCode: selectedOfficeCode,
        officeName: selOffice ? selOffice.name : selectedOfficeCode,
        employeeId: employeeId.trim() || `EMP-${Date.now().toString().slice(-4)}`,
        employeeName: employeeName.trim(),
        designation,
        category,
        gender,
        checkInTime,
        status: computedStatus,
        notes: notes.trim() || (computedStatus === 'LATE_800' ? `Late past ${threshold2}` : computedStatus === 'LATE_745' ? `Late past ${threshold1}` : 'On Time'),
        source: 'MANUAL',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save attendance record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Record Employee Daily Attendance
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Reporting Date</label>
              <input
                type="text"
                disabled
                value={currentDate}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-slate-300"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Assigned Office / DAU</label>
              <select
                value={selectedOfficeCode}
                onChange={(e) => setSelectedOfficeCode(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                {offices.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.code} - {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Employee Full Name *</label>
              <input
                type="text"
                required
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Employee ID / Token #</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-1042"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. DEO"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="OFFICER">Officer</option>
                <option value="OFFICIAL">Official</option>
                <option value="SUPPORTING">Supporting</option>
                <option value="OUTSOURCE">Outsource</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">Clock-In / Arrival Time</label>
              <span className="text-[10px] text-slate-400 font-mono">
                Grace Thresholds: {threshold1} &amp; {threshold2}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="time"
                required
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />

              {/* Status Indicator */}
              <div className="flex-1 flex items-center justify-end">
                {computedStatus === 'ON_TIME' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> On Time (≤ {threshold1})
                  </span>
                )}
                {computedStatus === 'LATE_745' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
                    <Clock className="w-3.5 h-3.5" /> Late (&gt; {threshold1} to ≤ {threshold2})
                  </span>
                )}
                {computedStatus === 'LATE_800' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                    <AlertCircle className="w-3.5 h-3.5" /> Late (&gt; {threshold2})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Remarks / Justification (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Biometric reader delay / Official field movement"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg"
            >
              <Save className="w-3.5 h-3.5" />
              {isSubmitting ? 'Saving...' : 'Add Attendance Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
