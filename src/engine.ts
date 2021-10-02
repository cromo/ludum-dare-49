import { parseLevelDefinition } from "./levelLoader";
import { getCurrentLevel, setCurrentLevel } from "./levels";
import { Level, LevelDefinition, TILE_SIZE_PIXELS } from "./models";

export function tick(level: Level): void {
  getCurrentLevel().entities.forEach((entity) => {
    entity.update(level, entity);
  });
}

export function loadLevel(levelDefinition: LevelDefinition): void {
  setCurrentLevel(parseLevelDefinition(levelDefinition));
}

export function drawLevel({ tiles }: Level): void {
  const { push, pop, translate, draw, setColor } = love.graphics;

  setColor(255, 255, 255);
  push();
  for (let y = 0; y < tiles.length; ++y) {
    push();
    for (let x = 0; x < tiles[y].length; ++x) {
      const tile = tiles[y][x];
      const glitchoff = tile.effect?.glitchyLevel || 0;
      draw(tile.image, math.floor(Math.random() * glitchoff * 2 - glitchoff), 0);
      translate(TILE_SIZE_PIXELS, 0);
    }
    pop();
    translate(0, TILE_SIZE_PIXELS);
  }
  pop();
}

export function drawLevelEntities(level: Level): void {
  level.entities.forEach((entity) => {
    entity.draw(level, entity);
  });
}
