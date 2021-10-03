import { GlitchMode, HitBox, LEVEL_HEIGHT, LEVEL_WIDTH, Level, PhysicalMode, Point, Vector, ZoneMode } from "./models";
import { TILE_HEIGHT, TILE_WIDTH } from "./models";

// Any object which moves
export interface PhysicsObject {
  pos: Point;
  vel: Vector;
  acc: Vector;
  friction: Vector;
  directionalInfluenceAcc: number;
  directionalInfluenceSpeedCap: number;
}

function applyFriction(object: PhysicsObject): void {
  object.vel.x = object.vel.x * (1.0 - object.friction.x);
  object.vel.y = object.vel.y * (1.0 - object.friction.y);
  // Prevent continuously applied friction from dropping our speed to some ridiculously tiny
  // value; after a point, bring the object to a complete stop.
  if (Math.abs(object.vel.x) < 0.001) {
    object.vel.x = 0.0;
  }
  if (Math.abs(object.vel.y) < 0.001) {
    object.vel.y = 0.0;
  }
}

export function stepPhysics(object: PhysicsObject): void {
  applyFriction(object);
  // apply generlc velocity and uncapped acceleration
  object.vel.x += object.acc.x;
  object.vel.y += object.acc.y;
  // apply directional influence, with speed cap
  if (object.directionalInfluenceAcc > 0) {
    if (object.vel.x < object.directionalInfluenceSpeedCap) {
      object.vel.x = Math.min(object.vel.x + object.directionalInfluenceAcc, object.directionalInfluenceSpeedCap);
    }
  } else if (object.directionalInfluenceAcc < 0) {
    if (object.vel.x > -object.directionalInfluenceSpeedCap) {
      object.vel.x = Math.max(object.vel.x + object.directionalInfluenceAcc, -object.directionalInfluenceSpeedCap);
    }
  }
  // Finally, apply speed to object's position
  object.pos.x += object.vel.x;
  object.pos.y += object.vel.y;
}

export type ColliderFunction = (tileX: number, tileY: number, level: Level) => boolean;

// Guard: Returns true if these tile coordinates are within the level
export function tileInBounds(pos: Point): boolean {
  return pos.x >= 0 && pos.x < LEVEL_WIDTH && pos.y >= 0 && pos.y < LEVEL_HEIGHT;
}

export function tileCoordinates(pos: Point): Point {
  return {
    x: Math.floor(pos.x / TILE_WIDTH),
    y: Math.floor(pos.y / TILE_HEIGHT),
  };
}

export function sensorInPhysicalMode(pos: Point, sensor: Point, level: Level): PhysicalMode {
  const sensorPos = { x: pos.x + sensor.x, y: pos.y + sensor.y };
  const tilePos = tileCoordinates(sensorPos);
  if (tileInBounds(tilePos)) {
    return level.physicalModes[tilePos.y][tilePos.x];
  }
  return "empty";
}

export function sensorInZone(pos: Point, sensor: Point, level: Level): ZoneMode {
  const sensorPos = { x: pos.x + sensor.x, y: pos.y + sensor.y };
  const tilePos = tileCoordinates(sensorPos);
  if (tileInBounds(tilePos)) {
    return level.zoneModes[tilePos.y][tilePos.x];
  }
  return "normal";
}

export function sensorInGlitchMode(pos: Point, sensor: Point, level: Level): GlitchMode {
  const sensorPos = { x: pos.x + sensor.x, y: pos.y + sensor.y };
  const tilePos = tileCoordinates(sensorPos);
  if (tileInBounds(tilePos)) {
    return level.glitchModes[tilePos.y][tilePos.x];
  }
  return "empty";
}

export function hitboxOverlapsGlitchTile(pos: Point, hitbox: HitBox, level: Level): boolean {
  const offsetHitbox = {
    corners: hitbox.corners.map((corner) => {
      return { x: corner.x + pos.x, y: corner.y + pos.y };
    }),
  };
  for (const corner of offsetHitbox.corners) {
    const tileCorner = tileCoordinates(corner);
    if (tileInBounds(tileCorner)) {
      if (
        level.glitchModes[tileCorner.y][tileCorner.x] == "glitch" ||
        level.glitchModes[tileCorner.y][tileCorner.x] == "glitch_once"
      ) {
        return true;
      }
    }
  }
  return false;
}

export function hitboxOverlapsCollider(
  pos: Point,
  hitbox: HitBox,
  level: Level,
  colliderFn: ColliderFunction
): boolean {
  const offsetHitbox = {
    corners: hitbox.corners.map((corner) => {
      return { x: corner.x + pos.x, y: corner.y + pos.y };
    }),
  };
  for (const corner of offsetHitbox.corners) {
    const tileCorner = tileCoordinates(corner);
    if (tileInBounds(tileCorner)) {
      if (colliderFn(tileCorner.x, tileCorner.y, level)) {
        return true;
      }
    }
  }
  return false;
}

export function collideWithLevel(
  currentPos: Point,
  targetPos: Point,
  hitbox: HitBox,
  level: Level,
  colliderFn: ColliderFunction
): { collidedPos: Point; hitX: boolean; hitY: boolean } {
  // Strategy: moves 1px at a time, on one axis at a time.
  // Collides the hitbox after each move. If a hit is registered,
  // cancels the move and zeros position along that axis.
  // Note here: uses the *integer* position in all cases, for pixel checks.
  // The fractional component is only reset if a collision occurs, otherwise it is
  // allowed to persist and accumulate subpixel movement between frames

  const steppedPos = { x: Math.floor(currentPos.x), y: Math.floor(currentPos.y) };
  const adjustedTarget = { x: Math.floor(targetPos.x), y: Math.floor(targetPos.y) };
  const fractionalPos = { x: targetPos.x % 1.0, y: targetPos.y % 1.0 };
  let hitX = false;
  let hitY = false;

  // While either axis has at least 1px left to go:
  while (steppedPos.x != adjustedTarget.x || steppedPos.y != adjustedTarget.y) {
    // Work out that distance in pixel units
    const distance = {
      x: adjustedTarget.x - steppedPos.x,
      y: adjustedTarget.y - steppedPos.y,
    };
    // Favor the axis with the largest distance remaining
    if (Math.abs(distance.x) > Math.abs(distance.y)) {
      // Move 1 pixel towards the target, along the X axis
      const xAdjustment = adjustedTarget.x > steppedPos.x ? 1 : -1;
      const checkedPosition = {
        x: steppedPos.x + xAdjustment,
        y: steppedPos.y,
      };
      if (hitboxOverlapsCollider(checkedPosition, hitbox, level, colliderFn)) {
        // we would collide with a wall! cancel the move, and adjust our target on the X
        // axis to the point we have reached, so we make no further moves on this axis
        adjustedTarget.x = steppedPos.x;
        hitX = true;
      } else {
        steppedPos.x = checkedPosition.x;
      }
    } else {
      // Move 1 pixel towards the target, along the Y axis
      const yAdjustment = adjustedTarget.y > steppedPos.y ? 1 : -1;
      const checkedPosition = {
        x: steppedPos.x,
        y: steppedPos.y + yAdjustment,
      };
      if (hitboxOverlapsCollider(checkedPosition, hitbox, level, colliderFn)) {
        // we would collide with a wall! cancel the move, and adjust our target on the Y
        // axis to the point we have reached, so we make no further moves on this axis
        adjustedTarget.y = steppedPos.y;
        hitY = true;
      } else {
        steppedPos.y = checkedPosition.y;
      }
    }
  }

  // To the stepped result, apply the fractional component of the original target
  const collidedPos = {
    x: steppedPos.x + fractionalPos.x,
    y: steppedPos.y + fractionalPos.y,
  };
  return { collidedPos: collidedPos, hitX: hitX, hitY: hitY };
}

export function normalSolidCollider(tileX: number, tileY: number, level: Level): boolean {
  return level.physicalModes[tileY][tileX] == "solid";
}

export function glitchSolidCollider(tileX: number, tileY: number, level: Level): boolean {
  return level.glitchModes[tileY][tileX] == "solid";
}
