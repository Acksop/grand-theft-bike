import React from 'react';
import { GameState } from '../game/types';
import { TreePine, Building2, Bike, Map as MapIcon } from 'lucide-react';

interface HudProps {
  state: GameState;
}

export default function Hud({ state }: HudProps) {
  const speed = Math.round(Math.sqrt(state.player.vel.x ** 2 + state.player.vel.y ** 2) * 5);
  const karmaColor = state.karma > 0 ? 'text-primary' : 'text-accent';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 font-mono">
      {/* Top Bar: Karma & Info */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="bg-background/80 border-2 border-primary/20 p-4 pixel-corners backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <TreePine className={`w-5 h-5 ${state.karma > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden border border-border">
                <div 
                  className={`h-full transition-all duration-500 ${state.karma > 0 ? 'bg-primary' : 'bg-accent'}`}
                  style={{ width: `${Math.abs(state.karma)}%`, marginLeft: state.karma < 0 ? `${100 - Math.abs(state.karma)}%` : '0' }}
                />
              </div>
              <Building2 className={`w-5 h-5 ${state.karma < 0 ? 'text-accent' : 'text-muted-foreground'}`} />
            </div>
            <p className={`text-xs uppercase tracking-widest ${karmaColor}`}>
              Karma: {state.karma > 0 ? 'Éco-Responsable' : 'Bétonneur'} ({state.karma})
            </p>
          </div>
        </div>

        <div className="bg-background/80 border-2 border-primary/20 p-4 pixel-corners backdrop-blur-sm text-right">
          <div className="flex items-center gap-2 justify-end text-primary mb-1">
            <Bike className="w-5 h-5" />
            <span className="text-2xl font-bold">{speed} km/h</span>
          </div>
          <p className="text-[10px] uppercase text-muted-foreground">Besançon - Quartier des Vaîtes</p>
        </div>
      </div>

      {/* Bottom Bar: Mission & Dialog */}
      <div className="flex justify-between items-end">
        <div className="w-1/3 bg-background/80 border-2 border-primary/20 p-4 pixel-corners backdrop-blur-sm">
          <h3 className="text-primary text-xs uppercase font-bold mb-2 flex items-center gap-2">
             Mission en cours
          </h3>
          <p className="text-sm text-foreground/90">
            {state.missionId === 'setup_engine' ? 'Le Réveil des Vaîtes : Retrouve Camille au camp de la ZAD.' : 'Explore la ville.'}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground animate-pulse">
            <MapIcon className="w-3 h-3" />
            Z/Q/S/D pour piloter • ESPACE pour agir
          </div>
        </div>

        {/* Mini Map Placeholder */}
        <div className="w-32 h-32 bg-background/80 border-2 border-primary/20 pixel-corners overflow-hidden relative backdrop-blur-sm">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
           <div className="absolute inset-2 border border-primary/10 opacity-20" />
           <p className="absolute bottom-1 w-full text-center text-[8px] text-primary uppercase">GPS Activé</p>
        </div>
      </div>
    </div>
  );
}
