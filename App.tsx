import React, { useState } from 'react';
import { LayoutDashboard, PhoneCall, FileText, Settings, Radio } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Simulation from './components/Simulation';
import Config from './components/Config';
import Docs from './components/Docs';
import { DEFAULT_CONFIG } from './constants';
import { AgentConfig } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulation' | 'config' | 'docs'>('simulation');
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'simulation':
        return <Simulation config={config} />;
      case 'config':
        return <Config config={config} onChange={setConfig} onReset={() => setConfig(DEFAULT_CONFIG)} />;
      case 'docs':
        return <Docs />;
      default:
        return <Simulation config={config} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              NeuraVoice
            </h1>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'simulation', label: 'Live Simulator', icon: PhoneCall },
              { id: 'config', label: 'Agent Config', icon: Settings },
              { id: 'docs', label: 'Deployment', icon: FileText },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-xs font-bold text-white">JD</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
              <Radio className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white">NeuraVoice</span>
          </div>
          <div className="flex gap-2">
             {[
              { id: 'dashboard', icon: LayoutDashboard },
              { id: 'simulation', icon: PhoneCall },
              { id: 'config', icon: Settings },
            ].map((item) => (
                 <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`p-2 rounded-lg ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                 >
                    <item.icon className="w-5 h-5" />
                 </button>
            ))}
          </div>
        </div>

        {/* Header (Desktop) */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8 hidden md:flex">
          <h2 className="text-lg font-medium text-white capitalize">
            {activeTab === 'simulation' ? 'Browser Simulator' : activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Operational
            </span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-4 md:p-8 relative">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;