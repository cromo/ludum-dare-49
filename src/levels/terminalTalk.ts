import { TerminalMessage, TerminalTone } from "../models";

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
