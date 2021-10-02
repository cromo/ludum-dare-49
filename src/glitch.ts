import { Texture } from "love.graphics";

// Since everything is 16x16px, just use one quad for everything.
// Maybe this will change and everything will need to carry its own quad around,
// but until then...
const window = love.graphics.newQuad(0, 5, 16, 1, 16, 16);

const lines = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(love.math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

export function glitchedDraw(
  drawable: Texture,
  x: number,
  y: number,
  options?: { glitchRate?: number; overdraw?: true; spread?: number }
): void {
  const overdraw = options?.overdraw ?? false;
  const requestedGlitchRate = options?.glitchRate ?? 0;
  const glitchRate = requestedGlitchRate < 0 ? 0 : 1 < requestedGlitchRate ? 1 : requestedGlitchRate;
  const spread = options?.spread ?? 10;

  const { draw } = love.graphics;
  const { random } = love.math;

  if (glitchRate === 0) {
    draw(drawable, x, y);
    return;
  }

  if (overdraw) {
    draw(drawable, x, y);
  }
  shuffleInPlace(lines);
  const scanlinesToOffsetCount = Math.floor(glitchRate * lines.length);
  for (let offsetScanline = 0; offsetScanline < scanlinesToOffsetCount; ++offsetScanline) {
    const scanline = lines[offsetScanline];
    window.setViewport(0, scanline, 16, 1);
    draw(drawable, window, x + Math.floor((random() - 0.5) * spread), y + scanline);
  }
}
