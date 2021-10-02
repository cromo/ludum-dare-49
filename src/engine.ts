import { currentInput } from "./input";
import { Facing, PlayerState, updateStateMachine } from "./player";

let player: PlayerState = {
  facing: Facing.Left,
  entropy: 0,
  state: { type: "OUT_OF_ENTROPY", ticksRemainingBeforeRechargeStarts: 5 * 60 },
};

export function tick(): void {
  // Example of pumping update data to player.
  player = updateStateMachine(player, currentInput());
}
