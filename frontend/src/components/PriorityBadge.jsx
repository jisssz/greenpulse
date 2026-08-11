import React from 'react';

const priorityConfig = {
  LOW: { label: 'Low Priority', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
  MEDIUM: { label: 'Medium Priority', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  HIGH: { label: 'High Priority', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  CRITICAL: { label: 'Critical Hazard', bg: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' }
};

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || { label: priority, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
      {config.label}
    </span>
  );
};

export default PriorityBadge;
