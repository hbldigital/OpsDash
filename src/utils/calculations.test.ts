import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateQMatic,
  calculateOneApp,
  calculateAttendance,
  aggregateZone,
} from './calculations';

test('QMatic calculation: standard valid case', () => {
  const result = calculateQMatic(200, 180);
  assert.equal(result.percentage, 90.0);
  assert.equal(result.remaining, 20);
  assert.equal(result.hasDiscrepancy, false);
});

test('QMatic calculation: zero issued and zero processed produces N/A (null)', () => {
  const result = calculateQMatic(0, 0);
  assert.equal(result.percentage, null);
  assert.equal(result.remaining, 0);
  assert.equal(result.hasDiscrepancy, false);
});

test('QMatic calculation: zero issued but positive processed flags reconciliation error', () => {
  const result = calculateQMatic(0, 15);
  assert.equal(result.percentage, null);
  assert.equal(result.remaining, -15);
  assert.equal(result.hasDiscrepancy, true);
  assert.match(result.error || '', /Reconciliation Error/);
});

test('QMatic calculation: processed exceeds issued flags discrepancy', () => {
  const result = calculateQMatic(50, 60);
  assert.equal(result.percentage, 120.0);
  assert.equal(result.remaining, -10);
  assert.equal(result.hasDiscrepancy, true);
});

test('OneApp reconciliation: 100% reconciliation (85 processed + 15 skipped of 100 issued)', () => {
  const result = calculateOneApp(100, 85, 15);
  assert.equal(result.percentage, 100.0);
  assert.equal(result.remaining, 0);
  assert.equal(result.hasDiscrepancy, false);
});

test('OneApp reconciliation: 90% reconciliation (80 processed + 10 skipped of 100 issued, 10 unaccounted)', () => {
  const result = calculateOneApp(100, 80, 10);
  assert.equal(result.percentage, 90.0);
  assert.equal(result.remaining, 10);
  assert.equal(result.hasDiscrepancy, false);
});

test('OneApp reconciliation: zero issued and zero outcomes produces null (N/A)', () => {
  const result = calculateOneApp(0, 0, 0);
  assert.equal(result.percentage, null);
  assert.equal(result.remaining, 0);
  assert.equal(result.hasDiscrepancy, false);
});

test('OneApp reconciliation: processed + skipped exceeding issued flags discrepancy', () => {
  const result = calculateOneApp(100, 90, 20);
  assert.equal(result.percentage, 110.0);
  assert.equal(result.remaining, -10);
  assert.equal(result.hasDiscrepancy, true);
});

test('Attendance calculation: late after 08:00 AM is subset of late after 07:45 AM', () => {
  // 30 total employees, 10 arrived after 7:45, 4 arrived after 8:00.
  // On-time = 30 - 10 = 20.
  const result = calculateAttendance(30, 10, 4);
  assert.equal(result.onTime, 20);
  assert.equal(result.hasDiscrepancy, false);
});

test('Attendance calculation: late after 08:00 AM exceeding late after 07:45 AM flags error', () => {
  const result = calculateAttendance(30, 5, 8);
  assert.equal(result.hasDiscrepancy, true);
  assert.match(result.error || '', /cannot exceed/);
});

test('Attendance calculation: late exceeding total employees flags error', () => {
  const result = calculateAttendance(20, 25, 10);
  assert.equal(result.hasDiscrepancy, true);
});

test('Zone aggregation: sums counts directly, calculates rate from totals, never averages percentages', () => {
  // Office 1: 10 issued, 10 processed -> 100%
  // Office 2: 90 issued, 45 processed -> 50%
  // Average of percentages would be (100 + 50) / 2 = 75%.
  // TRUE rate: Total issued = 100, total processed = 55 -> 55.0%!
  const office1 = {
    totalEmployees: 10,
    lateAfter745: 2,
    lateAfter800: 1,
    qmaticIssued: 10,
    qmaticProcessed: 10,
    oneAppIssued: 10,
    oneAppProcessed: 9,
    oneAppSkipped: 1,
    approvedOneApp: 8,
    diminishedFingerprintsMBVS: 1,
    proofOfLife: 2,
    pakidApproved: 5,
    pakidDeferred: 1,
    pakidCorrection: 0,
  };

  const office2 = {
    totalEmployees: 20,
    lateAfter745: 5,
    lateAfter800: 2,
    qmaticIssued: 90,
    qmaticProcessed: 45,
    oneAppIssued: 90,
    oneAppProcessed: 70,
    oneAppSkipped: 10,
    approvedOneApp: 60,
    diminishedFingerprintsMBVS: 4,
    proofOfLife: 5,
    pakidApproved: 40,
    pakidDeferred: 8,
    pakidCorrection: 2,
  };

  const zone = aggregateZone(2, [office1, office2]);
  assert.equal(zone.qmaticIssued, 100);
  assert.equal(zone.qmaticProcessed, 55);
  assert.equal(zone.qmaticPercentage, 55.0); // NOT 75.0%
  assert.equal(zone.oneAppIssued, 100);
  assert.equal(zone.oneAppProcessed, 79);
  assert.equal(zone.oneAppSkipped, 11);
  assert.equal(zone.oneAppReconciliationPercentage, 90.0);
  assert.equal(zone.coveragePercentage, 100.0);
  assert.equal(zone.reportedOfficesCount, 2);
  assert.equal(zone.missingOfficesCount, 0);
  assert.equal(zone.totalEmployees, 30);
  assert.equal(zone.lateAfter745, 7);
  assert.equal(zone.lateAfter800, 3);
  assert.equal(zone.onTimeEmployees, 23);
});
