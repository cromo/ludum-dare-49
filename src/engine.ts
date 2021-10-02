import { currentInput } from "./input";
import { getCurrentLevel } from "./levels";
import { Level } from "./models";
import { Facing, PlayerStateMachine, createPlayerEntity, updateStateMachine } from "./player";

let player: PlayerStateMachine = {
  facing: Facing.Left,
  entropy: 0,
  state: { type: "OUT_OF_ENTROPY", ticksRemainingBeforeRechargeStarts: 5 * 60 },
};

export function tick(): void {
  // Example of pumping update data to player.
  player = updateStateMachine(player, currentInput());
  //state machine stuff up there^ but needs to be moved into the player entity interface & update event

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
      const tileType = tiles[y][x];
      love.graphics.print(`${tileType}`);
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
