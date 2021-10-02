export enum TileTypes {
  AIR,
  WALL_VERTICAL,
  WALL_HORIZONTAL,
  WALL_BLOCK,
}

export const LEVEL_HEIGHT = 100;
export const LEVEL_WIDTH = 100;

export type PhysicalMode = "empty" | "solid" | "semisolid" | "exit";
export type GlitchMode = "empty" | "solid" | "glitch";
export type ZoneMode = "normal" | "dead" | "hot";

export interface Level {
  tiles: TileTypes[][];
  physicalModes: PhysicalMode[][];
  glitchModes: GlitchMode[][];
  zoneModes: ZoneMode[][];
  entities: Entity[];
}

export interface Entity {
  update: (entity: Entity) => void;
}

export interface VisibleEntity extends Entity {
  pos: {
    x: number;
    y: number;
  };
  drawEffect: {};
  spritesheetlocation: {};
}

export interface PlayerEntity extends VisibleEntity {
  entropy: number;
}
