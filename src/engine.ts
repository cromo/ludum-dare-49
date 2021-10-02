import { glitchedDraw } from "./glitch";
import { parseLevelDefinition } from "./levelLoader";
import { setCurrentLevel } from "./levels";
import { Level, LevelDefinition, TILE_SIZE_PIXELS } from "./models";

export function tick(level: Level): void {
  level.entities = level.entities.map((entity) => entity.update(level, entity));
}

export function loadLevel(levelDefinition: LevelDefinition): void {
  setCurrentLevel(parseLevelDefinition(levelDefinition));
}
export function reloadLevel(level: Level): void {
  const freshLevel = parseLevelDefinition(level.levelDef);
  // move over terminal state

  // start the reloaded level
  setCurrentLevel(freshLevel);
}

export function drawLevel({ tiles }: Level): void {
  const { push, pop, translate, draw, setColor } = love.graphics;

  setColor(255, 255, 255);
  // Draw the tiles
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

  // Glitch the tiles
  push();
  for (let y = 0; y < tiles.length; ++y) {
    push();
    for (let x = 0; x < tiles[y].length; ++x) {
      const tile = tiles[y][x];
      const glitchRate = tile.effect?.glitchyLevel;
      if (glitchRate !== undefined) {
        glitchedDraw(tile.image, 0, 0, { glitchRate });
      }
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
