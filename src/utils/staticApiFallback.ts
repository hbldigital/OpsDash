/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Office, User, DailyReport, EmployeeAttendanceRecord } from '../types';

const STORAGE_KEY = 'nadra_zone_d_operational_db_v2';

export const STATIC_INITIAL_OFFICES: Office[] = [
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
    longitude: 68.212,
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
    longitude: 68.212,
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
    leadershipHistory: [],
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
    name: 'Executive NRC Larkana',
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
    leadershipHistory: [],
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
    leadershipHistory: [],
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
    leadershipHistory: [],
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
    leadershipHistory: [],
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
    latitude: 27.56,
    longitude: 68.21,
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
    latitude: 27.512,
    longitude: 68.271,
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
    latitude: 27.341,
    longitude: 68.043,
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
    latitude: 27.804,
    longitude: 68.291,
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
    latitude: 27.592,
    longitude: 68.145,
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
    latitude: 27.489,
    longitude: 68.055,
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
    latitude: 27.683,
    longitude: 68.375,
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

interface ClientDatabase {
  offices: Office[];
  dailyReports: DailyReport[];
  attendanceRecords: EmployeeAttendanceRecord[];
}

function getStoredDatabase(): ClientDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.offices) && parsed.offices.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading from localStorage fallback, initializing fresh:', e);
  }

  const initial: ClientDatabase = {
    offices: [...STATIC_INITIAL_OFFICES],
    dailyReports: [],
    attendanceRecords: [],
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
}

function saveDatabase(db: ClientDatabase) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn('Failed saving to localStorage fallback:', e);
  }
}

/**
 * Initializes transparent client-side API interception.
 * When the app runs on GitHub Pages (static hosting without Node backend),
 * this completely intercepts fetch('/api/*') and fulfills it with local persistence.
 */
export function setupStaticApiFallback() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  const isGitHubPages =
    window.location.hostname.includes('github.io') ||
    window.location.hostname === 'localhost' && window.location.port !== '3000';

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Only intercept /api/ requests
    if (!url.includes('/api/')) {
      return originalFetch(input, init);
    }

    // If on Node dev server (not GitHub pages), try original fetch first!
    if (!isGitHubPages) {
      try {
        const response = await originalFetch(input, init);
        // If the server answered properly, return it!
        if (response.ok || response.status === 400 || response.status === 401 || response.status === 403) {
          const clone = response.clone();
          const contentType = clone.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            return response;
          }
        }
      } catch (networkErr) {
        // Server unreachable or network error, fallback to client-side database
      }
    }

    // --- CLIENT-SIDE LOCALSTORAGE API FALLBACK ---
    const method = (init?.method || 'GET').toUpperCase();
    const parsedUrl = new URL(url, window.location.origin);
    const rawPath = parsedUrl.pathname;
    const apiIndex = rawPath.indexOf('/api/');
    const pathname = apiIndex >= 0 ? rawPath.substring(apiIndex) : rawPath;
    const db = getStoredDatabase();

    const makeJsonResponse = (data: any, status: number = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    // 1. GET /api/offices
    if (pathname === '/api/offices' && method === 'GET') {
      return makeJsonResponse({ success: true, offices: db.offices });
    }

    // 2. GET /api/offices/:identifier
    if (pathname.startsWith('/api/offices/') && method === 'GET' && !pathname.endsWith('/tenure')) {
      const identifier = decodeURIComponent(pathname.replace('/api/offices/', ''));
      const found = db.offices.find(
        (o) => (o.id && o.id.toLowerCase() === identifier.toLowerCase()) ||
               o.code.toUpperCase() === identifier.toUpperCase()
      );
      if (found) {
        return makeJsonResponse({ success: true, office: found });
      }
      return makeJsonResponse({ success: false, error: 'Office not found' }, 404);
    }

    // 3. POST /api/offices
    if (pathname === '/api/offices' && method === 'POST') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const newOffice: Office = {
        ...body,
        id: body.id || `dau-${(body.code || 'off').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
        code: (body.code || '10500').trim(),
        name: (body.name || 'New Office').trim(),
      };
      db.offices.push(newOffice);
      saveDatabase(db);
      return makeJsonResponse({ success: true, office: newOffice });
    }

    // 4. PUT /api/offices/:identifier
    if (pathname.startsWith('/api/offices/') && method === 'PUT') {
      const identifier = decodeURIComponent(pathname.replace('/api/offices/', ''));
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const idx = db.offices.findIndex(
        (o) => (o.id && o.id.toLowerCase() === identifier.toLowerCase()) ||
               o.code.toUpperCase() === identifier.toUpperCase()
      );

      const oldOffice = idx >= 0 ? db.offices[idx] : null;
      const oldCode = oldOffice?.code;

      const merged: Office = {
        ...(oldOffice || {}),
        ...body,
        id: oldOffice?.id || body.id || identifier,
      };

      if (idx >= 0) {
        db.offices[idx] = merged;
      } else {
        db.offices.push(merged);
      }

      // Cascade code changes across local reports and attendance
      if (oldCode && oldCode.toUpperCase() !== merged.code.toUpperCase()) {
        db.dailyReports.forEach((r) => {
          if (r.officeCode.toUpperCase() === oldCode.toUpperCase()) {
            r.officeCode = merged.code;
            r.officeName = merged.name;
          }
        });
        db.attendanceRecords.forEach((a) => {
          if (a.officeCode.toUpperCase() === oldCode.toUpperCase()) {
            a.officeCode = merged.code;
            a.officeName = merged.name;
          }
        });
      }

      saveDatabase(db);
      return makeJsonResponse({ success: true, office: merged });
    }

    // 5. DELETE /api/offices/:identifier
    if (pathname.startsWith('/api/offices/') && method === 'DELETE') {
      const identifier = decodeURIComponent(pathname.replace('/api/offices/', ''));
      db.offices = db.offices.filter(
        (o) => (o.id && o.id.toLowerCase() !== identifier.toLowerCase()) &&
               o.code.toUpperCase() !== identifier.toUpperCase()
      );
      saveDatabase(db);
      return makeJsonResponse({ success: true });
    }

    // 6. POST /api/offices/:identifier/tenure
    if (pathname.endsWith('/tenure') && method === 'POST') {
      const identifier = decodeURIComponent(pathname.replace('/api/offices/', '').replace('/tenure', ''));
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const office = db.offices.find(
        (o) => (o.id && o.id.toLowerCase() === identifier.toLowerCase()) ||
               o.code.toUpperCase() === identifier.toUpperCase()
      );
      if (office) {
        if (!office.leadershipHistory) office.leadershipHistory = [];
        office.leadershipHistory.unshift({
          id: `ten-${Date.now()}`,
          role: body.role || 'OIC',
          roleTitle: body.roleTitle || 'Office Incharge (OIC)',
          name: body.name,
          designation: body.designation || 'Officer',
          grade: body.grade || 'BPS-17',
          startDate: body.startDate,
          endDate: body.endDate || '',
          isCurrent: !body.endDate,
          tenureDuration: body.tenureDuration || '',
          remarks: body.remarks || '',
        });
        saveDatabase(db);
        return makeJsonResponse({ success: true, office });
      }
      return makeJsonResponse({ success: false, error: 'Office not found' }, 404);
    }

    // 7. GET /api/dashboard/executive
    if (pathname === '/api/dashboard/executive' && method === 'GET') {
      const date = parsedUrl.searchParams.get('date') || '2026-10-25';
      const offices = db.offices;
      const reports = db.dailyReports.filter((r) => r.date === date || r.reportingDate === date);

      const rows = offices.map((o) => {
        const found = reports.find(
          (r: any) => r.officeCode.toUpperCase() === o.code.toUpperCase() &&
                 ((r.shift && o.shift) ? r.shift.toLowerCase() === o.shift.toLowerCase() : true)
        );

        if (found) {
          return {
            ...found,
            reportingDate: date,
            date,
            officeCode: o.code,
            officeName: o.name,
          };
        }

        // Return unique pending row with no duplicate key collisions
        return {
          id: `pending-${date}-${o.id || `${o.code}-${o.shift || 'reg'}`}`,
          date,
          reportingDate: date,
          zone: o.zone || 'Zone-D Larkana',
          zoneCode: o.zoneCode || 'Z050D',
          officeCode: o.code,
          officeName: o.name,
          reportingStatus: 'PENDING',
          totalEmployees: o.expectedStaff || 10,
          lateAfter745: 0,
          lateAfter800: 0,
          onTimeEmployees: o.expectedStaff || 10,
          qmaticIssued: 0,
          qmaticProcessed: 0,
          qmaticRemaining: 0,
          qmaticPercentage: null,
          oneappIssued: 0,
          oneappProcessed: 0,
          oneappSkipped: 0,
          oneappRemaining: 0,
          oneappReconciliationPercentage: null,
          oneAppIssued: 0,
          oneAppProcessed: 0,
          oneAppSkipped: 0,
          oneAppRemaining: 0,
          oneAppReconciliationPercentage: null,
          approvedOneApp: 0,
          prevDayApprovedOneApp: 0,
          previousDayApproved: 0,
          approvedDifference: 0,
          diminishedFingerprintsMBVS: 0,
          proofOfLifeCertificates: 0,
          proofOfLife: 0,
          pakidApproved: 0,
          pakidDeferred: 0,
          pakidCorrection: 0,
          hasDiscrepancy: false,
          discrepancies: [],
        };
      });

      const totalEmployees = rows.reduce((s, r) => s + (Number(r.totalEmployees) || 0), 0);
      const onTimeEmployees = rows.reduce((s, r) => s + (Number(r.onTimeEmployees) || 0), 0);
      const lateAfter745 = rows.reduce((s, r) => s + (Number(r.lateAfter745) || 0), 0);
      const lateAfter800 = rows.reduce((s, r) => s + (Number(r.lateAfter800) || 0), 0);

      const zoneSummary = {
        date,
        zoneName: 'Larkana',
        zoneCode: 'Z050D',
        totalOffices: offices.length,
        totalActiveOffices: offices.length,
        reportedOfficesCount: reports.length,
        missingOfficesCount: Math.max(0, offices.length - reports.length),
        coveragePercentage: offices.length ? Math.round((reports.length / offices.length) * 100) : 100,
        totalEmployees,
        onTimeEmployees,
        lateAfter745,
        lateAfter800,
        punctualityPercentage: totalEmployees ? Math.round((onTimeEmployees / totalEmployees) * 100) : 100,
        qmaticIssued: rows.reduce((s, r) => s + (Number(r.qmaticIssued) || 0), 0),
        qmaticProcessed: rows.reduce((s, r) => s + (Number(r.qmaticProcessed) || 0), 0),
        qmaticRemaining: 0,
        qmaticEfficiencyPercentage: null,
        oneappIssued: rows.reduce((s, r) => s + (Number(r.oneappIssued || r.oneAppIssued) || 0), 0),
        oneappProcessed: rows.reduce((s, r) => s + (Number(r.oneappProcessed || r.oneAppProcessed) || 0), 0),
        oneappSkipped: 0,
        oneappRemaining: 0,
        oneappReconciliationPercentage: null,
        approvedOneApp: rows.reduce((s, r) => s + (Number(r.approvedOneApp) || 0), 0),
        prevDayApprovedOneApp: 0,
        diminishedFingerprintsMBVS: 0,
        proofOfLifeCertificates: 0,
        proofOfLife: 0,
        pakidApproved: 0,
        pakidDeferred: 0,
        pakidCorrection: 0,
        unresolvedDiscrepanciesCount: 0,
      };

      return makeJsonResponse({
        success: true,
        summary: zoneSummary,
        zoneSummary,
        reports: rows,
        offices: rows,
      });
    }

    // 8. GET /api/attendance
    if (pathname === '/api/attendance' && method === 'GET') {
      const date = parsedUrl.searchParams.get('date');
      const officeCode = parsedUrl.searchParams.get('officeCode');
      const filtered = db.attendanceRecords.filter((r) => {
        if (date && r.date !== date) return false;
        if (officeCode && officeCode !== 'ALL' && r.officeCode.toUpperCase() !== officeCode.toUpperCase()) return false;
        return true;
      });
      return makeJsonResponse({ success: true, records: filtered, count: filtered.length });
    }

    // 9. POST /api/attendance
    if (pathname === '/api/attendance' && method === 'POST') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const newRec: EmployeeAttendanceRecord = {
        id: body.id || `att-${Date.now()}`,
        date: body.date || '2026-10-25',
        officeCode: body.officeCode || '10501',
        officeName: body.officeName || 'NRC Larkana (Morning Shift)',
        employeeId: body.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
        employeeName: body.employeeName || 'Staff Member',
        designation: body.designation || 'Registration Executive',
        category: body.category || 'OFFICIAL',
        gender: body.gender || 'MALE',
        checkInTime: body.checkInTime || '07:35',
        status: body.status || 'ON_TIME',
        notes: body.notes || '',
        source: body.source || 'MANUAL',
      };
      db.attendanceRecords.unshift(newRec);
      saveDatabase(db);
      return makeJsonResponse({ success: true, record: newRec });
    }

    // 10. POST /api/attendance/batch-import
    if (pathname === '/api/attendance/batch-import' && method === 'POST') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const records: EmployeeAttendanceRecord[] = body.records || [];
      records.forEach((rec) => db.attendanceRecords.unshift(rec));
      saveDatabase(db);
      return makeJsonResponse({ success: true, addedCount: records.length, updatedCount: 0 });
    }

    // 11. GET /api/reports/history
    if (pathname === '/api/reports/history' && method === 'GET') {
      return makeJsonResponse({ success: true, reports: db.dailyReports });
    }

    // 12. POST /api/reports/entry
    if (pathname === '/api/reports/entry' && method === 'POST') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const idx = db.dailyReports.findIndex(
        (r) => r.officeCode.toUpperCase() === (body.officeCode || '').toUpperCase() &&
               (r.date === body.date || r.reportingDate === body.date)
      );
      if (idx >= 0) {
        db.dailyReports[idx] = { ...db.dailyReports[idx], ...body };
      } else {
        db.dailyReports.push({
          ...body,
          id: body.id || `rep-${Date.now()}`,
        });
      }
      saveDatabase(db);
      return makeJsonResponse({ success: true, report: body });
    }

    // 13. Auth and Settings
    if (pathname === '/api/auth/users') {
      return makeJsonResponse({
        success: true,
        users: [
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
        ],
      });
    }

    if (pathname === '/api/auth/me') {
      return makeJsonResponse({
        success: true,
        user: {
          id: 'u-1',
          name: 'Muhammad Tariq Khan',
          email: 'zone.director@nadra.gov.pk',
          role: 'ZONE_ADMIN',
          zone: 'Zone-D Larkana',
        },
      });
    }

    if (pathname === '/api/settings') {
      return makeJsonResponse({
        success: true,
        settings: {
          zoneName: 'Larkana',
          zoneCode: 'Z050D',
          organizationName: 'National Database and Registration Authority (NADRA)',
          thresholdTime1: '07:45',
          thresholdTime2: '08:00',
          timeZone: 'Asia/Karachi',
          customTexts: {
            appHeaderTitle: 'NADRA Zone-D Larkana Operational Intelligence',
            appHeaderSubtitle: 'National Database & Registration Authority — Regional Operations Dashboard',
            zoneTitle: 'Zone-D Larkana (Z050D)',
            tableTitle: 'Consolidated Zone-D Larkana Office Operations Table',
            attendanceTitle: 'Workforce Attendance & Punctuality Register',
            officeProfileTitle: 'NADRA Registration Center / DAU Official Profile',
            footerDisclaimer: 'Official Operational Record of NADRA Zone-D Larkana. Strict Data Integrity Standards Enforced.',
          },
        },
      });
    }

    if (pathname.includes('/api/data-quality')) {
      return makeJsonResponse({ success: true, issues: [] });
    }

    // Default 200 response for any unhandled /api route
    return makeJsonResponse({ success: true });
  };
}
