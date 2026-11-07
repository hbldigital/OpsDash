/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ZONE_ADMIN'
  | 'REPORTING_ADMIN'
  | 'DATA_ENTRY_OPERATOR'
  | 'VERIFICATION_OFFICER'
  | 'AUDITOR'
  | 'VIEWER';

export interface UserPermissions {
  canViewDashboard: boolean;
  canEditOffices: boolean;
  canAddOffices: boolean;
  canDeleteOffices: boolean;
  canUploadOcr: boolean;
  canModifyAttendance: boolean;
  canExportReports: boolean;
  canManageUsers: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  zone: string;
  assignedOfficeCode?: string; // If restricted to specific office
  permissions?: UserPermissions;
}

export interface ContactDetail {
  id: string;
  label: string;
  number: string;
  type: 'whatsapp' | 'call' | 'both' | 'landline';
}

export interface StaffBreakdown {
  officersMale: number;
  officersFemale: number;
  officialsMale: number;
  officialsFemale: number;
  supportingMale: number;
  supportingFemale: number;
  outsourceMale: number;
  outsourceFemale: number;
  totalStaff: number;
}

export interface LeadershipTenureRecord {
  id: string;
  role: 'OIC' | '2IC' | 'OA';
  roleTitle: string; // e.g. "Office Incharge (OIC)", "Second Incharge (2IC)", "Office Assistant (OA)"
  name: string;
  designation: string;
  grade?: string;
  tasks?: string;
  contact?: string;
  whatsappNumber?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD or empty
  isCurrent: boolean;
  tenureDuration?: string;
  transferOrderNo?: string;
  remarks?: string;
}

export interface Office {
  id?: string;
  code: string;
  name: string;
  shift?: 'Morning' | 'Evening' | 'Regular' | string;
  district: string;
  zone?: string;
  zoneName?: string;
  zoneCode?: string;
  type: 'NRC' | 'DAU' | 'MRV' | 'EXECUTIVE' | 'Executive NRC' | 'Executive' | 'NRC Counter' | string;
  isActive: boolean;
  totalCounters: number;
  expectedStaff: number;
  dailyCapacity?: number;
  landline?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  incharge?: {
    name: string;
    designation?: string;
    grade?: string;
    startDate?: string;
    contacts: ContactDetail[];
  };
  secondIncharge?: {
    name: string;
    designation?: string;
    grade?: string;
    startDate?: string;
    contacts: ContactDetail[];
  };
  assistant?: {
    name: string;
    designation?: string;
    grade?: string;
    responsibilities?: string;
    mobileNumber?: string;
    whatsappNumber?: string;
    startDate?: string;
    contacts: ContactDetail[];
  };
  leadershipHistory?: LeadershipTenureRecord[];
  staffBreakdown?: StaffBreakdown;

  // Infrastructure & Administrative Details
  buildingStatus?: 'Gratis' | 'Rented' | 'NADRA Owned' | string;
  monthlyRentPKR?: number;
  operationalDate?: string;
  currentBuildingOperationalDate?: string;
  shiftsCount?: number;
  coveredAreaSqFt?: number;
  buildingCondition?: 'Poor' | 'Satisfactory' | 'Good' | 'Excellent' | string;
  loadSheddingHours?: number;
  loadSheddingMinutes?: number;
  generatorKVA?: string;
  upsKVA?: string;
  fleetCardStatus?: 'Available' | 'Not Available' | string;
  fleetCardLastDigits?: string;
  fleetCardReceiveDate?: string;
  fleetCardUnavailableReason?: string;
  publicFacilities?: string[];
  parkingType?: string;

  // Staff Table (Authorized vs Currently Held)
  authorizedOfficers?: number;
  heldOfficers?: number;
  authorizedOfficials?: number;
  heldOfficials?: number;
  authorizedSupportive?: number;
  heldSupportive?: number;
  authorizedOutsource?: number;
  heldOutsource?: number;

  // Performance Analytics
  dailyAvgTokens?: number;
  peakTokens?: number;
  peakTokensDate?: string;
  lowestTokens?: number;
  lowestTokensDate?: string;
  latestTokens?: number;
  avgTokensPerDEO?: number;
  lastMonthTokensTotal?: number;
  currentMonthTokensTotal?: number;
  lastYearDailyAvgTokens?: number;
}

export interface PostingHistoryEntry {
  id: string;
  fromLocation: string;
  toLocation: string;
  startDate: string;
  endDate: string;
  transferOrderNo: string;
  attachmentName?: string;
  remarks?: string;
}

export interface EmployeeProfile {
  id: string;
  erpNumber: string;
  name: string;
  fatherName: string;
  cnic: string;
  designation: string;
  department: string;
  workingSeat: string;
  dateOfAppointment: string;
  dateOfPostingCurrentLocation: string;
  photoUrl?: string;
  passportStatus: 'Yes' | 'No';
  passportNumber?: string;
  passportIssuanceDate?: string;
  passportExpiryDate?: string;
  officialEmail?: string;
  officialNumber?: string;
  eOfficeUsername?: string;
  neoUser?: string;
  jobType: 'Permanent' | 'Contractual' | 'Deputation' | 'Daily Wages' | 'Outsource' | string;
  grade: string;
  contactNumber: string;
  whatsappNumber: string;
  permanentAddress: string;
  currentAddress: string;
  domicileDistrict: string;
  domicileProvince: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  religion: string;
  sect: string;
  maritalStatus: 'Single' | 'Married' | 'Widowed' | 'Divorced' | string;
  disability: 'No' | 'Yes';
  disabilityType?: string;
  qualificationDegree: string;
  qualificationYears: string;
  postingHistory: PostingHistoryEntry[];
  officeCode: string;
  officeName: string;
  punctualityScore?: number;
  punctualityRank?: 'A+' | 'A' | 'B' | 'C';
  totalLateCount?: number;
  totalLeavesCount?: number;
  isExcessiveLeaves?: boolean;
}

export interface EmployeeAttendanceRecord {
  id: string;
  date: string;
  officeCode: string;
  officeName: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  category: 'OFFICER' | 'OFFICIAL' | 'SUPPORTING' | 'OUTSOURCE';
  gender: 'MALE' | 'FEMALE';
  checkInTime: string;
  status: 'ON_TIME' | 'LATE_745' | 'LATE_800' | 'ABSENT' | 'LEAVE';
  notes?: string;
  source: 'MANUAL' | 'BIOMETRIC_OCR' | 'SYSTEM';
}

export interface OfficeDailyReport {
  id: string;
  date: string; // YYYY-MM-DD
  zone: string;
  officeCode: string;
  officeName: string;
  shift?: string;
  reportingStatus: 'REPORTED' | 'PENDING' | 'CORRECTED';
  submissionTime?: string;
  submittedBy?: string;
  verifiedBy?: string;

  // Attendance
  totalEmployees: number;
  lateAfter745: number;
  lateAfter800: number;
  onTimeEmployees: number;

  // Q-Matic
  qmaticIssued: number;
  qmaticProcessed: number;
  qmaticRemaining: number;
  qmaticPercentage: number | null; // null represents N/A

  // OneApp
  oneappIssued: number;
  oneappProcessed: number;
  oneappSkipped: number;
  oneappRemaining: number;
  oneappReconciliationPercentage: number | null; // null represents N/A

  // Approved OneApp
  approvedOneApp: number;
  prevDayApprovedOneApp?: number;
  approvedDifference?: number;

  // Facial Recognition
  diminishedFingerprintsMBVS: number;
  proofOfLifeCertificates: number;

  // Pak-ID
  pakidApproved: number;
  pakidDeferred: number;
  pakidCorrection: number;

  // Audit / Source
  sourceUploadId?: string;
  ocrConfidence?: number;
  notes?: string;
  hasDiscrepancy: boolean;
  discrepancies: string[];
}

export interface ZoneSummaryMetrics {
  date: string;
  zone: string;
  totalActiveOffices: number;
  officesReported: number;
  officesMissing: number;
  coveragePercentage: number;

  // Attendance Totals
  totalEmployees: number;
  totalLateAfter745: number;
  totalLateAfter800: number;
  totalOnTimeEmployees: number;

  // Q-Matic Totals
  totalQmaticIssued: number;
  totalQmaticProcessed: number;
  totalQmaticRemaining: number;
  zoneQmaticPercentage: number | null;

  // OneApp Totals
  totalOneappIssued: number;
  totalOneappProcessed: number;
  totalOneappSkipped: number;
  totalOneappRemaining: number;
  zoneOneappReconciliationPercentage: number | null;

  // Applications & Approvals
  totalApprovedOneApp: number;
  prevDayTotalApprovedOneApp: number;
  totalDiminishedMBVS: number;
  totalProofOfLife: number;

  // Pak-ID
  totalPakidApproved: number;
  totalPakidDeferred: number;
  totalPakidCorrection: number;

  // Discrepancy counts
  totalDiscrepantOffices: number;
}

export interface OcrExtractedCell<T = number | string> {
  value: T;
  rawText: string;
  confidence: number; // 0.0 - 1.0
  isModified?: boolean;
}

export interface OcrExtractedRow {
  rowId: string;
  matchedOfficeCode: string;
  matchedOfficeName: string;
  confidence: number;
  status: 'HIGH_CONFIDENCE' | 'REQUIRES_REVIEW' | 'VERIFIED' | 'UNRESOLVED';
  values: {
    officeCode: OcrExtractedCell<string>;
    officeName: OcrExtractedCell<string>;
    totalEmployees: OcrExtractedCell<number>;
    lateAfter745: OcrExtractedCell<number>;
    lateAfter800: OcrExtractedCell<number>;
    qmaticIssued: OcrExtractedCell<number>;
    qmaticProcessed: OcrExtractedCell<number>;
    oneappIssued: OcrExtractedCell<number>;
    oneappProcessed: OcrExtractedCell<number>;
    oneappSkipped: OcrExtractedCell<number>;
    approvedOneApp: OcrExtractedCell<number>;
    diminishedFingerprintsMBVS: OcrExtractedCell<number>;
    proofOfLifeCertificates: OcrExtractedCell<number>;
    pakidApproved: OcrExtractedCell<number>;
    pakidDeferred: OcrExtractedCell<number>;
    pakidCorrection: OcrExtractedCell<number>;
  };
  warnings: string[];
}

export interface OcrJobResult {
  jobId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  detectedTitle: string;
  detectedZone: string;
  detectedDate: string;
  totalRowsDetected: number;
  confidenceScore: number;
  sourceTotals?: {
    totalEmployees?: number;
    qmaticIssued?: number;
    qmaticProcessed?: number;
    oneappIssued?: number;
    oneappProcessed?: number;
    oneappSkipped?: number;
    approvedOneApp?: number;
    diminishedFingerprintsMBVS?: number;
    proofOfLifeCertificates?: number;
    pakidApproved?: number;
  };
  extractedRows: OcrExtractedRow[];
  validationErrors: string[];
  isDuplicateDetected: boolean;
  existingReportDate?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'UPLOAD_REPORT'
    | 'EXECUTE_OCR'
    | 'CONFIRM_IMPORT'
    | 'EDIT_RECORD'
    | 'CORRECT_REPORT'
    | 'EXPORT_DATA'
    | 'CONFIG_CHANGE'
    | 'RESOLVE_DISCREPANCY';
  details: string;
  reportingDate?: string;
  officeCode?: string;
  ipAddress?: string;
}

export interface DataQualityIssue {
  id: string;
  date: string;
  officeCode: string;
  officeName: string;
  issueType:
    | 'MISSING_REPORT'
    | 'QMATIC_PROCESSED_EXCEEDS_ISSUED'
    | 'ONEAPP_UNRECONCILED'
    | 'ONEAPP_OVERCOUNT'
    | 'ATTENDANCE_ANOMALY'
    | 'UNEXPECTED_VARIANCE'
    | 'SOURCE_TOTAL_MISMATCH';
  severity: 'CRITICAL' | 'WARNING' | 'NOTICE';
  description: string;
  suggestedAction: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface AppSettings {
  zoneName: string;
  zoneCode?: string;
  organizationName: string;
  thresholdTime1: string; // '07:45:00'
  thresholdTime2: string; // '08:00:00'
  timeZone: string; // 'Asia/Karachi'
  ocrConfidenceThresholdHigh: number; // 0.85
  ocrConfidenceThresholdMedium: number; // 0.65
  allowOvercountingCorrection: boolean;
  enableAuditLogging: boolean;
  customTexts?: Record<string, string>;
}
