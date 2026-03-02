import React, { useState } from 'react';

const providers = [
  { id: 'figma', name: 'Figma', icon: 'brush' },
  { id: 'confluence', name: 'Confluence', icon: 'description' },
  { id: 'github', name: 'GitHub', icon: 'code' },
  { id: 'jira', name: 'Jira', icon: 'view_kanban' },
];

export default function App() {
  const [selectedProvider, setSelectedProvider] = useState('figma');
  const [showToken, setShowToken] = useState(false);
  const [apiToken, setApiToken] = useState('123456789');
  const [workspaceUrl, setWorkspaceUrl] = useState('');
  
  const [capabilities, setCapabilities] = useState({
    readPrds: true,
    writeArtifacts: true,
    syncDiagrams: false,
  });

  const toggleCapability = (key: keyof typeof capabilities) => {
    setCapabilities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen overflow-hidden relative font-display">
      {/* Dashboard Background Simulation (Blurred Context) */}
      <div aria-hidden="true" className="absolute inset-0 z-0 flex flex-col p-6 gap-6 select-none pointer-events-none opacity-40 blur-sm overflow-hidden">
        {/* Top Nav Simulation */}
        <div className="h-16 w-full bg-[#1c1d27] rounded-xl flex items-center px-6 justify-between border border-[#3b3f54]">
          <div className="w-32 h-4 bg-[#3b3f54] rounded"></div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#3b3f54]"></div>
            <div className="w-8 h-8 rounded-full bg-[#3b3f54]"></div>
          </div>
        </div>
        
        {/* Main Content Simulation */}
        <div className="flex flex-1 gap-6">
          <div className="w-64 bg-[#1c1d27] rounded-xl border border-[#3b3f54] flex flex-col p-4 gap-4">
            <div className="w-full h-8 bg-[#3b3f54]/50 rounded"></div>
            <div className="w-full h-8 bg-[#3b3f54]/50 rounded"></div>
            <div className="w-full h-8 bg-[#3b3f54]/50 rounded"></div>
            <div className="w-full h-8 bg-[#3b3f54]/50 rounded"></div>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <div className="h-48 bg-[#1c1d27] rounded-xl border border-[#3b3f54] w-full"></div>
            <div className="flex-1 grid grid-cols-2 gap-6">
              <div className="bg-[#1c1d27] rounded-xl border border-[#3b3f54]"></div>
              <div className="bg-[#1c1d27] rounded-xl border border-[#3b3f54]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        {/* Modal Content */}
        <div className="glass-panel w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#3b3f54] flex justify-between items-start">
            <div>
              <h2 className="text-white text-2xl font-bold leading-tight">Connect MCP Server</h2>
              <p className="text-[#9da1b9] text-sm font-normal mt-1">Configure your provider to sync artifacts and diagrams.</p>
            </div>
            <button className="text-[#9da1b9] hover:text-white transition-colors rounded p-1 hover:bg-[#3b3f54]/50">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Step 1: Provider Selection */}
            <div className="px-8 pt-6 pb-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">1</span>
                <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Select Provider</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {providers.map((provider) => (
                  <label key={provider.id} className="group relative cursor-pointer">
                    <input 
                      type="radio" 
                      name="provider" 
                      className="peer sr-only" 
                      checked={selectedProvider === provider.id}
                      onChange={() => setSelectedProvider(provider.id)}
                    />
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#3b3f54] bg-[#1c1d27] hover:bg-[#252736] hover:border-[#4f5470] peer-checked:border-primary peer-checked:bg-primary/10 transition-all duration-200 h-28">
                      <span className="material-symbols-outlined text-3xl mb-3 text-[#9da1b9] peer-checked:text-primary group-hover:text-white">
                        {provider.icon}
                      </span>
                      <span className="text-sm font-medium text-white">{provider.name}</span>
                      <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 text-primary">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Configuration */}
            <div className="px-8 py-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#3b3f54] text-white text-xs font-bold">2</span>
                <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Authentication & Permissions</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Inputs */}
                <div className="space-y-5">
                  <label className="flex flex-col gap-2">
                    <span className="text-white text-sm font-medium">API Access Token</span>
                    <div className="relative group">
                      <input 
                        type={showToken ? "text" : "password"}
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                        className="w-full bg-[#1c1d27] border border-[#3b3f54] text-white text-sm rounded-lg focus:ring-1 focus:ring-primary focus:border-primary block p-3 pr-10 placeholder-[#585c75] outline-none transition-colors" 
                        placeholder="sk_live_..." 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#9da1b9] hover:text-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showToken ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    <p className="text-xs text-[#9da1b9]">Token must have <span className="text-white">read:project</span> scope enabled.</p>
                  </label>
                  
                  <label className="flex flex-col gap-2">
                    <span className="text-white text-sm font-medium">Workspace URL</span>
                    <input 
                      type="text" 
                      value={workspaceUrl}
                      onChange={(e) => setWorkspaceUrl(e.target.value)}
                      className="w-full bg-[#1c1d27] border border-[#3b3f54] text-white text-sm rounded-lg focus:ring-1 focus:ring-primary focus:border-primary block p-3 placeholder-[#585c75] outline-none transition-colors" 
                      placeholder="https://company.figma.com" 
                    />
                  </label>
                </div>

                {/* Right Column: Permissions */}
                <div className="bg-[#1c1d27]/50 rounded-xl border border-[#3b3f54] p-5 h-full">
                  <h4 className="text-white text-sm font-medium mb-4">Sync Capabilities</h4>
                  <div className="space-y-3">
                    
                    <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#252736] transition-colors cursor-pointer group">
                      <div className="relative flex items-center mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={capabilities.readPrds}
                          onChange={() => toggleCapability('readPrds')}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#3b3f54] bg-[#111218] checked:border-primary checked:bg-primary transition-all" 
                        />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 material-symbols-outlined text-[16px] pointer-events-none font-bold">check</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium group-hover:text-primary transition-colors">Read Project Requirements (PRDs)</span>
                        <span className="text-[#9da1b9] text-xs">Allow importing text content from files.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#252736] transition-colors cursor-pointer group">
                      <div className="relative flex items-center mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={capabilities.writeArtifacts}
                          onChange={() => toggleCapability('writeArtifacts')}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#3b3f54] bg-[#111218] checked:border-primary checked:bg-primary transition-all" 
                        />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 material-symbols-outlined text-[16px] pointer-events-none font-bold">check</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium group-hover:text-primary transition-colors">Write/Update Artifacts</span>
                        <span className="text-[#9da1b9] text-xs">Enable bi-directional sync for comments.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#252736] transition-colors cursor-pointer group">
                      <div className="relative flex items-center mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={capabilities.syncDiagrams}
                          onChange={() => toggleCapability('syncDiagrams')}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#3b3f54] bg-[#111218] checked:border-primary checked:bg-primary transition-all" 
                        />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 material-symbols-outlined text-[16px] pointer-events-none font-bold">check</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium group-hover:text-primary transition-colors">Sync Visual Diagrams</span>
                        <span className="text-[#9da1b9] text-xs">Access vector data for diagram generation.</span>
                      </div>
                    </label>

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-[#3b3f54] bg-[#1c1d27]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Status/Test */}
            <button className="group flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#9da1b9] hover:text-white hover:bg-[#3b3f54]/50 transition-all w-full sm:w-auto justify-center sm:justify-start">
              <span className="material-symbols-outlined text-[20px] group-hover:animate-spin">sync</span>
              Test Connection
            </button>
            
            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-[#3b3f54] transition-colors cursor-pointer">
                Cancel
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 cursor-pointer">
                <span>Save & Connect</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
