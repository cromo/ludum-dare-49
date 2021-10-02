import { KeyConstant } from "love.keyboard";

/// What direction the character is trying to walk/move in.
export enum HorizontalDirection {
  Left = "Left",
  Neutral = "Neutral",
  Right = "Right",
}

export enum DashDirection {
  /// This is the default direction if no direction is held during the execution
  /// of a dash.
  Forward = "Forward",
  N = "N",
  NE = "NE",
  E = "E",
  SE = "SE",
  S = "S",
  SW = "SW",
  W = "W",
  NW = "NW",
}

export interface GameInput {
  mode: "GAME";
  moveDirection: HorizontalDirection;
  dashDirection: DashDirection;
  wantsToDash: boolean;
  wantsToJump: boolean;
  wantsToReset: boolean;
}

// This may evolve to have a menu input over time as well for the title screen.
let input: GameInput = {
  mode: "GAME",
  moveDirection: HorizontalDirection.Neutral,
  dashDirection: DashDirection.Forward,
  wantsToDash: false,
  wantsToJump: false,
  wantsToReset: false,
};

const keysDown = {
  left: false,
  right: false,
  up: false,
  down: false,
  dash: false,
  jump: false,
  reset: false,
};

const keyMapping = new Map<KeyConstant, keyof typeof keysDown>([
  ["w", "up"],
  ["a", "left"],
  ["s", "down"],
  ["d", "right"],
  ["up", "up"],
  ["down", "down"],
  ["left", "left"],
  ["right", "right"],
  ["lshift", "dash"],
  ["space", "jump"],
  ["r", "reset"],
]);

function updateKeysDown(key: KeyConstant, state: boolean): void {
  const mappedKey = keyMapping.get(key);
  if (mappedKey === undefined) return;
  keysDown[mappedKey] = state;
}

function toTribool(lesser: boolean, greater: boolean): -1 | 0 | 1 {
  return lesser && !greater ? -1 : !lesser && greater ? 1 : 0;
}

// Look up tribool + 1
const moveDirectionLut: HorizontalDirection[] = [
  HorizontalDirection.Left,
  HorizontalDirection.Neutral,
  HorizontalDirection.Right,
];

// Look up vertical + 1 then horizontal + 1
const dashDirectionLut: DashDirection[][] = [
  [DashDirection.NW, DashDirection.N, DashDirection.NE],
  [DashDirection.W, DashDirection.Forward, DashDirection.E],
  [DashDirection.SW, DashDirection.S, DashDirection.SE],
];

function translateInput(rawInput: typeof keysDown): GameInput {
  const horizontalDirection = toTribool(rawInput.left, rawInput.right);
  const verticalDirection = toTribool(rawInput.up, rawInput.down);
  return {
    mode: "GAME",
    moveDirection: moveDirectionLut[horizontalDirection + 1],
    dashDirection: dashDirectionLut[verticalDirection + 1][horizontalDirection + 1],
    wantsToDash: rawInput.dash,
    wantsToJump: rawInput.jump,
    wantsToReset: rawInput.reset,
  };
}

export const onKeyDown = (key: KeyConstant): void => {
  updateKeysDown(key, true);
  input = translateInput(keysDown);
};

export const onKeyUp = (key: KeyConstant): void => {
  updateKeysDown(key, false);
  input = translateInput(keysDown);
};

export const currentInput = (): GameInput => input;
