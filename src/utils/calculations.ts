/**
 * Core business calculations for NADRA Zone-D Larkana Daily Operations Dashboard
 * Enforces strict government reporting rules and reconciliation standards.
 */

export interface DailyMetrics {
  totalEmployees: number;
  lateAfter745: number;
  lateAfter800: number;
  qmaticIssued: number;
  qmaticProcessed: number;
  oneAppIssued: number;
  oneAppProcessed: number;
  oneAppSkipped: number;
  approvedOneApp: number;
  diminishedFingerprintsMBVS: number;
  proofOfLife: number;
  pakidApproved: number;
  pakidDeferred: number;
  pakidCorrection: number;
}

export interface CalculationResult {
  // Q-Matic
  qmaticPercentage: number | null; // null represents N/A
  qmaticRemaining: number;
  qmaticHasDiscrepancy: boolean;
  qmaticDiscrepancyReason?: string;

  // OneApp
  oneAppReconciliationPercentage: number | null; // null represents N/A
  oneAppRemaining: number;
  oneAppHasDiscrepancy: boolean;
  oneAppDiscrepancyReason?: string;

  // Attendance
  onTimeEmployees: number;
  attendanceHasDiscrepancy: boolean;
  attendanceDiscrepancyReason?: string;
}

/**
 * Calculates Q-Matic processing rate and checks for discrepancies.
 * Rule:
 * - If issued is 0 and processed is 0 -> percentage is null (N/A).
 * - If issued is 0 and processed > 0 -> flag reconciliation error.
 * - If processed > issued -> flag discrepancy.
 * - Remaining = issued - processed.
 */
export function calculateQMatic(issued: number, processed: number): {
  percentage: number | null;
  remaining: number;
  hasDiscrepancy: boolean;
  error?: string;
} {
  const remaining = issued - processed;

  if (issued === 0 && processed === 0) {
    return {
      percentage: null,
      remaining: 0,
      hasDiscrepancy: false,
    };
  }

  if (issued === 0 && processed > 0) {
    return {
      percentage: null,
      remaining,
      hasDiscrepancy: true,
      error: `Reconciliation Error: ${processed} Q-Matic tokens were processed, but 0 were issued.`,
    };
  }

  if (processed > issued) {
    const rawRate = Number(((processed / issued) * 100).toFixed(2));
    return {
      percentage: rawRate,
      remaining,
      hasDiscrepancy: true,
      error: `Discrepancy: Processed tokens (${processed}) exceed issued tokens (${issued}).`,
    };
  }

  const percentage = Number(((processed / issued) * 100).toFixed(2));
  return {
    percentage,
    remaining,
    hasDiscrepancy: false,
  };
}

/**
 * Calculates OneApp reconciliation percentage and accounted vs unaccounted TIDs.
 * Formula: ((Processed + Skipped) / Issued) * 100
 * Remaining = Issued - Processed - Skipped
 *
 * Rules:
 * - If issued === 0 and both outcomes === 0 -> null (N/A).
 * - If processed + skipped > issued -> discrepancy.
 * - If remaining > 0 -> unaccounted TIDs present.
 */
export function calculateOneApp(issued: number, processed: number, skipped: number): {
  percentage: number | null;
  remaining: number;
  hasDiscrepancy: boolean;
  error?: string;
} {
  const accounted = processed + skipped;
  const remaining = issued - accounted;

  if (issued === 0 && processed === 0 && skipped === 0) {
    return {
      percentage: null,
      remaining: 0,
      hasDiscrepancy: false,
    };
  }

  if (issued === 0 && accounted > 0) {
    return {
      percentage: null,
      remaining,
      hasDiscrepancy: true,
      error: `Reconciliation Error: ${accounted} OneApp TIDs handled (${processed} processed, ${skipped} skipped), but 0 issued.`,
    };
  }

  const percentage = Number(((accounted / issued) * 100).toFixed(2));

  if (accounted > issued) {
    return {
      percentage,
      remaining,
      hasDiscrepancy: true,
      error: `Discrepancy: Accounted TIDs (${accounted} = ${processed} processed + ${skipped} skipped) exceed issued (${issued}).`,
    };
  }

  return {
    percentage,
    remaining,
    hasDiscrepancy: false,
  };
}

/**
 * Attendance calculation rules:
 * - Reporting thresholds: 07:45 AM and 08:00 AM.
 * - Employees arriving after 08:00 AM are a subset of those arriving after 07:45 AM.
 * - Therefore lateAfter800 <= lateAfter745 <= totalEmployees.
 * - On-time count = totalEmployees - lateAfter745.
 */
export function calculateAttendance(
  totalEmployees: number,
  lateAfter745: number,
  lateAfter800: number
): {
  onTime: number;
  hasDiscrepancy: boolean;
  error?: string;
} {
  if (lateAfter800 > lateAfter745) {
    return {
      onTime: Math.max(0, totalEmployees - lateAfter745),
      hasDiscrepancy: true,
      error: `Attendance Error: Employees arriving after 08:00 AM (${lateAfter800}) cannot exceed employees arriving after 07:45 AM (${lateAfter745}).`,
    };
  }

  if (lateAfter745 > totalEmployees) {
    return {
      onTime: 0,
      hasDiscrepancy: true,
      error: `Attendance Error: Late arrivals (${lateAfter745}) cannot exceed total employees reported (${totalEmployees}).`,
    };
  }

  return {
    onTime: totalEmployees - lateAfter745,
    hasDiscrepancy: false,
  };
}

export interface ZoneAggregationTotals {
  activeOfficesCount: number;
  reportedOfficesCount: number;
  missingOfficesCount: number;
  coveragePercentage: number;

  totalEmployees: number;
  lateAfter745: number;
  lateAfter800: number;
  onTimeEmployees: number;

  qmaticIssued: number;
  qmaticProcessed: number;
  qmaticRemaining: number;
  qmaticPercentage: number | null;

  oneAppIssued: number;
  oneAppProcessed: number;
  oneAppSkipped: number;
  oneAppRemaining: number;
  oneAppReconciliationPercentage: number | null;

  approvedOneApp: number;
  diminishedFingerprintsMBVS: number;
  proofOfLife: number;

  pakidApproved: number;
  pakidDeferred: number;
  pakidCorrection: number;

  discrepancyCount: number;
}

/**
 * Aggregates zone totals strictly from underlying office counts.
 * CRITICAL RULE: Zone-wide percentages are NEVER calculated by averaging individual office percentages.
 * They are computed using the sum of the relevant counts across reporting offices.
 */
export function aggregateZone(
  activeOfficesCount: number,
  officeReports: Array<DailyMetrics & { hasDiscrepancy?: boolean }>
): ZoneAggregationTotals {
  const reportedOfficesCount = officeReports.length;
  const missingOfficesCount = Math.max(0, activeOfficesCount - reportedOfficesCount);
  const coveragePercentage =
    activeOfficesCount > 0
      ? Number(((reportedOfficesCount / activeOfficesCount) * 100).toFixed(2))
      : 0;

  let totalEmployees = 0;
  let lateAfter745 = 0;
  let lateAfter800 = 0;
  let qmaticIssued = 0;
  let qmaticProcessed = 0;
  let oneAppIssued = 0;
  let oneAppProcessed = 0;
  let oneAppSkipped = 0;
  let approvedOneApp = 0;
  let diminishedFingerprintsMBVS = 0;
  let proofOfLife = 0;
  let pakidApproved = 0;
  let pakidDeferred = 0;
  let pakidCorrection = 0;
  let discrepancyCount = 0;

  for (const r of officeReports) {
    totalEmployees += r.totalEmployees || 0;
    lateAfter745 += r.lateAfter745 || 0;
    lateAfter800 += r.lateAfter800 || 0;
    qmaticIssued += r.qmaticIssued || 0;
    qmaticProcessed += r.qmaticProcessed || 0;
    oneAppIssued += r.oneAppIssued || 0;
    oneAppProcessed += r.oneAppProcessed || 0;
    oneAppSkipped += r.oneAppSkipped || 0;
    approvedOneApp += r.approvedOneApp || 0;
    diminishedFingerprintsMBVS += r.diminishedFingerprintsMBVS || 0;
    proofOfLife += r.proofOfLife || 0;
    pakidApproved += r.pakidApproved || 0;
    pakidDeferred += r.pakidDeferred || 0;
    pakidCorrection += r.pakidCorrection || 0;
    if (r.hasDiscrepancy) discrepancyCount++;
  }

  const qmaticCalc = calculateQMatic(qmaticIssued, qmaticProcessed);
  const oneAppCalc = calculateOneApp(oneAppIssued, oneAppProcessed, oneAppSkipped);
  const attendanceCalc = calculateAttendance(totalEmployees, lateAfter745, lateAfter800);

  if (qmaticCalc.hasDiscrepancy) discrepancyCount++;
  if (oneAppCalc.hasDiscrepancy) discrepancyCount++;
  if (attendanceCalc.hasDiscrepancy) discrepancyCount++;

  return {
    activeOfficesCount,
    reportedOfficesCount,
    missingOfficesCount,
    coveragePercentage,

    totalEmployees,
    lateAfter745,
    lateAfter800,
    onTimeEmployees: attendanceCalc.onTime,

    qmaticIssued,
    qmaticProcessed,
    qmaticRemaining: qmaticCalc.remaining,
    qmaticPercentage: qmaticCalc.percentage,

    oneAppIssued,
    oneAppProcessed,
    oneAppSkipped,
    oneAppRemaining: oneAppCalc.remaining,
    oneAppReconciliationPercentage: oneAppCalc.percentage,

    approvedOneApp,
    diminishedFingerprintsMBVS,
    proofOfLife,

    pakidApproved,
    pakidDeferred,
    pakidCorrection,

    discrepancyCount,
  };
}

export function formatPercentage(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) {
    return 'N/A';
  }
  return `${val.toFixed(2)}%`;
}

export function validateReportRow(row: Partial<DailyMetrics & { officeCode?: string }>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!row.officeCode) {
    errors.push('Office code is mandatory.');
  }

  if (row.totalEmployees !== undefined && row.totalEmployees < 0) {
    errors.push('Total employees cannot be negative.');
  }

  if (row.lateAfter745 !== undefined && row.lateAfter800 !== undefined) {
    if (row.lateAfter800 > row.lateAfter745) {
      errors.push(`Late after 08:00 (${row.lateAfter800}) exceeds Late after 07:45 (${row.lateAfter745}).`);
    }
    if (row.totalEmployees !== undefined && row.lateAfter745 > row.totalEmployees) {
      errors.push(`Late after 07:45 (${row.lateAfter745}) exceeds total staff (${row.totalEmployees}).`);
    }
  }

  if (row.qmaticIssued !== undefined && row.qmaticProcessed !== undefined) {
    if (row.qmaticIssued < 0 || row.qmaticProcessed < 0) {
      errors.push('Q-Matic counts cannot be negative.');
    }
    if (row.qmaticIssued === 0 && row.qmaticProcessed > 0) {
      errors.push(`Q-Matic processed is ${row.qmaticProcessed} but issued is 0.`);
    } else if (row.qmaticProcessed > row.qmaticIssued) {
      warnings.push(`Q-Matic processed (${row.qmaticProcessed}) exceeds issued (${row.qmaticIssued}).`);
    }
  }

  if (row.oneAppIssued !== undefined && row.oneAppProcessed !== undefined && row.oneAppSkipped !== undefined) {
    if (row.oneAppIssued < 0 || row.oneAppProcessed < 0 || row.oneAppSkipped < 0) {
      errors.push('OneApp counts cannot be negative.');
    }
    const handled = row.oneAppProcessed + row.oneAppSkipped;
    if (handled > row.oneAppIssued) {
      warnings.push(`OneApp Processed + Skipped (${handled}) exceeds Issued (${row.oneAppIssued}).`);
    } else if (row.oneAppIssued > 0 && handled < row.oneAppIssued) {
      const remaining = row.oneAppIssued - handled;
      warnings.push(`${remaining} OneApp TIDs remain unaccounted for.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Aliases for compatibility
export const calcQMaticMetrics = (issued: number, processed: number) => {
  const res = calculateQMatic(issued, processed);
  return {
    remaining: res.remaining,
    percentage: res.percentage,
    hasDiscrepancy: res.hasDiscrepancy,
    discrepancyMessage: res.error,
  };
};

export const calcOneAppMetrics = (issued: number, processed: number, skipped: number) => {
  const res = calculateOneApp(issued, processed, skipped);
  return {
    handled: processed + skipped,
    remaining: res.remaining,
    reconciliationPercentage: res.percentage,
    hasDiscrepancy: res.hasDiscrepancy,
    discrepancyMessage: res.error,
    isFullyReconciled: res.remaining === 0 && res.percentage === 100,
  };
};

export const calcAttendanceMetrics = (total: number, late745: number, late800: number) => {
  const res = calculateAttendance(total, late745, late800);
  return {
    onTimeEmployees: res.onTime,
    hasDiscrepancy: res.hasDiscrepancy,
    discrepancyMessage: res.error,
  };
};

export const aggregateZoneMetrics = (
  date: string,
  zone: string,
  totalActiveOffices: number,
  reports: any[]
) => {
  const mapped = reports.map((r) => ({
    totalEmployees: r.totalEmployees || 0,
    lateAfter745: r.lateAfter745 || 0,
    lateAfter800: r.lateAfter800 || 0,
    qmaticIssued: r.qmaticIssued || 0,
    qmaticProcessed: r.qmaticProcessed || 0,
    oneAppIssued: r.oneAppIssued ?? r.oneappIssued ?? 0,
    oneAppProcessed: r.oneAppProcessed ?? r.oneappProcessed ?? 0,
    oneAppSkipped: r.oneAppSkipped ?? r.oneappSkipped ?? 0,
    approvedOneApp: r.approvedOneApp || 0,
    diminishedFingerprintsMBVS: r.diminishedFingerprintsMBVS || 0,
    proofOfLife: r.proofOfLife ?? r.proofOfLifeCertificates ?? 0,
    pakidApproved: r.pakidApproved || 0,
    pakidDeferred: r.pakidDeferred || 0,
    pakidCorrection: r.pakidCorrection || 0,
    hasDiscrepancy: r.hasDiscrepancy || false,
  }));

  const aggregated = aggregateZone(totalActiveOffices, mapped);

  return {
    date,
    zone,
    totalActiveOffices: aggregated.activeOfficesCount,
    officesReported: aggregated.reportedOfficesCount,
    officesMissing: aggregated.missingOfficesCount,
    coveragePercentage: aggregated.coveragePercentage,

    totalEmployees: aggregated.totalEmployees,
    totalLateAfter745: aggregated.lateAfter745,
    totalLateAfter800: aggregated.lateAfter800,
    totalOnTimeEmployees: aggregated.onTimeEmployees,

    totalQmaticIssued: aggregated.qmaticIssued,
    totalQmaticProcessed: aggregated.qmaticProcessed,
    totalQmaticRemaining: aggregated.qmaticRemaining,
    zoneQmaticPercentage: aggregated.qmaticPercentage,

    totalOneappIssued: aggregated.oneAppIssued,
    totalOneappProcessed: aggregated.oneAppProcessed,
    totalOneappSkipped: aggregated.oneAppSkipped,
    totalOneappRemaining: aggregated.oneAppRemaining,
    zoneOneappReconciliationPercentage: aggregated.oneAppReconciliationPercentage,

    totalApprovedOneApp: aggregated.approvedOneApp,
    prevDayTotalApprovedOneApp: 0,
    totalDiminishedMBVS: aggregated.diminishedFingerprintsMBVS,
    totalProofOfLife: aggregated.proofOfLife,

    totalPakidApproved: aggregated.pakidApproved,
    totalPakidDeferred: aggregated.pakidDeferred,
    totalPakidCorrection: aggregated.pakidCorrection,

    totalDiscrepantOffices: aggregated.discrepancyCount,
  };
};

