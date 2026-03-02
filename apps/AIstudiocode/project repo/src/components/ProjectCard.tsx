import React from 'react';
import { MoreHorizontal, Clock, KanbanSquare, FileText, PenTool, Code } from 'lucide-react';
import { Project, Integration } from '../types';

interface ProjectCardProps {
  project: Project;
}

const getPhaseStyles = (phase: string) => {
  if (phase.includes('Phase 1')) {
    return {
      border: 'bg-blue-500/50',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      progress: 'bg-blue-500'
    };
  }
  if (phase.includes('Phase 2')) {
    return {
      border: 'bg-orange-500/50',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      progress: 'bg-primary'
    };
  }
  return {
    border: 'bg-emerald-500/50',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    progress: 'bg-emerald-500'
  };
};

const IntegrationIcon = ({ type, zIndex }: { type: Integration, zIndex: number }) => {
  const baseClasses = "w-8 h-8 rounded-full bg-[#1a1122] flex items-center justify-center ring-2 ring-[#251b2e]";
  
  switch (type) {
    case 'jira':
      return (
        <div className={baseClasses} style={{ zIndex }} title="Jira">
          <KanbanSquare size={14} className="text-blue-400" />
        </div>
      );
    case 'confluence':
      return (
        <div className={baseClasses} style={{ zIndex }} title="Confluence">
          <FileText size={14} className="text-blue-300" />
        </div>
      );
    case 'figma':
      return (
        <div className={baseClasses} style={{ zIndex }} title="Figma">
          <PenTool size={14} className="text-purple-400" />
        </div>
      );
    case 'github':
      return (
        <div className={baseClasses} style={{ zIndex }} title="GitHub">
          <Code size={14} className="text-slate-300" />
        </div>
      );
  }
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const styles = getPhaseStyles(project.phase);

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 group cursor-pointer relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${styles.border}`}></div>
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${styles.badge}`}>
              {project.phase}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-2">
            {project.description}
          </p>
        </div>
        <button className="text-slate-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div className={`${styles.progress} h-1.5 rounded-full`} style={{ width: `${project.progress}%` }}></div>
        </div>
      </div>

      <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.integrations.map((integration, idx) => (
            <IntegrationIcon key={integration} type={integration} zIndex={10 - idx} />
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock size={14} />
          <span>{project.updatedAt}</span>
        </div>
      </div>
    </div>
  );
}
