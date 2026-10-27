import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, FileEdit } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Submitted' | 'Verified' | 'Discrepancy' | 'Draft' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Verified':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Verified
        </span>
      );
    case 'Discrepancy':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Discrepancy
        </span>
      );
    case 'Draft':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <FileEdit className="w-3.5 h-3.5 text-slate-400" />
          Draft
        </span>
      );
    case 'Submitted':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          Submitted
        </span>
      );
  }
};
