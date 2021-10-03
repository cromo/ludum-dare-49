import { LevelAnnotationFlag, LevelDefinition } from "../models";
import { checkFn, checkRespawnCount, frustrated, glitchy, serious, step, teach, tease } from "./terminalTalk";

export const debugLevel: LevelDefinition = {
  layout: [
    "*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#",
    "|# . . . u . . . . . . . . . . . . . . . . . . . . . . u . . . . . . . . . . .|#",
    "|# . . . u . . .*# . . . . .*# . . . . . . . . . . . . u . . . . . . . . . . .|#",
    "|# . . . u . . .~~ . . . . .~~ . . . . . . . . . . . . u . . . . . . . . . . .|#",
    "|# . . . u . . .~~ . . . . .~~ . . . . . . . . . . . . u . . . . . . . . . . .|#",
    "|# . . . u . . .~~ . . . . .~~ . . . . . . . . . . . . u . . . . . . . . . . .|#",
    "|# . . . u . . .~~~~~~~~~~~~~~ . . . . . . . . . . . . u . . . . . . . . . . .|#",
    "FF . . .*# . . . . . .~~ . . . . . . . W . . . . . . . u . . . . . . . . . . .|#",
    "FF . . .*# . . . . . .~~ . . . . . . . W . . . . . . . u . . . . . . . . . . .|#",
    "|# . . .-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*# . . . . ! ! ! ! ! ! !|#",
    "|# . . . . . . . . . . . . T . . . . . . . . . . . . .|# . . . . ! ! ! ! ! ! !|#",
    "|# . . . . . . . . . . . . . . . . . . . . . . . . . .|# . . . . ! ! ! ! ! ! !|#",
    "|# . . . . . . . . . . . . . . . . . . . . . . . . . .*#*#*#*# . ! ! ! ! ! ! !|#",
    "|# _ _ _ _ _ _ _ _ _ _ _ . . . . . . . . . . . . . . .|# . . . . ! ! ! ! ! ! !|#",
    "|# _ _ _ _ _ _ _ _ _ _ _ . . . . . . . . . . . . . . .|# . . . . ! ! ! ! ! ! !|#",
    "|# _ _ _ _ _ _*#*#*#*#*# . . . . . . . . . . . . . . .*#*#*#*#*# ! ! ! ! ! ! !|#",
    "|# _ _ _ _ _ _ _ _ _ _ _ . . . . . . . . . . . . . . . . . . . . ! ! ! ! ! ! !|#",
    "|# _ _ _ _ _ _ _ _ _ _ _ .SS . . . . . . . . . . . . . . . . . . ! ! ! ! ! ! !|#",
    "|# _ _ _*#*#*# _ _ _ _ _*#*#*# f f f*#*#*# . . . . .*#*#*#^^^^^^*#*#*# ! ! ! !|#",
    "|# _ _ _ _ _ _ _ _*# _ _*#*#KK . . . .11 . . . . . .~~ . . . . . ! ! ! ! ! ! !|#",
    "|# _ _ _ _ _ _ _ _ _ _ _*#*#KK . . . .11 . . . . . .~~ . . . . . ! ! ! ! ! ! !|#",
    "*#-#-#-#-#-#-#-#-#-#KKKK-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#",
  ],
  annotations: [
    {
      symbol: "T", // terminal top left
      physicalMode: "empty",
      glitchMode: "empty",
      flags: [LevelAnnotationFlag.terminal],
      terminal: {
        onSpawn: [
          teach("Take your time here"),
          frustrated("How long will going to take?"),
          tease("Here we go again~"),
          serious("That looks dangerous"),
          glitchy("Hey what's this?"),
        ],
        trackTags: ["custom_flag", "up"],
        conversations: [
          {
            name: "death tease",
            steps: [
              step(checkRespawnCount(1), tease("not too good at this, are you")),
              step(checkRespawnCount(2), tease("there you go again")),
              step(checkRespawnCount(3), teach("protip: try doing that less")),
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 4,
                message: serious("a strange game..."),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 9,
                message: tease("you know that's killing you, right?"),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 10,
                message: tease("wow, okay then"),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 11,
                message: tease("keep doing that if you want"),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 12,
                message: tease("I don't mind"),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 13,
                message: tease("wheeeee...."),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 14,
                message: tease("..."),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 15,
                message: tease("Well you have fun with that"),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 16,
                message: tease("I'm not watching this anymore"),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 20,
                message: frustrated("Would you stop that please?"),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 21,
                message: frustrated("please?"),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 23,
                message: serious("fine."),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 24,
                message: teach("people die when they are killed"),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 25,
                message: serious("did you know that?"),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 26,
                message: serious("what a waste"),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 27,
                message: serious("you could try staying alive"),
              },
              {
                check: ({ track: { spawnTick, deathCount } }) => spawnTick && deathCount == 28,
                message: serious("people enjoy doing that too, you know"),
              },
            ],
          },
        ],
      },
    },
    {
      symbol: "f", //flag tracking test
      customTags: ["custom_flag"],
    },
    {
      symbol: "u", //flag tracking test
      customTags: ["up"],
    },
  ],
};
