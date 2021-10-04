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
  NextToWall = "next to wall",
  AwayFromWall = "AwayFromWall",
  OtherSideOfWall = "OtherSideOfWall",
}

export const encourageExhaustion: LevelDefinition = {
  layout: [
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#?K?K?K?K?K?K?K?K?K?K?K?K",
    "|# . . . . .*# . . .|# . . .|# . . .~~ . . . . . . . .|#?K?K?K?K?K?K?K?K?K?K?K?K",
    "|# . . . . .~~ . . .~~ . . .*# . . .~~ . . . . . . . .|#?K?K?K?K?K?K?K?K?K?K?K?K",
    "|# . . . . .~~ . . .~~ . . .~~ . . .~~ . . . . . . .*#|#?K?K?K?K?K?K?K?K?K?K?K?K",
    "|# .SS . . .~~ . . .~~ . . .~~ . . .~~ . . . .FF .*#*#|#?K?K?K?K?K?K?K?K?K?K?K?K",
    "*#-#-#-#-#-#*#-#-#-#*#-#-#-#*#-#-#-#*#-#-#-#-#-#-#-#-#*#?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?T?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
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
      customTags: [],
    },
    {
      symbol: "w",
      zoneMode: "dead",
      customTags: [Tags.NextToWall],
    },
    {
      symbol: "a",
      zoneMode: "dead",
      customTags: [Tags.AwayFromWall],
    },
    {
      symbol: "o",
      zoneMode: "dead",
      customTags: [Tags.OtherSideOfWall],
    },
    {
      symbol: "T",
      flags: [LevelAnnotationFlag.terminal],
      terminal: {
        trackTags: [Tags.AwayFromWall, Tags.NextToWall, Tags.OtherSideOfWall],
        onSpawn: [tease("Gotta go fast?")],
        conversations: [
          {
            name: "shutdown",
            steps: [
              step(onOutOfEntropy, tease("Too much too handle?")),
              step(onNotOutOfEntropy, angry("Oh, you're awake.")),
            ],
          },
        ],
      },
    },
  ],
};
