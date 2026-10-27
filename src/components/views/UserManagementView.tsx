/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Shield, Plus, Edit, UserCheck } from 'lucide-react';
import { UserProfile, UserRole } from '../../types/dashboard';

interface UserManagementViewProps {
  users: UserProfile[];
  onSaveUser: (user: UserProfile) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onSaveUser,
}) => {
  const [editingUser, setEditingUser] = useState<Partial<UserProfile> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.name || !editingUser.email) return;

    onSaveUser({
      id: editingUser.id || `u-${Date.now()}`,
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role || 'VIEWER',
      zone: 'Zone-D Larkana',
      assignedOfficeCode: editingUser.assignedOfficeCode,
    });
    setEditingUser(null);
  };

  const roleColors: Record<UserRole, string> = {
    SUPER_ADMIN: 'bg-purple-950 text-purple-300 border-purple-800',
    ZONE_ADMIN: 'bg-blue-950 text-blue-300 border-blue-800',
    REPORTING_ADMIN: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    DATA_ENTRY_OPERATOR: 'bg-amber-950 text-amber-300 border-amber-800',
    VERIFICATION_OFFICER: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    AUDITOR: 'bg-rose-950 text-rose-300 border-rose-800',
    VIEWER: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>User Management & Role-Based Access Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage operational officers, data entry operators, and oversight verification roles.
          </p>
        </div>

        <button
          onClick={() =>
            setEditingUser({
              name: '',
              email: '',
              role: 'DATA_ENTRY_OPERATOR',
              zone: 'Zone-D Larkana',
            })
          }
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-2.5 px-3">Officer Name</th>
                <th className="py-2.5 px-3">Official Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Assigned Zone</th>
                <th className="py-2.5 px-3">Restricted Office</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-medium text-slate-100">{u.name}</td>
                  <td className="py-2.5 px-3 text-slate-300">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${roleColors[u.role]}`}>
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{u.zone}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{u.assignedOfficeCode || 'Zone-Wide'}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => setEditingUser(u)}
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <h2 className="text-sm font-bold text-slate-100 mb-3 pb-2 border-b border-slate-800">
              {editingUser.id ? 'Edit User Credentials & Roles' : 'Create System User'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Tariq Ahmed"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Email <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  type="email"
                  placeholder="e.g. officer@nadra.gov.pk"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={editingUser.role || 'VIEWER'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                >
                  <option value="ZONE_ADMIN">Zone Administrator</option>
                  <option value="REPORTING_ADMIN">Reporting Administrator</option>
                  <option value="VERIFICATION_OFFICER">Verification Officer</option>
                  <option value="DATA_ENTRY_OPERATOR">Data Entry Operator</option>
                  <option value="AUDITOR">Auditor</option>
                  <option value="VIEWER">Viewer / Read Only</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Restricted Office Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. LKR-01 (Leave blank for full zone access)"
                  value={editingUser.assignedOfficeCode || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, assignedOfficeCode: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
