import { Vector2 } from './types';

export interface Tile {
  id: string;
  type: 'road' | 'grass' | 'water' | 'concrete' | 'building' | 'vaites';
  pos: Vector2;
  size: Vector2;
  color: string;
}

export const WORLD_SIZE = { x: 4000, y: 4000 };

export const WORLD_TILES: Tile[] = [
  // Grass Base
  { id: 'base-grass', type: 'grass', pos: { x: 0, y: 0 }, size: WORLD_SIZE, color: '#14532d' },
  
  // RN57 (The concrete beast)
  { id: 'rn57', type: 'road', pos: { x: 1800, y: 0 }, size: { x: 400, y: 4000 }, color: '#334155' },
  
  // Les Vaîtes (The threatened green)
  { id: 'vaites-zone', type: 'vaites', pos: { x: 2200, y: 800 }, size: { x: 1000, y: 1200 }, color: '#10b981' },
  
  // Center-Ville (Besançon)
  { id: 'center-ville', type: 'concrete', pos: { x: 0, y: 1500 }, size: { x: 1500, y: 1500 }, color: '#475569' },
  
  // NOUVEAU: Chantier de l'éco-quartier (Acte 2)
  { id: 'chantier', type: 'concrete', pos: { x: 2200, y: 2000 }, size: { x: 800, y: 800 }, color: '#78716c' },
  
  // Doubs River
  { id: 'doubs-river', type: 'water', pos: { x: 0, y: 3200 }, size: { x: 4000, y: 300 }, color: '#0369a1' },
  
  // Local Buildings
  { id: 'mairie', type: 'building', pos: { x: 500, y: 1800 }, size: { x: 200, y: 200 }, color: '#94a3b8' },
  { id: 'zad-camp', type: 'grass', pos: { x: 2400, y: 1000 }, size: { x: 100, y: 100 }, color: '#064e3b' },
  { id: 'chantier-entrance', type: 'building', pos: { x: 2300, y: 2100 }, size: { x: 150, y: 100 }, color: '#57534e' },
];

export const ZONE_LABELS: Record<string, string> = {
  'vaites-zone': 'LES VAÎTES',
  'rn57': 'RN57 - BOUCHONS GARANTIS',
  'center-ville': 'CENTRE-VILLE',
  'chantier': 'CHANTIER ÉCO-QUARTIER',
  'doubs-river': 'LE DOUBS',
  'mairie': 'MAIRIE',
  'zad-camp': 'CAMP ZAD',
};

export function getTileAt(pos: Vector2): Tile | undefined {
  return WORLD_TILES.find(t => 
    pos.x >= t.pos.x && pos.x <= t.pos.x + t.size.x &&
    pos.y >= t.pos.y && pos.y <= t.pos.y + t.size.y
  );
}