import { Entity, Level, PlayerEntity, TerminalEntity } from "./models";

let currentLevel: Level;

export function setCurrentLevel(level: Level): void {
  currentLevel = level;
}

export function getCurrentLevel(): Level {
  return currentLevel;
}

export function getPlayer(): PlayerEntity | undefined {
  const players = currentLevel.entities.filter(({ type }) => type == "playerEntity");
  if (players.length == 1) return players[0] as PlayerEntity;
  return undefined;
}

export function getTerminal(): TerminalEntity | undefined {
  const terminals = currentLevel.entities.filter(({ type }) => type == "terminalEntity");
  if (terminals.length == 1) return terminals[0] as TerminalEntity;
  return undefined;
}

export function spawnEntity(entity: Entity): void {
  currentLevel.entities.push(entity);
}

export function despawnEntityByRef(entity: Entity): void {
  currentLevel.entities = currentLevel.entities.filter((e) => e != entity);
}
