import React from 'react';
import { Database, LayoutDashboard, FolderOpen, FileText, Server, Settings, MoreVertical } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-72 flex-shrink-0 flex flex-col glass-panel border-r border-glass-border z-20">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-900 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Database size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">BSA Portal</h1>
            <p className="text-xs text-slate-400 font-medium">Docs & Integrations</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors group">
          <LayoutDashboard size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
          <span className="font-medium text-sm">Dashboard</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/20 text-white shadow-sm ring-1 ring-primary/30 group">
          <FolderOpen size={20} className="text-primary" />
          <span className="font-medium text-sm">Projects</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors group">
          <FileText size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
          <span className="font-medium text-sm">Documentation</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors group">
          <Server size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
          <span className="font-medium text-sm">MCP Integrations</span>
        </a>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Settings</p>
        </div>
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors group">
          <Settings size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
          <span className="font-medium text-sm">Settings</span>
        </a>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-glass-border">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
          <div className="relative">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDri5UKr5g5Nc-bg1iiryT_Ov93JK43j2u4tj9dmWqR0OIc3jw8z5d0Qd_fle9Y23lXaSJ8NuFvG8qKfcF6qWpe6_aFHVQc6z_1yz3qLAox1RYdabSfma5J2SOTucTEAnuB2PqIgSKgbpkQOSgPh1rEsKEsVxhsdX3q5dBjxSamtycC0bU31V05WtTGzmmWd0T7ess1w-p6aI0P_yM_ThfCxX62ckOs23V-lVAeeRI1zS36a3eXrKCaDrcICh0rZnYzK1k1HrYoYcu_" 
              alt="Alex Morgan" 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1e1428] rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Alex Morgan</p>
            <p className="text-xs text-slate-400 truncate">Senior Analyst</p>
          </div>
          <MoreVertical size={20} className="text-slate-500" />
        </div>
      </div>
    </aside>
  );
}
