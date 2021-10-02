import { parseLevelDefinition } from "./levelLoader";
import { getCurrentLevel, setCurrentLevel } from "./levels";
import { Entity, Level, LevelDefinition, TILE_SIZE_PIXELS } from "./models";

export function tick(): void {
  getCurrentLevel().entities.forEach((entity) => {
    entity.update(entity);
  });
}

export function loadLevel(levelDefinition: LevelDefinition): void {
  setCurrentLevel(parseLevelDefinition(levelDefinition));
}

function drawLevel({ tiles }: Level): void {
  const { push, pop, translate, draw, setColor } = love.graphics;

  setColor(255, 255, 255);
  push();
  for (let y = 0; y < tiles.length; ++y) {
    push();
    for (let x = 0; x < tiles[y].length; ++x) {
      const tile = tiles[y][x];
      draw(tile.image);
      translate(TILE_SIZE_PIXELS, 0);
    }
    pop();
    translate(0, TILE_SIZE_PIXELS);
  }
  pop();
}

export function drawCurrentLevel(): void {
  drawLevel(getCurrentLevel());
}

export function drawEntities(): void {
  getCurrentLevel().entities.forEach((entity) => {
    entity.draw(entity);
  });
}
