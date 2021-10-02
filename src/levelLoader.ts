import { COMMON_ANNOTATIONS, DEFAULT_ANNO } from "./levelAnnotations";
import {
  Entity,
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  LayoutLine,
  Level,
  LevelAnnotation,
  LevelAnnotationFlag,
  LevelDefinition,
  Point,
  TILE_SIZE_PIXELS,
  TileDef,
  TileTypes,
} from "./models";
import { createPlayerEntity } from "./player";

love.graphics.setDefaultFilter("nearest");
const TILE_CODE_TO_TYPE: { [key: string]: TileDef } = {
  " ": { type: TileTypes.AIR, image: love.graphics.newImage("res/air.png") },
  "*": { type: TileTypes.WALL_BLOCK, image: love.graphics.newImage("res/wall.png") },
  "|": { type: TileTypes.WALL_VERTICAL, image: love.graphics.newImage("res/wall-vertical.png") },
  "-": { type: TileTypes.WALL_HORIZONTAL, image: love.graphics.newImage("res/wall-horizontal.png") },
  "^": { type: TileTypes.SEMI_SOLID, image: love.graphics.newImage("res/semisolid.png") },
  "~": {
    type: TileTypes.GLITCH_WALL,
    image: love.graphics.newImage("res/wall-glitch.png"),
    effect: { glitchyLevel: 5 },
  },
  S: {
    type: TileTypes.ENTRANCE_CONDUIT,
    image: love.graphics.newImage("res/conduit-entrance.png"),
    effect: { glitchyLevel: 3 },
  },
  F: {
    type: TileTypes.EXIT_CONDUIT,
    image: love.graphics.newImage("res/conduit-exit.png"),
    effect: { glitchyLevel: 3 },
  },
  "1": { type: TileTypes.ONCE_WALL, image: love.graphics.newImage("res/wall-once.png"), effect: { glitchyLevel: 3 } },
  K: { type: TileTypes.KILL_PLANE, image: love.graphics.newImage("res/kill.png") },
};

const tileCodeToTileType: (tileCode: string, log: (...items: string[]) => void) => TileDef = (tileCode, log) => {
  if (TILE_CODE_TO_TYPE[tileCode]) return TILE_CODE_TO_TYPE[tileCode];
  log(`unknown tile code \"${tileCode}\"`);
  return TILE_CODE_TO_TYPE[TileTypes.AIR];
};

const lineToPairs = (line: string, y: number): { tile: string; annotationKey: string; pos: Point }[] => {
  const pairs: { tile: string; annotationKey: string; pos: Point }[] = [];
  for (let i = 0; i < line.length; i += 2) {
    pairs.push({
      tile: line.charAt(i),
      annotationKey: line.charAt(i + 1),
      pos: { x: (i / 2) * TILE_SIZE_PIXELS, y: y * TILE_SIZE_PIXELS },
    });
  }
  return pairs;
};

const parseLayoutLine = (
  annotationIndex: { [key: string]: LevelAnnotation },
  y: number,
  log: (...items: string[]) => void,
  line: string
): LayoutLine => {
  const annotatedPairs = lineToPairs(line, y).map(({ tile, annotationKey, pos }) => {
    if (annotationIndex[annotationKey] == undefined) {
      log(`unknown annotation key \"${annotationKey}\"`);
    }
    const annotation = annotationIndex[annotationKey] || DEFAULT_ANNO;
    const entities: Entity[] = [];
    if (annotation.flags && annotation.flags.includes(LevelAnnotationFlag.spawn_player)) {
      entities.push(createPlayerEntity(pos));
    }
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
  const levelAnnotations = [...COMMON_ANNOTATIONS, ...extraAnnotations];
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

  const parsedLayout = layout.map((line, y) => parseLayoutLine(annotationIndex, y, (l) => log(l), line));

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

  return {
    tiles,
    physicalModes,
    glitchModes,
    zoneModes,
    entities,
  };
}
