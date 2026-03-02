import React from 'react';
import { Search, ChevronDown, Grid, List } from 'lucide-react';

export default function Toolbar() {
  return (
    <div className="px-8 py-6 flex flex-col gap-6 flex-shrink-0 z-10">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
        {/* Search */}
        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-500 group-focus-within:text-primary transition-colors" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl leading-5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all" 
            placeholder="Search projects by name, ID, or MCP..." 
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-xl text-sm font-medium whitespace-nowrap transition-colors">
            <span>All Phases</span>
            <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-sm font-medium whitespace-nowrap transition-colors">
            <span>Integrations</span>
            <ChevronDown size={16} />
          </button>
          
          <div className="w-px h-8 bg-white/10 mx-1"></div>
          
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button className="p-1.5 rounded-lg bg-white/10 text-white shadow-sm">
              <Grid size={20} />
            </button>
            <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300">
              <List size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
