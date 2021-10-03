import { audio } from "love";
import { Source } from "love.audio";

export interface SfxDef {
  source: Source;
  basePitch?: number;
  pitchVariation?: number;
  volume?: number;
}

const availableSfx: { [key: string]: SfxDef } = {};

export function initAudio(): void {
  // Both jumps share a source; if the second plays, it should interrupt the first.
  const jumpSource = audio.newSource("res/sfx/jump.wav", "static");
  availableSfx["jump"] = {
    source: jumpSource,
    pitchVariation: 0.1,
  };
  availableSfx["doublejump"] = {
    source: jumpSource,
    basePitch: 1.4,
    pitchVariation: 0.1,
  };

  availableSfx["death"] = { source: audio.newSource("res/sfx/death.wav", "static"), pitchVariation: 0.1 };
  availableSfx["dash"] = { source: audio.newSource("res/sfx/glitch-dash3.wav", "static"), pitchVariation: 0.1 };
  availableSfx["exit"] = { source: audio.newSource("res/sfx/tepelort.wav", "static") };
}

export function playSfx(id: string, volume?: number, pitchVariation?: number): void {
  if (id in availableSfx) {
    const sfx = availableSfx[id];
    const basePitch = sfx.basePitch || 1.0;
    const selectedPitchVariation = pitchVariation || sfx.pitchVariation || 0.0;
    const selectedVolume = volume || sfx.volume || 1.0;
    const pitch = basePitch + love.math.random() * selectedPitchVariation * 2.0 - selectedPitchVariation;
    sfx.source.setPitch(pitch);
    sfx.source.setVolume(selectedVolume);
    sfx.source.play();
  }
}
