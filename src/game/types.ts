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
  act: 1 | 2 | 3; // Current act
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