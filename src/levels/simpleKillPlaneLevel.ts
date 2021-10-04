import { LevelAnnotationFlag, LevelDefinition } from "../models";
import { onTagHit, serious, step, tagHitCount, teach, tease } from "./terminalTalk";

export const simpleKillPlaneLevel: LevelDefinition = {
  layout: [
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K*#-#-#-#-#-#*#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . .|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . .SS . .|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . .*# . .|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K*# . . . . .*#*#-#-#-#-#*#*#-#-#-#-#*#-#-#-#-#*#-#*#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . . . . . . . . . . . . . .KKKKKKKKKKKKKK|#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . . . . . . . .*#*# . . . .KKFF . . . . .|#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . . . . . . . .*#*# . . . .KKFF . . . . .*#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . . . . . . . .*#*# . . . .KKKKKKKKKKKK .|#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . . .*#*# . . . . . . . . . . . . . . w w|#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K*#KKKKKKKKKKKK*#*#-#-#-#*#*#-#-#-#-#*#-#-#-#-#*#-#*#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?T?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
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
    },
    {
      symbol: "T",
      flags: [LevelAnnotationFlag.terminal],
      terminal: {
        trackTags: ["w"],
        onSpawn: [serious("What's this below you?")],
        onResetDeath: [serious("Afraid of heights?")],
        onKillPlaneDeath: [
          tease("Oh, it kills you."),
          tease("It killed you again."),
          tease("Still kills you."),
          tease("Boy it's really good killing you."),
        ],
        idleMessages: [serious("Ah, sweet Serenity~")],
        conversations: [
          {
            name: "tricky jump",
            steps: [
              step([onTagHit("w")], teach("Glitch to reach the exit.")),
              step([onTagHit("w"), tagHitCount("w", 2)], tease("Tricky, isn't it?")),
            ],
          },
        ],
      },
    },
    {
      symbol: "w",
      customTags: ["w"],
      zoneMode: "dead",
    },
  ],
};
