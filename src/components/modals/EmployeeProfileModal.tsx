/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  UserCheck,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  Briefcase,
  FileText,
  Award,
  Clock,
  Edit2,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Camera,
  ExternalLink,
} from 'lucide-react';
import { EmployeeProfile, PostingHistoryEntry } from '../../types';
import {
  NADRA_DESIGNATIONS,
  NADRA_GRADES,
  NADRA_DEPARTMENTS,
  OPERATIONS_WORKING_SEATS,
  OTHER_WORKING_SEATS,
  PROVINCES_DOMICILE,
  PAKISTAN_DISTRICTS,
  ALL_DISTRICTS_FLAT,
  RELIGIONS_LIST,
  SECTS_LIST,
  MARITAL_STATUS_LIST,
  DISABILITIES_LIST,
  QUALIFICATION_LEVELS,
} from '../../utils/pakistanData';
import { exportElementToPdf, exportElementToJpg } from '../../utils/exportEngine';

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeProfile | null;
  onSave?: (updated: EmployeeProfile) => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
}) => {
  if (!isOpen || !employee) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EmployeeProfile>({ ...employee });
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [desktopViewExport, setDesktopViewExport] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when employee prop changes
  React.useEffect(() => {
    setFormData({ ...employee });
    setIsEditing(false);
  }, [employee]);

  const handleFieldChange = (field: keyof EmployeeProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleFieldChange('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPostingHistory = () => {
    const newEntry: PostingHistoryEntry = {
      id: `post-${Date.now()}`,
      fromLocation: formData.officeName || 'Previous Office',
      toLocation: 'New Assignment',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      transferOrderNo: `NADRA/HR/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      remarks: 'Transferred as per administrative requirement.',
    };

    setFormData((prev) => ({
      ...prev,
      postingHistory: [newEntry, ...(prev.postingHistory || [])],
    }));
  };

  const handleUpdatePostingHistory = (index: number, field: keyof PostingHistoryEntry, value: string) => {
    const updated = [...(formData.postingHistory || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, postingHistory: updated }));
  };

  const handleRemovePostingHistory = (index: number) => {
    const updated = (formData.postingHistory || []).filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, postingHistory: updated }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
    setExportNotice('Employee profile updated successfully.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const availableSeats =
    formData.department === 'Operations'
      ? OPERATIONS_WORKING_SEATS
      : (OTHER_WORKING_SEATS[formData.department] || OPERATIONS_WORKING_SEATS);

  const availableSects = SECTS_LIST[formData.religion] || SECTS_LIST['Muslim'];
  const districtsForProvince =
    PAKISTAN_DISTRICTS[formData.domicileProvince] || ALL_DISTRICTS_FLAT;

  const handleExport = async (format: 'pdf' | 'jpg') => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setExportNotice(`Generating official high-resolution ${format.toUpperCase()}...`);

    try {
      const cleanName = formData.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `NADRA_Employee_Profile_${formData.erpNumber}_${cleanName}`;

      const options = {
        filename,
        title: `NADRA Employee Profile — ${formData.name}`,
        forceDesktopView: desktopViewExport,
        desktopWidth: 1280,
      };

      if (format === 'pdf') {
        const res = await exportElementToPdf(cardRef.current, options);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await exportElementToJpg(cardRef.current, options);
        if (!res.success) throw new Error(res.error);
      }
      setExportNotice(`${format.toUpperCase()} downloaded successfully!`);
    } catch (err: any) {
      setExportNotice(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  const rankColor =
    formData.punctualityRank === 'A+'
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      : formData.punctualityRank === 'A'
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
      : formData.punctualityRank === 'B'
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      : 'bg-rose-500/20 text-rose-400 border-rose-500/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Top Control Bar (Never exported) */}
        <div className="no-export px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                Official NADRA Personnel Record
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {formData.name} <span className="text-slate-400 font-normal">({formData.erpNumber})</span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View format selector */}
            <label className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={desktopViewExport}
                onChange={(e) => setDesktopViewExport(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-0"
              />
              <span className="text-[11px]">Desktop View (Full-Page View)</span>
            </label>

            {/* Export buttons */}
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-lg shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={() => handleExport('jpg')}
              disabled={isExporting}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JPG</span>
            </button>

            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Edit Profile</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="no-export px-6 py-2 bg-slate-800 border-b border-slate-700 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Modal Scrollable Body / Printable Canvas Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div
            ref={cardRef}
            id="employee-profile-card"
            className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 sm:p-8 space-y-6 shadow-xl relative"
          >
            {/* Letterhead Header Banner */}
            <div className="border-b-2 border-emerald-600/60 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-lg shadow">
                  🇵🇰
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    NATIONAL DATABASE & REGISTRATION AUTHORITY (NADRA)
                  </h1>
                  <p className="text-xs text-emerald-400 font-medium">
                    Regional Headquarters Larkana — Human Resource & Workforce Management Wing
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Official Employee Record Dossier · ERP Verified
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Punctuality Character:</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-xs border ${rankColor}`}>
                    Rank {formData.punctualityRank || 'A'} ({formData.punctualityScore || 95}%)
                  </span>
                </div>
                {formData.isExcessiveLeaves && (
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                    ⚠️ Excessive Leaves / Late Arrival Flagged
                  </span>
                )}
                <span className="text-[11px] text-slate-400">
                  Dossier Ref: {formData.erpNumber}
                </span>
              </div>
            </div>

            {/* Profile Overview (Hero Section) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800/80">
              {/* Photo */}
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="relative w-32 h-36 rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-slate-800 flex items-center justify-center shadow-lg">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                      <UserCheck className="w-12 h-12 text-slate-500 mb-1" />
                      <span className="text-[10px] font-medium text-slate-400">Official Photo</span>
                    </div>
                  )}

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="no-export absolute inset-0 bg-slate-950/70 hover:bg-slate-950/80 text-white flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-opacity"
                    >
                      <Camera className="w-5 h-5 text-emerald-400" />
                      <span>Upload Photo</span>
                    </button>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    ERP / NS #
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.erpNumber}
                      onChange={(e) => handleFieldChange('erpNumber', e.target.value)}
                      className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-bold text-white w-32"
                    />
                  ) : (
                    <span className="text-xs font-mono font-bold text-emerald-400">{formData.erpNumber}</span>
                  )}
                </div>
              </div>

              {/* Core Details */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Full Name:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="font-bold text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span className="font-bold text-white text-sm">{formData.name}</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Father's Name:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => handleFieldChange('fatherName', e.target.value)}
                      className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span className="text-slate-200 font-semibold">{formData.fatherName || '—'}</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">CNIC:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="43203-XXXXXXX-X"
                      value={formData.cnic}
                      onChange={(e) => handleFieldChange('cnic', e.target.value)}
                      className="text-white font-mono bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span className="font-mono text-emerald-400 font-bold">{formData.cnic || '—'}</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Designation:</span>
                  {isEditing ? (
                    <select
                      value={formData.designation}
                      onChange={(e) => handleFieldChange('designation', e.target.value)}
                      className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full"
                    >
                      {NADRA_DESIGNATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-blue-300 font-bold">{formData.designation}</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Grade / Scale:</span>
                  {isEditing ? (
                    <select
                      value={formData.grade}
                      onChange={(e) => handleFieldChange('grade', e.target.value)}
                      className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full"
                    >
                      {NADRA_GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-amber-300 font-bold">{formData.grade}</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Job Status:</span>
                  {isEditing ? (
                    <select
                      value={formData.jobType}
                      onChange={(e) => handleFieldChange('jobType', e.target.value)}
                      className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full"
                    >
                      <option value="Permanent">Permanent</option>
                      <option value="Contractual">Contractual</option>
                      <option value="Deputation">Deputation</option>
                      <option value="Daily Wages">Daily Wages</option>
                      <option value="Outsource">Outsource</option>
                    </select>
                  ) : (
                    <span className="text-slate-200 font-semibold">{formData.jobType}</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Department / Wing:</span>
                  {isEditing ? (
                    <select
                      value={formData.department}
                      onChange={(e) => {
                        const newDept = e.target.value;
                        handleFieldChange('department', newDept);
                        const newSeats =
                          newDept === 'Operations'
                            ? OPERATIONS_WORKING_SEATS
                            : (OTHER_WORKING_SEATS[newDept] || OPERATIONS_WORKING_SEATS);
                        handleFieldChange('workingSeat', newSeats[0]);
                      }}
                      className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full"
                    >
                      {NADRA_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-slate-200 font-semibold">{formData.department}</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Working Seat / Counter:</span>
                  {isEditing ? (
                    <select
                      value={formData.workingSeat}
                      onChange={(e) => handleFieldChange('workingSeat', e.target.value)}
                      className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full"
                    >
                      {availableSeats.map((seat) => (
                        <option key={seat} value={seat}>
                          {seat}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-emerald-400 font-bold">{formData.workingSeat}</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Current Office Assignment:</span>
                  <span className="text-slate-200 font-bold">
                    {formData.officeName} ({formData.officeCode})
                  </span>
                </div>
              </div>
            </div>

            {/* Service Dates & Passport Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Date of Appointment:</span>
                </span>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dateOfAppointment}
                    onChange={(e) => handleFieldChange('dateOfAppointment', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  />
                ) : (
                  <span className="text-slate-200 font-semibold">{formData.dateOfAppointment || '—'}</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Current Posting Date:</span>
                </span>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dateOfPostingCurrentLocation}
                    onChange={(e) => handleFieldChange('dateOfPostingCurrentLocation', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  />
                ) : (
                  <span className="text-slate-200 font-semibold">
                    {formData.dateOfPostingCurrentLocation || '—'}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Passport Status:</span>
                {isEditing ? (
                  <select
                    value={formData.passportStatus}
                    onChange={(e) => handleFieldChange('passportStatus', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  >
                    <option value="Yes">Yes (Passport Holder)</option>
                    <option value="No">No</option>
                  </select>
                ) : (
                  <span
                    className={`font-bold ${
                      formData.passportStatus === 'Yes' ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {formData.passportStatus === 'Yes' ? 'Passport Holder' : 'No Passport'}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Passport Details:</span>
                {formData.passportStatus === 'Yes' ? (
                  isEditing ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Passport No"
                        value={formData.passportNumber || ''}
                        onChange={(e) => handleFieldChange('passportNumber', e.target.value)}
                        className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full"
                      />
                      <div className="flex gap-1 text-[10px]">
                        <input
                          type="date"
                          placeholder="Issued"
                          value={formData.passportIssuanceDate || ''}
                          onChange={(e) => handleFieldChange('passportIssuanceDate', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded px-1 text-white w-1/2"
                        />
                        <input
                          type="date"
                          placeholder="Expires"
                          value={formData.passportExpiryDate || ''}
                          onChange={(e) => handleFieldChange('passportExpiryDate', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded px-1 text-white w-1/2"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="font-mono text-white font-bold">{formData.passportNumber || '—'}</span>
                      <span className="text-[10px] text-slate-400 block">
                        Exp: {formData.passportExpiryDate || '—'}
                      </span>
                    </div>
                  )
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </div>
            </div>

            {/* Official Credentials, E-Office & NEO User */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Official Email:</span>
                </span>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.officialEmail || ''}
                    onChange={(e) => handleFieldChange('officialEmail', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  />
                ) : (
                  <span className="text-blue-300 font-mono font-medium">{formData.officialEmail || '—'}</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Official / Contact #:</span>
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.officialNumber || formData.contactNumber || ''}
                    onChange={(e) => handleFieldChange('officialNumber', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  />
                ) : (
                  <span className="text-slate-200 font-medium">
                    {formData.officialNumber || formData.contactNumber || '—'}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">E-Office Username:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.eOfficeUsername || ''}
                    onChange={(e) => handleFieldChange('eOfficeUsername', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  />
                ) : (
                  <span className="text-slate-200 font-mono font-semibold">
                    {formData.eOfficeUsername || 'Not Configured'}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">NEO User Account:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.neoUser || ''}
                    onChange={(e) => handleFieldChange('neoUser', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  />
                ) : (
                  <span className="text-slate-200 font-mono font-semibold">
                    {formData.neoUser || 'Not Active'}
                  </span>
                )}
              </div>
            </div>

            {/* Domicile, Demographics & Religion / Sect */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Domicile Province:</span>
                {isEditing ? (
                  <select
                    value={formData.domicileProvince}
                    onChange={(e) => {
                      const newProv = e.target.value;
                      handleFieldChange('domicileProvince', newProv);
                      const newDistricts = PAKISTAN_DISTRICTS[newProv] || ALL_DISTRICTS_FLAT;
                      handleFieldChange('domicileDistrict', newDistricts[0]);
                    }}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  >
                    {PROVINCES_DOMICILE.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-slate-200 font-semibold">{formData.domicileProvince}</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Domicile District:</span>
                {isEditing ? (
                  <select
                    value={formData.domicileDistrict}
                    onChange={(e) => handleFieldChange('domicileDistrict', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  >
                    {districtsForProvince.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-slate-200 font-semibold">{formData.domicileDistrict}</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Religion:</span>
                {isEditing ? (
                  <select
                    value={formData.religion}
                    onChange={(e) => {
                      const newRel = e.target.value;
                      handleFieldChange('religion', newRel);
                      const newSects = SECTS_LIST[newRel] || SECTS_LIST['Other'];
                      handleFieldChange('sect', newSects[0]);
                    }}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  >
                    {RELIGIONS_LIST.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-slate-200 font-semibold">{formData.religion}</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Sect:</span>
                {isEditing ? (
                  <select
                    value={formData.sect}
                    onChange={(e) => handleFieldChange('sect', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  >
                    {availableSects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-slate-200 font-semibold">{formData.sect}</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Date of Birth:</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  />
                ) : (
                  <span className="text-slate-200 font-semibold">{formData.dateOfBirth || '—'}</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Gender:</span>
                {isEditing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) => handleFieldChange('gender', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : (
                  <span className="text-slate-200 font-semibold">{formData.gender}</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Marital Status:</span>
                {isEditing ? (
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  >
                    {MARITAL_STATUS_LIST.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-slate-200 font-semibold">{formData.maritalStatus}</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Disability Status:</span>
                {isEditing ? (
                  <div className="space-y-1">
                    <select
                      value={formData.disability}
                      onChange={(e) => handleFieldChange('disability', e.target.value)}
                      className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full"
                    >
                      <option value="No">No (None)</option>
                      <option value="Yes">Yes (Certified)</option>
                    </select>
                    {formData.disability === 'Yes' && (
                      <select
                        value={formData.disabilityType || DISABILITIES_LIST[0]}
                        onChange={(e) => handleFieldChange('disabilityType', e.target.value)}
                        className="text-white text-[10px] bg-slate-900 border border-slate-700 rounded px-1 py-1 w-full"
                      >
                        {DISABILITIES_LIST.map((dis) => (
                          <option key={dis} value={dis}>
                            {dis}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-200 font-semibold">
                    {formData.disability === 'Yes' ? `Yes — ${formData.disabilityType || 'Certified'}` : 'None'}
                  </span>
                )}
              </div>
            </div>

            {/* Qualifications & Education */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Highest Qualification & Education Background</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Degree / Certificate Title:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.qualificationDegree}
                      onChange={(e) => handleFieldChange('qualificationDegree', e.target.value)}
                      className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                    />
                  ) : (
                    <span className="text-white font-bold">{formData.qualificationDegree || '—'}</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Years of Education:</span>
                  {isEditing ? (
                    <select
                      value={formData.qualificationYears}
                      onChange={(e) => handleFieldChange('qualificationYears', e.target.value)}
                      className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                    >
                      {QUALIFICATION_LEVELS.map((q) => (
                        <option key={q.level} value={q.years}>
                          {q.level} ({q.years})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-slate-200 font-semibold">{formData.qualificationYears || '16 Years'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Address & Residential Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Permanent Address:</span>
                </span>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={formData.permanentAddress}
                    onChange={(e) => handleFieldChange('permanentAddress', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  />
                ) : (
                  <span className="text-slate-200 font-medium block mt-0.5">{formData.permanentAddress || '—'}</span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Current Residential Address:</span>
                </span>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={formData.currentAddress}
                    onChange={(e) => handleFieldChange('currentAddress', e.target.value)}
                    className="text-white bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full mt-0.5"
                  />
                ) : (
                  <span className="text-slate-200 font-medium block mt-0.5">{formData.currentAddress || '—'}</span>
                )}
              </div>
            </div>

            {/* Posting History & Service Timeline (Bar / Ledger Format) */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Posting History & Transfer Orders Timeline</span>
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleAddPostingHistory}
                    className="no-export px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Transfer Record</span>
                  </button>
                )}
              </div>

              {formData.postingHistory && formData.postingHistory.length > 0 ? (
                <div className="space-y-2.5">
                  {formData.postingHistory.map((post, idx) => (
                    <div
                      key={post.id || idx}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white">
                            {post.fromLocation} ➔ {post.toLocation}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono">
                            Order: {post.transferOrderNo}
                          </span>
                          {!post.endDate && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              Current Posting
                            </span>
                          )}
                        </div>

                        <p className="text-slate-400 text-[11px]">{post.remarks}</p>
                        {post.attachmentName && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-emerald-400" />
                            <span>Attachment: {post.attachmentName}</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono shrink-0">
                        <span>
                          {post.startDate} — {post.endDate || 'Present'}
                        </span>
                      </div>

                      {isEditing && (
                        <div className="no-export flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRemovePostingHistory(idx)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No previous transfer history recorded for this employee.
                </p>
              )}
            </div>

            {/* Official Footer Verification Stamp */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-2">
              <span>
                Generated from National Database & Registration Authority (NADRA) Operational Intelligence System.
              </span>
              <span className="font-mono">Record Verified · Larkana Zone-D (Z050D)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
