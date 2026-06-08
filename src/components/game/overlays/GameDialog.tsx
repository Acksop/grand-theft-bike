import React from 'react';

interface GameDialogProps {
  dialog: { name: string; text: string } | null;
}

export default function GameDialog({ dialog }: GameDialogProps) {
  if (!dialog) return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-2xl overflow-hidden relative group">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-xl" />
        
        <div className="flex flex-col gap-1">
          <span className="text-primary font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {dialog.name}
          </span>
          <p className="text-slate-100 text-lg leading-relaxed font-serif italic">
            {dialog.text}
          </p>
        </div>
        
        {/* Interaction hint */}
        <div className="absolute bottom-2 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">Continuer</span>
          <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center">
            <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
