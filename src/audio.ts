import { audio } from "love";
import { Source } from "love.audio";

export interface SfxDef {
  source: Source;
  basePitch?: number;
  pitchVariation?: number;
  volume?: number;
}

export interface BgmDef {
  source: Source;
  looping: boolean;
  loopStart: number;
  loopEnd: number;
}

const availableSfx: { [key: string]: SfxDef } = {};
const availableBgm: { [key: string]: BgmDef } = {};

export interface BgmPlayer {
  activeSource?: string;
  playing: boolean;
}

let bgmPlayer: BgmPlayer;

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
  availableSfx["geiger"] = { source: audio.newSource("res/sfx/geiger-raw.wav", "static"), pitchVariation: 0.2 };

  availableBgm["level"] = {
    source: audio.newSource("res/bgm/ld49-smooth.wav", "static"),
    looping: true,
    loopStart: 7.484,
    loopEnd: 14.868,
  };

  bgmPlayer = { playing: false };
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

export function playBgm(id: string): void {
  if (id in availableBgm) {
    const source = availableBgm[id].source;
    source.seek(0);
    source.setVolume(1.0);
    source.play();
    bgmPlayer.activeSource = id;
  }
}

export function updateBgm(): void {
  print("Called");
  if (bgmPlayer.activeSource) {
    const bgm = availableBgm[bgmPlayer.activeSource];
    if (bgm.looping) {
      const source = availableBgm[bgmPlayer.activeSource].source;
      const currentPosition = source.tell();
      print(`CurrentPos: ${currentPosition}`);
      if (currentPosition > bgm.loopEnd) {
        const loopLength = bgm.loopEnd - bgm.loopStart;
        const rewindPosition = currentPosition - loopLength;
        print(`Will rewind to: ${rewindPosition}`);
        source.seek(rewindPosition);
      }
    }
  }
}

export function stopBgm(): void {
  if (bgmPlayer.activeSource) {
    availableBgm[bgmPlayer.activeSource].source.stop();
  }
  bgmPlayer.playing = false;
}
