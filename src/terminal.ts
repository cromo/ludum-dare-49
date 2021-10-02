import {
  Level,
  Point,
  TERMINAL_HEIGHT,
  TERMINAL_WIDTH,
  TILE_SIZE_PIXELS,
  TerminalAnnotation,
  TerminalEntity,
  TerminalMessage,
  TerminalTone,
} from "./models";

love.graphics.setDefaultFilter("nearest");
const TERMINAL_IMAGE = love.graphics.newImage("res/terminal.png");
const LINE_LEFT_MARGIN = 2;
const LINE_TOP_MARGIN = 0;

const EMPTY_LINE: TerminalMessage = {
  text: "",
  tone: TerminalTone.emptyLine,
};

function pushTerminalMessage(terminal: TerminalEntity, message: TerminalMessage): void {
  terminal.lines.pop(); //remove last message
  terminal.lines.unshift(message); //at message at beginning
  return;
}

const TERMINAL_FONT = love.graphics.newFont(12, "mono");

const TERMINAL_BACK_COLOR = (): void => {
  return love.graphics.setColor(0.04, 0.04, 0.04, 0.7);
};
const TERMINAL_TONE_SHADOW_COLOR = (): void => {
  return love.graphics.setColor(0.1, 0.1, 0.1);
};
const TERMINAL_TONE_COLOR: { [key: number]: () => void } = {
  [TerminalTone.angry]: () => {
    return love.graphics.setColor(0.8, 0.2, 0.2);
  },
  [TerminalTone.emptyLine]: () => {
    return love.graphics.setColor(1, 0, 1);
  },
  [TerminalTone.frustrated]: () => {
    return love.graphics.setColor(0.85, 0.1, 0.1);
  },
  [TerminalTone.serious]: () => {
    return love.graphics.setColor(0.75, 0.75, 0.95);
  },
  [TerminalTone.teach]: () => {
    return love.graphics.setColor(0.5, 0.8, 0.5);
  },
  [TerminalTone.tease]: () => {
    // it will do this a lot
    return love.graphics.setColor(0.85, 0.85, 0.85);
  },
};
TERMINAL_FONT.setFilter("nearest");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function drawTerminalEntity(level: Level, terminal: TerminalEntity): void {
  const { push, pop, translate, draw, setColor, print, setFont } = love.graphics;
  const { pos, lines } = terminal;

  push();
  setColor(255, 255, 255);
  translate(pos.x, pos.y);

  // draw(TERMINAL_IMAGE);
  TERMINAL_BACK_COLOR();
  love.graphics.rectangle("fill", 0, 0, TERMINAL_WIDTH * TILE_SIZE_PIXELS, TERMINAL_HEIGHT * TILE_SIZE_PIXELS);
  // love.graphics.newQuad(0, 0, TERMINAL_WIDTH * TILE_SIZE_PIXELS, TERMINAL_HEIGHT * TILE_SIZE_PIXELS);

  // translate(TILE_SIZE_PIXELS, TILE_SIZE_PIXELS);
  setFont(TERMINAL_FONT);

  for (let terminalLine = 0; terminalLine < lines.length; terminalLine++) {
    push();
    translate(0, terminalLine * TILE_SIZE_PIXELS);
    const { text, tone } = lines[terminalLine];

    TERMINAL_TONE_SHADOW_COLOR();
    print(text, LINE_LEFT_MARGIN + 1, LINE_TOP_MARGIN + 1);
    print(text, LINE_LEFT_MARGIN, LINE_TOP_MARGIN + 1);

    (TERMINAL_TONE_COLOR[tone] || TERMINAL_TONE_COLOR[TerminalTone.emptyLine])();
    print(text, LINE_LEFT_MARGIN, LINE_TOP_MARGIN);

    pop();
  }

  pop();

  return;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateTerminalEntity(level: Level, terminal: TerminalEntity): TerminalEntity {
  // spends most of its time waiting for triggers
  //  no player input for too long (*)
  //  amount of time in a zone (*)
  //  amount of time in a region of the map (*)
  //  amount of time in the level on this life (*)
  //  amount of time across all attempts in this level (*)
  //  entering an area of the map (once per life, but track number of times per level)
  //  on player death (track number of deaths for the level)

  // any message in the terminal starts a cooldown before time-based triggers are met
  //  instantly respond to important triggers like death or reaching zones
  //  but don't spam with filler-text (marked *)
  // if (Math.random() < 0.05) {
  //   level.nextLevel = true;
  // }
  return terminal;
}

export function createTerminalEntity(pos: Point, terminalAnotation: TerminalAnnotation): TerminalEntity {
  const terminalEntity: TerminalEntity = {
    type: "terminalEntity",
    pos,
    draw: (l, e) => drawTerminalEntity(l, e as TerminalEntity),
    update: (l, e) => updateTerminalEntity(l, e as TerminalEntity),
    terminalAnotation,
    lines: [EMPTY_LINE, EMPTY_LINE, EMPTY_LINE, EMPTY_LINE, EMPTY_LINE],
  };
  terminalAnotation.entrance.forEach((em) => pushTerminalMessage(terminalEntity, em));
  // pushTerminalMessage(terminalEntity, terminalAnotation.entrance[0]);
  // pushTerminalMessage(terminalEntity, terminalAnotation.entrance[1]);
  return terminalEntity;
}
