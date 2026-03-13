import { Entity, InputState, Vector2, GameState } from './types';

export const BIKE_ACCEL = 0.2;
export const BIKE_FRICTION = 0.96;
export const BIKE_TURN_SPEED = 0.08;
export const MAX_SPEED = 8;

// Foot movement constants (slower, more responsive)
export const FOOT_ACCEL = 0.15;
export const FOOT_FRICTION = 0.85;
export const FOOT_TURN_SPEED = 0.1;
export const FOOT_MAX_SPEED = 3;

export function updateBike(bike: Entity, input: InputState, isOnBike: boolean = true) {
  const speedMultiplier = bike.meta?.speedMultiplier || 1;
  
  if (isOnBike) {
    // Bike physics (original)
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

    // Turning (works even when stationary - rotation in place)
    if (input.left) bike.angle -= BIKE_TURN_SPEED;
    if (input.right) bike.angle += BIKE_TURN_SPEED;

    // Apply velocity
    bike.pos.x += bike.vel.x;
    bike.pos.y += bike.vel.y;

    // Apply friction
    bike.vel.x *= BIKE_FRICTION;
    bike.vel.y *= BIKE_FRICTION;

    // Cap speed
    const speed = Math.sqrt(bike.vel.x ** 2 + bike.vel.y ** 2);
    if (speed > maxSpeed) {
      const ratio = maxSpeed / speed;
      bike.vel.x *= ratio;
      bike.vel.y *= ratio;
    }
  } else {
    // Foot physics (on foot - Act 4)
    const accel = FOOT_ACCEL * speedMultiplier;
    const maxSpeed = FOOT_MAX_SPEED * speedMultiplier;

    // 4-directional movement (up/down/left/right - not angle-based)
    if (input.up) {
      bike.vel.x += 0;
      bike.vel.y -= accel;
    } else if (input.down) {
      bike.vel.x += 0;
      bike.vel.y += accel;
    }
    
    // Left/right movement (no rotation needed)
    if (input.left) {
      bike.vel.x -= accel;
    } else if (input.right) {
      bike.vel.x += accel;
    }

    // Apply velocity
    bike.pos.x += bike.vel.x;
    bike.pos.y += bike.vel.y;

    // Apply friction (higher = stops faster when no input)
    bike.vel.x *= FOOT_FRICTION;
    bike.vel.y *= FOOT_FRICTION;

    // Cap speed
    const speed = Math.sqrt(bike.vel.x ** 2 + bike.vel.y ** 2);
    if (speed > maxSpeed) {
      const ratio = maxSpeed / speed;
      bike.vel.x *= ratio;
      bike.vel.y *= ratio;
    }
  }
}

export function checkCollisions(entity: Entity, worldSize: Vector2) {
  if (entity.pos.x < 0) entity.pos.x = 0;
  if (entity.pos.x > worldSize.x) entity.pos.x = worldSize.x;
  if (entity.pos.y < 0) entity.pos.y = 0;
  if (entity.pos.y > worldSize.y) entity.pos.y = worldSize.y;
}
