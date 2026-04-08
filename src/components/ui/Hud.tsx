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

        {/* Speed / On Foot indicator */}
        <div className="flex items-center gap-4" style={{ background: 'rgba(2,6,23,0.8)', border: '2px solid rgba(16,185,129,0.2)', padding: '8px 16px', backdropFilter: 'blur(4px)' }}>
          {state.player.meta?.spriteUrl && (
            <img 
              src={state.player.meta.spriteUrl} 
              alt="Avatar" 
              className="w-10 h-10 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
            />
          )}
          <div className="text-right">
            {state.isOnBike ? (
              <>
                <div className="flex items-center gap-2 justify-end mb-1">
                  <Bike className="w-5 h-5 text-primary" />
                  <span className="text-xl font-bold text-primary">{speed}<span className="text-xs ml-1 text-muted-foreground">km/h</span></span>
                </div>
                <p className="text-[9px] uppercase text-muted-foreground tracking-wider">Besan\u00e7on &bull; Les Va\u00eetes</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className="text-xl font-bold text-amber-400">PI\u00c9TON</span>
                </div>
                <p className="text-[9px] uppercase text-muted-foreground tracking-wider">Atelier RSE</p>
              </>
            )}
          </div>
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
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Retrouve <span className="text-accent font-bold">Camille</span> au camp de la ZAD.
                  </p>
                  <p className="text-[10px] text-accent/70 bg-accent/10 px-2 py-1 border-l border-accent/50 animate-pulse">
                    AIDE : Direction l'EST (droite) pour le camp.
                  </p>
                </div>
              )}
              {state.missionStatus === 'active' && (
                <div className="text-xs text-foreground/80 leading-relaxed space-y-2">
                  <p>Distribue les tracts dans le centre-ville.</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">Tracts :</span>
                    <span className="text-primary font-bold">{state.missionData.flyersToDistribute}</span>
                    <span className="text-[10px] uppercase text-muted-foreground ml-2">Sensis :</span>
                    <span className="text-accent font-bold">{state.missionData.flyersDistributed}/3</span>
                  </div>
                  <p className="text-[10px] text-accent/70 bg-accent/10 px-2 py-1 border-l border-accent/50">
                    AIDE : Va vers l'OUEST (gauche). Presse ESPACE pr&egrave;s des gens.
                  </p>
                </div>
              )}
              {state.missionStatus === 'completed' && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    <span className="text-primary font-bold tracking-wider">SENSIBILISATION R\u00c9USSIE !</span>
                    <br />
                    Retourne voir Camille aux Va\u00eetes.
                  </p>
                  <p className="text-[10px] text-primary/70 bg-primary/10 px-2 py-1 border-l border-primary/50 animate-pulse">
                    AIDE : Reviens au camp &agrave; l'EST.
                  </p>
                </div>
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
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Va chercher des <span className="text-accent font-bold">munitions</span> chez 
                    Michel le mara\u00eecher au sud du chantier.
                  </p>
                  <p className="text-[10px] text-accent/70 bg-accent/10 px-2 py-1 border-l border-accent/50 animate-pulse">
                    AIDE : Michel est en BAS (sud) du chantier.
                  </p>
                </div>
              )}
              {state.missionData.hasPotatoes && state.missionStatus === 'active' && (
                <div className="text-xs text-foreground/80 leading-relaxed space-y-2">
                  <p>Lance des patates sur les machines !</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">Machines :</span>
                    <span className="text-primary font-bold">{state.missionData.machinesSabotaged}/{state.missionData.machinesTotal}</span>
                  </div>
                  {state.missionData.machinesSabotaged >= 3 && !state.missionData.computerHacked && (
                    <div className="space-y-1">
                      <p className="text-accent text-[10px] mt-1">
                        &rarr; Pirate le PC du chef de chantier !
                      </p>
                      <p className="text-[10px] text-accent/70 bg-accent/10 px-2 py-1 border-l border-accent/50">
                        AIDE : Le PC est dans le container bleu.
                      </p>
                    </div>
                  )}
                  {state.missionData.machinesSabotaged < 3 && (
                    <p className="text-[10px] text-accent/70 bg-accent/10 px-2 py-1 border-l border-accent/50">
                      AIDE : Presse ESPACE pr&egrave;s des machines jaunes.
                    </p>
                  )}
                </div>
              )}
              {state.missionStatus === 'completed' && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    <span className="text-primary font-bold tracking-wider">CHANTIER SABOT\u00c9 !</span>
                    <br />
                    Retourne aux Va\u00eetes f\u00eater \u00e7a !
                  </p>
                  <p className="text-[10px] text-primary/70 bg-primary/10 px-2 py-1 border-l border-primary/50 animate-pulse">
                    AIDE : Reviens au camp &agrave; l'EST.
                  </p>
                </div>
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
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Va parler aux &eacute;lecteurs pour les convaincre,
                    <br />puis rends-toi au <span className="text-amber-500 font-bold">bureau de vote</span>.
                  </p>
                  <p className="text-[10px] text-amber-500/70 bg-amber-500/10 px-2 py-1 border-l border-amber-500/50 animate-pulse">
                    AIDE : Convaincs les gens (NPCs gris) puis va vers l'OUEST (gauche).
                  </p>
                </div>
              )}
              {state.missionStatus === 'active' && !state.missionData.hasVoted && (
                <div className="text-xs text-foreground/80 leading-relaxed space-y-2">
                  <p>Va voter &agrave; l'urne !</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">Soutiens:</span>
                    <span className="text-primary font-bold">{state.missionData.votesGathered}</span>
                    <span className="text-[10px] uppercase text-muted-foreground ml-2">Karma:</span>
                    <span className="text-amber-500 font-bold">{state.karma}</span>
                  </div>
                  <p className="text-[10px] text-amber-500/70 bg-amber-500/10 px-2 py-1 border-l border-amber-500/50">
                    AIDE : Presse ESPACE pr&egrave;s de l'urne jaune.
                  </p>
                </div>
              )}
              {state.missionData.hasVoted && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    <span className="text-amber-500 font-bold tracking-wider">VOTE ENREGISTR&Eacute; !</span>
                    <br />
                    Direction l'atelier RSE...
                  </p>
                  <p className="text-[10px] text-amber-500/70 bg-amber-500/10 px-2 py-1 border-l border-amber-500/50 animate-pulse">
                    AIDE : Pr&eacute;pare-toi &agrave; confronter l'hypocrisie.
                  </p>
                </div>
              )}
            </>
          )}
          
          {/* Act 4 - RSE Workshop */}
          {state.act === 4 && (
            <>
              <p className="text-primary text-[10px] uppercase font-bold mb-1 tracking-widest" style={{ color: '#f43f5e' }}>
                Acte 4 &mdash; L'Atelier RSE
              </p>
              {state.missionStatus === 'pending' && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Explorez la salle, collectez les gobelets,
                    <br />puis <span className="text-rose-500 font-bold">confrontez</span> le formateur.
                  </p>
                  <p className="text-[10px] text-rose-500/70 bg-rose-500/10 px-2 py-1 border-l border-rose-500/50 animate-pulse">
                    AIDE : Ramasse les petits ronds jaunes au sol (ESPACE).
                  </p>
                </div>
              )}
              {state.missionStatus === 'active' && !state.missionData.workshopChoice && (
                <div className="text-xs text-foreground/80 leading-relaxed space-y-2">
                  <p>Collectez les gobelets et denoncez l'hypocrisie !</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">Gobelets:</span>
                    <span className="text-primary font-bold">{state.missionData.cupsCollected}/{state.missionData.cupsTotal}</span>
                    <span className="text-[10px] uppercase text-muted-foreground ml-2">Karma:</span>
                    <span className="text-rose-500 font-bold">{state.karma}</span>
                  </div>
                  <p className="text-[10px] text-rose-500/70 bg-rose-500/10 px-2 py-1 border-l border-rose-500/50">
                    AIDE : Parle au formateur bleu ou renverse la machine (ESPACE).
                  </p>
                  {state.missionData.hasTrophy && (
                    <p className="text-rose-500 text-[10px] mt-1">TROPHEE : Gobelet collect&eacute; !</p>
                  )}
                </div>
              )}
              {state.missionData.workshopChoice && !state.missionData.hasVoted && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    <span className="text-rose-500 font-bold tracking-wider">ACTION LANC&Eacute;E !</span>
                    <br />
                    Parlez au formateur pour terminer...
                  </p>
                  <p className="text-[10px] text-rose-500/70 bg-rose-500/10 px-2 py-1 border-l border-rose-500/50 animate-pulse">
                    AIDE : Direction le Chantier &Eacute;cocide ensuite !
                  </p>
                </div>
              )}
            </>
          )}
          
          {/* Act 5 - Chantier Écocide */}
          {state.act === 5 && (
            <>
              <p className="text-primary text-[10px] uppercase font-bold mb-1 tracking-widest" style={{ color: '#ef4444' }}>
                Acte 5 &mdash; Le Chantier Écocide
              </p>
              {state.missionStatus === 'pending' && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Parlez au promoteur pour commencer,
                    <br />puis sabotez la presentation !
                  </p>
                  <p className="text-[10px] text-red-500/70 bg-red-500/10 px-2 py-1 border-l border-red-500/50 animate-pulse">
                    AIDE : Le promoteur est en haut (bleu fonc&eacute;).
                  </p>
                </div>
              )}
              {state.missionStatus === 'active' && !state.missionData.presentationSabotaged && (
                <div className="text-xs text-foreground/80 leading-relaxed space-y-2">
                  <p>Sabotez le chantier !</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {state.missionData.hasPotatoesForAct5 && (
                      <span className="text-[10px] uppercase bg-green-600/30 text-green-400 px-1.5 py-0.5 rounded">PATATES</span>
                    )}
                    <span className="text-[10px] uppercase text-muted-foreground">Graffiti:</span>
                    <span className="text-primary font-bold">{state.missionData.graffitiDone}/{state.missionData.graffitiTotal}</span>
                    <span className="text-[10px] uppercase text-muted-foreground ml-2">Karma:</span>
                    <span className="text-red-500 font-bold">{state.karma}</span>
                  </div>
                  <p className="text-[10px] text-red-500/70 bg-red-500/10 px-2 py-1 border-l border-red-500/50">
                    AIDE : Vise les engins jaunes, tag les murs ou pirate l'Ecran !
                  </p>
                </div>
              )}
              {state.missionData.presentationSabotaged && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    <span className="text-red-500 font-bold tracking-wider">SABOTAGE EN COURS !</span>
                    <br />
                    Parlez au promoteur pour terminer...
                  </p>
                  <p className="text-[10px] text-red-500/70 bg-red-500/10 px-2 py-1 border-l border-red-500/50 animate-pulse">
                    AIDE : Va voir Camille en BAS pour la fin narrative !
                  </p>
                </div>
              )}
            </>
          )}
          
          {/* Act 6 - Fontaine Granvelle */}
          {state.act === 6 && (
            <>
              <p className="text-primary text-[10px] uppercase font-bold mb-1 tracking-widest" style={{ color: '#3b82f6' }}>
                Acte 6 &mdash; La Fontaine Granvelle
              </p>
              {state.missionStatus === 'pending' && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Allez à la fontaine (bleue) pour detourner l'eau.
                  </p>
                  <p className="text-[10px] text-blue-500/70 bg-blue-500/10 px-2 py-1 border-l border-blue-500/50 animate-pulse">
                    AIDE : Presse ESPACE pres de la fontaine centrale.
                  </p>
                </div>
              )}
              {state.missionStatus === 'active' && (
                <div className="text-xs text-foreground/80 leading-relaxed space-y-2">
                  <p>Sauvez l'eau precieuse !</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">Verres:</span>
                    <span className="text-primary font-bold">{state.missionData.glassesCollected}</span>
                    <span className="text-[10px] uppercase text-muted-foreground ml-2">Karma:</span>
                    <span className="text-blue-500 font-bold">{state.karma}</span>
                  </div>
                  <p className="text-[10px] text-blue-500/70 bg-blue-500/10 px-2 py-1 border-l border-blue-500/50">
                    AIDE : {state.missionData.glassesCollected > 0 ? "Videz l'eau au JARDIN (vert) en bas !" : "Ramasse les verres à la fontaine !"}
                  </p>
                  {!state.missionData.driveHacked && (
                    <p className="text-accent text-[10px] mt-1">
                      &rarr; Pirate l'ecran du DRIVE (vert fluo) !
                    </p>
                  )}
                </div>
              )}
              {state.missionData.fountainHacked && state.missionData.driveHacked && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    <span className="text-blue-500 font-bold tracking-wider">EAU SECURISEE !</span>
                    <br />
                    Allez voir le Zadiste pour conclure.
                  </p>
                  <p className="text-[10px] text-blue-500/70 bg-blue-500/10 px-2 py-1 border-l border-blue-500/50 animate-pulse">
                    AIDE : Parle au PNJ rose pres de la fontaine.
                  </p>
                </div>
              )}
            </>
          )}
          
          <p className="mt-2 text-[9px] text-muted-foreground animate-pulse">
            {state.isOnBike ? (
              <>Z/Q/S/D piloter &bull; ESPACE interagir</>
            ) : (
              <>Z/Q/S/D marcher &bull; ESPACE interagir</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}