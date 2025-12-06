export interface LogEntry {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
}

export interface CallStat {
  id: string;
  caller: string;
  duration: string;
  status: 'Completed' | 'Missed' | 'Active';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  timestamp: string;
  summary?: string;
}

export enum AgentStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
  PROCESSING = 'PROCESSING',
  DISCONNECTED = 'DISCONNECTED'
}

export interface AgentConfig {
  name: string;
  tone: string;
  context: string;
  systemInstruction: string;
}