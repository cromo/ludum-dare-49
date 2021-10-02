import { TileDef } from "./levelLoader";
import { PlayerEntity } from "./player";

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

export const LEVEL_HEIGHT = 22;
export const LEVEL_WIDTH = 40;
export const TILE_HEIGHT = 16;
export const TILE_WIDTH = 16;
export const TERMINAL_HEIGHT = 6;
export const TERMINAL_WIDTH = 9;

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
}

export type Entity = TerminalEntity | PlayerEntity | PlayerSpawnEntity;

export type EntityTypes = "playerEntity" | "playerSpawnEntity" | "terminalEntity";
export interface BaseEntity {
  type: EntityTypes;
  update: (entity: Entity) => void;
  draw: (entity: Entity) => void;
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
