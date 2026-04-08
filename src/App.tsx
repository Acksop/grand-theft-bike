import React, { useState } from 'react';
import GameView from './components/game/Canvas';
import { TreePine, Bike, MapPin, User, ArrowRight } from 'lucide-react';

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
            <div className="flex justify-center gap-6 text-muted-foreground/50">
               <TreePine className="w-6 h-6 animate-pulse" />
               <Bike className="w-6 h-6 animate-bounce" style={{ animationDuration: '2s' }} />
               <MapPin className="w-6 h-6 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            <h2 className="text-xl font-bold text-accent uppercase tracking-[0.2em] pt-4">Choisissez votre résistant</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHARACTERS.map((char) => (
              <div 
                key={char.id}
                onClick={() => setSelectedCharacter(char)}
                className="group relative bg-slate-900/50 border-2 border-slate-800 p-6 pixel-corners cursor-pointer transition-all hover:border-primary hover:bg-primary/5 hover:scale-105"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-slate-800 group-hover:bg-primary/10 transition-colors overflow-hidden flex items-center justify-center p-2">
                    {char.imageUrl ? (
                      <img src={char.imageUrl} alt={char.name} className="w-16 h-16 object-contain" />
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
                <h3 className="text-2xl font-black text-foreground mb-2 uppercase italic">{char.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6 h-12">
                  {char.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    <span>Vitesse</span>
                    <span className="text-primary">x{char.stats.speed}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800">
                    <div className="h-full bg-primary" style={{ width: `${(char.stats.speed / 1.2) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    <span>Santé</span>
                    <span className="text-accent">{char.stats.health}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800">
                    <div className="h-full bg-accent" style={{ width: `${(char.stats.health / 150) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-8">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              Besançon • 2026 • Les Vaîtes Contre-Attaquent
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="h-screen w-full bg-[#020617] flex items-center justify-center p-6 text-center cursor-pointer relative overflow-hidden" onClick={() => setShowIntro(false)}>
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
      </div>
    );
  }

  return <GameView character={selectedCharacter} />;
}
