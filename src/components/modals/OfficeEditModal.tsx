/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  X,
  Save,
  Plus,
  Trash2,
  MapPin,
  Phone,
  MessageSquare,
  Users,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Clock,
  History,
  Briefcase,
  Award,
  ChevronDown,
} from 'lucide-react';
import { Office, ContactDetail, StaffBreakdown, LeadershipTenureRecord } from '../../types';
import { calculateTenureDetails } from '../../utils/tenureHelper';

interface OfficeEditModalProps {
  office: Office | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOffice: Office, previousIdentifier?: string) => Promise<void>;
  onDeleteOffice?: (identifier: string) => Promise<void>;
}

export const OfficeEditModal: React.FC<OfficeEditModalProps> = ({
  office,
  isOpen,
  onClose,
  onSave,
  onDeleteOffice,
}) => {
  if (!isOpen || !office) return null;

  const initialCode = office.code;
  const initialId = office.id || office.code;

  const [activeTab, setActiveTab] = useState<'details' | 'incharge' | 'assistant' | 'tenure' | 'staff' | 'infrastructure'>('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<Office>({ ...office });

  // Incharge Contacts
  const [inchargeContacts, setInchargeContacts] = useState<ContactDetail[]>(
    office.incharge?.contacts && office.incharge.contacts.length > 0
      ? [...office.incharge.contacts]
      : [
          { id: '1', label: 'WhatsApp', number: '0300-1234567', type: 'whatsapp' },
          { id: '2', label: 'Official Call', number: '0333-7654321', type: 'call' },
        ]
  );

  // Second Incharge Contacts
  const [secondInchargeContacts, setSecondInchargeContacts] = useState<ContactDetail[]>(
    office.secondIncharge?.contacts && office.secondIncharge.contacts.length > 0
      ? [...office.secondIncharge.contacts]
      : [{ id: '1', label: 'WhatsApp & Call', number: '0301-2345678', type: 'both' }]
  );

  // Office Assistant details
  const [oaName, setOaName] = useState(office.assistant?.name || '');
  const [oaDesignation, setOaDesignation] = useState(office.assistant?.designation || 'Office Assistant (OA)');
  const [oaGrade, setOaGrade] = useState(office.assistant?.grade || 'BPS-14');
  const [oaResponsibilities, setOaResponsibilities] = useState(
    office.assistant?.responsibilities ||
      'Token issuance coordination, staff daily roster, biometric sheet logging, public facilitation and archive registers.'
  );
  const [oaMobileNumber, setOaMobileNumber] = useState(office.assistant?.mobileNumber || '0302-3456789');
  const [oaWhatsappNumber, setOaWhatsappNumber] = useState(office.assistant?.whatsappNumber || '0302-3456789');
  const [oaStartDate, setOaStartDate] = useState(office.assistant?.startDate || '2024-02-01');

  // Leadership History state
  const [historyRecords, setHistoryRecords] = useState<LeadershipTenureRecord[]>(
    office.leadershipHistory && office.leadershipHistory.length > 0
      ? [...office.leadershipHistory]
      : []
  );

  // New History Item Form state
  const [isAddingHistory, setIsAddingHistory] = useState(false);
  const [newHistRole, setNewHistRole] = useState<'OIC' | '2IC' | 'OA'>('OIC');
  const [newHistName, setNewHistName] = useState('');
  const [newHistDesignation, setNewHistDesignation] = useState('Assistant Director');
  const [newHistGrade, setNewHistGrade] = useState('BPS-17');
  const [newHistContact, setNewHistContact] = useState('');
  const [newHistStart, setNewHistStart] = useState('2022-01-01');
  const [newHistEnd, setNewHistEnd] = useState('2023-08-14');
  const [newHistRemarks, setNewHistRemarks] = useState('');

  // Staff breakdown
  const [staff, setStaff] = useState<StaffBreakdown>(
    office.staffBreakdown || {
      officersMale: 2,
      officersFemale: 1,
      officialsMale: 6,
      officialsFemale: 2,
      supportingMale: 2,
      supportingFemale: 0,
      outsourceMale: 1,
      outsourceFemale: 0,
      totalStaff: 14,
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Live total staff calculation
  const totalStaffCalculated =
    (Number(staff.officersMale) || 0) +
    (Number(staff.officersFemale) || 0) +
    (Number(staff.officialsMale) || 0) +
    (Number(staff.officialsFemale) || 0) +
    (Number(staff.supportingMale) || 0) +
    (Number(staff.supportingFemale) || 0) +
    (Number(staff.outsourceMale) || 0) +
    (Number(staff.outsourceFemale) || 0);

  const handleAddInchargeContact = () => {
    if (inchargeContacts.length >= 4) return;
    setInchargeContacts([
      ...inchargeContacts,
      {
        id: `ic-${Date.now()}`,
        label: inchargeContacts.length === 2 ? 'Emergency' : 'Desk Landline',
        number: '',
        type: inchargeContacts.length === 2 ? 'call' : 'landline',
      },
    ]);
  };

  const handleRemoveInchargeContact = (idx: number) => {
    if (inchargeContacts.length <= 1) return;
    setInchargeContacts(inchargeContacts.filter((_, i) => i !== idx));
  };

  const handleAddSecondInchargeContact = () => {
    if (secondInchargeContacts.length >= 4) return;
    setSecondInchargeContacts([
      ...secondInchargeContacts,
      {
        id: `sc-${Date.now()}`,
        label: 'Official Call',
        number: '',
        type: 'call',
      },
    ]);
  };

  const handleRemoveSecondInchargeContact = (idx: number) => {
    if (secondInchargeContacts.length <= 1) return;
    setSecondInchargeContacts(secondInchargeContacts.filter((_, i) => i !== idx));
  };

  const handleSaveNewHistoryItem = () => {
    if (!newHistName.trim() || !newHistStart) return;
    const calc = calculateTenureDetails(newHistStart, newHistEnd || undefined);
    const roleTitle =
      newHistRole === 'OA'
        ? 'Office Assistant (OA)'
        : newHistRole === '2IC'
        ? 'Second Incharge (2IC)'
        : 'Office Incharge (OIC)';

    const newRecord: LeadershipTenureRecord = {
      id: `ten-${Date.now()}`,
      role: newHistRole,
      roleTitle,
      name: newHistName.trim(),
      designation: newHistDesignation.trim(),
      grade: newHistGrade.trim(),
      contact: newHistContact.trim(),
      startDate: newHistStart,
      endDate: newHistEnd || undefined,
      isCurrent: !newHistEnd,
      tenureDuration: calc.text,
      remarks: newHistRemarks.trim() || 'Completed operational tenure',
    };

    setHistoryRecords([newRecord, ...historyRecords]);
    setIsAddingHistory(false);
    setNewHistName('');
    setNewHistContact('');
    setNewHistRemarks('');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistoryRecords(historyRecords.filter(r => r.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    const isUc =
      formData.type === 'UC' ||
      (formData.name || '').toUpperCase().startsWith('UC') ||
      (formData.name || '').toUpperCase().includes('UNION COUNCIL');

    if (isUc) {
      if (Number(staff.officialsMale) > 1) {
        setSaveError('UC Policy Violation: Maximum 1 DEO is allowed at Union Councils.');
        setIsSaving(false);
        return;
      }
      if (
        Number(staff.officersFemale) > 0 ||
        Number(staff.officialsFemale) > 0 ||
        Number(staff.supportingFemale) > 0 ||
        Number(staff.outsourceFemale) > 0
      ) {
        setSaveError('UC Policy Violation: Female staff is strictly not allowed at Union Council offices (Males only).');
        setIsSaving(false);
        return;
      }
    }

    try {
      const updated: Office = {
        ...formData,
        id: initialId,
        code: formData.code.trim(),
        name: formData.name.trim(),
        zoneName: formData.zoneName || 'Larkana',
        zoneCode: formData.zoneCode || 'Z050D',
        incharge: {
          name: formData.incharge?.name || '',
          designation: formData.incharge?.designation || 'Senior Assistant Director',
          grade: formData.incharge?.grade || 'BPS-17',
          startDate: formData.incharge?.startDate || '2023-08-15',
          contacts: inchargeContacts,
        },
        secondIncharge: isUc
          ? undefined
          : {
              name: formData.secondIncharge?.name || '',
              designation: formData.secondIncharge?.designation || 'Assistant Incharge',
              grade: formData.secondIncharge?.grade || 'BPS-16',
              startDate: formData.secondIncharge?.startDate || '2024-01-10',
              contacts: secondInchargeContacts,
            },
        assistant: isUc
          ? undefined
          : {
              name: oaName.trim(),
              designation: oaDesignation.trim(),
              grade: oaGrade.trim(),
              responsibilities: oaResponsibilities.trim(),
              mobileNumber: oaMobileNumber.trim(),
              whatsappNumber: oaWhatsappNumber.trim(),
              startDate: oaStartDate,
              contacts: [
                { id: 'oa-wa', label: 'WhatsApp Direct', number: oaWhatsappNumber, type: 'whatsapp' },
                { id: 'oa-call', label: 'Official Mobile', number: oaMobileNumber, type: 'call' },
              ],
            },
        leadershipHistory: historyRecords,
        staffBreakdown: {
          ...staff,
          totalStaff: totalStaffCalculated,
        },
        expectedStaff: totalStaffCalculated,
        buildingStatus: formData.buildingStatus || 'Gratis',
        monthlyRentPKR: Number(formData.monthlyRentPKR) || 0,
        operationalDate: formData.operationalDate || '',
        currentBuildingOperationalDate: formData.currentBuildingOperationalDate || '',
        shiftsCount: Number(formData.shiftsCount) || (isUc ? 1 : 2),
        coveredAreaSqFt: Number(formData.coveredAreaSqFt) || 1200,
        buildingCondition: formData.buildingCondition || 'Good',
        loadSheddingHours: Number(formData.loadSheddingHours) || 1,
        loadSheddingMinutes: Number(formData.loadSheddingMinutes) || 30,
        generatorKVA: formData.generatorKVA || '15 KVA',
        upsKVA: formData.upsKVA || '3 KVA',
        fleetCardStatus: formData.fleetCardStatus || 'Available',
        fleetCardLastDigits: formData.fleetCardLastDigits || '8421',
        fleetCardReceiveDate: formData.fleetCardReceiveDate || '2024-01-10',
        fleetCardUnavailableReason: formData.fleetCardUnavailableReason || '',
        publicFacilities: formData.publicFacilities || ['Fresh Water', 'Air Conditioning'],
        parkingType: formData.parkingType || 'Outside parking',
        authorizedOfficers: Number(formData.authorizedOfficers) || (isUc ? 1 : 2),
        heldOfficers: Number(formData.heldOfficers) || (isUc ? 1 : 2),
        authorizedOfficials: Number(formData.authorizedOfficials) || (isUc ? 1 : 6),
        heldOfficials: Number(formData.heldOfficials) || (isUc ? 1 : 5),
        authorizedSupportive: Number(formData.authorizedSupportive) || (isUc ? 1 : 2),
        heldSupportive: Number(formData.heldSupportive) || (isUc ? 1 : 2),
      };

      await onSave(updated, initialId || initialCode);
      onClose();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save office details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteOffice) return;
    setIsDeleting(true);
    try {
      await onDeleteOffice(initialId || initialCode);
      onClose();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to delete office');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const inchargeTenure = calculateTenureDetails(formData.incharge?.startDate);
  const oaTenure = calculateTenureDetails(oaStartDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Edit Office Details &amp; DAU Code
                </h2>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  {formData.code}
                </span>
                {formData.shift && (
                  <span className="text-[10px] font-semibold text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/40">
                    {formData.shift} Shift
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Update parameters, leadership tenure, and custom NRC codes with automatic cascading.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-950 shrink-0 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3 py-2 font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'details'
                ? 'text-emerald-400 border-emerald-400 bg-slate-900/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            1. Center &amp; DAU Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('incharge')}
            className={`px-3 py-2 font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'incharge'
                ? 'text-emerald-400 border-emerald-400 bg-slate-900/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            2. Office Incharge (OIC &amp; 2IC)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-2 font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'assistant'
                ? 'text-emerald-400 border-emerald-400 bg-slate-900/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            3. Office Assistant (OA)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tenure')}
            className={`px-3 py-2 font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tenure'
                ? 'text-emerald-400 border-emerald-400 bg-slate-900/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <span>4. Leadership Tenure History</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {historyRecords.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`px-3 py-2 font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'staff'
                ? 'text-emerald-400 border-emerald-400 bg-slate-900/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            5. Staff Breakdown ({totalStaffCalculated})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('infrastructure')}
            className={`px-3 py-2 font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'infrastructure'
                ? 'text-emerald-400 border-emerald-400 bg-slate-900/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            6. Building &amp; Infrastructure
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5 flex-1 text-xs">
          {saveError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{saveError}</span>
            </div>
          )}

          {/* TAB 1: Center & DAU Code */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Official DAU Identification &amp; Custom Code
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Zone: {formData.zoneName || 'Larkana'} ({formData.zoneCode || 'Z050D'})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      NRC / DAU Code <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g. 10501, 52466"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-emerald-300 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Enter any custom code. All reports and attendance will automatically sync.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Center / DAU Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Shift</label>
                    <select
                      value={formData.shift || 'Regular'}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Regular">Regular (Standard Shift)</option>
                      <option value="Morning">Morning Shift</option>
                      <option value="Evening">Evening Shift</option>
                      <option value="Double">2 Shifts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Classification Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="NRC">NRC (NADRA Registration Center)</option>
                      <option value="Executive NRC">Executive NRC</option>
                      <option value="MRV">MRV (Mobile Registration Van)</option>
                      <option value="NRC Counter">NRC Counter (UC Level)</option>
                      <option value="DAU">DAU (Data Acquisition Unit)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">District</label>
                    <input
                      type="text"
                      value={formData.district || 'Larkana'}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Operational Status</label>
                    <select
                      value={formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'ACTIVE' })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="ACTIVE">Active / Operational</option>
                      <option value="INACTIVE">Inactive / Under Renovation</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Total Processing Counters</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalCounters || 4}
                      onChange={(e) => setFormData({ ...formData, totalCounters: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Daily Capacity (Tokens/Day)</label>
                    <input
                      type="number"
                      min="10"
                      value={formData.dailyCapacity || 200}
                      onChange={(e) => setFormData({ ...formData, dailyCapacity: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Office Landline Number</label>
                    <input
                      type="text"
                      value={formData.landline || ''}
                      onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
                      placeholder="e.g. 074-9410123"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Physical Address / Location</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full street address in Larkana"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude || 27.5589}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude || 68.2120}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Office Incharge (OIC & 2IC) */}
          {activeTab === 'incharge' && (
            <div className="space-y-4">
              {/* Primary Office Incharge (OIC) */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Office Incharge (OIC) Details
                  </h3>
                  {inchargeTenure.days > 0 && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      Active Tenure: {inchargeTenure.text}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Incharge Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.incharge?.name || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          incharge: { ...formData.incharge, name: e.target.value, contacts: inchargeContacts },
                        })
                      }
                      placeholder="e.g. Muhammad Aslam Chandio"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-semibold focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Official Designation</label>
                    <input
                      type="text"
                      value={formData.incharge?.designation || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          incharge: {
                            ...formData.incharge,
                            name: formData.incharge?.name || '',
                            designation: e.target.value,
                            contacts: inchargeContacts,
                          },
                        })
                      }
                      placeholder="e.g. Senior Assistant Director"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Pay Scale / Grade</label>
                    <select
                      value={formData.incharge?.grade || 'BPS-17'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          incharge: {
                            ...formData.incharge,
                            name: formData.incharge?.name || '',
                            grade: e.target.value,
                            contacts: inchargeContacts,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="BPS-16">BPS-16</option>
                      <option value="BPS-17">BPS-17</option>
                      <option value="BPS-18">BPS-18</option>
                      <option value="BPS-19">BPS-19</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Date of Joining / Current Appointment at this Center
                  </label>
                  <input
                    type="date"
                    value={formData.incharge?.startDate || '2023-08-15'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        incharge: {
                          ...formData.incharge,
                          name: formData.incharge?.name || '',
                          startDate: e.target.value,
                          contacts: inchargeContacts,
                        },
                      })
                    }
                    className="w-full sm:w-64 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Changing this date accurately recalculates days, weeks, months, and years of service.
                  </p>
                </div>

                {/* Incharge Contacts (1 to 4 options) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-300">
                      Incharge Contact Numbers (Option 1-4 for WhatsApp / Call / Desk):
                    </span>
                    {inchargeContacts.length < 4 && (
                      <button
                        type="button"
                        onClick={handleAddInchargeContact}
                        className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                      >
                        <Plus className="w-3 h-3" /> Add Number Option
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {inchargeContacts.map((c, idx) => (
                      <div
                        key={c.id || idx}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2"
                      >
                        <div className="w-24 shrink-0">
                          <select
                            value={c.type}
                            onChange={(e) => {
                              const updated = [...inchargeContacts];
                              updated[idx].type = e.target.value as any;
                              setInchargeContacts(updated);
                            }}
                            className="w-full px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-200"
                          >
                            <option value="whatsapp">WhatsApp</option>
                            <option value="call">Call</option>
                            <option value="both">Both</option>
                            <option value="landline">Landline</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={c.number}
                          onChange={(e) => {
                            const updated = [...inchargeContacts];
                            updated[idx].number = e.target.value;
                            setInchargeContacts(updated);
                          }}
                          placeholder="0300-1234567"
                          className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-mono text-[11px]"
                        />
                        {inchargeContacts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveInchargeContact(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Second Incharge (2IC) */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Second Incharge (2IC) Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Second Incharge Name</label>
                    <input
                      type="text"
                      value={formData.secondIncharge?.name || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondIncharge: {
                            ...formData.secondIncharge,
                            name: e.target.value,
                            contacts: secondInchargeContacts,
                          },
                        })
                      }
                      placeholder="e.g. Rashid Ali Solangi"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-semibold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Designation</label>
                    <input
                      type="text"
                      value={formData.secondIncharge?.designation || 'Assistant Incharge'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondIncharge: {
                            ...formData.secondIncharge,
                            name: formData.secondIncharge?.name || '',
                            designation: e.target.value,
                            contacts: secondInchargeContacts,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Appointment Date</label>
                    <input
                      type="date"
                      value={formData.secondIncharge?.startDate || '2024-01-10'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondIncharge: {
                            ...formData.secondIncharge,
                            name: formData.secondIncharge?.name || '',
                            startDate: e.target.value,
                            contacts: secondInchargeContacts,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-300">Second Incharge Contacts:</span>
                    {secondInchargeContacts.length < 4 && (
                      <button
                        type="button"
                        onClick={handleAddSecondInchargeContact}
                        className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        <Plus className="w-3 h-3" /> Add Number
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {secondInchargeContacts.map((c, idx) => (
                      <div
                        key={c.id || idx}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2"
                      >
                        <div className="w-24 shrink-0">
                          <select
                            value={c.type}
                            onChange={(e) => {
                              const updated = [...secondInchargeContacts];
                              updated[idx].type = e.target.value as any;
                              setSecondInchargeContacts(updated);
                            }}
                            className="w-full px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-200"
                          >
                            <option value="both">Both</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="call">Call</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={c.number}
                          onChange={(e) => {
                            const updated = [...secondInchargeContacts];
                            updated[idx].number = e.target.value;
                            setSecondInchargeContacts(updated);
                          }}
                          placeholder="0301-2345678"
                          className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-mono text-[11px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Office Assistant (OA) Details (User Requirement 5) */}
          {activeTab === 'assistant' && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    Office Assistant (OA) Official Profile &amp; Responsibilities
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dedicated role for center front-desk operations, reconciliation registers, and public queuing.
                  </p>
                </div>
                {oaTenure.days > 0 && (
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/40">
                    Tenure: {oaTenure.text}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Office Assistant Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={oaName}
                    onChange={(e) => setOaName(e.target.value)}
                    placeholder="e.g. Naveed Ahmed Kalhoro"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-semibold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Designation</label>
                  <input
                    type="text"
                    value={oaDesignation}
                    onChange={(e) => setOaDesignation(e.target.value)}
                    placeholder="e.g. Office Assistant (OA) / DEO"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Grade / Pay Scale</label>
                  <select
                    value={oaGrade}
                    onChange={(e) => setOaGrade(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="BPS-11">BPS-11 (Junior Assistant / DEO)</option>
                    <option value="BPS-12">BPS-12</option>
                    <option value="BPS-14">BPS-14 (Senior Office Assistant)</option>
                    <option value="BPS-15">BPS-15</option>
                    <option value="BPS-16">BPS-16 (Superintendent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Official Mobile Number</label>
                  <input
                    type="text"
                    value={oaMobileNumber}
                    onChange={(e) => setOaMobileNumber(e.target.value)}
                    placeholder="0302-3456789"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">WhatsApp Number (Direct Link)</label>
                  <input
                    type="text"
                    value={oaWhatsappNumber}
                    onChange={(e) => setOaWhatsappNumber(e.target.value)}
                    placeholder="0302-3456789"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Appointment / Joining Date</label>
                  <input
                    type="date"
                    value={oaStartDate}
                    onChange={(e) => setOaStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Specific Tasks / Responsibilities Assigned
                </label>
                <textarea
                  rows={3}
                  value={oaResponsibilities}
                  onChange={(e) => setOaResponsibilities(e.target.value)}
                  placeholder="Detail primary operational responsibilities at this center (e.g. Token queuing, file archiving, daily closing sheets, biometric logs)..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Leadership Tenure History (User Requirement 4) */}
          {activeTab === 'tenure' && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    Day-by-Day Leadership Tenure History (OIC, 2IC &amp; OA)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Records tenure duration (years, months, weeks, days) and retains previous officers when transfers occur.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingHistory(!isAddingHistory)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingHistory ? 'Cancel' : 'Archive / Add Past Record'}</span>
                </button>
              </div>

              {/* Add History Form */}
              {isAddingHistory && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-800/60 space-y-3">
                  <div className="font-semibold text-emerald-400 text-xs">
                    New Tenure Record Entry for {formData.name}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Role Type</label>
                      <select
                        value={newHistRole}
                        onChange={(e) => setNewHistRole(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      >
                        <option value="OIC">Office Incharge (OIC)</option>
                        <option value="2IC">Second Incharge (2IC)</option>
                        <option value="OA">Office Assistant (OA)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Officer Name *</label>
                      <input
                        type="text"
                        required
                        value={newHistName}
                        onChange={(e) => setNewHistName(e.target.value)}
                        placeholder="e.g. Ghulam Shabir Mangi"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Designation</label>
                      <input
                        type="text"
                        value={newHistDesignation}
                        onChange={(e) => setNewHistDesignation(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Grade</label>
                      <select
                        value={newHistGrade}
                        onChange={(e) => setNewHistGrade(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      >
                        <option value="BPS-14">BPS-14</option>
                        <option value="BPS-16">BPS-16</option>
                        <option value="BPS-17">BPS-17</option>
                        <option value="BPS-18">BPS-18</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={newHistStart}
                        onChange={(e) => setNewHistStart(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">End Date</label>
                      <input
                        type="date"
                        value={newHistEnd}
                        onChange={(e) => setNewHistEnd(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={newHistContact}
                        onChange={(e) => setNewHistContact(e.target.value)}
                        placeholder="0300-1122334"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                      Transfer Order # / Remarks / Reassignment Note
                    </label>
                    <input
                      type="text"
                      value={newHistRemarks}
                      onChange={(e) => setNewHistRemarks(e.target.value)}
                      placeholder="e.g. Transferred to Sukkur RHQ per Notification # NADRA/HR/481"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingHistory(false)}
                      className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNewHistoryItem}
                      className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                    >
                      Save Tenure Entry
                    </button>
                  </div>
                </div>
              )}

              {/* History Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3">Officer Name</th>
                      <th className="py-2 px-3">Designation / Grade</th>
                      <th className="py-2 px-3">Service Period</th>
                      <th className="py-2 px-3">Tenure Duration</th>
                      <th className="py-2 px-3">Remarks / Order</th>
                      <th className="py-2 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {/* Current Incharge preview row */}
                    <tr className="bg-blue-950/20 font-medium">
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold">
                          CURRENT OIC
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-white">
                        {formData.incharge?.name || 'Muhammad Aslam Chandio'}
                      </td>
                      <td className="py-2 px-3 text-slate-300">
                        {formData.incharge?.designation || 'Incharge'} ({formData.incharge?.grade || 'BPS-17'})
                      </td>
                      <td className="py-2 px-3 font-mono text-emerald-400">
                        {formData.incharge?.startDate || '2023-08-15'} → Present
                      </td>
                      <td className="py-2 px-3 font-mono text-emerald-300">
                        {inchargeTenure.text}
                      </td>
                      <td className="py-2 px-3 text-slate-400 italic">Currently Serving</td>
                      <td className="py-2 px-3 text-center text-slate-500">-</td>
                    </tr>

                    {/* Current OA preview row */}
                    {oaName && (
                      <tr className="bg-amber-950/20 font-medium">
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                            CURRENT OA
                          </span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-white">{oaName}</td>
                        <td className="py-2 px-3 text-slate-300">
                          {oaDesignation} ({oaGrade})
                        </td>
                        <td className="py-2 px-3 font-mono text-amber-400">
                          {oaStartDate} → Present
                        </td>
                        <td className="py-2 px-3 font-mono text-amber-300">
                          {oaTenure.text}
                        </td>
                        <td className="py-2 px-3 text-slate-400 italic">Currently Serving</td>
                        <td className="py-2 px-3 text-center text-slate-500">-</td>
                      </tr>
                    )}

                    {/* Past history records */}
                    {historyRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-slate-500">
                          No previous tenure records archived yet. Click "Archive / Add Past Record" to log historical OICs.
                        </td>
                      </tr>
                    ) : (
                      historyRecords.map((rec) => {
                        const dur = rec.tenureDuration || calculateTenureDetails(rec.startDate, rec.endDate).text;
                        return (
                          <tr key={rec.id} className="hover:bg-slate-900/60">
                            <td className="py-2 px-3">
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                                {rec.role}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-medium text-white">{rec.name}</td>
                            <td className="py-2 px-3 text-slate-300">
                              {rec.designation} {rec.grade ? `(${rec.grade})` : ''}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-300">
                              {rec.startDate} → {rec.endDate || 'Ongoing'}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-200">{dur}</td>
                            <td className="py-2 px-3 text-slate-400 truncate max-w-xs">
                              {rec.remarks || rec.transferOrderNo || '-'}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteHistoryItem(rec.id)}
                                className="p-1 text-slate-500 hover:text-rose-400"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Staff Breakdown */}
          {activeTab === 'staff' && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Staff Headcount Breakdown (Gender &amp; Classification)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Enter sanctioned staff numbers. Male and Female staff are automatically totaled.
                  </p>
                </div>
                <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg font-mono text-emerald-400 font-bold">
                  Total Staff: {totalStaffCalculated}
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Classification</th>
                      <th className="py-2 px-3 text-center">Male Staff</th>
                      <th className="py-2 px-3 text-center">Female Staff</th>
                      <th className="py-2 px-3 text-right">Category Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    <tr>
                      <td className="py-2 px-3 font-sans font-medium text-white">Officers (Grade 16+)</td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={staff.officersMale}
                          onChange={(e) => setStaff({ ...staff, officersMale: Number(e.target.value) })}
                          className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-blue-400"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={staff.officersFemale}
                          onChange={(e) => setStaff({ ...staff, officersFemale: Number(e.target.value) })}
                          className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-purple-400"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-white">
                        {(staff.officersMale || 0) + (staff.officersFemale || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans font-medium text-white">Officials (DEO / Reg Executives)</td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={staff.officialsMale}
                          onChange={(e) => setStaff({ ...staff, officialsMale: Number(e.target.value) })}
                          className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-blue-400"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={staff.officialsFemale}
                          onChange={(e) => setStaff({ ...staff, officialsFemale: Number(e.target.value) })}
                          className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-purple-400"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-white">
                        {(staff.officialsMale || 0) + (staff.officialsFemale || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans font-medium text-white">Supporting Staff (Naib Qasid, Drivers)</td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={staff.supportingMale}
                          onChange={(e) => setStaff({ ...staff, supportingMale: Number(e.target.value) })}
                          className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-blue-400"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={staff.supportingFemale}
                          onChange={(e) => setStaff({ ...staff, supportingFemale: Number(e.target.value) })}
                          className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-purple-400"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-white">
                        {(staff.supportingMale || 0) + (staff.supportingFemale || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans font-medium text-white">Outsource Personnel (Security, Janitorial)</td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={staff.outsourceMale}
                          onChange={(e) => setStaff({ ...staff, outsourceMale: Number(e.target.value) })}
                          className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-blue-400"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={staff.outsourceFemale}
                          onChange={(e) => setStaff({ ...staff, outsourceFemale: Number(e.target.value) })}
                          className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-purple-400"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-white">
                        {(staff.outsourceMale || 0) + (staff.outsourceFemale || 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: Building & Infrastructure (User Requirement 7) */}
          {activeTab === 'infrastructure' && (
            <div className="space-y-4">
              {/* Building Status & Details */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  Building Infrastructure &amp; Operational Setup
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Building Status</label>
                    <select
                      value={formData.buildingStatus || 'Gratis'}
                      onChange={(e) => setFormData({ ...formData, buildingStatus: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium"
                    >
                      <option value="Gratis">Gratis (Free / Government Provided)</option>
                      <option value="Rented">Rented Building</option>
                      <option value="NADRA Owned">NADRA Owned Building</option>
                    </select>
                  </div>

                  {formData.buildingStatus === 'Rented' && (
                    <div>
                      <label className="block text-amber-300 font-semibold mb-1">Monthly Rent (PKR)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 45000"
                        value={formData.monthlyRentPKR || ''}
                        onChange={(e) => setFormData({ ...formData, monthlyRentPKR: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-amber-600 rounded-lg text-white font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Operational Date</label>
                    <input
                      type="date"
                      value={formData.operationalDate || '2018-05-15'}
                      onChange={(e) => setFormData({ ...formData, operationalDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Current Building Date</label>
                    <input
                      type="date"
                      value={formData.currentBuildingOperationalDate || '2021-11-01'}
                      onChange={(e) => setFormData({ ...formData, currentBuildingOperationalDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Working Shifts</label>
                    <select
                      value={formData.shiftsCount || 1}
                      onChange={(e) => setFormData({ ...formData, shiftsCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      <option value={1}>1 Shift (General / Regular)</option>
                      <option value={2}>2 Shifts (Morning &amp; Evening)</option>
                      <option value={3}>3 Shifts (Round the Clock / 24-7)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Covered Area (Sq. Ft.)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.coveredAreaSqFt || 1200}
                      onChange={(e) => setFormData({ ...formData, coveredAreaSqFt: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Building Condition</label>
                    <select
                      value={formData.buildingCondition || 'Good'}
                      onChange={(e) => setFormData({ ...formData, buildingCondition: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Satisfactory">Satisfactory</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Power & Utilities */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Power Backup, Load Shedding &amp; Fleet Logistics
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Load Shedding Duration</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        placeholder="Hours"
                        value={formData.loadSheddingHours ?? 1}
                        onChange={(e) => setFormData({ ...formData, loadSheddingHours: Number(e.target.value) })}
                        className="w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                      />
                      <span className="text-slate-400">Hrs</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="Minutes"
                        value={formData.loadSheddingMinutes ?? 30}
                        onChange={(e) => setFormData({ ...formData, loadSheddingMinutes: Number(e.target.value) })}
                        className="w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                      />
                      <span className="text-slate-400">Mins</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Generator Capacity</label>
                    <select
                      value={formData.generatorKVA || '15 KVA'}
                      onChange={(e) => setFormData({ ...formData, generatorKVA: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium"
                    >
                      <option value="None">None</option>
                      <option value="5 KVA">5 KVA</option>
                      <option value="15 KVA">15 KVA</option>
                      <option value="25 KVA">25 KVA</option>
                      <option value="50 KVA">50 KVA</option>
                      <option value="100 KVA">100 KVA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">UPS Rating</label>
                    <select
                      value={formData.upsKVA || '3 KVA'}
                      onChange={(e) => setFormData({ ...formData, upsKVA: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium"
                    >
                      <option value="None">None</option>
                      <option value="1 KVA">1 KVA</option>
                      <option value="1.2 KVA">1.2 KVA</option>
                      <option value="2 KVA">2 KVA</option>
                      <option value="3 KVA">3 KVA</option>
                      <option value="5 KVA">5 KVA</option>
                      <option value="6 KVA">6 KVA</option>
                      <option value="10 KVA">10 KVA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Fleet Card Availability</label>
                    <select
                      value={formData.fleetCardStatus || 'Available'}
                      onChange={(e) => setFormData({ ...formData, fleetCardStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="Available">Available</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>

                  {formData.fleetCardStatus === 'Available' ? (
                    <>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Card Last Digits</label>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="e.g. 8421"
                          value={formData.fleetCardLastDigits || '8421'}
                          onChange={(e) => setFormData({ ...formData, fleetCardLastDigits: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Receive Date</label>
                        <input
                          type="date"
                          value={formData.fleetCardReceiveDate || '2024-01-10'}
                          onChange={(e) => setFormData({ ...formData, fleetCardReceiveDate: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="sm:col-span-2">
                      <label className="block text-rose-400 font-semibold mb-1">Reason for Unavailability</label>
                      <input
                        type="text"
                        placeholder="e.g. Under allocation / Pending dispatch"
                        value={formData.fleetCardUnavailableReason || ''}
                        onChange={(e) => setFormData({ ...formData, fleetCardUnavailableReason: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-rose-800 rounded-lg text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Parking Options</label>
                    <select
                      value={formData.parkingType || 'Outside parking'}
                      onChange={(e) => setFormData({ ...formData, parkingType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="Outside parking">Outside parking</option>
                      <option value="Road area parking">Road area parking</option>
                      <option value="Inside parking">Inside parking</option>
                      <option value="Private parking">Private parking</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 shrink-0">
            {onDeleteOffice && (
              <div>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Office</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-rose-300 font-semibold">Confirm delete?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving Changes...' : 'Save & Cascade All Stages'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
