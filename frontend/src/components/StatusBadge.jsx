import React from 'react';

const statusConfig = {
  SUBMITTED: { label: 'Submitted', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  VERIFIED: { label: 'Verified', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  REJECTED: { label: 'Rejected', bg: 'bg-red-50 text-red-700 border-red-200' },
  DUPLICATE: { label: 'Duplicate', bg: 'bg-slate-100 text-slate-700 border-slate-300' },
  ASSIGNED: { label: 'Assigned', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
  RESOLVED: { label: 'Resolved (Pending Confirm)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  RESOLUTION_VERIFICATION: { label: 'Verification Needed', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  CLOSED: { label: 'Closed & Verified', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
