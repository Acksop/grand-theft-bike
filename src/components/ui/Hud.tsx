import React from 'react';
import { GameState } from '../../game/types';
import { TreePine, Building2, Bike } from 'lucide-react';

interface HudProps {
  state: GameState;
}

export default function Hud({ state }: HudProps) {
  const speed = Math.round(Math.sqrt(state.player.vel.x ** 2 + state.player.vel.y ** 2) * 5);
  const karmaPercent = Math.min(100, Math.max(0, (state.karma + 100) / 2));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 font-mono text-foreground">
      {/* Top Bar */}
      <div className="flex justify-between items-start gap-4">
        {/* Karma */}
        <div className="flex flex-col gap-1" style={{ background: 'rgba(2,6,23,0.8)', border: '2px solid rgba(16,185,129,0.2)', padding: '12px 16px', backdropFilter: 'blur(4px)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-accent" />
            <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'hsl(215 16% 15%)' }}>
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${karmaPercent}%`,
                  background: state.karma > 0
                    ? 'hsl(161 72% 48%)'
                    : 'hsl(330 81% 60%)',
                }}
              />
            </div>
            <TreePine className="w-4 h-4 text-primary" />
          </div>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: state.karma > 0 ? 'hsl(161 72% 48%)' : 'hsl(330 81% 60%)' }}>
            {state.karma > 0 ? '\u00c9co' : 'B\u00e9ton'} ({state.karma > 0 ? '+' : ''}{state.karma})
          </p>
        </div>

        {/* Speed */}
        <div className="text-right" style={{ background: 'rgba(2,6,23,0.8)', border: '2px solid rgba(16,185,129,0.2)', padding: '12px 16px', backdropFilter: 'blur(4px)' }}>
          <div className="flex items-center gap-2 justify-end mb-1">
            <Bike className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold text-primary">{speed}<span className="text-xs ml-1 text-muted-foreground">km/h</span></span>
          </div>
          <p className="text-[9px] uppercase text-muted-foreground tracking-wider">Besan\u00e7on &bull; Les Va\u00eetes</p>
        </div>
      </div>

      {/* Bottom: Mission */}
      <div className="flex justify-between items-end">
        <div className="max-w-xs" style={{ background: 'rgba(2,6,23,0.8)', border: '2px solid rgba(16,185,129,0.2)', padding: '12px 16px', backdropFilter: 'blur(4px)' }}>
          {/* Act 1 */}
          {state.act === 1 && (
            <>
              <p className="text-primary text-[10px] uppercase font-bold mb-1 tracking-widest">
                Acte 1 &mdash; La Mobilisation
              </p>
              {state.missionStatus === 'pending' && (
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Retrouve <span className="text-accent font-bold">Camille</span> au camp de la ZAD.
                  <br />
                  <span className="text-muted-foreground italic text-[10px]">[*Les Va\u00eetes : lutte r\u00e9elle depuis 2018*]</span>
                </p>
              )}
              {state.missionStatus === 'active' && (
                <div className="text-xs text-foreground/80 leading-relaxed space-y-1">
                  <p>Distribue les tracts dans le centre-ville.</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">Tracts :</span>
                    <span className="text-primary font-bold">{state.missionData.flyersToDistribute}</span>
                    <span className="text-[10px] uppercase text-muted-foreground ml-2">Sensis :</span>
                    <span className="text-accent font-bold">{state.missionData.flyersDistributed}/3</span>
                  </div>
                </div>
              )}
              {state.missionStatus === 'completed' && (
                <p className="text-xs text-foreground/80 leading-relaxed">
                  <span className="text-primary font-bold tracking-wider">SENSIBILISATION R\u00c9USSIE !</span>
                  <br />
                  Retourne voir Camille aux Va\u00eetes.
                </p>
              )}
            </>
          )}
          
          {/* Act 2 */}
          {state.act === 2 && (
            <>
              <p className="text-primary text-[10px] uppercase font-bold mb-1 tracking-widest" style={{ color: '#10b981' }}>
                Acte 2 &mdash; La R\u00e9sistance
              </p>
              {!state.missionData.hasPotatoes && state.missionStatus === 'pending' && (
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Va chercher des <span className="text-accent font-bold">munitions</span> chez 
                  Michel le mara\u00eecher au sud du chantier.
                </p>
              )}
              {state.missionData.hasPotatoes && state.missionStatus === 'active' && (
                <div className="text-xs text-foreground/80 leading-relaxed space-y-1">
                  <p>Lance des patates sur les machines !</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">Machines :</span>
                    <span className="text-primary font-bold">{state.missionData.machinesSabotaged}/{state.missionData.machinesTotal}</span>
                  </div>
                  {state.missionData.machinesSabotaged >= 3 && !state.missionData.computerHacked && (
                    <p className="text-accent text-[10px] mt-1">
                      &rarr; Pirate le PC du chef de chantier !
                    </p>
                  )}
                </div>
              )}
              {state.missionStatus === 'completed' && (
                <p className="text-xs text-foreground/80 leading-relaxed">
                  <span className="text-primary font-bold tracking-wider">CHANTIER SABOT\u00c9 !</span>
                  <br />
                  Retourne aux Va\u00eetes f\u00eater \u00e7a !
                </p>
              )}
            </>
          )}
          
          {/* Act 3 */}
          {state.act === 3 && (
            <>
              <p className="text-primary text-[10px] uppercase font-bold mb-1 tracking-widest" style={{ color: '#f59e0b' }}>
                Acte 3 &mdash; Les Elections
              </p>
              {state.missionStatus === 'pending' && (
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Va parler aux &eacute;lecteurs pour les convaincre,
                  <br />puis rends-toi au <span className="text-amber-500 font-bold">bureau de vote</span>.
                </p>
              )}
              {state.missionStatus === 'active' && !state.missionData.hasVoted && (
                <div className="text-xs text-foreground/80 leading-relaxed space-y-1">
                  <p>Va voter &agrave; l'urne !</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">Soutiens:</span>
                    <span className="text-primary font-bold">{state.missionData.votesGathered}</span>
                    <span className="text-[10px] uppercase text-muted-foreground ml-2">Karma:</span>
                    <span className="text-amber-500 font-bold">{state.karma}</span>
                  </div>
                </div>
              )}
              {state.missionData.hasVoted && (
                <p className="text-xs text-foreground/80 leading-relaxed">
                  <span className="text-amber-500 font-bold tracking-wider">VOTE ENREGISTR&Eacute; !</span>
                  <br />
                  D&eacute;couvrez le r&eacute;sultat...
                </p>
              )}
            </>
          )}
          
          <p className="mt-2 text-[9px] text-muted-foreground animate-pulse">
            Z/Q/S/D piloter &bull; ESPACE interagir
          </p>
        </div>
      </div>
    </div>
  );
}
