/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import {
  Office,
  OfficeDailyReport,
  UserProfile,
  AuditLogEntry,
  DataQualityIssue,
  AppSettings,
  EmployeeAttendanceRecord,
  ContactDetail,
  StaffBreakdown,
} from '../src/types/dashboard';
import {
  calculateQMatic,
  calculateOneApp,
  calculateAttendance,
  aggregateZone,
} from '../src/utils/calculations';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'nadra_operational_db.json');

export interface DatabaseState {
  users: UserProfile[];
  offices: Office[];
  dailyReports: OfficeDailyReport[];
  dataQualityIssues: DataQualityIssue[];
  auditLogs: AuditLogEntry[];
  settings: AppSettings;
  attendanceRecords: EmployeeAttendanceRecord[];
}

const DEFAULT_SETTINGS: AppSettings = {
  zoneName: 'Larkana',
  zoneCode: 'Z050D',
  organizationName: 'National Database and Registration Authority (NADRA)',
  thresholdTime1: '07:45',
  thresholdTime2: '08:00',
  timeZone: 'Asia/Karachi',
  ocrConfidenceThresholdHigh: 0.85,
  ocrConfidenceThresholdMedium: 0.65,
  allowOvercountingCorrection: true,
  enableAuditLogging: true,
  customTexts: {
    appHeaderTitle: 'NADRA Zone-D Larkana Operational Intelligence',
    appHeaderSubtitle: 'National Database & Registration Authority — Regional Operations Dashboard',
    zoneTitle: 'Zone-D Larkana (Z050D)',
    tableTitle: 'Consolidated Zone-D Larkana Office Operations Table',
    attendanceTitle: 'Workforce Attendance & Punctuality Register',
    officeProfileTitle: 'NADRA Registration Center / DAU Official Profile',
    footerDisclaimer: 'Official Operational Record of NADRA Zone-D Larkana. Strict Data Integrity Standards Enforced.',
  },
};

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'u-1',
    name: 'Muhammad Tariq Khan',
    email: 'zone.director@nadra.gov.pk',
    role: 'ZONE_ADMIN',
    zone: 'Zone-D Larkana',
  },
  {
    id: 'u-2',
    name: 'Ali Raza Memon',
    email: 'super.admin@nadra.gov.pk',
    role: 'SUPER_ADMIN',
    zone: 'Zone-D Larkana',
  },
  {
    id: 'u-3',
    name: 'Shagufta Parveen',
    email: 'reporting.officer@nadra.gov.pk',
    role: 'REPORTING_ADMIN',
    zone: 'Zone-D Larkana',
  },
  {
    id: 'u-4',
    name: 'Fahad Ahmed Soomro',
    email: 'verification@nadra.gov.pk',
    role: 'VERIFICATION_OFFICER',
    zone: 'Zone-D Larkana',
  },
  {
    id: 'u-5',
    name: 'Bilal Hussain Brohi',
    email: 'dau.larkana@nadra.gov.pk',
    role: 'DATA_ENTRY_OPERATOR',
    zone: 'Zone-D Larkana',
    assignedOfficeCode: 'LKR-01',
  },
  {
    id: 'u-6',
    name: 'Inspector Javed Malik',
    email: 'auditor@nadra.gov.pk',
    role: 'AUDITOR',
    zone: 'Zone-D Larkana',
  },
];

export const INITIAL_OFFICES: Office[] = [
  {
    code: 'LKR-01',
    name: 'DAU Larkana City',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'DAU',
    isActive: true,
    totalCounters: 8,
    expectedStaff: 24,
    dailyCapacity: 450,
    landline: '074-9410123',
    address: 'Station Road, Near Sessions Court, Larkana, Sindh',
    latitude: 27.5589,
    longitude: 68.2120,
    incharge: {
      name: 'Muhammad Aslam Chandio',
      designation: 'Senior Assistant Director (DAU Incharge)',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0300-1234567', type: 'whatsapp' },
        { id: 'c2', label: 'Official Call', number: '0333-7654321', type: 'call' },
        { id: 'c3', label: 'Emergency Contact', number: '0315-9876543', type: 'call' },
        { id: 'c4', label: 'Direct Desk Line', number: '074-9410124', type: 'landline' },
      ],
    },
    assistant: {
      name: 'Rashid Ali Solangi',
      designation: 'Assistant Incharge / Superintendent',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0301-2345678', type: 'both' },
        { id: 'ac2', label: 'Official Mobile', number: '0345-8765432', type: 'call' },
      ],
    },
    staffBreakdown: {
      officersMale: 3,
      officersFemale: 1,
      officialsMale: 10,
      officialsFemale: 4,
      supportingMale: 3,
      supportingFemale: 1,
      outsourceMale: 2,
      outsourceFemale: 0,
      totalStaff: 24,
    },
  },
  {
    code: 'RAT-02',
    name: 'NRC Ratodero',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 4,
    expectedStaff: 12,
    dailyCapacity: 220,
    landline: '074-7620311',
    address: 'Main Bypass Road, Near Bus Terminal, Ratodero, Larkana',
    latitude: 27.8032,
    longitude: 68.2882,
    incharge: {
      name: 'Ghulam Mustafa Abro',
      designation: 'Assistant Director / Center Incharge',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0302-3456789', type: 'whatsapp' },
        { id: 'c2', label: 'Official Mobile', number: '0334-8765432', type: 'call' },
        { id: 'c3', label: 'Residence/Emergency', number: '0312-5432109', type: 'call' },
      ],
    },
    assistant: {
      name: 'Suhail Ahmed Kalhoro',
      designation: 'Senior Registration Executive',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0303-4567890', type: 'both' },
      ],
    },
    staffBreakdown: {
      officersMale: 2,
      officersFemale: 0,
      officialsMale: 5,
      officialsFemale: 2,
      supportingMale: 2,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 12,
    },
  },
  {
    code: 'DOK-03',
    name: 'NRC Dokri',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 8,
    dailyCapacity: 160,
    landline: '074-4080122',
    address: 'Mohenjo Daro Road, Near Taluka Hospital, Dokri',
    latitude: 27.3756,
    longitude: 68.0984,
    incharge: {
      name: 'Nadir Ali Bhutto',
      designation: 'Deputy Assistant Director',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0304-5678901', type: 'whatsapp' },
        { id: 'c2', label: 'Call Only', number: '0331-2345678', type: 'call' },
      ],
    },
    assistant: {
      name: 'Imtiaz Hussain Shaikh',
      designation: 'Registration Officer',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0305-6789012', type: 'both' },
      ],
    },
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 3,
      officialsFemale: 1,
      supportingMale: 2,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 8,
    },
  },
  {
    code: 'BAK-04',
    name: 'NRC Bakrani',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 8,
    dailyCapacity: 150,
    landline: '074-4210344',
    address: 'Main Bazar, Opposite Degree College, Bakrani',
    latitude: 27.4221,
    longitude: 68.2341,
    incharge: {
      name: 'Zahid Hussain Mangi',
      designation: 'Incharge Officer',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0306-7890123', type: 'whatsapp' },
        { id: 'c2', label: 'Official Call', number: '0346-7890123', type: 'call' },
      ],
    },
    assistant: {
      name: 'Abdul Fattah Sangi',
      designation: 'Assistant Incharge',
      contacts: [
        { id: 'ac1', label: 'Call', number: '0307-8901234', type: 'call' },
      ],
    },
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 4,
      officialsFemale: 1,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 8,
    },
  },
  {
    code: 'MIR-05',
    name: 'NRC Mirokhan',
    district: 'Qambar-Shahdadkot',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 7,
    dailyCapacity: 140,
    landline: '074-4110567',
    address: 'Near National Bank, Main Road, Mirokhan',
    latitude: 27.7611,
    longitude: 68.0934,
    incharge: {
      name: 'Bashir Ahmed Tunio',
      designation: 'Assistant Director',
      contacts: [
        { id: 'c1', label: 'WhatsApp & Call', number: '0308-9012345', type: 'both' },
      ],
    },
    assistant: {
      name: 'Qurban Ali Chandio',
      designation: 'Supervisor',
      contacts: [
        { id: 'ac1', label: 'Mobile', number: '0309-0123456', type: 'call' },
      ],
    },
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 3,
      officialsFemale: 1,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 7,
    },
  },
  {
    code: 'QAM-06',
    name: 'DAU Qambar',
    district: 'Qambar-Shahdadkot',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'DAU',
    isActive: true,
    totalCounters: 6,
    expectedStaff: 16,
    dailyCapacity: 320,
    landline: '074-4211890',
    address: 'Near Deputy Commissioner Office, Qambar',
    latitude: 27.5894,
    longitude: 67.9989,
    incharge: {
      name: 'Mumtaz Ali Brohi',
      designation: 'Senior Assistant Director',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0300-3456781', type: 'whatsapp' },
        { id: 'c2', label: 'Official Phone', number: '0333-1122334', type: 'call' },
        { id: 'c3', label: 'Direct Desk Line', number: '074-4211891', type: 'landline' },
      ],
    },
    assistant: {
      name: 'Farhan Ali Lashari',
      designation: 'Assistant Director Operations',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0301-4455667', type: 'both' },
      ],
    },
    staffBreakdown: {
      officersMale: 2,
      officersFemale: 1,
      officialsMale: 7,
      officialsFemale: 2,
      supportingMale: 2,
      supportingFemale: 0,
      outsourceMale: 2,
      outsourceFemale: 0,
      totalStaff: 16,
    },
  },
  {
    code: 'SHK-07',
    name: 'NRC Shahdadkot',
    district: 'Qambar-Shahdadkot',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 5,
    expectedStaff: 14,
    dailyCapacity: 260,
    landline: '074-4012345',
    address: 'Kotoo Motoo Chowk, Silawat Mohalla, Shahdadkot',
    latitude: 27.8472,
    longitude: 67.9067,
    incharge: {
      name: 'Kamran Ali Magsi',
      designation: 'Center Incharge / AD',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0300-8899001', type: 'whatsapp' },
        { id: 'c2', label: 'Call', number: '0345-1234567', type: 'call' },
      ],
    },
    assistant: {
      name: 'Noor Muhammad Bhatti',
      designation: 'Senior Registration Executive',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0302-7788990', type: 'both' },
      ],
    },
    staffBreakdown: {
      officersMale: 2,
      officersFemale: 0,
      officialsMale: 6,
      officialsFemale: 2,
      supportingMale: 2,
      supportingFemale: 1,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 14,
    },
  },
  {
    code: 'NAS-08',
    name: 'NRC Nasirabad',
    district: 'Qambar-Shahdadkot',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 8,
    dailyCapacity: 150,
    landline: '074-4389012',
    address: 'Near Tehsil Headquarters, Nasirabad',
    latitude: 27.3821,
    longitude: 67.9234,
    incharge: {
      name: 'Nawaz Ali Bughio',
      designation: 'Assistant Incharge',
      contacts: [
        { id: 'c1', label: 'WhatsApp & Call', number: '0303-1122334', type: 'both' },
      ],
    },
    assistant: {
      name: 'Mansoor Ahmed Soomro',
      designation: 'DEO Supervisor',
      contacts: [
        { id: 'ac1', label: 'Mobile', number: '0333-2233445', type: 'call' },
      ],
    },
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 4,
      officialsFemale: 1,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 8,
    },
  },
  {
    code: 'WAR-09',
    name: 'NRC Warah',
    district: 'Qambar-Shahdadkot',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 8,
    dailyCapacity: 150,
    landline: '074-4412389',
    address: 'Station Road, Near Post Office, Warah',
    latitude: 27.4478,
    longitude: 67.7956,
    incharge: {
      name: 'Saeed Ahmed Channa',
      designation: 'Assistant Director / Incharge',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0304-2233445', type: 'whatsapp' },
        { id: 'c2', label: 'Official Line', number: '0313-3344556', type: 'call' },
      ],
    },
    assistant: {
      name: 'Junaid Ahmed Jamali',
      designation: 'Registration Officer',
      contacts: [
        { id: 'ac1', label: 'Call & WhatsApp', number: '0345-6677889', type: 'both' },
      ],
    },
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 3,
      officialsFemale: 1,
      supportingMale: 2,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 8,
    },
  },
  {
    code: 'KAK-10',
    name: 'NRC Kamber Ali Khan',
    district: 'Qambar-Shahdadkot',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 4,
    expectedStaff: 10,
    dailyCapacity: 190,
    landline: '074-4290145',
    address: 'Old Judicial Complex, Kamber Ali Khan',
    latitude: 27.5921,
    longitude: 68.0012,
    incharge: {
      name: 'Hafeezullah Junejo',
      designation: 'Incharge Officer',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0305-3344556', type: 'whatsapp' },
        { id: 'c2', label: 'Call', number: '0332-4455667', type: 'call' },
      ],
    },
    assistant: {
      name: 'Waseem Akram Gopang',
      designation: 'Assistant Supervisor',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0306-4455667', type: 'both' },
      ],
    },
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 5,
      officialsFemale: 1,
      supportingMale: 2,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 10,
    },
  },
  {
    code: 'JAC-11',
    name: 'DAU Jacobabad',
    district: 'Jacobabad',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'DAU',
    isActive: true,
    totalCounters: 6,
    expectedStaff: 18,
    dailyCapacity: 360,
    landline: '0722-651234',
    address: 'DC Office Complex, Shikarpur Road, Jacobabad',
    latitude: 28.2810,
    longitude: 68.4376,
    incharge: {
      name: 'Sikandar Ali Jakhrani',
      designation: 'Senior Assistant Director (DAU Incharge)',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0300-5566778', type: 'whatsapp' },
        { id: 'c2', label: 'Official Mobile', number: '0333-6677889', type: 'call' },
        { id: 'c3', label: 'Landline Direct', number: '0722-651235', type: 'landline' },
      ],
    },
    assistant: {
      name: 'Mazhar Ali Pechuho',
      designation: 'Assistant Incharge',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0301-6677889', type: 'both' },
      ],
    },
    staffBreakdown: {
      officersMale: 2,
      officersFemale: 1,
      officialsMale: 8,
      officialsFemale: 3,
      supportingMale: 2,
      supportingFemale: 0,
      outsourceMale: 2,
      outsourceFemale: 0,
      totalStaff: 18,
    },
  },
  {
    code: 'THU-12',
    name: 'NRC Thul',
    district: 'Jacobabad',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 4,
    expectedStaff: 10,
    dailyCapacity: 180,
    landline: '0722-680456',
    address: 'Main Kandhkot Road, Near Eidgah, Thul',
    latitude: 28.2412,
    longitude: 68.7754,
    incharge: {
      name: 'Mohsin Raza Soomro',
      designation: 'Assistant Director',
      contacts: [
        { id: 'c1', label: 'WhatsApp & Call', number: '0302-8899112', type: 'both' },
      ],
    },
    assistant: {
      name: 'Ayaz Ali Buriro',
      designation: 'Senior DEO',
      contacts: [
        { id: 'ac1', label: 'Mobile', number: '0334-9900112', type: 'call' },
      ],
    },
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 5,
      officialsFemale: 1,
      supportingMale: 2,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 10,
    },
  },
  {
    code: 'GKH-13',
    name: 'NRC Garhi Khairo',
    district: 'Jacobabad',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 7,
    dailyCapacity: 130,
    landline: '0722-690123',
    address: 'Opposite Taluka Municipal Administration, Garhi Khairo',
    latitude: 28.0589,
    longitude: 68.0412,
    incharge: {
      name: 'Faisal Mehmood Brohi',
      designation: 'Center Incharge',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0303-9900223', type: 'whatsapp' },
        { id: 'c2', label: 'Call', number: '0345-0011223', type: 'call' },
      ],
    },
    assistant: {
      name: 'Ali Dino Jamali',
      designation: 'Registration Assistant',
      contacts: [
        { id: 'ac1', label: 'Mobile', number: '0315-1122334', type: 'call' },
      ],
    },
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 3,
      officialsFemale: 1,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 7,
    },
  },
  {
    code: 'SHI-14',
    name: 'DAU Shikarpur',
    district: 'Shikarpur',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'DAU',
    isActive: true,
    totalCounters: 6,
    expectedStaff: 18,
    dailyCapacity: 350,
    landline: '0726-512890',
    address: 'Station Road, Near Shahi Bagh, Shikarpur',
    latitude: 27.9570,
    longitude: 68.6378,
    incharge: {
      name: 'Zulfiqar Ali Soomro',
      designation: 'Senior Assistant Director',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0300-7788991', type: 'whatsapp' },
        { id: 'c2', label: 'Official Call', number: '0333-8899002', type: 'call' },
        { id: 'c3', label: 'Office Landline', number: '0726-512891', type: 'landline' },
      ],
    },
    assistant: {
      name: 'Nadeem Ahmed Shaikh',
      designation: 'Assistant Incharge',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0301-8899003', type: 'both' },
      ],
    },
    staffBreakdown: {
      officersMale: 2,
      officersFemale: 1,
      officialsMale: 8,
      officialsFemale: 3,
      supportingMale: 2,
      supportingFemale: 0,
      outsourceMale: 2,
      outsourceFemale: 0,
      totalStaff: 18,
    },
  },
  {
    code: 'KHA-15',
    name: 'NRC Khanpur',
    district: 'Shikarpur',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 7,
    dailyCapacity: 130,
    landline: '0726-540112',
    address: 'Indus Highway, Near Degree College, Khanpur',
    latitude: 28.0245,
    longitude: 68.7123,
    incharge: {
      name: 'Aftab Ahmed Mahar',
      designation: 'Center Incharge',
      contacts: [
        { id: 'c1', label: 'WhatsApp & Call', number: '0304-0011224', type: 'both' },
      ],
    },
    assistant: {
      name: 'Zameer Hussain Abro',
      designation: 'Registration Officer',
      contacts: [
        { id: 'ac1', label: 'Call', number: '0332-1122335', type: 'call' },
      ],
    },
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 3,
      officialsFemale: 1,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 7,
    },
  },
  {
    code: 'GYA-16',
    name: 'NRC Garhi Yasin',
    district: 'Shikarpur',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 8,
    dailyCapacity: 150,
    landline: '0726-580223',
    address: 'Near Old Police Station, Garhi Yasin',
    latitude: 27.9089,
    longitude: 68.5120,
    incharge: {
      name: 'Shakeel Ahmed Soomro',
      designation: 'Assistant Incharge',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0305-1122336', type: 'whatsapp' },
        { id: 'c2', label: 'Call', number: '0346-2233447', type: 'call' },
      ],
    },
    assistant: {
      name: 'Mansoor Ali Brohi',
      designation: 'Supervisor',
      contacts: [
        { id: 'ac1', label: 'Mobile', number: '0306-2233448', type: 'call' },
      ],
    },
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 4,
      officialsFemale: 1,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 8,
    },
  },
  {
    code: 'LGS-17',
    name: 'NRC Lakhi Ghulam Shah',
    district: 'Shikarpur',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 7,
    dailyCapacity: 130,
    landline: '0726-590334',
    address: 'Main Sukkur-Shikarpur Highway, Lakhi Ghulam Shah',
    latitude: 27.8543,
    longitude: 68.6987,
    incharge: {
      name: 'Rashid Ali Memon',
      designation: 'Incharge Officer',
      contacts: [
        { id: 'c1', label: 'WhatsApp & Call', number: '0307-3344559', type: 'both' },
      ],
    },
    assistant: {
      name: 'Javed Iqbal Pathan',
      designation: 'Assistant Incharge',
      contacts: [
        { id: 'ac1', label: 'Call', number: '0334-4455660', type: 'call' },
      ],
    },
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 3,
      officialsFemale: 1,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 7,
    },
  },
  {
    code: 'KAS-18',
    name: 'DAU Kashmore',
    district: 'Kashmore',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'DAU',
    isActive: true,
    totalCounters: 5,
    expectedStaff: 14,
    dailyCapacity: 280,
    landline: '0722-570112',
    address: 'Indus Highway, Near DPO Complex, Kashmore City',
    latitude: 28.4321,
    longitude: 69.5843,
    incharge: {
      name: 'Habibullah Mazari',
      designation: 'Senior Assistant Director',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0300-9911223', type: 'whatsapp' },
        { id: 'c2', label: 'Official Call', number: '0333-0011224', type: 'call' },
        { id: 'c3', label: 'Emergency', number: '0312-3344556', type: 'call' },
      ],
    },
    assistant: {
      name: 'Naveed Ahmed Malik',
      designation: 'Assistant Incharge',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0301-1122335', type: 'both' },
      ],
    },
    staffBreakdown: {
      officersMale: 2,
      officersFemale: 0,
      officialsMale: 6,
      officialsFemale: 2,
      supportingMale: 2,
      supportingFemale: 0,
      outsourceMale: 2,
      outsourceFemale: 0,
      totalStaff: 14,
    },
  },
  {
    code: 'KAN-19',
    name: 'NRC Kandhkot',
    district: 'Kashmore',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 5,
    expectedStaff: 15,
    dailyCapacity: 290,
    landline: '0722-572345',
    address: 'Near Old Session Court, Kandhkot',
    latitude: 28.2432,
    longitude: 69.1823,
    incharge: {
      name: 'Ghulam Qadir Bijarani',
      designation: 'Assistant Director / Incharge',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0302-2233446', type: 'whatsapp' },
        { id: 'c2', label: 'Call', number: '0345-3344557', type: 'call' },
      ],
    },
    assistant: {
      name: 'Suhail Ahmed Chachar',
      designation: 'Registration Supervisor',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0303-3344558', type: 'both' },
      ],
    },
    staffBreakdown: {
      officersMale: 2,
      officersFemale: 1,
      officialsMale: 6,
      officialsFemale: 2,
      supportingMale: 2,
      supportingFemale: 0,
      outsourceMale: 2,
      outsourceFemale: 0,
      totalStaff: 15,
    },
  },
  {
    code: 'TAN-20',
    name: 'NRC Tangwani',
    district: 'Kashmore',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 8,
    dailyCapacity: 150,
    landline: '0722-581901',
    address: 'Near Rural Health Center, Tangwani',
    latitude: 28.2912,
    longitude: 68.9912,
    incharge: {
      name: 'Imran Ali Jakhrani',
      designation: 'Incharge Officer',
      contacts: [
        { id: 'c1', label: 'WhatsApp & Call', number: '0304-4455669', type: 'both' },
      ],
    },
    assistant: {
      name: 'Aijaz Ahmed Brohi',
      designation: 'Assistant Incharge',
      contacts: [
        { id: 'ac1', label: 'Mobile', number: '0331-5566770', type: 'call' },
      ],
    },
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 4,
      officialsFemale: 1,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 8,
    },
  },
];

function generateSeedReports(dateStr: string, varianceMultiplier: number = 1.0): OfficeDailyReport[] {
  return INITIAL_OFFICES.map((office, idx) => {
    const baseStaff = office.expectedStaff || 10;
    const staffReported = Math.max(1, Math.round(baseStaff * (0.9 + (idx % 3) * 0.05)));
    const late745 = Math.round(staffReported * (idx % 4 === 0 ? 0.25 : 0.1));
    const late800 = Math.round(late745 * 0.4);
    const onTime = staffReported - late745;

    const issuedMultiplier = (office.totalCounters * 45) * varianceMultiplier;
    const qmaticIssued = Math.round(issuedMultiplier * (0.85 + (idx % 5) * 0.04));
    const qmaticProcessed = Math.round(qmaticIssued * (0.92 + (idx % 3) * 0.02));
    const qmaticCalc = calculateQMatic(qmaticIssued, qmaticProcessed);

    const oneappIssued = qmaticProcessed;
    const oneappProcessed = Math.round(oneappIssued * (idx === 8 ? 0.88 : 0.94));
    const oneappSkipped = Math.round(oneappIssued * 0.05);
    const oneappCalc = calculateOneApp(oneappIssued, oneappProcessed, oneappSkipped);

    const approvedOneApp = Math.round(oneappProcessed * 0.96);
    const prevDayApprovedOneApp = Math.round(approvedOneApp * (0.95 + (idx % 3) * 0.04));
    const approvedDifference = approvedOneApp - prevDayApprovedOneApp;

    const diminishedFingerprintsMBVS = Math.round(approvedOneApp * 0.04) + 1;
    const proofOfLifeCertificates = Math.round(approvedOneApp * 0.025) + 1;

    const pakidApproved = Math.round(approvedOneApp * 0.12) + 2;
    const pakidDeferred = Math.round(pakidApproved * 0.1);
    const pakidCorrection = Math.round(pakidApproved * 0.05);

    const discrepancies: string[] = [];
    if (idx === 8) {
      discrepancies.push('Unreconciled OneApp TIDs: 6 tokens unaccounted for after business close.');
    }

    return {
      id: `rep-${dateStr}-${office.code}`,
      date: dateStr,
      zone: 'Zone-D Larkana',
      officeCode: office.code,
      officeName: office.name,
      reportingStatus: idx === 8 ? 'REPORTED' : 'REPORTED',
      submissionTime: '08:15:00',
      submittedBy: 'System Automation',
      verifiedBy: 'Muhammad Tariq Khan',
      totalEmployees: staffReported,
      lateAfter745: late745,
      lateAfter800: late800,
      onTimeEmployees: onTime,
      qmaticIssued,
      qmaticProcessed,
      qmaticRemaining: qmaticCalc.remaining,
      qmaticPercentage: qmaticCalc.percentage,
      oneappIssued,
      oneappProcessed,
      oneappSkipped,
      oneappRemaining: oneappCalc.remaining,
      oneappReconciliationPercentage: oneappCalc.percentage,
      approvedOneApp,
      prevDayApprovedOneApp,
      approvedDifference,
      diminishedFingerprintsMBVS,
      proofOfLifeCertificates,
      pakidApproved,
      pakidDeferred,
      pakidCorrection,
      sourceUploadId: 'init-seed',
      ocrConfidence: 0.98,
      hasDiscrepancy: discrepancies.length > 0,
      discrepancies,
    };
  });
}

function generateSeedAttendanceRecords(): EmployeeAttendanceRecord[] {
  const dates = ['2026-10-25', '2026-10-24'];
  const records: EmployeeAttendanceRecord[] = [];

  const sampleStaffByOffice: Record<string, Array<{ name: string; desig: string; cat: any; gender: any }>> = {
    'LKR-01': [
      { name: 'Muhammad Aslam Chandio', desig: 'Senior Assistant Director', cat: 'OFFICER', gender: 'MALE' },
      { name: 'Rashid Ali Solangi', desig: 'Assistant Incharge', cat: 'OFFICER', gender: 'MALE' },
      { name: 'Shazia Bano Abro', desig: 'Assistant Director Verification', cat: 'OFFICER', gender: 'FEMALE' },
      { name: 'Tariq Mehmood Brohi', desig: 'Senior Registration Executive', cat: 'OFFICIAL', gender: 'MALE' },
      { name: 'Kainat Fatima Soomro', desig: 'Registration Executive', cat: 'OFFICIAL', gender: 'FEMALE' },
      { name: 'Bilal Hussain Brohi', desig: 'Data Entry Operator', cat: 'OFFICIAL', gender: 'MALE' },
      { name: 'Noman Ali Kalhoro', desig: 'Data Entry Operator', cat: 'OFFICIAL', gender: 'MALE' },
      { name: 'Farzana Parveen Sangi', desig: 'Registration Executive', cat: 'OFFICIAL', gender: 'FEMALE' },
      { name: 'Sajid Ali Kalhoro', desig: 'Naib Qasid', cat: 'SUPPORTING', gender: 'MALE' },
      { name: 'Shakeel Ahmed Abro', desig: 'Security Guard', cat: 'OUTSOURCE', gender: 'MALE' },
      { name: 'Zahid Hussain Bhatti', desig: 'Biometric Operator', cat: 'OFFICIAL', gender: 'MALE' },
      { name: 'Murtaza Ali Jamali', desig: 'Data Entry Operator', cat: 'OFFICIAL', gender: 'MALE' },
    ],
    'RAT-02': [
      { name: 'Ghulam Mustafa Abro', desig: 'Assistant Director / Incharge', cat: 'OFFICER', gender: 'MALE' },
      { name: 'Suhail Ahmed Kalhoro', desig: 'Senior Registration Executive', cat: 'OFFICIAL', gender: 'MALE' },
      { name: 'Bakhtawar Jan Solangi', desig: 'Registration Executive', cat: 'OFFICIAL', gender: 'FEMALE' },
      { name: 'Altaf Hussain Tunio', desig: 'Data Entry Operator', cat: 'OFFICIAL', gender: 'MALE' },
      { name: 'Rehana Kausar Brohi', desig: 'Data Entry Operator', cat: 'OFFICIAL', gender: 'FEMALE' },
      { name: 'Ghulam Shabbir Siyal', desig: 'Supporting Staff', cat: 'SUPPORTING', gender: 'MALE' },
    ],
    'DOK-03': [
      { name: 'Nadir Ali Bhutto', desig: 'Deputy Assistant Director', cat: 'OFFICER', gender: 'MALE' },
      { name: 'Imtiaz Hussain Shaikh', desig: 'Registration Officer', cat: 'OFFICIAL', gender: 'MALE' },
      { name: 'Safia Sultana Chandio', desig: 'Data Entry Operator', cat: 'OFFICIAL', gender: 'FEMALE' },
      { name: 'Munawar Ali Mangi', desig: 'Data Entry Operator', cat: 'OFFICIAL', gender: 'MALE' },
      { name: 'Ali Bux Kalhoro', desig: 'Office Boy', cat: 'SUPPORTING', gender: 'MALE' },
    ],
    'WAR-09': [
      { name: 'Saeed Ahmed Channa', desig: 'Assistant Director / Incharge', cat: 'OFFICER', gender: 'MALE' },
      { name: 'Junaid Ahmed Jamali', desig: 'Registration Officer', cat: 'OFFICIAL', gender: 'MALE' },
      { name: 'Razia Begum Soomro', desig: 'DEO Female Counter', cat: 'OFFICIAL', gender: 'FEMALE' },
      { name: 'Zulfiqar Ali Lashari', desig: 'Biometric Operator', cat: 'OFFICIAL', gender: 'MALE' },
      { name: 'Khadim Hussain Magsi', desig: 'Supporting Guard', cat: 'OUTSOURCE', gender: 'MALE' },
    ],
    'QAM-06': [
      { name: 'Mumtaz Ali Brohi', desig: 'Senior Assistant Director', cat: 'OFFICER', gender: 'MALE' },
      { name: 'Farhan Ali Lashari', desig: 'Assistant Director Operations', cat: 'OFFICER', gender: 'MALE' },
      { name: 'Tahira Parveen Tunio', desig: 'Senior Registration Executive', cat: 'OFFICIAL', gender: 'FEMALE' },
      { name: 'Ahsan Ali Mangi', desig: 'Data Entry Operator', cat: 'OFFICIAL', gender: 'MALE' },
      { name: 'Mohammad Din Kalhoro', desig: 'Supporting Assistant', cat: 'SUPPORTING', gender: 'MALE' },
    ],
  };

  dates.forEach((d) => {
    Object.entries(sampleStaffByOffice).forEach(([officeCode, staffList]) => {
      const office = INITIAL_OFFICES.find(o => o.code === officeCode);
      const officeName = office ? office.name : officeCode;

      staffList.forEach((st, idx) => {
        let checkInTime = '07:35';
        let status: 'ON_TIME' | 'LATE_745' | 'LATE_800' | 'ABSENT' | 'LEAVE' = 'ON_TIME';

        if (idx === 3) {
          checkInTime = '07:51';
          status = 'LATE_745';
        } else if (idx === 6) {
          checkInTime = '08:09';
          status = 'LATE_800';
        } else if (idx === 7 && d === '2026-10-25') {
          checkInTime = '08:14';
          status = 'LATE_800';
        } else if (idx === 5) {
          checkInTime = '07:44';
          status = 'ON_TIME';
        } else {
          const minutes = 25 + (idx * 3);
          checkInTime = `07:${minutes < 10 ? '0' + minutes : minutes}`;
          status = 'ON_TIME';
        }

        records.push({
          id: `att-${d}-${officeCode}-${idx + 1}`,
          date: d,
          officeCode,
          officeName,
          employeeId: `EMP-${officeCode}-${100 + idx}`,
          employeeName: st.name,
          designation: st.desig,
          category: st.cat,
          gender: st.gender,
          checkInTime,
          status,
          notes: status === 'LATE_800' ? 'Flagged past 08:00 AM' : status === 'LATE_745' ? 'Arrived after 07:45 AM threshold' : 'Punctual arrival',
          source: 'BIOMETRIC_OCR',
        });
      });
    });
  });

  return records;
}

class DatabaseService {
  private state: DatabaseState;

  constructor() {
    this.ensureDataDir();
    this.state = this.loadState();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadState(): DatabaseState {
    let loadedState: Partial<DatabaseState> | null = null;
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        loadedState = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to read db file, initializing seed defaults:', err);
      }
    }

    const today = '2026-10-25';
    const yesterday = '2026-10-24';
    const twoDaysAgo = '2026-10-23';

    const seedReports = [
      ...generateSeedReports(today, 1.0),
      ...generateSeedReports(yesterday, 0.95),
      ...generateSeedReports(twoDaysAgo, 0.92),
    ];

    const seedIssues: DataQualityIssue[] = [
      {
        id: 'issue-1',
        date: today,
        officeCode: 'WAR-09',
        officeName: 'NRC Warah',
        issueType: 'ONEAPP_UNRECONCILED',
        severity: 'WARNING',
        description: 'NRC Warah has 6 unaccounted OneApp TIDs requiring operator verification.',
        suggestedAction: 'Request DAU In-charge to verify offline tokens or system skip logs.',
        isResolved: false,
      },
      {
        id: 'issue-2',
        date: yesterday,
        officeCode: 'GKH-13',
        officeName: 'NRC Garhi Khairo',
        issueType: 'ATTENDANCE_ANOMALY',
        severity: 'NOTICE',
        description: 'Biometric late arrival rate was 35% on Saturday morning due to power trip.',
        suggestedAction: 'Confirmed with local admin; generator fuel log matched.',
        isResolved: true,
        resolvedBy: 'Muhammad Tariq Khan',
        resolvedAt: '2026-10-24T18:00:00Z',
        resolutionNote: 'Approved by Director Operations Larkana.',
      },
    ];

    const seedLogs: AuditLogEntry[] = [
      {
        id: 'log-1',
        timestamp: '2026-10-25T08:00:15Z',
        userId: 'u-1',
        userName: 'Muhammad Tariq Khan',
        userRole: 'ZONE_ADMIN',
        action: 'LOGIN',
        details: 'User authenticated into Zone-D Larkana Operations Center.',
      },
      {
        id: 'log-2',
        timestamp: '2026-10-25T11:45:30Z',
        userId: 'u-3',
        userName: 'Shagufta Parveen',
        userRole: 'REPORTING_ADMIN',
        action: 'EXECUTE_OCR',
        details: 'Processed daily progress report image for Zone-D Larkana.',
        reportingDate: today,
      },
      {
        id: 'log-3',
        timestamp: '2026-10-25T12:00:00Z',
        userId: 'u-4',
        userName: 'Fahad Ahmed Soomro',
        userRole: 'VERIFICATION_OFFICER',
        action: 'CONFIRM_IMPORT',
        details: 'Verified and committed 20 office reports into central database for 2026-10-25.',
        reportingDate: today,
      },
    ];

    const seedAttendance = generateSeedAttendanceRecords();

    // If we loaded existing state, upgrade it with new fields if missing
    if (loadedState) {
      // Merge offices so rich contact/staff info is present
      const mergedOffices = INITIAL_OFFICES.map(initOffice => {
        const found = (loadedState!.offices || []).find(o => o.code.toUpperCase() === initOffice.code.toUpperCase());
        if (!found) return initOffice;
        return {
          ...initOffice,
          ...found,
          zoneCode: found.zoneCode || initOffice.zoneCode || 'Z050D',
          zoneName: found.zoneName || initOffice.zoneName || 'Larkana',
          incharge: found.incharge || initOffice.incharge,
          assistant: found.assistant || initOffice.assistant,
          staffBreakdown: found.staffBreakdown || initOffice.staffBreakdown,
          landline: found.landline || initOffice.landline,
          address: found.address || initOffice.address,
          latitude: found.latitude || initOffice.latitude,
          longitude: found.longitude || initOffice.longitude,
        };
      });

      const mergedAttendance = (loadedState.attendanceRecords && loadedState.attendanceRecords.length > 0)
        ? loadedState.attendanceRecords
        : seedAttendance;

      const mergedSettings = {
        ...DEFAULT_SETTINGS,
        ...(loadedState.settings || {}),
        zoneCode: loadedState.settings?.zoneCode || 'Z050D',
        zoneName: loadedState.settings?.zoneName || 'Larkana',
        thresholdTime1: loadedState.settings?.thresholdTime1 || '07:45',
        thresholdTime2: loadedState.settings?.thresholdTime2 || '08:00',
        customTexts: {
          ...DEFAULT_SETTINGS.customTexts,
          ...(loadedState.settings?.customTexts || {}),
        },
      };

      const finalState: DatabaseState = {
        users: loadedState.users && loadedState.users.length ? loadedState.users : DEFAULT_USERS,
        offices: mergedOffices,
        dailyReports: loadedState.dailyReports && loadedState.dailyReports.length ? loadedState.dailyReports : seedReports,
        dataQualityIssues: loadedState.dataQualityIssues || seedIssues,
        auditLogs: loadedState.auditLogs || seedLogs,
        settings: mergedSettings,
        attendanceRecords: mergedAttendance,
      };

      this.saveStateToDisk(finalState);
      return finalState;
    }

    const initialState: DatabaseState = {
      users: DEFAULT_USERS,
      offices: INITIAL_OFFICES,
      dailyReports: seedReports,
      dataQualityIssues: seedIssues,
      auditLogs: seedLogs,
      settings: DEFAULT_SETTINGS,
      attendanceRecords: seedAttendance,
    };

    this.saveStateToDisk(initialState);
    return initialState;
  }

  private saveStateToDisk(state: DatabaseState) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private persist() {
    this.saveStateToDisk(this.state);
  }

  // --- Users & Auth ---
  public getUsers(): UserProfile[] {
    return this.state.users;
  }

  public getUserById(id: string): UserProfile | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): UserProfile | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public saveUser(user: UserProfile, actor: { id: string; name: string; role: any }): UserProfile {
    const idx = this.state.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.state.users[idx] = user;
    } else {
      this.state.users.push(user);
    }
    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CONFIG_CHANGE',
      details: `Saved user account ${user.name} (${user.role})`,
    });
    this.persist();
    return user;
  }

  // --- Offices ---
  public getOffices(): Office[] {
    return this.state.offices;
  }

  public getOfficeByCode(code: string): Office | undefined {
    return this.state.offices.find(o => o.code.toUpperCase() === code.toUpperCase());
  }

  public saveOffice(office: Office, actor: { id: string; name: string; role: any }): Office {
    const idx = this.state.offices.findIndex(o => o.code.toUpperCase() === office.code.toUpperCase());
    
    // Calculate total staff from breakdown if provided
    let updatedOffice = { ...office };
    if (updatedOffice.staffBreakdown) {
      const sb = updatedOffice.staffBreakdown;
      sb.totalStaff = (
        (Number(sb.officersMale) || 0) +
        (Number(sb.officersFemale) || 0) +
        (Number(sb.officialsMale) || 0) +
        (Number(sb.officialsFemale) || 0) +
        (Number(sb.supportingMale) || 0) +
        (Number(sb.supportingFemale) || 0) +
        (Number(sb.outsourceMale) || 0) +
        (Number(sb.outsourceFemale) || 0)
      );
      updatedOffice.expectedStaff = sb.totalStaff;
    }

    if (idx >= 0) {
      this.state.offices[idx] = { ...this.state.offices[idx], ...updatedOffice };
    } else {
      this.state.offices.push(updatedOffice);
    }

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CONFIG_CHANGE',
      details: `Updated office profile and management parameters for ${office.name} [${office.code}] (Zone: ${office.zoneName || 'Larkana'}, Zone Code: ${office.zoneCode || 'Z050D'}).`,
      officeCode: office.code,
    });
    this.persist();
    return updatedOffice;
  }

  // --- Daily Reports ---
  public getDailyReports(date: string, zone?: string): OfficeDailyReport[] {
    return this.state.dailyReports.filter(r => {
      const matchDate = r.date === date;
      const matchZone = zone ? r.zone.toLowerCase() === zone.toLowerCase() : true;
      return matchDate && matchZone;
    });
  }

  public getOfficeReport(code: string, date: string): OfficeDailyReport | undefined {
    return this.state.dailyReports.find(
      r => r.officeCode.toUpperCase() === code.toUpperCase() && r.date === date
    );
  }

  public getAvailableReportingDates(): string[] {
    const dates = new Set(this.state.dailyReports.map(r => r.date));
    return Array.from(dates).sort().reverse();
  }

  public getHistoricalReports(filter: {
    startDate?: string;
    endDate?: string;
    officeCode?: string;
  }): OfficeDailyReport[] {
    return this.state.dailyReports.filter(r => {
      if (filter.startDate && r.date < filter.startDate) return false;
      if (filter.endDate && r.date > filter.endDate) return false;
      if (filter.officeCode && r.officeCode.toUpperCase() !== filter.officeCode.toUpperCase()) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }

  public saveDailyReport(
    report: OfficeDailyReport,
    actor: { id: string; name: string; role: any },
    reason?: string
  ): OfficeDailyReport {
    const existingIdx = this.state.dailyReports.findIndex(
      r => r.officeCode.toUpperCase() === report.officeCode.toUpperCase() && r.date === report.date
    );

    if (existingIdx >= 0) {
      this.state.dailyReports[existingIdx] = {
        ...report,
        reportingStatus: 'CORRECTED',
      };
      this.addAuditLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'CORRECT_REPORT',
        details: `Corrected report for ${report.officeName} [${report.officeCode}] on ${report.date}. Reason: ${reason || 'Operator manual adjustment'}`,
        reportingDate: report.date,
        officeCode: report.officeCode,
      });
    } else {
      this.state.dailyReports.push(report);
      this.addAuditLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'EDIT_RECORD',
        details: `Created new daily entry for ${report.officeName} [${report.officeCode}] on ${report.date}`,
        reportingDate: report.date,
        officeCode: report.officeCode,
      });
    }

    this.persist();
    return report;
  }

  public batchImportReports(
    reports: OfficeDailyReport[],
    actor: { id: string; name: string; role: any },
    sourceUploadTitle?: string
  ): { importedCount: number; updatedCount: number } {
    let importedCount = 0;
    let updatedCount = 0;

    for (const report of reports) {
      const idx = this.state.dailyReports.findIndex(
        r => r.officeCode.toUpperCase() === report.officeCode.toUpperCase() && r.date === report.date
      );

      if (idx >= 0) {
        this.state.dailyReports[idx] = {
          ...report,
          reportingStatus: 'REPORTED',
        };
        updatedCount++;
      } else {
        this.state.dailyReports.push(report);
        importedCount++;
      }
    }

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CONFIRM_IMPORT',
      details: `Batch imported ${reports.length} office reports (${importedCount} new, ${updatedCount} updated) from OCR job [${sourceUploadTitle || 'Spreadsheet Upload'}] for date ${reports[0]?.date || 'N/A'}.`,
      reportingDate: reports[0]?.date,
    });

    this.persist();
    return { importedCount, updatedCount };
  }

  // --- Employee Attendance Records ---
  public getAttendanceRecords(date?: string, officeCode?: string, statusFilter?: string): EmployeeAttendanceRecord[] {
    let list = this.state.attendanceRecords || [];
    if (date) {
      list = list.filter(r => r.date === date);
    }
    if (officeCode && officeCode !== 'ALL') {
      list = list.filter(r => r.officeCode.toUpperCase() === officeCode.toUpperCase());
    }
    if (statusFilter && statusFilter !== 'ALL') {
      if (statusFilter === 'LATE_ALL') {
        list = list.filter(r => r.status === 'LATE_745' || r.status === 'LATE_800');
      } else {
        list = list.filter(r => r.status === statusFilter);
      }
    }
    return list;
  }

  public saveAttendanceRecord(
    record: EmployeeAttendanceRecord,
    actor: { id: string; name: string; role: any }
  ): EmployeeAttendanceRecord {
    if (!this.state.attendanceRecords) {
      this.state.attendanceRecords = [];
    }
    const idx = this.state.attendanceRecords.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      this.state.attendanceRecords[idx] = record;
    } else {
      this.state.attendanceRecords.unshift(record);
    }

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'EDIT_RECORD',
      details: `Saved attendance for ${record.employeeName} (${record.officeCode}) - Time: ${record.checkInTime}, Status: ${record.status}`,
      reportingDate: record.date,
      officeCode: record.officeCode,
    });

    this.persist();
    return record;
  }

  public deleteAttendanceRecord(
    id: string,
    actor: { id: string; name: string; role: any }
  ): boolean {
    if (!this.state.attendanceRecords) return false;
    const initialLen = this.state.attendanceRecords.length;
    this.state.attendanceRecords = this.state.attendanceRecords.filter(r => r.id !== id);
    if (this.state.attendanceRecords.length !== initialLen) {
      this.addAuditLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'EDIT_RECORD',
        details: `Deleted attendance record ID [${id}]`,
      });
      this.persist();
      return true;
    }
    return false;
  }

  public batchImportAttendance(
    records: EmployeeAttendanceRecord[],
    actor: { id: string; name: string; role: any },
    sourceTitle?: string
  ): { addedCount: number; updatedCount: number } {
    if (!this.state.attendanceRecords) {
      this.state.attendanceRecords = [];
    }
    let addedCount = 0;
    let updatedCount = 0;

    for (const rec of records) {
      const idx = this.state.attendanceRecords.findIndex(
        r => r.date === rec.date && r.officeCode === rec.officeCode && (r.employeeId === rec.employeeId || r.employeeName === rec.employeeName)
      );
      if (idx >= 0) {
        this.state.attendanceRecords[idx] = {
          ...this.state.attendanceRecords[idx],
          ...rec,
        };
        updatedCount++;
      } else {
        this.state.attendanceRecords.unshift(rec);
        addedCount++;
      }
    }

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CONFIRM_IMPORT',
      details: `Batch imported ${records.length} employee attendance entries (${addedCount} new, ${updatedCount} updated) via [${sourceTitle || 'Biometric Sheet Scan'}]`,
      reportingDate: records[0]?.date,
      officeCode: records[0]?.officeCode,
    });

    this.persist();
    return { addedCount, updatedCount };
  }

  // --- Data Quality Issues ---
  public getDataQualityIssues(onlyUnresolved: boolean = false): DataQualityIssue[] {
    if (onlyUnresolved) {
      return this.state.dataQualityIssues.filter(i => !i.isResolved);
    }
    return this.state.dataQualityIssues;
  }

  public resolveDataQualityIssue(
    issueId: string,
    actor: { id: string; name: string; role: any },
    resolutionNote: string
  ): boolean {
    const issue = this.state.dataQualityIssues.find(i => i.id === issueId);
    if (!issue) return false;

    issue.isResolved = true;
    issue.resolvedBy = actor.name;
    issue.resolvedAt = new Date().toISOString();
    issue.resolutionNote = resolutionNote;

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'RESOLVE_DISCREPANCY',
      details: `Resolved data quality issue [${issue.issueType}] for office ${issue.officeName} on ${issue.date}: ${resolutionNote}`,
      reportingDate: issue.date,
      officeCode: issue.officeCode,
    });

    this.persist();
    return true;
  }

  // --- Audit Logs ---
  public getAuditLogs(limit: number = 100): AuditLogEntry[] {
    return [...this.state.auditLogs]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    if (!this.state.settings.enableAuditLogging) return;
    const log: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.state.auditLogs.unshift(log);
    if (this.state.auditLogs.length > 1000) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 1000);
    }
    this.persist();
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    return this.state.settings;
  }

  public updateSettings(
    newSettings: Partial<AppSettings>,
    actor: { id: string; name: string; role: any }
  ): AppSettings {
    this.state.settings = {
      ...this.state.settings,
      ...newSettings,
      customTexts: {
        ...this.state.settings.customTexts,
        ...(newSettings.customTexts || {}),
      },
    };
    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CONFIG_CHANGE',
      details: `Updated application configuration, shift thresholds (${this.state.settings.thresholdTime1} / ${this.state.settings.thresholdTime2}), and system texts.`,
    });
    this.persist();
    return this.state.settings;
  }
}

export const db = new DatabaseService();
