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
import { GRAVITY, JUMP_VELOCITY, Level, Point, WALKING_ACCELERATION } from "./models";
import { Facing, PlayerEntity } from "./models";
import { collideWithLevel, normalSolidCollider, stepPhysics } from "./physics";

function applyNormalMovement(player: PlayerEntity, level: Level): PlayerEntity {
  const oldPos = { x: player.pos.x, y: player.pos.y };
  stepPhysics(player);
  const { collidedPos, hitX, hitY } = collideWithLevel(oldPos, player.pos, player.hitbox, level, normalSolidCollider);
  player.pos = collidedPos;
  if (hitX) {
    player.vel.x = 0.0;
  }
  if (hitY) {
    if (player.vel.y > 0.0) {
      player.grounded = true;
    }
    player.vel.y = 0.0;
  }
  return player;
}

function standingState(player: PlayerEntity, level: Level): PlayerEntity {
  let modifiedPlayer = { ...player, acc: { x: 0.0, y: GRAVITY } };
  modifiedPlayer = applyNormalMovement(modifiedPlayer, level);
  return modifiedPlayer;
}

function walkingState(player: PlayerEntity, level: Level, input: GameInput): PlayerEntity {
  let directionalInfluenceX = 0.0;
  if (input.moveDirection === HorizontalDirection.Left) {
    directionalInfluenceX = -WALKING_ACCELERATION;
  }
  if (input.moveDirection === HorizontalDirection.Right) {
    directionalInfluenceX = WALKING_ACCELERATION;
  }
  let modifiedPlayer = { ...player, acc: { x: directionalInfluenceX, y: GRAVITY } };
  modifiedPlayer = applyNormalMovement(modifiedPlayer, level);
  return modifiedPlayer;
}

function jumpInitState(player: PlayerEntity, level: Level, input: GameInput): PlayerEntity {
  const modifiedPlayer = { ...player, grounded: false, vel: { x: player.vel.x, y: -JUMP_VELOCITY } };
  return walkingState(modifiedPlayer, level, input);
}

export function updateCurrentState(player: PlayerEntity, level: Level, input: GameInput): PlayerEntity {
  return {
    ASCENDING: walkingState,
    DESCENDING: walkingState,
    JUMP_PREP: jumpInitState,
    STANDING: standingState,
    LANDING: walkingState,
    OUT_OF_ENTROPY: standingState,
    WALKING: walkingState,
  }[player.stateMachine.state.type](player, level, input);
}

function updateStateOutOfEntropy(player: PlayerEntity): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "OUT_OF_ENTROPY") return player;
  if (0 < state.ticksRemainingBeforeRechargeStarts) {
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
  } else if (state.ticksRemainingBeforeRechargeStarts === 0) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "STANDING" },
      },
    };
  }
  return player;
}

function updateStateStanding(player: PlayerEntity, input: GameInput): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "STANDING") return player;
  if (input.wantsToJump) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "JUMP_PREP", ticksRemainingBeforeAscent: 10 },
      },
    };
  } else if (input.moveDirection !== HorizontalDirection.Neutral) {
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

function updateStateWalking(player: PlayerEntity, input: GameInput): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "WALKING") return player;
  if (input.wantsToJump) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "JUMP_PREP", ticksRemainingBeforeAscent: 10 },
      },
    };
  }
  return player;
}

function updateStateJumpPrep(player: PlayerEntity): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "JUMP_PREP") return player;
  if (0 < state.ticksRemainingBeforeAscent) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: {
          type: "JUMP_PREP",
          ticksRemainingBeforeAscent: state.ticksRemainingBeforeAscent - 1,
        },
      },
    };
  } else if (state.ticksRemainingBeforeAscent === 0) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "ASCENDING" },
      },
    };
  }
  return player;
}

function updateStateAscending(player: PlayerEntity): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "ASCENDING") return player;
  if (player.vel.y >= 0) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "DESCENDING" },
      },
    };
  }
  return player;
}

function updateStateDescending(player: PlayerEntity): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "DESCENDING") return player;
  if (player.grounded) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "LANDING", ticksRemainingBeforeStanding: 10 },
      },
    };
  }
  return player;
}

function updateStateLanding(player: PlayerEntity): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "LANDING") return player;
  if (0 < state.ticksRemainingBeforeStanding) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: {
          type: "LANDING",
          ticksRemainingBeforeStanding: state.ticksRemainingBeforeStanding - 1,
        },
      },
    };
  } else if (state.ticksRemainingBeforeStanding === 0) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "STANDING" },
      },
    };
  }
  return player;
}

// Maybe this should be split out; the different updates are different events that can be pumped in. But this is a
// starting point.
export function updateStateMachine(player: PlayerEntity, input: GameInput): PlayerEntity {
  return {
    ASCENDING: updateStateAscending,
    DESCENDING: updateStateDescending,
    JUMP_PREP: updateStateJumpPrep,
    STANDING: updateStateStanding,
    LANDING: updateStateLanding,
    OUT_OF_ENTROPY: updateStateOutOfEntropy,
    WALKING: updateStateWalking,
  }[player.stateMachine.state.type](player, input);
  return player;
}

//@nick this makes a brand new player entity
export function createPlayerEntity(pos: Point): PlayerEntity {
  return {
    type: "playerEntity",
    pos: pos,
    vel: { x: 0, y: 0 },
    acc: { x: 0, y: 0 },
    speedCap: { x: 2, y: 10 },
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
    grounded: false,
    draw: (entity) => {
      love.graphics.setColor(0, 0, 0);
      love.graphics.print(`P`, Math.floor(entity.pos.x), Math.floor(entity.pos.y));
      return;
    },
    update: (entity) => {
      if (entity.type != "playerEntity") return entity;
      const level = getCurrentLevel();

      const input = currentInput();
      entity = updateStateMachine(entity, input);
      entity = updateCurrentState(entity, level, input);

      print(entity, level); //stop complaining about unused variables
      print(`PlayerPos: ${entity.pos.x}, ${entity.pos.y}`);
      print(`PlayerVel: ${entity.vel.x}, ${entity.vel.y}`);
      print(`PlayerAcc: ${entity.acc.x}, ${entity.acc.y}`);
      print(`PlayerState ${entity.stateMachine.state.type}`);
      return entity;
    },
    drawEffect: {},
    spritesheetlocation: {},
  };
}
