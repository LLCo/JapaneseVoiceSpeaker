import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Controls } from './components/Controls';
import Visualizer from './components/Visualizer';
import { VoiceName } from './types';
import { generateJapaneseSpeech } from './services/geminiService';
import { decodeBase64, decodeAudioData, audioBufferToWav } from './services/audioUtils';

// Preset example text
const DEFAULT_TEXT = "こんにちは。今日はいい天気ですね。Geminiを使って、日本語を話すことができます。";

const App: React.FC = () => {
  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [voice, setVoice] = useState<VoiceName>(VoiceName.Kore);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we have a generated audio buffer ready to replay
  const [hasAudio, setHasAudio] = useState<boolean>(false);

  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Cache the last generated buffer for instant replay
  const lastAudioBufferRef = useRef<AudioBuffer | null>(null);

  // Cleanup audio resources
  const stopAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Initialize Audio Context on user interaction if needed
  const ensureAudioContext = async () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playBuffer = async (buffer: AudioBuffer) => {
    const ctx = await ensureAudioContext();

    // Set up Analyzer for Visualization if not exists
    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 2048;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    source.connect(analyserRef.current);
    analyserRef.current.connect(ctx.destination);
    
    source.onended = () => {
      setIsPlaying(false);
    };

    sourceNodeRef.current = source;
    source.start();
    setIsPlaying(true);
  };

  const handleGenerateAndPlay = async () => {
    setError(null);
    setIsLoading(true);
    setHasAudio(false); 
    stopAudio();

    try {
      const ctx = await ensureAudioContext();
      
      // 1. Fetch Audio Data from Gemini
      const base64Data = await generateJapaneseSpeech(text, voice);
      
      // 2. Decode Base64
      const rawBytes = decodeBase64(base64Data);
      
      // 3. Decode PCM to AudioBuffer
      const audioBuffer = await decodeAudioData(rawBytes, ctx, 24000, 1);

      // Cache it
      lastAudioBufferRef.current = audioBuffer;
      setHasAudio(true);

      // 4. Play
      await playBuffer(audioBuffer);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setHasAudio(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplay = async () => {
    if (!lastAudioBufferRef.current) return;
    stopAudio();
    try {
      await playBuffer(lastAudioBufferRef.current);
    } catch (err: any) {
      console.error(err);
      setError("Failed to replay audio.");
    }
  };

  const handleDownload = () => {
    if (!lastAudioBufferRef.current) return;
    
    try {
      // Convert AudioBuffer to WAV Blob
      const wavBlob = audioBufferToWav(lastAudioBufferRef.current);
      
      // Create download link
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.download = `nihongo-voice-${timestamp}.wav`;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (err: any) {
      console.error(err);
      setError("Failed to download audio.");
    }
  };

  // Reset audio cache when text or voice changes (forces user to regenerate for new content)
  useEffect(() => {
    setHasAudio(false);
    lastAudioBufferRef.current = null;
  }, [text, voice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 md:p-8 font-sans">
        
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl translate-y-1/2"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col gap-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300 tracking-tight">
            Nihongo Voice
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            AI-Powered Japanese Text-to-Speech Engine
          </p>
        </div>

        {/* Main Interface */}
        <div className="bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
          
          <Controls 
            text={text}
            voice={voice}
            isLoading={isLoading}
            isPlaying={isPlaying}
            hasAudio={hasAudio}
            onTextChange={setText}
            onVoiceChange={setVoice}
            onGenerate={handleGenerateAndPlay}
            onReplay={handleReplay}
            onDownload={handleDownload}
            onStop={stopAudio}
          />

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
               <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <span>{error}</span>
            </div>
          )}

          {/* Visualization Area */}
          <div className="w-full">
            <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Audio Output</span>
                {isPlaying && <span className="text-xs text-indigo-400 animate-pulse">Playing Now</span>}
            </div>
            <Visualizer analyser={analyserRef.current} isPlaying={isPlaying} />
          </div>

        </div>

        {/* Footer */}
        <footer className="text-center text-zinc-600 text-xs">
          <p>Powered by Gemini 2.5 Flash TTS</p>
        </footer>

      </div>
    </div>
  );
};

export default App;