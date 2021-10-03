import { glitchedDraw } from "./glitch";
import { parseLevelDefinition } from "./levelLoader";
import { getPlayer, getTerminal, setCurrentLevel } from "./levels";
import { LEVEL_HEIGHT, LEVEL_WIDTH, Level, LevelDefinition, Point, TILE_SIZE_PIXELS } from "./models";

export function tick(level: Level): void {
  level.entities = level.entities.map((entity) => entity.update(level, entity));

  //TODO: crappy oob detection for death/reset development, should probably be in the player entity somewhere
  const player = getPlayer();
  const terminal = getTerminal();
  if (player) {
    const tilePos: Point = {
      x: Math.floor(player.pos.x / TILE_SIZE_PIXELS),
      y: Math.floor(player.pos.y / TILE_SIZE_PIXELS),
    };
    if (tilePos.x < 0 || tilePos.x >= LEVEL_WIDTH || tilePos.y < 0 || tilePos.y >= LEVEL_HEIGHT) {
      if (terminal) terminal.trackers.deathCount++;
      level.doRestart = true;
    }
  }
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
  for (let y = 0; y < tiles.length; ++y) {
    for (let x = 0; x < tiles[y].length; ++x) {
      const tile = tiles[y][x];
      draw(tile.image, x * TILE_SIZE_PIXELS, y * TILE_SIZE_PIXELS);
    }
  }

  // Glitch the tiles
  for (let y = 0; y < tiles.length; ++y) {
    for (let x = 0; x < tiles[y].length; ++x) {
      const tile = tiles[y][x];
      const glitchRate = tile.effect?.glitchyLevel;
      if (glitchRate !== undefined) {
        glitchedDraw(tile.image, x * TILE_SIZE_PIXELS, y * TILE_SIZE_PIXELS, { glitchRate });
      }
    }
  }
}

export function drawLevelEntities(level: Level): void {
  level.entities.forEach((entity) => {
    entity.draw(level, entity);
  });
}
