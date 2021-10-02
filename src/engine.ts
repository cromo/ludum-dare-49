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
}

function drawEntities(entities: Entity[]): void {
  entities.forEach((entity) => {
    entity.draw(entity);
  });
}

export function drawCurrentLevel(): void {
  drawLevel(getCurrentLevel());
  drawEntities(getCurrentLevel().entities);
}
