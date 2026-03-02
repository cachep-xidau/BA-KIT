import React from 'react';
import { Plus } from 'lucide-react';

export default function NewProjectCard() {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 p-5 flex flex-col items-center justify-center gap-4 group cursor-pointer transition-all min-h-[200px]">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Plus className="text-slate-400 group-hover:text-primary" size={32} />
      </div>
      <div className="text-center">
        <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors">New Project</h3>
        <p className="text-slate-500 text-sm mt-1">Initialize a new documentation phase</p>
      </div>
    </div>
  );
}
