import React from 'react';

interface CreditsPopupProps {
  onClose: () => void;
}

export default function CreditsPopup({ onClose }: CreditsPopupProps) {
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center p-8">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" />
      
      <div className="relative max-w-lg w-full text-center animate-in slide-in-from-bottom-8 duration-1000">
        <h2 className="text-primary text-xs font-bold uppercase tracking-[0.6em] mb-12">CRÉDITS</h2>
        
        <div className="space-y-10 mb-16">
          <section>
            <h3 className="text-slate-500 text-[10px] uppercase tracking-widest mb-3">Conception & Code</h3>
            <p className="text-slate-100 text-2xl font-black italic">L'ÉQUIPE ZAD VAÎTES</p>
          </section>
          
          <section>
            <h3 className="text-slate-500 text-[10px] uppercase tracking-widest mb-3">Graphismes & Sprites</h3>
            <p className="text-slate-100 text-lg">IA Générative & Artistes Locaux</p>
          </section>
          
          <section>
            <h3 className="text-slate-500 text-[10px] uppercase tracking-widest mb-3">Slogan & Dialogues</h3>
            <p className="text-slate-100 text-lg">Bureau du Sarcasme & de l'Écologie</p>
          </section>
          
          <section>
            <h3 className="text-slate-500 text-[10px] uppercase tracking-widest mb-3">Musique</h3>
            <p className="text-slate-100 text-lg">Le Vent dans les Arbres des Vaîtes</p>
          </section>
        </div>
        
        <div className="pt-12 border-t border-slate-800">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-slate-500 hover:text-slate-100 transition-colors font-mono text-xs uppercase tracking-widest underline underline-offset-8"
          >
            Retour au menu
          </button>
        </div>
      </div>
    </div>
  );
}
