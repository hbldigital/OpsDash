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
  LeadershipTenureRecord,
  EmployeeProfile,
} from '../src/types/dashboard';
import { INITIAL_EMPLOYEES } from '../src/utils/initialEmployees';

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
  employees: EmployeeProfile[];
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
    assignedOfficeCode: '10501',
  },
];

export const INITIAL_OFFICES: Office[] = [
  {
    id: 'dau-10501-m',
    code: '10501',
    name: 'NRC Larkana (Morning Shift)',
    shift: 'Morning',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 8,
    expectedStaff: 16,
    dailyCapacity: 350,
    landline: '074-9410123',
    address: 'Station Road, Near Sessions Court, Larkana, Sindh',
    latitude: 27.5589,
    longitude: 68.2120,
    incharge: {
      name: 'Muhammad Aslam Chandio',
      designation: 'Senior Assistant Director',
      grade: 'BPS-18',
      startDate: '2023-08-15',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0300-1234567', type: 'whatsapp' },
        { id: 'c2', label: 'Official Call', number: '0333-7654321', type: 'call' },
        { id: 'c3', label: 'Emergency Contact', number: '0315-9876543', type: 'call' },
        { id: 'c4', label: 'Desk Landline', number: '074-9410124', type: 'landline' },
      ],
    },
    secondIncharge: {
      name: 'Rashid Ali Solangi',
      designation: 'Assistant Incharge / Superintendent',
      grade: 'BPS-16',
      startDate: '2024-01-10',
      contacts: [
        { id: 'sc1', label: 'WhatsApp & Call', number: '0301-2345678', type: 'both' },
        { id: 'sc2', label: 'Official Mobile', number: '0345-8765432', type: 'call' },
      ],
    },
    assistant: {
      name: 'Naveed Ahmed Kalhoro',
      designation: 'Office Assistant (OA)',
      grade: 'BPS-14',
      responsibilities: 'Public queue token coordination, staff duty roster, daily reconciliation statements, dispatch register and biometric machine maintenance.',
      mobileNumber: '0302-3456789',
      whatsappNumber: '0302-3456789',
      startDate: '2024-02-01',
      contacts: [
        { id: 'ac1', label: 'WhatsApp Direct', number: '0302-3456789', type: 'whatsapp' },
        { id: 'ac2', label: 'Mobile Call', number: '0345-9876543', type: 'call' },
      ],
    },
    leadershipHistory: [
      {
        id: 'ten-10501-1',
        role: 'OIC',
        roleTitle: 'Office Incharge (OIC)',
        name: 'Ghulam Shabir Mangi',
        designation: 'Deputy Director',
        grade: 'BPS-18',
        contact: '0300-9988776',
        whatsappNumber: '0300-9988776',
        startDate: '2022-01-10',
        endDate: '2023-08-14',
        isCurrent: false,
        tenureDuration: '1 yr, 7 mos, 4 days (581 days / 83 wks)',
        transferOrderNo: 'NADRA/RHQ/SUK/HR-4819',
        remarks: 'Transferred as Zonal Coordinator Sukkur Regional HQ',
      },
      {
        id: 'ten-10501-2',
        role: 'OA',
        roleTitle: 'Office Assistant (OA)',
        name: 'Bashir Ahmed Tunio',
        designation: 'Senior Assistant',
        grade: 'BPS-14',
        contact: '0313-1122334',
        whatsappNumber: '0313-1122334',
        startDate: '2022-06-01',
        endDate: '2024-01-31',
        isCurrent: false,
        tenureDuration: '1 yr, 8 mos (609 days / 87 wks)',
        transferOrderNo: 'NADRA/ZD-LRK/2024/09',
        remarks: 'Transferred to Executive NRC Larkana on merit',
      },
    ],
    staffBreakdown: {
      officersMale: 2,
      officersFemale: 1,
      officialsMale: 6,
      officialsFemale: 3,
      supportingMale: 2,
      supportingFemale: 0,
      outsourceMale: 2,
      outsourceFemale: 0,
      totalStaff: 16,
    },
  },
  {
    id: 'dau-10501-e',
    code: '10501',
    name: 'NRC Larkana (Evening Shift)',
    shift: 'Evening',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 6,
    expectedStaff: 12,
    dailyCapacity: 300,
    landline: '074-9410125',
    address: 'Station Road, Near Sessions Court, Larkana, Sindh',
    latitude: 27.5589,
    longitude: 68.2120,
    incharge: {
      name: 'Tariq Mehmood Brohi',
      designation: 'Deputy Assistant Director',
      grade: 'BPS-17',
      startDate: '2024-02-15',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0300-2345678', type: 'whatsapp' },
        { id: 'c2', label: 'Official Call', number: '0333-8765432', type: 'call' },
      ],
    },
    secondIncharge: {
      name: 'Farhan Ali Lashari',
      designation: 'Registration Officer',
      grade: 'BPS-16',
      startDate: '2024-03-01',
      contacts: [
        { id: 'sc1', label: 'WhatsApp & Call', number: '0301-3456789', type: 'both' },
      ],
    },
    assistant: {
      name: 'Shahbaz Ali Soomro',
      designation: 'Office Assistant (OA)',
      grade: 'BPS-14',
      responsibilities: 'Evening shift cash reconciliation, OneApp token monitoring, evening closing registers, vault security handover.',
      mobileNumber: '0303-4567890',
      whatsappNumber: '0303-4567890',
      startDate: '2024-03-01',
      contacts: [
        { id: 'ac1', label: 'WhatsApp Direct', number: '0303-4567890', type: 'whatsapp' },
      ],
    },
    leadershipHistory: [
      {
        id: 'ten-10501e-1',
        role: 'OIC',
        roleTitle: 'Office Incharge (OIC)',
        name: 'Kamran Haider Shaikh',
        designation: 'Assistant Director',
        grade: 'BPS-17',
        contact: '0302-7766554',
        startDate: '2023-01-01',
        endDate: '2024-02-14',
        isCurrent: false,
        tenureDuration: '1 yr, 1 mo, 14 days (409 days / 58 wks)',
        remarks: 'Transferred to RHQ Karachi',
      },
    ],
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 1,
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
    id: 'dau-52466',
    code: '52466',
    name: 'NRC Executive Larkana',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'Executive NRC',
    isActive: true,
    totalCounters: 4,
    expectedStaff: 12,
    dailyCapacity: 200,
    landline: '074-9410188',
    address: 'VIP Road, Civil Lines, Larkana',
    latitude: 27.5621,
    longitude: 68.2095,
    incharge: {
      name: 'Ghulam Mustafa Abro',
      designation: 'Assistant Director / Executive Incharge',
      grade: 'BPS-17',
      startDate: '2023-11-01',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0300-3456789', type: 'whatsapp' },
        { id: 'c2', label: 'Official Desk', number: '074-9410189', type: 'landline' },
      ],
    },
    secondIncharge: {
      name: 'Zubair Ahmed Shaikh',
      designation: 'Senior Registration Executive',
      grade: 'BPS-16',
      startDate: '2024-01-15',
      contacts: [
        { id: 'sc1', label: 'Call & WhatsApp', number: '0332-1234567', type: 'both' },
      ],
    },
    assistant: {
      name: 'Bashir Ahmed Tunio',
      designation: 'Office Assistant (OA)',
      grade: 'BPS-14',
      responsibilities: 'Executive VIP applicant assistance, Pak-ID online verification desk, fee receipt audit, biometric card tracking.',
      mobileNumber: '0313-1122334',
      whatsappNumber: '0313-1122334',
      startDate: '2024-02-01',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0313-1122334', type: 'both' },
      ],
    },
    leadershipHistory: [
      {
        id: 'ten-52466-1',
        role: 'OIC',
        roleTitle: 'Office Incharge (OIC)',
        name: 'Nadeem Akhtar Bhutto',
        designation: 'Senior Assistant Director',
        grade: 'BPS-18',
        contact: '0300-5544332',
        startDate: '2022-05-15',
        endDate: '2023-10-31',
        isCurrent: false,
        tenureDuration: '1 yr, 5 mos, 16 days (534 days / 76 wks)',
        remarks: 'Promoted to Deputy Director Zonal Operations',
      },
    ],
    staffBreakdown: {
      officersMale: 2,
      officersFemale: 1,
      officialsMale: 4,
      officialsFemale: 3,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 12,
    },
  },
  {
    id: 'dau-10532',
    code: '10532',
    name: 'NRC Ratodero',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 4,
    expectedStaff: 10,
    dailyCapacity: 200,
    landline: '074-7120111',
    address: 'Near Old Bus Stand, Main Ratodero Bazar, Ratodero',
    latitude: 27.8028,
    longitude: 68.2888,
    incharge: {
      name: 'Imtiaz Ali Soomro',
      designation: 'Assistant Director / Tehsil Incharge',
      grade: 'BPS-17',
      startDate: '2023-09-01',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0300-4567890', type: 'whatsapp' },
        { id: 'c2', label: 'Official Mobile', number: '0345-1234567', type: 'call' },
      ],
    },
    secondIncharge: {
      name: 'Mazhar Ali Dayo',
      designation: 'Superintendent',
      grade: 'BPS-16',
      startDate: '2024-01-01',
      contacts: [
        { id: 'sc1', label: 'Call', number: '0301-4455667', type: 'call' },
      ],
    },
    assistant: {
      name: 'Ghulam Rasool Mangi',
      designation: 'Office Assistant (OA)',
      grade: 'BPS-14',
      responsibilities: 'Tehsil public attendance logs, counter ticket dispatch, local union council reconciliation, archive storage.',
      mobileNumber: '0302-5566778',
      whatsappNumber: '0302-5566778',
      startDate: '2023-10-15',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0302-5566778', type: 'both' },
      ],
    },
    leadershipHistory: [
      {
        id: 'ten-10532-1',
        role: 'OIC',
        roleTitle: 'Office Incharge (OIC)',
        name: 'Abdul Fattah Khuhro',
        designation: 'Superintendent / Acting Incharge',
        grade: 'BPS-16',
        startDate: '2022-08-01',
        endDate: '2023-08-31',
        isCurrent: false,
        tenureDuration: '1 yr, 30 days (395 days / 56 wks)',
        remarks: 'Completed acting tenure successfully',
      },
    ],
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 5,
      officialsFemale: 2,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 10,
    },
  },
  {
    id: 'dau-10521',
    code: '10521',
    name: 'NRC Dokri',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 8,
    dailyCapacity: 150,
    landline: '074-4050222',
    address: 'Near Taluka Hospital, Mohenjo Daro Road, Dokri',
    latitude: 27.3756,
    longitude: 68.0984,
    incharge: {
      name: 'Nisar Ahmed Dayo',
      designation: 'Registration Officer / Incharge',
      grade: 'BPS-17',
      startDate: '2024-01-05',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0300-5678901', type: 'whatsapp' },
        { id: 'c2', label: 'Call', number: '0333-6789012', type: 'call' },
      ],
    },
    secondIncharge: {
      name: 'Mukhtiar Ali Kalhoro',
      designation: 'Senior Executive',
      grade: 'BPS-16',
      startDate: '2024-02-01',
      contacts: [
        { id: 'sc1', label: 'Call', number: '0303-8899001', type: 'call' },
      ],
    },
    assistant: {
      name: 'Bilawal Ali Sangi',
      designation: 'Office Assistant (OA)',
      grade: 'BPS-11',
      responsibilities: 'Daily reporting to Larkana Zonal office, queue token coordination, CNIC collection registers.',
      mobileNumber: '0304-9988776',
      whatsappNumber: '0304-9988776',
      startDate: '2024-02-10',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0304-9988776', type: 'both' },
      ],
    },
    leadershipHistory: [
      {
        id: 'ten-10521-1',
        role: 'OIC',
        roleTitle: 'Office Incharge (OIC)',
        name: 'Suhail Ahmed Memon',
        designation: 'Registration Officer',
        grade: 'BPS-16',
        startDate: '2022-11-01',
        endDate: '2024-01-04',
        isCurrent: false,
        tenureDuration: '1 yr, 2 mos, 3 days (429 days / 61 wks)',
        remarks: 'Transferred to NRC Naudero',
      },
    ],
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
    id: 'dau-50415',
    code: '50415',
    name: 'NRC Naudero',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 8,
    dailyCapacity: 160,
    landline: '074-4040333',
    address: 'Near Municipal Committee Office, Main Road, Naudero',
    latitude: 27.6583,
    longitude: 68.3583,
    incharge: {
      name: 'Farooq Ahmed Jalbani',
      designation: 'Assistant Incharge / Registration Officer',
      grade: 'BPS-16',
      startDate: '2024-01-10',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0300-6789012', type: 'whatsapp' },
        { id: 'c2', label: 'Official Call', number: '0312-3456789', type: 'call' },
      ],
    },
    secondIncharge: {
      name: 'Riaz Hussain Shah',
      designation: 'Senior Registration Executive',
      grade: 'BPS-16',
      startDate: '2024-02-15',
      contacts: [
        { id: 'sc1', label: 'WhatsApp & Call', number: '0306-1122334', type: 'both' },
      ],
    },
    assistant: {
      name: 'Abdul Qadir Hakro',
      designation: 'Office Assistant (OA)',
      grade: 'BPS-14',
      responsibilities: 'Daily token reporting, staff biometric sign-in register, OneApp reconciliation records.',
      mobileNumber: '0305-2233445',
      whatsappNumber: '0305-2233445',
      startDate: '2024-01-15',
      contacts: [
        { id: 'ac1', label: 'WhatsApp Direct', number: '0305-2233445', type: 'whatsapp' },
      ],
    },
    leadershipHistory: [
      {
        id: 'ten-50415-1',
        role: 'OIC',
        roleTitle: 'Office Incharge (OIC)',
        name: 'Zameer Hussain Jatoi',
        designation: 'Assistant Director',
        grade: 'BPS-17',
        startDate: '2023-01-15',
        endDate: '2024-01-09',
        isCurrent: false,
        tenureDuration: '11 mos, 25 days (359 days / 51 wks)',
        remarks: 'Transferred on official rotation',
      },
    ],
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
    id: 'dau-51210',
    code: '51210',
    name: 'NRC Baqrani',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC',
    isActive: true,
    totalCounters: 3,
    expectedStaff: 8,
    dailyCapacity: 140,
    landline: '074-4060444',
    address: 'Near Rural Health Center, Baqrani, Larkana',
    latitude: 27.4333,
    longitude: 68.1833,
    incharge: {
      name: 'Liaquat Ali Bughio',
      designation: 'Registration Officer / Incharge',
      grade: 'BPS-16',
      startDate: '2023-12-01',
      contacts: [
        { id: 'c1', label: 'WhatsApp & Call', number: '0300-7890123', type: 'both' },
      ],
    },
    secondIncharge: {
      name: 'Fayaz Ahmed Solangi',
      designation: 'Executive Officer',
      grade: 'BPS-16',
      startDate: '2024-02-01',
      contacts: [
        { id: 'sc1', label: 'Call', number: '0307-8901234', type: 'call' },
      ],
    },
    assistant: {
      name: 'Mansoor Ali Brohi',
      designation: 'Office Assistant (OA)',
      grade: 'BPS-11',
      responsibilities: 'Front desk reception, token issuing, daily closing register and verification stamps custody.',
      mobileNumber: '0306-3344556',
      whatsappNumber: '0306-3344556',
      startDate: '2024-01-01',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0306-3344556', type: 'both' },
      ],
    },
    leadershipHistory: [],
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
    id: 'dau-51485',
    code: '51485',
    name: 'MRV-43',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'MRV',
    isActive: true,
    totalCounters: 2,
    expectedStaff: 5,
    dailyCapacity: 120,
    landline: '074-9410199',
    address: 'Mobile Registration Van Station, Larkana Zone Fleet',
    latitude: 27.5600,
    longitude: 68.2100,
    incharge: {
      name: 'Saeed Ahmed Channa',
      designation: 'Field Mobile Officer (MRV Incharge)',
      grade: 'BPS-16',
      startDate: '2023-06-01',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0304-2233445', type: 'whatsapp' },
        { id: 'c2', label: 'Official Mobile', number: '0313-3344556', type: 'call' },
      ],
    },
    secondIncharge: {
      name: 'Khadim Hussain Magsi',
      designation: 'Technical Driver & Field Operator',
      grade: 'BPS-11',
      startDate: '2023-07-01',
      contacts: [
        { id: 'sc1', label: 'Call & WhatsApp', number: '0345-6677889', type: 'both' },
      ],
    },
    assistant: {
      name: 'Naseer Ahmed Junejo',
      designation: 'Field Assistant (MRV)',
      grade: 'BPS-11',
      responsibilities: 'Van generator operation, mobile satellite link monitoring, field token queue and remote village registration logs.',
      mobileNumber: '0307-4455667',
      whatsappNumber: '0307-4455667',
      startDate: '2023-08-01',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0307-4455667', type: 'both' },
      ],
    },
    leadershipHistory: [],
    staffBreakdown: {
      officersMale: 1,
      officersFemale: 0,
      officialsMale: 2,
      officialsFemale: 1,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 5,
    },
  },
  {
    id: 'dau-52061',
    code: '52061',
    name: 'UC Akil',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC Counter',
    isActive: true,
    totalCounters: 1,
    expectedStaff: 3,
    dailyCapacity: 80,
    landline: '074-9201010',
    address: 'Union Council Office Building, Akil, Taluka Larkana',
    latitude: 27.5120,
    longitude: 68.2710,
    incharge: {
      name: 'Zahid Hussain Abro',
      designation: 'Counter Supervisor / DEO',
      grade: 'BPS-14',
      startDate: '2024-01-01',
      contacts: [
        { id: 'c1', label: 'WhatsApp & Call', number: '0301-8899002', type: 'both' },
      ],
    },
    assistant: {
      name: 'Tanveer Ahmed Khuhro',
      designation: 'Counter Assistant (OA)',
      grade: 'BPS-11',
      responsibilities: 'UC citizen token register, OneApp biometric verification assistance, daily progress entry.',
      mobileNumber: '0308-5566778',
      whatsappNumber: '0308-5566778',
      startDate: '2024-01-01',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0308-5566778', type: 'both' },
      ],
    },
    leadershipHistory: [],
    staffBreakdown: {
      officersMale: 0,
      officersFemale: 0,
      officialsMale: 2,
      officialsFemale: 0,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 0,
      outsourceFemale: 0,
      totalStaff: 3,
    },
  },
  {
    id: 'dau-52059',
    code: '52059',
    name: 'UC TC Badeh',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC Counter',
    isActive: true,
    totalCounters: 2,
    expectedStaff: 4,
    dailyCapacity: 100,
    landline: '074-9201011',
    address: 'Town Committee Office, Main Badeh Bazar, Taluka Dokri',
    latitude: 27.3410,
    longitude: 68.0430,
    incharge: {
      name: 'Mumtaz Ali Sangi',
      designation: 'Counter Incharge',
      grade: 'BPS-14',
      startDate: '2024-01-15',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0302-9900112', type: 'whatsapp' },
      ],
    },
    assistant: {
      name: 'Hafeezullah Junejo',
      designation: 'Counter Assistant (OA)',
      grade: 'BPS-11',
      responsibilities: 'TC Badeh queue guidance, citizen biometric scanning, register maintenance.',
      mobileNumber: '0309-6677889',
      whatsappNumber: '0309-6677889',
      startDate: '2024-01-15',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0309-6677889', type: 'both' },
      ],
    },
    leadershipHistory: [],
    staffBreakdown: {
      officersMale: 0,
      officersFemale: 0,
      officialsMale: 2,
      officialsFemale: 1,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 0,
      outsourceFemale: 0,
      totalStaff: 4,
    },
  },
  {
    id: 'dau-52060',
    code: '52060',
    name: 'UC MC Ratodero',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC Counter',
    isActive: true,
    totalCounters: 2,
    expectedStaff: 4,
    dailyCapacity: 100,
    landline: '074-9201012',
    address: 'Municipal Committee Office, City Center, Ratodero',
    latitude: 27.8040,
    longitude: 68.2910,
    incharge: {
      name: 'Sikandar Ali Mirani',
      designation: 'Senior DEO / Incharge',
      grade: 'BPS-14',
      startDate: '2024-01-20',
      contacts: [
        { id: 'c1', label: 'WhatsApp & Call', number: '0303-1122445', type: 'both' },
      ],
    },
    assistant: {
      name: 'Abdul Nabi Kalhoro',
      designation: 'Counter Assistant (OA)',
      grade: 'BPS-11',
      responsibilities: 'MC counter daily reconciliation, token tally, citizen guidance.',
      mobileNumber: '0310-7788990',
      whatsappNumber: '0310-7788990',
      startDate: '2024-01-20',
      contacts: [
        { id: 'ac1', label: 'WhatsApp & Call', number: '0310-7788990', type: 'both' },
      ],
    },
    leadershipHistory: [],
    staffBreakdown: {
      officersMale: 0,
      officersFemale: 0,
      officialsMale: 2,
      officialsFemale: 1,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 0,
      outsourceFemale: 0,
      totalStaff: 4,
    },
  },
  {
    id: 'dau-52062',
    code: '52062',
    name: 'UC Dhamrah',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC Counter',
    isActive: true,
    totalCounters: 1,
    expectedStaff: 3,
    dailyCapacity: 80,
    landline: '074-9201013',
    address: 'Union Council Office Building, Dhamrah, Taluka Larkana',
    latitude: 27.5920,
    longitude: 68.1450,
    incharge: {
      name: 'Waseem Akram Brohi',
      designation: 'Counter Incharge',
      grade: 'BPS-14',
      startDate: '2024-02-01',
      contacts: [
        { id: 'c1', label: 'WhatsApp & Call', number: '0305-1122338', type: 'both' },
      ],
    },
    assistant: {
      name: 'Kashif Ali Soomro',
      designation: 'Counter Assistant (OA)',
      grade: 'BPS-11',
      responsibilities: 'Daily token logs, receipt slips and evening data upload verification.',
      mobileNumber: '0311-8899001',
      whatsappNumber: '0311-8899001',
      startDate: '2024-02-01',
      contacts: [
        { id: 'ac1', label: 'WhatsApp Direct', number: '0311-8899001', type: 'whatsapp' },
      ],
    },
    leadershipHistory: [],
    staffBreakdown: {
      officersMale: 0,
      officersFemale: 0,
      officialsMale: 2,
      officialsFemale: 0,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 0,
      outsourceFemale: 0,
      totalStaff: 3,
    },
  },
  {
    id: 'dau-52063',
    code: '52063',
    name: 'UC Bero Chandio',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC Counter',
    isActive: true,
    totalCounters: 1,
    expectedStaff: 3,
    dailyCapacity: 80,
    landline: '074-9201014',
    address: 'Union Council Office, Bero Chandio, Larkana',
    latitude: 27.4890,
    longitude: 68.0550,
    incharge: {
      name: 'Noman Ali Kalhoro',
      designation: 'Counter Supervisor',
      grade: 'BPS-14',
      startDate: '2024-02-01',
      contacts: [
        { id: 'c1', label: 'WhatsApp & Call', number: '0306-2233449', type: 'both' },
      ],
    },
    assistant: {
      name: 'Shahid Hussain Abbasi',
      designation: 'DEO & Assistant (OA)',
      grade: 'BPS-11',
      responsibilities: 'UC Bero Chandio counter operations and attendance register.',
      mobileNumber: '0346-3344550',
      whatsappNumber: '0346-3344550',
      startDate: '2024-02-01',
      contacts: [
        { id: 'ac1', label: 'Call & WhatsApp', number: '0346-3344550', type: 'both' },
      ],
    },
    leadershipHistory: [],
    staffBreakdown: {
      officersMale: 0,
      officersFemale: 0,
      officialsMale: 2,
      officialsFemale: 0,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 0,
      outsourceFemale: 0,
      totalStaff: 3,
    },
  },
  {
    id: 'dau-52064',
    code: '52064',
    name: 'UC Garhi Khuda Bux',
    district: 'Larkana',
    zone: 'Zone-D Larkana',
    zoneName: 'Larkana',
    zoneCode: 'Z050D',
    type: 'NRC Counter',
    isActive: true,
    totalCounters: 2,
    expectedStaff: 4,
    dailyCapacity: 100,
    landline: '074-9201015',
    address: 'Union Council Office, Near Mazar Complex, Garhi Khuda Bux, Larkana',
    latitude: 27.6830,
    longitude: 68.3750,
    incharge: {
      name: 'Aftab Ahmed Tunio',
      designation: 'Counter Incharge',
      grade: 'BPS-14',
      startDate: '2024-01-10',
      contacts: [
        { id: 'c1', label: 'WhatsApp', number: '0307-3344560', type: 'whatsapp' },
        { id: 'c2', label: 'Call', number: '0334-4455671', type: 'call' },
      ],
    },
    assistant: {
      name: 'Bakhtawar Jan Solangi',
      designation: 'Female DEO & Assistant (OA)',
      grade: 'BPS-12',
      responsibilities: 'Female citizen biometric assistance, token management, daily report submission.',
      mobileNumber: '0308-5566782',
      whatsappNumber: '0308-5566782',
      startDate: '2024-01-10',
      contacts: [
        { id: 'ac1', label: 'Call & WhatsApp', number: '0308-5566782', type: 'both' },
      ],
    },
    leadershipHistory: [],
    staffBreakdown: {
      officersMale: 0,
      officersFemale: 0,
      officialsMale: 2,
      officialsFemale: 1,
      supportingMale: 1,
      supportingFemale: 0,
      outsourceMale: 0,
      outsourceFemale: 0,
      totalStaff: 4,
    },
  },
];

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
    let loadedState: DatabaseState | null = null;
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        loadedState = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database file, reinitializing fresh:', err);
      }
    }

    if (loadedState && Array.isArray(loadedState.offices) && loadedState.offices.length > 0) {
      // Check if offices have old placeholder codes like "LKR-M01"
      const hasOldCodes = loadedState.offices.some(o => o.code.startsWith('LKR-') || o.code.startsWith('UC-'));
      const activeOffices = hasOldCodes ? [...INITIAL_OFFICES] : loadedState.offices;

      const state: DatabaseState = {
        users: loadedState.users && loadedState.users.length ? loadedState.users : DEFAULT_USERS,
        offices: activeOffices,
        dailyReports: loadedState.dailyReports || [],
        dataQualityIssues: loadedState.dataQualityIssues || [],
        auditLogs: loadedState.auditLogs || [],
        settings: {
          ...DEFAULT_SETTINGS,
          ...(loadedState.settings || {}),
        },
        attendanceRecords: loadedState.attendanceRecords || [],
        employees: loadedState.employees && loadedState.employees.length ? loadedState.employees : [...INITIAL_EMPLOYEES],
      };

      if (hasOldCodes || !loadedState.employees) {
        this.saveStateToDisk(state);
      }
      return state;
    }

    // Fresh initialization: No dummy reports, no dummy attendance
    const initialState: DatabaseState = {
      users: DEFAULT_USERS,
      offices: [...INITIAL_OFFICES],
      dailyReports: [],
      dataQualityIssues: [],
      employees: [...INITIAL_EMPLOYEES],
      auditLogs: [
        {
          id: `log-init-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: 'u-1',
          userName: 'System Initialization',
          userRole: 'SUPER_ADMIN',
          action: 'CONFIG_CHANGE',
          details: 'Initialized NADRA Zone-D Larkana database with official centers and DAU codes (10501, 52466, 10532, 10521, 50415, 51210, 51485, 52061, 52059, 52060). Ready for live operational entries.',
        },
      ],
      settings: DEFAULT_SETTINGS,
      attendanceRecords: [],
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

  public getOfficeById(id: string): Office | undefined {
    return this.state.offices.find(o => o.id === id);
  }

  public getOfficeByCode(code: string): Office | undefined {
    return this.state.offices.find(o => o.code.toUpperCase() === code.toUpperCase());
  }

  public getOfficeByIdentifier(identifier: string): Office | undefined {
    if (!identifier) return undefined;
    return this.state.offices.find(
      o => (o.id && o.id.toLowerCase() === identifier.toLowerCase()) ||
           o.code.toUpperCase() === identifier.toUpperCase()
    );
  }

  public saveOffice(
    office: Office,
    actor: { id: string; name: string; role: any },
    previousIdentifier?: string
  ): Office {
    let idx = -1;

    // 1. Match by unique ID if present
    if (office.id) {
      idx = this.state.offices.findIndex(o => o.id === office.id);
    }
    // 2. Match by previous identifier
    if (idx < 0 && previousIdentifier) {
      idx = this.state.offices.findIndex(
        o => (o.id && o.id === previousIdentifier) || o.code.toUpperCase() === previousIdentifier.toUpperCase()
      );
    }
    // 3. Match by shift + code (for Larkana morning/evening)
    if (idx < 0 && office.shift) {
      idx = this.state.offices.findIndex(
        o => o.code.toUpperCase() === office.code.toUpperCase() && o.shift === office.shift
      );
    }
    // 4. Match by code
    if (idx < 0) {
      idx = this.state.offices.findIndex(o => o.code.toUpperCase() === office.code.toUpperCase());
    }

    const oldOffice = idx >= 0 ? this.state.offices[idx] : null;
    const oldCode = oldOffice ? oldOffice.code : null;
    const oldName = oldOffice ? oldOffice.name : null;

    if (!office.id) {
      office.id = oldOffice?.id || `off-${office.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    }

    if (office.staffBreakdown) {
      const sb = office.staffBreakdown;
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
      office.expectedStaff = sb.totalStaff;
    }

    const mergedOffice: Office = {
      ...(oldOffice || {}),
      ...office,
      zoneName: office.zoneName || 'Larkana',
      zoneCode: office.zoneCode || 'Z050D',
      leadershipHistory: office.leadershipHistory || oldOffice?.leadershipHistory || [],
    };

    if (idx >= 0) {
      this.state.offices[idx] = mergedOffice;
    } else {
      this.state.offices.push(mergedOffice);
    }

    // CASCADE: If the code changed, cascade across daily reports, attendance records, issues, and user profiles
    if (oldCode && oldCode.toUpperCase() !== office.code.toUpperCase()) {
      // 1. Daily reports
      this.state.dailyReports.forEach(r => {
        if (r.officeCode.toUpperCase() === oldCode.toUpperCase()) {
          r.officeCode = office.code;
          r.officeName = office.name;
        }
      });

      // 2. Attendance records
      this.state.attendanceRecords.forEach(a => {
        if (a.officeCode.toUpperCase() === oldCode.toUpperCase()) {
          a.officeCode = office.code;
          a.officeName = office.name;
        }
      });

      // 3. Data quality issues
      this.state.dataQualityIssues.forEach(dq => {
        if (dq.officeCode.toUpperCase() === oldCode.toUpperCase()) {
          dq.officeCode = office.code;
          dq.officeName = office.name;
        }
      });

      // 4. Assigned user profiles
      this.state.users.forEach(u => {
        if (u.assignedOfficeCode && u.assignedOfficeCode.toUpperCase() === oldCode.toUpperCase()) {
          u.assignedOfficeCode = office.code;
        }
      });
    } else if (oldName && oldName !== office.name) {
      // Name changed, update in daily reports and attendance
      this.state.dailyReports.forEach(r => {
        if (r.officeCode.toUpperCase() === office.code.toUpperCase()) {
          r.officeName = office.name;
        }
      });
      this.state.attendanceRecords.forEach(a => {
        if (a.officeCode.toUpperCase() === office.code.toUpperCase()) {
          a.officeName = office.name;
        }
      });
    }

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CONFIG_CHANGE',
      details: `Saved office profile parameters for ${office.name} [Code: ${office.code}]. ${
        oldCode && oldCode.toUpperCase() !== office.code.toUpperCase()
          ? `Office code changed from ${oldCode} to ${office.code} with full database cascade.`
          : ''
      }`,
      officeCode: office.code,
    });

    this.persist();
    return mergedOffice;
  }

  public deleteOffice(identifier: string, actor: { id: string; name: string; role: any }): boolean {
    const target = this.state.offices.find(
      o => (o.id && o.id.toLowerCase() === identifier.toLowerCase()) ||
           o.code.toUpperCase() === identifier.toUpperCase()
    );
    if (!target) return false;

    this.state.offices = this.state.offices.filter(o => o !== target);
    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CONFIG_CHANGE',
      details: `Deleted office ${target.name} [Code: ${target.code}] from operational database.`,
      officeCode: target.code,
    });
    this.persist();
    return true;
  }

  public addTenureRecord(
    officeIdentifier: string,
    record: LeadershipTenureRecord,
    actor: { id: string; name: string; role: any }
  ): boolean {
    const office = this.getOfficeByIdentifier(officeIdentifier);
    if (!office) return false;

    if (!office.leadershipHistory) {
      office.leadershipHistory = [];
    }

    office.leadershipHistory.unshift(record);
    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CONFIG_CHANGE',
      details: `Recorded leadership tenure entry for ${record.name} (${record.roleTitle}) at ${office.name}.`,
      officeCode: office.code,
    });
    this.persist();
    return true;
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

  public deleteDailyReport(id: string, actor: { id: string; name: string; role: any }): boolean {
    const initialLen = this.state.dailyReports.length;
    this.state.dailyReports = this.state.dailyReports.filter(r => r.id !== id);
    if (this.state.dailyReports.length !== initialLen) {
      this.addAuditLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'EDIT_RECORD',
        details: `Deleted daily report ID [${id}]`,
      });
      this.persist();
      return true;
    }
    return false;
  }

  public batchImportReports(
    reports: OfficeDailyReport[],
    actor: { id: string; name: string; role: any },
    reportTitle?: string
  ): { addedCount: number; updatedCount: number } {
    let addedCount = 0;
    let updatedCount = 0;

    for (const rep of reports) {
      const idx = this.state.dailyReports.findIndex(
        r => r.officeCode.toUpperCase() === rep.officeCode.toUpperCase() && r.date === rep.date
      );
      if (idx >= 0) {
        this.state.dailyReports[idx] = {
          ...this.state.dailyReports[idx],
          ...rep,
          reportingStatus: 'REPORTED',
        };
        updatedCount++;
      } else {
        this.state.dailyReports.push({
          ...rep,
          reportingStatus: 'REPORTED',
        });
        addedCount++;
      }
    }

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CONFIRM_IMPORT',
      details: `Batch imported ${reports.length} daily reports (${addedCount} new, ${updatedCount} updated) via [${reportTitle || 'OCR / Manual Entry'}]`,
      reportingDate: reports[0]?.date,
    });

    this.persist();
    return { addedCount, updatedCount };
  }

  // --- Attendance Records ---
  public getAttendanceRecords(date?: string, officeCode?: string, status?: string): EmployeeAttendanceRecord[] {
    if (!this.state.attendanceRecords) return [];
    return this.state.attendanceRecords.filter(r => {
      if (date && r.date !== date) return false;
      if (officeCode && officeCode !== 'ALL' && r.officeCode.toUpperCase() !== officeCode.toUpperCase()) return false;
      if (status && status !== 'ALL' && r.status !== status) return false;
      return true;
    }).sort((a, b) => b.checkInTime.localeCompare(a.checkInTime));
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
      this.addAuditLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'EDIT_RECORD',
        details: `Updated attendance record for ${record.employeeName} (${record.officeName}) on ${record.date}`,
        reportingDate: record.date,
        officeCode: record.officeCode,
      });
    } else {
      this.state.attendanceRecords.unshift(record);
      this.addAuditLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'EDIT_RECORD',
        details: `Logged attendance check-in for ${record.employeeName} (${record.checkInTime}) at ${record.officeName}`,
        reportingDate: record.date,
        officeCode: record.officeCode,
      });
    }

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

  // --- Employee Profiles & HR Dossiers ---
  public getEmployees(officeCode?: string): EmployeeProfile[] {
    if (!this.state.employees) this.state.employees = [...INITIAL_EMPLOYEES];
    if (officeCode && officeCode !== 'ALL') {
      return this.state.employees.filter(
        (e) => e.officeCode.toUpperCase() === officeCode.toUpperCase()
      );
    }
    return this.state.employees;
  }

  public getEmployeeById(id: string): EmployeeProfile | null {
    if (!this.state.employees) this.state.employees = [...INITIAL_EMPLOYEES];
    return (
      this.state.employees.find(
        (e) => e.id === id || e.erpNumber.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  public saveEmployee(
    employee: EmployeeProfile,
    actor?: { id: string; name: string; role: any }
  ): EmployeeProfile {
    if (!this.state.employees) this.state.employees = [...INITIAL_EMPLOYEES];
    const idx = this.state.employees.findIndex(
      (e) => e.id === employee.id || e.erpNumber === employee.erpNumber
    );

    if (idx >= 0) {
      this.state.employees[idx] = { ...this.state.employees[idx], ...employee };
      if (actor) {
        this.addAuditLog({
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          action: 'EDIT_RECORD',
          details: `Updated employee profile for [${employee.name}] (${employee.erpNumber}) - ${employee.designation}`,
        });
      }
    } else {
      const created: EmployeeProfile = {
        ...employee,
        id: employee.id || `emp-${Date.now()}`,
      };
      this.state.employees.push(created);
      if (actor) {
        this.addAuditLog({
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          action: 'ADD_RECORD',
          details: `Created new employee dossier for [${employee.name}] (${employee.erpNumber})`,
        });
      }
    }

    this.persist();
    return employee;
  }

  public deleteEmployee(
    id: string,
    actor?: { id: string; name: string; role: any }
  ): boolean {
    if (!this.state.employees) return false;
    const initialLen = this.state.employees.length;
    this.state.employees = this.state.employees.filter(
      (e) => e.id !== id && e.erpNumber !== id
    );
    const deleted = this.state.employees.length < initialLen;
    if (deleted) {
      if (actor) {
        this.addAuditLog({
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          action: 'DELETE_RECORD',
          details: `Removed employee dossier ID: ${id}`,
        });
      }
      this.persist();
    }
    return deleted;
  }
}

export const db = new DatabaseService();
