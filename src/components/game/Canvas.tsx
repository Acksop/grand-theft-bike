import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GameState, InputState } from '../../game/types';
import { updateBike, checkCollisions } from '../../game/engine';
import { renderGame } from '../../game/renderer';
import { WORLD_SIZE } from '../../game/world';
import Hud from '../ui/Hud';

const INITIAL_STATE: GameState = {
  player: {
    id: 'player',
    type: 'player',
    pos: { x: 2300, y: 1000 },
    vel: { x: 0, y: 0 },
    angle: -Math.PI / 2,
    size: 20,
    color: '#10b981',
    health: 100,
    maxHealth: 100,
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
      meta: { name: 'Camille', dialog: "L\u00e9o ! Les pelleteuses arrivent demain. On doit mobiliser le quartier !" }
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
      meta: { name: 'Sam (Brocanteur)', dialog: "Tu veux un tract ? Ou une patate bio ? Les deux sont des armes." }
    }
  ],
  karma: 20,
  missionId: 'mobilisation',
  worldSize: WORLD_SIZE,
  isPaused: false,
};

const KEY_MAP: Record<string, keyof InputState> = {
  z: 'up', ArrowUp: 'up',
  s: 'down', ArrowDown: 'down',
  q: 'left', ArrowLeft: 'left',
  d: 'right', ArrowRight: 'right',
  ' ': 'action',
};

export default function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(structuredClone(INITIAL_STATE));
  const inputRef = useRef<InputState>({ up: false, down: false, left: false, right: false, action: false });
  const frameRef = useRef<number>(0);
  const [hudState, setHudState] = useState(INITIAL_STATE);
  const [dialog, setDialog] = useState<{ name: string; text: string } | null>(null);
  const dialogTimeout = useRef<ReturnType<typeof setTimeout>>();

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

      // Physics
      updateBike(gs.player, inp);
      checkCollisions(gs.player, WORLD_SIZE);

      // NPC interaction
      if (inp.action) {
        for (const ent of gs.entities) {
          const dx = ent.pos.x - gs.player.pos.x;
          const dy = ent.pos.y - gs.player.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 60 && ent.meta?.dialog) {
            setDialog({ name: ent.meta.name, text: ent.meta.dialog });
            clearTimeout(dialogTimeout.current);
            dialogTimeout.current = setTimeout(() => setDialog(null), 4000);
            inp.action = false; // consume
            break;
          }
        }
      }

      // Render
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) renderGame(ctx, gs);

      // Update HUD every 6 frames (~10 Hz) to avoid re-render spam
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
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#020617' }}>
      <canvas ref={canvasRef} className="pixel-art block" />
      <Hud state={hudState} />

      {/* NPC Dialog Box */}
      {dialog && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 max-w-lg w-full px-4 animate-fade-in pointer-events-none">
          <div className="bg-background/90 border-2 border-accent/40 p-5 font-mono backdrop-blur-sm">
            <p className="text-accent text-xs uppercase font-bold mb-2 tracking-widest">{dialog.name}</p>
            <p className="text-foreground text-sm leading-relaxed">{dialog.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
