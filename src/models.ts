import { Image } from "love.graphics";

import { DashDirection } from "./input";

export enum TileTypes {
  AIR = " ",
  WALL_VERTICAL = "|",
  WALL_HORIZONTAL = "-",
  WALL_BLOCK = "*",
  GLITCH_WALL = "~",
  ONCE_WALL = "1",
  SEMI_SOLID = "^",
  ENTRANCE_CONDUIT = "S",
  EXIT_CONDUIT = "F",
  KILL_PLANE = "K",
}

// 1920 x 1080
// 16 x 16 tiles (and character?)
// x2 scale: 60 x 33(.75)
// x3 scale: 40 x 22(.5)
// x4 scale: 30 x 16(.8)

export const GAME_SCALE = 2;

export const LEVEL_HEIGHT = 22;
export const LEVEL_WIDTH = 40;
export const TILE_SIZE_PIXELS = 16;
export const TILE_HEIGHT = TILE_SIZE_PIXELS;
export const TILE_WIDTH = TILE_SIZE_PIXELS;
export const TERMINAL_HEIGHT = 5;
export const TERMINAL_WIDTH = 14;

export const GRAVITY = 0.18;
export const MOVEMENT_ACCELERATION = 0.2;
export const MOVEMENT_SPEEDCAP = 2;
export const PLAYER_FRICTION = 0.05;
export const JUMP_VELOCITY = 3.5;
export const DOUBLE_JUMP_VELOCITY = 3.5;
export const DASH_LENGTH = 8; // measured in half-tiles, when moving in a cardinal direction. Normalized, diagonals are shorter
export const EXTENDED_DASH_SAFETY_LIMIT = 255; // measured in half-tiles; should be comfortably more than the length of the widest level
export const POST_DASH_VELOCITY = 4; // speed, in the direction of the dash, after the teleport effect ends. "Wheeeeee4!#~"
export const DASH_CHARGE_FRAMES = 10;
export const COYOTE_TIME = 5; // frames

export const RESET_DURATION_TICKS = 60;
export const VICTORY_DURATION_TICKS = 60;
export const DEATH_ANIMATION_TICKS = (1 / 2) * RESET_DURATION_TICKS;
export const DEATH_ANIMATION_PIXEL_SPREAD = 400;

export const MINIMUM_DISTANCE_BETWEEN_AFTERIMAGES = 18;
export const MINIMUM_AFTERIMAGE_TICK_DURATION = 3;
export const MAXIMUM_AFTERIMAGE_TICK_DURATION = 30;

// Add a pip every four seconds (4 * 60 ticks)
export const ENTROPY_BASE_RATE = 1 / (4 * 60);
export const ENTROPY_DEAD_RATE = 1 / (8 * 60);
export const ENTROPY_HOT_RATE = 1 / (2 * 60);
export const PIP_INSTABILITY_ANIMATION_TIME_TICKS = 15;
export const PIP_INSTABILITY_SPREAD = 10;
export const OUT_OF_ENTROPY_PENALTY_TICKS = 10;
export const ENTROPY_LIMIT = 6;
export const ENTROPY_PIP_GAINED_GLITCH_SPREAD = 30;

// Terminal timing constants
export const TERMINAL_FILLER_COOLDOWN_TICKS = 30;
export const TERMINAL_IDLE_AFTER_NO_PLAYER_INPUT_FOR_TICKS = 960;
// GENERAL_FILLER should be larger than TERMINAL_FILLER_COOLDOWN_TICKS
export const TERMINAL_GENERAL_FILLER_COOLDOWN_TICKS = 180;

export type PhysicalMode = "empty" | "solid" | "semisolid" | "exit" | "kill";
export type GlitchMode = "empty" | "solid" | "glitch" | "glitch_once";
export type ZoneMode = "normal" | "dead" | "hot";

export interface Level {
  tiles: TileDef[][]; //y, x
  physicalModes: PhysicalMode[][]; //y, x
  glitchModes: GlitchMode[][]; //y, x
  zoneModes: ZoneMode[][]; //y, x
  customTags: string[][][]; //y, x, 0 or more tags
  entities: Entity[];
  // terminal: Terminal;
  levelDef: LevelDefinition;
  doRestart?: true; // true = reload this level (when you die)
  nextLevel?: true; // true = go to the next level in the level sequence (normal)
  gotoLevel?: LevelDefinition; // go to a specific level (storytelling)
  requestBackgroundRedraw?: true;
}

export interface Point {
  x: number;
  y: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface HitBox {
  corners: Point[];
}

export interface TerminalEntity extends BaseEntity {
  type: "terminalEntity";
  pos: Point;
  terminalAnotation: TerminalAnnotation;
  lines: TerminalMessage[];
  trackers: TerminalTrackers;
}

export type Entity = TerminalEntity | PlayerEntity | PlayerSpawnEntity;

export type EntityTypes = "playerEntity" | "playerSpawnEntity" | "terminalEntity";
export interface BaseEntity {
  type: EntityTypes;
  update: (level: Level, entity: Entity) => Entity;
  draw: (level: Level, entity: Entity) => void;
}

export interface VisibleEntity extends BaseEntity {
  pos: Point;
  drawEffect: {};
  spritesheetlocation: {};
}

export interface PlayerSpawnEntity extends BaseEntity {
  type: "playerSpawnEntity";
  pos: Point;
}

export interface PlayerEntity extends VisibleEntity {
  type: "playerEntity";
  pos: Point;
  vel: Vector;
  acc: Vector;
  friction: Vector;
  directionalInfluenceAcc: number;
  directionalInfluenceSpeedCap: number;
  hitbox: HitBox;
  groundHitbox: HitBox;
  footSensor: Point;
  tileSensor: Point;
  entropy: number;
  entropyPipOffsets: Vector[];
  entropyInstabilityCountdown: number[];
  stateMachine: PlayerStateMachine;
  grounded: boolean;
  afterImages: (Vector & { ticksRemaining: number })[];
  lastJumpReleased: boolean;
  isDead: boolean;
  activeZone: ZoneMode;
  activeTile: PhysicalMode;
}

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
  coyoteTime: number;
}

export interface Walking {
  type: "WALKING";
  coyoteTime: number;
}

export interface JumpPrep {
  type: "JUMP_PREP";
  ticksRemainingBeforeAscent: number;
}

export interface DoubleJumpPrep {
  type: "DOUBLE_JUMP_PREP";
  ticksRemainingBeforeAscent: number;
}

export interface Ascending {
  type: "ASCENDING";
}

export interface Descending {
  type: "DESCENDING";
}

export interface Landing {
  type: "LANDING";
  ticksRemainingBeforeStanding: number;
}

export interface DashPrep {
  type: "DASH_PREP";
  ticksBeforeGlitchOff: number;
  dashDirection: DashDirection;
}

export interface Dashing {
  // muy guapo, no?
  type: "DASHING";
  dashDirection: DashDirection;
}

export interface Asplode {
  type: "ASPLODE";
  framesDead: number;
}

export interface Victory {
  type: "VICTORY";
  framesVictorious: number;
}

export interface PlayerStateMachine {
  facing: Facing;
  entropy: number;
  state:
    | OutOfEntropy
    | Standing
    | Walking
    | JumpPrep
    | DoubleJumpPrep
    | Ascending
    | Descending
    | Landing
    | DashPrep
    | Dashing
    | Asplode
    | Victory;
}

export interface LayoutLine {
  tiles: TileDef[];
  physicalModes: PhysicalMode[];
  glitchModes: GlitchMode[];
  zoneModes: ZoneMode[];
  entities: Entity[];
  customTags: string[][];
}

export interface TileDef {
  type: TileTypes;
  image: Image;
  effect?: TileEffect;
}

export interface TileEffect {
  glitchyLevel?: number;
}

export const TILE_CODE_TO_TYPE: { [key: string]: TileDef } = {};

export function buildStructresAtInit(): void {
  TILE_CODE_TO_TYPE[" "] = { type: TileTypes.AIR, image: love.graphics.newImage("res/air.png") };
  TILE_CODE_TO_TYPE["*"] = { type: TileTypes.WALL_BLOCK, image: love.graphics.newImage("res/wall.png") };
  TILE_CODE_TO_TYPE["|"] = { type: TileTypes.WALL_VERTICAL, image: love.graphics.newImage("res/wall-vertical.png") };
  TILE_CODE_TO_TYPE["-"] = {
    type: TileTypes.WALL_HORIZONTAL,
    image: love.graphics.newImage("res/wall-horizontal.png"),
  };
  TILE_CODE_TO_TYPE["^"] = { type: TileTypes.SEMI_SOLID, image: love.graphics.newImage("res/semisolid.png") };
  TILE_CODE_TO_TYPE["~"] = {
    type: TileTypes.GLITCH_WALL,
    image: love.graphics.newImage("res/wall-glitch.png"),
    effect: { glitchyLevel: 2 / 16 },
  };
  TILE_CODE_TO_TYPE["S"] = {
    type: TileTypes.ENTRANCE_CONDUIT,
    image: love.graphics.newImage("res/conduit-entrance.png"),
    effect: { glitchyLevel: 1 / 16 },
  };
  TILE_CODE_TO_TYPE["F"] = {
    type: TileTypes.EXIT_CONDUIT,
    image: love.graphics.newImage("res/conduit-exit.png"),
    effect: { glitchyLevel: 1 / 16 },
  };
  TILE_CODE_TO_TYPE["1"] = {
    type: TileTypes.ONCE_WALL,
    image: love.graphics.newImage("res/wall-once.png"),
    effect: { glitchyLevel: 1 / 16 },
  };
  TILE_CODE_TO_TYPE["K"] = { type: TileTypes.KILL_PLANE, image: love.graphics.newImage("res/kill.png") };
}

export interface LevelDefinition {
  layout: string[];
  annotations: LevelAnnotation[];
}

export enum LevelAnnotationFlag {
  "spawn_player",
  "terminal",
}

export interface LevelAnnotation {
  symbol: string;
  physicalMode?: PhysicalMode;
  glitchMode?: GlitchMode;
  zoneMode?: ZoneMode;
  // For adding entities and other special stuff:
  flags?: LevelAnnotationFlag[];
  customTags?: string[]; // tags for terminal tracking, tied to the tile
  data?: { [key: string]: string | number };
  terminal?: TerminalAnnotation;
}

export interface TerminalAnnotation {
  onSpawn?: TerminalMessage[];
  // onDeath?: TerminalMessage[];
  onKillPlaneDeath?: TerminalMessage[];
  onOverloadDeath?: TerminalMessage[];
  onTelesplatDeath?: TerminalMessage[];
  onResetDeath?: TerminalMessage[];
  onOOBDeath?: TerminalMessage[];

  idleMessages?: TerminalMessage[];
  deadZoneMessages?: TerminalMessage[];
  hotZoneMessages?: TerminalMessage[];
  normalZoneMessages?: TerminalMessage[];
  generalMessages?: TerminalMessage[];

  trackTags: string[];
  conversations: TerminalConversationAnnotation[];
}

export interface TerminalMessage {
  text: string;
  tone: TerminalTone;
}

export enum TerminalTone {
  emptyLine,
  angry,
  frustrated,
  glitchy,
  tease,
  serious,
  teach,
}
export interface TerminalTrackers {
  // filler messages:
  ticksSinceLastFillerMessage: number;
  spawnTick: boolean; // onSpawn
  deathTick: boolean; // onDeath - the moment the player dies but before the level resets
  ticksOfPlayerIdling: number;
  ticksInDeadZone: number;
  ticksInHotZone: number;
  ticksInTopHalf: number;
  ticksInBottomHalf: number;
  ticksInLeftHalf: number;
  ticksInRightHalf: number;
  ticksSinceSpawn: number; // on this single life
  ticksOnLevel: number; // across all lives

  deathCount: number; // number of times player died on this level
  deathsByKillPlane: number;
  deathsByOverload: number;
  deathsByOOB: number;
  deathsByTelesplat: number;
  deathsByReset: number;
  lastDeathType: "none" | "killPlane" | "overload" | "OOB" | "telesplat" | "reset";

  trackedTag: TerminalTrackedTag[];

  // conversations track their own progress and have highest priority / show immediately
  conversations: TerminalConversation[];

  onSpawnProgress: number;
  onKillPlaneDeathProgress: number;
  onOverloadDeathProgress: number;
  onOOBDeathProgress: number;
  onTelesplatDeathProgress: number;
  onResetDeathProgress: number;

  idleMessagesProgress: number;
  deadZoneMessagesProgress: number;
  hotZoneMessagesProgress: number;
  normalZoneMessagesProgress: number;
  generalMessagesProgress: number;
}

export interface TerminalTrackedTag {
  tag: string;
  enteredYetThisLife: boolean;
  ticksThisLife: number;
  timesEnteredAtLeastOnce: number;
}

export interface TerminalConversation extends TerminalConversationAnnotation {
  progress: number; // start at 0 until reaching the end of the conversation
}

export interface TerminalConversationAnnotation {
  name: string; // for debugging
  steps: TerminalConversationStep[];
}

export type checkFn = (stats: {
  player?: PlayerEntity;
  terminal: TerminalEntity;
  track: TerminalTrackers;
  level: Level;
}) => boolean;

export interface TerminalConversationStep {
  check: checkFn;
  run?: (stats: { player?: PlayerEntity; terminal: TerminalEntity; track: TerminalTrackers; level: Level }) => void;
  message?: TerminalMessage;
}

//Stop, don't add your code in here.
//interfaces, enums, and constants only
