/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import ProjectCard from './components/ProjectCard';
import NewProjectCard from './components/NewProjectCard';
import { projects } from './data';

export default function App() {
  return (
    <div className="dark flex h-screen w-full bg-background-dark text-slate-100 font-display overflow-hidden selection:bg-primary selection:text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Decorative Background Glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <Header />
        <Toolbar />
        
        <div className="flex-1 overflow-y-auto px-8 pb-8 z-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
            <NewProjectCard />
          </div>
        </div>
      </main>
    </div>
  );
}
