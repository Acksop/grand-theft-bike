import { Entity, GameState } from './types';
import { WORLD_TILES, WORLD_SIZE } from './world';

const ZONE_LABELS: Record<string, string> = {
  'vaites-zone': 'LES VA\u00ceTE\u2019S',
  'rn57': 'RN57',
  'center-ville': 'CENTRE-VILLE',
  'doubs-river': 'LE DOUBS',
  'mairie': 'MAIRIE',
  'zad-camp': 'CAMP ZAD',
};

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState) {
  const { width, height } = ctx.canvas;
  const player = state.player;

  // Clear
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width / 2 - player.pos.x, height / 2 - player.pos.y);

  // Draw World Tiles
  for (const tile of WORLD_TILES) {
    ctx.fillStyle = tile.color;
    ctx.fillRect(tile.pos.x, tile.pos.y, tile.size.x, tile.size.y);

    // Karma overlay on Vaites
    if (tile.type === 'vaites' && state.karma < -50) {
      ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.fillRect(tile.pos.x, tile.pos.y, tile.size.x, tile.size.y);
    }

    // Zone Labels
    const label = ZONE_LABELS[tile.id];
    if (label) {
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.textAlign = 'center';
      ctx.fillText(label, tile.pos.x + tile.size.x / 2, tile.pos.y + tile.size.y / 2);
    }
  }

  // Road markings on RN57
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 30]);
  ctx.beginPath();
  ctx.moveTo(2000, 0);
  ctx.lineTo(2000, 4000);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw trees around Vaites
  drawTrees(ctx, state.karma);

  // Draw Entities (NPCs)
  for (const entity of state.entities) {
    drawEntity(ctx, entity, player, state.missionData.targetNPCs.includes(entity.id));
  }

  // Draw Player
  drawPlayer(ctx, player, state.isOnBike);

  ctx.restore();

  // Mini-map
  drawMiniMap(ctx, state, width, height);
}

function drawTrees(ctx: CanvasRenderingContext2D, karma: number) {
  const treePositions = [
    [2250, 850], [2350, 900], [2500, 860], [2600, 950],
    [2700, 1100], [2650, 1300], [2300, 1400], [2250, 1200],
    [2800, 900], [2750, 1500], [2400, 1600], [2550, 1700],
  ];
  const opacity = karma > 0 ? 1 : Math.max(0.2, 1 + karma / 100);

  ctx.globalAlpha = opacity;
  for (const [x, y] of treePositions) {
    // Trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 2, y, 4, 8);
    // Canopy
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x - 6, y - 6, 12, 8);
    ctx.fillRect(x - 4, y - 10, 8, 6);
  }
  ctx.globalAlpha = 1;
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: Entity, isOnBike: boolean = true) {
  ctx.save();
  ctx.translate(p.pos.x, p.pos.y);

  if (isOnBike) {
    // Bike mode - original rendering
    ctx.rotate(p.angle);

    // Bike frame
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-12, -3, 24, 6);

    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-14, -4, 6, 8);
    ctx.fillRect(8, -4, 6, 8);

    // L\u00e9o (head + dreads)
    ctx.fillStyle = '#fde68a'; // skin
    ctx.fillRect(-3, -7, 6, 6);
    ctx.fillStyle = '#78350f'; // dreads
    ctx.fillRect(-5, -9, 3, 4);
    ctx.fillRect(2, -9, 3, 4);
    ctx.fillRect(-4, -11, 8, 3);
  } else {
    // On foot mode (Act 4 - RSE Workshop)
    // Simple pedestrian sprite - stays upright (facing UP by default in canvas coords)

    // Body
    ctx.fillStyle = p.color; // Use player color
    ctx.fillRect(-4, -8, 8, 16);

    // Head
    ctx.fillStyle = '#fde68a'; // skin
    ctx.fillRect(-3, -14, 6, 6);

    // Legs (animated based on velocity)
    ctx.fillStyle = '#1e293b';
    const speed = Math.sqrt(p.vel.x ** 2 + p.vel.y ** 2);
    const legOffset = speed > 0.1 ? Math.sin(Date.now() / 100) * 2 : 0;
    ctx.fillRect(-3, 2, 2, 6 + legOffset);
    ctx.fillRect(1, 2, 2, 6 - legOffset);
  }

  ctx.restore();

  // Direction indicator (only when moving on bike)
  if (isOnBike) {
    const speed = Math.sqrt(p.vel.x ** 2 + p.vel.y ** 2);
    if (speed > 0.5) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.beginPath();
      ctx.arc(
        p.pos.x + Math.cos(p.angle) * 30,
        p.pos.y + Math.sin(p.angle) * 30,
        4, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }
}

function drawEntity(ctx: CanvasRenderingContext2D, entity: Entity, player: Entity, hasFlyer: boolean = false) {
  ctx.save();
  ctx.translate(entity.pos.x, entity.pos.y);

  // Body
  ctx.fillStyle = entity.color;
  const s = entity.size;
  ctx.fillRect(-s / 2, -s / 2, s, s);

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-3, -4, 2, 2);
  ctx.fillRect(1, -4, 2, 2);

  // Received flyer indicator
  if (hasFlyer) {
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(s / 2 + 2, -s / 2);
    ctx.lineTo(s / 2 + 6, -s / 2 + 4);
    ctx.lineTo(s / 2 + 10, -s / 2 - 4);
    ctx.stroke();
  }

  ctx.restore();

  // Name label
  const dx = entity.pos.x - player.pos.x;
  const dy = entity.pos.y - player.pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 150 && entity.meta?.name) {
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = entity.color;
    ctx.textAlign = 'center';
    ctx.fillText(entity.meta.name, entity.pos.x, entity.pos.y - entity.size);

    // Interaction prompt
    if (dist < 60) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('[ESPACE]', entity.pos.x, entity.pos.y + entity.size + 12);
    }
  }
}

function drawMiniMap(ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number) {
  const mapSize = 120;
  const mx = w - mapSize - 16;
  const my = h - mapSize - 16;
  const scale = mapSize / WORLD_SIZE.x;

  // Background
  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.fillRect(mx - 2, my - 2, mapSize + 4, mapSize + 4);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(mx - 2, my - 2, mapSize + 4, mapSize + 4);

  // Tiles
  for (const tile of WORLD_TILES) {
    ctx.fillStyle = tile.color;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(
      mx + tile.pos.x * scale,
      my + tile.pos.y * scale,
      Math.max(tile.size.x * scale, 1),
      Math.max(tile.size.y * scale, 1),
    );
  }
  ctx.globalAlpha = 1;

  // NPCs
  for (const e of state.entities) {
    ctx.fillStyle = e.color;
    ctx.fillRect(mx + e.pos.x * scale - 1, my + e.pos.y * scale - 1, 3, 3);
  }

  // Player blip
  ctx.fillStyle = '#10b981';
  ctx.fillRect(mx + state.player.pos.x * scale - 2, my + state.player.pos.y * scale - 2, 4, 4);
}
