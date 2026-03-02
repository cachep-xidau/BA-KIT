import React from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';

export default function App() {
  return (
    <div className="relative h-full w-full flex items-center justify-center p-4 sm:p-8">
      {/* Background Layer (Blurred Dashboard) */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none filter blur-sm select-none overflow-hidden">
        <div className="flex h-full w-full flex-col bg-[#111522]">
          <div className="px-10 py-3 border-b border-[#232c48] flex justify-between items-center">
            <div className="flex gap-4 text-white items-center">
              <div className="size-6 bg-primary/40 rounded-full"></div>
              <div className="h-4 w-32 bg-slate-700 rounded"></div>
            </div>
          </div>
          <div className="p-8 grid grid-cols-4 gap-6">
            <div className="col-span-1 h-32 bg-[#232c48] rounded-xl"></div>
            <div className="col-span-1 h-32 bg-[#232c48] rounded-xl"></div>
            <div className="col-span-1 h-32 bg-[#232c48] rounded-xl"></div>
            <div className="col-span-1 h-32 bg-[#232c48] rounded-xl"></div>
            <div className="col-span-3 h-64 bg-[#232c48] rounded-xl mt-4"></div>
            <div className="col-span-1 h-64 bg-[#192033] rounded-xl mt-4"></div>
          </div>
        </div>
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-background-dark/70 z-10 backdrop-blur-[2px]"></div>

      {/* Main Modal Container */}
      <div className="relative z-20 flex h-full w-full max-w-[1200px] max-h-[85vh] glass-panel rounded-2xl shadow-2xl flex-col md:flex-row overflow-hidden ring-1 ring-white/10">
        <Sidebar />
        <ChatArea />
      </div>
    </div>
  );
}
