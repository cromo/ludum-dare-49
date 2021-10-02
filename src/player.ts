// This is the beginnings of a state machine modeled with proper types. This
// will get more sophisticated as we find out what exactly we need for the game.

// What states do we need?
// Out of entropy
// Standing up after out of entropy
// Standing
// Collapsing back to out of entropy
// Walking/running
//   ? Turning around?
// Jump
//   prep
//   ascending
//   descending
//   landing
// Glitching
//   Begin
//   Forward
//   Diagonal up
//   Diagonal down
//   Up
//   Down
//   ? maybe the direction doesn't really matter for this? It could have the same art/effect and the target could be a member variable
//   ? should it have a different start if on the ground instead of in the air?
// Dissociating (restarting)
// Dying
//
// Also need a facing for all of these

import { GameInput, HorizontalDirection } from "./input";

export enum Facing {
  Left,
  Right,
}

export interface OutOfEntropy {
  type: "OUT_OF_ENTROPY";
  ticksRemainingBeforeRechargeStarts: number;
}

export interface Standing {
  type: "STANDING";
}

export interface Walking {
  type: "WALKING";
}

export interface PlayerState {
  facing: Facing;
  entropy: number;
  state: OutOfEntropy | Standing | Walking;
}

// Maybe this should be split out; the different updates are different events that can be pumped in. But this is a
// starting point.
export function updateStateMachine(player: PlayerState, input: GameInput): PlayerState {
  const { state } = player;
  if (state.type === "OUT_OF_ENTROPY" && 0 < state.ticksRemainingBeforeRechargeStarts) {
    return {
      ...player,
      state: {
        type: "OUT_OF_ENTROPY",
        ticksRemainingBeforeRechargeStarts: state.ticksRemainingBeforeRechargeStarts - 1,
      },
    };
  } else if (state.type === "OUT_OF_ENTROPY" && state.ticksRemainingBeforeRechargeStarts === 0) {
    return {
      ...player,
      state: { type: "STANDING" },
    };
  } else if (state.type === "STANDING" && input.moveDirection !== HorizontalDirection.Neutral) {
    return {
      ...player,
      facing: input.moveDirection === HorizontalDirection.Left ? Facing.Left : Facing.Right,
      state: { type: "WALKING" },
    };
  }
  return player;
}
