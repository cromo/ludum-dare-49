import { LevelAnnotationFlag, LevelDefinition } from "../models";
import { onDeath, onRespawn, onTagHit, respawnCount, serious, step, teach, tease } from "./terminalTalk";

// hey a glitch maze sort of thing

export const level3: LevelDefinition = {
  layout: [
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "*#-#-#-#-#-#-#-#-#*#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K*#-#-#-#-#-#-#-#-#*#",
    "|# ! ! ! ! ! ! ! !|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|# .=. . . . c c c|#",
    "|# ! ! ! !SS ! ! !|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|# . . .FF . c c c|#",
    "*#~~~~*#-#-#-#-#-#*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#~~~~*#",
    "|#~~~~|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#~~~~|#",
    "|#~~~~|#?K?K?K?T?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#~~~~|#",
    "|#~~~~|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#~~~~|#",
    "|#~~~~|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#~~~~|#",
    "|#~~~~|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#~~~~|#",
    "|# . .|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#~~~~|#",
    "|# . .|#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K|#~~~~|#",
    "|# . .*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#~~~~|#",
    "|# a a~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ b b|#",
    "|# a a~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ b b|#",
    "|# a a~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ b b|#",
    "*# . .-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-# . .*#",
    "*# .?.-#?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?. . .*#",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
    "?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K?K",
  ],
  annotations: [
    {
      symbol: "T",
      flags: [LevelAnnotationFlag.terminal],
      terminal: {
        // onSpawn: [teach("dash a lot"), teach("let's try that again")],
        // generalMessages: [serious("this level is hard")],
        // onKillPlaneDeath: [tease("don't stop here")],
        // onResetDeath: [tease("pressure getting to you?")],
        trackTags: ["tag-a", "tag-b", "tag-c"],

        conversations: [
          {
            name: "teaching cromo", // @cromo
            steps: [
              //
              step(onDeath, tease("don't stop here")),
              step([onRespawn, respawnCount(3)], tease("I'll guide you through it")),

              step([onTagHit("tag-a")], teach("now glitch right")),
              step([onTagHit("tag-b")], teach("now glitch up")),

              step(onDeath, tease("that's not up.")),

              // step([respawnCount(7)], tease("I believe in you")),
              // step([respawnCount(9)], serious("...maybe not")),
            ],
          },
          {
            name: "congratulations!",
            steps: [
              step(onDeath),
              step([respawnCount(3)]),

              step([onTagHit("tag-a")]),
              step([onTagHit("tag-b")]),

              // step(onTagHit("tag-c"), serious("Good job!")),
              {
                //
                check: ({ player }) => {
                  return player?.stateMachine.state.type == "OUT_OF_ENTROPY";
                },
                message: serious("get moving?"),
                run: ({ terminal }) => {
                  return;
                },
              },
            ],
          },
        ],
      },
    },
    {
      symbol: "S",
      flags: [LevelAnnotationFlag.spawn_player],
      zoneMode: "hot",
    },
    {
      symbol: "a",
      customTags: ["tag-a"],
    },
    {
      symbol: "b",
      customTags: ["tag-b"],
    },
    {
      symbol: "c",
      customTags: ["tag-c"],
    },
    // {
    //   symbol: "I",
    //   flags: [LevelAnnotationFlag.image],
    //   image: "res/terminal.png",
    // },
  ],
};
