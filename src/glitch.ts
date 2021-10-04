import { Quad, SpriteBatch, Texture } from "love.graphics";

import { TILE_SIZE_PIXELS } from "./models";

const randomTable: number[] = [];
let currentRunLength = 0;
let currentRandomTableIndex = 0;
function randomTableIndex(): number {
  return Math.floor(love.math.random() * randomTable.length);
}
export function initFastRandom(): void {
  for (let i = 0; i < 256; ++i) randomTable.push(love.math.random());
  currentRunLength = randomTableIndex();
  currentRandomTableIndex = randomTableIndex();
}

function fastRandom(): number {
  if (currentRunLength <= 0) {
    currentRunLength = randomTableIndex();
    currentRandomTableIndex = randomTableIndex();
  }
  const result = randomTable[currentRandomTableIndex];
  currentRandomTableIndex = (currentRandomTableIndex + 1) % randomTable.length;
  currentRunLength -= 1;
  return result;
}

const lines = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

let batch: SpriteBatch | undefined;
function getSpriteBatch(): SpriteBatch {
  if (batch === undefined) {
    batch = love.graphics.newSpriteBatch(love.graphics.newImage(love.image.newImageData(16, 16)));
  }
  return batch;
}

const quads: Quad[] = [];
function getQuads(): Quad[] {
  if (quads.length === 0) {
    for (let i = 0; i < 16; ++i) {
      quads.push(love.graphics.newQuad(0, 0, TILE_SIZE_PIXELS, 1, TILE_SIZE_PIXELS, TILE_SIZE_PIXELS));
    }
  }
  return quads;
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(fastRandom() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

// Returns inclusive ranges. Actual type should be [number, number][].
function splitRange(lower: number, upper: number, split: number): number[][] {
  const rangeOfOne = lower === upper;
  if (rangeOfOne && split === lower) return [];
  if (split === lower) return [[lower + 1, upper]];
  if (split === upper) return [[lower, upper - 1]];
  if (lower < split && split < upper)
    return [
      [lower, split - 1],
      [split + 1, upper],
    ];
  return [[lower, upper]];
}

export enum GlitchMode {
  Progressive,
  GlitchOnly,
}

export function glitchedDraw(
  drawable: Texture,
  x: number,
  y: number,
  options?: {
    glitchRate?: number;
    mode?: GlitchMode;
    spread?: number;
    flipHorizontally?: boolean;
    glitchChance?: number;
  }
): void {
  const mode = options?.mode ?? GlitchMode.GlitchOnly;
  const requestedGlitchRate = options?.glitchRate ?? 0;
  const glitchRate = requestedGlitchRate < 0 ? 0 : 1 < requestedGlitchRate ? 1 : requestedGlitchRate;
  const spread = options?.spread ?? 10;
  const flipHorizontally = options?.flipHorizontally ?? false;
  const glitchChance = options?.glitchChance ?? 1;

  const scale = flipHorizontally ? -1 : 1;
  const xOffset = flipHorizontally ? 16 : 0;
  const xAdjusted = x + xOffset;

  const { draw } = love.graphics;
  const random = fastRandom;

  // There's a chance that we don't draw glitches this frame.
  if (!(random() <= glitchChance)) return;

  if (glitchRate === 0 || spread === 0) {
    draw(drawable, xAdjusted, y, undefined, scale, 1);
    return;
  }

  const batch = getSpriteBatch();
  batch.clear();
  batch.setTexture(drawable);
  const quads = getQuads();
  let currentQuadIndex = 0;

  shuffleInPlace(lines);
  let spansToDrawNormally: number[][] = [[0, 15]];
  const scanlinesToOffsetCount = Math.floor(glitchRate * lines.length);
  for (let offsetScanline = 0; offsetScanline < scanlinesToOffsetCount; ++offsetScanline) {
    const scanline = lines[offsetScanline];
    if (mode === GlitchMode.Progressive) {
      spansToDrawNormally = spansToDrawNormally.flatMap(([lower, upper]) => splitRange(lower, upper, scanline));
    }
    const quad = quads[currentQuadIndex++];
    quad.setViewport(0, scanline, 16, 1);
    batch.add(quad, xAdjusted + Math.round((random() - 0.5) * spread), y + scanline, undefined, scale, 1);
  }
  if (mode === GlitchMode.Progressive) {
    spansToDrawNormally.forEach(([start, end]) => {
      const quad = quads[currentQuadIndex++];
      quad.setViewport(0, start, 16, end - start + 1);
      batch.add(quad, xAdjusted, y + start, undefined, scale, 1);
    });
  }
  draw(batch);
}
