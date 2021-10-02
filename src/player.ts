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

import { Image } from "love.graphics";

import { glitchedDraw } from "./glitch";
import { DashDirection, GameInput, HorizontalDirection } from "./input";
import { currentInput } from "./input";
import { GRAVITY, JUMP_VELOCITY, Level, Point, Vector, WALKING_ACCELERATION } from "./models";
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
  } else {
    player.grounded = false;
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

function dyingState(player: PlayerEntity): PlayerEntity {
  return player;
}

function dashPrepState(player: PlayerEntity): PlayerEntity {
  const modifiedPlayer = { ...player, grounded: false, vel: { x: 0, y: 0 }, acc: { x: 0, y: 0 } };
  return modifiedPlayer;
}

function dashDiretionFrom(facing: Facing, dashInput: DashDirection): Vector {
  if (dashInput == DashDirection.Forward) {
    if (facing == Facing.Right) {
      return { x: 1.0, y: 0.0 };
    } else {
      return { x: -1.0, y: 0.0 };
    }
  } else {
    return {
      N: { x: 0, y: -1 },
      E: { x: 1, y: 0 },
      S: { x: 0, y: 1 },
      W: { x: -1, y: 0 },
      NE: { x: 1, y: -1 },
      SE: { x: 1, y: 1 },
      SW: { x: -1, y: 1 },
      NW: { x: -1, y: -1 },
    }[dashInput];
  }
}

// Important: this function does many things, and persists for just ONE frame. The entire dash happens
// here, performing several sub-physics steps that will not be drawn directly. Later, we can add FX emitters
// at each point along the dash
function dashingState(player: PlayerEntity, level: Level, input: GameInput): PlayerEntity {
  if (player.stateMachine.state.type != "DASHING") return player;
  const dashDirection = dashDiretionFrom(player.stateMachine.facing, player.stateMachine.state.dashDirection);

  // NOT THE REAL DASH CODE. Just to test the state transitions.
  const modifiedPlayer = {
    ...player,
    grounded: false,
    vel: { x: dashDirection.x * 10, y: dashDirection.y * 10 },
    acc: { x: 0, y: 0 },
  };
  return walkingState(modifiedPlayer, level, input);

  //const modifiedPlayer = { ...player, grounded: false, vel: { x: 0, y: 0 }, acc: { x: 0, y: 0 } };

  return modifiedPlayer;
}

export function updateCurrentState(player: PlayerEntity, level: Level, input: GameInput): PlayerEntity {
  return {
    ASPLODE: dyingState,
    ASCENDING: walkingState,
    DASH_PREP: dashPrepState,
    DASHING: dashingState,
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
        state: { type: "STANDING", coyoteTime: 5 },
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
  } else if (input.wantsToDash) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "DASH_PREP", ticksBeforeGlitchOff: 10 },
      },
    };
  } else if (input.moveDirection !== HorizontalDirection.Neutral) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        facing: input.moveDirection === HorizontalDirection.Left ? Facing.Left : Facing.Right,
        state: { type: "WALKING", coyoteTime: state.coyoteTime },
      },
    };
  } else if (player.grounded) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "STANDING", coyoteTime: 5 },
      },
    };
  } else if (!player.grounded && 0 < state.coyoteTime) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "STANDING", coyoteTime: state.coyoteTime - 1 },
      },
    };
  } else if (!player.grounded && state.coyoteTime == 0) {
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
  } else if (input.wantsToDash) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "DASH_PREP", ticksBeforeGlitchOff: 10 },
      },
    };
  } else if (input.moveDirection === HorizontalDirection.Neutral) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "STANDING", coyoteTime: state.coyoteTime },
      },
    };
  } else if (player.grounded) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "WALKING", coyoteTime: 5 },
      },
    };
  } else if (!player.grounded && 0 < state.coyoteTime) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "WALKING", coyoteTime: state.coyoteTime - 1 },
      },
    };
  } else if (!player.grounded && state.coyoteTime == 0) {
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

function updateStateAscending(player: PlayerEntity, input: GameInput): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "ASCENDING") return player;
  if (input.wantsToDash) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "DASH_PREP", ticksBeforeGlitchOff: 10 },
      },
    };
  } else if (player.vel.y >= 0) {
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

function updateStateDescending(player: PlayerEntity, input: GameInput): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "DESCENDING") return player;
  if (input.wantsToDash) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "DASH_PREP", ticksBeforeGlitchOff: 10 },
      },
    };
  } else if (player.grounded) {
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

function updateStateLanding(player: PlayerEntity, input: GameInput): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "LANDING") return player;
  if (input.wantsToDash) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "DASH_PREP", ticksBeforeGlitchOff: 10 },
      },
    };
  } else if (input.moveDirection !== HorizontalDirection.Neutral) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        facing: input.moveDirection === HorizontalDirection.Left ? Facing.Left : Facing.Right,
        state: { type: "WALKING", coyoteTime: 5 },
      },
    };
  } else if (0 < state.ticksRemainingBeforeStanding) {
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
        state: { type: "STANDING", coyoteTime: 5 },
      },
    };
  }
  return player;
}

function updateStateDashPrep(player: PlayerEntity, input: GameInput): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "DASH_PREP") return player;
  if (0 < state.ticksBeforeGlitchOff) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: {
          type: "DASH_PREP",
          ticksBeforeGlitchOff: state.ticksBeforeGlitchOff - 1,
        },
      },
    };
  } else if (state.ticksBeforeGlitchOff === 0) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "DASHING", dashDirection: input.dashDirection },
      },
    };
  }
  return player;
}

// Note: lasts for just *one* frame
function updateStateDashing(player: PlayerEntity): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "DASHING") return player;
  if (player.vel.y > 0) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "ASCENDING" },
      },
    };
  } else {
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

function updateStateDying(player: PlayerEntity): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "ASPLODE") return player;
  // Do nothing! We are dead. Be one with chaos.
  return player;
}

// Maybe this should be split out; the different updates are different events that can be pumped in. But this is a
// starting point.
export function updateStateMachine(player: PlayerEntity, input: GameInput): PlayerEntity {
  return {
    ASPLODE: updateStateDying,
    ASCENDING: updateStateAscending,
    DASH_PREP: updateStateDashPrep,
    DASHING: updateStateDashing,
    DESCENDING: updateStateDescending,
    JUMP_PREP: updateStateJumpPrep,
    STANDING: updateStateStanding,
    LANDING: updateStateLanding,
    OUT_OF_ENTROPY: updateStateOutOfEntropy,
    WALKING: updateStateWalking,
  }[player.stateMachine.state.type](player, input);
  return player;
}

const sprites: Record<string, Image> = {};

export function loadPlayerSprites(): void {
  const { newImage } = love.graphics;
  sprites.standing = newImage("res/player-standing.png");
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
      state: { type: "STANDING", coyoteTime: 5 },
    },
    grounded: false,
    draw: (level, entity) => {
      love.graphics.setColor(255, 255, 255);
      glitchedDraw(sprites.standing, Math.floor(entity.pos.x), Math.floor(entity.pos.y), {
        glitchRate: 0.8,
        spread: 3,
      });
      return;
    },
    update: (level, entity) => {
      if (entity.type != "playerEntity") return entity;
      //@nick have fun with the level and entity

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
