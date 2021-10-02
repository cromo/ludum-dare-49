import {
  Level,
  Point,
  TILE_SIZE_PIXELS,
  TerminalAnnotation,
  TerminalEntity,
  TerminalMessage,
  TerminalTone,
} from "./models";

const TERMINAL_IMAGE = love.graphics.newImage("res/terminal.png");
const LINE_LEFT_MARGIN = 2;
const LINE_TOP_MARGIN = 2;

const EMPTY_LINE: TerminalMessage = {
  text: "",
  tone: TerminalTone.emptyLine,
};

function pushTerminalMessage(terminal: TerminalEntity, message: TerminalMessage): void {
  terminal.lines.pop(); //remove last message
  terminal.lines.unshift(message); //at message at beginning
  return;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function drawTerminalEntity(level: Level, terminal: TerminalEntity): void {
  const { push, pop, translate, draw, setColor, print } = love.graphics;
  const { pos, lines } = terminal;

  push();
  setColor(255, 255, 255);
  translate(pos.x, pos.y);

  draw(TERMINAL_IMAGE);
  translate(TILE_SIZE_PIXELS, TILE_SIZE_PIXELS);

  for (let terminalLine = 0; terminalLine < lines.length; terminalLine++) {
    push();
    translate(0, terminalLine * TILE_SIZE_PIXELS);
    const { text, tone } = lines[terminalLine];
    if (tone == TerminalTone.angry) {
      setColor(255, 0, 0);
    } else {
      setColor(255, 255, 255);
    }
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
  pushTerminalMessage(terminalEntity, terminalAnotation.entrance[0]);
  pushTerminalMessage(terminalEntity, terminalAnotation.entrance[1]);
  return terminalEntity;
}
