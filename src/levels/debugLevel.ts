import { LevelAnnotationFlag, LevelDefinition, TerminalTone } from "../models";

export const debugLevel: LevelDefinition = {
  layout: [
    "*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#",
    "|# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|#",
    "|# . . . . . . .*# . . . . .*# . . . . . . . . . . . . . . . . . . . . . . . .|#",
    "|# . . . . . . .~~ . . . . .~~ . . . . . . . . . . . . . . . . . . . . . . . .|#",
    "|# . . . . . . .~~ . . . . .~~ . . . . . . . . . . . . . . . . . . . . . . . .|#",
    "|# . . . . . . .~~ . . . . .~~ . . . . . . . . . . . . . . . . . . . . . . . .|#",
    "|# . . . . . . .~~~~~~~~~~~~~~ . . . . . . . . . . . . . . . . . . . . . . . .|#",
    "FF . . .*# . . . . . .~~ . . . . . . . W . . . . . . . . . . . . . . . . . . .|#",
    "FF . . .*# . . . . . .~~ . . . . . . . W . . . . . . . . . . . . . . . . . . .|#",
    "|# . . .-#-#-#-#-#-#-#-#-#-#-T-t-t-t-t-t-t-t-t-t-t-t-t*t . . . . ! ! ! ! ! ! !|#",
    "|# . . . . . . . . . . . . . t . . . . . . . . . . . .|t . . . . ! ! ! ! ! ! !|#",
    "|# . . . . . . . . . . . . . t . . . . . . . . . . . .|t . . . . ! ! ! ! ! ! !|#",
    "|# . . . . . . . . . . . . . t . . . . . . . . . . . .*t*#*#*# . ! ! ! ! ! ! !|#",
    "|# _ _ _ _ _ _ _ _ _ _ _ . . t . . . . . . . . . . . .|t . . . . ! ! ! ! ! ! !|#",
    "|# _ _ _ _ _ _ _ _ _ _ _ . . t . . . . . . . . . . . .|t . . . . ! ! ! ! ! ! !|#",
    "|# _ _ _ _ _ _*#*#*#*#*# . . t t t t t t t t t t t t t*t*#*#*#*# ! ! ! ! ! ! !|#",
    "|# _ _ _ _ _ _ _ _ _ _ _ . . . . . . . . . . . . . . . . . . . . ! ! ! ! ! ! !|#",
    "|# _ _ _ _ _ _ _ _ _ _ _ .SS . . . . . . . . . . . . . . . . . . ! ! ! ! ! ! !|#",
    "|# _ _ _*#*#*# _ _ _ _ _*#*#*# . . .*#*#*# . . . . .*#*#*# ^ ^ ^*#*#*# ! ! ! !|#",
    "|# _ _ _ _ _ _ _ _*# _ _*#*#KK . . . .11 . . . . . .~~ . . . . . ! ! ! ! ! ! !|#",
    "|# _ _ _ _ _ _ _ _ _ _ _*#*#KK . . . .11 . . . . . .~~ . . . . . ! ! ! ! ! ! !|#",
    "*#-#-#-#-#-#-#-#-#-#KKKK-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#",
  ],
  annotations: [
    {
      symbol: "T", // terminal top left
      physicalMode: "solid",
      glitchMode: "solid",
      flags: [LevelAnnotationFlag.terminal],
      terminal: {
        entrance: [
          {
            text: "Hello world",
            tone: TerminalTone.teach,
          },
          {
            text: "Hello world 2",
            tone: TerminalTone.teach,
          },
          {
            text: "Hello world 3",
            tone: TerminalTone.teach,
          },
          {
            text: "Hello world 4",
            tone: TerminalTone.teach,
          },
        ],
      },
    },
    {
      symbol: "t", // terminal boundary
      physicalMode: "solid",
      glitchMode: "solid",
    },
  ],
};
