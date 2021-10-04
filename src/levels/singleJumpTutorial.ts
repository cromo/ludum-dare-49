import { LevelAnnotationFlag, LevelDefinition } from "../models";
import {
  angry,
  frustrated,
  onDeath,
  onOutOfEntropy,
  onTagActive,
  onTagHit,
  serious,
  step,
  teach,
  tease,
} from "./terminalTalk";

enum Tags {
  MovedTowardExit = "MovedTowardExit",
  NearBeginning = "NearBeginning",
  InCorner = "InCorner",
  NearExit = "NearExit",
}

export const singleJumpTutorial: LevelDefinition = {
  layout: [
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K*#-#-#-#-#-#-#*#-#-#-#-#*#*#-#-#-#-#*#-#-#-#-#-#-#*#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . . . . . . . . . . . . . . . . . . . . .|#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . . . . . . . . . . . . . . . . . . . . .|#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . . . . . . . . . . . . . . . . . . . . . . . .|#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K|# . .SS . . . . . . . . . . . . . . . . . .FF . .|#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K*#-#-#-#-#-#-#*#-#-# . . . . . .-#-#*#-#-#-#-#-#-#*#?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|# . . . . . . . .|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|# . . . . . . . .|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|# . . . . .?. . .|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|# .?. . .?. . . .|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
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
      customTags: [Tags.NearBeginning],
    },
    {
      symbol: "T",
      flags: [LevelAnnotationFlag.terminal],
      terminal: {
        trackTags: ["w", Tags.MovedTowardExit, Tags.NearBeginning, Tags.InCorner, Tags.NearExit],
        generalMessages: [tease("How're you gonna handle this?")],
        idleMessages: [tease("Not at all, looks like."), tease("Should've stayed where you were.")],
        conversations: [
          {
            name: "death taunts",
            steps: [
              step(onDeath, tease("Not like that I hope.")),
              step(onDeath, tease("Maybe try jumping?")),
              step(onDeath, tease("Not like that...")),
              step(onDeath, teach("(Press space)")),
            ],
          },
        ],
      },
    },
  ],
};
