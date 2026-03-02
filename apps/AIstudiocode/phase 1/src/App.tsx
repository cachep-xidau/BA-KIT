/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Search, FolderOpen, CheckSquare, BarChart2, Settings,
  ArrowLeft, MoreHorizontal, Lock, Plus, LayoutGrid, List,
  Lightbulb, LineChart, Building2, Code2, Network
} from 'lucide-react';

const Header = () => (
  <header className="flex items-center justify-between border-b border-[#232f48] px-6 py-3 bg-[#111722] z-50 sticky top-0">
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-3">
        <div className="text-[#2b6cee]">
          <Network className="w-8 h-8" />
        </div>
        <h2 className="text-white text-lg font-bold tracking-tight">BSA Portal</h2>
      </div>
      <nav className="hidden md:flex items-center gap-6">
        <a href="#" className="text-slate-300 text-sm font-medium hover:text-[#2b6cee] transition-colors">Dashboard</a>
        <a href="#" className="text-[#2b6cee] text-sm font-medium">Projects</a>
        <a href="#" className="text-slate-300 text-sm font-medium hover:text-[#2b6cee] transition-colors">Settings</a>
      </nav>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="hidden md:flex items-center bg-[#232f48] rounded-xl px-3 py-2 w-64 focus-within:ring-2 focus-within:ring-[#2b6cee]/50 transition-all">
        <Search className="w-5 h-5 text-[#92a4c9]" />
        <input 
          type="text" 
          placeholder="Search projects..." 
          className="bg-transparent border-none outline-none text-sm text-white ml-2 w-full placeholder:text-[#92a4c9]"
        />
      </div>
      <button className="bg-[#2b6cee] hover:bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-xl transition-colors shadow-lg shadow-[#2b6cee]/20 whitespace-nowrap">
        New Project
      </button>
      <div className="relative cursor-pointer shrink-0">
        <img 
          src="https://i.pravatar.cc/150?img=11" 
          alt="User" 
          className="w-10 h-10 rounded-full border-2 border-[#232f48]"
        />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111722]"></div>
      </div>
    </div>
  </header>
);

const Sidebar = () => (
  <aside className="hidden xl:flex w-20 flex-col items-center py-8 gap-8 border-r border-[#232f48] bg-[#111722] z-40 shrink-0">
    <button className="w-10 h-10 rounded-xl bg-[#2b6cee]/10 text-[#2b6cee] flex items-center justify-center hover:bg-[#2b6cee] hover:text-white transition-all group relative">
      <FolderOpen className="w-5 h-5" />
    </button>
    <button className="w-10 h-10 rounded-xl text-slate-400 flex items-center justify-center hover:bg-[#232f48] hover:text-white transition-all group relative">
      <CheckSquare className="w-5 h-5" />
    </button>
    <button className="w-10 h-10 rounded-xl text-slate-400 flex items-center justify-center hover:bg-[#232f48] hover:text-white transition-all group relative">
      <BarChart2 className="w-5 h-5" />
    </button>
    <div className="mt-auto">
      <button className="w-10 h-10 rounded-xl text-slate-400 flex items-center justify-center hover:bg-[#232f48] hover:text-white transition-all group relative">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  </aside>
);

const ProjectHeader = () => (
  <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-end">
    <div className="flex flex-col gap-2">
      <button className="flex items-center gap-2 text-[#2b6cee] text-sm font-semibold hover:underline w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>
      <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
        Omni-Channel Order System
      </h1>
      <p className="text-slate-400 text-base max-w-2xl">
        Manage the lifecycle of your analysis, requirements, and design artifacts. Currently in <span className="text-[#2b6cee] font-medium">Phase 1: Analysis</span>.
      </p>
    </div>
    
    <div className="bg-[#232f48]/40 backdrop-blur-md border border-white/5 p-1 pr-4 rounded-xl flex items-center gap-4">
      <div className="bg-[#192233] rounded-lg px-3 py-2 flex items-center gap-2">
        <Network className="w-4 h-4 text-white/50" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Connect</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">F</div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white group-hover:text-[#2b6cee] transition-colors">Figma</span>
            <span className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Connected
            </span>
          </div>
        </div>
        <div className="w-px h-6 bg-white/10"></div>
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">C</div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white group-hover:text-[#2b6cee] transition-colors">Confluence</span>
            <span className="text-[10px] text-slate-400">Syncing...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LifecycleStepper = () => (
  <div className="w-full py-8">
    <div className="relative flex items-center justify-between w-full max-w-4xl mx-auto">
      <div className="absolute left-0 top-5 w-full h-1 bg-[#232f48] rounded-full z-0"></div>
      <div className="absolute left-0 top-5 w-[15%] h-1 bg-gradient-to-r from-[#2b6cee] to-blue-400 rounded-full z-0 shadow-[0_0_10px_rgba(43,108,238,0.5)]"></div>
      
      <div className="relative z-10 flex flex-col items-center gap-3 group cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-[#101622] border-2 border-[#2b6cee] flex items-center justify-center shadow-[0_0_20px_rgba(43,108,238,0.4)] transition-transform group-hover:scale-110">
          <div className="w-4 h-4 rounded-full bg-[#2b6cee] animate-pulse"></div>
        </div>
        <div className="absolute top-12 flex flex-col items-center w-40 text-center">
          <span className="text-sm font-bold text-white">Analysis (BMAD)</span>
          <span className="text-xs text-[#2b6cee] font-medium">In Progress</span>
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center gap-3 opacity-50">
        <div className="w-10 h-10 rounded-full bg-[#101622] border-2 border-[#334155] flex items-center justify-center">
          <span className="text-slate-400 font-medium">2</span>
        </div>
        <div className="absolute top-12 flex flex-col items-center w-40 text-center">
          <span className="text-sm font-semibold text-slate-300">PRD Content</span>
          <span className="text-xs text-slate-500">Pending</span>
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center gap-3 opacity-50">
        <div className="w-10 h-10 rounded-full bg-[#101622] border-2 border-[#334155] flex items-center justify-center">
          <span className="text-slate-400 font-medium">3</span>
        </div>
        <div className="absolute top-12 flex flex-col items-center w-40 text-center">
          <span className="text-sm font-semibold text-slate-300">Artifacts</span>
          <span className="text-xs text-slate-500">Locked</span>
        </div>
      </div>
    </div>
  </div>
);

const TaskCard = ({ tag, tagColor, title, description, icon, progress, assignees, action, actionPrimary }: any) => {
  const colorMap: Record<string, any> = {
    blue: { 
      bg: 'bg-blue-500/20', 
      text: 'text-blue-300', 
      border: 'border-blue-500/30', 
      hoverText: 'group-hover:text-blue-400', 
      hoverBorder: 'hover:border-blue-500/30',
      hoverBtnText: 'hover:text-blue-300',
      leftBorder: '' 
    },
    purple: { 
      bg: 'bg-purple-500/20', 
      text: 'text-purple-300', 
      border: 'border-purple-500/30', 
      hoverText: 'group-hover:text-purple-400', 
      hoverBorder: 'hover:border-purple-500/30',
      hoverBtnText: 'hover:text-purple-300',
      leftBorder: 'border-l-4 border-l-purple-500/50' 
    },
    emerald: { 
      bg: 'bg-emerald-500/20', 
      text: 'text-emerald-300', 
      border: 'border-emerald-500/30', 
      hoverText: 'group-hover:text-emerald-400', 
      hoverBorder: 'hover:border-emerald-500/30',
      hoverBtnText: 'hover:text-emerald-300',
      leftBorder: '' 
    },
    orange: { 
      bg: 'bg-orange-500/20', 
      text: 'text-orange-300', 
      border: 'border-orange-500/30', 
      hoverText: 'group-hover:text-orange-400', 
      hoverBorder: 'hover:border-orange-500/30',
      hoverBtnText: 'hover:text-orange-300',
      leftBorder: '' 
    },
  };
  
  const colors = colorMap[tagColor];
  
  return (
    <div className={`bg-gradient-to-br from-[#2b6cee]/5 to-[#232f48]/40 backdrop-blur-md border border-white/5 rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-[#2b6cee]/50 hover:shadow-[0_0_15px_rgba(43,108,238,0.2)] transition-all ${colors.leftBorder}`}>
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
        {icon}
      </div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className={`${colors.bg} ${colors.text} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border ${colors.border}`}>
          {tag}
        </div>
        <button className="text-slate-400 hover:text-white transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 relative z-10">
        <h3 className={`text-lg font-bold text-white mb-1 ${colors.hoverText} transition-colors`}>{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
      
      <div className="flex items-center gap-4 mt-2 relative z-10">
        <div className={`relative w-10 h-10 ${progress === 0 ? 'opacity-50' : ''}`}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path className="text-[#232f48]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
            {progress > 0 && (
              <path className="text-[#2b6cee]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${progress}, 100`} strokeLinecap="round" strokeWidth="3"></path>
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
            {progress}%
          </div>
        </div>
        
        <div className="flex-1">
          {assignees ? (
            <div>
              <div className="flex -space-x-2 overflow-hidden mb-1">
                <img src="https://i.pravatar.cc/150?img=32" className="inline-block w-6 h-6 rounded-full ring-2 ring-[#192233]" alt="User 1" />
                <img src="https://i.pravatar.cc/150?img=12" className="inline-block w-6 h-6 rounded-full ring-2 ring-[#192233]" alt="User 2" />
              </div>
              <span className="text-xs text-slate-500">{assignees} Assignees</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">Not started</span>
          )}
        </div>
        
        {actionPrimary ? (
          <button className="px-4 py-2 bg-[#2b6cee] text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
            {action}
          </button>
        ) : (
          <button className={`px-4 py-2 bg-[#232f48] text-white text-xs font-bold rounded-lg hover:bg-white/10 ${colors.hoverBtnText} border border-transparent ${colors.hoverBorder} transition-all`}>
            {action}
          </button>
        )}
      </div>
    </div>
  );
};

const PhaseActivities = () => (
  <div className="mt-8 flex flex-col gap-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1 bg-[#2b6cee] rounded-full shadow-[0_0_10px_rgba(43,108,238,0.8)]"></div>
        <h2 className="text-2xl font-bold text-white">Phase 1: Analysis Activities</h2>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#232f48] text-white hover:bg-slate-700 transition-colors">
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-transparent text-slate-500 hover:text-white hover:bg-[#232f48] transition-colors">
          <List className="w-5 h-5" />
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TaskCard 
        tag="Analysis" tagColor="blue"
        title="Brainstorming"
        description="Initial idea generation and scope definition workshops with stakeholders."
        icon={<Lightbulb className="w-24 h-24 text-white" />}
        progress={40}
        assignees={2}
        action="Resume"
        actionPrimary
      />
      
      <TaskCard 
        tag="Research" tagColor="purple"
        title="Market Research"
        description="Competitor analysis and feature gap identification matrix."
        icon={<LineChart className="w-24 h-24 text-white" />}
        progress={0}
        action="Start"
      />
      
      <TaskCard 
        tag="Discovery" tagColor="emerald"
        title="Domain Research"
        description="Internal stakeholder interviews and business rule documentation."
        icon={<Building2 className="w-24 h-24 text-white" />}
        progress={0}
        action="Start"
      />
      
      <TaskCard 
        tag="Feasibility" tagColor="orange"
        title="Technical Research"
        description="API availability check, legacy system constraints, and data mapping."
        icon={<Code2 className="w-24 h-24 text-white" />}
        progress={0}
        action="Start"
      />
      
      <div className="bg-[#192233]/40 border border-[#232f48] rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden opacity-60">
        <div className="flex justify-between items-start relative z-10">
          <div className="bg-slate-700/50 text-slate-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
            Deliverable
          </div>
          <Lock className="w-5 h-5 text-slate-600" />
        </div>
        <div className="flex-1 relative z-10">
          <h3 className="text-lg font-bold text-slate-400 mb-1">Product Brief</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Finalize scope, objectives, and success metrics document.</p>
        </div>
        <div className="flex items-center gap-4 mt-2 relative z-10">
          <div className="flex-1">
            <div className="h-1 w-full bg-[#232f48] rounded-full"></div>
            <span className="text-[10px] text-slate-600 mt-1 block">Requires previous steps completion</span>
          </div>
          <button className="px-4 py-2 bg-[#1e2636] text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" /> Locked
          </button>
        </div>
      </div>
      
      <div className="border-2 border-dashed border-[#232f48] rounded-xl p-6 flex flex-col gap-2 items-center justify-center min-h-[220px] hover:border-[#2b6cee]/50 hover:bg-[#232f48]/30 transition-all cursor-pointer group">
        <div className="w-12 h-12 rounded-full bg-[#232f48] flex items-center justify-center group-hover:bg-[#2b6cee] group-hover:text-white text-slate-400 transition-colors">
          <Plus className="w-6 h-6" />
        </div>
        <span className="text-sm font-semibold text-slate-400 group-hover:text-white transition-colors">Add Custom Task</span>
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-[#101622] text-slate-100 font-sans overflow-hidden selection:bg-[#2b6cee] selection:text-white">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto relative">
           <div className="absolute top-0 left-0 w-full h-[500px] bg-[#2b6cee]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
           
           <div className="max-w-[1200px] mx-auto p-6 md:p-10 flex flex-col gap-8 pb-20 relative z-10">
              <ProjectHeader />
              <LifecycleStepper />
              <PhaseActivities />
           </div>
        </main>
      </div>
    </div>
  );
}
