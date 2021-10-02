import { Image } from "love.graphics";

import { Entity, GlitchMode, LEVEL_HEIGHT, LEVEL_WIDTH, Level, PhysicalMode, TileTypes, ZoneMode } from "./models";

export interface LevelDefinition {
  layout: string[];
  annotations: LevelAnnotation[];
}

const DEFAULT_ANNO: LevelAnnotation = {
  symbol: ".",
};
const FULL_SOLID_WALL_ANNO: LevelAnnotation = {
  symbol: "#",
  physicalMode: "solid",
  glitchMode: "solid",
};
const GLITCHABLE_WALL_ANNO: LevelAnnotation = {
  symbol: "~",
  physicalMode: "solid",
  glitchMode: "glitch",
};
const ONCE_WALL_ANNO: LevelAnnotation = {
  symbol: "1",
  physicalMode: "solid",
  glitchMode: "glitch_once",
};
const SEMI_SOLID_ANNO: LevelAnnotation = {
  symbol: "^",
  physicalMode: "semisolid",
};
const DEAD_ZONE_ANNO: LevelAnnotation = {
  symbol: "_",
  zoneMode: "dead",
};
const HOT_ZONE_ANNO: LevelAnnotation = {
  symbol: "!",
  zoneMode: "hot",
};
const ENTRANCE_CONDUIT_ANNO: LevelAnnotation = {
  symbol: "S",
  flags: ["entrance_conduit"],
};
const EXIT_CONDUIT_ANNO: LevelAnnotation = {
  symbol: "F",
  physicalMode: "exit",
  glitchMode: "solid",
};
const KILL_PLANE_ANNO: LevelAnnotation = {
  symbol: "K",
  physicalMode: "kill",
  glitchMode: "solid",
};

// common collission stuff
const commonAnnotations: LevelAnnotation[] = [
  DEFAULT_ANNO,
  FULL_SOLID_WALL_ANNO,
  GLITCHABLE_WALL_ANNO,
  ONCE_WALL_ANNO,
  SEMI_SOLID_ANNO,
  DEAD_ZONE_ANNO,
  HOT_ZONE_ANNO,
  ENTRANCE_CONDUIT_ANNO,
  EXIT_CONDUIT_ANNO,
  KILL_PLANE_ANNO,
];

interface LayoutLine {
  tiles: TileDef[];
  physicalModes: PhysicalMode[];
  glitchModes: GlitchMode[];
  zoneModes: ZoneMode[];
  entities: Entity[];
}

export interface TileDef {
  type: TileTypes;
  image: Image;
}
const TILE_CODE_TO_TYPE: { [key: string]: TileDef } = {
  " ": { type: TileTypes.AIR, image: love.graphics.newImage("res/air.png") },
  "*": { type: TileTypes.WALL_BLOCK, image: love.graphics.newImage("res/wall.png") },
  "|": { type: TileTypes.WALL_VERTICAL, image: love.graphics.newImage("res/wall-vertical.png") },
  "-": { type: TileTypes.WALL_HORIZONTAL, image: love.graphics.newImage("res/wall-horizontal.png") },
  "^": { type: TileTypes.SEMI_SOLID, image: love.graphics.newImage("res/semisolid.png") },
  "~": { type: TileTypes.GLITCH_WALL, image: love.graphics.newImage("res/wall-glitch.png") },
  S: { type: TileTypes.ENTRANCE_CONDUIT, image: love.graphics.newImage("res/conduit-entrance.png") },
  F: { type: TileTypes.EXIT_CONDUIT, image: love.graphics.newImage("res/conduit-exit.png") },
  "1": { type: TileTypes.ONCE_WALL, image: love.graphics.newImage("res/wall-once.png") },
  K: { type: TileTypes.KILL_PLANE, image: love.graphics.newImage("res/kill.png") },
};

const tileCodeToTileType: (tileCode: string, log: (...items: string[]) => void) => TileDef = (tileCode, log) => {
  if (TILE_CODE_TO_TYPE[tileCode]) return TILE_CODE_TO_TYPE[tileCode];
  log(`unknown tile code \"${tileCode}\"`);
  return TILE_CODE_TO_TYPE[TileTypes.AIR];
};

const lineToPairs = (line: string): { tile: string; annotationKey: string }[] => {
  const pairs: { tile: string; annotationKey: string }[] = [];
  for (let i = 0; i < line.length; i += 2) {
    pairs.push({
      tile: line.charAt(i),
      annotationKey: line.charAt(i + 1),
    });
  }
  return pairs;
};

const parseLayoutLine = (annotationIndex: { [key: string]: LevelAnnotation }, log: (...items: string[]) => void) => (
  line: string
): LayoutLine => {
  const annotatedPairs = lineToPairs(line).map(({ tile, annotationKey }) => {
    if (annotationIndex[annotationKey] == undefined) {
      log(`unknown annotation key \"${annotationKey}\"`);
    }
    const annotation = annotationIndex[annotationKey] || DEFAULT_ANNO;
    const entities: Entity[] = [];
    // if (annotation.flags?.includes("player_spawn")) {
    //   const playerSpawnEntity: PlayerSpawnEntity = {
    //     type: "playerSpawnEntity",
    //     pos: { x: 5, y: 5 }, //TODO: get position from place in level
    //     update: (entity) => {
    //       /*actually spawn the player now lol*/
    //       const level = getCurrentLevel();

    //       // remove the player spawner
    //       level.entities = level.entities.filter((entity) => entity.type != "playerSpawnEntity");

    //       //@nick add an actual player entity here
    //       level.entities.push(createPlayerEntity(entity.pos));
    //       print("PLAYER SPAWNING");
    //     },
    //     draw: () => {
    //       return;
    //     },
    //   };
    //   entities.push(playerSpawnEntity);
    // }

    return {
      tile: tileCodeToTileType(tile, log),
      annotation,
      entities: entities,
    };
  });

  return {
    tiles: annotatedPairs.map((p) => p.tile),
    physicalModes: annotatedPairs.map((p) => p.annotation.physicalMode || "empty"),
    glitchModes: annotatedPairs.map((p) => p.annotation.glitchMode || "empty"),
    zoneModes: annotatedPairs.map((p) => p.annotation.zoneMode || "normal"),
    entities: annotatedPairs.flatMap((p) => p.entities),
  };
};

// constructs a new playable level from a level definition, but doesn't activate it yet
export function parseLevelDefinition(ld: LevelDefinition): Level {
  const { annotations: extraAnnotations, layout } = ld;
  const levelAnnotations = [...commonAnnotations, ...extraAnnotations];
  const logLines: string[] = [];
  const log = (...foo: string[]): number => logLines.push(...foo);
  const annotationIndex: { [key: string]: LevelAnnotation } = Object.fromEntries(
    levelAnnotations.map((la) => [la.symbol, la])
  );

  const levelWidth = layout[0].length / 2;
  const levelHeight = layout.length;

  if (levelHeight != LEVEL_HEIGHT || levelWidth != LEVEL_WIDTH) {
    log(`unexpected level dimensions of ${levelHeight} x ${levelWidth}`);
  }
  layout.forEach((line, index) => {
    if (line.length / 2 != LEVEL_WIDTH) {
      log(`line ${index} is the incorrect width at ${line.length / 2}`);
    }
  });

  const parsedLayout = layout.map((line) => parseLayoutLine(annotationIndex, (l) => log(l))(line));

  // extract the 2d maps for tiles, physical modes, glitch modes, and all of the entities in the level
  const tiles = parsedLayout.map((pl) => pl.tiles);
  const physicalModes = parsedLayout.map((pl) => pl.physicalModes);
  const glitchModes = parsedLayout.map((pl) => pl.glitchModes);
  const zoneModes = parsedLayout.map((pl) => pl.zoneModes);
  const entities = parsedLayout.flatMap((pl) => pl.entities);

  if (logLines.length > 0) {
    print("problems loading level");
    logLines.forEach((line) => print(line));
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    tiles,
    physicalModes,
    glitchModes,
    zoneModes,
    entities,
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LevelAnnotation {
  symbol: string;
  physicalMode?: PhysicalMode;
  glitchMode?: GlitchMode;
  zoneMode?: ZoneMode;
  // For adding entities and other special stuff:
  flags?: string[];
  data?: { [key: string]: string | number };
}
