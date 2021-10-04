import { LevelAnnotationFlag, LevelDefinition } from "../models";
import { frustrated, glitchy, teach } from "./terminalTalk";

export const suddenlyFallingLevel: LevelDefinition = {
  layout: [
    "?K?K?K?K?K?K-#-#-#-#-#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . . .?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . .SS .?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . . .?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . . .?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . . .?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . . .?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . . .?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . . .?K?K?T?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . _ _?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . _ _?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . _ _?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . . .?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . . .?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . . .?K?K?K?K?K?K?K?K?K?K?K?K*#-#-#*#?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . . .?K?K?K?K?K?K?K?K?K?K?K?K*# . . .FF?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K . . . . .?K?K?K?K?K?K?K?K?K?K?K*# . . . .FF?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K|# . . . . .*#-#-#-#-#-#-#-#-#-#-#*#~~~~~~~~*#?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K|# . . . . . . . . . . . . . . . . . . . . .|#?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K|# . . . . . . . . . . . . . . . . . . . . .|#?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K|# . . . . . . . . . . . . . . . . . . . . .|#?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
  ],
  annotations: [
    {
      symbol: "T",
      flags: [LevelAnnotationFlag.terminal],
      terminal: {
        onSpawn: [
          glitchy("Think fast!"),
          frustrated("You'll have to do better than that"),
          teach("Try avoiding the dead zone."),
        ],
        conversations: [],
        trackTags: [],
      },
    },
    {
      symbol: "S",
      flags: [LevelAnnotationFlag.spawn_player],
      startWithEntropy: 3,
    },
  ],
};