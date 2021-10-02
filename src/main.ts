import { drawEntities, drawLevel, loadLevel, tick } from "./engine";
import * as input from "./input";
import { parseLevelDefinition } from "./levelLoader";
import { getCurrentLevel } from "./levels";
import { debugLevel } from "./levels/debugLevel";
import { GAME_SCALE } from "./models";
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
    tick();
  }
};

love.draw = () => {
  const { push, pop, scale } = love.graphics;

  push();
  scale(GAME_SCALE, GAME_SCALE);
  const level = getCurrentLevel();
  drawLevel(level);
  drawEntities(level.entities);
  pop();
};
