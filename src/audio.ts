import { audio } from "love";
import { Source } from "love.audio";

export interface SfxDef {
  source: Source;
  pitchVariation?: number;
  volume?: number;
}

const availableSfx: { [key: string]: SfxDef } = {};

export function initAudio(): void {
  availableSfx["jump"] = {
    source: audio.newSource("res/sfx/jump.wav", "static"),
    pitchVariation: 0.1,
  };
}

export function playSfx(id: string, volume?: number, pitchVariation?: number): void {
  if (id in availableSfx) {
    const sfx = availableSfx[id];
    const selectedPitchVariation = pitchVariation || sfx.pitchVariation || 0.0;
    const selectedVolume = volume || sfx.volume || 1.0;
    const pitch = 1.0 + love.math.random() * selectedPitchVariation * 2.0 - selectedPitchVariation;
    sfx.source.setPitch(pitch);
    sfx.source.setVolume(selectedVolume);
    sfx.source.play();
  }
}
