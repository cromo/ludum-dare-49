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
    check: (x) => check(x),
    message,
  };
};

export type checkFn = (stats: {
  player?: PlayerEntity;
  terminal: TerminalEntity;
  track: TerminalTrackers;
  level: Level;
}) => boolean;

export const checkRespawnCount: (deathCount: number) => checkFn = (targetCount: number) => ({
  track: { spawnTick, deathCount },
}) => spawnTick && deathCount == targetCount;

export const checkTagHitCount: (tag: string, targetCount: number) => checkFn = (tag: string, targetCount: number) => ({
  track: { trackedTag },
}) => {
  return (
    trackedTag.filter((tt) => tt.tag == tag && tt.enteredYetThisLife && tt.timesEnteredAtLeastOnce == targetCount)
      .length > 0
  );
};
