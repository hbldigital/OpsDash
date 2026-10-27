/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Camera,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Check,
  X,
  FileCheck,
  Building,
  Save,
  ArrowRight,
} from 'lucide-react';
import { OcrJobResult, OcrExtractedRow } from '../../types/dashboard';

interface OcrUploadViewProps {
  onImportConfirmed: (date: string) => void;
  onCancel: () => void;
}

export const OcrUploadView: React.FC<OcrUploadViewProps> = ({
  onImportConfirmed,
  onCancel,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [ocrResult, setOcrResult] = useState<OcrJobResult | null>(null);
  const [isCommitted, setIsCommitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run OCR Extraction
  const handleRunOcr = async () => {
    if (!previewUrl) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: previewUrl,
          mimeType: selectedFile?.type || 'image/png',
          fileName: selectedFile?.name || 'daily_report_larkana.png',
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setOcrResult(data.result);
      } else {
        setErrorMsg(data.error || 'Failed to extract data from image.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error during OCR processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick load sample Zone-D Report for immediate testing
  const handleLoadSampleReport = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      // Create a virtual canvas representation of Zone-D Larkana report
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('NADRA PAKISTAN — ZONE-D LARKANA DAILY PROGRESS REPORT', 40, 50);
        ctx.font = '16px sans-serif';
        ctx.fillText('Date: 2026-10-25 | Reporting Offices: 20 DAUs/NRCs | Region: Sindh', 40, 80);
      }
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewUrl(dataUrl);
      setSelectedFile(new File(['sample'], 'Zone-D_Larkana_Daily_Report_2026-10-25.png', { type: 'image/png' }));

      // Run extraction
      const res = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mimeType: 'image/png',
          fileName: 'Zone-D_Larkana_Daily_Report_2026-10-25.png',
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setOcrResult(data.result);
      } else {
        setErrorMsg('Failed to process sample report.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading sample');
    } finally {
      setIsProcessing(false);
    }
  };

  // Editable cell update
  const handleCellEdit = (rowId: string, field: keyof OcrExtractedRow['values'], newVal: string) => {
    if (!ocrResult) return;
    const num = field === 'officeCode' || field === 'officeName' ? newVal : Number(newVal) || 0;

    const updatedRows = ocrResult.extractedRows.map((r) => {
      if (r.rowId === rowId) {
        return {
          ...r,
          values: {
            ...r.values,
            [field]: {
              ...r.values[field],
              value: num,
              rawText: String(newVal),
              isModified: true,
            },
          },
        };
      }
      return r;
    });

    setOcrResult({
      ...ocrResult,
      extractedRows: updatedRows,
    });
  };

  // Confirm & Commit to Database
  const handleConfirmImport = async () => {
    if (!ocrResult) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const flatRows = ocrResult.extractedRows.map((r) => ({
        officeCode: r.values.officeCode.value,
        officeName: r.values.officeName.value,
        totalEmployees: r.values.totalEmployees.value,
        lateAfter745: r.values.lateAfter745.value,
        lateAfter800: r.values.lateAfter800.value,
        qmaticIssued: r.values.qmaticIssued.value,
        qmaticProcessed: r.values.qmaticProcessed.value,
        oneappIssued: r.values.oneappIssued.value,
        oneappProcessed: r.values.oneappProcessed.value,
        oneappSkipped: r.values.oneappSkipped.value,
        approvedOneApp: r.values.approvedOneApp.value,
        diminishedFingerprintsMBVS: r.values.diminishedFingerprintsMBVS.value,
        proofOfLifeCertificates: r.values.proofOfLifeCertificates.value,
        pakidApproved: r.values.pakidApproved.value,
        pakidDeferred: r.values.pakidDeferred.value,
        pakidCorrection: r.values.pakidCorrection.value,
      }));

      const res = await fetch('/api/ocr/confirm-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: flatRows,
          reportingDate: ocrResult.detectedDate,
          reportTitle: ocrResult.detectedTitle,
          zone: ocrResult.detectedZone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCommitted(true);
        setCommitMessage(data.message || 'Records successfully persisted into database.');
        setTimeout(() => {
          onImportConfirmed(ocrResult.detectedDate);
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Failed to confirm import.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error confirming import.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper for confidence badge styling
  const getConfidenceBadge = (score: number) => {
    if (score >= 0.85) {
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
          {(score * 100).toFixed(0)}% High
        </span>
      );
    }
    if (score >= 0.65) {
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 rounded">
          {(score * 100).toFixed(0)}% Review
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800 rounded">
        {(score * 100).toFixed(0)}% Low
      </span>
    );
  };

  // Calculated sum of rows for verification against source totals
  const calculatedSums = useMemo(() => {
    if (!ocrResult) return null;
    return {
      staff: ocrResult.extractedRows.reduce((acc, r) => acc + (Number(r.values.totalEmployees.value) || 0), 0),
      qIssued: ocrResult.extractedRows.reduce((acc, r) => acc + (Number(r.values.qmaticIssued.value) || 0), 0),
      qProc: ocrResult.extractedRows.reduce((acc, r) => acc + (Number(r.values.qmaticProcessed.value) || 0), 0),
      oneIssued: ocrResult.extractedRows.reduce((acc, r) => acc + (Number(r.values.oneappIssued.value) || 0), 0),
      oneProc: ocrResult.extractedRows.reduce((acc, r) => acc + (Number(r.values.oneappProcessed.value) || 0), 0),
      oneSkip: ocrResult.extractedRows.reduce((acc, r) => acc + (Number(r.values.oneappSkipped.value) || 0), 0),
      approved: ocrResult.extractedRows.reduce((acc, r) => acc + (Number(r.values.approvedOneApp.value) || 0), 0),
    };
  }, [ocrResult]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            <span>Upload Daily Report — Image to Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Photographed daily spreadsheet ingestion with Gemini Vision OCR, side-by-side verification, and audit reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSampleReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 border border-blue-700/60 rounded-lg text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-300" />
            <span>Load Sample Report (Zone-D Larkana)</span>
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Error or Success Alerts */}
      {errorMsg && (
        <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isCommitted && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 rounded-lg text-xs text-emerald-200 flex items-center gap-2 shadow-lg">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{commitMessage}</span>
        </div>
      )}

      {/* Main Two-Panel Layout (Upload & Preview on Left, Extracted Data on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel: Image Upload, Camera & Viewer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              1. Document Capture & Upload
            </h2>

            {/* Hidden file & camera inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500/70 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-950/40 group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-emerald-950/60 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 mx-auto mb-3 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-200">
                  Click or drag and drop report image
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports JPG, PNG, WebP, photographed spreadsheets, screenshots
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Camera Capture</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Image Toolbar */}
                <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="truncate max-w-[180px] font-medium text-slate-300">
                    {selectedFile?.name || 'Captured Image'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-300"
                      title="Rotate 90 degrees"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                      className="p-1 hover:bg-slate-800 rounded text-slate-300"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                      className="p-1 hover:bg-slate-800 rounded text-slate-300"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        setOcrResult(null);
                      }}
                      className="p-1 hover:bg-slate-800 text-rose-400 rounded"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Image Preview Container */}
                <div className="relative w-full h-[360px] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={previewUrl}
                    alt="Uploaded Report"
                    style={{
                      transform: `rotate(${rotation}deg) scale(${zoomLevel})`,
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Run OCR Button */}
                {!ocrResult && (
                  <button
                    onClick={handleRunOcr}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Extracting Structured Data with Gemini OCR...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        <span>Run Automated OCR Extraction</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Extracted Table Review & Field Validation */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  2. Structured Extraction Review & Confidence Inspection
                </h2>
                <p className="text-[11px] text-slate-400">
                  Inspect recognized cells before committing to central records. Edit any uncertain values.
                </p>
              </div>

              {ocrResult && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    Recognized: <strong className="text-slate-200">{ocrResult.totalRowsDetected} offices</strong>
                  </span>
                  {getConfidenceBadge(ocrResult.confidenceScore)}
                </div>
              )}
            </div>

            {ocrResult ? (
              <div className="space-y-4">
                {/* Detected Metadata Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Report Title:</span>
                    <div className="font-semibold text-slate-200 truncate">{ocrResult.detectedTitle}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Zone:</span>
                    <div className="font-semibold text-emerald-400 truncate">{ocrResult.detectedZone}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Reporting Date:</span>
                    <div className="font-semibold text-slate-200">{ocrResult.detectedDate}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Duplicate Check:</span>
                    <div>
                      {ocrResult.isDuplicateDetected ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Existing reports on date
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Fresh date record
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Source Totals vs Calculated Sums Check */}
                {ocrResult.sourceTotals && calculatedSums && (
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-2">
                    <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                      <span>Spreadsheet Source Total vs Calculated Sum Verification</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400">Staff Total:</span>{' '}
                        <span className="font-mono text-slate-200">
                          {calculatedSums.staff} (source: {ocrResult.sourceTotals.totalEmployees ?? 'N/A'})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Q-Matic Issued:</span>{' '}
                        <span className="font-mono text-slate-200">
                          {calculatedSums.qIssued} (source: {ocrResult.sourceTotals.qmaticIssued ?? 'N/A'})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">OneApp Issued:</span>{' '}
                        <span className="font-mono text-slate-200">
                          {calculatedSums.oneIssued} (source: {ocrResult.sourceTotals.oneappIssued ?? 'N/A'})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Approved OneApp:</span>{' '}
                        <span className="font-mono text-emerald-400 font-bold">
                          {calculatedSums.approved} (source: {ocrResult.sourceTotals.approvedOneApp ?? 'N/A'})
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extracted Rows Editable Table */}
                <div className="overflow-x-auto max-h-[380px] border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                      <tr>
                        <th className="py-2 px-2.5">Code</th>
                        <th className="py-2 px-2.5 min-w-[140px]">Office Name</th>
                        <th className="py-2 px-2 text-right">Staff</th>
                        <th className="py-2 px-2 text-right text-amber-400">&gt;07:45</th>
                        <th className="py-2 px-2 text-right text-rose-400">&gt;08:00</th>
                        <th className="py-2 px-2 text-right">Q-Issued</th>
                        <th className="py-2 px-2 text-right">Q-Proc</th>
                        <th className="py-2 px-2 text-right">TIDs Issued</th>
                        <th className="py-2 px-2 text-right">OneApp Proc</th>
                        <th className="py-2 px-2 text-right">Skipped</th>
                        <th className="py-2 px-2 text-right text-emerald-400">Approved</th>
                        <th className="py-2 px-2 text-right">MBVS</th>
                        <th className="py-2 px-2 text-right">Proof Life</th>
                        <th className="py-2 px-2 text-right">Pak-ID App</th>
                        <th className="py-2 px-2 text-center">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {ocrResult.extractedRows.map((row) => (
                        <tr key={row.rowId} className="hover:bg-slate-800/40">
                          <td className="py-1.5 px-2 font-mono text-[11px] font-semibold text-slate-400">
                            {row.values.officeCode.value}
                          </td>
                          <td className="py-1.5 px-2 font-medium text-slate-200">
                            {row.values.officeName.value}
                          </td>
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={row.values.totalEmployees.value}
                              onChange={(e) => handleCellEdit(row.rowId, 'totalEmployees', e.target.value)}
                              className="w-12 px-1 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={row.values.lateAfter745.value}
                              onChange={(e) => handleCellEdit(row.rowId, 'lateAfter745', e.target.value)}
                              className="w-12 px-1 py-0.5 bg-slate-950 border border-slate-700 text-amber-300 rounded text-right font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={row.values.lateAfter800.value}
                              onChange={(e) => handleCellEdit(row.rowId, 'lateAfter800', e.target.value)}
                              className="w-12 px-1 py-0.5 bg-slate-950 border border-slate-700 text-rose-300 rounded text-right font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={row.values.qmaticIssued.value}
                              onChange={(e) => handleCellEdit(row.rowId, 'qmaticIssued', e.target.value)}
                              className="w-14 px-1 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={row.values.qmaticProcessed.value}
                              onChange={(e) => handleCellEdit(row.rowId, 'qmaticProcessed', e.target.value)}
                              className="w-14 px-1 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={row.values.oneappIssued.value}
                              onChange={(e) => handleCellEdit(row.rowId, 'oneappIssued', e.target.value)}
                              className="w-14 px-1 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={row.values.oneappProcessed.value}
                              onChange={(e) => handleCellEdit(row.rowId, 'oneappProcessed', e.target.value)}
                              className="w-14 px-1 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={row.values.oneappSkipped.value}
                              onChange={(e) => handleCellEdit(row.rowId, 'oneappSkipped', e.target.value)}
                              className="w-12 px-1 py-0.5 bg-slate-950 border border-slate-700 text-slate-400 rounded text-right font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={row.values.approvedOneApp.value}
                              onChange={(e) => handleCellEdit(row.rowId, 'approvedOneApp', e.target.value)}
                              className="w-14 px-1 py-0.5 bg-slate-950 border border-emerald-800 text-emerald-300 font-bold rounded text-right font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={row.values.diminishedFingerprintsMBVS.value}
                              onChange={(e) => handleCellEdit(row.rowId, 'diminishedFingerprintsMBVS', e.target.value)}
                              className="w-12 px-1 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={row.values.proofOfLifeCertificates.value}
                              onChange={(e) => handleCellEdit(row.rowId, 'proofOfLifeCertificates', e.target.value)}
                              className="w-12 px-1 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={row.values.pakidApproved.value}
                              onChange={(e) => handleCellEdit(row.rowId, 'pakidApproved', e.target.value)}
                              className="w-12 px-1 py-0.5 bg-slate-950 border border-slate-700 text-emerald-400 rounded text-right font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            {getConfidenceBadge(row.confidence)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Commit Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Review completed? Confirming will update central database records and audit history.
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunOcr}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                    >
                      Re-run OCR
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      disabled={isProcessing || isCommitted}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-md transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>Confirm & Import Records</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-slate-950/30 rounded-lg border border-slate-800/80">
                <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <div className="text-sm font-semibold text-slate-300">
                  No OCR Extraction Active
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Upload an image on the left panel or click "Load Sample Report" above to review structured extraction.
                </p>
                <button
                  onClick={handleLoadSampleReport}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold border border-slate-700"
                >
                  Load Sample Zone-D Larkana Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
