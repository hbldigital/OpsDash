/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  zoneName?: string;
  zoneCode?: string;
  date?: string;
}

/**
 * Generates an official NADRA letterhead wrapper element,
 * renders it at high retina scale (2.5x), and exports as high-quality JPG.
 * Strictest requirement: NO website link, URL, or dashboard dev chrome appears.
 */
export async function exportElementToJpg(
  elementIdOrElement: string | HTMLElement,
  options: ExportOptions = {}
): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  try {
    const target =
      typeof elementIdOrElement === 'string'
        ? document.getElementById(elementIdOrElement)
        : elementIdOrElement;

    if (!target) {
      throw new Error(`Target element for export not found.`);
    }

    // Capture element with high DPI (scale: 2.5)
    const canvas = await html2canvas(target, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0a111e', // Dark theme slate background matching executive dashboard
      logging: false,
      windowWidth: 1400,
      onclone: (clonedDoc) => {
        // Strip any URL hints or browser navigation classes
        const links = clonedDoc.querySelectorAll('a');
        links.forEach((l) => {
          l.removeAttribute('href');
        });
        // Remove any interactive buttons that shouldn't appear on exported report
        const noExport = clonedDoc.querySelectorAll('.no-export');
        noExport.forEach((el) => el.remove());
      },
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const filename = (options.filename || `NADRA_Report_${Date.now()}`).replace(/\.jpg$/i, '') + '.jpg';

    // Trigger direct download
    downloadDataUrl(dataUrl, filename);

    return { success: true, dataUrl };
  } catch (err: any) {
    console.error('Failed to export JPG:', err);
    return { success: false, error: err.message || 'Export failed' };
  }
}

/**
 * Exports targeted element as high-resolution PDF document with official NADRA format.
 */
export async function exportElementToPdf(
  elementIdOrElement: string | HTMLElement,
  options: ExportOptions = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const target =
      typeof elementIdOrElement === 'string'
        ? document.getElementById(elementIdOrElement)
        : elementIdOrElement;

    if (!target) {
      throw new Error(`Target element for PDF export not found.`);
    }

    const canvas = await html2canvas(target, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0a111e',
      logging: false,
      windowWidth: 1400,
      onclone: (clonedDoc) => {
        const noExport = clonedDoc.querySelectorAll('.no-export');
        noExport.forEach((el) => el.remove());
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 10;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight > pageHeight - 10) {
      // Scaled to fit height
      const h = pageHeight - 10;
      const w = (canvas.width * h) / canvas.height;
      pdf.addImage(imgData, 'JPEG', (pageWidth - w) / 2, 5, w, h);
    } else {
      pdf.addImage(imgData, 'JPEG', 5, 5, imgWidth, imgHeight);
    }

    const filename = (options.filename || `NADRA_Report_${Date.now()}`).replace(/\.pdf$/i, '') + '.pdf';
    pdf.save(filename);

    return { success: true };
  } catch (err: any) {
    console.error('Failed to export PDF:', err);
    return { success: false, error: err.message || 'PDF export failed' };
  }
}

/**
 * Downloads a data URL as a file.
 */
function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Shares image if Web Share API is available, otherwise downloads directly.
 */
export async function shareOrDownloadJpg(
  dataUrl: string,
  filename: string,
  title: string = 'NADRA Zone-D Larkana Report'
): Promise<boolean> {
  if (navigator.share && navigator.canShare) {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text: `Official NADRA Zone-D Larkana Report: ${filename}`,
          files: [file],
        });
        return true;
      }
    } catch (err) {
      console.warn('Web Share failed, falling back to download:', err);
    }
  }

  // Fallback: direct download
  downloadDataUrl(dataUrl, filename);
  return true;
}

/**
 * Exports data table directly to clean CSV with official NADRA metadata.
 * Contains NO website URLs or dev session parameters.
 */
export function exportToCsv(
  columns: Array<{ key: string; header: string }>,
  rows: Record<string, any>[],
  filename: string = 'NADRA_Report.csv',
  metaTitle: string = 'NADRA Zone-D Larkana Operational Report'
) {
  const lines: string[] = [];

  // Official NADRA Header
  lines.push(`"NATIONAL DATABASE & REGISTRATION AUTHORITY (NADRA) - PAKISTAN"`);
  lines.push(`"${metaTitle.replace(/"/g, '""')}"`);
  lines.push(`"Zone: Larkana (Z050D) | Generated Date: ${new Date().toLocaleDateString('en-GB')}"`);
  lines.push(''); // blank row

  // Table Columns
  const headerRow = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');
  lines.push(headerRow);

  // Data Rows
  rows.forEach((row) => {
    const rowValues = columns.map((col) => {
      let val = row[col.key];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'number') return val;
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    lines.push(rowValues.join(','));
  });

  const csvContent = '\uFEFF' + lines.join('\r\n'); // Add UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadDataUrl(url, cleanFilename);
  URL.revokeObjectURL(url);
}
