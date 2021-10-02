import { LevelAnnotation, LevelAnnotationFlag } from "./models";

export const DEFAULT_ANNO: LevelAnnotation = {
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
  flags: [LevelAnnotationFlag.spawn_player],
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

// common annotations stuff
export const COMMON_ANNOTATIONS: LevelAnnotation[] = [
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
