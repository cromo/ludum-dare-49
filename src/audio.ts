import { Source } from "love.audio";

const { audio } = love;

export interface SfxDef {
  source: Source;
  basePitch?: number;
  pitchVariation?: number;
  volume?: number;
}

export interface BgmDef {
  sources: { [key: string]: Source };
  looping: boolean;
  loopStart: number;
  loopEnd: number;
  bpm: number;
}

const availableSfx: { [key: string]: SfxDef } = {};
const availableBgm: { [key: string]: BgmDef } = {};

export interface BgmPlayer {
  activeBgm?: string;
  activeVariant?: string;
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
    sources: {
      normal: audio.newSource("res/bgm/ld49-smooth.wav", "static"),
      deadzone: audio.newSource("res/bgm/ld49-smooth-muted.wav", "static"),
    },
    looping: true,
    loopStart: 7.484,
    loopEnd: 51.789,
    bpm: 130,
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

export function stopBgm(): void {
  if (bgmPlayer.activeBgm) {
    const bgm = availableBgm[bgmPlayer.activeBgm];
    for (const sourceId in bgm.sources) {
      bgm.sources[sourceId].stop();
    }
  }
  bgmPlayer.playing = false;
}

export function playBgm(id: string, variant: string): void {
  if (id in availableBgm) {
    const bgm = availableBgm[id];
    if (variant in bgm.sources) {
      const selectedVariant = bgm.sources[variant];
      if (bgmPlayer.activeBgm !== id) {
        // We are not currently playing this source. Stop the active source, then
        // switch to this one and initialize it fully.
        stopBgm();
        for (const sourceId in bgm.sources) {
          bgm.sources[sourceId].setVolume(0);
          bgm.sources[sourceId].stop();
        }
        // first, activate our chosen source at full volume
        selectedVariant.setVolume(1.0);
        // Now start *all* of the sources at the same time
        for (const sourceId in bgm.sources) {
          bgm.sources[sourceId].play();
        }
        bgmPlayer.activeBgm = id;
        bgmPlayer.activeVariant = variant;
      } else {
        // We are merely switching to a new active variant. Do not alter playback, but
        // store the key. We'll cross-fade to it later.
        bgmPlayer.activeVariant = variant;
      }
    }
  }
}

export function queueBgmVariant(variant: string): void {
  if (bgmPlayer.activeBgm) {
    const bgm = availableBgm[bgmPlayer.activeBgm];
    if (variant in bgm.sources) {
      bgmPlayer.activeVariant = variant;
    }
  }
}

const CROSSFADE_DURATION = 1.0; // seconds
const CROSSFADE_RATE = CROSSFADE_DURATION / 60.0; // percentage per tick

export function crossfadeToVariant(): void {
  if (bgmPlayer.activeBgm && bgmPlayer.activeVariant) {
    const bgm = availableBgm[bgmPlayer.activeBgm];
    for (const sourceId in bgm.sources) {
      const source = bgm.sources[sourceId];
      if (sourceId == bgmPlayer.activeVariant) {
        const newVolume = Math.min(1.0, source.getVolume() + CROSSFADE_RATE);
        source.setVolume(newVolume);
      } else {
        const newVolume = Math.max(0.0, source.getVolume() - CROSSFADE_RATE);
        source.setVolume(newVolume);
      }
    }
  }
}

export function updateBgm(): void {
  if (bgmPlayer.activeBgm && bgmPlayer.activeVariant) {
    const bgm = availableBgm[bgmPlayer.activeBgm];
    if (bgm.looping) {
      const loopLength = bgm.loopEnd - bgm.loopStart;
      const activeSource = bgm.sources[bgmPlayer.activeVariant];
      const currentPosition = activeSource.tell();
      const rewindPosition = currentPosition - loopLength;
      if (currentPosition > bgm.loopEnd) {
        for (const sourceId in bgm.sources) {
          const source = bgm.sources[sourceId];
          source.seek(rewindPosition);
        }
      }
    }
  }
  crossfadeToVariant();
}

export function currentBeat(): number {
  if (bgmPlayer.activeBgm && bgmPlayer.activeVariant) {
    const bgm = availableBgm[bgmPlayer.activeBgm];
    const activeSource = bgm.sources[bgmPlayer.activeVariant];
    const currentSeconds = activeSource.tell();
    return (currentSeconds * bgm.bpm) / 60.0;
  }
  return 0.0;
}
