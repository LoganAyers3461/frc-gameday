// lib/layouts.js

export const LAYOUTS = {
  single: {
    name: "Single",
    slots: [{ x: 0, y: 0, w: 100, h: 100 }],
  },

  verticalSplit: {
    name: "Vertical Split",
    slots: [
      { x: 0, y: 0, w: 50, h: 100 },
      { x: 50, y: 0, w: 50, h: 100 },
    ],
  },

  horizontalSplit: {
    name: "Horizontal Split",
    slots: [
      { x: 0, y: 0, w: 100, h: 50 },
      { x: 0, y: 50, w: 100, h: 50 },
    ],
  },

  onePlusTwo: {
    name: "1 + 2",
    slots: [
      { x: 0, y: 0, w: 60, h: 100 }, // primary
      { x: 60, y: 0, w: 40, h: 50 },
      { x: 60, y: 50, w: 40, h: 50 },
    ],
  },

  quad: {
    name: "Quad",
    slots: [
      { x: 0, y: 0, w: 50, h: 50 },
      { x: 50, y: 0, w: 50, h: 50 },
      { x: 0, y: 50, w: 50, h: 50 },
      { x: 50, y: 50, w: 50, h: 50 },
    ],
  },

  onePlusThree: {
    name: "1 + 3",
    slots: [
      { x: 0, y: 0, w: 75, h: 100 },
      { x: 75, y: 0, w: 25, h: 33.33 },
      { x: 75, y: 33.33, w: 25, h: 33.33 },
      { x: 75, y: 66.66, w: 25, h: 33.33 },
    ],
  },

  onePlusSix: {
    name: "1 + 6",
    slots: [
      // primary
      { x: 0, y: 0, w: 70, h: 100 },

      // right 2x3 grid (top → bottom)
      { x: 70, y: 0, w: 15, h: 33.33 },
      { x: 85, y: 0, w: 15, h: 33.33 },

      { x: 70, y: 33.33, w: 15, h: 33.33 },
      { x: 85, y: 33.33, w: 15, h: 33.33 },

      { x: 70, y: 66.66, w: 15, h: 33.33 },
      { x: 85, y: 66.66, w: 15, h: 33.33 },
    ],
  },

  twoPlusThree: {
    name: "2 + 3",
    slots: [
      { x: 0, y: 0, w: 50, h: 60 },
      { x: 50, y: 0, w: 50, h: 60 },

      { x: 0, y: 60, w: 33.33, h: 40 },
      { x: 33.33, y: 60, w: 33.33, h: 40 },
      { x: 66.66, y: 60, w: 33.33, h: 40 },
    ],
  },

  twoPlusSix: {
    name: "2 + 6",
    slots: [
      { x: 25, y: 0, w: 50, h: 50 },
      { x: 25, y: 50, w: 50, h: 50 },

      { x: 0, y: 0, w: 25, h: 33.33 },
      { x: 0, y: 33.33, w: 25, h: 33.33 },
      { x: 0, y: 66.66, w: 25, h: 33.33 },

      { x: 75, y: 0, w: 25, h: 33.33 },
      { x: 75, y: 33.33, w: 25, h: 33.33 },
      { x: 75, y: 66.66, w: 25, h: 33.33 },
    ],
  },

  hex: {
    name: "Hex-view",
    slots: [
      { x: 0, y: 0, w: 33.33, h: 50 },
      { x: 33.33, y: 0, w: 33.33, h: 50 },
      { x: 66.66, y: 0, w: 33.33, h: 50 },

      { x: 0, y: 50, w: 33.33, h: 50 },
      { x: 33.33, y: 50, w: 33.33, h: 50 },
      { x: 66.66, y: 50, w: 33.33, h: 50 },
    ],
  },

  octo: {
    name: "Octo-view",
    slots: [
      { x: 0, y: 0, w: 25, h: 50 },
      { x: 25, y: 0, w: 25, h: 50 },
      { x: 50, y: 0, w: 25, h: 50 },
      { x: 75, y: 0, w: 25, h: 50 },

      { x: 0, y: 50, w: 25, h: 50 },
      { x: 25, y: 50, w: 25, h: 50 },
      { x: 50, y: 50, w: 25, h: 50 },
      { x: 75, y: 50, w: 25, h: 50 },
    ],
  },
  onePlusEight: {
    name: "1 + 8",
    slots: [
      // Primary focus
      { x: 0, y: 0, w: 70, h: 100 },

      // Right side grid (2 columns × 4 rows)
      { x: 70, y: 0,  w: 15, h: 25 },
      { x: 85, y: 0,  w: 15, h: 25 },

      { x: 70, y: 25, w: 15, h: 25 },
      { x: 85, y: 25, w: 15, h: 25 },

      { x: 70, y: 50, w: 15, h: 25 },
      { x: 85, y: 50, w: 15, h: 25 },

      { x: 70, y: 75, w: 15, h: 25 },
      { x: 85, y: 75, w: 15, h: 25 },
    ],
  },
  nineGrid: {
    name: "Nono-view",
    slots: [
      { x: 0, y: 0, w: 33.333, h: 33.333 },
      { x: 33.333, y: 0, w: 33.333, h: 33.333 },
      { x: 66.666, y: 0, w: 33.333, h: 33.333 },

      { x: 0, y: 33.333, w: 33.333, h: 33.333 },
      { x: 33.333, y: 33.333, w: 33.333, h: 33.333 },
      { x: 66.666, y: 33.333, w: 33.333, h: 33.333 },

      { x: 0, y: 66.666, w: 33.333, h: 33.333 },
      { x: 33.333, y: 66.666, w: 33.333, h: 33.333 },
      { x: 66.666, y: 66.666, w: 33.333, h: 33.333 },
    ],
  },
};

export function pickLayout(count) {
  if (count <= 1) return "single";
  if (count === 2) return "verticalSplit";
  if (count === 3) return "onePlusTwo";
  if (count === 4) return "quad";
  if (count <= 6) return "hex";
  if (count <= 7) return "onePlusSix";
  if (count <= 8) return "octo";
  return "nineGrid";
}

export function pickHighlightLayout(count) {
  if (count <= 1) return "single";
  if (count === 2) return "verticalSplit";
  if (count === 3) return "onePlusTwo";
  if (count === 4) return "onePlusThree";
  if (count === 5) return "twoPlusThree";
  if (count === 8) return "onePlusEight";
  if (count === 9) return "onePlusEight";
  return "onePlusSix";
}