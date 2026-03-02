import React from 'react';
import { Bell, Plus } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-glass-border glass-panel z-10">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-white tracking-tight">Projects Repository</h2>
        <p className="text-xs text-slate-400">Manage lifecycle and integrations</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors">
          <Bell size={20} />
        </button>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/25">
          <Plus size={20} />
          <span>Create New Project</span>
        </button>
      </div>
    </header>
  );
}
