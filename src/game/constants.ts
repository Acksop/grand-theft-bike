import { GameState, InputState } from './types';
import { CharacterType } from '../App';
import { WORLD_SIZE } from './world';

export const KEY_MAP: Record<string, keyof InputState> = {
  z: 'up', ArrowUp: 'up',
  s: 'down', ArrowDown: 'down',
  q: 'left', ArrowLeft: 'left',
  d: 'right', ArrowRight: 'right',
  ' ': 'action',
};

export const getInitialGameState = (character: CharacterType): GameState => ({
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
    meta: { 
      characterId: character.id, 
      speedMultiplier: character.stats.speed, 
      spriteUrl: character.imageUrl 
    }
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
      meta: { 
        name: 'Camille', 
        dialog: `${character.name} ! Les pelleteuses arrivent demain. On doit mobiliser le quartier avant que la mairie ne transforme nos jardins en parking 'eco-concu'. Prends ces tracts !`,
        spriteUrl: 'https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FUZQ9Vyz8TgXm8l5Oq425336AyOB3%2F442f5f4a097a0c07d4390734376e02ff__19c9aebf.webp?alt=media&token=e3601175-de8c-453c-abe9-1d6ab037409b'
      }
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
      meta: { name: 'La Mairesse', dialog: "Notre projet est 100% durable. On a même mis une jardinière sur le toit du transformateur électrique. Quoi ? Des arbres ? On a du Wi-Fi 6 partout, c'est mieux !" }
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
      meta: { 
        name: 'Sam (Brocanteur)', 
        dialog: "Le progrès... Avant, on réparait les vélos. Maintenant, on télécharge une application pour louer une trottinette qui finira dans le Doubs en trois jours. Belle époque !",
        spriteUrl: 'https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FUZQ9Vyz8TgXm8l5Oq425336AyOB3%2Fsam__41b5425c.png?alt=media&token=5ecfd3c1-6da8-4fa6-a53d-fad041e9c543'
      }
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
      meta: { name: 'Zadiste', dialog: "J'ai lu dans un thread que le béton de l'éco-quartier contient des puces 5G pour contrôler nos pensées... ou alors c'est juste super moche. Dans les deux cas, on reste !" }
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
      meta: { name: 'Passant', dialog: "Je suis pour l'écologie, mais si je ne peux plus garer mon SUV de 2 tonnes devant ma boulangerie bio, c'est la dictature !" }
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
      meta: { name: 'Passant', dialog: "Un éco-quartier ? Tant que ça augmente la valeur de mon studio de 9m² loué 800€, je signe où ?" }
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
    fountainHacked: false,
    driveHacked: false,
    glassesCollected: 0,
    glassesTotal: 10,
    waterRedirected: false,
    waterWasted: 0,
  },
  worldSize: WORLD_SIZE,
  isPaused: false,
  lastInteractionTime: 0,
});
