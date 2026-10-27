import React, { useState } from 'react';
import { Edit3, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { DailyReport } from '../../types';

interface ReportCorrectionModalProps {
  report: DailyReport;
  onClose: () => void;
  onSaveCorrection: (reportId: string, updates: Partial<DailyReport>, reason: string) => Promise<void>;
}

export const ReportCorrectionModal: React.FC<ReportCorrectionModalProps> = ({
  report,
  onClose,
  onSaveCorrection,
}) => {
  const [formData, setFormData] = useState({
    totalEmployees: report.totalEmployees,
    lateAfter745: report.lateAfter745,
    lateAfter800: report.lateAfter800,
    qmaticIssued: report.qmaticIssued,
    qmaticProcessed: report.qmaticProcessed,
    oneAppIssued: report.oneAppIssued,
    oneAppProcessed: report.oneAppProcessed,
    oneAppSkipped: report.oneAppSkipped,
    approvedOneApp: report.approvedOneApp,
    diminishedFingerprintsMBVS: report.diminishedFingerprintsMBVS,
    proofOfLife: report.proofOfLife,
    pakidApproved: report.pakidApproved,
    pakidDeferred: report.pakidDeferred,
    pakidCorrection: report.pakidCorrection,
  });

  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMsg('A comprehensive audit reason is mandatory (minimum 5 characters).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSaveCorrection(report.id, formData, reason);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs font-semibold text-blue-400 font-mono">
              {report.officeCode} · {report.reportingDate}
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <Edit3 className="w-4 h-4 text-blue-400" />
              Authorized Report Correction: {report.officeName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-600/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Attendance Section */}
          <div>
            <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
              1. Employee Attendance
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Total Staff</label>
                <input
                  type="number"
                  min={0}
                  value={formData.totalEmployees}
                  onChange={(e) => setFormData({ ...formData, totalEmployees: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-amber-400 block mb-1">Late (&gt;07:45 AM)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.lateAfter745}
                  onChange={(e) => setFormData({ ...formData, lateAfter745: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-mono"
                />
              </div>
              <div>
                <label className="text-rose-400 block mb-1">Late (&gt;08:00 AM)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.lateAfter800}
                  onChange={(e) => setFormData({ ...formData, lateAfter800: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-rose-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Q-Matic & OneApp Section */}
          <div className="pt-2 border-t border-slate-800">
            <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
              2. Q-Matic & OneApp Transaction IDs
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Q-Issued</label>
                <input
                  type="number"
                  min={0}
                  value={formData.qmaticIssued}
                  onChange={(e) => setFormData({ ...formData, qmaticIssued: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Q-Processed</label>
                <input
                  type="number"
                  min={0}
                  value={formData.qmaticProcessed}
                  onChange={(e) => setFormData({ ...formData, qmaticProcessed: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">OneApp Issued</label>
                <input
                  type="number"
                  min={0}
                  value={formData.oneAppIssued}
                  onChange={(e) => setFormData({ ...formData, oneAppIssued: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Processed</label>
                <input
                  type="number"
                  min={0}
                  value={formData.oneAppProcessed}
                  onChange={(e) => setFormData({ ...formData, oneAppProcessed: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Skipped</label>
                <input
                  type="number"
                  min={0}
                  value={formData.oneAppSkipped}
                  onChange={(e) => setFormData({ ...formData, oneAppSkipped: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Approvals Section */}
          <div className="pt-2 border-t border-slate-800">
            <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
              3. Approvals, MBVS & Pak-ID
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-emerald-400 block mb-1">Approved OneApp</label>
                <input
                  type="number"
                  min={0}
                  value={formData.approvedOneApp}
                  onChange={(e) => setFormData({ ...formData, approvedOneApp: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono"
                />
              </div>
              <div>
                <label className="text-sky-400 block mb-1">Diminished MBVS</label>
                <input
                  type="number"
                  min={0}
                  value={formData.diminishedFingerprintsMBVS}
                  onChange={(e) => setFormData({ ...formData, diminishedFingerprintsMBVS: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-emerald-400 block mb-1">Proof of Life</label>
                <input
                  type="number"
                  min={0}
                  value={formData.proofOfLife}
                  onChange={(e) => setFormData({ ...formData, proofOfLife: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-emerald-400 block mb-1">Pak-ID Approved</label>
                <input
                  type="number"
                  min={0}
                  value={formData.pakidApproved}
                  onChange={(e) => setFormData({ ...formData, pakidApproved: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Audit Reason */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-slate-300 font-semibold block mb-1">
              Audit Reason for Correction (Mandatory):
            </label>
            <textarea
              rows={2}
              required
              minLength={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Cross-verified with physical counter book; updated skipped TIDs count after terminal sync."
              className="w-full p-2.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || reason.trim().length < 5}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving Correction...' : 'Commit Correction & Recalculate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
