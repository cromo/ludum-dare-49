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
  TILE_CODE_TO_TYPE,
  TILE_SIZE_PIXELS,
  TileDef,
  TileTypes,
} from "./models";
import { createPlayerEntity } from "./player";
import { createTerminalEntity } from "./terminal";

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
    const flags = annotation.flags || [];

    if (flags.includes(LevelAnnotationFlag.spawn_player)) {
      entities.push(createPlayerEntity(pos));
    }
    if (flags.includes(LevelAnnotationFlag.terminal)) {
      if (annotation.terminal) {
        entities.push(createTerminalEntity(pos, annotation.terminal));
      } else {
        log("terminal flag set but no terminal annotation found");
      }
    }

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
    customTags: annotatedPairs.map((p) => p.annotation.customTags || []),
  };
};

// constructs a new playable level from a level definition, but doesn't activate it yet
export function parseLevelDefinition(levelDef: LevelDefinition): Level {
  const { annotations: extraAnnotations, layout } = levelDef;
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
  const customTags = parsedLayout.map((pl) => pl.customTags);

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
    levelDef,
    customTags,
  };
}
