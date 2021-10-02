import { Image } from "love.graphics";

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
export const TERMINAL_WIDTH = 12;

export const GRAVITY = 0.18;
export const WALKING_ACCELERATION = 0.2;
export const GROUND_FRICTION = 0.1;
export const AIR_FRICTION = 0.1;
export const JUMP_VELOCITY = 3.5;
export const DOUBLE_JUMP_VELOCITY = 3.5;

export type PhysicalMode = "empty" | "solid" | "semisolid" | "exit" | "kill";
export type GlitchMode = "empty" | "solid" | "glitch" | "glitch_once";
export type ZoneMode = "normal" | "dead" | "hot";

export interface Level {
  tiles: TileDef[][];
  physicalModes: PhysicalMode[][];
  glitchModes: GlitchMode[][];
  zoneModes: ZoneMode[][];
  entities: Entity[];
  // terminal: Terminal;
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
  speedCap: Vector;
  friction: Vector;
  hitbox: HitBox;
  footSensor: Point;
  zoneSensor: Point;
  entropy: number;
  stateMachine: PlayerStateMachine;
  grounded: boolean;
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
}

export interface Walking {
  type: "WALKING";
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

export interface PlayerStateMachine {
  facing: Facing;
  entropy: number;
  state: OutOfEntropy | Standing | Walking | JumpPrep | Ascending | Descending | Landing;
}

export interface LayoutLine {
  tiles: TileDef[];
  physicalModes: PhysicalMode[];
  glitchModes: GlitchMode[];
  zoneModes: ZoneMode[];
  entities: Entity[];
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
  data?: { [key: string]: string | number };
  terminal?: TerminalAnnotation;
}

export interface TerminalAnnotation {
  entrance: TerminalMessage[];
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

//Stop, don't add your code in here.
//interfaces, enums, and constants only
