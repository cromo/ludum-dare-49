import { HitBox, LEVEL_HEIGHT, LEVEL_WIDTH, Level, Point, Vector } from "./models";
import { TILE_HEIGHT, TILE_WIDTH } from "./models";

// Any object which moves
export interface PhysicsObject {
  pos: Point;
  vel: Vector;
  acc: Vector;
  speedCap: Vector;
  friction: Vector;
}

function applySpeedCap(object: PhysicsObject): void {
  // Speed cap always applies equally on both axis. It should be specified
  // as a pair of positive values.
  if (object.vel.x > object.speedCap.x) {
    object.vel.x = object.speedCap.x;
  }
  if (object.vel.x < -object.speedCap.x) {
    object.vel.x = -object.speedCap.x;
  }
  if (object.vel.y > object.speedCap.y) {
    object.vel.y = object.speedCap.y;
  }
  if (object.vel.y < -object.speedCap.y) {
    object.vel.y = -object.speedCap.y;
  }
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
  object.vel.x += object.acc.x;
  object.vel.y += object.acc.y;
  applySpeedCap(object);
  object.pos.x += object.vel.x;
  object.pos.y += object.vel.y;
}

export function overlapsSolid(pos: Point, hitbox: HitBox, level: Level): boolean {
  const offsetHitbox = {
    corners: hitbox.corners.map((corner) => {
      return { x: corner.x + pos.x, y: corner.y + pos.y };
    }),
  };
  for (const corner of offsetHitbox.corners) {
    // guard: is this corner actually within the level bounds?
    const tileCorner = {
      x: Math.floor(corner.x / TILE_WIDTH),
      y: Math.floor(corner.y / TILE_HEIGHT),
    };
    // Guard: tiles outside of the level bounds have no collision for solid purposes
    if (tileCorner.x >= 0 && tileCorner.x < LEVEL_WIDTH && tileCorner.y >= 0 && tileCorner.y < LEVEL_HEIGHT) {
      if (level.physicalModes[tileCorner.y][tileCorner.x] == "solid") {
        return true;
      }
    }
  }
  return false;
}

export function collideWithLevel(currentPos: Point, targetPos: Point, hitbox: HitBox, level: Level): Point {
  // Strategy: moves 1px at a time, on one axis at a time.
  // Collides the hitbox after each move. If a hit is registered,
  // cancels the move and zeros position along that axis.
  // Note here: uses the *integer* position in all cases, for pixel checks.
  // The fractional component is only reset if a collision occurs, otherwise it is
  // allowed to persist and accumulate subpixel movement between frames

  const steppedPos = { x: Math.floor(currentPos.x), y: Math.floor(currentPos.y) };
  const adjustedTarget = { x: Math.floor(targetPos.x), y: Math.floor(targetPos.y) };
  const fractionalPos = { x: targetPos.x % 1.0, y: targetPos.y % 1.0 };

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
      const checkedPosition = { x: steppedPos.x + xAdjustment, y: steppedPos.y };
      if (overlapsSolid(checkedPosition, hitbox, level)) {
        // we would collide with a wall! cancel the move, and adjust our target on the X
        // axis to the point we have reached, so we make no further moves on this axis
        adjustedTarget.x = steppedPos.x;
        fractionalPos.x = 0.0;
      } else {
        steppedPos.x = checkedPosition.x;
      }
    } else {
      // Move 1 pixel towards the target, along the Y axis
      const yAdjustment = adjustedTarget.y > steppedPos.y ? 1 : -1;
      const checkedPosition = { x: steppedPos.x, y: steppedPos.y + yAdjustment };
      if (overlapsSolid(checkedPosition, hitbox, level)) {
        // we would collide with a wall! cancel the move, and adjust our target on the Y
        // axis to the point we have reached, so we make no further moves on this axis
        adjustedTarget.y = steppedPos.y;
        fractionalPos.y = 0.0;
      } else {
        steppedPos.y = checkedPosition.y;
      }
    }
  }

  // To the stepped result, apply the fractional component of the original target
  return {
    x: steppedPos.x + fractionalPos.x,
    y: steppedPos.y + fractionalPos.y,
  };
}
