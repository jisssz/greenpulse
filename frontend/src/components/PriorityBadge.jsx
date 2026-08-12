import React from 'react';

const priorityConfig = {
  LOW: { label: 'Low Priority', bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  MEDIUM: { label: 'Medium Priority', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  HIGH: { label: 'High Priority', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  CRITICAL: { label: 'Critical Hazard', bg: 'bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-glow-emerald animate-pulse' }
};

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || { label: priority, bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-sm ${config.bg}`}>
      {config.label}
    </span>
  );
};

export default PriorityBadge;
