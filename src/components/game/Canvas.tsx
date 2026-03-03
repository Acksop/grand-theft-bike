import React, { useEffect, useRef, useState } from 'react';
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
    angle: 0,
    size: 20,
    color: '#10b981',
    health: 100,
    maxHealth: 100,
  },
  entities: [
    {
      id: 'camille',
      type: 'npc',
      pos: { x: 2400, y: 1050 },
      vel: { x: 0, y: 0 },
      angle: 0,
      size: 16,
      color: '#ec4899', // Camille's pink
      health: 100,
      maxHealth: 100,
      meta: { name: 'Camille', dialog: 'Léo ! Regarde ce qu’ils font à nos terres. On doit réagir !' }
    }
  ],
  karma: 20,
  missionId: 'setup_engine',
  worldSize: WORLD_SIZE,
  isPaused: false,
};

export default function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [input, setInput] = useState<InputState>({
    up: false, down: false, left: false, right: false, action: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const i = { ...input };
      if (e.key === 'z' || e.key === 'ArrowUp') i.up = true;
      if (e.key === 's' || e.key === 'ArrowDown') i.down = true;
      if (e.key === 'q' || e.key === 'ArrowLeft') i.left = true;
      if (e.key === 'd' || e.key === 'ArrowRight') i.right = true;
      if (e.key === ' ') i.action = true;
      setInput(i);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const i = { ...input };
      if (e.key === 'z' || e.key === 'ArrowUp') i.up = false;
      if (e.key === 's' || e.key === 'ArrowDown') i.down = false;
      if (e.key === 'q' || e.key === 'ArrowLeft') i.left = false;
      if (e.key === 'd' || e.key === 'ArrowRight') i.right = false;
      if (e.key === ' ') i.action = false;
      setInput(i);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [input]);

  useEffect(() => {
    let frameId: number;
    const loop = () => {
      setState(prev => {
        const next = { ...prev };
        updateBike(next.player, input);
        checkCollisions(next.player, WORLD_SIZE);
        return next;
      });
      
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        renderGame(ctx, state);
      }
      
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [input, state]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={window.innerWidth} 
        height={window.innerHeight}
        className="pixel-art"
      />
      <Hud state={state} />
    </div>
  );
}
