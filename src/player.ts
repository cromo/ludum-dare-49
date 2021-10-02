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
import { currentInput } from "./input";
import { getCurrentLevel } from "./levels";
import { GRAVITY, Level, Point, WALKING_ACCELERATION } from "./models";
import { Facing, PlayerEntity } from "./models";
import { collideWithLevel, normalSolidCollider, stepPhysics } from "./physics";

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

export interface PlayerStateMachine {
  facing: Facing;
  entropy: number;
  state: OutOfEntropy | Standing | Walking;
}

function applyNormalMovement(player: PlayerEntity, level: Level): PlayerEntity {
  const oldPos = { x: player.pos.x, y: player.pos.y };
  stepPhysics(player);
  const { collidedPos, hitX, hitY } = collideWithLevel(oldPos, player.pos, player.hitbox, level, normalSolidCollider);
  player.pos.x = collidedPos.x;
  player.pos.y = collidedPos.y;
  if (hitX) {
    player.vel.x = 0.0;
  }
  if (hitY) {
    player.vel.y = 0.0;
  }
  return player;
}

function standingState(player: PlayerEntity, level: Level): PlayerEntity {
  let modifiedPlayer = { ...player, acc: { x: 0.0, y: GRAVITY } };
  modifiedPlayer = applyNormalMovement(modifiedPlayer, level);
  return modifiedPlayer;
}

function walkingState(player: PlayerEntity, level: Level): PlayerEntity {
  const directionalInfluenceX =
    player.stateMachine.facing == Facing.Left ? -WALKING_ACCELERATION : WALKING_ACCELERATION;
  let modifiedPlayer = { ...player, acc: { x: directionalInfluenceX, y: GRAVITY } };
  modifiedPlayer = applyNormalMovement(modifiedPlayer, level);
  return modifiedPlayer;
}

export function updateCurrentState(player: PlayerEntity, level: Level): PlayerEntity {
  return {
    STANDING: standingState,
    OUT_OF_ENTROPY: standingState,
    WALKING: walkingState,
  }[player.stateMachine.state.type](player, level);
}

// Maybe this should be split out; the different updates are different events that can be pumped in. But this is a
// starting point.
export function updateStateMachine(player: PlayerEntity, input: GameInput): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type === "OUT_OF_ENTROPY" && 0 < state.ticksRemainingBeforeRechargeStarts) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: {
          type: "OUT_OF_ENTROPY",
          ticksRemainingBeforeRechargeStarts: state.ticksRemainingBeforeRechargeStarts - 1,
        },
      },
    };
  } else if (state.type === "OUT_OF_ENTROPY" && state.ticksRemainingBeforeRechargeStarts === 0) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "STANDING" },
      },
    };
  } else if (state.type === "STANDING" && input.moveDirection !== HorizontalDirection.Neutral) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        facing: input.moveDirection === HorizontalDirection.Left ? Facing.Left : Facing.Right,
        state: { type: "WALKING" },
      },
    };
  }
  return player;
}

//@nick this makes a brand new player entity
export function createPlayerEntity(pos: Point): PlayerEntity {
  return {
    type: "playerEntity",
    pos: pos,
    vel: { x: 0, y: 0 },
    acc: { x: 0, y: 0 },
    speedCap: { x: 1, y: 1 },
    friction: { x: 0.05, y: 0.05 },
    hitbox: {
      corners: [
        { x: 0, y: 0 },
        { x: 0, y: 15 },
        { x: 15, y: 0 },
        { x: 15, y: 15 },
      ],
    },
    footSensor: { x: 8.0, y: 16 },
    zoneSensor: { x: 8.0, y: 8.0 },
    entropy: 50,
    stateMachine: {
      facing: Facing.Right,
      entropy: 0,
      state: { type: "STANDING" },
    },
    draw: (entity) => {
      love.graphics.setColor(0, 0, 0);
      love.graphics.print(`P`, Math.floor(entity.pos.x), Math.floor(entity.pos.y));
      return;
    },
    update: (entity) => {
      print("PLAYER IS HERE");
      if (entity.type != "playerEntity") return;
      const level = getCurrentLevel();
      //@nick have fun with the level and entity

      entity = updateStateMachine(entity, currentInput());
      entity = updateCurrentState(entity, level);

      print(entity, level); //stop complaining about unused variables
      print(`PlayerPos: ${entity.pos.x}, ${entity.pos.y}`);
      print(`PlayerVel: ${entity.vel.x}, ${entity.vel.y}`);
      print(`PlayerAcc: ${entity.acc.x}, ${entity.acc.y}`);
      print(`PlayerState ${entity.stateMachine.state.type}`);
      return;
    },
    drawEffect: {},
    spritesheetlocation: {},
  };
}
