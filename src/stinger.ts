import { Image } from "love.graphics";

import { glitchedDraw } from "./glitch";
import { DEATH_ANIMATION_TICKS, RESET_DURATION_TICKS } from "./models";

const STINGER_SCALE = 44;
const STINGER_SPEED = 30;
const STINGER_WIDTH = 4;
// const STINGER_SPEED = 10;

let stingerImage: Image;
function getStingerImage(): Image {
  if (stingerImage === undefined) {
    stingerImage = love.graphics.newImage("res/stinger.png");
  }
  return stingerImage;
}

let framesSinceStingerTrigger = 1000;
export function triggerStinger(): void {
  if (RESET_DURATION_TICKS < framesSinceStingerTrigger) {
    framesSinceStingerTrigger = 0;
  }
}

export function updateStinger(): void {
  framesSinceStingerTrigger++;
  if (1000 < framesSinceStingerTrigger) {
    framesSinceStingerTrigger = 1000;
  }
}

export function drawStinger(): void {
  if (200 < framesSinceStingerTrigger) return;
  const stingerBase = getStingerImage();
  love.graphics.push();
  love.graphics.scale(STINGER_SCALE * 4, STINGER_SCALE);
  const x = STINGER_SPEED * (framesSinceStingerTrigger / STINGER_SCALE) - 3 * stingerBase.getWidth();
  love.graphics.draw(stingerBase, x, 0);
  glitchedDraw(stingerBase, x, 0, { glitchRate: 1 });
  love.graphics.pop();
}
