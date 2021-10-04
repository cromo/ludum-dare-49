import { LevelAnnotationFlag, LevelDefinition } from "../models";
import { angry, onTagHit, step, teach, tease } from "./terminalTalk";

// how do one-ways work?
enum Tags {
  FreshAir = "fresh",
  FreshEntropy = "entropy",
  SoMuchEntropy = "high",
}

export const level2: LevelDefinition = {
  layout: [
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K|# z z z z z z z z z z z z z z zKK|#?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K|# z z z z z z z z z z z z z z zKK|#?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K*#*#-#-#1111*#-#-#-#-#-#-#-# z z z*#*#?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K|# . . . . .|#?K?K?K?K?K?K|# z z z|#?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K|# . . . . .|#?K?K?K?K?K?KKK z z z|#?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K|# . . . . .|#?K?K?K?K?K?KKK z z z|#?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K|# .1111111111111111111111111111111111111111?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K|# . . . e e|#?K?K?K?K?K?K|# . . .|#?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K|#-# . . e e|#?K?K?K?K?K?K|#FFFFFF|#?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K|# . . . e e|#?K?K?K?K?K?K*#-#-#-#*#?K?K?K?K?K?K?K?K?K?K",
    "*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#1111*#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "|# _ _ _ _ _ _ _11 f f f f . . . . .|#?K?K?K?K?T?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "|# _ _ _SS _ _ _11 f f f f . . . . .|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
  ],
  annotations: [
    {
      symbol: "f",
      customTags: [Tags.FreshAir],
    },
    {
      symbol: "e",
      customTags: [Tags.FreshEntropy],
    },
    {
      symbol: "z",
      customTags: [Tags.SoMuchEntropy],
      zoneMode: "hot",
    },
    {
      symbol: "S", //make start square dead zone too
      zoneMode: "dead",
      flags: [LevelAnnotationFlag.spawn_player],
      startWithEntropy: 2,
      customTags: [],
    },
    {
      symbol: "T",
      flags: [LevelAnnotationFlag.terminal],
      terminal: {
        trackTags: [Tags.FreshAir, Tags.FreshEntropy, Tags.SoMuchEntropy],
        generalMessages: [tease("No going back."), teach("Stuck? (Reset with R)")],
        onOverloadDeath: [tease("Too much of a good thing?")],
        onKillPlaneDeath: [tease("And you were so close too!")],
        conversations: [
          {
            name: "freshair",
            steps: [
              step(onTagHit(Tags.FreshAir), tease("Ahh~ fresh air.")),
              step(onTagHit(Tags.FreshEntropy), teach("And more entropy")),
              step(onTagHit(Tags.SoMuchEntropy), teach("So much entropy!")),
            ],
          },
        ],
      },
    },
  ],
};
