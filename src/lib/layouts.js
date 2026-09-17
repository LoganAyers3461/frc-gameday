// src/lib/layouts.js

const VISIBLE = "visible";
const HIDDEN = "hidden";

const SIDES = "sides";
const BOTTOM = "bottom";
const TOP = "top";

const LARGE = {
  matchInfo: VISIBLE,
  teamTracker: SIDES,
};

const LARGE_TOP_TRACKER = {
  matchInfo: VISIBLE,
  teamTracker: TOP,
};

const LARGE_BOTTOM_TRACKER = {
  matchInfo: VISIBLE,
  teamTracker: BOTTOM,
};

const COMPACT = {
  matchInfo: HIDDEN,
  teamTracker: BOTTOM,
};

const COMPACT_SIDES = {
  matchInfo: HIDDEN,
  teamTracker: SIDES,
};

const NONE = {
  matchInfo: HIDDEN,
  teamTracker: HIDDEN,
}

export const LAYOUTS = {
  single: {
    name: "Single",

    slots: [
      { x: 0, y: 0, w: 100, h: 100, presentation: LARGE },
    ],
  },

  verticalSplit: {
    name: "Vertical Split",

    slots: [
      { x: 0, y: 0, w: 50, h: 100, presentation: LARGE_TOP_TRACKER },
      { x: 50, y: 0, w: 50, h: 100, presentation: LARGE_TOP_TRACKER },
    ],
  },

  horizontalSplit: {
    name: "Horizontal Split",

    slots: [
      { x: 0, y: 0, w: 100, h: 50, presentation: LARGE },
      { x: 0, y: 50, w: 100, h: 50, presentation: LARGE },
    ],
  },

  onePlusTwo: {
    name: "1 + 2",

    slots: [
      { x: 0, y: 0, w: 60, h: 100, presentation: LARGE },
      { x: 60, y: 0, w: 40, h: 50, presentation: LARGE_TOP_TRACKER },
      { x: 60, y: 50, w: 40, h: 50, presentation: LARGE_TOP_TRACKER },
    ],
  },

  quad: {
    name: "Quad",

    slots: [
      { x: 0, y: 0, w: 50, h: 50, presentation: LARGE },
      { x: 50, y: 0, w: 50, h: 50, presentation: LARGE },
      { x: 0, y: 50, w: 50, h: 50, presentation: LARGE },
      { x: 50, y: 50, w: 50, h: 50, presentation: LARGE },
    ],
  },

  onePlusThree: {
    name: "1 + 3",

    slots: [
      { x: 0, y: 0, w: 75, h: 100, presentation: LARGE },
      { x: 75, y: 0, w: 25, h: 33.33, presentation: COMPACT },
      { x: 75, y: 33.33, w: 25, h: 33.33, presentation: COMPACT },
      { x: 75, y: 66.66, w: 25, h: 33.33, presentation: COMPACT },
    ],
  },

  twoPlusThree: {
    name: "2 + 3",

    slots: [
      { x: 0, y: 0, w: 50, h: 60, presentation: LARGE_BOTTOM_TRACKER },
      { x: 50, y: 0, w: 50, h: 60, presentation: LARGE_BOTTOM_TRACKER },

      { x: 0, y: 60, w: 33.33, h: 40, presentation: COMPACT },
      { x: 33.33, y: 60, w: 33.33, h: 40, presentation: COMPACT },
      { x: 66.66, y: 60, w: 33.33, h: 40, presentation: COMPACT },
    ],
  },

  onePlusFive: {
    name: "1 + 5",

    slots: [
      { x: 0, y: 0, w: 70, h: 100, presentation: LARGE },

      { x: 70, y: 0, w: 30, h: 33.33, presentation: COMPACT },

      { x: 85, y: 33.33, w: 15, h: 33.33, presentation: COMPACT },
      { x: 70, y: 33.33, w: 15, h: 33.33, presentation: COMPACT },

      { x: 85, y: 66.66, w: 15, h: 33.33, presentation: COMPACT },
      { x: 70, y: 66.66, w: 15, h: 33.33, presentation: COMPACT },
    ],
  },

  onePlusSix: {
    name: "1 + 6",

    slots: [
      { x: 0, y: 0, w: 70, h: 100, presentation: LARGE },

      { x: 70, y: 0, w: 15, h: 33.33, presentation: COMPACT },
      { x: 85, y: 0, w: 15, h: 33.33, presentation: COMPACT },

      { x: 70, y: 33.33, w: 15, h: 33.33, presentation: COMPACT },
      { x: 85, y: 33.33, w: 15, h: 33.33, presentation: COMPACT },

      { x: 70, y: 66.66, w: 15, h: 33.33, presentation: COMPACT },
      { x: 85, y: 66.66, w: 15, h: 33.33, presentation: COMPACT },
    ],
  },

  hex: {
    name: "Hex-view",

    slots: [
      { x: 0, y: 0, w: 33.33, h: 50, presentation: COMPACT },
      { x: 33.33, y: 0, w: 33.33, h: 50, presentation: COMPACT },
      { x: 66.66, y: 0, w: 33.33, h: 50, presentation: COMPACT },

      { x: 0, y: 50, w: 33.33, h: 50, presentation: COMPACT },
      { x: 33.33, y: 50, w: 33.33, h: 50, presentation: COMPACT },
      { x: 66.66, y: 50, w: 33.33, h: 50, presentation: COMPACT },
    ],
  },

  octo: {
    name: "Octo-view",

    slots: [
      { x: 0, y: 0, w: 25, h: 50, presentation: COMPACT },
      { x: 25, y: 0, w: 25, h: 50, presentation: COMPACT },
      { x: 50, y: 0, w: 25, h: 50, presentation: COMPACT },
      { x: 75, y: 0, w: 25, h: 50, presentation: COMPACT },

      { x: 0, y: 50, w: 25, h: 50, presentation: COMPACT },
      { x: 25, y: 50, w: 25, h: 50, presentation: COMPACT },
      { x: 50, y: 50, w: 25, h: 50, presentation: COMPACT },
      { x: 75, y: 50, w: 25, h: 50, presentation: COMPACT },
    ],
  },

  onePlusEight: {
    name: "1 + 8",

    slots: [
      { x: 0, y: 0, w: 70, h: 100, presentation: LARGE_TOP_TRACKER },

      { x: 70, y: 0, w: 15, h: 25, presentation: NONE },
      { x: 85, y: 0, w: 15, h: 25, presentation: NONE },

      { x: 70, y: 25, w: 15, h: 25, presentation: NONE },
      { x: 85, y: 25, w: 15, h: 25, presentation: NONE },

      { x: 70, y: 50, w: 15, h: 25, presentation: NONE },
      { x: 85, y: 50, w: 15, h: 25, presentation: NONE },

      { x: 70, y: 75, w: 15, h: 25, presentation: NONE },
      { x: 85, y: 75, w: 15, h: 25, presentation: NONE },
    ],
  },

  twoPlusSix: {
    name: "2 + 6",

    slots: [
      { x: 25, y: 0, w: 50, h: 50, presentation: LARGE_BOTTOM_TRACKER },
      { x: 25, y: 50, w: 50, h: 50, presentation: LARGE_BOTTOM_TRACKER },

      { x: 0, y: 0, w: 25, h: 33.33, presentation: COMPACT },
      { x: 0, y: 33.33, w: 25, h: 33.33, presentation: COMPACT },
      { x: 0, y: 66.66, w: 25, h: 33.33, presentation: COMPACT },

      { x: 75, y: 0, w: 25, h: 33.33, presentation: COMPACT },
      { x: 75, y: 33.33, w: 25, h: 33.33, presentation: COMPACT },
      { x: 75, y: 66.66, w: 25, h: 33.33, presentation: COMPACT },
    ],
  },

  nineGrid: {
    name: "Nono-view",

    slots: [
      { x: 0, y: 0, w: 33.333, h: 33.333, presentation: COMPACT_SIDES },
      { x: 33.333, y: 0, w: 33.333, h: 33.333, presentation: COMPACT_SIDES },
      { x: 66.666, y: 0, w: 33.333, h: 33.333, presentation: COMPACT_SIDES },

      { x: 0, y: 33.333, w: 33.333, h: 33.333, presentation: COMPACT_SIDES },
      { x: 33.333, y: 33.333, w: 33.333, h: 33.333, presentation: COMPACT_SIDES },
      { x: 66.666, y: 33.333, w: 33.333, h: 33.333, presentation: COMPACT_SIDES },

      { x: 0, y: 66.666, w: 33.333, h: 33.333, presentation: COMPACT_SIDES },
      { x: 33.333, y: 66.666, w: 33.333, h: 33.333, presentation: COMPACT_SIDES },
      { x: 66.666, y: 66.666, w: 33.333, h: 33.333, presentation: COMPACT_SIDES },
    ],
  },
};

export function pickLayout(count) {
  if (count <= 1) return "single";
  if (count === 2) return "verticalSplit";
  if (count === 3) return "onePlusTwo";
  if (count === 4) return "quad";
  if (count <= 6) return "hex";
  if (count === 7) return "onePlusSix";
  if (count === 8) return "octo";
  return "nineGrid";
}

/*
 * Select the layout used when one event is highlighted.
 *
 * `count` is the number of slots currently on screen,
 * rather than the number of occupied streams.
 */
export function pickHighlightLayout(count) {
  if (count <= 1) return "single";
  if (count === 2) return "verticalSplit";
  if (count === 3) return "onePlusTwo";
  if (count === 4) return "onePlusThree";
  if (count === 6) return "onePlusFive";
  if (count === 7) return "onePlusSix";
  if (count < 7) return "twoPlusThree";
  if (count <= 8) return "twoPlusSix";
  return "onePlusEight";
}