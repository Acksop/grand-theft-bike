import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GameState, InputState } from '../../game/types';
import { updateBike, checkCollisions } from '../../game/engine';
import { renderGame } from '../../game/renderer';
import { WORLD_SIZE } from '../../game/world';
import Hud from '../ui/Hud';
import AudioController from './AudioController';
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
    isOnBike: true,
    missionData: {
      flyersToDistribute: 0,
      flyersDistributed: 0,
      targetNPCs: [],
      machinesSabotaged: 0,
      machinesTotal: 3,
      hasPotatoes: false,
      computerHacked: false,
      // Act 6 init
      fountainHacked: false,
      driveHacked: false,
      glassesCollected: 0,
      glassesTotal: 10,
      waterRedirected: false,
      waterWasted: 0,
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
  const [showAct4Intro, setShowAct4Intro] = useState(false);
  const [showAct5Intro, setShowAct5Intro] = useState(false);
  const [showAct6Intro, setShowAct6Intro] = useState(false);
  const [showHackPuzzle, setShowHackPuzzle] = useState(false);
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

      // Physics - pass isOnBike to determine movement mode
      updateBike(gs.player, inp, gs.isOnBike);
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
              // Vote at the urn - transitions to Act 4 RSE Workshop
              if (ent.id === 'urne' && !gs.missionData.hasVoted) {
                gs.missionStatus = 'active';
                gs.missionData.hasVoted = true;
                
                // Store election result
                if (gs.karma >= 30) {
                  gs.missionData.finalChoice = 'eco';
                  gs.karma += 50;
                } else if (gs.karma <= -20) {
                  gs.missionData.finalChoice = 'boycott';
                } else {
                  gs.missionData.finalChoice = 'boycott';
                }
                
                // Transition to Act 4 - RSE Workshop (instead of ending)
                setTimeout(() => {
                  gs.act = 4;
                  gs.missionId = 'rse-workshop';
                  gs.missionStatus = 'pending';
                  gs.isOnBike = false; // Player is on foot in the workshop
                  gs.missionData = {
                    ...gs.missionData,
                    cupsCollected: 0,
                    cupsTotal: 5,
                    hasCoffeeAccepted: false,
                    workshopSabotaged: false,
                    hasTrophy: false,
                    workshopChoice: null,
                    targetNPCs: []
                  };
                  
                  // Add RSE Workshop area - new location
                  gs.player.pos = { x: 1500, y: 800 };
                  
                  // Add RSE Workshop NPCs
                  gs.entities = [
                    { id: 'formateur-rse', type: 'npc', pos: { x: 1550, y: 750 }, vel: { x: 0, y: 0 }, angle: 0, size: 18, color: '#0ea5e9', health: 100, maxHealth: 100, meta: { name: 'Formateur RSE', dialog: 'Bienvenue a notre atelier eco-responsable ! Nous servons le cafe dans des gobelets recyclables. Enfin... recyclables a 50% !' }},
                    { id: 'participant1', type: 'npc', pos: { x: 1400, y: 800 }, vel: { x: 0, y: 0 }, angle: 0, size: 16, color: '#a855f7', health: 100, maxHealth: 100, meta: { name: 'Responsable RH', dialog: 'C\'est vrai que les gobelets sont jetables, mais on compense avec des formations !' }},
                    { id: 'participant2', type: 'npc', pos: { x: 1450, y: 850 }, vel: { x: 0, y: 0 }, angle: 0, size: 15, color: '#f97316', health: 100, maxHealth: 100, meta: { name: 'Cadre', dialog: 'Je trouve ca un peu hypocrite moi aussi...' }},
                    { id: 'participant3', type: 'npc', pos: { x: 1600, y: 800 }, vel: { x: 0, y: 0 }, angle: 0, size: 16, color: '#14b8a6', health: 100, maxHealth: 100, meta: { name: 'Stagiaire', dialog: 'C\'est mon troisieme atelier RSE cette semaine. On ne fait que parler...' }},
                    { id: 'machine-cafe', type: 'prop', pos: { x: 1500, y: 700 }, vel: { x: 0, y: 0 }, angle: 0, size: 25, color: '#78716c', health: 100, maxHealth: 100, meta: { name: 'Machine a cafe', dialog: 'Une machine a cafe pro. Vous voulez un cafe ?' }},
                    { id: 'gobelet1', type: 'prop', pos: { x: 1350, y: 780 }, vel: { x: 0, y: 0 }, angle: 0, size: 8, color: '#fef3c7', health: 100, maxHealth: 100, meta: { name: 'Gobelet', dialog: 'Un gobelet jetable. "eco-concu" selon l\'etiquette.' }},
                    { id: 'gobelet2', type: 'prop', pos: { x: 1650, y: 820 }, vel: { x: 0, y: 0 }, angle: 0, size: 8, color: '#fef3c7', health: 100, maxHealth: 100, meta: { name: 'Gobelet', dialog: 'Encore un gobelet.' }},
                    { id: 'gobelet3', type: 'prop', pos: { x: 1420, y: 900 }, vel: { x: 0, y: 0 }, angle: 0, size: 8, color: '#fef3c7', health: 100, maxHealth: 100, meta: { name: 'Gobelet', dialog: 'Celui-ci est a moitie vide.' }},
                    { id: 'gobelet4', type: 'prop', pos: { x: 1580, y: 880 }, vel: { x: 0, y: 0 }, angle: 0, size: 8, color: '#fef3c7', health: 100, maxHealth: 100, meta: { name: 'Gobelet', dialog: 'Un gobelet abandonne. Symbole de l\'eco-hypocrisie.' }},
                    { id: 'gobelet5', type: 'prop', pos: { x: 1500, y: 920 }, vel: { x: 0, y: 0 }, angle: 0, size: 8, color: '#fef3c7', health: 100, maxHealth: 100, meta: { name: 'Gobelet', dialog: 'Le dernier gobelet. Prenez-le comme trophee !' }},
                  ];
                  
                  setShowAct4Intro(true);
                }, 1500);
                
                setDialog({ name: 'VOTE ENREGISTRE', text: 'Apres les elections, direction un atelier RSE suspect...' });
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
            
            // Act 4 - RSE Workshop
            else if (gs.act === 4) {
              // Collect cups
              if (ent.id.startsWith('gobelet') && !gs.missionData.targetNPCs.includes(ent.id)) {
                gs.missionData.targetNPCs.push(ent.id);
                gs.missionData.cupsCollected++;
                gs.karma += 3;
                setDialog({ name: 'TROPHEE', text: 'Un gobelet de plus ! Preuve de l\'eco-hypocrisie.' });
                if (gs.missionData.cupsCollected >= gs.missionData.cupsTotal) {
                  gs.missionData.hasTrophy = true;
                }
              }
              // Accept coffee from machine
              else if (ent.id === 'machine-cafe' && !gs.missionData.hasCoffeeAccepted) {
                gs.missionData.hasCoffeeAccepted = true;
                gs.karma -= 10;
                gs.missionData.workshopChoice = 'accept';
                setDialog({ name: 'Machine a cafe', text: '*Sirop amer* Vous acceptez le cafe. -10 karma. L\'eco-hypocrisie vous gagne...' });
              }
              // Interrogate trainer
              else if (ent.id === 'formateur-rse' && gs.missionStatus === 'pending') {
                gs.missionStatus = 'active';
                setDialog({ name: ent.meta.name, text: 'Alors, que pensez-vous de notre atelier eco-responsable ?' });
              }
              // Denounce the hypocrisy
              else if (ent.id === 'formateur-rse' && gs.missionStatus === 'active' && gs.missionData.workshopChoice === null) {
                gs.missionData.workshopChoice = 'denounce';
                gs.karma += 25;
                setDialog({ name: 'DENONCIATION', text: '"UN DETAIL ? HYPOCRISIE ! Vous servez du cafe dans des gobelets jetables en vantant l\'eco-responsabilite ! C\'est du greenwashing pur !" *Les participants reagissent*' });
              }
              // Talk to participant who agrees
              else if (ent.id === 'participant2' && gs.missionData.workshopChoice === 'denounce') {
                gs.karma += 5;
                setDialog({ name: ent.meta.name, text: 'Enfin quelqu\'un qui dit la verite ! Je suis d\'accord avec vous a 100%.' });
              }
              // Sabotage option - flip cups
              else if (ent.id === 'machine-cafe' && gs.missionData.workshopChoice === 'denounce' && !gs.missionData.workshopSabotaged) {
                gs.missionData.workshopSabotaged = true;
                gs.missionData.workshopChoice = 'sabotage';
                gs.karma += 15;
                setDialog({ name: 'SABOTAGE', text: '*Vous renversez la machine a cafe !* CRASH ! Les gobelets volent partout ! Le formateur est horror...' });
              }
              // Complete workshop mission
              else if ((ent.id === 'participant3' || ent.id === 'formateur-rse') && gs.missionStatus === 'active' && (gs.missionData.hasTrophy || gs.missionData.workshopChoice !== null)) {
                gs.missionStatus = 'completed';
                
                // Transition to Act 5 instead of ending
                setTimeout(() => {
                  setShowAct5Intro(true);
                  gs.act = 5;
                  gs.missionStatus = 'pending';
                  gs.isOnBike = true; // Back on bike for Act 5
                  gs.missionData = {
                    ...gs.missionData,
                    flyersToDistribute: 0,
                    flyersDistributed: 0,
                    targetNPCs: [],
                    machinesSabotaged: 0,
                    machinesTotal: 0,
                    hasPotatoes: false,
                    computerHacked: false,
                    votesGathered: 0,
                    votesNeeded: 0,
                    hasVoted: false,
                    finalChoice: null,
                    cupsCollected: 0,
                    cupsTotal: 0,
                    hasCoffeeAccepted: false,
                    workshopSabotaged: false,
                    hasTrophy: false,
                    workshopChoice: null,
                    // Act 5 init
                    projectilesThrown: 0,
                    targetsHit: 0,
                    hasPotatoesForAct5: true, // Start with potatoes!
                    graffitiDone: 0,
                    graffitiTotal: 3,
                    screenHacked: false,
                    vehiclesSabotaged: 0,
                    vehiclesTotal: 3,
                    presentationSabotaged: false,
                    finalAct5Choice: null,
                  };
                  
                  // Add Act 5 entities
                  gs.entities = [
                    // Player starts at entrance
                    { ...gs.player, pos: { x: 400, y: 500 }, vel: { x: 0, y: 0 }, angle: -Math.PI/2 },
                    // Promoter - giving presentation
                    { id: 'promoteur', type: 'npc' as const, pos: { x: 400, y: 200 }, vel: { x: 0, y: 0 }, angle: 0, size: 24, color: '#1e3a5f', health: 100, maxHealth: 100, meta: { name: 'M. Gros-Portefeuille', dialog: 'Mesdames et messieurs, cet eco-quartier est une revolution durable ! 600 logements, tram, panneaux solaires...', type: 'promoter' }},
                    // Engineers
                    { id: 'ingenieur1', type: 'npc' as const, pos: { x: 300, y: 250 }, vel: { x: 0, y: 0 }, angle: 0, size: 20, color: '#64748b', health: 100, maxHealth: 100, meta: { name: 'Ingenieur 1', dialog: 'Les calculs sont faits, ca tient debout. C\'est tout ce qui compte.', type: 'engineer' }},
                    { id: 'ingenieur2', type: 'npc' as const, pos: { x: 500, y: 250 }, vel: { x: 0, y: 0 }, angle: 0, size: 20, color: '#64748b', health: 100, maxHealth: 100, meta: { name: 'Ingenieur 2', dialog: 'Je prefere ne pas penser aux consequences environnementales...', type: 'engineer' }},
                    // Workers
                    { id: 'ouvrier1', type: 'npc' as const, pos: { x: 200, y: 400 }, vel: { x: 0, y: 0 }, angle: 0, size: 18, color: '#b45309', health: 100, maxHealth: 100, meta: { name: 'Ouvrier', dialog: 'On nous a dit eco, mais regarde ca... tout ce beton.', type: 'worker' }},
                    { id: 'ouvrier2', type: 'npc' as const, pos: { x: 600, y: 400 }, vel: { x: 0, y: 0 }, angle: 0, size: 18, color: '#b45309', health: 100, maxHealth: 100, meta: { name: 'Ouvrier', dialog: 'Ca fait 20 ans que je bosse sur les chantiers, ca change pas.', type: 'worker' }},
                    // Construction vehicles
                    { id: 'pelleteuse1', type: 'prop' as const, pos: { x: 150, y: 350 }, vel: { x: 0, y: 0 }, angle: 0, size: 40, color: '#f59e0b', health: 100, maxHealth: 100, meta: { name: 'Pelleteuse', dialog: 'Une pelleteuse... symbolique du demolisseur.', type: 'vehicle', sabotaged: false }},
                    { id: 'pelleteuse2', type: 'prop' as const, pos: { x: 650, y: 350 }, vel: { x: 0, y: 0 }, angle: 0, size: 40, color: '#f59e0b', health: 100, maxHealth: 100, meta: { name: 'Pelleteuse', dialog: 'Une autre pelleteuse... en attente de destruction.', type: 'vehicle', sabotaged: false }},
                    { id: 'grue', type: 'prop' as const, pos: { x: 400, y: 100 }, vel: { x: 0, y: 0 }, angle: 0, size: 50, color: '#ef4444', health: 100, maxHealth: 100, meta: { name: 'Grue', dialog: 'La grue dominate le chantier. Detruisez-la !', type: 'vehicle', sabotaged: false }},
                    // Presentation screen
                    { id: 'ecran-pres', type: 'prop' as const, pos: { x: 400, y: 150 }, vel: { x: 0, y: 0 }, angle: 0, size: 60, color: '#3b82f6', health: 100, maxHealth: 100, meta: { name: 'Ecran de presentation', dialog: 'Un ecran affichant les plans de l\'eco-quartier. hackable !', type: 'screen', hacked: false }},
                    // Graffiti spots
                    { id: 'mur1', type: 'prop' as const, pos: { x: 100, y: 300 }, vel: { x: 0, y: 0 }, angle: 0, size: 30, color: '#4b5563', health: 100, maxHealth: 100, meta: { name: 'Mur', dialog: 'Un mur parfait pour un tag ZAD ! Appuyez sur ESPACE pour graffer.', type: 'graffiti-spot', graffed: false }},
                    { id: 'mur2', type: 'prop' as const, pos: { x: 700, y: 300 }, vel: { x: 0, y: 0 }, angle: 0, size: 30, color: '#4b5563', health: 100, maxHealth: 100, meta: { name: 'Mur', dialog: 'Un autre mur pour taguer !', type: 'graffiti-spot', graffed: false }},
                    { id: 'banniere', type: 'prop' as const, pos: { x: 250, y: 180 }, vel: { x: 0, y: 0 }, angle: 0, size: 40, color: '#22c55e', health: 100, maxHealth: 100, meta: { name: 'Banniere', dialog: 'La banniere du chantier. Parfaite pour un tag !', type: 'graffiti-spot', graffed: false }},
                    // Potatoes source (ammo)
                    { id: 'caisse-patates', type: 'prop' as const, pos: { x: 700, y: 500 }, vel: { x: 0, y: 0 }, angle: 0, size: 25, color: '#84cc16', health: 100, maxHealth: 100, meta: { name: 'Caisse de patates', dialog: 'Des patates bio ! Vos munitions pour le sabotage ! Appuyez sur ESPACE pour lancer.', type: 'ammo', ammo: 10 }},
                    // Camille at the bottom - final narrative trigger
                    { id: 'camille-act5', type: 'npc' as const, pos: { x: 400, y: 570 }, vel: { x: 0, y: 0 }, angle: 0, size: 16, color: '#ec4899', health: 100, maxHealth: 100, meta: { name: 'Camille', dialog: 'On est la ! Toute la ZAD est derriere toi. C\'est le moment de tout donner !', type: 'ally', spoken: false }},
                  ];
                  gs.worldSize = { x: 800, y: 600 };
                }, 2000);
              }
              // Default dialog
              else {
                setDialog({ name: ent.meta.name, text: ent.meta.dialog });
              }
            }
            
            // Act 5 - Chantier Écocide
            else if (gs.act === 5) {
              // Talk to promoter
              if (ent.id === 'promoteur' && gs.missionStatus === 'pending') {
                gs.missionStatus = 'active';
                const charDialog = character.name === 'Léo' 
                  ? '"Durable mon cul ! Vous betonnez mes patates !"'
                  : character.name === 'Sarah'
                  ? '"Panneaux solaires sur PC jetables chaque annee ?"'
                  : '"Eco-quartier = Zone A Detruire"';
                setDialog({ name: character.name, text: charDialog });
              }
              // Get more potatoes
              else if (ent.id === 'caisse-patates') {
                gs.missionData.hasPotatoesForAct5 = true;
                setDialog({ name: 'Caisse de patates', text: 'Vous prenez des patates bio. Appuyez sur ESPACE pres d\'une cible pour lancer !' });
              }
              // Throw potato at target
              else if (ent.meta.type === 'vehicle' && gs.missionData.hasPotatoesForAct5 && !ent.meta.sabotaged) {
                gs.missionData.projectilesThrown++;
                gs.missionData.targetsHit++;
                gs.missionData.vehiclesSabotaged++;
                ent.meta.sabotaged = true;
                gs.karma += 15;
                gs.missionData.presentationSabotaged = true;
                gs.missionData.finalAct5Choice = 'patate';
                ent.color = '#1f2937'; // Darker when sabotaged
                setDialog({ name: 'SABOTAGE !', text: '*PATATE BIO !* Elle explose sur la machine ! Le promoteur hurle ! +15 karma' });
              }
              // Throw potato at promoter
              else if (ent.id === 'promoteur' && gs.missionData.hasPotatoesForAct5) {
                gs.missionData.projectilesThrown++;
                gs.missionData.targetsHit++;
                gs.karma += 20;
                gs.missionData.presentationSabotaged = true;
                gs.missionData.finalAct5Choice = 'patate';
                setDialog({ name: 'DIRECT !', text: '*SPLAT !* La patate atteint le promoteur en costard ! "MES VETEMENTS !" Le public acclame ! +20 karma' });
              }
              // Graffiti on walls/banners
              else if (ent.meta.type === 'graffiti-spot' && !ent.meta.graffed && gs.missionStatus === 'active') {
                ent.meta.graffed = true;
                gs.missionData.graffitiDone++;
                gs.karma += 10;
                gs.missionData.presentationSabotaged = true;
                gs.missionData.finalAct5Choice = 'graffiti';
                ent.color = '#ec4899'; // Pink for graffiti
                setDialog({ name: 'TAG !', text: '*SPRAY* "ZAD" apparait sur la surface ! Les ouvriers rient. +10 karma' });
              }
              // Hack the presentation screen
              else if (ent.id === 'ecran-pres' && !ent.meta.hacked) {
                gs.missionData.screenHacked = true;
                gs.karma += 25;
                gs.missionData.presentationSabotaged = true;
                gs.missionData.finalAct5Choice = 'hack';
                ent.meta.hacked = true;
                ent.color = '#ef4444'; // Red when hacked
                setDialog({ name: 'PIRATAGE !', text: '*HACK* Les plans sont remplaces par "ZAD" ! Le promoteur panique ! +25 karma' });
              }
              // Talk to Camille at the bottom - narrative + finish trigger
              else if (ent.id === 'camille-act5') {
                if (gs.missionStatus === 'pending') {
                  setDialog({ name: 'Camille', text: 'Parle au promoteur d\'abord pour lancer le sabotage !' });
                } else if (gs.missionStatus === 'active' && !gs.missionData.presentationSabotaged) {
                  const hint = gs.missionData.hasPotatoesForAct5
                    ? 'Lance tes patates sur les machines ou le promoteur ! Tague les murs ! Pirate l\'ecran !'
                    : 'Va chercher la caisse de patates en haut a droite, ou tague les murs !';
                  setDialog({ name: 'Camille', text: hint });
                } else if (gs.missionStatus === 'active' && gs.missionData.presentationSabotaged) {
                  // Trigger the ending via Camille
                  gs.missionStatus = 'completed';
                  const karma = gs.karma;
                  const graffitiDone = gs.missionData.graffitiDone;
                  const vehiclesSabotaged = gs.missionData.vehiclesSabotaged;
                  const screenHacked = gs.missionData.screenHacked;
                  const choice = gs.missionData.finalAct5Choice;

                  // Rich epilogue text based on actions
                  let epilogue = '';
                  if (screenHacked && vehiclesSabotaged >= 2 && graffitiDone >= 2) {
                    epilogue = 'Camille : "Tu as tout fait ! L\'ecran hacke, les machines sabotees, les murs tagges... Le promoteur a file sans demander son reste. Les Vaites restent !"';
                  } else if (choice === 'hack') {
                    epilogue = 'Camille : "Pirater l\'ecran c\'etait du genie ! Le public a tout vu. La presse a filme. Le chantier est suspendu 6 mois !"';
                  } else if (choice === 'patate') {
                    epilogue = 'Camille : "La patate dans le costard... une image qui va faire le tour de Besancon ! Le promoteur est la risee de la ville. On a gagne du temps !"';
                  } else if (choice === 'graffiti') {
                    epilogue = 'Camille : "Nos tags ZAD couvrent tout le chantier. La mairie ne peut plus ignorer notre message. La lutte continue !"';
                  } else {
                    epilogue = 'Camille : "C\'est un debut. Le chantier est perturbe. Maintenant on rentre et on planifie la suite."';
                  }
                  setDialog({ name: 'Camille', text: epilogue });

                  setTimeout(() => {
                    // Transition to Act 6 instead of showing ending directly
                    gs.act = 6;
                    gs.missionId = 'fontaine';
                    gs.missionStatus = 'pending';
                    gs.player.pos = { x: 500, y: 1800 }; // Place Granvelle
                    setShowAct6Intro(true);
                    
                    gs.entities = [
                      { id: 'fontaine', type: 'prop', pos: { x: 500, y: 1700 }, vel: { x: 0, y: 0 }, angle: 0, size: 60, color: '#3b82f6', health: 100, maxHealth: 100, meta: { name: 'Fontaine High-Tech', dialog: 'Une fontaine connectee qui brille... et gaspille des litres d\'eau en pleine secheresse.', type: 'fountain', hacked: false }},
                      { id: 'burger-fluo', type: 'prop', pos: { x: 700, y: 1750 }, vel: { x: 0, y: 0 }, angle: 0, size: 80, color: '#f472b6', health: 100, maxHealth: 100, meta: { name: 'Burger Fluo', dialog: 'Fast-food voisin. Ca sent la frite et le plastique.', type: 'restaurant' }},
                      { id: 'drive-ecran', type: 'prop', pos: { x: 750, y: 1850 }, vel: { x: 0, y: 0 }, angle: 0, size: 40, color: '#4ade80', health: 100, maxHealth: 100, meta: { name: 'Ecran Drive', dialog: 'L\'ecran de commande. On peut y lire : "PLUS DE GLACONS POUR VOS SODAS !"', type: 'drive-screen', hacked: false }},
                      { id: 'jardin-commu', type: 'prop', pos: { x: 300, y: 1850 }, vel: { x: 0, y: 0 }, angle: 0, size: 100, color: '#166534', health: 100, maxHealth: 100, meta: { name: 'Jardin Communautaire', dialog: 'Les plantes tirent la langue. Elles ont besoin d\'eau !', type: 'garden' }},
                      // Act 6 NPCs
                      { id: 'manager-burger', type: 'npc', pos: { x: 650, y: 1780 }, vel: { x: 0, y: 0 }, angle: 0, size: 18, color: '#ef4444', health: 100, maxHealth: 100, meta: { name: 'Manager Fluo', dialog: 'C\'est la catastrophe ! Sans glacons, les clients s\'en vont ! On veut de l\'eau !' }},
                      { id: 'client-soiffe', type: 'npc', pos: { x: 720, y: 1900 }, vel: { x: 0, y: 0 }, angle: 0, size: 16, color: '#94a3b8', health: 100, maxHealth: 100, meta: { name: 'Client Drive', dialog: 'Je paie mon menu XL, je veux mes glacons !' }},
                      { id: 'zadiste-granvelle', type: 'npc', pos: { x: 450, y: 1750 }, vel: { x: 0, y: 0 }, angle: 0, size: 16, color: '#ec4899', health: 100, maxHealth: 100, meta: { name: 'Zadiste', dialog: 'Détourne cette eau vers le jardin ! C\'est un crime de la gacher ici.' }},
                      { id: 'verre1', type: 'prop', pos: { x: 550, y: 1720 }, vel: { x: 0, y: 0 }, angle: 0, size: 10, color: '#93c5fd', health: 100, maxHealth: 100, meta: { name: 'Verre d\'eau', type: 'glass' }},
                      { id: 'verre2', type: 'prop', pos: { x: 480, y: 1680 }, vel: { x: 0, y: 0 }, angle: 0, size: 10, color: '#93c5fd', health: 100, maxHealth: 100, meta: { name: 'Verre d\'eau', type: 'glass' }},
                      { id: 'verre3', type: 'prop', pos: { x: 520, y: 1750 }, vel: { x: 0, y: 0 }, angle: 0, size: 10, color: '#93c5fd', health: 100, maxHealth: 100, meta: { name: 'Verre d\'eau', type: 'glass' }},
                    ];
                    gs.worldSize = { x: 1000, y: 2000 };
                  }, 4500);
                } else {
                  setDialog({ name: 'Camille', text: 'On a fait ce qu\'on pouvait. La lutte continue, toujours.' });
                }
              }
              // Talk to workers - get info
              else if ((ent.id === 'ouvrier1' || ent.id === 'ouvrier2') && gs.missionStatus === 'active') {
                setDialog({ name: ent.meta.name, text: ent.meta.dialog });
              }
              // Talk to engineers
              else if (ent.id.startsWith('ingenieur') && gs.missionStatus === 'active') {
                setDialog({ name: ent.meta.name, text: ent.meta.dialog });
              }
              // Complete Act 5 mission - via promoteur directly
              else if (ent.id === 'promoteur' && gs.missionStatus === 'active' && gs.missionData.presentationSabotaged) {
                gs.missionStatus = 'completed';
                gs.missionData.finalAct5Choice = gs.missionData.finalAct5Choice || 'graffiti';
                
                setTimeout(() => {
                  gs.act = 6;
                  gs.missionId = 'fontaine';
                  gs.missionStatus = 'pending';
                  gs.player.pos = { x: 500, y: 1800 }; 
                  setShowAct6Intro(true);
                  // Entities reset for Act 6 handled in setTimeout above
                }, 2000);
              }
              // Default dialog
              else {
                setDialog({ name: ent.meta.name, text: ent.meta.dialog });
              }
            }
            // Act 6 - Fontaine Granvelle
            else if (gs.act === 6) {
              // Collect water glasses
              if (ent.meta?.type === 'glass' && !gs.missionData.targetNPCs.includes(ent.id)) {
                gs.missionData.targetNPCs.push(ent.id);
                gs.missionData.glassesCollected++;
                gs.player.meta.speedMultiplier = character.stats.speed * (1 - gs.missionData.glassesCollected * 0.05); // Speed decreases
                gs.karma += 2;
                setDialog({ name: 'VERRE D\'EAU', text: 'Vous ramassez un verre d\'eau. C\'est lourd... mais precieux !' });
                if (gs.missionData.glassesCollected >= 3) {
                  setDialog({ name: 'SOIF', text: 'Vous portez beaucoup d\'eau. Allez au jardin communautaire pour la vider !' });
                }
              }
              // Empty glasses at community garden
              else if (ent.meta?.type === 'garden' && gs.missionData.glassesCollected > 0) {
                gs.karma += gs.missionData.glassesCollected * 5;
                setDialog({ name: 'JARDIN', text: `Vous arrosez les plantes avec ${gs.missionData.glassesCollected} verres. Elles vous remercient ! +${gs.missionData.glassesCollected * 5} Karma` });
                gs.missionData.glassesCollected = 0;
                gs.player.meta.speedMultiplier = character.stats.speed; // Reset speed
                gs.missionData.waterRedirected = true;
              }
              // Hack the fountain
              else if (ent.meta?.type === 'fountain' && !gs.missionData.fountainHacked) {
                gs.missionData.fountainHacked = true;
                gs.karma += 30;
                ent.color = '#10b981'; // Green when hacked
                setDialog({ name: 'PIRATAGE FONTAINE', text: 'HACK REUSSI ! Le debit est reduit de 90%. L\'eau est detournee vers le reseau maraicher ! +30 Karma' });
              }
              // Hack the drive screen
              else if (ent.meta?.type === 'drive-screen' && !gs.missionData.driveHacked) {
                gs.missionData.driveHacked = true;
                gs.karma += 15;
                ent.color = '#ef4444'; // Red when hacked
                setDialog({ name: 'DRIVE HACK', text: 'Vous piratez l\'ecran : "PAS D\'EAU, PAS DE GLACONS ! BUVEZ DE LA BOUE !" Le manager panique ! +15 Karma' });
              }
              // Talk to manager
              else if (ent.id === 'manager-burger') {
                if (gs.missionData.driveHacked) {
                  setDialog({ name: ent.meta.name, text: 'Arretez ce piratage ! Mes clients veulent du soda glace !' });
                } else {
                  setDialog({ name: ent.meta.name, text: ent.meta.dialog });
                }
              }
              // Complete Act 6
              else if (ent.id === 'zadiste-granvelle' && gs.missionData.fountainHacked && gs.missionData.driveHacked) {
                gs.missionStatus = 'completed';
                const totalKarma = gs.karma;
                
                setDialog({ name: 'Camille', text: 'La boucle est bouclee. Besancon a choisi son camp. La ville respire enfin.' });
                
                setTimeout(() => {
                  if (totalKarma >= 120) {
                    setShowEnding({
                      type: 'good',
                      title: 'LEGENDE ECO-URBAINE',
                      text: 'Besancon est devenue la premiere ville 100% durable de France. Les Vaites sont un parc naturel, la fontaine Granvelle alimente les jardins, et le Burger Fluo sert des soupes bio. Vous etes le heros que la ville attendait.'
                    });
                  } else if (totalKarma >= 60) {
                    setShowEnding({
                      type: 'good',
                      title: 'VICTOIRE CITOYENNE',
                      text: 'Le projet d\'eco-quartier est annule. La mairie a compris le message. La lutte continue, mais aujourd\'hui, on fete la victoire !'
                    });
                  } else {
                    setShowEnding({
                      type: 'mixed',
                      title: 'UN FUTUR INCERTAIN',
                      text: 'Vous avez fait bouger les lignes, mais le beton gagne encore du terrain. La fontaine est reparee, le drive refonctionne... mais les graines de la resistance sont semees.'
                    });
                  }
                }, 3000);
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
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

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
                <span className="w-2 h-2 rounded-full bg-amber-500" />
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
      
      {showAct4Intro && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer"
          style={{
            background: 'radial-gradient(ellipse at center, #1e1b4b 0%, #020617 70%)',
          }}
          onClick={() => setShowAct4Intro(false)}
        >
          <div className="max-w-xl text-center p-12">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent to-rose-500" />
              <h2 className="text-rose-500 text-sm uppercase font-bold tracking-[0.8em]">ACTE 4</h2>
              <div className="w-16 h-1 bg-gradient-to-l from-transparent to-rose-500" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-rose-500">
              L'ATELIER RSE
            </h1>
            
            <p className="text-lg text-foreground/80 leading-relaxed mb-6 font-serif italic">
              &quot;Apr&egrave;s les &eacute;lections, un ami vous invite &agrave; un atelier &eacute;co-responsable.
              Mais quelque chose ne va pas...&quot;
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Explorez la salle et collectez les gobelets</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span>Confrontez le formateur RSE</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" style={{ animationDelay: '1s' }} />
                <span>D&eacute;noncez l'hypocrisie ou sabotez l'atelier !</span>
              </div>
            </div>
            
            <div className="mt-10 p-5 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-rose-500/80 text-xs font-mono mb-2">CONSEIL</p>
              <p className="text-foreground text-sm">
                Collectez tous les gobelets et denoncez l'eco-hypocrisie !
              </p>
            </div>
            
            <div className="mt-12">
              <p className="text-rose-500/60 text-xs font-mono uppercase tracking-[0.3em] animate-bounce">
                Cliquez pour commencer...
              </p>
            </div>
          </div>
        </div>
      )}
      
      {showAct5Intro && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer"
          style={{
            background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 70%)',
          }}
          onClick={() => setShowAct5Intro(false)}
        >
          <div className="max-w-xl text-center p-12">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent to-red-500" />
              <h2 className="text-red-500 text-sm uppercase font-bold tracking-[0.8em]">ACTE 5</h2>
              <div className="w-16 h-1 bg-gradient-to-l from-transparent to-red-500" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-red-500">
              LE CHANTIER ÉCOCIDE
            </h1>
            
            <p className="text-lg text-foreground/80 leading-relaxed mb-6 font-serif italic">
              "Le promoteur presente son 'eco-quartier'. 600 logements 'durables'. 
              Les pelleteuses sont pretes. C'est maintenant ou jamais pour saboter la presentation !"
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Lancez des patates bio sur les machines</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span>Graffez 'ZAD' sur les murs et bannieres</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '1s' }} />
                <span>Piratez l'ecran de presentation</span>
              </div>
            </div>
            
            <div className="mt-10 p-5 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-500/80 text-xs font-mono mb-2">CHOIX DU PERSONNAGE</p>
              <p className="text-foreground text-sm font-bold">
                {character.name === 'Léo' && '"Durable mon cul ! Vous betonnez mes patates !"'}
                {character.name === 'Sarah' && '"Panneaux solaires sur PC jetables ?"'}
                {character.name === 'Marc' && '"Eco-quartier = Zone A Detruire"'}
              </p>
            </div>
            
            <div className="mt-12">
              <p className="text-red-500/60 text-xs font-mono uppercase tracking-[0.3em] animate-bounce">
                Cliquez pour saboter...
              </p>
            </div>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} className="pixel-art block" />
      <AudioController characterId={character.id} />
      {showAct6Intro && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer"
          style={{
            background: 'radial-gradient(ellipse at center, #172554 0%, #020617 70%)',
          }}
          onClick={() => setShowAct6Intro(false)}
        >
          <div className="max-w-xl text-center p-12">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent to-blue-500" />
              <h2 className="text-blue-500 text-sm uppercase font-bold tracking-[0.8em]">ACTE 6</h2>
              <div className="w-16 h-1 bg-gradient-to-l from-transparent to-blue-500" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-blue-400">
              LA FONTAINE GRANVELLE
            </h1>
            
            <p className="text-lg text-foreground/80 leading-relaxed mb-6 font-serif italic">
              "La secheresse frappe Besancon. La fontaine Granvelle gaspille l'eau precieuse pour le plaisir des yeux, pendant que Burger Fluo voisin pleure ses glacons. Detournez cette eau vers ceux qui en ont vraiment besoin !"
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Piratez la fontaine pour detourner le flux</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span>Arrosez le jardin communautaire (poids augmente avec l'eau !)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '1s' }} />
                <span>Piratez l'ecran du drive de Burger Fluo</span>
              </div>
            </div>
            
            <div className="mt-10 p-5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-500/80 text-xs font-mono mb-2">INFOS MISSION</p>
              <p className="text-foreground text-sm font-bold">
                Plus vous transportez de verres d'eau, plus vous etes LENT !
              </p>
            </div>
            
            <div className="mt-12">
              <p className="text-blue-500/60 text-xs font-mono uppercase tracking-[0.3em] animate-bounce">
                Cliquez pour sauver l'eau...
              </p>
            </div>
          </div>
        </div>
      )}
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
            
            <div className="p-6 bg-background/50 border border-amber-500/30 rounded-lg mb-6">
              <p className="text-muted-foreground text-sm mb-3 uppercase tracking-widest text-xs">Bilan de mission</p>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="text-left">
                  <span className="text-muted-foreground text-xs">Karma final</span>
                  <p className="text-2xl font-bold text-primary">{hudState.karma > 0 ? '+' : ''}{hudState.karma}</p>
                </div>
                <div className="text-left">
                  <span className="text-muted-foreground text-xs">Graffitis ZAD</span>
                  <p className="text-2xl font-bold text-pink-400">{hudState.missionData.graffitiDone}</p>
                </div>
                <div className="text-left">
                  <span className="text-muted-foreground text-xs">Machines sabotées</span>
                  <p className="text-2xl font-bold text-amber-400">{hudState.missionData.vehiclesSabotaged}</p>
                </div>
                <div className="text-left">
                  <span className="text-muted-foreground text-xs">Écran piraté</span>
                  <p className="text-2xl font-bold" style={{ color: hudState.missionData.screenHacked ? '#22c55e' : '#ef4444' }}>
                    {hudState.missionData.screenHacked ? 'OUI' : 'NON'}
                  </p>
                </div>
              </div>
              {hudState.missionData.finalAct5Choice && (
                <p className="text-xs text-muted-foreground border-t border-border/30 pt-3 mt-2">
                  Action principale :{' '}
                  <span className="text-foreground font-bold uppercase tracking-wider">
                    {hudState.missionData.finalAct5Choice === 'hack' && '💻 Piratage'}
                    {hudState.missionData.finalAct5Choice === 'patate' && '🥔 Patates bio'}
                    {hudState.missionData.finalAct5Choice === 'graffiti' && '🖊️ Graffiti ZAD'}
                  </span>
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-8 py-3 font-bold rounded transition-colors text-white"
                style={{ background: showEnding.type === 'good' ? '#065f46' : showEnding.type === 'bad' ? '#7f1d1d' : '#3730a3' }}
              >
                Rejouer
              </button>
              <p className="text-muted-foreground text-xs">
                Merci d'avoir jou&eacute; &agrave; <span className="text-primary font-bold">GTB: Grand Theft Bike</span> !<br/>
                <span className="text-[10px]">Les Va&icirc;tes existent vraiment. La lutte aussi.</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
