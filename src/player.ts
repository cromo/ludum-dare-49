// This is the beginnings of a state machine modeled with proper types. This
// will get more sophisticated as we find out what exactly we need for the game.

// What states do we need?
// Out of entropy
// Standing up after out of entropy
// Standing
// Collapsing back to out of entropy
// Walking/running
//   ? Turning around?
// Jump
//   prep
//   ascending
//   descending
//   landing
// Glitching
//   Begin
//   Forward
//   Diagonal up
//   Diagonal down
//   Up
//   Down
//   ? maybe the direction doesn't really matter for this? It could have the same art/effect and the target could be a member variable
//   ? should it have a different start if on the ground instead of in the air?
// Dissociating (restarting)
// Dying
//
// Also need a facing for all of these

import { GameInput, HorizontalDirection } from "./input";
import { getCurrentLevel } from "./levels";
import { HitBox, Point, Vector, VisibleEntity } from "./models";

export enum Facing {
  Left,
  Right,
}

export interface OutOfEntropy {
  type: "OUT_OF_ENTROPY";
  ticksRemainingBeforeRechargeStarts: number;
}

export interface Standing {
  type: "STANDING";
}

export interface Walking {
  type: "WALKING";
}

export interface PlayerState {
  facing: Facing;
  entropy: number;
  state: OutOfEntropy | Standing | Walking;
}

//@nick give this position and everything else for physics and fun
export interface PlayerEntity extends VisibleEntity {
  type: "playerEntity";
  pos: Point;
  vel: Vector;
  acc: Vector;
  speedCap: Vector;
  hitbox: HitBox;
  entropy: number;
}

//@nick this makes a brand new player entity
export function createPlayerEntity(pos: Point): PlayerEntity {
  return {
    type: "playerEntity",
    pos: pos,
    vel: { x: 0, y: 0 },
    acc: { x: 0, y: 0 },
    speedCap: { x: 0, y: 0 },
    hitbox: {
      corners: [
        { x: 0, y: 0 },
        { x: 0, y: 15 },
        { x: 15, y: 0 },
        { x: 15, y: 15 },
      ],
    },
    entropy: 50,
    draw: (entity) => {
      love.graphics.print(`P`, entity.pos.x, entity.pos.y);
      return;
    },
    update: (entity) => {
      print("PLAYER IS HERE");
      if (entity.type != "playerEntity") return;
      const level = getCurrentLevel();
      //@nick have fun with the level and entity

      print(entity, level); //stop complaining about unused variables
      print(entity.pos); //player position n stuff
      return;
    },
    drawEffect: {},
    spritesheetlocation: {},
  };
}

// Maybe this should be split out; the different updates are different events that can be pumped in. But this is a
// starting point.
export function updateStateMachine(player: PlayerState, input: GameInput): PlayerState {
  const { state } = player;
  if (state.type === "OUT_OF_ENTROPY" && 0 < state.ticksRemainingBeforeRechargeStarts) {
    return {
      ...player,
      state: {
        type: "OUT_OF_ENTROPY",
        ticksRemainingBeforeRechargeStarts: state.ticksRemainingBeforeRechargeStarts - 1,
      },
    };
  } else if (state.type === "OUT_OF_ENTROPY" && state.ticksRemainingBeforeRechargeStarts === 0) {
    return {
      ...player,
      state: { type: "STANDING" },
    };
  } else if (state.type === "STANDING" && input.moveDirection !== HorizontalDirection.Neutral) {
    return {
      ...player,
      facing: input.moveDirection === HorizontalDirection.Left ? Facing.Left : Facing.Right,
      state: { type: "WALKING" },
    };
  }
  return player;
}
