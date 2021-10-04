import { initAudio, playBgm, updateBgm } from "./audio";
import { drawLevel, drawLevelEntities, initBackgroundCanvas, loadLevel, reloadLevel, tick } from "./engine";
import { initFastRandom } from "./glitch";
import * as input from "./input";
import { getCurrentLevel } from "./levels";
import { blankCorridorLevel } from "./levels/blankCorridorLevel";
import { debugLevel } from "./levels/debugLevel";
import { level1 } from "./levels/level1";
import { level2 } from "./levels/level2";
import { level3 } from "./levels/level3";
import { sampleLevelEmpty } from "./levels/sampleLevel";
import { simpleGlitchLevel } from "./levels/simpleGlitchLevel";
import { simpleGlitchWallLevel } from "./levels/simpleGlitchWallLevel";
import { simpleJumpLevel } from "./levels/simpleJumpLevel";
import { simpleKillPlaneLevel } from "./levels/simpleKillPlaneLevel";
import { GAME_SCALE, buildStructresAtInit } from "./models";
import { loadPlayerSprites } from "./player";
import { drawParticleEmitters, initZoneEmitters } from "./zone";

if (os.getenv("LOCAL_LUA_DEBUGGER_VSCODE") === "1") {
  require("@NoResolution:lldebugger").start();
}

const LEVEL_SEQUENCE = [
  level3,
  level2,
  level1,
  simpleGlitchWallLevel,
  simpleKillPlaneLevel,
  simpleGlitchLevel,
  simpleJumpLevel,
  debugLevel,
  blankCorridorLevel,
  sampleLevelEmpty,
];
let currentLevelIndex = 0;

love.load = () => {
  buildStructresAtInit();
  initBackgroundCanvas();
  initZoneEmitters();

  initFastRandom();
  loadPlayerSprites();

  currentLevelIndex = 0;
  loadLevel(LEVEL_SEQUENCE[currentLevelIndex]);

  initAudio();
  playBgm("level", "normal");
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
    updateBgm();

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
  drawParticleEmitters();
  love.graphics.setColor(0, 0, 0);
  love.graphics.print(`${love.timer.getFPS()}`, 2, 2);
  love.graphics.setColor(1, 1, 1);
  love.graphics.print(`${love.timer.getFPS()}`, 1, 1);
  pop();
};
