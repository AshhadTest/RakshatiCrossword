// ============================================================
//  PUZZLE DATA  – Cybersecurity crossword
//  Grid is 0-indexed. [row, col] = top-left of each answer.
//  Answers are base64-encoded — decoded at runtime in game.js
// ============================================================

export const PUZZLE = {
  ROWS: 17,
  COLS: 17,

  words: [
    // ── ACROSS ──────────────────────────────────────────────
    {
      number: 2,
      direction: 'across',
      answer: 'Q09OVFJPTA==',
      row: 0, col: 1,
      clue: 'Safeguard that reduces risk'
    },
    {
      number: 3,
      direction: 'across',
      answer: 'U0lFTQ==',
      row: 0, col: 9,
      clue: 'Platform that correlates security events'
    },
    {
      number: 4,
      direction: 'across',
      answer: 'QVVESVQ=',
      row: 2, col: 1,
      clue: 'Formal check of controls'
    },
    {
      number: 5,
      direction: 'across',
      answer: 'QkFDS1VQ',
      row: 2, col: 5,
      clue: 'Copy you hope you never need'
    },
    {
      number: 9,
      direction: 'across',
      answer: 'QUNDRVNTUkVWSUVX',
      row: 6, col: 0,
      clue: 'Periodic check of who can get into what'
    },
    {
      number: 11,
      direction: 'across',
      answer: 'VlBO',
      row: 10, col: 10,
      clue: 'Remote-work enabler, for short'
    },
    {
      number: 12,
      direction: 'across',
      answer: 'RExQ',
      row: 12, col: 9,
      clue: 'Tool aimed at stopping sensitive data from walking out the door'
    },
    {
      number: 15,
      direction: 'across',
      answer: 'TUZB',
      row: 14, col: 10,
      clue: 'Login protection with more than one proof'
    },
    {
      number: 16,
      direction: 'across',
      answer: 'QlJFQUNI',
      row: 15, col: 2,
      clue: 'Unauthorized access event'
    },

    // ── DOWN ─────────────────────────────────────────────────
    {
      number: 1,
      direction: 'down',
      answer: 'VEhJUkRQQVJUWVJJU0s=',
      row: 0, col: 0,
      clue: 'Exposure that comes from a vendor, supplier, or partner'
    },
    {
      number: 2,
      direction: 'down',
      answer: 'Q0hBTkdF',
      row: 0, col: 1,
      clue: 'Process meant to prevent "small fix, big incident"'
    },
    {
      number: 3,
      direction: 'down',
      answer: 'U09D',
      row: 0, col: 9,
      clue: 'Team watching alerts after hours'
    },
    {
      number: 6,
      direction: 'down',
      answer: 'UEhJU0hJTkc=',
      row: 2, col: 10,
      clue: 'Surprise message from an African prince'
    },
    {
      number: 7,
      direction: 'down',
      answer: 'U1lTVEVN',
      row: 4, col: 6,
      clue: "Every status page's least favorite phrase"
    },
    {
      number: 8,
      direction: 'down',
      answer: 'VEhSRUFU',
      row: 4, col: 8,
      clue: 'Potential source of harm'
    },
    {
      number: 10,
      direction: 'down',
      answer: 'SU5DSURFTlQ=',
      row: 6, col: 9,
      clue: 'Event requiring investigation or response'
    },
    {
      number: 13,
      direction: 'down',
      answer: 'UEFN',
      row: 12, col: 12,
      clue: 'System for managing privileged accounts'
    },
    {
      number: 14,
      direction: 'down',
      answer: 'UEFUQ0g=',
      row: 11, col: 8,
      clue: 'Update meant to close a bug'
    },
  ]
};
