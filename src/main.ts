import { drawLevel, drawLevelEntities, loadLevel, tick } from "./engine";
import * as input from "./input";
import { parseLevelDefinition } from "./levelLoader";
import { getCurrentLevel } from "./levels";
import { debugLevel } from "./levels/debugLevel";
if (os.getenv("LOCAL_LUA_DEBUGGER_VSCODE") === "1") {
  require("@NoResolution:lldebugger").start();
}

let content = "";

love.load = () => {
  const [rawContent] = love.filesystem.read("res/index.txt");
  if (rawContent !== undefined) {
    content = rawContent;
  }
  print(content);

  const levelData = parseLevelDefinition(debugLevel);
  print(levelData);
  loadLevel(debugLevel);
};

love.keypressed = input.onKeyDown;
love.keyreleased = input.onKeyUp;

let dtsum = 0;
const TICK_INTERVAL = 1 / 60;
love.update = (dt) => {
  dtsum += dt;
  while (dtsum > TICK_INTERVAL) {
    dtsum -= TICK_INTERVAL;
    tick(getCurrentLevel());
  }
};

love.draw = () => {
  const { push, pop, translate } = love.graphics;

  const currentInput = input.currentInput();
  love.graphics.print(`Move direction: ${currentInput.moveDirection}
Dash direction: ${currentInput.dashDirection}
Want dash: ${currentInput.wantsToDash}
Want jump: ${currentInput.wantsToJump}
Want reset: ${currentInput.wantsToReset}`);

  push();
  translate(0, 100);
  const level = getCurrentLevel();
  drawLevel(level);
  drawLevelEntities(level);
  pop();
};
