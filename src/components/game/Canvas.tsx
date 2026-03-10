import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GameState, InputState } from '../../game/types';
import { updateBike, checkCollisions } from '../../game/engine';
import { renderGame } from '../../game/renderer';
import { WORLD_SIZE } from '../../game/world';
import Hud from '../ui/Hud';
import { CharacterType } from '../../App';

interface GameViewProps {
  character: CharacterType;
}

const KEY_MAP: Record<string, keyof InputState> = {
  z: 'up', ArrowUp: 'up',
  s: 'down', ArrowDown: 'down',
  q: 'left', ArrowLeft: 'left',
  d: 'right', ArrowRight: 'right',
  ' ': 'action',
};

export default function GameView({ character }: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Create initial state once inside component to use props
  const [initialState] = useState<GameState>(() => ({
    player: {
      id: 'player',
      type: 'player',
      pos: { x: 2300, y: 1000 },
      vel: { x: 0, y: 0 },
      angle: -Math.PI / 2,
      size: 20,
      color: character.color,
      health: character.stats.health,
      maxHealth: character.stats.health,
      meta: { characterId: character.id, speedMultiplier: character.stats.speed }
    },
    entities: [
      {
        id: 'camille',
        type: 'npc',
        pos: { x: 2450, y: 1050 },
        vel: { x: 0, y: 0 },
        angle: 0,
        size: 16,
        color: '#ec4899',
        health: 100,
        maxHealth: 100,
        meta: { name: 'Camille', dialog: `${character.name} ! Les pelleteuses arrivent demain. On doit mobiliser le quartier ! Prends ces tracts et distribue-les aux gens du centre-ville.` }
      },
      {
        id: 'mairesse',
        type: 'npc',
        pos: { x: 600, y: 1900 },
        vel: { x: 0, y: 0 },
        angle: 0,
        size: 18,
        color: '#94a3b8',
        health: 100,
        maxHealth: 100,
        meta: { name: 'La Mairesse', dialog: "Notre \u00e9co-quartier est r\u00e9volutionnaire ! [*greenwashing*]" }
      },
      {
        id: 'brocanteur',
        type: 'npc',
        pos: { x: 300, y: 1600 },
        vel: { x: 0, y: 0 },
        angle: 0,
        size: 14,
        color: '#f59e0b',
        health: 100,
        maxHealth: 100,
        meta: { name: 'Sam (Brocanteur)', dialog: "Besan\u00e7on change, mon pote. Trop de b\u00e9ton, pas assez de vieux canap\u00e9s." }
      },
      {
        id: 'zadiste1',
        type: 'npc',
        pos: { x: 2500, y: 950 },
        vel: { x: 0, y: 0 },
        angle: 0,
        size: 14,
        color: '#064e3b',
        health: 100,
        maxHealth: 100,
        meta: { name: 'Zadiste', dialog: "On l\u00e2chera rien !" }
      },
      {
        id: 'passant1',
        type: 'npc',
        pos: { x: 800, y: 1700 },
        vel: { x: 0, y: 0 },
        angle: 0,
        size: 15,
        color: '#64748b',
        health: 100,
        maxHealth: 100,
        meta: { name: 'Passant', dialog: "Encore des travaux... je suis en retard !" }
      },
      {
        id: 'passant2',
        type: 'npc',
        pos: { x: 400, y: 1850 },
        vel: { x: 0, y: 0 },
        angle: 0,
        size: 15,
        color: '#64748b',
        health: 100,
        maxHealth: 100,
        meta: { name: 'Passant', dialog: "Un \u00e9co-quartier ? C'est bien pour la valeur de mon appart, non ?" }
      }
    ],
    karma: 20,
    missionId: 'mobilisation',
    missionStatus: 'pending',
    act: 1,
    missionData: {
      flyersToDistribute: 0,
      flyersDistributed: 0,
      targetNPCs: [],
      machinesSabotaged: 0,
      machinesTotal: 3,
      hasPotatoes: false,
      computerHacked: false
    },
    worldSize: WORLD_SIZE,
    isPaused: false,
  }));

  const stateRef = useRef<GameState>(structuredClone(initialState));
  const inputRef = useRef<InputState>({ up: false, down: false, left: false, right: false, action: false });
  const frameRef = useRef<number>(0);
  const [hudState, setHudState] = useState(initialState);
  const [dialog, setDialog] = useState<{ name: string; text: string } | null>(null);
  const [showAct2Intro, setShowAct2Intro] = useState(false);
  const [showAct3Intro, setShowAct3Intro] = useState(false);
  const [showEnding, setShowEnding] = useState<{ type: string; title: string; text: string } | null>(null);
  const dialogTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Check for Act 2 transition
  const checkActTransition = useCallback((gs: GameState) => {
    if (gs.act === 1 && gs.missionStatus === 'completed' && gs.missionData.flyersDistributed >= 3) {
      // Transition to Act 2
      gs.act = 2;
      gs.missionId = 'resistance';
      gs.missionStatus = 'pending';
      gs.missionData = {
        flyersToDistribute: 0,
        flyersDistributed: 0,
        targetNPCs: [],
        machinesSabotaged: 0,
        machinesTotal: 3,
        hasPotatoes: false,
        computerHacked: false
      };
      
      // Add construction machines to the world
      gs.entities.push(
        { id: 'machine1', type: 'prop', pos: { x: 2400, y: 2200 }, vel: { x: 0, y: 0 }, angle: 0, size: 24, color: '#f59e0b', health: 100, maxHealth: 100, meta: { name: 'Pelleteuse', dialog: 'Cette machine va détruire nos terres !' }},
        { id: 'machine2', type: 'prop', pos: { x: 2600, y: 2150 }, vel: { x: 0, y: 0 }, angle: 0, size: 22, color: '#f59e0b', health: 100, maxHealth: 100, meta: { name: 'Camion', dialog: 'Il transporte le béton !' }},
        { id: 'machine3', type: 'prop', pos: { x: 2500, y: 2300 }, vel: { x: 0, y: 0 }, angle: 0, size: 20, color: '#f59e0b', health: 100, maxHealth: 100, meta: { name: 'Nacelle', dialog: 'Pour construire plus haut, plus vite.' }},
        // Act 2 NPCs
        { id: 'chef-chantier', type: 'npc', pos: { x: 2350, y: 2050 }, vel: { x: 0, y: 0 }, angle: 0, size: 18, color: '#be123c', health: 100, maxHealth: 100, meta: { name: 'Chef Chantier', dialog: 'On a un deadline, bougez-vous !' }},
        { id: 'maraicher', type: 'npc', pos: { x: 2100, y: 1900 }, vel: { x: 0, y: 0 }, angle: 0, size: 14, color: '#84cc16', health: 100, maxHealth: 100, meta: { name: 'Michel (Maraîcher)', dialog: 'Regarde ce qu\'ils font à mes patates ! Viens, j\'ai des munitions pour toi.' }},
        // Act 2 - Container PC
        { id: 'container-pc', type: 'prop', pos: { x: 2350, y: 2150 }, vel: { x: 0, y: 0 }, angle: 0, size: 30, color: '#1e293b', health: 100, maxHealth: 100, meta: { name: 'Ordinateur Chantier', dialog: 'Le PC du chef de chantier ! Je peux pirater les plans...' }}
      );
      
      setShowAct2Intro(true);
    }
    
    // Check for Act 3 transition
    if (gs.act === 2 && gs.missionStatus === 'completed' && gs.missionData.machinesSabotaged >= 3 && gs.missionData.computerHacked) {
      gs.act = 3;
      gs.missionId = 'election';
      gs.missionStatus = 'pending';
      gs.missionData = {
        flyersToDistribute: 0,
        flyersDistributed: 0,
        targetNPCs: [],
        machinesSabotaged: 0,
        machinesTotal: 3,
        hasPotatoes: false,
        computerHacked: false,
        votesGathered: 0,
        votesNeeded: 5,
        hasVoted: false,
        finalChoice: null
      };
      
      // Add Act 3 NPCs - voting station area
      gs.entities.push(
        { id: 'urne', type: 'prop', pos: { x: 500, y: 1800 }, vel: { x: 0, y: 0 }, angle: 0, size: 25, color: '#fbbf24', health: 100, maxHealth: 100, meta: { name: 'Urne Electronique', dialog: 'Cliquez pour voter pour le scrutin final !' }},
        { id: 'promoteur', type: 'npc', pos: { x: 700, y: 1750 }, vel: { x: 0, y: 0 }, angle: 0, size: 20, color: '#dc2626', health: 100, maxHealth: 100, meta: { name: 'Promoteur Immobilier', dialog: 'Mon éco-quartier va crear des emplois ! Vous êtes contre la croissance ?!' }},
        { id: 'journaliste', type: 'npc', pos: { x: 400, y: 1700 }, vel: { x: 0, y: 0 }, angle: 0, size: 16, color: '#7c3aed', health: 100, maxHealth: 100, meta: { name: 'Journaliste', dialog: 'Intéressant... avez-vous un commentaire pour ma une ?' }},
        { id: 'elecopro', type: 'npc', pos: { x: 600, y: 1850 }, vel: { x: 0, y: 0 }, angle: 0, size: 18, color: '#16a34a', health: 100, maxHealth: 100, meta: { name: 'Liste Écologique', dialog: 'Votre aide a été précieuse. Le peuple Vaîte vous en remercie !' }},
        { id: 'electeur1', type: 'npc', pos: { x: 300, y: 1900 }, vel: { x: 0, y: 0 }, angle: 0, size: 15, color: '#64748b', health: 100, maxHealth: 100, meta: { name: 'Électeur', dialog: 'Hésitant entre les deux listes... Le verde OU le progrès ?' }},
        { id: 'electeur2', type: 'npc', pos: { x: 800, y: 1950 }, vel: { x: 0, y: 0 }, angle: 0, size: 15, color: '#64748b', health: 100, maxHealth: 100, meta: { name: 'Électeur', dialog: 'J\'ai entendu dire que le chantier a été saboté. Enfin !' }}
      );
      
      setShowAct3Intro(true);
    }
  }, []);

  // Resize canvas
  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }, []);

  // Keyboard input (ref-based, no stale closure)
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = KEY_MAP[e.key];
      if (k) { inputRef.current[k] = true; e.preventDefault(); }
    };
    const onUp = (e: KeyboardEvent) => {
      const k = KEY_MAP[e.key];
      if (k) { inputRef.current[k] = false; e.preventDefault(); }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, []);

  // Resize listener
  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  // Game loop
  useEffect(() => {
    let hudTick = 0;

    const loop = () => {
      const gs = stateRef.current;
      const inp = inputRef.current;

      // Check for Act transition
      checkActTransition(gs);

      // Physics
      updateBike(gs.player, inp);
      checkCollisions(gs.player, WORLD_SIZE);

      // NPC interaction (Act 1 or Act 2)
      if (inp.action) {
        for (const ent of gs.entities) {
          const dx = ent.pos.x - gs.player.pos.x;
          const dy = ent.pos.y - gs.player.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 60 && ent.meta?.dialog) {
            // Mission Logic - Act 1
            if (gs.act === 1) {
              if (ent.id === 'camille' && gs.missionStatus === 'pending') {
                gs.missionStatus = 'active';
                gs.missionData.flyersToDistribute = 5;
                setDialog({ name: ent.meta.name, text: "Tiens, prends ces 5 tracts. Distribue-les aux gens dans le centre-ville (à l'ouest) !" });
              } else if (gs.missionStatus === 'active' && gs.missionData.flyersToDistribute > 0) {
                if (!gs.missionData.targetNPCs.includes(ent.id) && ent.id !== 'camille' && ent.id !== 'zadiste1') {
                  gs.missionData.targetNPCs.push(ent.id);
                  gs.missionData.flyersToDistribute--;
                  gs.missionData.flyersDistributed++;
                  gs.karma += 5;
                  setDialog({ name: ent.meta.name, text: "Ah, merci ! Je vais lire ça." });
                  if (gs.missionData.flyersDistributed >= 3) {
                    gs.missionStatus = 'completed';
                    setDialog({ name: "Mission accomplie", text: "Tu as sensibiliser assez de gens ! Retourne voir Camille." });
                  }
                } else if (ent.id === 'camille' && gs.missionStatus === 'completed') {
                   setDialog({ name: 'Camille', text: `Super boulot ${character.name} ! On commence à se faire entendre. Prépare-toi pour la Suite...` });
                   gs.karma += 10;
                } else {
                   setDialog({ name: ent.meta.name, text: ent.meta.dialog });
                }
              } else {
                setDialog({ name: ent.meta.name, text: ent.meta.dialog });
              }
            }
            // Mission Logic - Act 2
            else if (gs.act === 2) {
              // Get potatoes from Michel
              if (ent.id === 'maraicher' && !gs.missionData.hasPotatoes && gs.missionStatus === 'pending') {
                gs.missionStatus = 'active';
                gs.missionData.hasPotatoes = true;
                setDialog({ name: ent.meta.name, text: "Tiens, une poche de patates bio ! Lance-les sur les machines. Clique sur ESPACE quand tu es assez proche !" });
              }
              // Sabotage machines
              else if (ent.id.startsWith('machine') && gs.missionData.hasPotatoes && gs.missionStatus === 'active') {
                if (ent.health > 0) {
                  ent.health = 0;
                  gs.missionData.machinesSabotaged++;
                  gs.karma += 15;
                  setDialog({ name: ent.meta.name, text: "BOUM ! Une machine de moins !" });
                  if (gs.missionData.machinesSabotaged >= gs.missionData.machinesTotal) {
                    gs.missionStatus = 'completed';
                    setDialog({ name: "CHANTIER SABOTÉ !", text: "Les travailleurs rentrent chez eux. Va annoncer la nouvelle aux Vaîtes !" });
                  }
                } else {
                  setDialog({ name: ent.meta.name, text: "Cette machine est déjà hors service." });
                }
              }
              // Hack computer after sabotage
              else if (ent.id === 'container-pc' && gs.missionData.computerHacked === false && gs.missionData.machinesSabotaged >= 3) {
                gs.missionData.computerHacked = true;
                gs.karma += 20;
                setDialog({ name: 'PIRATAGE', text: "BOOM! J'ai supprimé les plans du chantier ! Les election approchent..." });
                if (gs.missionData.machinesSabotaged >= 3 && gs.missionData.computerHacked) {
                  gs.missionStatus = 'completed';
                  setDialog({ name: 'MISSION COMPLÈTE!', text: 'Le chantier est paralisé! Retourne aux Vaites pour fêter ça!' });
                }
              }
              else {
                setDialog({ name: ent.meta.name, text: ent.meta.dialog });
              }
            }
            // Act 3 - Election
            else if (gs.act === 3) {
              // Vote at the urn
              if (ent.id === 'urne' && !gs.missionData.hasVoted) {
                gs.missionStatus = 'active';
                gs.missionData.hasVoted = true;
                
                // Determine ending based on karma
                if (gs.karma >= 30) {
                  // Good ending - eco wins
                  gs.missionData.finalChoice = 'eco';
                  gs.karma += 50;
                  setShowEnding({
                    type: 'good',
                    title: 'VICTOIRE ÉCOLOGIQUE !',
                    text: 'La liste verte l\'emporte aux élections ! Les Vaîtes sont sauvegardées. Tu es devenu une légende locale. Besançon te remercie.'
                  });
                } else if (gs.karma <= -20) {
                  // Bad ending - beton wins
                  gs.missionData.finalChoice = 'boycott';
                  setShowEnding({
                    type: 'bad',
                    title: 'DÉFAITE...',
                    text: 'Le promoteur l\'emporte. Les Vaêtes seront bétonnées. Mais la lutte continue dans l\'ombre...'
                  });
                } else {
                  // Mixed ending
                  gs.missionData.finalChoice = 'boycott';
                  setShowEnding({
                    type: 'mixed',
                    title: 'RÉSULTATS MITIGÉS',
                    text: 'Le nouveau conseil municipal reste ambigu sur le projet. Les négociations continuent... La bataille n\'est pas terminée.'
                  });
                }
              }
              // Talk to voters to gather support before voting
              else if ((ent.id === 'electeur1' || ent.id === 'electeur2') && !gs.missionData.targetNPCs.includes(ent.id) && !gs.missionData.hasVoted) {
                gs.missionData.targetNPCs.push(ent.id);
                gs.missionData.votesGathered++;
                gs.karma += 10;
                if (gs.karma > 30) gs.karma = 30; // Cap karma
                setDialog({ name: ent.meta.name, text: "Tu m'as convaincu ! Je voterai vert !" });
              }
              // Talk to promote - lose karma
              else if (ent.id === 'promoteur' && !gs.missionData.hasVoted) {
                gs.karma -= 15;
                setDialog({ name: ent.meta.name, text: "Les écolos, c'est la fin des emplois ! Rejoignez le côté du progrès !" });
              }
              // Talk to elecopro - gain karma
              else if (ent.id === 'elecopro' && !gs.missionData.hasVoted) {
                gs.karma += 5;
                setDialog({ name: ent.meta.name, text: "Chaque voix compte ! Va voter à l'urne, on a besoin de toi !" });
              }
              // Default dialog
              else {
                setDialog({ name: ent.meta.name, text: ent.meta.dialog });
              }
            }
            
            clearTimeout(dialogTimeout.current);
            dialogTimeout.current = setTimeout(() => setDialog(null), 4000);
            inp.action = false;
            break;
          }
        }
      }

      // Render
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) renderGame(ctx, gs);

      // Update HUD
      hudTick++;
      if (hudTick % 6 === 0) {
        setHudState({
          ...gs,
          player: { ...gs.player, pos: { ...gs.player.pos }, vel: { ...gs.player.vel } },
        });
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [checkActTransition, character.name]);

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#020617' }}>
      {showAct2Intro && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer"
          style={{
            background: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%)',
          }}
          onClick={() => setShowAct2Intro(false)}
        >
          <div className="max-w-xl text-center p-12 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
              <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-16 h-1 bg-gradient-to-r from-transparent to-accent" />
                <h2 className="text-accent text-sm uppercase font-bold tracking-[0.8em]">ACTE 2</h2>
                <div className="w-16 h-1 bg-gradient-to-l from-transparent to-accent" />
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight" 
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 60px rgba(16,185,129,0.5)'
                  }}>
                LA RÉSISTANCE
              </h1>
              
              <div className="border-l-2 border-accent/50 pl-6 my-8 text-left">
                <p className="text-lg text-foreground/80 leading-relaxed mb-4 font-serif italic">
                  "Les élections approchent. Le chantier de l'éco-quartier tourne à plein régime. 
                  Les pelleteuses avalent nos terres une à une."
                </p>
                <p className="text-sm text-accent/70">
                  Le vent tourne. La résistance s'organise.
                </p>
              </div>
              
              <div className="mt-10 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Va chercher des "munitions" chez Michel le maraîcher</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <span>Sabote les machines du chantier</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '1s' }} />
                  <span>Pirate l'ordinateur du chef pour effacer les plans</span>
                </div>
              </div>
              
              <div className="mt-12">
                <p className="text-primary/60 text-xs font-mono uppercase tracking-[0.3em] animate-bounce">
                  Clique pour commencer...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showAct3Intro && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer"
          style={{
            background: 'radial-gradient(ellipse at center, #1e1b4b 0%, #020617 70%)',
          }}
          onClick={() => setShowAct3Intro(false)}
        >
          <div className="max-w-xl text-center p-12">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent to-amber-500" />
              <h2 className="text-amber-500 text-sm uppercase font-bold tracking-[0.8em]">ACTE 3</h2>
              <div className="w-16 h-1 bg-gradient-to-l from-transparent to-amber-500" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-amber-500">
              LES ÉLECTIONS
            </h1>
            
            <p className="text-lg text-foreground/80 leading-relaxed mb-6 font-serif italic">
              "C'est le jour J. Le promoteur affronte la liste écologiste. 
              Ton karma déterminera l'issue de cette election..."
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Rends-toi au bureau de vote (sud-ouest)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span>Convaincs les &eacute;lectrices et &eacute;lecteurs ind&eacute;cis</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '1s' }} />
                <span>Fais pencher la balance pour ton camp !</span>
              </div>
            </div>
            
            <div className="mt-10 p-5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-500/80 text-xs font-mono mb-2">STATUT DU KARMA</p>
              <p className="text-foreground text-sm">
                Ton karma actuel: <span className="font-bold text-primary">{initialState.karma}</span>
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                Karma &gt; 30: Victoire &eacute;colo | Karma &lt; -20: D&eacute;faite
              </p>
            </div>
            
            <div className="mt-12">
              <p className="text-amber-500/60 text-xs font-mono uppercase tracking-[0.3em] animate-bounce">
                Clique pour voter...
              </p>
            </div>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} className="pixel-art block" />
      <Hud state={hudState} />
      {/* Character badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 border border-primary/30 px-3 py-1 pixel-corners">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: character.color }} />
        <span className="text-[10px] uppercase font-bold tracking-widest text-primary">{character.name}</span>
      </div>

      {dialog && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 max-w-lg w-full px-4 animate-fade-in pointer-events-none">
          <div className="bg-background/90 border-2 border-accent/40 p-5 font-mono backdrop-blur-sm">
            <p className="text-accent text-xs uppercase font-bold mb-2 tracking-widest">{dialog.name}</p>
            <p className="text-foreground text-sm leading-relaxed">{dialog.text}</p>
          </div>
        </div>
      )}

      {/* Ending Screen */}
      {showEnding && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{
            background: showEnding.type === 'good' 
              ? 'radial-gradient(ellipse at center, #052e16 0%, #020617 70%)'
              : showEnding.type === 'bad'
              ? 'radial-gradient(ellipse at center, #450a0a 0%, #020617 70%)'
              : 'radial-gradient(ellipse at center, #1e1b4b 0%, #020617 70%)',
          }}
        >
          <div className="max-w-xl text-center p-12">
            <div className="mb-8">
              {showEnding.type === 'good' && (
                <div className="text-6xl mb-4">🌳</div>
              )}
              {showEnding.type === 'bad' && (
                <div className="text-6xl mb-4">🏚️</div>
              )}
              {showEnding.type === 'mixed' && (
                <div className="text-6xl mb-4">⚖️</div>
              )}
            </div>
            
            <h1 className={`text-5xl md:text-6xl font-black mb-6 tracking-tight ${
              showEnding.type === 'good' ? 'text-green-500' : 
              showEnding.type === 'bad' ? 'text-red-500' : 'text-amber-500'
            }`}>
              {showEnding.title}
            </h1>
            
            <p className="text-lg text-foreground/80 leading-relaxed mb-8 font-serif italic">
              {showEnding.text}
            </p>
            
            <div className="p-6 bg-background/50 border border-amber-500/30 rounded-lg mb-8">
              <p className="text-muted-foreground text-sm mb-2">KARMA FINAL</p>
              <p className="text-3xl font-bold text-primary">{hudState.karma}</p>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-primary text-white font-bold rounded hover:bg-primary/80 transition-colors"
              >
                Rejouer
              </button>
              <p className="text-muted-foreground text-xs">
                Merci d'avoir jou&eacute; &agrave; GTB: Grand Theft Bike !
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
