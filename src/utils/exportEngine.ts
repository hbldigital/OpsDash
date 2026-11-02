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
  theme?: 'light' | 'dark';
}

/**
 * Downloads a Blob reliably across modern desktop, mobile, and sandboxed iframe environments.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  link.setAttribute('target', '_blank');
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 3000);
}

/**
 * Converts a data URL to a binary Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Canvas-based CSS Color Normalizer to sanitize Tailwind v4 oklch() / color-mix()
let colorCacheCanvas: HTMLCanvasElement | null = null;
let colorCacheCtx: CanvasRenderingContext2D | null = null;

function normalizeCssColor(colorStr: string): string {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'inherit' || colorStr === 'initial') {
    return colorStr;
  }
  if (typeof document === 'undefined') return colorStr;
  if (!colorCacheCanvas) {
    colorCacheCanvas = document.createElement('canvas');
    colorCacheCanvas.width = 1;
    colorCacheCanvas.height = 1;
    colorCacheCtx = colorCacheCanvas.getContext('2d', { willReadFrequently: true });
  }
  if (!colorCacheCtx) return colorStr;

  try {
    colorCacheCtx.fillStyle = '#000000';
    colorCacheCtx.fillStyle = colorStr;
    return colorCacheCtx.fillStyle;
  } catch {
    return '#1e293b';
  }
}

/**
 * Robust canvas rendering: tries html2canvas with full Tailwind v4 CSS sanitization first,
 * then falls back to SVG foreignObject rasterization if html2canvas encounters an unsupported CSS rule.
 */
async function captureElementToCanvas(
  target: HTMLElement,
  bgColor: string,
  scale: number = 2
): Promise<HTMLCanvasElement> {
  // Method 1: html2canvas with sanitized styles
  try {
    const canvas = await html2canvas(target, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: bgColor,
      logging: false,
      ignoreElements: (el) => el.classList.contains('no-export'),
      onclone: (clonedDoc, clonedTarget) => {
        // 1. Strip any URL links and interactive buttons
        clonedDoc.querySelectorAll('a').forEach((l) => l.removeAttribute('href'));
        clonedDoc.querySelectorAll('.no-export').forEach((el) => el.remove());

        // 2. Sanitize all stylesheet definitions in cloned document to remove oklch/color-mix
        clonedDoc.querySelectorAll('style').forEach((styleEl) => {
          if (styleEl.textContent) {
            styleEl.textContent = styleEl.textContent
              .replace(/oklch\([^)]+\)/gi, '#1e293b')
              .replace(/color-mix\([^)]+\)/gi, '#1e293b');
          }
        });

        // 3. Normalize computed colors onto the cloned elements so html2canvas doesn't fail
        if (clonedTarget) {
          (clonedTarget as HTMLElement).style.backgroundColor = bgColor;
          const origEls = target.querySelectorAll('*');
          const cloneEls = clonedTarget.querySelectorAll('*');
          for (let i = 0; i < cloneEls.length; i++) {
            const orig = origEls[i] as HTMLElement;
            const clone = cloneEls[i] as HTMLElement;
            if (!orig || !clone) continue;
            try {
              const comp = window.getComputedStyle(orig);
              if (comp.backgroundColor && comp.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                clone.style.backgroundColor = normalizeCssColor(comp.backgroundColor);
              }
              if (comp.color) {
                clone.style.color = normalizeCssColor(comp.color);
              }
              if (comp.borderColor) {
                clone.style.borderColor = normalizeCssColor(comp.borderColor);
              }
            } catch {
              // Ignore style inspection failures
            }
          }
        }
      },
    });

    return canvas;
  } catch (html2canvasErr) {
    console.warn('html2canvas encountered syntax limitation, attempting SVG foreignObject pipeline:', html2canvasErr);
  }

  // Method 2: SVG ForeignObject fallback
  return rasterizeViaSvgForeignObject(target, scale, bgColor);
}

/**
 * Secondary high-fidelity SVG foreignObject rasterizer
 */
async function rasterizeViaSvgForeignObject(
  element: HTMLElement,
  scale: number = 2,
  bgColor: string = '#ffffff'
): Promise<HTMLCanvasElement> {
  const rect = element.getBoundingClientRect();
  const width = Math.max(rect.width || element.offsetWidth || 1100, 800);
  const height = Math.max(rect.height || element.offsetHeight || 600, 400);

  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.no-export').forEach((el) => el.remove());
  clone.querySelectorAll('a').forEach((a) => a.removeAttribute('href'));

  // Inline critical styles on all nodes
  const origDescendants = element.querySelectorAll('*');
  const cloneDescendants = clone.querySelectorAll('*');
  for (let i = 0; i < cloneDescendants.length; i++) {
    const origEl = origDescendants[i] as HTMLElement;
    const cloneEl = cloneDescendants[i] as HTMLElement;
    if (origEl && cloneEl && origEl.nodeType === 1) {
      try {
        const comp = window.getComputedStyle(origEl);
        cloneEl.style.color = normalizeCssColor(comp.color);
        cloneEl.style.backgroundColor = normalizeCssColor(comp.backgroundColor);
        cloneEl.style.borderColor = normalizeCssColor(comp.borderColor);
        cloneEl.style.fontFamily = comp.fontFamily;
        cloneEl.style.fontSize = comp.fontSize;
        cloneEl.style.fontWeight = comp.fontWeight;
        cloneEl.style.borderWidth = comp.borderWidth;
        cloneEl.style.borderStyle = comp.borderStyle;
        cloneEl.style.padding = comp.padding;
      } catch {}
    }
  }

  const serialized = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="background:${bgColor};width:${width}px;min-height:${height}px;font-family:system-ui,-apple-system,sans-serif;">
        ${serialized}
      </div>
    </foreignObject>
  </svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Method 3: Emergency Canvas Report Card generator
      resolve(generateEmergencyCanvasCard(element, width, height, bgColor, scale));
    };
    img.src = url;
  });
}

/**
 * Method 3: Emergency Vector Canvas generation if DOM cloning is blocked
 */
function generateEmergencyCanvasCard(
  element: HTMLElement,
  width: number,
  height: number,
  bgColor: string,
  scale: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.scale(scale, scale);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Official NADRA Header
  ctx.fillStyle = bgColor === '#ffffff' ? '#0f172a' : '#f8fafc';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText('NATIONAL DATABASE & REGISTRATION AUTHORITY (NADRA) PAKISTAN', 30, 45);

  ctx.fillStyle = '#059669'; // Emerald
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText('Zone-D Larkana (Z050D) — Official Operational Report', 30, 72);

  ctx.fillStyle = bgColor === '#ffffff' ? '#64748b' : '#94a3b8';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`Generated Date: ${new Date().toLocaleDateString('en-GB')} | Executive Operational Record`, 30, 95);

  // Divider
  ctx.strokeStyle = bgColor === '#ffffff' ? '#e2e8f0' : '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, 110);
  ctx.lineTo(width - 30, 110);
  ctx.stroke();

  // Draw element text lines cleanly
  const textLines = element.innerText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.includes('Export') && !l.includes('Download') && !l.includes('Save'));

  let y = 140;
  ctx.font = '13px monospace';
  ctx.fillStyle = bgColor === '#ffffff' ? '#1e293b' : '#cbd5e1';

  for (const line of textLines.slice(0, 40)) {
    if (y > height - 40) break;
    ctx.fillText(line.slice(0, 110), 30, y);
    y += 20;
  }

  return canvas;
}

/**
 * Generates an official NADRA letterhead report canvas at high resolution (2x retina)
 * and exports it as a crisp JPG image.
 * Strips URLs, action controls, and dev chrome.
 */
export async function exportElementToJpg(
  elementIdOrElement: string | HTMLElement,
  options: ExportOptions = {}
): Promise<{ success: boolean; dataUrl?: string; blob?: Blob; error?: string }> {
  try {
    const target =
      typeof elementIdOrElement === 'string'
        ? document.getElementById(elementIdOrElement)
        : elementIdOrElement;

    if (!target) {
      throw new Error(`Target element for export not found.`);
    }

    const isLight = options.theme === 'light' || document.documentElement.classList.contains('light');
    const bgColor = isLight ? '#ffffff' : '#0a111e';

    const canvas = await captureElementToCanvas(target, bgColor, 2);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas to Blob conversion failed'));
        },
        'image/jpeg',
        0.95
      );
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const filename = (options.filename || `NADRA_Report_${Date.now()}`).replace(/\.jpg$/i, '') + '.jpg';

    // Trigger direct Blob download
    downloadBlob(blob, filename);

    return { success: true, dataUrl, blob };
  } catch (err: any) {
    console.error('Failed to export JPG:', err);
    return { success: false, error: err.message || 'Export failed' };
  }
}

/**
 * Exports targeted element as a high-resolution PDF document with official NADRA formatting.
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

    const isLight = options.theme === 'light' || document.documentElement.classList.contains('light');
    const bgColor = isLight ? '#ffffff' : '#0a111e';

    const canvas = await captureElementToCanvas(target, bgColor, 2);

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
      const h = pageHeight - 10;
      const w = (canvas.width * h) / canvas.height;
      pdf.addImage(imgData, 'JPEG', (pageWidth - w) / 2, 5, w, h);
    } else {
      pdf.addImage(imgData, 'JPEG', 5, 5, imgWidth, imgHeight);
    }

    const filename = (options.filename || `NADRA_Report_${Date.now()}`).replace(/\.pdf$/i, '') + '.pdf';

    // Output as Blob and download
    const pdfBlob = pdf.output('blob');
    downloadBlob(pdfBlob, filename);

    return { success: true };
  } catch (err: any) {
    console.error('Failed to export PDF:', err);
    return { success: false, error: err.message || 'PDF export failed' };
  }
}

/**
 * Shares image if Web Share API is available, otherwise triggers download.
 */
export async function shareOrDownloadJpg(
  dataUrlOrBlob: string | Blob,
  filename: string,
  title: string = 'NADRA Zone-D Larkana Report'
): Promise<boolean> {
  let blob: Blob;
  if (typeof dataUrlOrBlob === 'string') {
    blob = dataUrlToBlob(dataUrlOrBlob);
  } else {
    blob = dataUrlOrBlob;
  }

  if (navigator.share && navigator.canShare) {
    try {
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
      console.warn('Web Share failed or cancelled, falling back to download:', err);
    }
  }

  // Fallback: direct download
  downloadBlob(blob, filename);
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
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadBlob(blob, cleanFilename);
}
