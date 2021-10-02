import { parseLevelDefinition } from "./levelLoader";
// import { debugLevel } from "./levels/debugLevel";
import { sampleLevelEmpty } from "./levels/sampleLevel";
import { Level, LevelDefinition } from "./models";

// const levelDefinitions: LevelDefinition[] = [debugLevel];

// const levels = levelDefinitions.map((levelDefinition) => parseLevelDefinition(levelDefinition));

// export default levels;

let currentLevel = parseLevelDefinition(sampleLevelEmpty);

export function loadLevel(levelDefinition: LevelDefinition): void {
  currentLevel = parseLevelDefinition(levelDefinition);
}

export function getCurrentLevel(): Level {
  return currentLevel;
}
