import React, { useEffect, useState, useRef } from 'react';
import { Mic, Phone, PhoneOff, BarChart2, ShieldAlert } from 'lucide-react';
import { LiveClient } from '../services/liveClient';
import { AgentConfig, LogEntry, AgentStatus } from '../types';

interface SimulationProps {
  config: AgentConfig;
}

const Simulation: React.FC<SimulationProps> = ({ config }) => {
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userVolume, setUserVolume] = useState(0);
  const [agentVolume, setAgentVolume] = useState(0);
  
  const clientRef = useRef<LiveClient | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of logs
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleStartCall = async () => {
    if (!process.env.API_KEY) {
      setError("API Key missing. Please check your environment configuration.");
      return;
    }
    
    setError(null);
    setLogs([]);
    
    const client = new LiveClient({
      onStatusChange: setStatus,
      onLog: (entry) => setLogs(prev => [...prev, entry]),
      onAudioData: (vol, source) => {
        if (source === 'user') setUserVolume(vol);
        else setAgentVolume(vol);
      },
      onError: (err) => setError(err.message)
    });

    clientRef.current = client;
    await client.connect({
        systemInstruction: config.systemInstruction,
        voiceName: 'Kore' // Hardcoded for demo, could be configurable
    });
  };

  const handleEndCall = async () => {
    if (clientRef.current) {
      await clientRef.current.disconnect();
      clientRef.current = null;
    }
    setStatus(AgentStatus.DISCONNECTED);
  };

  const isActive = status === AgentStatus.LISTENING || status === AgentStatus.SPEAKING || status === AgentStatus.PROCESSING;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Phone Interface */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl">
        {/* Ambient Background Glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

        <div className="relative z-10 w-full text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 text-xs font-medium mb-8">
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            {isActive ? 'Live Call in Progress' : 'Ready to Call'}
          </div>
          
          <div className="mb-2">
            <h2 className="text-3xl font-bold text-white mb-2">{config.name}</h2>
            <p className="text-slate-400">AI Support Agent</p>
          </div>
        </div>

        {/* Visualizer */}
        <div className="relative z-10 w-full h-48 flex items-center justify-center gap-1">
          {isActive ? (
             <div className="flex items-center justify-center h-full w-full gap-8">
                {/* Agent Visualizer */}
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-100 ${status === AgentStatus.SPEAKING ? 'border-indigo-500 shadow-lg shadow-indigo-500/50 scale-110' : 'border-slate-700'}`}>
                        <div className="w-full flex items-center justify-center gap-1 h-12">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="w-1.5 bg-indigo-400 rounded-full transition-all duration-75" style={{ height: `${status === AgentStatus.SPEAKING ? Math.random() * 40 + 10 : 4}px`}} />
                            ))}
                        </div>
                    </div>
                    <span className="text-xs text-indigo-400 font-medium">NeuraVoice</span>
                </div>

                 {/* User Visualizer */}
                 <div className="flex flex-col items-center gap-2">
                    <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-100 ${status === AgentStatus.LISTENING ? 'border-emerald-500 shadow-lg shadow-emerald-500/50' : 'border-slate-700'}`}>
                        <Mic className={`w-8 h-8 ${status === AgentStatus.LISTENING ? 'text-emerald-400' : 'text-slate-600'}`} />
                    </div>
                    <span className="text-xs text-emerald-400 font-medium">You</span>
                </div>
             </div>
          ) : (
            <div className="text-slate-600 font-light text-6xl opacity-20 select-none">
              00:00
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="relative z-10 w-full flex justify-center pb-8">
          {!isActive ? (
            <button
              onClick={handleStartCall}
              className="group relative flex items-center justify-center w-20 h-20 bg-green-500 hover:bg-green-400 rounded-full text-white shadow-xl shadow-green-900/50 transition-all hover:scale-105 active:scale-95"
            >
              <Phone className="w-8 h-8 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleEndCall}
              className="group relative flex items-center justify-center w-20 h-20 bg-red-500 hover:bg-red-400 rounded-full text-white shadow-xl shadow-red-900/50 transition-all hover:scale-105 active:scale-95"
            >
              <PhoneOff className="w-8 h-8 fill-current" />
            </button>
          )}
        </div>

        {error && (
            <div className="absolute bottom-4 left-0 right-0 mx-auto w-max max-w-[90%] bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <ShieldAlert className="w-4 h-4" />
                {error}
            </div>
        )}
      </div>

      {/* Live Transcript */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h3 className="text-white font-medium flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-slate-400" />
                Live Transcript
            </h3>
            <span className="text-xs text-slate-500 font-mono">EN-US • 16kHz</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                    <p>No active conversation.</p>
                    <p className="text-sm">Press the green phone button to start the simulator.</p>
                </div>
            )}
            
            {logs.map((log, i) => (
                <div key={i} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        log.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-800 text-slate-200 rounded-bl-none'
                    }`}>
                        <p>{log.text}</p>
                        <span className="text-[10px] opacity-50 mt-1 block">
                            {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                </div>
            ))}
            <div ref={logsEndRef} />
        </div>
        
        {isActive && status === AgentStatus.LISTENING && (
            <div className="p-2 bg-slate-800/50 text-center text-xs text-slate-400 animate-pulse">
                Listening...
            </div>
        )}
      </div>
    </div>
  );
};

export default Simulation;