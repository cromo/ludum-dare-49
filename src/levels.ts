import { LevelDefinition, parseLevelDefinition } from "./levelLoader";

const levelDefinitions: LevelDefinition[] = [
  {
    layout: [
      "*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#",
      "|#                                                                            |#",
      "|#                                                                            |#",
      "|#                                                                            |#",
      "|#                                                                            |#",
      "|#                                                                            |#",
      "|#                                                                            |#",
      "|#                                                                            |#",
      "|#                                                                            |#",
      "|#                                                                            |#",
      "|#                                                                            |#",
      "|#                                                                            |#",
      "*#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#*#",
    ],
    annotations: [],
  },
];

const levels = levelDefinitions.map((levelDefinition) => parseLevelDefinition(levelDefinition));

export default levels;
