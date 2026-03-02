import React from 'react';

export function ChatArea() {
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#111522]/80 to-[#0c0f19]/90 relative min-w-0">
      {/* Chat Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#111522]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-purple-400">stars</span>
          <div>
            <h1 className="text-white text-base font-bold truncate">Session: New Project Initialization</h1>
            <p className="text-xs text-slate-400 font-body">Last saved: Just now</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-[20px]">history</span>
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
          <button className="ml-2 p-2 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
        {/* AI Message 1 */}
        <div className="flex gap-4 max-w-3xl">
          <div className="flex-shrink-0 mt-1">
            <div className="size-10 rounded-full bg-gradient-to-tr from-primary via-purple-600 to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-[20px]">smart_toy</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 ml-1">AI Assistant</span>
            <div className="p-4 rounded-2xl rounded-tl-none bg-[#232c48]/60 border border-white/5 text-slate-200 text-sm leading-relaxed font-body shadow-sm">
              <p>Hello BSA, let's start the BMAD Brainstorming. Tell me about your initial project vision. What are the core objectives you are trying to achieve?</p>
            </div>
          </div>
        </div>

        {/* User Message */}
        <div className="flex gap-4 max-w-3xl ml-auto justify-end">
          <div className="flex flex-col gap-1 items-end">
            <span className="text-xs font-bold text-slate-400 mr-1">You</span>
            <div className="p-4 rounded-2xl rounded-tr-none bg-primary text-white text-sm leading-relaxed font-body shadow-md shadow-primary/10">
              <p>We need to modernize the legacy inventory system. The goal is to reduce manual entry errors by 30% and integrate real-time tracking.</p>
            </div>
          </div>
          <div className="flex-shrink-0 mt-1">
            <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-white/10">
              <img className="w-full h-full object-cover" alt="User Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf30Rfih7v_YZMbHtOHPyd9DMWZitqNdgB7bjuQnnPYG1WadMbQnpwco-HM3K4rs-RFX-OnIZQKUaaytK4W5dyPLV0cR17hTd5i5vAenmI7bOm7RaA9HA1KqJfIcl2ywQWZIhmnZKhcPP5xuArGt4Gd2esJDtgXYJz716DcxvUhBAsJ4d9TF7rwEYYHfqsDV5FF9jsuFGnVqohjXxvFNJJxfwr3GevLMKsX-1Jok7qNKkuK5w_2I8KeVxvobWW8VZOxAfpKXr549Fy" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>

        {/* AI Message 2 */}
        <div className="flex gap-4 max-w-3xl animate-fade-in-up">
          <div className="flex-shrink-0 mt-1">
            <div className="size-10 rounded-full bg-gradient-to-tr from-primary via-purple-600 to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-[20px]">smart_toy</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 ml-1">AI Assistant</span>
            <div className="p-4 rounded-2xl rounded-tl-none bg-[#232c48]/60 border border-white/5 text-slate-200 text-sm leading-relaxed font-body shadow-sm">
              <p>Understood. Targeting a 30% reduction in manual errors and real-time tracking integration. <br/><br/>Let's deepen the <strong>Context Seeding</strong>. Who are the primary stakeholders for this inventory system, and are there any specific technical constraints we should be aware of immediately?</p>
            </div>
            <div className="flex gap-2 mt-1 ml-1">
              <button className="text-xs px-3 py-1.5 rounded-full bg-[#232c48] text-primary border border-primary/20 hover:bg-primary/10 transition-colors">warehouse_manager</button>
              <button className="text-xs px-3 py-1.5 rounded-full bg-[#232c48] text-primary border border-primary/20 hover:bg-primary/10 transition-colors">legacy_api</button>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-[#111522]/90 backdrop-blur-md border-t border-white/5">
        <div className="relative group">
          {/* Toolbar */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
              <span className="material-symbols-outlined text-[16px]">attach_file</span>
              Attach Research
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
              <span className="material-symbols-outlined text-[16px]">description</span>
              Use Template
            </button>
          </div>
          
          <textarea 
            className="w-full min-h-[120px] bg-[#192033] text-white placeholder-slate-500 rounded-xl border border-white/10 p-4 pr-32 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none font-body text-sm leading-relaxed shadow-inner" 
            placeholder="Type your vision statement, requirements, or answer the AI's question..."
          ></textarea>
          
          <div className="absolute bottom-3 right-3">
            <button className="flex items-center justify-center size-10 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all transform active:scale-95">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
          
          <div className="absolute bottom-3 left-4 text-[10px] text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">info</span>
            AI can make mistakes. Verify critical requirements.
          </div>
        </div>
      </div>
    </div>
  );
}
