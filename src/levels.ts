import { Entity, Level } from "./models";

let currentLevel: Level;

export function setCurrentLevel(level: Level): void {
  currentLevel = level;
}

export function getCurrentLevel(): Level {
  return currentLevel;
}

export function spawnEntity(entity: Entity): void {
  currentLevel.entities.push(entity);
}

export function despawnEntityByRef(entity: Entity): void {
  currentLevel.entities = currentLevel.entities.filter((e) => e != entity);
}
