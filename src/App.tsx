import React, { useState } from 'react';
import GameView from './components/game/Canvas';
import { TreePine, Bike, MapPin, User, ArrowRight, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";

export type CharacterType = {
  id: string;
  name: string;
  description: string;
  color: string;
  imageUrl?: string;
  stats: {
    speed: number;
    health: number;
  };
};

const CHARACTERS: CharacterType[] = [
  {
    id: 'leo',
    name: 'Léo',
    description: 'Le maraîcher des Vaîtes. Équilibré et déterminé.',
    color: '#10b981',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FUZQ9Vyz8TgXm8l5Oq425336AyOB3%2Flo__f84c2711.png?alt=media&token=7a890938-6a40-4ce1-a014-c276d949a87c',
    stats: { speed: 1, health: 100 }
  },
  {
    id: 'sarah',
    name: 'Sarah',
    description: 'L\'activiste du centre-ville. Rapide et agile.',
    color: '#ec4899',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FUZQ9Vyz8TgXm8l5Oq425336AyOB3%2Fsarah__182e2d7e.png?alt=media&token=90cf1181-5553-4b15-953f-4b256a00e8dc',
    stats: { speed: 1.2, health: 80 }
  },
  {
    id: 'marc',
    name: 'Marc',
    description: 'Le doyen du quartier. Lent mais très résistant.',
    color: '#3b82f6',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FUZQ9Vyz8TgXm8l5Oq425336AyOB3%2FMarc__666802b0.png?alt=media&token=c63d841d-9f5d-4e89-b760-6958e43615a0',
    stats: { speed: 0.8, health: 150 }
  }
];

export default function App() {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  if (!selectedCharacter) {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-6 overflow-auto">
        <div className="max-w-4xl w-full space-y-12 animate-fade-in">
          <div className="text-center space-y-4">
            <h1 className="text-7xl font-black text-primary tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              GTB
            </h1>
            <p className="text-2xl font-bold text-foreground tracking-widest uppercase">Grand Theft Bike</p>
            <div className="flex justify-center gap-12 py-6">
               {CHARACTERS.map(char => (
                 <div key={`title-${char.id}`} className="flex flex-col items-center gap-2 group/title pointer-events-none">
                   {char.imageUrl && (
                     <img 
                       src={char.imageUrl} 
                       alt={char.name} 
                       loading="eager"
                       className="w-20 h-20 object-contain opacity-60 group-hover/title:opacity-100 transition-all animate-bounce-subtle filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover/title:scale-110 pointer-events-none"
                       style={{ animationDelay: char.id === 'sarah' ? '0.5s' : char.id === 'marc' ? '1s' : '0s' }}
                     />
                   )}
                   <span className="text-[8px] uppercase tracking-widest text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity pointer-events-none">{char.name}</span>
                 </div>
               ))}
            </div>
            <h2 className="text-xl font-bold text-accent uppercase tracking-[0.2em] pt-4">Choisissez votre résistant</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHARACTERS.map((char) => (
              <button 
                key={char.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedCharacter(char);
                }}
                className="group relative bg-slate-900/50 border-2 border-slate-800 p-6 pixel-corners cursor-pointer transition-all hover:scale-105 text-left w-full block"
                style={{ '--hover-color': char.color } as any}
              >
                {/* Custom Hover Border logic via style or classes */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--hover-color)] transition-colors pixel-corners pointer-events-none" />
                <div className="absolute inset-0 bg-[var(--hover-color)] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="bg-slate-800/80 group-hover:bg-[var(--hover-color)]/20 transition-colors overflow-hidden flex items-center justify-center p-2 rounded-lg border border-slate-700">
                    {char.imageUrl ? (
                      <img src={char.imageUrl} alt={char.name} className="w-16 h-16 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                    ) : (
                      <div className="p-2">
                        <User className="w-8 h-8" style={{ color: char.color }} />
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                    ID: {char.id}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-foreground mb-2 uppercase italic relative z-10">{char.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6 h-12 relative z-10">
                  {char.description}
                </p>
                <div className="space-y-2 relative z-10">
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    <span>Vitesse</span>
                    <span style={{ color: char.color }}>x{char.stats.speed}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800">
                    <div className="h-full" style={{ width: `${(char.stats.speed / 1.2) * 100}%`, backgroundColor: char.color }} />
                  </div>
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    <span>Santé</span>
                    <span style={{ color: char.color }}>{char.stats.health}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800">
                    <div className="h-full opacity-80" style={{ width: `${(char.stats.health / 150) * 100}%`, backgroundColor: char.color }} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center pt-8 space-y-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Besançon • 2026 • Les Vaîtes Contre-Attaquent
            </p>
            
            <Dialog>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-2 text-[10px] text-primary hover:text-primary/80 transition-colors uppercase font-bold tracking-widest cursor-pointer group">
                  <Info className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  Crédits
                </button>
              </DialogTrigger>
              <DialogContent className="bg-slate-950 border-slate-800 text-foreground sm:max-w-[425px] pixel-corners">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black italic uppercase text-primary tracking-tighter">
                    GTB : Crédits
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Lead Développeur</p>
                    <p className="text-lg font-bold text-foreground italic">Emmanuel ROY <span className="text-primary">A.K.A Acksop</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Images et Son</p>
                    <p className="text-lg font-bold text-foreground italic">Pierre GOURVENNEC <span className="text-accent">A.K.A PiR²</span></p>
                  </div>
                  <div className="pt-4 border-t border-slate-800/50">
                    <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-tighter">
                      Produit avec amour et engagement pour la défense du quartier des Vaîtes.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <button 
        className="h-screen w-full bg-[#020617] flex items-center justify-center p-6 text-center cursor-pointer relative overflow-hidden block border-0 outline-none focus:outline-none" 
        onClick={(e) => {
          e.stopPropagation();
          setShowIntro(false);
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent rounded-full blur-[100px]" />
        </div>

        <div className="max-w-2xl animate-fade-in space-y-8 relative z-10">
          <div className="space-y-2">
            <h2 className="text-accent text-xs uppercase font-bold tracking-[0.5em] mb-4">ACTE 1 : LA MOBILISATION</h2>
            <div className="h-1 w-24 bg-accent mx-auto" />
          </div>

          {selectedCharacter.imageUrl && (
            <div className="flex justify-center py-4">
              <div className="p-4 bg-slate-900/50 border-2 border-accent/20 rounded-2xl backdrop-blur-sm animate-bounce-subtle">
                <img 
                  src={selectedCharacter.imageUrl} 
                  alt={selectedCharacter.name} 
                  className="w-32 h-32 object-contain filter drop-shadow-[0_0_20px_rgba(236,72,153,0.3)] pointer-events-none"
                />
              </div>
            </div>
          )}
          
          <p className="text-3xl md:text-4xl font-serif text-foreground/90 leading-tight italic">
            "Besançon se réveille avec la gueule de bois. La mairie veut bétonner les Vaîtes pour un 'éco-quartier' de pacotille."
          </p>
          
          <div className="flex items-center justify-center gap-4 text-primary font-mono uppercase tracking-widest text-sm animate-pulse">
            <span>Cliquez pour incarner {selectedCharacter.name}</span>
            <ArrowRight className="w-4 h-4" />
          </div>

          <p className="text-xs text-muted-foreground/60 uppercase tracking-[0.2em]">
            Votre mission commence maintenant
          </p>
        </div>
      </button>
    );
  }

  return <GameView character={selectedCharacter} />;
}
