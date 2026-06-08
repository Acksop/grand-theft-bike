import { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, InputState } from '../../game/types';
import { updateBike, checkCollisions } from '../../game/engine';
import { renderGame } from '../../game/renderer';
import { WORLD_SIZE } from '../../game/world';
import { KEY_MAP } from '../../game/constants';

export function useGameLoop(
  initialState: GameState,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  onUpdate: (gs: GameState, inp: InputState) => void
) {
  const stateRef = useRef<GameState>(structuredClone(initialState));
  const inputRef = useRef<InputState>({ up: false, down: false, left: false, right: false, action: false });
  const frameRef = useRef<number>(0);
  const [hudState, setHudState] = useState(initialState);

  const loop = useCallback(() => {
    const gs = stateRef.current;
    const inp = inputRef.current;

    // Check for Act transition and mission logic via callback
    onUpdate(gs, inp);

    // Physics
    updateBike(gs.player, inp, gs.isOnBike);
    checkCollisions(gs.player, gs.worldSize || WORLD_SIZE);

    // Render
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) renderGame(ctx, gs);

    // Update HUD occasionally
    if (frameRef.current % 6 === 0) {
      setHudState({
        ...gs,
        player: { 
          ...gs.player, 
          pos: { ...gs.player.pos }, 
          vel: { ...gs.player.vel },
          meta: gs.player.meta ? { ...gs.player.meta } : undefined
        },
      });
    }

    frameRef.current = requestAnimationFrame(loop);
  }, [canvasRef, onUpdate]);

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
    
    frameRef.current = requestAnimationFrame(loop);
    
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      cancelAnimationFrame(frameRef.current);
    };
  }, [loop]);

  return {
    stateRef,
    hudState,
    setHudState
  };
}
