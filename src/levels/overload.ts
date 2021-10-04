import { LevelAnnotationFlag, LevelDefinition } from "../models";
import { angry, glitchy, onNotOutOfEntropy, onOutOfEntropy, step, teach, tease } from "./terminalTalk";

export const overloadLikely: LevelDefinition = {
  layout: [
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#",
    "|# .SS . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .FF .|#",
    "*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?T?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
    "|#?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#?K?K?K?K?K?K?K?K?K?K?K?K|#",
  ],
  annotations: [
    {
      symbol: ".", //make all air hot zone
      zoneMode: "hot",
    },
    {
      symbol: "S", //make start square hot zone too
      zoneMode: "hot",
      flags: [LevelAnnotationFlag.spawn_player],
      customTags: [],
      startWithEntropy: 4.7,
    },
    {
      symbol: "T",
      flags: [LevelAnnotationFlag.terminal],
      terminal: {
        trackTags: [],
        onOverloadDeath: [teach("Too unstable."), glitchy("Too much of a good thing?")],
        conversations: [],
      },
    },
  ],
};