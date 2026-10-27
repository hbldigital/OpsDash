/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Office, EmployeeAttendanceRecord } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';

interface AttendanceOcrUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  offices: Office[];
  currentDate: string;
  defaultOfficeCode?: string;
  onImportSuccess: (records: EmployeeAttendanceRecord[]) => void;
}

export const AttendanceOcrUploadModal: React.FC<AttendanceOcrUploadModalProps> = ({
  isOpen,
  onClose,
  offices,
  currentDate,
  defaultOfficeCode,
  onImportSuccess,
}) => {
  const { threshold1, threshold2 } = useLocalization();
  const [selectedOfficeCode, setSelectedOfficeCode] = useState(defaultOfficeCode || offices[0]?.code || 'LKR-01');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setFileBase64(res);
      setPreviewUrl(res);
      setOcrResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleImage = () => {
    setFileName('Paste_October_26__2026_-_1_16AM_649e0b33.png');
    setPreviewUrl('/assets/aistudio/Paste_October_26__2026_-_1_16AM_649e0b33');
    setFileBase64('SAMPLE_PATH');
    setOcrResult(null);
    setError(null);
  };

  const handleRunOcr = async () => {
    if (!fileBase64) {
      setError('Please choose a photo or use the sample image');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const payload: any = {
        officeCode: selectedOfficeCode,
        date: currentDate,
        fileName,
      };

      if (fileBase64 === 'SAMPLE_PATH') {
        payload.sampleImagePath = '/assets/aistudio/Paste_October_26__2026_-_1_16AM_649e0b33';
      } else {
        payload.imageBase64 = fileBase64;
        payload.mimeType = fileBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
      }

      const res = await fetch('/api/attendance/ocr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setOcrResult(data.result);
      } else {
        throw new Error(data.error || 'Failed to extract attendance data');
      }
    } catch (err: any) {
      setError(err.message || 'Vision OCR extraction failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!ocrResult || !ocrResult.records) return;
    setIsImporting(true);
    setError(null);

    const selOffice = offices.find((o) => o.code === selectedOfficeCode);
    const officeName = selOffice ? selOffice.name : selectedOfficeCode;

    const formattedRecords: EmployeeAttendanceRecord[] = ocrResult.records.map((r: any, idx: number) => ({
      id: `att-${currentDate}-${selectedOfficeCode}-${Date.now()}-${idx}`,
      date: currentDate,
      officeCode: selectedOfficeCode,
      officeName,
      employeeId: r.employeeId || `EMP-${selectedOfficeCode}-${100 + idx}`,
      employeeName: r.employeeName,
      designation: r.designation || 'Registration Executive',
      category: r.category || 'OFFICIAL',
      gender: r.gender || 'MALE',
      checkInTime: r.checkInTime || '07:35',
      status: r.status || 'ON_TIME',
      notes: r.notes || `OCR extracted from ${fileName}`,
      source: 'BIOMETRIC_OCR',
    }));

    try {
      const res = await fetch('/api/attendance/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: formattedRecords,
          sourceTitle: `Biometric Sheet OCR [${fileName}]`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onImportSuccess(formattedRecords);
        onClose();
      } else {
        throw new Error(data.error || 'Batch import failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to commit attendance records');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Upload Attendance Sheet or Biometric Register (Vision OCR)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Configuration Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Office / DAU</label>
              <select
                value={selectedOfficeCode}
                onChange={(e) => setSelectedOfficeCode(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium"
              >
                {offices.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.code} — {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Attendance Date</label>
              <input
                type="text"
                disabled
                value={currentDate}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-300"
              />
            </div>
          </div>

          {/* Upload / Picture Drop Zone */}
          {!ocrResult && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-full bg-purple-950/60 text-purple-400 flex items-center justify-center mx-auto mb-3 border border-purple-800/40">
                  <Upload className="w-6 h-6" />
                </div>

                <div className="text-sm font-semibold text-white">
                  {fileName ? fileName : 'Click to Upload Attendance Sheet Picture / Scan'}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                  Upload high-resolution camera photograph, mobile snapshot, or scanner PDF/JPG of the daily attendance register or biometric clock log.
                </p>

                {previewUrl && (
                  <div className="mt-4 max-w-xs mx-auto rounded-lg overflow-hidden border border-slate-700">
                    <img src={previewUrl} alt="Preview" className="w-full h-36 object-cover" />
                  </div>
                )}
              </div>

              {/* Sample Document Button */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Don't have a picture right now?</span>
                <button
                  type="button"
                  onClick={handleUseSampleImage}
                  className="text-purple-400 hover:text-purple-300 font-semibold underline"
                >
                  Load Sample Operations Document
                </button>
              </div>

              {/* Run OCR Extraction Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleRunOcr}
                  disabled={!fileBase64 || isAnalyzing}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAnalyzing ? 'Analyzing Attendance Sheet with Gemini...' : 'Analyze & Extract Attendance Times'}
                </button>
              </div>
            </div>
          )}

          {/* OCR RESULT PREVIEW */}
          {ocrResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    OCR Recognition Successful
                  </div>
                  <div className="text-white font-semibold text-sm mt-0.5">
                    Detected {ocrResult.totalEmployeesDetected} Employees for {ocrResult.detectedOfficeName || selectedOfficeCode}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Evaluated against Shift Timings: On-Time (≤ {threshold1}), Late &gt; {threshold1}, Late &gt; {threshold2}
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {ocrResult.onTimeCount} On Time
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                    {ocrResult.late745Count} Late (&gt;{threshold1})
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800">
                    {ocrResult.late800Count} Late (&gt;{threshold2})
                  </div>
                </div>
              </div>

              {/* Extracted Employees Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-lg max-h-72">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Emp ID</th>
                      <th className="py-2.5 px-3">Employee Name</th>
                      <th className="py-2.5 px-3">Designation</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Gender</th>
                      <th className="py-2.5 px-3 text-right">Arrival Time</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {ocrResult.records.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/60">
                        <td className="py-2 px-3 text-slate-400">{r.employeeId}</td>
                        <td className="py-2 px-3 font-sans font-medium text-white">{r.employeeName}</td>
                        <td className="py-2 px-3 font-sans text-slate-300">{r.designation}</td>
                        <td className="py-2 px-3 font-sans text-slate-400">{r.category}</td>
                        <td className="py-2 px-3 font-sans text-slate-400">{r.gender}</td>
                        <td className="py-2 px-3 text-right font-bold text-white">{r.checkInTime}</td>
                        <td className="py-2 px-3 font-sans">
                          {r.status === 'ON_TIME' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              On Time
                            </span>
                          )}
                          {r.status === 'LATE_745' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                              Late (&gt; {threshold1})
                            </span>
                          )}
                          {r.status === 'LATE_800' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950 text-rose-400 border border-rose-800">
                              Late (&gt; {threshold2})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setOcrResult(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Scan Another Picture
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isImporting ? 'Importing...' : `Confirm & Add All (${ocrResult.records.length}) to Register`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
