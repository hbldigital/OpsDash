export interface ContactDetail {
  id: string;
  label: string; // e.g. "WhatsApp", "Official Call", "Direct Call", "Emergency"
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
  totalStaff: number; // calculated sum
}

export interface Office {
  code: string;
  name: string;
  zoneCode: string; // default "Z050D"
  zoneName: string; // default "Larkana"
  district: string;
  landline?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  incharge?: {
    name: string;
    designation?: string;
    contacts: ContactDetail[];
  };
  assistant?: {
    name: string;
    designation?: string;
    contacts: ContactDetail[];
  };
  staffBreakdown?: StaffBreakdown;
  type: 'NRC' | 'DAU' | 'Executive NRC' | 'MRV';
  isActive: boolean;
  totalCounters?: number;
  dailyCapacity: number;
  // Backward compatibility
  zone?: string;
  expectedStaff?: number;
}

export interface EmployeeAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  officeCode: string;
  officeName: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  category: 'OFFICER' | 'OFFICIAL' | 'SUPPORTING' | 'OUTSOURCE';
  gender: 'MALE' | 'FEMALE';
  checkInTime: string; // e.g. "07:35", "07:50", "08:15"
  status: 'ON_TIME' | 'LATE_745' | 'LATE_800' | 'ABSENT' | 'LEAVE';
  notes?: string;
  source: 'MANUAL' | 'BIOMETRIC_OCR' | 'SYSTEM';
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  officeCode?: string;
  zoneCode: string;
  isActive: boolean;
}

export interface DailyReport {
  id: string;
  reportingDate: string;
  zoneCode: string;
  officeCode: string;
  officeName: string;
  reportingStatus: 'Submitted' | 'Verified' | 'Discrepancy' | 'Draft';

  // Attendance
  totalEmployees: number;
  lateAfter745: number;
  lateAfter800: number;
  onTimeEmployees: number;

  // Q-Matic
  qmaticIssued: number;
  qmaticProcessed: number;
  qmaticRemaining: number;
  qmaticPercentage: number | null;

  // OneApp
  oneAppIssued: number;
  oneAppProcessed: number;
  oneAppSkipped: number;
  oneAppRemaining: number;
  oneAppReconciliationPercentage: number | null;

  // Approved OneApp
  approvedOneApp: number;
  previousDayApproved: number;

  // Facial Recognition
  diminishedFingerprintsMBVS: number;
  proofOfLife: number;

  // Pak-ID
  pakidApproved: number;
  pakidDeferred: number;
  pakidCorrection: number;

  // Metadata
  hasDiscrepancy: boolean;
  discrepancyDetails?: string;
  sourceType: 'MANUAL' | 'OCR_EXTRACTED' | 'IMPORT_BATCH';
  sourceImageUrl?: string;
  submittedBy: string;
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ZoneSummary {
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

export interface ValidationIssue {
  id: string;
  reportingDate: string;
  officeCode: string;
  officeName: string;
  issueType: string;
  severity: 'WARNING' | 'ERROR' | 'INFO';
  message: string;
  status: 'UNRESOLVED' | 'RESOLVED';
  resolutionReason?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  category: string;
  details: string;
  ipAddress?: string;
}

export interface AppSettings {
  zoneCode: string;
  zoneName: string;
  reportingThreshold745: string;
  reportingThreshold800: string;
  thresholdTime1?: string;
  thresholdTime2?: string;
  timezone: string;
  organizationName?: string;
  minOcrConfidence: number;
  ocrProvider: string;
  demoMode: boolean;
  customTexts?: Record<string, string>;
}

export type NavView =
  | 'overview'
  | 'office_performance'
  | 'attendance'
  | 'qmatic'
  | 'oneapp_booking'
  | 'approved_oneapp'
  | 'facial_certificates'
  | 'pakid'
  | 'upload_ocr'
  | 'daily_reports'
  | 'historical_analytics'
  | 'data_quality'
  | 'user_management'
  | 'office_management'
  | 'audit_logs'
  | 'settings';
