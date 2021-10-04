import { Canvas, Shader } from "love.graphics";

import { currentBeat, initAudio, playBgm, updateBgm } from "./audio";
import { drawLevel, drawLevelEntities, initBackgroundCanvas, loadLevel, reloadLevel, tick } from "./engine";
import { initFastRandom } from "./glitch";
import * as input from "./input";
import { getCurrentLevel } from "./levels";
import { blankCorridorLevel } from "./levels/blankCorridorLevel";
import { columns1Level } from "./levels/columns1Level";
import { deadPitFull2Level } from "./levels/deadPitFull2Level";
import { debugLevel } from "./levels/debugLevel";
import { diagonalDash } from "./levels/diagonalDash";
import { encourageExhaustion } from "./levels/encourageExhaustion";
import { hotPitFull1Level } from "./levels/hotPitFull1Level";
import { hotPitFull3Level } from "./levels/hotPitFull3Level";
import { invertedTower1Level } from "./levels/invertedTower1Level";
import { invertedTower2Level } from "./levels/invertedTower2Level";
import { killBlockIntro } from "./levels/killBlockIntro";
import { level1 } from "./levels/level1";
import { level2 } from "./levels/level2";
import { level3 } from "./levels/level3";
import { outerGlitchMazeLevel } from "./levels/outerGlitchMazeLevel";
import { overloadLikely } from "./levels/overload";
import { telesplatLikely } from "./levels/probablySplat";
import { sampleLevelEmpty } from "./levels/sampleLevel";
import { straightforwardGlitch } from "./levels/simpleGlitch";
import { simpleGlitchLevel } from "./levels/simpleGlitchLevel";
import { simpleGlitchWallLevel } from "./levels/simpleGlitchWallLevel";
import { simpleJumpLevel } from "./levels/simpleJumpLevel";
import { simpleKillPlaneLevel } from "./levels/simpleKillPlaneLevel";
import { singleJumpTutorial } from "./levels/singleJumpTutorial";
import { suddenlyFallingLevel } from "./levels/suddenlyFallingLevel";
import { GAME_SCALE, buildStructresAtInit } from "./models";
import { loadPlayerSprites } from "./player";
import { drawParticleEmitters, initZoneEmitters } from "./zone";

if (os.getenv("LOCAL_LUA_DEBUGGER_VSCODE") === "1") {
  require("@NoResolution:lldebugger").start();
}

//*
// Dev level sequence
// Feel free to alter this list for testing/debugging
const LEVEL_SEQUENCE = [
  // hotPitFull3Level,
  suddenlyFallingLevel,
  diagonalDash,
  overloadLikely,
  level2,
  telesplatLikely,
  level1,
  killBlockIntro,
  outerGlitchMazeLevel,
  deadPitFull2Level,
  hotPitFull1Level,
  encourageExhaustion,
  straightforwardGlitch,
  // simpleJumpLevel,
  // singleJumpTutorial,
  // invertedTower2Level,
  debugLevel,
  columns1Level,
  invertedTower2Level,
  invertedTower1Level,
  simpleGlitchLevel,
  level3,
  level1,
  level2,
  // level4,
  simpleGlitchWallLevel,
  simpleKillPlaneLevel,
  simpleGlitchLevel,
  simpleJumpLevel,
  simpleGlitchWallLevel,
  simpleKillPlaneLevel,
  simpleGlitchLevel,
  simpleJumpLevel,
  blankCorridorLevel,
  sampleLevelEmpty,
];
/*/
// The real level sequence
// Ensure this is uncommented for release!
const LEVEL_SEQUENCE = [
  simpleGlitchLevel,
  singleJumpTutorial,
  simpleJumpLevel,
  killBlockIntro,
  straightforwardGlitch,
  encourageExhaustion,
  level1,
  simpleGlitchWallLevel,
  telesplatLikely,
  level2,
  overloadLikely,
  diagonalDash,
  simpleKillPlaneLevel,
  invertedTower1Level,
  outerGlitchMazeLevel,
  invertedTower2Level,
  hotPitFull1Level,
  level3,
  suddenlyFallingLevel,
];
//*/

let currentLevelIndex = 0;
let globalCanvas: Canvas;
let bloomShader: Shader;

love.load = () => {
  buildStructresAtInit();
  initBackgroundCanvas();
  initZoneEmitters();

  initFastRandom();
  loadPlayerSprites();

  currentLevelIndex = 0;
  loadLevel(LEVEL_SEQUENCE[currentLevelIndex]);

  globalCanvas = love.graphics.newCanvas();
  bloomShader = love.graphics.newShader("res/bloom.hlsl");
  initAudio();
  playBgm("title", "normal");
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

  love.graphics.setCanvas(globalCanvas);
  love.graphics.setShader();
  love.graphics.setColor(1, 1, 1, 1);

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

  love.graphics.setCanvas();
  love.graphics.clear();
  // draw the global canvas with the bloom shader active
  const beat = currentBeat();
  const beatProgress = beat % 1.0;
  const invertedBeatProgress = 1.0 - beatProgress;
  const bloomStrength = Math.min(beatProgress * invertedBeatProgress, 1.0);
  bloomShader.send("strength", bloomStrength);
  love.graphics.setShader(bloomShader);
  love.graphics.setColor(1, 1, 1, 1);
  love.graphics.draw(globalCanvas, 0, 0);
};
