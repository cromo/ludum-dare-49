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

import { Image, setColor } from "love.graphics";

import { playSfx, queueBgmVariant } from "./audio";
import { GlitchMode, glitchedDraw } from "./glitch";
import { DashDirection, GameInput, HorizontalDirection } from "./input";
import { currentInput } from "./input";
import { getTerminal } from "./levels";
import {
  COYOTE_TIME,
  DASH_CHARGE_FRAMES,
  DASH_LENGTH,
  DEATH_ANIMATION_PIXEL_SPREAD,
  DEATH_ANIMATION_TICKS,
  DOUBLE_JUMP_VELOCITY,
  ENTROPY_BASE_RATE,
  ENTROPY_DEAD_RATE,
  ENTROPY_HOT_RATE,
  ENTROPY_LIMIT,
  ENTROPY_PIP_GAINED_GLITCH_SPREAD,
  EXTENDED_DASH_SAFETY_LIMIT,
  GRAVITY,
  HitBox,
  JUMP_VELOCITY,
  Level,
  MAXIMUM_AFTERIMAGE_TICK_DURATION,
  MINIMUM_AFTERIMAGE_TICK_DURATION,
  MINIMUM_DISTANCE_BETWEEN_AFTERIMAGES,
  MOVEMENT_ACCELERATION,
  MOVEMENT_SPEEDCAP,
  OUT_OF_ENTROPY_PENALTY_TICKS,
  PIP_INSTABILITY_ANIMATION_TIME_TICKS,
  PIP_INSTABILITY_SPREAD,
  PLAYER_FRICTION,
  POST_DASH_VELOCITY,
  Point,
  RESET_DURATION_TICKS,
  TILE_CODE_TO_TYPE,
  TileDef,
  TileTypes,
  VICTORY_DURATION_TICKS,
  Vector,
  ZoneMode,
} from "./models";
import { Facing, GlitchMode as LevelGlitchMode, PlayerEntity } from "./models";
import {
  collideWithLevel,
  glitchSolidCollider,
  hitboxOverlapsGlitchTile,
  normalSolidCollider,
  sensorInGlitchMode,
  sensorInPhysicalMode,
  sensorInZone,
  stepPhysics,
  tileCoordinates,
  tileInBounds,
} from "./physics";

function applyNormalMovement(player: PlayerEntity, level: Level): PlayerEntity {
  const oldPos = { x: player.pos.x, y: player.pos.y };
  stepPhysics(player);
  const { collidedPos, hitX, hitY } = collideWithLevel(
    oldPos,
    player.pos,
    player.hitbox,
    player.groundHitbox,
    level,
    normalSolidCollider
  );
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

function applyExtendedGlitchMovement(player: PlayerEntity, level: Level): PlayerEntity {
  const oldPos = { x: player.pos.x, y: player.pos.y };
  stepPhysics(player);
  const { collidedPos, hitX, hitY } = collideWithLevel(
    oldPos,
    player.pos,
    player.hitbox,
    player.groundHitbox,
    level,
    glitchSolidCollider
  );
  player.pos = collidedPos;
  if (hitX || hitY) {
    /* Telesplat(tm) */
    player.isDead = true;
    const terminal = getTerminal();
    if (terminal) {
      terminal.trackers.deathCount++;
      terminal.trackers.lastDeathType = "telesplat";
      terminal.trackers.deathTick = true;
    }
  }
  return player;
}

function applyGlitchMovement(player: PlayerEntity, level: Level): PlayerEntity {
  const oldPos = { x: player.pos.x, y: player.pos.y };
  stepPhysics(player);
  const { collidedPos } = collideWithLevel(
    oldPos,
    player.pos,
    player.hitbox,
    player.groundHitbox,
    level,
    glitchSolidCollider
  );
  player.pos = collidedPos;
  return player;
}

function standingState(player: PlayerEntity, level: Level): PlayerEntity {
  let modifiedPlayer = { ...player, directionalInfluenceAcc: 0 };
  modifiedPlayer = applyNormalMovement(modifiedPlayer, level);
  return modifiedPlayer;
}

function walkingState(player: PlayerEntity, level: Level, input: GameInput): PlayerEntity {
  let directionalInfluenceX = 0.0;
  if (input.moveDirection === HorizontalDirection.Left) {
    directionalInfluenceX = -MOVEMENT_ACCELERATION;
  }
  if (input.moveDirection === HorizontalDirection.Right) {
    directionalInfluenceX = MOVEMENT_ACCELERATION;
  }
  let modifiedPlayer = { ...player, directionalInfluenceAcc: directionalInfluenceX };
  modifiedPlayer = applyNormalMovement(modifiedPlayer, level);
  return modifiedPlayer;
}

function jumpInitState(player: PlayerEntity, level: Level, input: GameInput): PlayerEntity {
  const modifiedPlayer = { ...player, grounded: false, vel: { x: player.vel.x, y: -JUMP_VELOCITY } };
  return walkingState(modifiedPlayer, level, input);
}

function doubleJumpInitState(player: PlayerEntity, level: Level, input: GameInput): PlayerEntity {
  const modifiedPlayer = { ...player, grounded: false, vel: { x: player.vel.x, y: -DOUBLE_JUMP_VELOCITY } };
  return walkingState(modifiedPlayer, level, input);
}

function dyingState(player: PlayerEntity, level: Level): PlayerEntity {
  if (player.stateMachine.state.type != "ASPLODE") return player;
  if (player.stateMachine.state.framesDead >= RESET_DURATION_TICKS) {
    level.doRestart = true;
    // const terminal = getTerminal();
    // if (terminal) {
    //   // terminal.trackers.deathCount++; // TODO: move this to the causes instead
    // }
  }
  return player;
}

function victoryState(player: PlayerEntity, level: Level): PlayerEntity {
  if (player.stateMachine.state.type != "VICTORY") return player;
  if (player.stateMachine.state.framesVictorious >= VICTORY_DURATION_TICKS) {
    level.nextLevel = true;
  }
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

function floodFill(
  location: Point,
  sourceType: TileTypes,
  destinationType: TileDef,
  destinationGlitchMode: LevelGlitchMode,
  level: Level
): void {
  if (tileInBounds(location) && level.tiles[location.y][location.x].type == sourceType) {
    level.tiles[location.y][location.x] = { ...destinationType };
    level.glitchModes[location.y][location.x] = destinationGlitchMode;
    floodFill({ x: location.x + 1, y: location.y + 0 }, sourceType, destinationType, destinationGlitchMode, level);
    floodFill({ x: location.x - 1, y: location.y + 0 }, sourceType, destinationType, destinationGlitchMode, level);
    floodFill({ x: location.x + 0, y: location.y + 1 }, sourceType, destinationType, destinationGlitchMode, level);
    floodFill({ x: location.x + 0, y: location.y - 1 }, sourceType, destinationType, destinationGlitchMode, level);
  }
}

function normalize(vec: Vector): Vector {
  const length = math.sqrt(vec.x * vec.x + vec.y * vec.y);
  return { x: vec.x / length, y: vec.y / length };
}

// Important: this function does many things, and persists for just ONE frame. The entire dash happens
// here, performing several sub-physics steps that will not be drawn directly. Later, we can add FX emitters
// at each point along the dash
function dashingState(player: PlayerEntity, level: Level): PlayerEntity {
  if (player.stateMachine.state.type != "DASHING") return player;
  const dashDirection = normalize(
    dashDiretionFrom(player.stateMachine.facing, player.stateMachine.state.dashDirection)
  );

  // Set up a constant acceleration, moving the player about one half-tile per step
  const originalFriction = { ...player.friction };
  let modifiedPlayer = {
    ...player,
    grounded: false,
    vel: { x: dashDirection.x * 8.0, y: dashDirection.y * 8.0 },
    acc: { x: 0, y: 0 }, // disable gravity during the dash
    directionalInfluenceAcc: 0,
    friction: { x: 0, y: 0 },
  };

  const onceGlitchTilesTouched = [];

  // Iterate the physics step 4 times, moving the player approximately 2 tiles in the dash direction instantly
  for (let i = 0; i < DASH_LENGTH; i++) {
    modifiedPlayer = applyGlitchMovement(modifiedPlayer, level);
    for (const corner of modifiedPlayer.hitbox.corners) {
      const glitchMode = sensorInGlitchMode(modifiedPlayer.pos, corner, level);
      if (glitchMode == "glitch_once") {
        onceGlitchTilesTouched.push(
          tileCoordinates({ x: modifiedPlayer.pos.x + corner.x, y: modifiedPlayer.pos.y + corner.y })
        );
      }
    }
  }

  // Here, if we are currently in a glitch tile, continue to iterate until one of several things happens:
  // If we leave glitch tiles, the effect ends
  // If we hit a solid AND we are still on a glitch tile, we die
  // If we iterate too many times, we die as a safeguard (something went horribly wrong)
  let safetyCounter = 0;
  while (
    !modifiedPlayer.isDead &&
    hitboxOverlapsGlitchTile(modifiedPlayer.pos, modifiedPlayer.hitbox, level) &&
    safetyCounter < EXTENDED_DASH_SAFETY_LIMIT
  ) {
    modifiedPlayer = applyExtendedGlitchMovement(modifiedPlayer, level);
    safetyCounter += 1;
    for (const corner of modifiedPlayer.hitbox.corners) {
      const glitchMode = sensorInGlitchMode(modifiedPlayer.pos, corner, level);
      if (glitchMode == "glitch_once") {
        onceGlitchTilesTouched.push(
          tileCoordinates({ x: modifiedPlayer.pos.x + corner.x, y: modifiedPlayer.pos.y + corner.y })
        );
      }
    }
  }

  if (safetyCounter == EXTENDED_DASH_SAFETY_LIMIT) {
    /* Force a Telesplat. The employee safety handbook was *very* clear. */
    modifiedPlayer.entropy = ENTROPY_LIMIT;
    const terminal = getTerminal();
    if (terminal) {
      terminal.trackers.deathCount++;
      terminal.trackers.lastDeathType = "telesplat";
      terminal.trackers.deathTick = true;
    }
  }

  for (const onceGlitchTile of onceGlitchTilesTouched) {
    const replacementTileDef = TILE_CODE_TO_TYPE["*"];
    const sourceTileType = TILE_CODE_TO_TYPE["1"].type;
    floodFill(onceGlitchTile, sourceTileType, replacementTileDef, "solid", level);
    level.requestBackgroundRedraw = true;
  }

  // At this point we have either exited the dash on the other side of a glitch wall or died trying. Reset our speed cap
  // and get out of here. Also re-enable gracity.
  modifiedPlayer.friction = originalFriction;
  modifiedPlayer.acc = { x: 0, y: GRAVITY };
  modifiedPlayer.vel = { x: dashDirection.x * POST_DASH_VELOCITY, y: dashDirection.y * POST_DASH_VELOCITY };

  const start = player.pos;
  const dashDelta = { x: modifiedPlayer.pos.x - player.pos.x, y: modifiedPlayer.pos.y - player.pos.y };
  const dashDistance = Math.sqrt(dashDelta.x * dashDelta.x + dashDelta.y * dashDelta.y);
  const afterImageCount = Math.floor(dashDistance / MINIMUM_DISTANCE_BETWEEN_AFTERIMAGES);
  const afterImageDelta = { x: dashDelta.x / afterImageCount, y: dashDelta.y / afterImageCount };
  // Skip the starting point by starting at 1.
  for (let imageNumber = 0; imageNumber < afterImageCount; ++imageNumber) {
    modifiedPlayer.afterImages.push({
      x: start.x + imageNumber * afterImageDelta.x,
      y: start.y + imageNumber * afterImageDelta.y,
      ticksRemaining:
        MINIMUM_AFTERIMAGE_TICK_DURATION +
        (MAXIMUM_AFTERIMAGE_TICK_DURATION - MINIMUM_AFTERIMAGE_TICK_DURATION) * (imageNumber / afterImageCount),
    });
  }
  return modifiedPlayer;
}

export function updateCurrentState(player: PlayerEntity, level: Level, input: GameInput): PlayerEntity {
  return {
    ASPLODE: dyingState,
    VICTORY: victoryState,
    ASCENDING: walkingState,
    DASH_PREP: dashPrepState,
    DASHING: dashingState,
    DESCENDING: walkingState,
    JUMP_PREP: jumpInitState,
    DOUBLE_JUMP_PREP: doubleJumpInitState,
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
  } else if (state.ticksRemainingBeforeRechargeStarts === 0 && 1 <= player.entropy) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "STANDING", coyoteTime: COYOTE_TIME },
      },
    };
  }
  return player;
}

function updateStateStanding(player: PlayerEntity, input: GameInput): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "STANDING") return player;
  if (input.wantsToJump && player.lastJumpReleased) {
    playSfx("jump");
    return {
      ...player,
      lastJumpReleased: false,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "JUMP_PREP", ticksRemainingBeforeAscent: 10 },
      },
    };
  } else if (input.wantsToDash) {
    playSfx("dash");
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "DASH_PREP", ticksBeforeGlitchOff: DASH_CHARGE_FRAMES, dashDirection: input.dashDirection },
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
  if (input.wantsToJump && player.lastJumpReleased) {
    playSfx("jump");
    return {
      ...player,
      lastJumpReleased: false,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "JUMP_PREP", ticksRemainingBeforeAscent: 10 },
      },
    };
  } else if (input.wantsToDash) {
    playSfx("dash");
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "DASH_PREP", ticksBeforeGlitchOff: DASH_CHARGE_FRAMES, dashDirection: input.dashDirection },
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
        state: { type: "WALKING", coyoteTime: COYOTE_TIME },
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

function updateStatedDoubleJumpPrep(player: PlayerEntity): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "DOUBLE_JUMP_PREP") return player;
  if (0 < state.ticksRemainingBeforeAscent) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: {
          type: "DOUBLE_JUMP_PREP",
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
  const facing = player.vel.x < 0 ? Facing.Left : Facing.Right;
  if (state.type !== "ASCENDING") return player;
  if (input.wantsToDash) {
    playSfx("dash");
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        facing,
        state: { type: "DASH_PREP", ticksBeforeGlitchOff: DASH_CHARGE_FRAMES, dashDirection: input.dashDirection },
      },
    };
  } else if (input.wantsToJump && player.lastJumpReleased) {
    playSfx("doublejump");
    return {
      ...player,
      entropy: player.entropy - 1,
      lastJumpReleased: false,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "DOUBLE_JUMP_PREP", ticksRemainingBeforeAscent: 10 },
      },
    };
  } else if (player.vel.y >= 0) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        facing,
        state: { type: "DESCENDING" },
      },
    };
  }
  return { ...player, stateMachine: { ...player.stateMachine, facing } };
}

function updateStateDescending(player: PlayerEntity, input: GameInput): PlayerEntity {
  const { state } = player.stateMachine;
  const facing = player.vel.x < 0 ? Facing.Left : Facing.Right;
  if (state.type !== "DESCENDING") return player;
  if (input.wantsToDash) {
    playSfx("dash");
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        facing,
        state: { type: "DASH_PREP", ticksBeforeGlitchOff: DASH_CHARGE_FRAMES, dashDirection: input.dashDirection },
      },
    };
  } else if (input.wantsToJump && player.lastJumpReleased) {
    playSfx("doublejump");
    return {
      ...player,
      entropy: player.entropy - 1,
      lastJumpReleased: false,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "DOUBLE_JUMP_PREP", ticksRemainingBeforeAscent: 10 },
      },
    };
  } else if (player.grounded) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        facing,
        state: { type: "LANDING", ticksRemainingBeforeStanding: 10 },
      },
    };
  }
  return { ...player, stateMachine: { ...player.stateMachine, facing } };
}

function updateStateLanding(player: PlayerEntity, input: GameInput): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "LANDING") return player;
  if (input.wantsToDash) {
    playSfx("dash");
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "DASH_PREP", ticksBeforeGlitchOff: DASH_CHARGE_FRAMES, dashDirection: input.dashDirection },
      },
    };
  } else if (input.moveDirection !== HorizontalDirection.Neutral) {
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        facing: input.moveDirection === HorizontalDirection.Left ? Facing.Left : Facing.Right,
        state: { type: "WALKING", coyoteTime: COYOTE_TIME },
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
        state: { type: "STANDING", coyoteTime: COYOTE_TIME },
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
          dashDirection: input.dashDirection != "Forward" ? input.dashDirection : state.dashDirection,
        },
      },
    };
  } else if (state.ticksBeforeGlitchOff === 0) {
    return {
      ...player,
      entropy: player.entropy - 1,
      stateMachine: {
        ...player.stateMachine,
        state: {
          type: "DASHING",
          dashDirection: input.dashDirection != "Forward" ? input.dashDirection : state.dashDirection,
        },
      },
    };
  }
  return player;
}

// Note: lasts for just *one* frame
function updateStateDashing(player: PlayerEntity): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "DASHING") return player;
  if (player.isDead) {
    playSfx("death");
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "ASPLODE", framesDead: 0 },
      },
    };
  } else if (player.vel.y > 0) {
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
  return {
    ...player,
    stateMachine: {
      ...player.stateMachine,
      state: { type: "ASPLODE", framesDead: state.framesDead + 1 },
    },
  };
}

function updateStateVictory(player: PlayerEntity): PlayerEntity {
  const { state } = player.stateMachine;
  if (state.type !== "VICTORY") return player;
  // Experience Zen
  return {
    ...player,
    stateMachine: {
      ...player.stateMachine,
      state: { type: "VICTORY", framesVictorious: state.framesVictorious + 1 },
    },
  };
}

function updateActiveTile(player: PlayerEntity): PlayerEntity {
  if (player.stateMachine.state.type != "ASPLODE") {
    if (player.activeTile == "kill") {
      const terminal = getTerminal();
      if (terminal) {
        terminal.trackers.deathCount++;
        terminal.trackers.lastDeathType = "killPlane";
        terminal.trackers.deathTick = true;
      }
      playSfx("death");
      return {
        ...player,
        stateMachine: {
          ...player.stateMachine,
          state: { type: "ASPLODE", framesDead: 0 },
        },
      };
    }
  }
  if (player.stateMachine.state.type != "VICTORY") {
    if (player.activeTile == "exit") {
      playSfx("exit");
      return {
        ...player,
        stateMachine: {
          ...player.stateMachine,
          state: { type: "VICTORY", framesVictorious: 0 },
        },
      };
    }
  }
  return player;
}

function updateEntropy(player: PlayerEntity): PlayerEntity {
  if (
    player.entropy < 0 &&
    ["OUT_OF_ENTROPY", "DASH_PREP", "DASHING", "ASPLODE", "VICTORY"].findIndex(
      (state) => state === player.stateMachine.state.type
    ) === -1
  ) {
    // Forcefully yank the player out of any state when they run out of entropy.
    return {
      ...player,
      entropy: 0,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "OUT_OF_ENTROPY", ticksRemainingBeforeRechargeStarts: OUT_OF_ENTROPY_PENALTY_TICKS },
      },
    };
  }
  if (ENTROPY_LIMIT <= player.entropy && player.stateMachine.state.type !== "ASPLODE") {
    const terminal = getTerminal();
    if (terminal && !terminal.trackers.deathTick) {
      // resets may have already set this death
      terminal.trackers.deathCount++;
      terminal.trackers.lastDeathType = "overload";
      terminal.trackers.deathTick = true;
    }
    playSfx("death");
    return {
      ...player,
      stateMachine: {
        ...player.stateMachine,
        state: { type: "ASPLODE", framesDead: 0 },
      },
    };
  }
  const entropyGrowthRate = {
    normal: ENTROPY_BASE_RATE,
    dead: ENTROPY_DEAD_RATE,
    hot: ENTROPY_HOT_RATE,
  }[player.activeZone];

  const entropyCap = player.activeZone == "dead" ? 2 : ENTROPY_LIMIT;
  const newEntropy = Math.min(player.entropy + entropyGrowthRate, entropyCap);

  // figure out which "segment" of our pip charge we're in at the moment. If that changes, play a tick
  const oldEntropySegment = Math.floor(player.entropy / (1 / 16)) % 8;
  const newEntropySegment = Math.floor(newEntropy / (1 / 16)) % 8;
  if (oldEntropySegment != newEntropySegment) {
    const baseClickVolume = newEntropySegment % 2 == 0 ? 0.5 : 0.25;
    const zoneMultiplier = player.activeZone == "hot" ? 1.5 : 1.0;
    playSfx("geiger", baseClickVolume * zoneMultiplier);
  }

  // Switch to the appropriate BGM variant for the zone the player is standing in, if one exists
  if (player.activeZone == "dead") {
    queueBgmVariant("deadzone");
  } else {
    queueBgmVariant("normal");
  }

  const discreteOldEntropy = Math.floor(player.entropy);
  const discreteNewEntropy = Math.floor(newEntropy);
  const newEntropyInstability = player.entropyInstabilityCountdown.map((instability) =>
    instability <= 0 ? 0 : instability - 1
  );
  if (discreteOldEntropy < discreteNewEntropy && discreteNewEntropy < 6) {
    newEntropyInstability[discreteOldEntropy] = PIP_INSTABILITY_ANIMATION_TIME_TICKS;
  }
  return { ...player, entropy: newEntropy, entropyInstabilityCountdown: newEntropyInstability };
}

function updateAfterImages(player: PlayerEntity): PlayerEntity {
  return {
    ...player,
    afterImages: player.afterImages
      .map((image) => ({ ...image, ticksRemaining: image.ticksRemaining - 1 }))
      .filter(({ ticksRemaining }) => 0 < ticksRemaining),
  };
}

// Maybe this should be split out; the different updates are different events that can be pumped in. But this is a
// starting point.
export function updateStateMachine(player: PlayerEntity, input: GameInput): PlayerEntity {
  // There are two steps here (sort of parallel states) - updating entropy, and
  // the main player state.
  const entropyUpdatedPlayer = updateEntropy(player);
  const afterImageUpdatedPlayer = updateAfterImages(entropyUpdatedPlayer);
  const tileUpdatedPlayer = updateActiveTile(afterImageUpdatedPlayer);
  return {
    ASPLODE: updateStateDying,
    ASCENDING: updateStateAscending,
    DASH_PREP: updateStateDashPrep,
    DASHING: updateStateDashing,
    DESCENDING: updateStateDescending,
    JUMP_PREP: updateStateJumpPrep,
    DOUBLE_JUMP_PREP: updateStatedDoubleJumpPrep,
    STANDING: updateStateStanding,
    LANDING: updateStateLanding,
    OUT_OF_ENTROPY: updateStateOutOfEntropy,
    WALKING: updateStateWalking,
    VICTORY: updateStateVictory,
  }[player.stateMachine.state.type](tileUpdatedPlayer, input);
}

const sprites: Record<string, Image> = {};

export function loadPlayerSprites(): void {
  const { newImage } = love.graphics;
  sprites.standing = newImage("res/player-standing.png");
  sprites.entropyPip = newImage("res/player-entropy-pip.png");
}

export function activeZone(pos: Point, hitbox: HitBox, level: Level): ZoneMode {
  const sensedZones = hitbox.corners.map((corner) => sensorInZone(pos, corner, level));
  const activeZone = sensedZones.reduce((a, b) => {
    if (b == "dead") return b;
    if (b == "hot" && a == "normal") return b;
    return a;
  });
  return activeZone;
}

export function createPlayerEntity(pos: Point): PlayerEntity {
  return {
    type: "playerEntity",
    pos: pos,
    vel: { x: 0, y: 0 },
    acc: { x: 0, y: GRAVITY }, // generic, normally set to gravity, sometimes disabled
    directionalInfluenceAcc: 0, // set by movement code
    directionalInfluenceSpeedCap: MOVEMENT_SPEEDCAP,
    friction: { x: PLAYER_FRICTION, y: PLAYER_FRICTION },
    hitbox: {
      corners: [
        { x: 4, y: 2 },
        { x: 4, y: 14 },
        { x: 11, y: 2 },
        { x: 11, y: 14 },
      ],
    },
    groundHitbox: {
      corners: [
        { x: 4, y: 14 },
        { x: 11, y: 14 },
      ],
    },
    footSensor: { x: 8.0, y: 16 },
    tileSensor: { x: 8.0, y: 8.0 },
    entropy: 1,
    entropyPipOffsets: [
      { x: 0, y: -20 },
      { x: 10, y: -20 },
      { x: -10, y: -20 },
      { x: 20, y: -20 },
      { x: -20, y: -20 },
    ],
    entropyInstabilityCountdown: [0, 0, 0, 0, 0],
    stateMachine: {
      facing: Facing.Right,
      entropy: 0,
      state: { type: "STANDING", coyoteTime: COYOTE_TIME },
    },
    grounded: false,
    afterImages: [],
    lastJumpReleased: true,
    isDead: false,
    activeZone: "normal",
    activeTile: "empty",
    draw: (level, entity) => {
      if (entity.type !== "playerEntity") return;
      const { entropy } = entity;
      const x = Math.floor(entity.pos.x);
      const y = Math.floor(entity.pos.y);
      const { state } = entity.stateMachine;
      const flipHorizontally = entity.stateMachine.facing === Facing.Right;
      const entropyPercent = (entropy - 1) / (ENTROPY_LIMIT - 1);

      if (state.type !== "ASPLODE") {
        const totalPipGlitch = entity.entropyInstabilityCountdown.reduce((a, b) => a + b, 0);
        love.graphics.setColor(255, 255, 255);
        glitchedDraw(sprites.standing, x, y, {
          glitchRate: entropyPercent,
          spread: 3 + 1 - (totalPipGlitch / PIP_INSTABILITY_ANIMATION_TIME_TICKS) * ENTROPY_PIP_GAINED_GLITCH_SPREAD,
          mode: GlitchMode.Progressive,
          flipHorizontally,
        });
      } else if (state.framesDead < DEATH_ANIMATION_TICKS) {
        love.graphics.setColor(1, 1, 1);
        const deathAnimationPercent = state.framesDead / DEATH_ANIMATION_TICKS;
        const centeredDeathAnimationPercent = deathAnimationPercent - 0.5;
        glitchedDraw(sprites.standing, x, y, {
          glitchRate:
            entropyPercent * (1 - deathAnimationPercent * deathAnimationPercent) +
            (1 - 4 * (centeredDeathAnimationPercent * centeredDeathAnimationPercent)),
          spread: 3 + deathAnimationPercent * DEATH_ANIMATION_PIXEL_SPREAD,
          mode: deathAnimationPercent < 0.5 ? GlitchMode.Progressive : GlitchMode.GlitchOnly,
          flipHorizontally,
        });
      }

      // Draw after images
      entity.afterImages.forEach(({ x, y, ticksRemaining }) =>
        glitchedDraw(sprites.standing, x, y, {
          glitchRate: (8 / 16) * (ticksRemaining / MAXIMUM_AFTERIMAGE_TICK_DURATION),
        })
      );

      // Draw pips
      if (state.type === "ASPLODE") return;
      const redFactor = entropy < ENTROPY_LIMIT - 1 ? 1 : (Math.sin(20 * love.timer.getTime()) + 1) / 4 + 0.75;
      setColor(1, redFactor, redFactor);
      const center = { x: x + 16 / 2 - 2, y: y + 16 / 2 };
      entity.entropyPipOffsets.slice(0, Math.floor(entropy < 0 ? 0 : entropy)).forEach(({ x, y }, pipNumber) => {
        const instability = entity.entropyInstabilityCountdown[pipNumber];
        glitchedDraw(sprites.entropyPip, center.x + x, center.y + y, {
          glitchRate: 1 - instability / PIP_INSTABILITY_ANIMATION_TIME_TICKS,
          spread:
            (entity.entropyInstabilityCountdown[pipNumber] / PIP_INSTABILITY_ANIMATION_TIME_TICKS) *
            PIP_INSTABILITY_SPREAD,
        });
      });
    },
    update: (level, entity) => {
      if (entity.type != "playerEntity") return entity;

      const input = currentInput();
      if (!input.wantsToJump) {
        entity.lastJumpReleased = true;
      }
      if (input.wantsToReset) {
        const terminal = getTerminal();
        if (terminal && entity.entropy < ENTROPY_LIMIT - 1) {
          terminal.trackers.deathCount++;
          terminal.trackers.lastDeathType = "reset";
          terminal.trackers.deathTick = true;
        }
        entity.entropy = ENTROPY_LIMIT;
      }
      entity = updateStateMachine(entity, input);
      entity = updateCurrentState(entity, level, input);
      entity.activeZone = activeZone(entity.pos, entity.hitbox, level);
      entity.activeTile = sensorInPhysicalMode(entity.pos, entity.tileSensor, level);
      return entity;
    },
    drawEffect: {},
    spritesheetlocation: {},
  };
}
