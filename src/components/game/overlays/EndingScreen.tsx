import React from 'react';

interface EndingScreenProps {
  ending: { type: string; title: string; text: string };
  onShowCredits: () => void;
}

export default function EndingScreen({ ending, onShowCredits }: EndingScreenProps) {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-8 overflow-hidden">
      {/* Background with blur/vignette */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      
      <div className="relative max-w-2xl w-full bg-slate-900/90 border border-slate-700/50 rounded-3xl p-12 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700">
        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-primary text-xs font-bold uppercase tracking-[0.4em]">FIN DU CHAPITRE</span>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter text-slate-50 italic">
            {ending.title}
          </h1>
          
          <div className="relative mb-12">
            <div className="absolute top-0 left-0 text-6xl text-primary/20 font-serif leading-none -translate-x-4 -translate-y-4">"</div>
            <p className="text-xl text-slate-300 leading-relaxed font-serif italic relative z-10">
              {ending.text}
            </p>
            <div className="absolute bottom-0 right-0 text-6xl text-primary/20 font-serif leading-none translate-x-4 translate-y-4">"</div>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onShowCredits();
            }}
            className="group relative px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            <span className="relative z-10 flex items-center gap-2">
              VOIR LES CRÉDITS
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
