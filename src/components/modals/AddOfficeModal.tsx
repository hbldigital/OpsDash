/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  X,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Office, ContactDetail, StaffBreakdown } from '../../types';

interface AddOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOffice: (newOffice: Office) => Promise<void>;
}

export const AddOfficeModal: React.FC<AddOfficeModalProps> = ({
  isOpen,
  onClose,
  onAddOffice,
}) => {
  if (!isOpen) return null;

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'NRC' | 'Executive' | 'MRV' | 'NRC Counter'>('NRC');
  const [district, setDistrict] = useState('Larkana');
  const [zoneName, setZoneName] = useState('Larkana');
  const [zoneCode, setZoneCode] = useState('Z050D');
  const [address, setAddress] = useState('');
  const [landline, setLandline] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [dailyCapacity, setDailyCapacity] = useState(200);
  const [totalCounters, setTotalCounters] = useState(3);

  // Incharge info
  const [inchargeName, setInchargeName] = useState('');
  const [inchargeDesignation, setInchargeDesignation] = useState('Center Incharge');
  const [inchargeContacts, setInchargeContacts] = useState<ContactDetail[]>([
    { id: '1', label: 'WhatsApp', number: '', type: 'whatsapp' },
    { id: '2', label: 'Official Call', number: '', type: 'call' },
  ]);

  // Assistant info
  const [assistantName, setAssistantName] = useState('');
  const [assistantDesignation, setAssistantDesignation] = useState('Assistant Incharge');
  const [assistantContacts, setAssistantContacts] = useState<ContactDetail[]>([
    { id: '1', label: 'WhatsApp & Call', number: '', type: 'both' },
  ]);

  // Staff breakdown
  const [staff, setStaff] = useState<StaffBreakdown>({
    officersMale: 1,
    officersFemale: 0,
    officialsMale: 4,
    officialsFemale: 1,
    supportingMale: 2,
    supportingFemale: 0,
    outsourceMale: 1,
    outsourceFemale: 0,
    totalStaff: 9,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        label: 'Mobile',
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
    if (!code.trim() || !name.trim()) {
      setError('Please provide both Office Code and Office Name.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const cleanCode = code.trim().toUpperCase();
      const newOffice: Office = {
        id: `dau-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
        code: cleanCode,
        name: name.trim(),
        district: district.trim() || 'Larkana',
        zone: `Zone-D ${zoneName}`,
        zoneName: zoneName.trim() || 'Larkana',
        zoneCode: zoneCode.trim() || 'Z050D',
        type,
        isActive: true,
        totalCounters: Number(totalCounters) || 2,
        dailyCapacity: Number(dailyCapacity) || 150,
        expectedStaff: totalStaffCalculated,
        address: address.trim(),
        landline: landline.trim(),
        latitude: latitude === '' ? undefined : Number(latitude),
        longitude: longitude === '' ? undefined : Number(longitude),
        incharge: {
          name: inchargeName.trim() || 'Incharge Officer',
          designation: inchargeDesignation.trim() || 'Center Incharge',
          grade: 'BPS-17',
          startDate: new Date().toISOString().split('T')[0],
          contacts: inchargeContacts.filter((c) => c.number.trim().length > 0),
        },
        assistant: {
          name: assistantName.trim() || 'Office Assistant',
          designation: assistantDesignation.trim() || 'Office Assistant (OA)',
          grade: 'BPS-14',
          responsibilities: 'Token management, front-desk coordination, daily reconciliation registers.',
          mobileNumber: assistantContacts[0]?.number || '',
          whatsappNumber: assistantContacts[0]?.number || '',
          startDate: new Date().toISOString().split('T')[0],
          contacts: assistantContacts.filter((c) => c.number.trim().length > 0),
        },
        leadershipHistory: [],
        staffBreakdown: {
          ...staff,
          totalStaff: totalStaffCalculated,
        },
      };

      await onAddOffice(newOffice);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add office');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Add New NADRA Registration Center / Counter
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Info */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              Center Identification & Classification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Office Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NRC-NEW01 or UC-NEW"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Office Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NRC Larkana (Morning Shift) or UC New Center"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Office Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="NRC">NRC (Regular Registration Center)</option>
                  <option value="Executive">Executive Center</option>
                  <option value="MRV">MRV (Mobile Registration Van)</option>
                  <option value="NRC Counter">NRC Counter (Union Council / Town)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Zone Name</label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Zone Code</label>
                <input
                  type="text"
                  value={zoneCode}
                  onChange={(e) => setZoneCode(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Office Landline</label>
                <input
                  type="text"
                  placeholder="e.g. 074-9410123"
                  value={landline}
                  onChange={(e) => setLandline(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Daily Token Capacity</label>
                <input
                  type="number"
                  min="10"
                  value={dailyCapacity}
                  onChange={(e) => setDailyCapacity(parseInt(e.target.value) || 100)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-400 font-medium mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. Station Road, Larkana, Sindh"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">GPS Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="27.5589"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">GPS Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="68.2120"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Active Counters</label>
                <input
                  type="number"
                  min="1"
                  value={totalCounters}
                  onChange={(e) => setTotalCounters(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Incharge Section */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Current Office Incharge (Primary Authority)
              </h3>
              <button
                type="button"
                onClick={handleAddInchargeContact}
                disabled={inchargeContacts.length >= 4}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-lg hover:bg-emerald-900/60 transition-colors disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Phone Option ({inchargeContacts.length}/4)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Incharge Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Muhammad Aslam Chandio"
                  value={inchargeName}
                  onChange={(e) => setInchargeName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-semibold focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Official Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Assistant Director"
                  value={inchargeDesignation}
                  onChange={(e) => setInchargeDesignation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-slate-400">Phone Options (1–4 Numbers):</span>
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
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assistant Section */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Office Assistant / Second Incharge
              </h3>
              <button
                type="button"
                onClick={handleAddAssistantContact}
                disabled={assistantContacts.length >= 4}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 rounded-lg hover:bg-amber-900/60 transition-colors disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Phone Option ({assistantContacts.length}/4)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Assistant Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rashid Ali Solangi"
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Assistant Incharge / Superintendent"
                  value={assistantDesignation}
                  onChange={(e) => setAssistantDesignation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
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
                      <option value="call">Call Only</option>
                      <option value="whatsapp">WhatsApp Only</option>
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
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Staff Breakdown Table */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Staff Quantity Breakdown (Male &amp; Female Separated)
              </h3>
              <div className="px-2.5 py-1 bg-blue-950 border border-blue-800/60 rounded-lg text-blue-300 font-mono font-bold text-xs">
                Total Staff: {totalStaffCalculated}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold text-[11px]">
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Male Staff</th>
                    <th className="py-2 px-3 text-right">Female Staff</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  <tr>
                    <td className="py-2 px-3 font-sans text-white">Officers (Grade 16 &amp; Above)</td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.officersMale}
                        onChange={(e) => setStaff({ ...staff, officersMale: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-blue-400"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.officersFemale}
                        onChange={(e) => setStaff({ ...staff, officersFemale: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-purple-400"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white tabular-nums">
                      {(staff.officersMale || 0) + (staff.officersFemale || 0)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-3 font-sans text-white">Officials (Supervisors / DEOs)</td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.officialsMale}
                        onChange={(e) => setStaff({ ...staff, officialsMale: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-blue-400"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.officialsFemale}
                        onChange={(e) => setStaff({ ...staff, officialsFemale: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-purple-400"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white tabular-nums">
                      {(staff.officialsMale || 0) + (staff.officialsFemale || 0)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-3 font-sans text-white">Supporting Staff (Naib Qasid / Attendants)</td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.supportingMale}
                        onChange={(e) => setStaff({ ...staff, supportingMale: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-blue-400"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.supportingFemale}
                        onChange={(e) => setStaff({ ...staff, supportingFemale: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-purple-400"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white tabular-nums">
                      {(staff.supportingMale || 0) + (staff.supportingFemale || 0)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-3 font-sans text-white">Outsource Staff (Guards / Sanitation)</td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.outsourceMale}
                        onChange={(e) => setStaff({ ...staff, outsourceMale: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-blue-400"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={staff.outsourceFemale}
                        onChange={(e) => setStaff({ ...staff, outsourceFemale: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-purple-400"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white tabular-nums">
                      {(staff.outsourceMale || 0) + (staff.outsourceFemale || 0)}
                    </td>
                  </tr>

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
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Creating Center...' : 'Save & Add Office'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
