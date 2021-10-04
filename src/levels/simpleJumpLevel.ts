import { LevelAnnotationFlag, LevelDefinition } from "../models";
import { glitchy, serious, teach, tease } from "./terminalTalk";

export const simpleJumpLevel: LevelDefinition = {
  layout: [
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K*#-#*#-#-#-#-#*#-#-#-#-#*#*#-#-#-#-#*#-#-#-#-#*#-#*#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . . . . . . . . . . . . . . . . . . . . .|#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . . . . . . . . . . . . . . . . . . . . .|#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . . . . . . . .?. . . . . . . . . . . . .|#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# .SS . . . . . . . . . . . . . . . . . . . .FF .|#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K*#-#*#-#-# . .?. . . . . .?.?. . . . . . .-#-#*#-#*#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?T?K?K?K?K?K?K?K K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
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
        trackTags: [],
        onSpawn: [serious("Let's see you jump over this.")],
        onResetDeath: [serious("Too much for you to handle?"), serious("There's no turning back now")],
        onKillPlaneDeath: [
          tease("There's a hole in the ground."),
          serious("Try jumping over it."),
          teach("Try double jumping."),
          teach("Try jumping even more times."),
          glitchy("Wait to build entropy. Be unstable."),
        ],
        idleMessages: [serious("Ah, sweet Serenity~")],
        conversations: [],
      },
    },
  ],
};
