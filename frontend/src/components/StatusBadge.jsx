import React from 'react';

const statusConfig = {
  SUBMITTED: { label: 'Submitted', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  VERIFIED: { label: 'Verified', bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  DUPLICATE: { label: 'Duplicate', bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  ASSIGNED: { label: 'Assigned', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  RESOLVED: { label: 'Resolved (Pending Confirm)', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  RESOLUTION_VERIFICATION: { label: 'Verification Needed', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  CLOSED: { label: 'Closed & Verified', bg: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50' }
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-sm ${config.bg}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current animate-pulse"></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
