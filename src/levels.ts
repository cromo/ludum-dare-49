import { LevelDefinition, parseLevelDefinition } from "./levelLoader";
import { debugLevel } from "./levels/debugLevel";
import { Level } from "./models";

const levelDefinitions: LevelDefinition[] = [debugLevel];

const levels = levelDefinitions.map((levelDefinition) => parseLevelDefinition(levelDefinition));

export default levels;

const currentLevel = levels[0];

export function getCurrentLevel(): Level {
  return currentLevel;
}
