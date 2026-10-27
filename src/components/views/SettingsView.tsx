/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Save, CheckCircle, ShieldCheck } from 'lucide-react';
import { AppSettings } from '../../types/dashboard';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>System Settings & Operational Configurations</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure reporting thresholds, time zone, OCR confidence boundaries, and governance policies.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Application configurations updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 max-w-2xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Zone Title</label>
          <input
            type="text"
            value={formData.zoneName}
            onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Organization Title</label>
          <input
            type="text"
            value={formData.organizationName}
            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Late Arrival Threshold 1 (HH:MM:SS)
            </label>
            <input
              type="text"
              value={formData.thresholdTime1}
              onChange={(e) => setFormData({ ...formData, thresholdTime1: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">Default: 07:45:00 AM</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Late Arrival Threshold 2 (HH:MM:SS)
            </label>
            <input
              type="text"
              value={formData.thresholdTime2}
              onChange={(e) => setFormData({ ...formData, thresholdTime2: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">Default: 08:00:00 AM</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">System Time Zone</label>
          <input
            type="text"
            value={formData.timeZone}
            onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
          />
          <p className="text-[10px] text-slate-400 mt-0.5">Pakistan Standard Time (Asia/Karachi, UTC+5)</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              OCR High-Confidence Boundary
            </label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={formData.ocrConfidenceThresholdHigh}
              onChange={(e) => setFormData({ ...formData, ocrConfidenceThresholdHigh: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              OCR Medium-Confidence Boundary
            </label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={formData.ocrConfidenceThresholdMedium}
              onChange={(e) => setFormData({ ...formData, ocrConfidenceThresholdMedium: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
};
