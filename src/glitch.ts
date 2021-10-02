import { Drawable, DrawableTypes } from "love.graphics";

export function glitchedDraw(drawable: Drawable<DrawableTypes>, x: number, y: number): void {
  love.graphics.draw(drawable, x, y);
}
