import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createBlob, decodeAudioData, base64ToUint8Array } from "../utils/audio";
import { LogEntry, AgentStatus } from "../types";

interface LiveClientCallbacks {
  onStatusChange: (status: AgentStatus) => void;
  onLog: (entry: LogEntry) => void;
  onAudioData: (amplitude: number, source: 'user' | 'agent') => void;
  onError: (error: Error) => void;
}

export class LiveClient {
  private ai: GoogleGenAI;
  private session: any = null; // Session type is internal to SDK
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private callbacks: LiveClientCallbacks;
  
  // Flag to prevent double processing
  private isProcessing = false;

  constructor(callbacks: LiveClientCallbacks) {
    this.callbacks = callbacks;
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public async connect(config: { systemInstruction: string, voiceName: string }) {
    try {
      this.callbacks.onStatusChange(AgentStatus.IDLE);
      
      // Initialize Audio Contexts
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Get User Media
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect to Gemini Live
      const sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
            this.callbacks.onStatusChange(AgentStatus.LISTENING);
            this.startAudioInput(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            this.handleMessage(message);
          },
          onclose: (e) => {
            console.log("Gemini Live Session Closed", e);
            this.callbacks.onStatusChange(AgentStatus.DISCONNECTED);
          },
          onerror: (e) => {
            console.error("Gemini Live Error", e);
            this.callbacks.onError(new Error("Connection error"));
            this.callbacks.onStatusChange(AgentStatus.DISCONNECTED);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: config.systemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName || 'Kore' } }
          },
          // Enable transcription so we can show logs
          inputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" },
          outputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" }
        }
      });
      
      this.session = sessionPromise;

    } catch (err) {
      console.error(err);
      this.callbacks.onError(err instanceof Error ? err : new Error("Failed to connect"));
    }
  }

  private startAudioInput(sessionPromise: Promise<any>) {
    if (!this.inputAudioContext || !this.stream) return;

    this.sourceNode = this.inputAudioContext.createMediaStreamSource(this.stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate amplitude for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
      const rms = Math.sqrt(sum / inputData.length);
      this.callbacks.onAudioData(rms, 'user');

      const pcmBlob = createBlob(inputData);
      
      sessionPromise.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.sourceNode.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle Transcriptions for Logs
    if (message.serverContent?.inputTranscription?.text) {
      this.callbacks.onLog({
        role: 'user',
        text: message.serverContent.inputTranscription.text,
        timestamp: new Date()
      });
    }
    
    if (message.serverContent?.outputTranscription?.text) {
      this.callbacks.onLog({
        role: 'model',
        text: message.serverContent.outputTranscription.text,
        timestamp: new Date()
      });
    }

    // Handle Audio Output
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext) {
      this.callbacks.onStatusChange(AgentStatus.SPEAKING);
      
      // Ensure we track time correctly for gapless playback
      this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);

      const audioBytes = base64ToUint8Array(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, this.outputAudioContext);
      
      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);
      
      source.addEventListener('ended', () => {
        this.sources.delete(source);
        if (this.sources.size === 0) {
           this.callbacks.onStatusChange(AgentStatus.LISTENING);
        }
      });

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
      
      // Visualizer simulation for agent (since we don't easily get raw PCM from the output node unless we use an analyzer node)
      // We'll just trigger the callback with a mock value for now or you'd need an AnalyserNode
      this.callbacks.onAudioData(0.5, 'agent'); 
    }

    // Handle Interruption
    if (message.serverContent?.interrupted) {
      console.log("Interrupted!");
      this.sources.forEach(src => src.stop());
      this.sources.clear();
      this.nextStartTime = 0;
      this.callbacks.onStatusChange(AgentStatus.LISTENING);
    }
  }

  public async disconnect() {
    if (this.session) {
        const s = await this.session;
        // s.close() might not exist on the type depending on version, usually sending 'end' or closing websocket happens at network level
        // SDK doesn't expose explicit close method on session easily, but we clean up local resources
    }
    
    if (this.sourceNode) this.sourceNode.disconnect();
    if (this.processor) this.processor.disconnect();
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.inputAudioContext) this.inputAudioContext.close();
    if (this.outputAudioContext) this.outputAudioContext.close();
    
    this.callbacks.onStatusChange(AgentStatus.DISCONNECTED);
  }
}