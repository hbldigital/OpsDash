/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const NADRA_DESIGNATIONS = [
  'Junior Executive',
  'Senior Executive',
  'Registration Executive',
  'Assistant Superintendent',
  'Deputy Superintendent',
  'Superintendent',
  'Deputy Assistant Director',
  'Assistant Director',
  'Deputy Director',
  'Director',
  'Director General',
  'CISO',
  'CIO',
  'CEO',
  'Chairman',
  'COO',
  'HOD',
  'CHRO',
  'Naib Qasid',
  'Sweeper',
  'Sanitary Worker',
  'Security Guard',
] as const;

export const NADRA_GRADES = [
  // BPS 1-22
  ...Array.from({ length: 22 }, (_, i) => `BPS-${i + 1}`),
  // NPS 1-20
  ...Array.from({ length: 20 }, (_, i) => `NPS-${i + 1}`),
  // O 1-20
  ...Array.from({ length: 20 }, (_, i) => `O-${i + 1}`),
  // T 1-20
  ...Array.from({ length: 20 }, (_, i) => `T-${i + 1}`),
] as const;

export const NADRA_DEPARTMENTS = [
  'Operations',
  'Technical',
  'IS',
  'C&IT',
  'Admin',
  'CRMS',
  'HR',
  'Legal',
  'Networks',
  'Project',
  'Vigilance',
  'Succession',
] as const;

export const OPERATIONS_WORKING_SEATS = [
  'OWC',
  'OA',
  'OIC',
  '2OIC',
  'CDC',
  'Receiving',
  'Scanning',
  'Madadgar',
  'Token',
  'Information Desk',
  'Card Delivery',
] as const;

export const OTHER_WORKING_SEATS: Record<string, string[]> = {
  Technical: ['Network Engineer', 'Hardware Technician', 'System Administrator', 'Database Specialist', 'Biometric Support'],
  IS: ['Information Security Analyst', 'Incident Responder', 'Compliance Auditor', 'Threat Intelligence'],
  'C&IT': ['Software Developer', 'Quality Assurance', 'DevOps Specialist', 'Helpdesk Officer'],
  Admin: ['Admin Officer', 'Transport Incharge', 'Inventory Supervisor', 'Store Keeper', 'Security Incharge'],
  CRMS: ['Birth Register Officer', 'Marriage Verification Officer', 'Death Verification Officer', 'Union Council Liaison'],
  HR: ['HR Officer', 'Payroll Specialist', 'Recruitment Coordinator', 'Training Officer'],
  Legal: ['Law Officer', 'Litigation Associate', 'Court Liaison Officer', 'Legal Advisor'],
  Networks: ['LAN/WAN Engineer', 'VSAT Technician', 'Fiber Optics Technician', 'Router/Switch Specialist'],
  Project: ['Project Manager', 'Field Coordinator', 'Deployment Lead', 'M&E Specialist'],
  Vigilance: ['Vigilance Officer', 'Enquiry Officer', 'Surveillance Inspector', 'Fact Finding Officer'],
  Succession: ['Succession Certificate Examiner', 'Family Tree Verifier', 'Legal Scrutiny Officer'],
};

export const PROVINCES_DOMICILE = [
  'Sindh Rural',
  'Sindh Urban',
  'Punjab',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
] as const;

export const PAKISTAN_DISTRICTS: Record<string, string[]> = {
  'Sindh Rural': [
    'Larkana',
    'Qambar Shahdadkot',
    'Sukkur',
    'Shikarpur',
    'Jacobabad',
    'Kashmore',
    'Ghotki',
    'Khairpur',
    'Naushahro Feroze',
    'Shaheed Benazirabad',
    'Matiari',
    'Tando Allahyar',
    'Tando Muhammad Khan',
    'Jamshoro',
    'Thatta',
    'Sujawal',
    'Badin',
    'Mirpurkhas',
    'Umerkot',
    'Tharparkar',
    'Sanghar',
  ],
  'Sindh Urban': [
    'Karachi Central',
    'Karachi East',
    'Karachi South',
    'Karachi West',
    'Malir',
    'Korangi',
    'Keamari',
    'Hyderabad Urban',
    'Sukkur Urban',
  ],
  Punjab: [
    'Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot',
    'Bahawalpur', 'Sargodha', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Kasur',
    'Muzaffargarh', 'Okara', 'Dera Ghazi Khan', 'Sahiwal', 'Attock', 'Vehari',
    'Mianwali', 'Chakwal', 'Gujrat', 'Khanewal', 'Jhelum', 'Lodhran', 'Bhakkar',
    'Chiniot', 'Layyah', 'Nankana Sahib', 'Pakpattan', 'Khushab', 'Hafizabad', 'Mandi Bahauddin'
  ],
  'Khyber Pakhtunkhwa': [
    'Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Dera Ismail Khan', 'Kohat',
    'Bannu', 'Charsadda', 'Swabi', 'Nowshera', 'Mansehra', 'Haripur', 'Karak',
    'Hangu', 'Buner', 'Lower Dir', 'Upper Dir', 'Chitral', 'Malakand', 'Kurram',
    'Khyber', 'Bajaur', 'Mohmand', 'North Waziristan', 'South Waziristan'
  ],
  Balochistan: [
    'Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Hub', 'Sibi', 'Zhob', 'Chaman',
    'Loralai', 'Pishin', 'Jafarabad', 'Nasirabad', 'Kalat', 'Panjgur', 'Dera Bugti',
    'Kohlu', 'Kharan', 'Washuk', 'Nushki', 'Ziarat', 'Harnai', 'Barkhan', 'Musakhel'
  ],
  'Islamabad Capital Territory': ['Islamabad'],
  'Gilgit-Baltistan': ['Gilgit', 'Skardu', 'Hunza', 'Diamer', 'Ghizer', 'Astore', 'Ghanche', 'Nagar', 'Kharmang', 'Shigar'],
  'Azad Jammu & Kashmir': ['Muzaffarabad', 'Mirpur', 'Kotli', 'Rawalakot', 'Bagh', 'Bhimber', 'Neelum', 'Haveli', 'Sudhnuti', 'Hattian Bala'],
};

export const ALL_DISTRICTS_FLAT: string[] = Object.values(PAKISTAN_DISTRICTS).flat().sort();

export const RELIGIONS_LIST = [
  'Muslim',
  'Christian',
  'Hindu',
  'Sikh',
  'Zoroastrian / Parsi',
  'Ahmadi',
  'Buddhist',
  'Baháʼí',
  'Other',
] as const;

export const SECTS_LIST: Record<string, string[]> = {
  Muslim: [
    'Sunni (Hanafi / Barelvi)',
    'Sunni (Deobandi)',
    'Shia / Ahle Tashi',
    'Ahle Hadith / Salafi',
    'Ismaili',
    'Bohra',
    'General Muslim',
  ],
  Christian: ['Catholic', 'Protestant', 'Orthodox', 'Methodist', 'Presbyterian', 'Other'],
  Hindu: ['Sanatan Dharma', 'Vaishnavism', 'Shaivism', 'Arya Samaj', 'Valmiki', 'Other'],
  Sikh: ['Khalsa', 'Sahajdhari', 'Namdhari', 'Other'],
  Other: ['Universalist', 'Non-denominational', 'Traditional'],
};

export const MARITAL_STATUS_LIST = [
  'Married',
  'Single',
  'Widowed',
  'Divorced',
] as const;

export const DISABILITIES_LIST = [
  'Locomotor / Physical Disability',
  'Visual Impairment (Low Vision / Blindness)',
  'Hearing & Speech Impairment',
  'Intellectual Disability',
  'Multiple Disabilities',
  'Chronic Neurological Condition',
  'Other Certified Medical Disability',
] as const;

export const QUALIFICATION_LEVELS = [
  { level: 'Matric / SSC', years: '10 Years' },
  { level: 'Intermediate / HSSC / DAE', years: '12 Years' },
  { level: 'Bachelor (Pass) / ADP', years: '14 Years' },
  { level: 'BS / B.Sc (Honors) / BE', years: '16 Years' },
  { level: 'Master / MA / M.Sc / MBA', years: '16 Years' },
  { level: 'MS / M.Phil', years: '18 Years' },
  { level: 'Ph.D (Doctorate)', years: '20+ Years' },
] as const;

/**
 * Enforces Union Council (UC) administrative constraints:
 * - 2 OICs are NOT allowed
 * - OA is NOT allowed
 * - Maximum 1 OIC allowed
 * - Maximum 1 DEO allowed
 * - Only Male staff allowed in UCs
 */
export function validateUcStaffConstraints(office: { type?: string; name?: string }, staffList: { role?: string; designation?: string; gender?: string }[]): { isValid: boolean; errors: string[] } {
  const isUc = (office.type === 'UC' || (office.name && office.name.toUpperCase().startsWith('UC')));
  if (!isUc) {
    return { isValid: true, errors: [] };
  }

  const errors: string[] = [];
  const oicCount = staffList.filter(s => s.role === 'OIC' || (s.designation && s.designation.toLowerCase().includes('incharge'))).length;
  const oic2Count = staffList.filter(s => s.role === '2IC' || (s.designation && s.designation.toLowerCase().includes('second incharge'))).length;
  const oacount = staffList.filter(s => s.role === 'OA' || (s.designation && s.designation.toLowerCase().includes('office assistant'))).length;
  const deocount = staffList.filter(s => (s.designation && s.designation.toLowerCase().includes('data entry')) || s.role === 'DEO').length;
  const femaleCount = staffList.filter(s => s.gender && s.gender.toLowerCase() === 'female').length;

  if (oic2Count > 0) {
    errors.push('In Union Councils (UCs), Second Incharge (2IC) is strictly not authorized.');
  }
  if (oicCount > 1) {
    errors.push('In Union Councils (UCs), multiple Incharges (2 OIC) are strictly not authorized. Only 1 OIC is allowed.');
  }
  if (oacount > 0) {
    errors.push('In Union Councils (UCs), Office Assistant (OA) is strictly not authorized.');
  }
  if (deocount > 1) {
    errors.push('In Union Councils (UCs), maximum 1 Data Entry Operator (DEO) is authorized.');
  }
  if (femaleCount > 0) {
    errors.push('In Union Councils (UCs), only male staff are authorized as per posting policy.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
