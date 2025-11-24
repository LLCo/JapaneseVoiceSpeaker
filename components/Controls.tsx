import React from 'react';
import { VoiceName } from '../types';

interface ControlsProps {
  text: string;
  voice: VoiceName;
  isLoading: boolean;
  isPlaying: boolean;
  hasAudio: boolean;
  onTextChange: (text: string) => void;
  onVoiceChange: (voice: VoiceName) => void;
  onGenerate: () => void;
  onReplay: () => void;
  onDownload: () => void;
  onStop: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  text,
  voice,
  isLoading,
  isPlaying,
  hasAudio,
  onTextChange,
  onVoiceChange,
  onGenerate,
  onReplay,
  onDownload,
  onStop,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      
      {/* Text Input */}
      <div className="relative group">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="日本語を入力してください... (Enter Japanese text here)"
          className="w-full h-40 bg-zinc-900 text-zinc-100 p-4 rounded-xl border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none outline-none shadow-lg placeholder:text-zinc-600 text-lg leading-relaxed"
          disabled={isLoading || isPlaying}
        />
        <div className="absolute bottom-3 right-3 text-xs text-zinc-500 font-mono">
            {text.length} chars
        </div>
      </div>

      {/* Voice Selection & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-zinc-400 text-sm font-medium">Voice:</span>
            <select
            value={voice}
            onChange={(e) => onVoiceChange(e.target.value as VoiceName)}
            className="bg-zinc-800 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-40 p-2.5 border-none outline-none hover:bg-zinc-700 transition-colors cursor-pointer"
            disabled={isLoading || isPlaying}
            >
            {Object.values(VoiceName).map((v) => (
                <option key={v} value={v}>
                {v}
                </option>
            ))}
            </select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
            {isPlaying ? (
                 <button
                 onClick={onStop}
                 className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-900 font-medium rounded-lg text-sm px-6 py-2.5 transition-all shadow-lg shadow-red-500/20"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                 Stop
               </button>
            ) : (
                <>
                  {/* Action Buttons Group */}
                  {hasAudio && !isLoading && (
                    <>
                      <button
                        onClick={onDownload}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-white bg-zinc-700 hover:bg-zinc-600 focus:ring-4 focus:ring-zinc-800 font-medium rounded-lg text-sm px-3 py-2.5 transition-all shadow-lg"
                        title="Download Audio (WAV)"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>

                      <button
                        onClick={onReplay}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-white bg-emerald-600 hover:bg-emerald-500 focus:ring-4 focus:ring-emerald-900 font-medium rounded-lg text-sm px-4 py-2.5 transition-all shadow-lg shadow-emerald-500/20"
                        title="Play again without generating"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                        Replay
                      </button>
                    </>
                  )}

                  {/* Generate Button */}
                  <button
                  onClick={onGenerate}
                  disabled={isLoading || !text.trim()}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-white font-medium rounded-lg text-sm px-6 py-2.5 transition-all shadow-lg
                      ${isLoading || !text.trim() 
                          ? 'bg-zinc-700 cursor-not-allowed opacity-50' 
                          : 'bg-indigo-600 hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-900 shadow-indigo-500/20'
                      }`}
                  >
                  {isLoading ? (
                      <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                      </>
                  ) : (
                      <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                      {hasAudio ? 'New Speak' : 'Speak'}
                      </>
                  )}
                  </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};