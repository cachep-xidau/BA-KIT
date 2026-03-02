import React from 'react';
import { 
  LayoutGrid, 
  LayoutDashboard, 
  Sparkles, 
  FolderOpen, 
  Network, 
  Settings, 
  Bell, 
  Link as LinkIcon, 
  MoreHorizontal, 
  RefreshCw, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function App() {
  return (
    <div className="flex h-screen w-full overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/5 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <LayoutGrid className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">BSA Kit</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5" href="#">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5" href="#">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Generate</span>
          </a>
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5" href="#">
            <FolderOpen className="w-5 h-5" />
            <span className="font-medium">Artifacts</span>
          </a>
          <a className="nav-link active flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white" href="#">
            <Network className="w-5 h-5" />
            <span className="font-medium">Connections</span>
          </a>
          <a className="nav-link flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5" href="#">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">JD</div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white">John Doe</span>
              <span className="text-[10px] text-gray-400">BSA Lead</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-white/5 glass-panel flex items-center justify-between px-8 z-10">
          <div className="flex flex-col justify-center">
            <h2 className="text-lg font-semibold text-white">MCP Connections</h2>
            <p className="text-xs text-slate-400">Manage integrations with external MCP servers</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="glass-button p-2 rounded-lg text-slate-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
              <LinkIcon className="w-4 h-4" />
              Connect New Service
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Design & Documentation Section */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Design & Documentation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {/* Figma Card */}
                <div className="connection-card glass-panel rounded-xl p-5 flex flex-col h-full relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="text-slate-500 hover:text-white cursor-pointer w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#2D313A] flex items-center justify-center border border-white/10">
                      <img alt="Figma" className="w-6 h-6 opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1dVm6o7FxWfA2pvwN0p27P1w91B3oyVcLCBEKu3cJ4XTbGaxRFftmBRW8L1vX9IZjmPV7PdvbkNtYCvxN0s35o1_AirBlyxJHg1jgM6vapHgYHeoBEctrQWxbIXS4DrPq3ZSC-QpJVleiiJjCNmmtw6O26X7N4YpyIdSH0yPcJZ-iCSkVoS4gy9AAnMN6bjK5gwNdajn0W64PsMtsTee91wKaj6kR43J1RiODRCnNoB9ZByHf6pVu9JAasUTDJk2L9Fy2N3l-HByh"/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base">Figma</h4>
                      <p className="text-xs text-slate-400">Design Context</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="status-badge status-connected">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                        Connected
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Last synced: 2 mins ago</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                    <button className="flex-1 glass-button py-2 rounded-lg text-xs font-medium text-white hover:bg-white/10">Manage</button>
                    <button className="glass-button p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10" title="Sync Now">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Confluence Card */}
                <div className="connection-card glass-panel rounded-xl p-5 flex flex-col h-full relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="text-slate-500 hover:text-white cursor-pointer w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0052CC]/20 flex items-center justify-center border border-[#0052CC]/30">
                      <img alt="Confluence" className="w-6 h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW8k-ML6X1MURwExziutKH91DA2HOSJ60d-rYm1IVv1tgT_MCK6M0HVwOs6sDMswi2neOICUn-AqsIZ79CKdu0ZNkGOEP97GO6DOeRSABGYwAqUCm-GqLjpQ3YCMeGm3j4m8-FGgFcth98_8_fo6DXj82KDIdtvnMWqoFkcEmX7g8kt5eY5dUCPAfMVJ1BM3j97tusu0btnllfnn_WZ-BH_ppBpnSYeehiMfH7X3sVWznGx9IWpjH2MrNqn3EWkc1huYRlkvoec1ro"/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base">Confluence</h4>
                      <p className="text-xs text-slate-400">Architecture Docs</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="status-badge status-connected">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></span>
                        Connected
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Last synced: 45 mins ago</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                    <button className="flex-1 glass-button py-2 rounded-lg text-xs font-medium text-white hover:bg-white/10">Manage</button>
                    <button className="glass-button p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10" title="Sync Now">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notion Card */}
                <div className="connection-card glass-panel rounded-xl p-5 flex flex-col h-full relative overflow-hidden opacity-90">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center border border-white/10 grayscale">
                      <img alt="Notion" className="w-6 h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJf-mOJDSOWB6uCRRyeC6Bh8BbyuBd4P5jERql0RJpLTxrTMyt_RIHYx3EcsDmaJfciVZfJXGmN9IHq_fNL_QVb7LXQtI0w0fwYyn84Gm2eTjLty7aCfoCJV6x-AERu5eOmxT6b8j3SQSwP9FcPXAh4DoFk7VBRtGgGk9aRe0Kg4yD_NU9tlMoKbi6Byx3TukqfCr9EEHICng_LSedYP-9gPk6QYfoixEs3O2yhu3cnbAgXys7_1OMsTJKXAdQZeCYyYpVKovJH6X2"/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-base">Notion</h4>
                      <p className="text-xs text-slate-500">Knowledge Base</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="status-badge status-disconnected">
                        Disconnected
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Last synced: 3 days ago</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <button className="w-full glass-button py-2 rounded-lg text-xs font-medium text-white hover:bg-white/10 border-dashed border-slate-600">Reconnect</button>
                  </div>
                </div>

                {/* Add New Source Card */}
                <div className="connection-card glass-panel rounded-xl p-5 flex flex-col items-center justify-center h-full border-dashed border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer min-h-[220px]">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Plus className="text-slate-400 w-6 h-6" />
                  </div>
                  <h4 className="font-medium text-slate-300">Add New Source</h4>
                  <p className="text-xs text-slate-500 mt-1 text-center px-4">Connect Google Docs, Miro, or other documentation tools.</p>
                </div>

              </div>
            </div>

            {/* Development & Issues Section */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Development & Issues</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {/* GitHub Card */}
                <div className="connection-card glass-panel rounded-xl p-5 flex flex-col h-full relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="text-slate-500 hover:text-white cursor-pointer w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center border border-white/10">
                      <img alt="GitHub" className="w-6 h-6 invert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD4auj-mz6H3EEoIQDVHUrmHfgvlsT1PEEXD5Gs6xWXkAWx9pvUjBLYtBiYCxH1jyydSdxQymC56qxDhvzboew-8hBkbcE1o9Qlq96vEVgU8wlGKOmH7QDELpIxpBQhQlvg2IbWFGDibJKJE2AGfZA1_Ee6BCeGWV71bPVY8A7txHDOckZ9K5O6S4vpN9Q6I7WgqiVTPoM8PR3fKDExv0QYHVbiw6t63D4QygnzOOhGj3jVzuLG25gR24yHpGyZbRM0QdwcuUDhCGF"/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base">GitHub</h4>
                      <p className="text-xs text-slate-400">Source Code</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="status-badge status-connected">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></span>
                        Connected
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Last synced: 1 hour ago</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                    <button className="flex-1 glass-button py-2 rounded-lg text-xs font-medium text-white hover:bg-white/10">Manage</button>
                    <button className="glass-button p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Jira Card */}
                <div className="connection-card glass-panel rounded-xl p-5 flex flex-col h-full relative overflow-hidden border-red-500/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0052CC]/20 flex items-center justify-center border border-[#0052CC]/30">
                      <img alt="Jira" className="w-6 h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcr9yMKSvf5NkhyEtXiCLB-3a3j6AHLJk3kBd41IuZN6oVvIP_nVbvOpUbIR8LQJ9dFlJ2MFVH4p15vlxLXrryPSrEgyikwshw6hiP_qnO-cAgZTtauzH02XevrS1ibfju_Sst5-X582SnsMtV0Bod31ZlMzowN6zzfC4hjJuYM6t4BUCrA7Nt4bNWFhLkqGNYkGxtE7s6KJ3vdg5QO_so5NgXGc2aNjrmRyegkLi5Usd4cj0q27ud8bAa9Af_j4ViBSDGdRwXB0rh"/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base">Jira</h4>
                      <p className="text-xs text-slate-400">Issue Tracking</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="status-badge status-error">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Auth Error
                      </span>
                    </div>
                    <p className="text-xs text-red-400/80">Token expired. Please re-authenticate.</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                    <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-lg text-xs font-medium transition-colors">Fix Connection</button>
                  </div>
                </div>

                {/* Linear Card */}
                <div className="connection-card glass-panel rounded-xl p-5 flex flex-col h-full relative overflow-hidden opacity-90">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#5E6AD2]/20 flex items-center justify-center border border-[#5E6AD2]/30 grayscale">
                      <div className="w-6 h-6 rounded-full border-2 border-slate-400 flex items-center justify-center">
                        <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-base">Linear</h4>
                      <p className="text-xs text-slate-500">Issue Tracking</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="status-badge status-disconnected">
                        Not Configured
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Never synced</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <button className="w-full glass-button py-2 rounded-lg text-xs font-medium text-white hover:bg-white/10 border-dashed border-slate-600">Connect</button>
                  </div>
                </div>

              </div>
            </div>

            {/* Recent MCP Activities Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Recent MCP Activities</h3>
                <a className="text-xs text-indigo-400 hover:text-indigo-300" href="#">View All Logs</a>
              </div>
              <div className="glass-panel rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5 text-xs text-slate-400 uppercase">
                      <th className="p-4 font-medium">Source</th>
                      <th className="p-4 font-medium">Action</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[#2D313A] flex items-center justify-center border border-white/10">
                          <img alt="Figma" className="w-3 h-3 opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDltRDr2XdCcEayynarO_aN0jB5XcCJNa2hTw7G9FN0TCS00_BtJMX4bJZDLh33UPlkytACQOcQMPXWENqzSRhRBwlEYlzgHhBx41tkCqFvNfsLBwoHON7p7W8Xa89Sf4bqDSFqDEYl7avDFA7Z39rBkw1Io9-yrO6I6A4zuHRUThjFKT0TkH3EH0sQ8Czz3B7Ujawn9uh0Ag5VrvgIGyXh-GJ_IMPUdojgBe2eZqeksdrcAYA73PqCt2t9X3-PnrII9Z7imL4FWPs9"/>
                        </div>
                        <span className="text-slate-200">Figma</span>
                      </td>
                      <td className="p-4 text-slate-300">Fetched 12 frames from "Checkout Flow v2"</td>
                      <td className="p-4">
                        <span className="inline-flex items-center text-xs text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Success
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-500 text-xs">2 min ago</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-black/40 flex items-center justify-center border border-white/10">
                          <img alt="GitHub" className="w-3 h-3 invert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZMsXtvAUXkmxyr8WKveTTinp0yd6PsHmKgBI1ammTpJdBpV-Vau8fSsYegIfP5cRTpX7N_YSDn0CBQ2593W-u1WT2xGYMBU_Lk5iWhuxDXfuJ3nPZly-eHg8Ftqq4T-JofL0QltC97jzHr5ndHujhvb9huKVoXmciCAE1nkEdjzFRdLXimTsj_zfLlIBZ5PxuzmzIzNvyXtnjVDe_219nJll-hCkwYmwh7YK4wQpDS8784Np5uT6QgoFthkWN_ZiCrX2NANfVIAuq"/>
                        </div>
                        <span className="text-slate-200">GitHub</span>
                      </td>
                      <td className="p-4 text-slate-300">Synced repo "payment-service"</td>
                      <td className="p-4">
                        <span className="inline-flex items-center text-xs text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Success
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-500 text-xs">1 hr ago</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[#0052CC]/20 flex items-center justify-center border border-[#0052CC]/30">
                          <img alt="Jira" className="w-3 h-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx80MG430nwDBltdkLGHgE7II3v3RvIJRq4NA87rgfD-I9Rk4Bp17Sya09n-SBPGg9zGs3B6Dt15AHm5GXQ7-5DFMiEHzpozt-yKxJu_hTNpX2hCAxiQIbzk_VQ_P_xz_yw8tjah5aciDCFNBj6DOwGW-MUPsm0BYTGXuWz44F6Wb7CR-NhHgrJTrBw0hPSsbgjwDMIAL63DjCVWud0YluHYo1zLSCBFt6Rw4EJnc8DoeT4DtXgCLz_zhx4B3MTSksKwRpStqstmyS"/>
                        </div>
                        <span className="text-slate-200">Jira</span>
                      </td>
                      <td className="p-4 text-slate-300">Failed to fetch backlog items</td>
                      <td className="p-4">
                        <span className="inline-flex items-center text-xs text-red-400">
                          <AlertCircle className="w-4 h-4 mr-1" /> 401 Unauthorized
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-500 text-xs">3 hr ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
