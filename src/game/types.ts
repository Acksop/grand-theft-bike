export interface Vector2 {
  x: number;
  y: number;
}

export type EntityType = 'player' | 'npc' | 'car' | 'prop';

export interface Entity {
  id: string;
  type: EntityType;
  pos: Vector2;
  vel: Vector2;
  angle: number;
  size: number;
  color: string;
  health: number;
  maxHealth: number;
  meta?: any;
}

export interface GameState {
  player: Entity;
  entities: Entity[];
  karma: number; // -100 (Béton) to 100 (Éco)
  missionId: string | null;
  missionStatus: 'pending' | 'active' | 'completed';
  act: 1 | 2 | 3 | 4 | 5; // Current act (5 = Chantier Écocide)
  isOnBike: boolean; // false in Act 4 (RSE Workshop) - player is on foot
  missionData: {
    flyersToDistribute: number;
    flyersDistributed: number;
    targetNPCs: string[]; // IDs of NPCs who received flyers
    // Act 2 sabotage
    machinesSabotaged: number;
    machinesTotal: number;
    hasPotatoes: boolean;
    computerHacked: boolean;
    // Act 3 election
    votesGathered: number;
    votesNeeded: number;
    hasVoted: boolean;
    finalChoice: 'eco' | 'boycott' | null;
    // Act 4 RSE Workshop
    cupsCollected: number;
    cupsTotal: number;
    hasCoffeeAccepted: boolean;
    workshopSabotaged: boolean;
    hasTrophy: boolean; // Got the cup as trophy
    workshopChoice: 'denounce' | 'accept' | 'sabotage' | null;
    // Act 5 Chantier Écocide
    projectilesThrown: number;
    targetsHit: number;
    hasPotatoesForAct5: boolean;
    graffitiDone: number;
    graffitiTotal: number;
    screenHacked: boolean;
    vehiclesSabotaged: number;
    vehiclesTotal: number;
    presentationSabotaged: boolean;
    finalAct5Choice: 'patate' | 'graffiti' | 'hack' | null;
  };
  worldSize: Vector2;
  isPaused: boolean;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
}