import { HitBox, LEVEL_HEIGHT, LEVEL_WIDTH, Level, Point, Vector } from "./models";
import { TILE_HEIGHT, TILE_WIDTH } from "./models";

// Any object which moves
export interface PhysicsObject {
  pos: Point;
  vel: Vector;
  acc: Vector;
  speedCap: Vector;
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

export function stepPhysics(object: PhysicsObject): void {
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
