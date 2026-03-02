import React from 'react';

const steps = [
  { id: 1, title: 'Context Seeding', status: 'In Progress', active: true },
  { id: 2, title: 'Idea Generation', status: 'Pending', active: false },
  { id: 3, title: 'Feasibility Check', status: 'Pending', active: false },
  { id: 4, title: 'Strategic Alignment', status: 'Pending', active: false },
];

export function Sidebar() {
  return (
    <div className="w-full md:w-72 lg:w-80 bg-[#151a29]/90 border-r border-white/5 flex flex-col p-6 relative flex-shrink-0">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 text-white mb-2">
          <span className="material-symbols-outlined text-primary">psychology</span>
          <h2 className="text-lg font-bold tracking-tight">AI Brainstorming</h2>
        </div>
        <p className="text-xs text-slate-400 font-body">Phase 1: Analysis Workflow</p>
      </div>

      {/* Stepper */}
      <div className="flex-1 relative">
        {/* Vertical Line */}
        <div className="absolute left-[15px] top-4 bottom-10 w-[2px] bg-[#232c48] z-0"></div>
        
        <div className="space-y-8 relative z-10">
          {steps.map((step) => (
            <div key={step.id} className={`group flex items-start gap-4 ${!step.active ? 'opacity-60' : ''}`}>
              <div className="relative flex items-center justify-center">
                {step.active ? (
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_15px_rgba(43,91,238,0.5)] pulse-ring">
                    <span className="text-sm font-bold">{step.id}</span>
                  </div>
                ) : (
                  <div className="size-8 rounded-full bg-[#232c48] border border-slate-600 flex items-center justify-center text-slate-400">
                    <span className="text-sm font-bold">{step.id}</span>
                  </div>
                )}
              </div>
              <div className="pt-1">
                <h3 className={`font-medium text-sm leading-none ${step.active ? 'text-white' : 'text-slate-200'}`}>
                  {step.title}
                </h3>
                <p className={`text-xs mt-1 font-body ${step.active ? 'text-primary' : 'text-slate-500'}`}>
                  {step.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#232c48]/50 border border-white/5">
          <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center text-xs font-bold text-white">
            JS
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">John Smith</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Sr. Analyst</span>
          </div>
        </div>
      </div>
    </div>
  );
}
