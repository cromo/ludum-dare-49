import { getCurrentLevel } from "./levels";
import { Level } from "./models";
import { createPlayerEntity } from "./player";

export function tick(): void {
  //entity stuff down here
  getCurrentLevel().entities.forEach((entity) => {
    entity.update(entity);
  });
}

const TILE_SIZE_PIXELS = 16;

//TODO: temporarily doing this terrible thing to spawn the player?
getCurrentLevel().entities.push(createPlayerEntity({ x: 5 * TILE_SIZE_PIXELS, y: 5 * TILE_SIZE_PIXELS }));

function drawLevel({ tiles }: Level): void {
  const { push, pop, translate } = love.graphics;

  push();
  for (let y = 0; y < tiles.length; ++y) {
    push();
    for (let x = 0; x < tiles[y].length; ++x) {
      const tile = tiles[y][x];
      love.graphics.print(`${tile.type}`);
      translate(TILE_SIZE_PIXELS, 0);
    }
    pop();
    translate(0, TILE_SIZE_PIXELS);
  }
  pop();

  getCurrentLevel().entities.forEach((entity) => {
    entity.draw(entity);
  });
}

export function drawCurrentLevel(): void {
  drawLevel(getCurrentLevel());
}
