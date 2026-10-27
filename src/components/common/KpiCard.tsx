import React from 'react';
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  change?: number; // delta compared to previous day
  changeLabel?: string;
  isPercentageChange?: boolean;
  status?: 'nominal' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  discrepancyNote?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  changeLabel = 'vs previous day',
  isPercentageChange = false,
  status = 'nominal',
  onClick,
  discrepancyNote,
}) => {
  const isClickable = Boolean(onClick);

  // Status-driven styling
  const statusColors = {
    nominal: 'border-slate-800/80 hover:border-slate-700 bg-slate-900/60',
    warning: 'border-amber-500/40 hover:border-amber-500/60 bg-amber-950/20',
    error: 'border-rose-500/40 hover:border-rose-500/60 bg-rose-950/20',
    info: 'border-blue-500/40 hover:border-blue-500/60 bg-blue-950/20',
  };

  const iconColors = {
    nominal: 'text-blue-400 bg-blue-950/50 border border-blue-800/40',
    warning: 'text-amber-400 bg-amber-950/50 border border-amber-800/40',
    error: 'text-rose-400 bg-rose-950/50 border border-rose-800/40',
    info: 'text-sky-400 bg-sky-950/50 border border-sky-800/40',
  };

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-150 flex flex-col justify-between ${
        statusColors[status]
      } ${isClickable ? 'cursor-pointer hover:shadow-lg hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider line-clamp-1">
          {title}
        </span>
        <div className={`p-2 rounded-lg shrink-0 ${iconColors[status]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="my-1">
        <div className="text-2xl font-bold tracking-tight text-white tabular-nums">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{subtitle}</div>
        )}
      </div>

      {discrepancyNote ? (
        <div className="mt-2 text-xs text-amber-300/90 bg-amber-950/40 px-2 py-1 rounded border border-amber-800/30 line-clamp-1">
          {discrepancyNote}
        </div>
      ) : change !== undefined && change !== null ? (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <span
            className={`flex items-center font-medium tabular-nums ${
              change > 0
                ? 'text-emerald-400'
                : change < 0
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {change > 0 ? (
              <ArrowUp className="w-3 h-3 mr-0.5" />
            ) : change < 0 ? (
              <ArrowDown className="w-3 h-3 mr-0.5" />
            ) : null}
            {change > 0 ? `+${change}` : change}
            {isPercentageChange ? '%' : ''}
          </span>
          <span className="text-slate-400 text-[11px] truncate">{changeLabel}</span>
        </div>
      ) : null}
    </div>
  );
};
