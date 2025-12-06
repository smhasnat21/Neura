import React from 'react';
import { AgentConfig } from '../types';
import { Settings, Save, RefreshCw } from 'lucide-react';

interface ConfigProps {
  config: AgentConfig;
  onChange: (newConfig: AgentConfig) => void;
  onReset: () => void;
}

const Config: React.FC<ConfigProps> = ({ config, onChange, onReset }) => {
  const handleChange = (field: keyof AgentConfig, value: string) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Agent Configuration
        </h2>
        <button 
          onClick={onReset}
          className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          title="Reset to Defaults"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Agent Name</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Tone & Personality</label>
          <input
            type="text"
            value={config.tone}
            onChange={(e) => handleChange('tone', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">System Instruction (Prompt)</label>
          <p className="text-xs text-slate-500 mb-2">
            This defines how the agent behaves, what information it knows, and how it handles calls.
          </p>
          <textarea
            value={config.systemInstruction}
            onChange={(e) => handleChange('systemInstruction', e.target.value)}
            className="w-full h-64 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm leading-relaxed resize-none"
          />
        </div>

        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          Save Configuration
        </button>
      </div>
    </div>
  );
};

export default Config;