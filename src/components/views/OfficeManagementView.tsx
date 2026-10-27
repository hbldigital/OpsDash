/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Building, Plus, Check, Edit, ShieldCheck } from 'lucide-react';
import { Office } from '../../types/dashboard';

interface OfficeManagementViewProps {
  offices: Office[];
  onSaveOffice: (office: Office) => void;
}

export const OfficeManagementView: React.FC<OfficeManagementViewProps> = ({
  offices,
  onSaveOffice,
}) => {
  const [editingOffice, setEditingOffice] = useState<Partial<Office> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffice || !editingOffice.code || !editingOffice.name) return;

    onSaveOffice({
      code: editingOffice.code,
      name: editingOffice.name,
      district: editingOffice.district || 'Larkana',
      zone: 'Zone-D Larkana',
      type: editingOffice.type || 'NRC',
      isActive: editingOffice.isActive !== false,
      totalCounters: Number(editingOffice.totalCounters) || 4,
      expectedStaff: Number(editingOffice.expectedStaff) || 10,
    });
    setEditingOffice(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Office & DAU Master Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage active registration offices, DAUs, NRCs, counters, and expected staffing quotas.
          </p>
        </div>

        <button
          onClick={() =>
            setEditingOffice({
              code: '',
              name: '',
              district: 'Larkana',
              zone: 'Zone-D Larkana',
              type: 'NRC',
              isActive: true,
              totalCounters: 4,
              expectedStaff: 10,
            })
          }
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Office</span>
        </button>
      </div>

      {/* Offices Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-2.5 px-3">Office Code</th>
                <th className="py-2.5 px-3">Office Name</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Counters</th>
                <th className="py-2.5 px-3 text-right">Expected Staff</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {offices.map((o) => (
                <tr key={o.code} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-400">{o.code}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-100">{o.name}</td>
                  <td className="py-2.5 px-3 text-slate-300">{o.district}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-950 text-blue-300 border border-blue-800">
                      {o.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{o.totalCounters}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{o.expectedStaff}</td>
                  <td className="py-2.5 px-3 text-center">
                    {o.isActive ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-400">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => setEditingOffice(o)}
                      className="p-1 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 rounded"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Office Modal */}
      {editingOffice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <h2 className="text-sm font-bold text-slate-100 mb-3 pb-2 border-b border-slate-800">
              {editingOffice.code ? `Edit Office: ${editingOffice.code}` : 'Register New Office'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Office Code <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. LKR-01"
                  value={editingOffice.code || ''}
                  onChange={(e) => setEditingOffice({ ...editingOffice, code: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Office Name <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. DAU Larkana City"
                  value={editingOffice.name || ''}
                  onChange={(e) => setEditingOffice({ ...editingOffice, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
                  <input
                    type="text"
                    value={editingOffice.district || ''}
                    onChange={(e) => setEditingOffice({ ...editingOffice, district: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Office Type</label>
                  <select
                    value={editingOffice.type || 'NRC'}
                    onChange={(e) => setEditingOffice({ ...editingOffice, type: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                  >
                    <option value="NRC">NRC</option>
                    <option value="DAU">DAU</option>
                    <option value="MRV">MRV</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Counters</label>
                  <input
                    type="number"
                    value={editingOffice.totalCounters || 4}
                    onChange={(e) => setEditingOffice({ ...editingOffice, totalCounters: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Staff</label>
                  <input
                    type="number"
                    value={editingOffice.expectedStaff || 10}
                    onChange={(e) => setEditingOffice({ ...editingOffice, expectedStaff: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingOffice(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Save Office
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
