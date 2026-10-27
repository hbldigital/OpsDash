import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  ZoomIn,
  ZoomOut,
  Edit2,
  Save,
  ArrowRight,
  ShieldCheck,
  FileText,
  Sliders,
  Info,
} from 'lucide-react';
import { DailyReport, User } from '../../types';

interface UploadOcrViewProps {
  onImportSuccess: (date: string) => void;
  currentUser: User | null;
}

export const UploadOcrView: React.FC<UploadOcrViewProps> = ({
  onImportSuccess,
  currentUser,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportingDate, setReportingDate] = useState('2026-10-25');
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRows, setEditableRows] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrResult(null);
      setErrorMsg(null);
    }
  };

  // Quick Load Attached Reference Image
  const handleUseSample = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ocr/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleImagePath: '/public/assets/aistudio/Paste_October_26__2026_-_1_16AM_649e0b33',
          reportingDate,
        }),
      });

      if (!res.ok) {
        throw new Error((await res.json()).error || 'OCR processing failed');
      }

      const data = await res.json();
      setOcrResult(data);
      setEditableRows(data.rows);
      setPreviewUrl('/assets/aistudio/Paste_October_26__2026_-_1_16AM_649e0b33');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  };

  // Run OCR on uploaded file
  const handleRunOcr = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('reportingDate', reportingDate);

    try {
      const res = await fetch('/api/ocr/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error((await res.json()).error || 'Failed to extract data');
      }

      const data = await res.json();
      setOcrResult(data);
      setEditableRows(data.rows);
    } catch (err: any) {
      setErrorMsg(err.message || 'OCR extraction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cell change handler
  const handleCellChange = (rowIndex: number, field: string, value: any) => {
    const updated = [...editableRows];
    updated[rowIndex] = {
      ...updated[rowIndex],
      [field]: {
        ...updated[rowIndex][field],
        value: typeof updated[rowIndex][field]?.value === 'number' ? Number(value) || 0 : value,
      },
    };
    setEditableRows(updated);
  };

  // Confirm & Commit Import
  const handleConfirmImport = async () => {
    if (!ocrResult || editableRows.length === 0) return;

    setIsProcessing(true);
    setImportStatus('Validating and committing records to database...');

    try {
      const flattenedRows = editableRows.map((r) => ({
        officeCode: r.officeCode.value,
        officeName: r.officeName.value,
        totalEmployees: r.totalEmployees.value,
        lateAfter745: r.lateAfter745.value,
        lateAfter800: r.lateAfter800.value,
        qmaticIssued: r.qmaticIssued.value,
        qmaticProcessed: r.qmaticProcessed.value,
        oneAppIssued: r.oneAppIssued.value,
        oneAppProcessed: r.oneAppProcessed.value,
        oneAppSkipped: r.oneAppSkipped.value,
        approvedOneApp: r.approvedOneApp.value,
        diminishedFingerprintsMBVS: r.diminishedFingerprintsMBVS.value,
        proofOfLife: r.proofOfLife.value,
        pakidApproved: r.pakidApproved.value,
        pakidDeferred: r.pakidDeferred.value,
        pakidCorrection: r.pakidCorrection.value,
      }));

      const res = await fetch('/api/ocr/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportingDate: ocrResult.detectedDate || reportingDate,
          rows: flattenedRows,
          sourceImageUrl: previewUrl,
        }),
      });

      if (!res.ok) {
        throw new Error((await res.json()).error || 'Failed to import records');
      }

      const resData = await res.json();
      setImportStatus(`Success! Imported ${resData.importedCount} office records.`);

      setTimeout(() => {
        onImportSuccess(ocrResult.detectedDate || reportingDate);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Import failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <span>Automated Document Processing Pipeline</span>
          <span>·</span>
          <span>Vision OCR</span>
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
          Upload Daily Report — Image to Dashboard
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload mobile camera photographs, scanned spreadsheets, or screenshots of the Larkana Daily Progress Report for automatic data extraction and validation.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {importStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-200 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* SECTION 1: UPLOAD AREA */}
      {!ocrResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-slate-700 hover:border-blue-500/80 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[260px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Drag & Drop Daily Progress Report Image Here
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Supports photographed spreadsheets, tilted mobile photos, JPEG, PNG, WebP, or screenshots.
              </p>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
                >
                  Browse Files
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Capture Photo
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {selectedFile && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileSpreadsheet className="w-8 h-8 text-blue-400 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready for OCR
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRunOcr}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      Extract Structured Data <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quick Test Sample Panel */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                Quick Pipeline Test
              </div>
              <h4 className="text-sm font-semibold text-white">
                Load Attached Larkana Report Sheet
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test the complete OCR ingestion pipeline using the attached reference spreadsheet image (<code>Zone-D Larkana Daily Progress Report</code>).
              </p>

              <div className="pt-2">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Assign Reporting Date:
                </label>
                <input
                  type="date"
                  value={reportingDate}
                  onChange={(e) => setReportingDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono [color-scheme:dark]"
                />
              </div>
            </div>

            <button
              onClick={handleUseSample}
              disabled={isProcessing}
              className="mt-6 w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running AI OCR Extraction...
                </>
              ) : (
                <>
                  Load & Extract Reference Image
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: OCR REVIEW & FIELD MAPPING SCREEN */}
      {ocrResult && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Summary of Extraction */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  OCR Extraction Complete
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400 font-mono">
                  Job ID: {ocrResult.jobId}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {ocrResult.reportTitle} — {ocrResult.detectedZone} ({ocrResult.detectedDate})
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-right">
                <div className="text-[10px] text-slate-400">Average OCR Confidence</div>
                <div className="text-sm font-bold text-emerald-400 tabular-nums">
                  {ocrResult.averageConfidence}%
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-right">
                <div className="text-[10px] text-slate-400">Extracted Offices</div>
                <div className="text-sm font-bold text-white tabular-nums">
                  {ocrResult.rowsCount} Rows
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
                  isEditing
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                {isEditing ? 'Done Editing' : 'Edit Cells'}
              </button>
            </div>
          </div>

          {/* Side-by-side or Tabbed Panels: Image Preview & Extracted Data */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Original Image Viewer with Zoom */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  Original Document Scan
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-400"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="relative flex-1 min-h-[350px] max-h-[500px] bg-slate-950 rounded-lg overflow-auto border border-slate-800 flex items-center justify-center p-2">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Uploaded Daily Progress Report"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                    className="transition-transform duration-150 max-w-full"
                  />
                ) : (
                  <div className="text-xs text-slate-500 text-center p-4">
                    Image preview unavailable
                  </div>
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-2 text-center">
                Pre-processed: Rotation adjusted · Glare reduced · Grid detected
              </div>
            </div>

            {/* Right: Validation & Totals Comparison Box */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Source Totals vs Calculated Totals Audit
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      ocrResult.totalsMatch
                        ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40'
                        : 'text-amber-400 bg-amber-950/60 border border-amber-800/40'
                    }`}
                  >
                    {ocrResult.totalsMatch ? 'All Totals Reconciled' : 'Variance Detected'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Total Staff</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {ocrResult.calculatedTotals.totalEmployees}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Q-Matic Tokens</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {ocrResult.calculatedTotals.qmaticIssued}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">OneApp TIDs</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {ocrResult.calculatedTotals.oneAppIssued}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Approved OneApp</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                      {ocrResult.calculatedTotals.approvedOneApp}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>
                    Spreadsheet TOTAL rows are excluded from office ingestion and used exclusively for cross-verification.
                  </span>
                </div>
              </div>

              {/* Confidence Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 px-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  High Confidence (≥ 85%): Ready
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Medium Confidence (70-84%): Check
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Low Confidence (&lt; 70%): Manually Verify
                </span>
              </div>

              {/* Extracted Data Table */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Extracted Office Records ({editableRows.length} Rows)
                  </h4>
                  {isEditing && (
                    <span className="text-xs text-blue-400 font-medium">
                      Inline editing active — edit values directly in table
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto max-h-[400px] border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-950 sticky top-0 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 z-10">
                      <tr>
                        <th className="py-2 px-2.5">Code</th>
                        <th className="py-2 px-2.5">Office Name</th>
                        <th className="py-2 px-2.5 text-right">Staff</th>
                        <th className="py-2 px-2.5 text-right">&gt;07:45</th>
                        <th className="py-2 px-2.5 text-right">&gt;08:00</th>
                        <th className="py-2 px-2.5 text-right">Q-Issued</th>
                        <th className="py-2 px-2.5 text-right">Q-Proc</th>
                        <th className="py-2 px-2.5 text-right">OneApp Iss</th>
                        <th className="py-2 px-2.5 text-right">Proc</th>
                        <th className="py-2 px-2.5 text-right">Skip</th>
                        <th className="py-2 px-2.5 text-right">Apprv</th>
                        <th className="py-2 px-2.5 text-right">MBVS</th>
                        <th className="py-2 px-2.5 text-right">Life Cert</th>
                        <th className="py-2 px-2.5 text-right">PakID Apprv</th>
                        <th className="py-2 px-2.5 text-right">Conf %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {editableRows.map((row, idx) => (
                        <tr key={row.rowId} className="hover:bg-slate-800/40">
                          <td className="py-1.5 px-2.5 font-semibold text-blue-400">
                            {row.officeCode?.value}
                          </td>
                          <td className="py-1.5 px-2.5 font-sans font-medium text-white max-w-[150px] truncate">
                            {row.officeName?.value}
                          </td>

                          {/* Staff */}
                          <td className="py-1.5 px-2 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.totalEmployees?.value}
                                onChange={(e) => handleCellChange(idx, 'totalEmployees', e.target.value)}
                                className="w-14 px-1 py-0.5 text-right bg-slate-950 border border-slate-700 rounded text-white"
                              />
                            ) : (
                              row.totalEmployees?.value
                            )}
                          </td>

                          {/* Late 745 */}
                          <td className="py-1.5 px-2 text-right text-amber-400">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.lateAfter745?.value}
                                onChange={(e) => handleCellChange(idx, 'lateAfter745', e.target.value)}
                                className="w-12 px-1 py-0.5 text-right bg-slate-950 border border-slate-700 rounded text-amber-400"
                              />
                            ) : (
                              row.lateAfter745?.value
                            )}
                          </td>

                          {/* Late 800 */}
                          <td className="py-1.5 px-2 text-right text-rose-400">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.lateAfter800?.value}
                                onChange={(e) => handleCellChange(idx, 'lateAfter800', e.target.value)}
                                className="w-12 px-1 py-0.5 text-right bg-slate-950 border border-slate-700 rounded text-rose-400"
                              />
                            ) : (
                              row.lateAfter800?.value
                            )}
                          </td>

                          {/* Q-Matic Issued */}
                          <td className="py-1.5 px-2 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.qmaticIssued?.value}
                                onChange={(e) => handleCellChange(idx, 'qmaticIssued', e.target.value)}
                                className="w-14 px-1 py-0.5 text-right bg-slate-950 border border-slate-700 rounded text-white"
                              />
                            ) : (
                              row.qmaticIssued?.value
                            )}
                          </td>

                          {/* Q-Matic Processed */}
                          <td className="py-1.5 px-2 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.qmaticProcessed?.value}
                                onChange={(e) => handleCellChange(idx, 'qmaticProcessed', e.target.value)}
                                className="w-14 px-1 py-0.5 text-right bg-slate-950 border border-slate-700 rounded text-white"
                              />
                            ) : (
                              row.qmaticProcessed?.value
                            )}
                          </td>

                          {/* OneApp Issued */}
                          <td className="py-1.5 px-2 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.oneAppIssued?.value}
                                onChange={(e) => handleCellChange(idx, 'oneAppIssued', e.target.value)}
                                className="w-14 px-1 py-0.5 text-right bg-slate-950 border border-slate-700 rounded text-white"
                              />
                            ) : (
                              row.oneAppIssued?.value
                            )}
                          </td>

                          {/* OneApp Processed */}
                          <td className="py-1.5 px-2 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.oneAppProcessed?.value}
                                onChange={(e) => handleCellChange(idx, 'oneAppProcessed', e.target.value)}
                                className="w-14 px-1 py-0.5 text-right bg-slate-950 border border-slate-700 rounded text-white"
                              />
                            ) : (
                              row.oneAppProcessed?.value
                            )}
                          </td>

                          {/* OneApp Skipped */}
                          <td className="py-1.5 px-2 text-right text-slate-400">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.oneAppSkipped?.value}
                                onChange={(e) => handleCellChange(idx, 'oneAppSkipped', e.target.value)}
                                className="w-12 px-1 py-0.5 text-right bg-slate-950 border border-slate-700 rounded text-slate-400"
                              />
                            ) : (
                              row.oneAppSkipped?.value
                            )}
                          </td>

                          {/* Approved */}
                          <td className="py-1.5 px-2 text-right text-emerald-400 font-bold">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.approvedOneApp?.value}
                                onChange={(e) => handleCellChange(idx, 'approvedOneApp', e.target.value)}
                                className="w-14 px-1 py-0.5 text-right bg-slate-950 border border-slate-700 rounded text-emerald-400"
                              />
                            ) : (
                              row.approvedOneApp?.value
                            )}
                          </td>

                          {/* MBVS */}
                          <td className="py-1.5 px-2 text-right text-slate-300">
                            {row.diminishedFingerprintsMBVS?.value}
                          </td>

                          {/* Life Cert */}
                          <td className="py-1.5 px-2 text-right text-slate-300">
                            {row.proofOfLife?.value}
                          </td>

                          {/* PakID Approved */}
                          <td className="py-1.5 px-2 text-right text-emerald-400">
                            {row.pakidApproved?.value}
                          </td>

                          {/* Confidence */}
                          <td className="py-1.5 px-2.5 text-right">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                row.qmaticIssued?.confidence >= 85
                                  ? 'text-emerald-400 bg-emerald-950/60'
                                  : 'text-amber-400 bg-amber-950/60'
                              }`}
                            >
                              {row.qmaticIssued?.confidence || 95}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    setOcrResult(null);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel & Discard
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleUseSample}
                    disabled={isProcessing}
                    className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Re-run Extraction
                  </button>

                  <button
                    onClick={handleConfirmImport}
                    disabled={isProcessing}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Commit Import to Database
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
