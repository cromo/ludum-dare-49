import { playSfx } from "./audio";
import { HorizontalDirection, currentInput } from "./input";
import { getPlayer } from "./levels";
import {
  Level,
  Point,
  TERMINAL_FILLER_COOLDOWN_TICKS,
  TERMINAL_GENERAL_FILLER_COOLDOWN_TICKS,
  TERMINAL_HEIGHT,
  TERMINAL_IDLE_AFTER_NO_PLAYER_INPUT_FOR_TICKS,
  TERMINAL_WIDTH,
  TILE_SIZE_PIXELS,
  TerminalAnnotation,
  TerminalEntity,
  TerminalMessage,
  TerminalMessageDisplay,
  TerminalTone,
} from "./models";

love.graphics.setDefaultFilter("nearest");
// const TERMINAL_IMAGE = love.graphics.newImage("res/terminal.png");
const LINE_LEFT_MARGIN = 2;
const LINE_TOP_MARGIN = 0;

const EMPTY_LINE: TerminalMessageDisplay = {
  text: "",
  tone: TerminalTone.emptyLine,
  ticks: 50,
};

function pushTerminalMessage(terminal: TerminalEntity, message: TerminalMessage): void {
  terminal.lines.pop(); //remove last message
  terminal.lines.unshift({ ...message, ticks: 0 }); //at message at beginning
  terminal.trackers.ticksSinceLastFillerMessage = 0;
  playSfx("terminal");
  return;
}

function maybePushTerminalMessage(terminal: TerminalEntity, message: TerminalMessage | undefined): boolean {
  if (!message) return false;
  terminal.lines.pop(); //remove last message
  terminal.lines.unshift({ ...message, ticks: 0 }); //at message at beginning
  terminal.trackers.ticksSinceLastFillerMessage = 0;
  playSfx("terminal");
  return true;
}

const TERMINAL_FONT = love.graphics.newFont(12, "mono");

const TERMINAL_BACK_COLOR = (): void => {
  return love.graphics.setColor(0.04, 0.04, 0.04, 0.7);
};
const TERMINAL_TONE_SHADOW_COLOR = (): void => {
  return love.graphics.setColor(0.1, 0.1, 0.1);
};
const setDimmedColor = (r: number, g: number, b: number, a: number): void => {
  return love.graphics.setColor(r * a, g * a, b * a);
};
const TERMINAL_TONE_COLOR: { [key: number]: (a: number) => void } = {
  [TerminalTone.angry]: (a: number) => {
    return setDimmedColor(0.8, 0.2, 0.2, a); // Red
  },
  [TerminalTone.emptyLine]: (a: number) => {
    return setDimmedColor(1, 0, 1, a);
  },
  [TerminalTone.frustrated]: (a: number) => {
    return setDimmedColor(0.85, 0.1, 0.1, a); // Very red
  },
  [TerminalTone.serious]: (a: number) => {
    return setDimmedColor(0.75, 0.75, 0.95, a); // Light blue
  },
  [TerminalTone.teach]: (a: number) => {
    return setDimmedColor(0.5, 0.8, 0.5, a); // Light green
  },
  [TerminalTone.tease]: (a: number) => {
    // it will do this a lot
    return setDimmedColor(0.85, 0.85, 0.85, a); // White
  },
  [TerminalTone.glitchy]: (a: number) => {
    return setDimmedColor(0.97, 0.97, 0, a); // Yellow
  },
};
TERMINAL_FONT.setFilter("nearest");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function drawTerminalEntity(level: Level, terminal: TerminalEntity): void {
  const { push, pop, translate, setColor, print, setFont } = love.graphics;
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
    const { text, tone, ticks } = lines[terminalLine];

    TERMINAL_TONE_SHADOW_COLOR();
    print(text, LINE_LEFT_MARGIN + 1, LINE_TOP_MARGIN + 1);
    print(text, LINE_LEFT_MARGIN, LINE_TOP_MARGIN + 1);

    if (ticks >= 4) {
      const dim = terminalLine == lines.length - 1 ? 0.5 : terminalLine == lines.length - 2 ? 0.8 : 1;
      (TERMINAL_TONE_COLOR[tone] || TERMINAL_TONE_COLOR[TerminalTone.emptyLine])(dim);
      print(text, LINE_LEFT_MARGIN, LINE_TOP_MARGIN);
    } else {
      lines[terminalLine].ticks++;
      const dim = (ticks + 1) * 0.3;
      (TERMINAL_TONE_COLOR[tone] || TERMINAL_TONE_COLOR[TerminalTone.emptyLine])(dim);
      print(text, LINE_LEFT_MARGIN, LINE_TOP_MARGIN);
    }

    pop();
  }

  pop();

  return;
}

function updateTerminalEntity(level: Level, terminal: TerminalEntity): TerminalEntity {
  // spends most of its time waiting for triggers
  //  no player input for too long (*)
  //  amount of time in a zone (*)
  //  amount of time in a region of the map (*)
  //  amount of time in the level on this life (*)
  //  amount of time across all attempts in this level (*)

  //  entering an area of the map (once per life, but track number of times per level)
  //  onSpawn - on player spawn (track number of deaths for the level)
  //  onDeath - on on player death (track number of deaths for the level)

  // any message in the terminal starts a cooldown before time-based triggers are met
  //  instantly respond to important triggers like death or reaching zones
  //  but don't spam with filler-text (marked *)
  const player = getPlayer();

  if (player) {
    const tilePos: Point = {
      x: Math.floor(player.pos.x / TILE_SIZE_PIXELS),
      y: Math.floor(player.pos.y / TILE_SIZE_PIXELS),
    };
    // track tags
    const customTags = level.customTags[tilePos.y][tilePos.x];
    // tags where the player is standing
    customTags.forEach((tag) => {
      const trackTags = terminal.trackers.trackedTag.filter((ttag) => ttag.tag == tag);
      if (trackTags.length == 1) {
        const trackTag = trackTags[0];
        if (!trackTag.enteredYetThisLife) {
          trackTag.enteredYetThisLife = true;
          trackTag.timesEnteredAtLeastOnce++;
        }
        trackTag.ticksThisLife++;
      }
      return;
    });
    terminal.trackers.activeTags = customTags;
  } else {
    terminal.trackers.activeTags = [];
  }

  // don't deathTick more than once per attempt
  if (terminal.trackers.hasDied) terminal.trackers.deathTick = false;

  // first check conversations
  terminal.trackers.conversations.forEach((conversation) => {
    // if the conversation is matched, use it or post its message and advance the progress by one
    const nextStep = conversation.steps[conversation.progress];
    if (!nextStep) return;
    if (!nextStep.check({ player, level, terminal, track: terminal.trackers })) return;
    conversation.progress++;
    if (nextStep.message) {
      pushTerminalMessage(terminal, nextStep.message);
    }
    if (nextStep.run) nextStep.run({ player, level, terminal, track: terminal.trackers });
  });
  // then use fillers if no conversations match

  // on spawn filler
  if (
    terminal.trackers.spawnTick &&
    terminal.trackers.ticksSinceLastFillerMessage > TERMINAL_FILLER_COOLDOWN_TICKS &&
    terminal.terminalAnotation.onSpawn
  ) {
    if (maybePushTerminalMessage(terminal, terminal.terminalAnotation.onSpawn[terminal.trackers.onSpawnProgress])) {
      terminal.trackers.onSpawnProgress++;
    }
  }

  // death fillers
  //  kill plane filler
  if (
    terminal.trackers.deathTick &&
    terminal.trackers.lastDeathType == "killPlane" &&
    terminal.trackers.ticksSinceLastFillerMessage > TERMINAL_FILLER_COOLDOWN_TICKS &&
    terminal.terminalAnotation.onKillPlaneDeath
  ) {
    if (
      maybePushTerminalMessage(
        terminal,
        terminal.terminalAnotation.onKillPlaneDeath[terminal.trackers.onKillPlaneDeathProgress]
      )
    ) {
      terminal.trackers.onKillPlaneDeathProgress++;
    }
  }
  //  overload filler
  if (
    terminal.trackers.deathTick &&
    terminal.trackers.lastDeathType == "overload" &&
    terminal.trackers.ticksSinceLastFillerMessage > TERMINAL_FILLER_COOLDOWN_TICKS &&
    terminal.terminalAnotation.onOverloadDeath
  ) {
    if (
      maybePushTerminalMessage(
        terminal,
        terminal.terminalAnotation.onOverloadDeath[terminal.trackers.onOverloadDeathProgress]
      )
    ) {
      terminal.trackers.onOverloadDeathProgress++;
    }
  }
  //  telesplat filler
  if (
    terminal.trackers.deathTick &&
    terminal.trackers.lastDeathType == "telesplat" &&
    terminal.trackers.ticksSinceLastFillerMessage > TERMINAL_FILLER_COOLDOWN_TICKS &&
    terminal.terminalAnotation.onTelesplatDeath
  ) {
    if (
      maybePushTerminalMessage(
        terminal,
        terminal.terminalAnotation.onTelesplatDeath[terminal.trackers.onTelesplatDeathProgress]
      )
    ) {
      terminal.trackers.onTelesplatDeathProgress++;
    }
  }
  //  reset filler
  if (
    terminal.trackers.deathTick &&
    terminal.trackers.lastDeathType == "reset" &&
    // terminal.trackers.ticksSinceLastFillerMessage > TERMINAL_FILLER_COOLDOWN_TICKS &&
    terminal.terminalAnotation.onResetDeath
  ) {
    if (
      maybePushTerminalMessage(
        terminal,
        terminal.terminalAnotation.onResetDeath[terminal.trackers.onResetDeathProgress]
      )
    ) {
      terminal.trackers.onResetDeathProgress++;
    }
  }
  //  OOB filler
  if (
    terminal.trackers.deathTick &&
    terminal.trackers.lastDeathType == "OOB" &&
    terminal.trackers.ticksSinceLastFillerMessage > TERMINAL_FILLER_COOLDOWN_TICKS &&
    terminal.terminalAnotation.onOOBDeath
  ) {
    if (
      maybePushTerminalMessage(terminal, terminal.terminalAnotation.onOOBDeath[terminal.trackers.onOOBDeathProgress])
    ) {
      terminal.trackers.onOOBDeathProgress++;
    }
  }

  // on idle filler
  if (
    terminal.trackers.ticksOfPlayerIdling > TERMINAL_IDLE_AFTER_NO_PLAYER_INPUT_FOR_TICKS &&
    terminal.trackers.ticksSinceLastFillerMessage > TERMINAL_FILLER_COOLDOWN_TICKS &&
    terminal.terminalAnotation.idleMessages
  ) {
    if (
      maybePushTerminalMessage(
        terminal,
        terminal.terminalAnotation.idleMessages[terminal.trackers.idleMessagesProgress]
      )
    ) {
      terminal.trackers.idleMessagesProgress++;
      terminal.trackers.ticksOfPlayerIdling = 0; // wait the full idling time again for each idle message
    }
  }

  // TODO: zone fillers

  // general filler
  if (
    terminal.trackers.ticksSinceLastFillerMessage > TERMINAL_GENERAL_FILLER_COOLDOWN_TICKS &&
    terminal.terminalAnotation.generalMessages
  ) {
    if (
      maybePushTerminalMessage(
        terminal,
        terminal.terminalAnotation.generalMessages[terminal.trackers.generalMessagesProgress]
      )
    ) {
      terminal.trackers.generalMessagesProgress++;
    }
  }

  // clear spawn and death ticks
  terminal.trackers.hasDied = terminal.trackers.hasDied || terminal.trackers.deathTick;
  terminal.trackers.deathTick = false;
  terminal.trackers.spawnTick = false;

  // advance tick trackers
  terminal.trackers.ticksSinceLastFillerMessage++;

  // track player idling
  const input = currentInput();
  if (
    player &&
    player.stateMachine.state.type == "STANDING" &&
    player.vel.x == 0.0 &&
    input.moveDirection == HorizontalDirection.Neutral &&
    !input.wantsToDash &&
    !input.wantsToJump &&
    !input.wantsToReset
  ) {
    terminal.trackers.ticksOfPlayerIdling++;
  } else {
    terminal.trackers.ticksOfPlayerIdling = 0;
  }

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
    persistLog: true,
    trackers: {
      ticksSinceLastFillerMessage: TERMINAL_FILLER_COOLDOWN_TICKS * 10, //be ready to send spawn messages
      spawnTick: true,
      ticksOfPlayerIdling: 0,
      ticksInDeadZone: 0,
      ticksInHotZone: 0,
      ticksInTopHalf: 0,
      ticksInBottomHalf: 0,
      ticksInLeftHalf: 0,
      ticksInRightHalf: 0,
      ticksSinceSpawn: 0,
      ticksOnLevel: 0,

      deathTick: false,
      hasDied: false,
      deathCount: 0,
      deathsByKillPlane: 0,
      deathsByOverload: 0,
      deathsByTelesplat: 0,
      deathsByReset: 0,
      deathsByOOB: 0,
      lastDeathType: "none",

      trackedTag: terminalAnotation.trackTags.map((tag) => {
        return {
          tag,
          enteredYetThisLife: false,
          ticksThisLife: 0,
          timesEnteredAtLeastOnce: 0,
        };
      }),
      activeTags: [],
      conversations: terminalAnotation.conversations.map((convoAnno) => {
        return {
          ...convoAnno,
          progress: 0,
        };
      }),

      onSpawnProgress: 0,
      onKillPlaneDeathProgress: 0,
      onOverloadDeathProgress: 0,
      onTelesplatDeathProgress: 0,
      onResetDeathProgress: 0,
      onOOBDeathProgress: 0,
      idleMessagesProgress: 0,
      deadZoneMessagesProgress: 0,
      hotZoneMessagesProgress: 0,
      normalZoneMessagesProgress: 0,
      generalMessagesProgress: 0,
    },
  };
  // (terminalAnotation.onSpawn || []).forEach((em) => pushTerminalMessage(terminalEntity, em));
  // pushTerminalMessage(terminalEntity, terminalAnotation.entrance[0]);
  // pushTerminalMessage(terminalEntity, terminalAnotation.entrance[1]);
  return terminalEntity;
}

export function migrateTerminalEntity(previous: TerminalEntity): TerminalEntity {
  const pt = previous.trackers;
  return {
    ...previous,
    trackers: {
      ...pt,
      spawnTick: true, // preparing for a spawn
      hasDied: false,
      deathTick: false, // this should be cleared before level resets, not now
      // deathCount: pt.deathCount + 1, // this should be incremented when the player dies, not now
      ticksInBottomHalf: 0,
      ticksInTopHalf: 0,
      ticksInLeftHalf: 0,
      ticksInRightHalf: 0,
      ticksInDeadZone: 0,
      ticksInHotZone: 0,
      // ticksOnLevel: 0, // DONT reset this one! it's the total time across multiple plays of the same level
      // ticksSinceLastFillerMessage: 0 // DONT reset this one! death and spawn messages are usually filler messages
      ticksOfPlayerIdling: 0,
      ticksSinceSpawn: 0,
      trackedTag: pt.trackedTag.map((tt) => {
        return {
          ...tt,
          enteredYetThisLife: false,
          ticksThisLife: 0,
          // timesEnteredAtLeastOnce: 0, // DONT reset this one! number of attempts that have had at least one entry
        };
      }),
      activeTags: [],
    },
  };
}
