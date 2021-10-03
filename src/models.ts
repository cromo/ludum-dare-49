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
export const POST_DASH_VELOCITY = 4; // speed, in the direction of the dash, after the teleport effect ends. "Wheeeeee4!#~"
export const COYOTE_TIME = 5; // frames

export const RESET_DURATION_TICKS = 60;
export const DEATH_ANIMATION_TICKS = (1 / 2) * RESET_DURATION_TICKS;
export const DEATH_ANIMATION_PIXEL_SPREAD = 400;

// Add a pip every four seconds (4 * 60 ticks)
export const ENTROPY_BASE_RATE = 1 / (4 * 60);
export const ENTROPY_DEAD_RATE = 1 / (8 * 60);
export const ENTROPY_HOT_RATE = 1 / (2 * 60);
export const PIP_INSTABILITY_ANIMATION_TIME_TICKS = 15;
export const PIP_INSTABILITY_SPREAD = 10;
export const OUT_OF_ENTROPY_PENALTY_TICKS = 10;
export const ENTROPY_LIMIT = 6;
export const ENTROPY_PIP_GAINED_GLITCH_SPREAD = 30;

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
  footSensor: Point;
  zoneSensor: Point;
  entropy: number;
  entropyPipOffsets: Vector[];
  entropyInstabilityCountdown: number[];
  stateMachine: PlayerStateMachine;
  grounded: boolean;
  isDead: boolean;
  activeZone: ZoneMode;
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

export interface PlayerStateMachine {
  facing: Facing;
  entropy: number;
  state: OutOfEntropy | Standing | Walking | JumpPrep | Ascending | Descending | Landing | DashPrep | Dashing | Asplode;
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
  onDeath?: TerminalMessage[];

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
  ticksSincePlayerInput: number;
  ticksInDeadZone: number;
  ticksInHotZone: number;
  ticksInTopHalf: number;
  ticksInBottomHalf: number;
  ticksInLeftHalf: number;
  ticksInRightHalf: number;
  ticksSinceSpawn: number; // on this single life
  ticksOnLevel: number; // across all lives

  deathCount: number; // number of times player died on this level

  trackedTag: TerminalTrackedTag[];

  // conversations track their own progress and have highest priority / show immediately
  conversations: TerminalConversation[];

  onSpawnProgress: number;
  onDeathProgress: number;
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

export interface TerminalConversationStep {
  check: (stats: { player?: PlayerEntity; terminal: TerminalEntity; track: TerminalTrackers; level: Level }) => boolean;
  run?: (stats: { player?: PlayerEntity; terminal: TerminalEntity; track: TerminalTrackers; level: Level }) => void;
  message?: TerminalMessage;
}

//Stop, don't add your code in here.
//interfaces, enums, and constants only
