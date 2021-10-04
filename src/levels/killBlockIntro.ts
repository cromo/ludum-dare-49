import { LevelAnnotationFlag, LevelDefinition } from "../models";
import {
  angry,
  glitchy,
  onNotOutOfEntropy,
  onOutOfEntropy,
  onTagActive,
  serious,
  step,
  teach,
  tease,
} from "./terminalTalk";

enum Tags {
  ImmenentDoom = "ImmenentDoom",
}

export const killBlockIntro: LevelDefinition = {
  layout: [
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K*K|# . . . . . . . . . . . . . . . . . . . . . . .|#?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K*#|# . . . . . . . . . . . . . . . . . . . . . . .KK|#?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . . . . . . . . . . . . . . . . . . . .KK*#|#?K?K?K?K?K?K",
    "?K?K?K?K?K?K|# . . . . . . . . . . . . . . . . . . . . . . .KK*#-#|#?K?K?K?K?K?K",
    "?K?K?K?K?K?K|# . . . . . . . .|# . . . . . . . . .|# . . . . . .*#|#?K?K?K?K?K?K",
    "?K?K?K?K?K?K|# . . . . . . . .|# . . . . . . . . .|# . . . . . . .|#?K?K?K?K?K?K",
    "?K?K?K?K?K?K|# . . . . . .*#*#|# w w w w w w w w w|# . . .FF . . .|#?K?K?K?K?K?K",
    "?K?K?K?K?K?K|# . . . . . .|# .|# . . . . . . . . .|# . . .KK . . .|#?K?K?K?K?K?K",
    "?K?K?K?K?K?K|# . . .*#-#-#|# .|# . . . . . . . . .|# . . .KK . . .|#?K?K?K?K?K?K",
    "?K?K?K?K?K?K|# .SS .|# . .|#*#|#KKKKKKKKKKKKKKKKKK|# . . .KK . . .|#?K?K?K?K?K?K",
    "?K?K?K?K?K?K*#-#-#*#*#-#*#-#-#-#*#-#-#-#*#-#-#-#*#-#-#-#-#-#-#-#-#*#?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?T?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
  ],
  annotations: [
    {
      symbol: ".", //make all air dead zone
      zoneMode: "dead",
    },
    {
      symbol: "S", //make start square dead zone too
      zoneMode: "dead",
      flags: [LevelAnnotationFlag.spawn_player],
      customTags: [],
    },
    {
      symbol: "w",
      zoneMode: "dead",
      customTags: [Tags.ImmenentDoom],
    },
    {
      symbol: "T",
      flags: [LevelAnnotationFlag.terminal],
      terminal: {
        trackTags: [Tags.ImmenentDoom],
        onSpawn: [tease("Those look friendly.")],
        onKillPlaneDeath: [
          serious("Did you think I was serious?"),
          serious("Learn from your mistakes."),
          tease("Or not..."),
        ],
        conversations: [
          {
            name: "imminent doom",
            steps: [step([onOutOfEntropy, onTagActive(Tags.ImmenentDoom)], tease("Not getting out of this one..."))],
          },
        ],
      },
    },
  ],
};