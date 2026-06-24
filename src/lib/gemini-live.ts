import { AudioRecorder, AudioPlayer } from './audio-utils';
import { GoogleGenAI, Modality, Type } from "@google/genai";

export class GeminiLiveService {
  private recorder: AudioRecorder | null = null;
  private player: AudioPlayer | null = null;
  private apiKey: string;
  private onText: (text: string) => void;
  private onStatus: (status: string) => void;
  private onToolCall?: (functionCall: any) => Promise<any>;
  private session: any = null;

  constructor(
    apiKey: string, 
    onText: (text: string) => void, 
    onStatus: (status: string) => void,
    onToolCall?: (functionCall: any) => Promise<any>
  ) {
    this.apiKey = apiKey;
    this.onText = onText;
    this.onStatus = onStatus;
    this.onToolCall = onToolCall;
  }

  async connect() {
    try {
      const genAI = new GoogleGenAI({ apiKey: this.apiKey });
      
      this.player = new AudioPlayer();
      this.recorder = new AudioRecorder((base64) => {
        this.sendAudio(base64);
      });

      this.session = await genAI.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
          },
          tools: [
            {
              functionDeclarations: [
                {
                  name: "executeTrade",
                  description: "Execute a crypto trade (buy or sell).",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      symbol: { type: Type.STRING, description: "The crypto symbol (e.g., BTCUSDT)" },
                      side: { type: Type.STRING, enum: ["BUY", "SELL"], description: "The trade side" },
                      amount: { type: Type.NUMBER, description: "The amount to trade" }
                    },
                    required: ["symbol", "side", "amount"]
                  }
                },
                {
                  name: "getAccountInfo",
                  description: "Get current demo account balance and positions.",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: "toggleAutoTrading",
                  description: "Enable or disable auto-trading mode.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      enabled: { type: Type.BOOLEAN, description: "Whether to enable or disable auto-trading" }
                    },
                    required: ["enabled"]
                  }
                },
                {
                  name: "adjustBalance",
                  description: "Add or remove funds from the demo account balance.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      amount: { type: Type.NUMBER, description: "The amount to add (positive) or remove (negative)" }
                    },
                    required: ["amount"]
                  }
                },
                {
                  name: "executeForexTrade",
                  description: "Place a Forex trade with TP and SL.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      symbol: { type: Type.STRING, description: "The Forex pair (e.g., EURUSDT)" },
                      side: { type: Type.STRING, enum: ["BUY", "SELL"], description: "Trade direction" },
                      amount: { type: Type.NUMBER, description: "Amount to trade" },
                      tp: { type: Type.NUMBER, description: "Take Profit price" },
                      sl: { type: Type.NUMBER, description: "Stop Loss price" }
                    },
                    required: ["symbol", "side", "amount"]
                  }
                },
                {
                  name: "executeBinaryTrade",
                  description: "Place a Binary trade (High/Low).",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      symbol: { type: Type.STRING, description: "The asset symbol" },
                      side: { type: Type.STRING, enum: ["CALL", "PUT"], description: "Trade direction (CALL for High, PUT for Low)" },
                      amount: { type: Type.NUMBER, description: "Amount to invest" },
                      durationSeconds: { type: Type.NUMBER, description: "Trade duration in seconds" }
                    },
                    required: ["symbol", "side", "amount"]
                  }
                },
                {
                  name: "getMarketData",
                  description: "Get the latest candlestick data for a symbol to analyze the chart.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      symbol: { type: Type.STRING, description: "The asset symbol (e.g., BTCUSDT)" }
                    },
                    required: ["symbol"]
                  }
                }
              ]
            }
          ],
          systemInstruction: "You are a professional multi-asset trading assistant (Crypto, Forex, Binary). \n\nIMPORTANT FOR SPEED: Be extremely concise. Do not give long introductions. Give direct answers and execute tools immediately. If a user asks for a signal, call getMarketData first to see the latest price action, then give a short CALL/PUT recommendation.\n\n1. For Crypto/Forex: Use executeTrade or executeForexTrade. Forex trades MUST include TP and SL. Show these on the chart.\n2. For Binary: Use executeBinaryTrade. When asked for a 'binary signal', call getMarketData, analyze the last 10-20 candles, and provide a 'CALL' or 'PUT' recommendation with a confidence score.\n3. General: Help users check prices, analyze charts, and manage their demo account. Always confirm manual trades. If auto-trading is on, you can be more proactive."
        },
        callbacks: {
          onopen: () => {
            this.onStatus('Connected');
          },
          onmessage: async (message: any) => {
            await this.handleMessage(message);
          },
          onclose: () => {
            this.onStatus('Disconnected');
            this.stop();
          },
          onerror: (error: any) => {
            console.error('Gemini Live Error:', error);
            this.onStatus('Error');
          },
        },
      });

      await this.recorder.start();
    } catch (err) {
      console.error('Failed to connect to Gemini Live:', err);
      this.onStatus('Error');
      throw err;
    }
  }

  private sendAudio(base64: string) {
    if (!this.session) return;
    this.session.sendRealtimeInput({
      audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
    });
  }

  private async handleMessage(message: any) {
    // Handle tool calls
    const toolCall = message.serverContent?.modelTurn?.parts?.[0]?.toolCall;
    if (toolCall) {
      for (const call of toolCall.functionCalls) {
        if (this.onToolCall) {
          const result = await this.onToolCall(call);
          this.session.sendToolResponse({
            functionResponses: [{
              name: call.name,
              id: call.id,
              response: result
            }]
          });
        }
      }
    }

    // Handle audio output
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      this.player?.play(base64Audio).catch(err => {
        console.error('Audio playback error:', err);
      });
    }

    // Handle text output (transcription)
    const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
    if (text) {
      this.onText(text);
    }

    // Handle interruption
    if (message.serverContent?.interrupted) {
      this.player?.stop();
    }
  }

  stop() {
    this.recorder?.stop();
    this.player?.stop();
    if (this.session) {
      this.session.close();
      this.session = null;
    }
  }
}
