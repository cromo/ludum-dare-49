import {
  Level,
  PlayerEntity,
  TerminalConversationStep,
  TerminalEntity,
  TerminalMessage,
  TerminalTone,
  TerminalTrackers,
} from "../models";

const sayWithTone = (tone: TerminalTone) => (text: string): TerminalMessage => {
  return {
    text,
    tone,
  };
};

export const angry = sayWithTone(TerminalTone.angry);

export const frustrated = sayWithTone(TerminalTone.frustrated);

export const glitchy = sayWithTone(TerminalTone.glitchy);

export const serious = sayWithTone(TerminalTone.serious);

export const teach = sayWithTone(TerminalTone.teach);

export const tease = sayWithTone(TerminalTone.tease);

export const step = (
  check: (stats: { player?: PlayerEntity; terminal: TerminalEntity; track: TerminalTrackers; level: Level }) => boolean,
  message: TerminalMessage
): TerminalConversationStep => {
  return {
    check,
    message,
  };
};

export type checkFn = (stats: {
  player?: PlayerEntity;
  terminal: TerminalEntity;
  track: TerminalTrackers;
  level: Level;
}) => boolean;

export type stupidCheckFn = (
  self: unknown,
  stats: {
    player?: PlayerEntity;
    terminal: TerminalEntity;
    track: TerminalTrackers;
    level: Level;
  }
) => boolean;

const checkRespawnCountStupid: (deathCount: number) => stupidCheckFn = (targetCount) => (
  self: unknown,
  { track: { spawnTick, deathCount } }
): boolean => spawnTick && deathCount == targetCount;

export const checkRespawnCount = checkRespawnCountStupid as (deathCount: number) => checkFn;
