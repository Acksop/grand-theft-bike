import React, { useState, useEffect } from 'react';
import { blink } from './blink/client';
import GameView from './components/game/Canvas';
import { Spinner } from './components/ui/spinner';
import { TreePine, Bike, MapPin } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setIsAuthenticated(state.isAuthenticated);
    });
    return unsubscribe;
  }, []);

  if (isAuthenticated === null) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617]">
      <Spinner className="w-12 h-12 text-primary" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-6 text-center overflow-auto">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-6xl font-black text-primary tracking-tighter uppercase italic">
            GTB
          </h1>
          <p className="text-2xl font-bold text-foreground">Grand Theft Bike</p>
          <div className="flex justify-center gap-4 text-muted-foreground">
             <TreePine className="w-6 h-6" />
             <Bike className="w-6 h-6" />
             <MapPin className="w-6 h-6" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Besançon, 2026. Les élections approchent. Les Vaîtes sont menacées par le béton. 
            Incarne Léo, pédale pour la planète, et sabote le greenwashing local.
          </p>
        </div>

        <button
          onClick={() => blink.auth.login(window.location.href)}
          className="w-full bg-primary hover:bg-primary/90 text-background font-black py-4 pixel-corners transition-all transform hover:scale-105 uppercase tracking-widest text-lg"
        >
          Rejoindre la Résistance
        </button>

        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Optimisé pour vieux matos • Sans DRM • 100% Bio
        </p>
      </div>
    </div>
  );

  if (showIntro) {
    return (
      <div className="h-screen w-full bg-[#020617] flex items-center justify-center p-6 text-center cursor-pointer" onClick={() => setShowIntro(false)}>
        <div className="max-w-lg animate-fade-in space-y-6">
          <h2 className="text-accent text-xs uppercase font-bold tracking-[0.5em] mb-4">ACTE 1 : LA MOBILISATION</h2>
          <p className="text-2xl font-serif text-foreground/90 leading-relaxed">
            "Besançon se réveille avec la gueule de bois. La mairie veut bétonner les Vaîtes pour un 'éco-quartier' de pacotille."
          </p>
          <p className="text-primary text-sm font-mono uppercase animate-pulse">
            Clique pour commencer ta journée de maraîcher...
          </p>
        </div>
      </div>
    );
  }

  return <GameView />;
}
