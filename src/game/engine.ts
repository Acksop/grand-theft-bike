import { Entity, InputState, Vector2, GameState } from './types';

export const BIKE_ACCEL = 0.2;
export const BIKE_FRICTION = 0.96;
export const BIKE_TURN_SPEED = 0.08;
export const MAX_SPEED = 8;

export function updateBike(bike: Entity, input: InputState) {
  const speedMultiplier = bike.meta?.speedMultiplier || 1;
  const accel = BIKE_ACCEL * speedMultiplier;
  const maxSpeed = MAX_SPEED * speedMultiplier;

  // Movement
  if (input.up) {
    bike.vel.x += Math.cos(bike.angle) * accel;
    bike.vel.y += Math.sin(bike.angle) * accel;
  } else if (input.down) {
    bike.vel.x -= Math.cos(bike.angle) * accel * 0.5;
    bike.vel.y -= Math.sin(bike.angle) * accel * 0.5;
  }

  // Turning (only when moving)
  const speed = Math.sqrt(bike.vel.x ** 2 + bike.vel.y ** 2);
  if (speed > 0.1) {
    const turnFactor = Math.min(speed / 4, 1);
    if (input.left) bike.angle -= BIKE_TURN_SPEED * turnFactor;
    if (input.right) bike.angle += BIKE_TURN_SPEED * turnFactor;
  }

  // Apply velocity
  bike.pos.x += bike.vel.x;
  bike.pos.y += bike.vel.y;

  // Apply friction
  bike.vel.x *= BIKE_FRICTION;
  bike.vel.y *= BIKE_FRICTION;

  // Cap speed
  if (speed > maxSpeed) {
    const ratio = maxSpeed / speed;
    bike.vel.x *= ratio;
    bike.vel.y *= ratio;
  }
}

export function checkCollisions(entity: Entity, worldSize: Vector2) {
  if (entity.pos.x < 0) entity.pos.x = 0;
  if (entity.pos.x > worldSize.x) entity.pos.x = worldSize.x;
  if (entity.pos.y < 0) entity.pos.y = 0;
  if (entity.pos.y > worldSize.y) entity.pos.y = worldSize.y;
}
