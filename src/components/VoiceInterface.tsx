import React, { useState, useEffect, useRef } from 'react';
import { GeminiLiveService } from '@/lib/gemini-live';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceInterfaceProps {
  apiKey: string;
  onTrade: (symbol: string, side: 'BUY' | 'SELL', amount: number) => Promise<any>;
  getAccountInfo: () => any;
  onToggleAutoTrading: (enabled: boolean) => any;
  onAdjustBalance: (amount: number) => any;
  onForexTrade: (symbol: string, side: 'BUY' | 'SELL', amount: number, tp?: number, sl?: number) => Promise<any>;
  onBinaryTrade: (symbol: string, side: 'CALL' | 'PUT', amount: number, duration?: number) => Promise<any>;
  getMarketData: (symbol: string) => any;
}

export function VoiceInterface({ 
  apiKey, 
  onTrade, 
  getAccountInfo, 
  onToggleAutoTrading, 
  onAdjustBalance,
  onForexTrade,
  onBinaryTrade,
  getMarketData
}: VoiceInterfaceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [transcript, setTranscript] = useState<string[]>([]);
  const serviceRef = useRef<GeminiLiveService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const toggleConnection = async () => {
    if (isConnected) {
      serviceRef.current?.stop();
      setIsConnected(false);
      setStatus('Idle');
    } else {
      try {
        setStatus('Connecting...');
        serviceRef.current = new GeminiLiveService(
          apiKey,
          (text) => setTranscript(prev => [...prev, text]),
          (s) => {
            setStatus(s);
            if (s === 'Connected') setIsConnected(true);
            if (s === 'Disconnected') setIsConnected(false);
          },
          async (call) => {
            if (call.name === 'executeTrade') {
              return await onTrade(call.args.symbol, call.args.side, call.args.amount);
            }
            if (call.name === 'getAccountInfo') {
              return getAccountInfo();
            }
            if (call.name === 'toggleAutoTrading') {
              return onToggleAutoTrading(call.args.enabled);
            }
            if (call.name === 'adjustBalance') {
              return onAdjustBalance(call.args.amount);
            }
            if (call.name === 'executeForexTrade') {
              return await onForexTrade(call.args.symbol, call.args.side, call.args.amount, call.args.tp, call.args.sl);
            }
            if (call.name === 'executeBinaryTrade') {
              return await onBinaryTrade(call.args.symbol, call.args.side, call.args.amount, call.args.durationSeconds);
            }
            if (call.name === 'getMarketData') {
              return getMarketData(call.args.symbol);
            }
            return { error: 'Tool not found' };
          }
        );
        await serviceRef.current.connect();
      } catch (err) {
        console.error(err);
        setStatus('Error');
      }
    }
  };

  return (
    <Card className="bg-sleek-card border-white/5 h-full flex flex-col rounded-[24px] overflow-hidden backdrop-blur-md">
      <CardContent className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Orbit Visualization */}
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-sleek-blue/20 border-dashed"
          />
          <div className="w-40 h-40 rounded-full bg-radial-[circle] from-sleek-blue/20 to-transparent flex items-center justify-center">
            <motion.div 
              animate={isConnected ? { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-radial-[circle_at_30%_30%] from-white via-sleek-blue to-sleek-purple shadow-[0_0_50px_rgba(129,140,248,0.5)]"
            />
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold mb-2">
            {isConnected ? 'Listening...' : 'Gemini AI'}
          </h1>
          <p className="text-sm text-sleek-text-secondary max-w-[240px] leading-relaxed">
            {isConnected 
              ? '"Show me the Bitcoin candlestick chart for the last 24 hours."'
              : 'Connect to start a voice-powered market analysis session.'}
          </p>
        </div>

        {/* Waveform */}
        <div className="flex items-center gap-1 h-10 mb-8">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={isConnected ? { height: [4, Math.random() * 30 + 10, 4] } : { height: 4 }}
              transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
              className="w-[3px] bg-sleek-blue rounded-full opacity-80"
            />
          ))}
        </div>

        {/* Transcript Area */}
        <div 
          ref={scrollRef}
          className="w-full max-h-32 overflow-y-auto space-y-2 mb-8 scrollbar-hide"
        >
          <AnimatePresence>
            {transcript.slice(-3).map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-xs text-sleek-text-secondary italic"
              >
                "{text}"
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mic Button */}
        <Button
          onClick={toggleConnection}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
            isConnected 
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
              : 'bg-sleek-blue hover:bg-sleek-blue/90 shadow-sleek-blue/30'
          }`}
        >
          {isConnected ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-slate-950" />}
        </Button>
      </CardContent>
    </Card>
  );
}
