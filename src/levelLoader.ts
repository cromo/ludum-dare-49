import { Entity, GlitchMode, LEVEL_HEIGHT, LEVEL_WIDTH, Level, PhysicalMode, TileTypes, ZoneMode } from "./models";

export interface LevelDefinition {
  layout: string[];
  annotations: LevelAnnotation[];
}

const DEFAULT_ANNO: LevelAnnotation = {
  symbol: " ",
  physicalMode: "solid",
  glitchMode: "solid",
};
const FULL_SOLID_WALL_ANNO: LevelAnnotation = {
  symbol: "#",
  physicalMode: "solid",
  glitchMode: "solid",
};
const GLITCHABLE_WALL_ANNO: LevelAnnotation = {
  symbol: "~",
  physicalMode: "solid",
  glitchMode: "empty",
};

// common collission stuff
const commonAnnotations: LevelAnnotation[] = [DEFAULT_ANNO, FULL_SOLID_WALL_ANNO, GLITCHABLE_WALL_ANNO];

interface LayoutLine {
  tiles: TileTypes[];
  physicalModes: PhysicalMode[];
  glitchModes: GlitchMode[];
  zoneModes: ZoneMode[];
  entities: Entity[];
}

const TILE_CODE_TO_TYPE: { [key: string]: TileTypes } = {
  " ": TileTypes.AIR,
  "*": TileTypes.WALL_BLOCK,
  "|": TileTypes.WALL_VERTICAL,
  "-": TileTypes.WALL_HORIZONTAL,
};

const tileCodeToTileType: (tileCode: string, log: (...items: string[]) => void) => TileTypes = (tileCode, log) => {
  if (TILE_CODE_TO_TYPE[tileCode]) return TILE_CODE_TO_TYPE[tileCode];
  log(`unknown tile code \"${tileCode}\"`);
  return TileTypes.AIR;
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
    const entities: Entity[] = [];
    return {
      tile: tileCodeToTileType(tile, log),
      annotation: annotationIndex[annotationKey] || DEFAULT_ANNO,
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
