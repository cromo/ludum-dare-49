export enum TileTypes {
  AIR,
  WALL,
}

export interface Level {
  tiles: TileTypes[][];
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
