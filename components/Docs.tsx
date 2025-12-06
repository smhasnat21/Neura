import React from 'react';
import { Copy, Server, Cloud, Code } from 'lucide-react';
import { TWILIO_SERVER_CODE, ELEVENLABS_INTEGRATION_CODE } from '../constants';

const CodeBlock: React.FC<{ title: string; code: string; language: string }> = ({ title, code, language }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden mb-6">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Code className="w-4 h-4 text-indigo-400" />
          {title}
        </span>
        <button 
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <Copy className="w-3 h-3" /> Copy
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm text-slate-300 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const Docs: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto pr-2 space-y-8">
      
      {/* Intro */}
      <div className="prose prose-invert max-w-none">
        <h1 className="text-2xl font-bold text-white mb-4">Production Deployment Architecture</h1>
        <p className="text-slate-400 mb-6">
          While this dashboard simulates the agent using the browser's audio capabilities (via Gemini Live API), 
          a production telephony system requires a WebSocket server to bridge <strong>Twilio Media Streams</strong> with the <strong>LLM</strong> and <strong>ElevenLabs TTS</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-red-500" />
              Twilio
            </h3>
            <p className="text-sm text-slate-400">
              Handles the PSTN (Phone Network) connection. Receives call, upgrades to WebSocket (Media Stream).
            </p>
          </div>
           <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Server className="w-5 h-5 text-green-500" />
              Node.js Server
            </h3>
            <p className="text-sm text-slate-400">
              Orchestrates the stream. Routes audio from Twilio to STT/LLM, and TTS audio back to Twilio.
            </p>
          </div>
           <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              ElevenLabs
            </h3>
            <p className="text-sm text-slate-400">
              Provides ultra-low latency Text-to-Speech via WebSocket for natural human-like voice.
            </p>
          </div>
        </div>
      </div>

      {/* Code Snippets */}
      <CodeBlock 
        title="server.js (Node.js + Fastify + WebSocket)" 
        language="javascript" 
        code={TWILIO_SERVER_CODE} 
      />

      <CodeBlock 
        title="ElevenLabs Integration Logic" 
        language="javascript" 
        code={ELEVENLABS_INTEGRATION_CODE} 
      />

      {/* Instructions */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Step-by-Step Deployment</h3>
        <ol className="list-decimal list-inside space-y-3 text-slate-400 text-sm">
          <li>Deploy the Node.js server (above) to a host that supports WebSockets (e.g., Render, Railway, AWS EC2).</li>
          <li>Purchase a Phone Number in Twilio.</li>
          <li>Configure the Voice URL for the number to point to your server: <code>https://your-server.com/incoming-call</code>.</li>
          <li>Set environment variables: <code>OPENAI_API_KEY</code> (or Gemini), <code>XI_API_KEY</code> (ElevenLabs), and <code>PORT</code>.</li>
          <li>The <code>/incoming-call</code> endpoint returns TwiML to start a <code>&lt;Stream&gt;</code>.</li>
        </ol>
      </div>

    </div>
  );
};

// Helper icon
function Activity({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}

export default Docs;