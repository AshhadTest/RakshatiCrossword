// ============================================================
//  PUZZLE DATA  – Office & Workplace crossword  (DEMO)
//  Grid is 0-indexed. [row, col] = top-left of each answer.
//  Answers are base64-encoded — decoded at runtime in game.js
//  
//  Verified grid (12 rows × 10 cols, zero conflicts):
//
//      0 1 2 3 4 5 6 7 8 9
//   0 [M E E T I N G . . .]
//   1 [A D M I N . O . . .]
//   2 [N E A . . . A . . .]
//   3 [A S I N T E L . . .]
//   4 [G K L E A D S . . .]
//   5 [E . . C . . L . . .]
//   6 [R E P O R T A . . .]
//   7 [. A . F P . C . . .]
//   8 [. R . F I . K . . .]
//   9 [. N . E Z O O M . .]
//  10 [. . . E Z . . . . .]
//  11 [. . . . A . . . . .]
// ============================================================

export const PUZZLE = {
  ROWS: 12,
  COLS: 10,

  words: [
    // ── ACROSS ──────────────────────────────────────────────
    {
      number: 1,
      direction: 'across',
      answer: 'TUVFVElORw==',        // MEETING
      row: 0, col: 0,
      clue: 'Gathering nobody wants more of'
    },
    {
      number: 3,
      direction: 'across',
      answer: 'QURNSU4=',            // ADMIN
      row: 1, col: 0,
      clue: 'The person who knows where everything is'
    },
    {
      number: 7,
      direction: 'across',
      answer: 'SU5URUw=',            // INTEL
      row: 3, col: 2,
      clue: 'Inside information'
    },
    {
      number: 9,
      direction: 'across',
      answer: 'TEVBRFM=',            // LEADS
      row: 4, col: 2,
      clue: 'Sales team chases these'
    },
    {
      number: 11,
      direction: 'across',
      answer: 'UkVQT1JU',            // REPORT
      row: 6, col: 0,
      clue: 'Document nobody reads but everyone requests'
    },
    {
      number: 13,
      direction: 'across',
      answer: 'Wk9PTQ==',            // ZOOM
      row: 9, col: 4,
      clue: '"You are muted" — again'
    },

    // ── DOWN ─────────────────────────────────────────────────
    {
      number: 1,
      direction: 'down',
      answer: 'TUFOQUdFUg==',        // MANAGER
      row: 0, col: 0,
      clue: 'Has too many meetings'
    },
    {
      number: 2,
      direction: 'down',
      answer: 'RU1BSUw=',            // EMAIL
      row: 0, col: 2,
      clue: 'Primary cause of inbox anxiety'
    },
    {
      number: 4,
      direction: 'down',
      answer: 'REVTSw==',            // DESK
      row: 1, col: 1,
      clue: 'Where you pretend to work'
    },
    {
      number: 5,
      direction: 'down',
      answer: 'R09BTFM=',            // GOALS
      row: 0, col: 6,
      clue: 'Set in Q1, forgotten by Q2'
    },
    {
      number: 6,
      direction: 'down',
      answer: 'Q09GRkVF',            // COFFEE
      row: 5, col: 3,
      clue: 'Office lifeblood'
    },
    {
      number: 8,
      direction: 'down',
      answer: 'U0xBQ0s=',            // SLACK
      row: 4, col: 6,
      clue: 'Where work conversations go to die'
    },
    {
      number: 10,
      direction: 'down',
      answer: 'RUFSTg==',            // EARN
      row: 6, col: 1,
      clue: 'What the paycheck represents'
    },
    {
      number: 12,
      direction: 'down',
      answer: 'UElaWkE=',            // PIZZA
      row: 7, col: 4,
      clue: 'Friday office tradition'
    },
  ]
};
