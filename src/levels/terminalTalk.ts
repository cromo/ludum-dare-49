import { TerminalConversationStep, TerminalMessage, TerminalTone, checkFn } from "../models";

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

export const step = (check: checkFn | checkFn[], message?: TerminalMessage): TerminalConversationStep => {
  if (Array.isArray(check)) {
    return {
      check: (x) => check.every((c) => c(x)),
      message,
    };
  }
  return {
    check: (x) => check(x),
    message,
  };
};

export const onRespawn: checkFn = ({ track: { spawnTick } }) => spawnTick;
export const onDeath: checkFn = ({ track: { deathTick } }) => deathTick;
export const onOutOfEntropy: checkFn = ({ player }) => {
  if (player && player.stateMachine.state.type == "OUT_OF_ENTROPY") return true;
  return false;
};

export const respawnCount: (deathCount: number) => checkFn = (targetCount: number) => ({ track: { deathCount } }) => {
  return deathCount == targetCount;
};

export const onTagHit: (tag: string) => checkFn = (tag: string) => ({ track: { trackedTag } }) => {
  return trackedTag.filter((tt) => tt.tag == tag && tt.enteredYetThisLife).length > 0;
};

export const onTagActive: (tag: string) => checkFn = (tag: string) => ({ track: { activeTags } }) => {
  return activeTags.filter((tt) => tt == tag).length > 0;
};

export const tagHitCount: (tag: string, targetCount: number) => checkFn = (tag: string, targetCount: number) => ({
  track: { trackedTag },
}) => {
  return trackedTag.filter((tt) => tt.tag == tag && tt.timesEnteredAtLeastOnce == targetCount).length > 0;
};
