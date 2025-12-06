import { AgentConfig } from "./types";

export const DEFAULT_CONFIG: AgentConfig = {
  name: "NeuraVoice",
  tone: "Professional, Empathetic, Efficient",
  context: "You are NeuraVoice, an advanced AI receptionist for a high-end dental clinic called 'BrightSmile'.",
  systemInstruction: `You are NeuraVoice, the AI phone agent for BrightSmile Dental.
Your goal is to handle inbound calls efficiently.
- Answer the phone with "Thank you for calling BrightSmile, this is NeuraVoice. How can I help you today?"
- You can book appointments (ask for preferred date/time).
- You can answer FAQs about hours (Mon-Fri 9am-5pm) and location (123 Main St).
- If the user has a medical emergency, advise them to hang up and dial 911.
- Be concise. Do not speak in long paragraphs. Use natural, conversational language.
- If you need to collect info, ask for Name and Phone Number one by one.
`
};

export const MOCK_CALLS = [
  { id: '101', caller: '+1 (555) 012-3456', duration: '2m 14s', status: 'Completed', sentiment: 'Positive', timestamp: '10 mins ago' },
  { id: '102', caller: '+1 (555) 098-7654', duration: '0m 45s', status: 'Missed', sentiment: 'Neutral', timestamp: '32 mins ago' },
  { id: '103', caller: '+1 (555) 111-2222', duration: '5m 12s', status: 'Completed', sentiment: 'Negative', timestamp: '1 hour ago' },
  { id: '104', caller: '+1 (555) 333-4444', duration: '1m 30s', status: 'Completed', sentiment: 'Positive', timestamp: '2 hours ago' },
];

// Backend implementation code for documentation
export const TWILIO_SERVER_CODE = `// server.js
import Fastify from 'fastify';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { FastifyRequest, FastifyReply } from 'fastify';

dotenv.config();

const fastify = Fastify();
const PORT = process.env.PORT || 3000;

// Root route for Twilio Webhook
fastify.all('/incoming-call', async (request: FastifyRequest, reply: FastifyReply) => {
  const twiml = \`
    <Response>
      <Connect>
        <Stream url="wss://\${request.headers.host}/media-stream" />
      </Connect>
    </Response>
  \`;
  reply.type('text/xml').send(twiml);
});

// WebSocket Server for Media Stream
const wss = new WebSocket.Server({ server: fastify.server });

wss.on('connection', (ws) => {
  console.log('New Client Connected');
  
  // Here you would initialize connection to LLM (e.g. Gemini) or Speech Service (ElevenLabs)
  
  ws.on('message', (message) => {
    const msg = JSON.parse(message.toString());
    switch (msg.event) {
      case 'connected':
        console.log('Twilio Media Stream Connected');
        break;
      case 'start':
        console.log('Media Stream Started', msg.start.streamSid);
        break;
      case 'media':
        // Payload is base64 encoded u-law (PCMU) audio
        const audioPayload = msg.media.payload;
        // TODO: Forward to STT or LLM
        break;
      case 'stop':
        console.log('Call Has Ended');
        break;
    }
  });
});

fastify.listen({ port: Number(PORT) }, (err) => {
  if (err) console.error(err);
  console.log(\`Server listening on port \${PORT}\`);
});
`;

export const ELEVENLABS_INTEGRATION_CODE = `// integration.js
import WebSocket from 'ws';

// Connect to ElevenLabs Websocket API
const elevenLabsWs = new WebSocket(\`wss://api.elevenlabs.io/v1/text-to-speech/\${VOICE_ID}/stream-input?model_id=eleven_turbo_v2\`);

elevenLabsWs.on('open', () => {
  // Send initial config
  const bosMessage = {
    text: " ",
    voice_settings: { stability: 0.5, similarity_boost: 0.8 },
    xi_api_key: process.env.XI_API_KEY,
  };
  elevenLabsWs.send(JSON.stringify(bosMessage));
});

elevenLabsWs.on('message', (data) => {
  const response = JSON.parse(data);
  if (response.audio) {
    // Received audio chunk from ElevenLabs
    // Convert to Twilio compatible format (mulaw) and send back to Twilio WS
    const audioData = response.audio; // Base64
    twilioWs.send(JSON.stringify({
      event: 'media',
      streamSid: streamSid,
      media: { payload: audioData }
    }));
  }
});

// Function to send text to ElevenLabs
function speak(text) {
  elevenLabsWs.send(JSON.stringify({
    text: text,
    try_trigger_generation: true,
  }));
}
`;