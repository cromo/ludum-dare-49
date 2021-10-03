import { drawLevel, drawLevelEntities, initBackgroundCanvas, loadLevel, reloadLevel, tick } from "./engine";
import { initFastRandom } from "./glitch";
import * as input from "./input";
import { getCurrentLevel } from "./levels";
import { debugLevel } from "./levels/debugLevel";
import { sampleLevelEmpty } from "./levels/sampleLevel";
import { GAME_SCALE } from "./models";
import { loadPlayerSprites } from "./player";

if (os.getenv("LOCAL_LUA_DEBUGGER_VSCODE") === "1") {
  require("@NoResolution:lldebugger").start();
}

const LEVEL_SEQUENCE = [debugLevel, sampleLevelEmpty];
let currentLevelIndex = 0;

love.load = () => {
  initBackgroundCanvas();

  initFastRandom();
  loadPlayerSprites();

  currentLevelIndex = 0;
  loadLevel(LEVEL_SEQUENCE[currentLevelIndex]);
};

love.keypressed = input.onKeyDown;
love.keyreleased = input.onKeyUp;

let dtsum = 0;
const TICK_INTERVAL = 1 / 60;
love.update = (dt) => {
  dtsum += dt;
  while (dtsum > TICK_INTERVAL) {
    dtsum -= TICK_INTERVAL;

    // do lots of stuff
    tick(getCurrentLevel());

    // check engile-level controls control codes
    const level = getCurrentLevel();
    if (level.doRestart) {
      reloadLevel(level);
    } else if (level.gotoLevel) {
      loadLevel(level.gotoLevel);
    } else if (level.nextLevel) {
      currentLevelIndex++;
      if (LEVEL_SEQUENCE[currentLevelIndex]) {
        loadLevel(LEVEL_SEQUENCE[currentLevelIndex]);
      }
    }
  }
};

love.draw = () => {
  const { push, pop, scale } = love.graphics;

  push();
  scale(GAME_SCALE, GAME_SCALE);
  const level = getCurrentLevel();
  drawLevel(level);
  drawLevelEntities(level);
  love.graphics.setColor(0, 0, 0);
  love.graphics.print(`${love.timer.getFPS()}`, 2, 2);
  pop();
};
