/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Office, ContactDetail, StaffBreakdown } from '../../types';

interface OfficeEditModalProps {
  office: Office | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOffice: Office) => Promise<void>;
}

export const OfficeEditModal: React.FC<OfficeEditModalProps> = ({
  office,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !office) return null;

  const [formData, setFormData] = useState<Office>({ ...office });
  const [inchargeContacts, setInchargeContacts] = useState<ContactDetail[]>(
    office.incharge?.contacts && office.incharge.contacts.length > 0
      ? [...office.incharge.contacts]
      : [
          { id: '1', label: 'WhatsApp', number: '0300-1234567', type: 'whatsapp' },
          { id: '2', label: 'Official Call', number: '0333-7654321', type: 'call' },
        ]
  );
  const [assistantContacts, setAssistantContacts] = useState<ContactDetail[]>(
    office.assistant?.contacts && office.assistant.contacts.length > 0
      ? [...office.assistant.contacts]
      : [{ id: '1', label: 'WhatsApp & Call', number: '0301-2345678', type: 'both' }]
  );

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

  const handleAddAssistantContact = () => {
    if (assistantContacts.length >= 4) return;
    setAssistantContacts([
      ...assistantContacts,
      {
        id: `ac-${Date.now()}`,
        label: 'Official Mobile',
        number: '',
        type: 'call',
      },
    ]);
  };

  const handleRemoveAssistantContact = (idx: number) => {
    if (assistantContacts.length <= 1) return;
    setAssistantContacts(assistantContacts.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      const updated: Office = {
        ...formData,
        zoneName: formData.zoneName || 'Larkana',
        zoneCode: formData.zoneCode || 'Z050D',
        incharge: {
          name: formData.incharge?.name || '',
          designation: formData.incharge?.designation || 'Incharge Officer',
          contacts: inchargeContacts,
        },
        assistant: {
          name: formData.assistant?.name || '',
          designation: formData.assistant?.designation || 'Assistant Incharge',
          contacts: assistantContacts,
        },
        staffBreakdown: {
          ...staff,
          totalStaff: totalStaffCalculated,
        },
        expectedStaff: totalStaffCalculated,
      };

      await onSave(updated);
      onClose();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save office details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Edit Office Details & Management Parameters
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              {formData.code}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {saveError && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Section 1: Office General Identification */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              1. Center Identification & Geographical Coordinates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Office Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Official Office / DAU Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-sans focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Classification Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="DAU">DAU (District Area Unit)</option>
                  <option value="NRC">NRC (National Registration Center)</option>
                  <option value="Executive NRC">Executive NRC</option>
                  <option value="MRV">MRV (Mobile Registration Van)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Zone Name *</label>
                <input
                  type="text"
                  value={formData.zoneName || 'Larkana'}
                  onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                  placeholder="e.g. Larkana"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Zone Code *</label>
                <input
                  type="text"
                  value={formData.zoneCode || 'Z050D'}
                  onChange={(e) => setFormData({ ...formData, zoneCode: e.target.value })}
                  placeholder="e.g. Z050D"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">District *</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Official Physical Address</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Station Road, Larkana, Sindh"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Office Landline Number</label>
                <input
                  type="text"
                  value={formData.landline || ''}
                  onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
                  placeholder="e.g. 074-9410123"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Latitude (GPS)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.latitude || ''}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 27.5589"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Longitude (GPS)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.longitude || ''}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 68.2120"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Daily Token Capacity</label>
                <input
                  type="number"
                  value={formData.dailyCapacity || 300}
                  onChange={(e) => setFormData({ ...formData, dailyCapacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Current Office Incharge & Contact Options (1-4 numbers) */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                2. Current Office Incharge Details & Numbers (1 to 4 Phone Options)
              </h3>
              {inchargeContacts.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddInchargeContact}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 px-2.5 py-1 rounded border border-emerald-800/40"
                >
                  <Plus className="w-3 h-3" /> Add Phone Option ({inchargeContacts.length}/4)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Incharge Full Name</label>
                <input
                  type="text"
                  value={formData.incharge?.name || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      incharge: { ...formData.incharge, name: e.target.value, contacts: inchargeContacts },
                    })
                  }
                  placeholder="e.g. Muhammad Aslam Chandio"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Incharge Official Designation</label>
                <input
                  type="text"
                  value={formData.incharge?.designation || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      incharge: { ...formData.incharge, designation: e.target.value, name: formData.incharge?.name || '', contacts: inchargeContacts },
                    })
                  }
                  placeholder="e.g. Senior Assistant Director / Incharge"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Incharge Contacts List */}
            <div className="space-y-2 mt-2">
              <span className="text-[11px] font-semibold text-slate-400">Configured Incharge Phone Numbers:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {inchargeContacts.map((contact, idx) => (
                  <div key={contact.id || idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-emerald-400">Option #{idx + 1}</span>
                      {inchargeContacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInchargeContact(idx)}
                          className="text-rose-400 hover:text-rose-300 p-0.5"
                          title="Remove option"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="Label (e.g. WhatsApp)"
                        value={contact.label}
                        onChange={(e) => {
                          const updated = [...inchargeContacts];
                          updated[idx].label = e.target.value;
                          setInchargeContacts(updated);
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                      <select
                        value={contact.type}
                        onChange={(e) => {
                          const updated = [...inchargeContacts];
                          updated[idx].type = e.target.value as any;
                          setInchargeContacts(updated);
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="call">Call Only</option>
                        <option value="both">Both (Call + WhatsApp)</option>
                        <option value="landline">Landline Desk</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Phone # (e.g. 0300-1234567)"
                      value={contact.number}
                      onChange={(e) => {
                        const updated = [...inchargeContacts];
                        updated[idx].number = e.target.value;
                        setInchargeContacts(updated);
                      }}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Office Assistant Details & Phone Numbers */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                3. Office Assistant / 2nd Incharge Details & Numbers
              </h3>
              {assistantContacts.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddAssistantContact}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 px-2.5 py-1 rounded border border-amber-800/40"
                >
                  <Plus className="w-3 h-3" /> Add Phone Option ({assistantContacts.length}/4)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Assistant Name</label>
                <input
                  type="text"
                  value={formData.assistant?.name || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assistant: { ...formData.assistant, name: e.target.value, contacts: assistantContacts },
                    })
                  }
                  placeholder="e.g. Rashid Ali Solangi"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Assistant Designation</label>
                <input
                  type="text"
                  value={formData.assistant?.designation || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assistant: { ...formData.assistant, designation: e.target.value, name: formData.assistant?.name || '', contacts: assistantContacts },
                    })
                  }
                  placeholder="e.g. Assistant Incharge / Superintendent"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Assistant Contacts List */}
            <div className="space-y-2 mt-2">
              <span className="text-[11px] font-semibold text-slate-400">Configured Assistant Phone Numbers:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {assistantContacts.map((contact, idx) => (
                  <div key={contact.id || idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-amber-400">Option #{idx + 1}</span>
                      {assistantContacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAssistantContact(idx)}
                          className="text-rose-400 hover:text-rose-300 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="Label"
                        value={contact.label}
                        onChange={(e) => {
                          const updated = [...assistantContacts];
                          updated[idx].label = e.target.value;
                          setAssistantContacts(updated);
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                      <select
                        value={contact.type}
                        onChange={(e) => {
                          const updated = [...assistantContacts];
                          updated[idx].type = e.target.value as any;
                          setAssistantContacts(updated);
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300"
                      >
                        <option value="both">Both (Call + WhatsApp)</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="call">Call</option>
                        <option value="landline">Landline</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Phone #"
                      value={contact.number}
                      onChange={(e) => {
                        const updated = [...assistantContacts];
                        updated[idx].number = e.target.value;
                        setAssistantContacts(updated);
                      }}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Quantity of Employees & Staff Breakdown (Male / Female Segregated) */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                4. Quantity of Employees Breakdown (Separate Male / Female)
              </h3>
              <div className="text-xs font-bold font-mono px-3 py-1 bg-slate-950 rounded border border-slate-800 text-emerald-400">
                Calculated Total Staff: {totalStaffCalculated}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right text-blue-400">Male Staff</th>
                    <th className="py-2.5 px-3 text-right text-purple-400">Female Staff</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {/* Officers */}
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-white">Officers</td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.officersMale}
                        onChange={(e) => setStaff({ ...staff, officersMale: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-blue-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.officersFemale}
                        onChange={(e) => setStaff({ ...staff, officersFemale: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-purple-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white tabular-nums">
                      {(staff.officersMale || 0) + (staff.officersFemale || 0)}
                    </td>
                  </tr>

                  {/* Officials */}
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-white">Officials (DEO / Registration)</td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.officialsMale}
                        onChange={(e) => setStaff({ ...staff, officialsMale: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-blue-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.officialsFemale}
                        onChange={(e) => setStaff({ ...staff, officialsFemale: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-purple-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white tabular-nums">
                      {(staff.officialsMale || 0) + (staff.officialsFemale || 0)}
                    </td>
                  </tr>

                  {/* Supporting Staff */}
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-white">Supporting Staff</td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.supportingMale}
                        onChange={(e) => setStaff({ ...staff, supportingMale: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-blue-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.supportingFemale}
                        onChange={(e) => setStaff({ ...staff, supportingFemale: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-purple-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white tabular-nums">
                      {(staff.supportingMale || 0) + (staff.supportingFemale || 0)}
                    </td>
                  </tr>

                  {/* Outsource Staff */}
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-white">Outsource Staff</td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.outsourceMale}
                        onChange={(e) => setStaff({ ...staff, outsourceMale: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-blue-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.outsourceFemale}
                        onChange={(e) => setStaff({ ...staff, outsourceFemale: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-purple-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white tabular-nums">
                      {(staff.outsourceMale || 0) + (staff.outsourceFemale || 0)}
                    </td>
                  </tr>

                  {/* Calculated Totals Row */}
                  <tr className="bg-slate-950 font-bold border-t border-slate-700 text-xs">
                    <td className="py-2.5 px-3 uppercase text-slate-300">Total Sanctioned Staff</td>
                    <td className="py-2.5 px-3 text-right text-blue-300">
                      {(staff.officersMale || 0) + (staff.officialsMale || 0) + (staff.supportingMale || 0) + (staff.outsourceMale || 0)} M
                    </td>
                    <td className="py-2.5 px-3 text-right text-purple-300">
                      {(staff.officersFemale || 0) + (staff.officialsFemale || 0) + (staff.supportingFemale || 0) + (staff.outsourceFemale || 0)} F
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 text-sm">
                      {totalStaffCalculated} Total
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Changes...' : 'Save Office Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
