import { Texture } from "love.graphics";

// Since everything is 16x16px, just use one quad for everything.
// Maybe this will change and everything will need to carry its own quad around,
// but until then...
const window = love.graphics.newQuad(0, 5, 16, 1, 16, 16);

export function glitchedDraw(drawable: Texture, x: number, y: number): void {
  love.graphics.draw(drawable, x, y);
  for (let offsetScanline = 0; offsetScanline < 5; ++offsetScanline) {
    const scanline = Math.floor(16 * love.math.random());
    window.setViewport(0, scanline, 16, 1);
    love.graphics.draw(drawable, window, x + 5, y + scanline);
  }
}
