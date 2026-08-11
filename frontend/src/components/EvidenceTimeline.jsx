import React from 'react';
import { CheckCircle2, Clock, ShieldAlert, Award, FileText, AlertCircle } from 'lucide-react';

const STAGES = [
  { key: 'SUBMITTED', label: 'Evidence Submitted', icon: FileText },
  { key: 'EVIDENCE_VERIFIED', label: 'Evidence Verified', icon: CheckCircle2 },
  { key: 'CASE_OPENED', label: 'Enforcement Case Opened', icon: ShieldAlert },
  { key: 'INVESTIGATED', label: 'Authority Investigation', icon: Clock },
  { key: 'VIOLATION_CONFIRMED', label: 'Violation Confirmed', icon: AlertCircle },
  { key: 'FINE_ISSUED', label: 'Fine / Challan Issued', icon: FileText },
  { key: 'FINE_PAID', label: 'Fine Paid', icon: CheckCircle2 },
  { key: 'REWARD_PAID', label: 'Citizen Reward Paid', icon: Award }
];

export default function EvidenceTimeline({ currentStatus = 'SUBMITTED' }) {
  const getStageIndex = (status) => {
    switch (status) {
      case 'SUBMITTED': return 0;
      case 'UNDER_REVIEW': return 0;
      case 'VERIFIED': return 1;
      case 'OPEN': return 2;
      case 'UNDER_INVESTIGATION': return 3;
      case 'IDENTITY_PENDING':
      case 'OFFENDER_IDENTIFIED':
      case 'VIOLATION_CONFIRMED': return 4;
      case 'FINE_PENDING':
      case 'FINE_ISSUED': return 5;
      case 'PAYMENT_PENDING':
      case 'FINE_PAID': return 6;
      case 'REWARD_PENDING':
      case 'REWARD_APPROVED':
      case 'REWARD_PAID':
      case 'CLOSED': return 7;
      default: return 0;
    }
  };

  const activeIndex = getStageIndex(currentStatus);

  return (
    <div className="w-full py-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={stage.key} className="flex md:flex-col items-center gap-2 z-10 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md font-bold'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                <Icon size={18} />
              </div>
              <div className="text-left md:text-center">
                <p className={`text-xs font-semibold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                  {stage.label}
                </p>
                {isCurrent && (
                  <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    Current Stage
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
