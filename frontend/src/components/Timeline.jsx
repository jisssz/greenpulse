import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const STAGES = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'RESOLUTION_VERIFICATION', label: 'Confirming' },
  { key: 'CLOSED', label: 'Closed' }
];

const getStageIndex = (status) => {
  if (status === 'REJECTED' || status === 'DUPLICATE') return -1;
  const index = STAGES.findIndex(s => s.key === status);
  return index !== -1 ? index : 0;
};

const Timeline = ({ currentStatus }) => {
  const currentIndex = getStageIndex(currentStatus);
  const isRejected = currentStatus === 'REJECTED';
  const isDuplicate = currentStatus === 'DUPLICATE';

  if (isRejected || isDuplicate) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Report {isRejected ? 'Rejected' : 'Marked Duplicate'}</h4>
          <p className="text-xs text-red-600">This report is no longer moving through the active operational pipeline.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="hidden md:flex items-center justify-between relative">
        {/* Background Track Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-0"></div>
        {/* Active Track Progress Line */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-brand-500 transition-all duration-500 -z-0"
          style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
        ></div>

        {STAGES.map((stage, idx) => {
          const isPassed = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-sm ${
                isCurrent 
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100 scale-110' 
                  : isPassed 
                  ? 'bg-brand-500 text-white' 
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-[11px] font-medium mt-2 text-center max-w-[70px] ${
                isCurrent ? 'text-brand-800 font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Stacked View */}
      <div className="md:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
          <span>Current Stage:</span>
          <span className="font-bold text-brand-700 uppercase">{currentStatus}</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-brand-600 h-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / STAGES.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
