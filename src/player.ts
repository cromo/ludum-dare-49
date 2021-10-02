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
import { Facing, PlayerEntity, Point } from "./models";
import { collideWithLevel, normalSolidCollider, sensorInZone, stepPhysics } from "./physics";

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
    draw: (level, entity) => {
      love.graphics.setColor(0, 0, 0);
      love.graphics.print(`P`, Math.floor(entity.pos.x), Math.floor(entity.pos.y));
      return;
    },
    update: (level, entity) => {
      print("PLAYER IS HERE");
      if (entity.type != "playerEntity") return;
      //@nick have fun with the level and entity

      // NOTE: pretty much all of the below is ugly, ugly debug code. Once working, it should be
      // folded into the various states, which can decide what physics properties to apply and how
      // exactly to step / collide, as appropriate.

      // For testing I really want all compass directions, but we didn't do that, soooo we cheat
      const inputVel = {
        N: { x: 0, y: -1 },
        E: { x: 1, y: 0 },
        S: { x: 0, y: 1 },
        W: { x: -1, y: 0 },
        NE: { x: 1, y: -1 },
        SE: { x: 1, y: 1 },
        SW: { x: -1, y: 1 },
        NW: { x: -1, y: -1 },
        Forward: { x: 0, y: 0 },
      }[currentInput().dashDirection];

      // Quick debug test: input velocity becomes player accleeration.
      entity.acc = { x: inputVel.x * 0.1, y: inputVel.y * 0.1 };
      const oldPos = { x: entity.pos.x, y: entity.pos.y };
      stepPhysics(entity);

      // ... apply those overlaps?
      const { collidedPos, hitX, hitY } = collideWithLevel(
        oldPos,
        entity.pos,
        entity.hitbox,
        level,
        normalSolidCollider
      );
      entity.pos = collidedPos;
      if (hitX) {
        entity.vel.x = 0.0;
      }
      if (hitY) {
        entity.vel.y = 0.0;
      }

      const detectedZone = sensorInZone(entity.pos, entity.zoneSensor, level);

      print(entity, level); //stop complaining about unused variables
      print(`PlayerPos: ${entity.pos.x}, ${entity.pos.y}`);
      print(`PlayerVel: ${entity.vel.x}, ${entity.vel.y}`);
      print(`PlayerAcc: ${entity.acc.x}, ${entity.acc.y}`);
      print(`PlayerOverlapsSolid: ${hitX}, ${hitY}`);
      print(`PlayerZone: ${detectedZone}`);

      entity = updateStateMachine(entity, currentInput());

      print(`PlayerState ${entity.stateMachine.state.type}`);
      return;
    },
    drawEffect: {},
    spritesheetlocation: {},
  };
}
