import { currentInput } from "./input";
import levels from "./levels";
import { Level } from "./models";
import { Facing, PlayerState, updateStateMachine } from "./player";

let player: PlayerState = {
  facing: Facing.Left,
  entropy: 0,
  state: { type: "OUT_OF_ENTROPY", ticksRemainingBeforeRechargeStarts: 5 * 60 },
};

const currentLevel = levels[0];

export function tick(): void {
  // Example of pumping update data to player.
  player = updateStateMachine(player, currentInput());
}

const TILE_SIZE_PIXELS = 16;
function drawLevel({ tiles }: Level): void {
  const { push, pop, translate } = love.graphics;

  push();
  for (let y = 0; y < tiles.length; ++y) {
    push();
    for (let x = 0; x < tiles[y].length; ++x) {
      const tileType = tiles[y][x];
      love.graphics.print(`${tileType}`);
      translate(TILE_SIZE_PIXELS, 0);
    }
    pop();
    translate(0, TILE_SIZE_PIXELS);
  }
  pop();
}

export function drawCurrentLevel(): void {
  drawLevel(currentLevel);
}
