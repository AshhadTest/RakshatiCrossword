// ============================================================
//  CYBERCROSSWORD  –  game.js
//  Firebase Realtime Database for live leaderboard + player count
// ============================================================

import { PUZZLE } from './puzzle.js';

// ── Firebase config ──────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, serverTimestamp, get }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCzGV6ZFIiYt4nR9zRltbSNRVgXs61mUwo",
  authDomain:        "rakshaticrossword.firebaseapp.com",
  databaseURL:       "https://rakshaticrossword-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "rakshaticrossword",
  storageBucket:     "rakshaticrossword.firebasestorage.app",
  messagingSenderId: "358152501423",
  appId:             "1:358152501423:web:042896833ccf4066ad3c5a"
};

const app = initializeApp(FIREBASE_CONFIG);
const db  = getDatabase(app);

// ── State ────────────────────────────────────────────────────
let playerName   = '';
let playerKey    = null;     // Firebase push key for this player
let grid         = [];       // 2-D array of cell objects
let selectedCell = null;     // {row, col}
let direction    = 'across'; // current input direction
let activeWord   = null;     // current word object
let startTime    = null;
let timerInterval= null;
let score        = 0;
let solvedWords  = new Set();
let totalCells   = 0;
let filledCells  = 0;
let gameComplete = false;

// ── Decode answer at runtime (base64 → plaintext) ────────────
function decode(b64) { return atob(b64); }

// ── Build grid from puzzle data ──────────────────────────────
function buildGrid() {
  // Decode all answers once, stored in _answer so puzzle.js stays encoded
  PUZZLE.words.forEach(w => { w._answer = decode(w.answer); });

  grid = Array.from({ length: PUZZLE.ROWS }, () =>
    Array.from({ length: PUZZLE.COLS }, () => ({
      answer: null,
      value:  '',
      number: null,
      words:  [],    // list of word numbers this cell belongs to
      el:     null,
      inputEl:null,
    }))
  );

  for (const word of PUZZLE.words) {
    for (let i = 0; i < word._answer.length; i++) {
      const r = word.direction === 'across' ? word.row : word.row + i;
      const c = word.direction === 'across' ? word.col + i : word.col;
      const cell = grid[r][c];
      cell.answer = word._answer[i];
      cell.words.push({ number: word.number, direction: word.direction });
      if (i === 0 && word.number) {
        cell.number = word.number;
      }
    }
    totalCells += word._answer.length;
  }
  // de-dup totalCells (cells shared by across+down)
  let actual = 0;
  for (let r = 0; r < PUZZLE.ROWS; r++)
    for (let c = 0; c < PUZZLE.COLS; c++)
      if (grid[r][c].answer) actual++;
  totalCells = actual;
}

// ── Render grid DOM (absolute positioning — pixel-perfect placement) ──
function renderGrid() {
  const CELL = 40;   // px per cell
  const GAP  = 2;    // px gap
  const STEP = CELL + GAP;
  const PAD  = 8;    // container padding

  const container = document.getElementById('crossword-grid');
  container.innerHTML = '';
  container.style.display  = 'block';
  container.style.position = 'relative';
  container.style.width    = (PAD * 2 + PUZZLE.COLS * STEP - GAP) + 'px';
  container.style.height   = (PAD * 2 + PUZZLE.ROWS * STEP - GAP) + 'px';

  for (let r = 0; r < PUZZLE.ROWS; r++) {
    for (let c = 0; c < PUZZLE.COLS; c++) {
      const cell = grid[r][c];
      if (!cell.answer) {
        // Still need a placeholder el for highlight/select class management
        const ghost = document.createElement('div');
        ghost.style.display = 'none';
        cell.el = ghost;
        continue;
      }

      const div = document.createElement('div');
      div.className      = 'grid-cell active-cell';
      div.dataset.row    = r;
      div.dataset.col    = c;
      div.style.position = 'absolute';
      div.style.left     = (PAD + c * STEP) + 'px';
      div.style.top      = (PAD + r * STEP) + 'px';
      div.style.width    = CELL + 'px';
      div.style.height   = CELL + 'px';
      cell.el = div;

      if (cell.number) {
        const num = document.createElement('span');
        num.className   = 'cell-number';
        num.textContent = cell.number;
        div.appendChild(num);
      }

      const input = document.createElement('input');
      input.type         = 'text';
      input.maxLength    = 1;
      input.className    = 'cell-input';
      input.autocomplete = 'off';
      input.autocorrect  = 'off';
      input.spellcheck   = false;
      input.dataset.row  = r;
      input.dataset.col  = c;

      input.addEventListener('focus',   () => onCellFocus(r, c));
      input.addEventListener('keydown', (e) => onKeyDown(e, r, c));
      input.addEventListener('input',   (e) => onInput(e, r, c));
      input.addEventListener('click',   () => onCellClick(r, c));

      div.appendChild(input);
      cell.inputEl = input;
      container.appendChild(div);
    }
  }
}

// ── Render clues ─────────────────────────────────────────────
function renderClues() {
  const acrossList = document.getElementById('across-clues');
  const downList   = document.getElementById('down-clues');
  acrossList.innerHTML = '';
  downList.innerHTML   = '';

  for (const word of PUZZLE.words.sort((a,b) => a.number - b.number)) {
    const li = document.createElement('li');
    li.className = 'clue-item';
    li.id = `clue-${word.direction}-${word.number}`;
    li.dataset.number    = word.number;
    li.dataset.direction = word.direction;
    li.innerHTML = `<span class="clue-num">${word.number}</span>${word.clue}`;
    li.addEventListener('click', () => jumpToWord(word));
    (word.direction === 'across' ? acrossList : downList).appendChild(li);
  }
}

// ── Cell interaction ─────────────────────────────────────────
function onCellClick(r, c) {
  if (selectedCell && selectedCell.row === r && selectedCell.col === c) {
    toggleDirection(r, c);
  } else {
    selectCell(r, c, direction);
  }
}

function onCellFocus(r, c) {
  selectCell(r, c, direction);
}

function toggleDirection(r, c) {
  const cell = grid[r][c];
  const hasAcross = cell.words.some(w => w.direction === 'across');
  const hasDown   = cell.words.some(w => w.direction === 'down');
  if (hasAcross && hasDown) {
    direction = direction === 'across' ? 'down' : 'across';
    selectCell(r, c, direction);
  }
}

function selectCell(r, c, dir) {
  const cell = grid[r][c];
  if (!cell.answer) return;

  const hasDir = cell.words.some(w => w.direction === dir);
  if (!hasDir) {
    dir = dir === 'across' ? 'down' : 'across';
  }
  direction    = dir;
  selectedCell = { row: r, col: c };

  clearHighlights();

  // Find the word for this cell + direction
  const wordMeta = cell.words.find(w => w.direction === dir);
  if (wordMeta) {
    activeWord = PUZZLE.words.find(w => w.number === wordMeta.number && w.direction === dir);
    highlightWord(activeWord);
    scrollClueIntoView(activeWord);
    updateClueBar(activeWord);
  }

  cell.el.classList.add('selected');
  if (cell.inputEl && document.activeElement !== cell.inputEl) {
    cell.inputEl.focus({ preventScroll: true });
  }
}

function highlightWord(word) {
  if (!word) return;
  for (let i = 0; i < word.answer.length; i++) {
    const r = word.direction === 'across' ? word.row : word.row + i;
    const c = word.direction === 'across' ? word.col + i : word.col;
    grid[r][c].el.classList.add('highlighted');
  }
  // re-add selected on current cell
  if (selectedCell) grid[selectedCell.row][selectedCell.col].el.classList.add('selected');
}

function clearHighlights() {
  for (let r = 0; r < PUZZLE.ROWS; r++)
    for (let c = 0; c < PUZZLE.COLS; c++) {
      grid[r][c].el?.classList.remove('highlighted', 'selected');
    }
}

function scrollClueIntoView(word) {
  if (!word) return;
  const el = document.getElementById(`clue-${word.direction}-${word.number}`);
  if (!el) return;
  document.querySelectorAll('.clue-item').forEach(e => e.classList.remove('active-clue'));
  el.classList.add('active-clue');
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function updateClueBar(word) {
  if (!word) return;
  document.getElementById('active-clue-text').textContent =
    `${word.number} ${word.direction.toUpperCase()}:  ${word.clue}`;
}

function jumpToWord(word) {
  direction = word.direction;
  selectCell(word.row, word.col, word.direction);
}

// ── Input handling ────────────────────────────────────────────
function onInput(e, r, c) {
  const input = e.target;
  const raw   = input.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
  input.value = raw.slice(-1); // keep only last typed char

  if (!raw) return;

  const cell = grid[r][c];
  cell.value = input.value;
  input.classList.remove('correct-letter', 'wrong-letter');

  checkWordComplete();
  advanceCursor(r, c);
}

function onKeyDown(e, r, c) {
  const moves = {
    ArrowRight: [0,  1, 'across'],
    ArrowLeft:  [0, -1, 'across'],
    ArrowDown:  [1,  0, 'down'],
    ArrowUp:    [-1, 0, 'down'],
  };

  if (moves[e.key]) {
    e.preventDefault();
    const [dr, dc, newDir] = moves[e.key];
    direction = newDir;
    moveTo(r + dr, c + dc);
    return;
  }

  if (e.key === 'Backspace') {
    e.preventDefault();
    const cell = grid[r][c];
    if (cell.value) {
      cell.inputEl.value = '';
      cell.value = '';
      cell.inputEl.classList.remove('correct-letter', 'wrong-letter');
    } else {
      retreatCursor(r, c);
    }
    return;
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    cycleWord(e.shiftKey ? -1 : 1);
  }
}

function advanceCursor(r, c) {
  const dr = direction === 'down'   ? 1 : 0;
  const dc = direction === 'across' ? 1 : 0;
  moveTo(r + dr, c + dc);
}

function retreatCursor(r, c) {
  const dr = direction === 'down'   ? -1 : 0;
  const dc = direction === 'across' ? -1 : 0;
  moveTo(r + dr, c + dc);
}

function moveTo(r, c) {
  if (r < 0 || r >= PUZZLE.ROWS || c < 0 || c >= PUZZLE.COLS) return;
  if (!grid[r][c].answer) return;
  selectCell(r, c, direction);
}

function cycleWord(delta) {
  if (!activeWord) return;
  const sorted = PUZZLE.words.slice().sort((a, b) => {
    if (a.direction !== b.direction) return a.direction === 'across' ? -1 : 1;
    return a.number - b.number;
  });
  const idx = sorted.findIndex(w => w.number === activeWord.number && w.direction === activeWord.direction);
  const next = sorted[(idx + delta + sorted.length) % sorted.length];
  jumpToWord(next);
}

// ── Word checking ─────────────────────────────────────────────
function checkWordComplete() {
  if (!activeWord) return;
  const word = activeWord;
  let complete = true;
  let correct  = true;

  for (let i = 0; i < word._answer.length; i++) {
    const r = word.direction === 'across' ? word.row : word.row + i;
    const c = word.direction === 'across' ? word.col + i : word.col;
    const cell = grid[r][c];
    if (!cell.value) { complete = false; break; }
    if (cell.value !== word._answer[i]) correct = false;
  }

  if (complete && correct && !solvedWords.has(`${word.direction}-${word.number}`)) {
    solvedWords.add(`${word.direction}-${word.number}`);
    markWordCorrect(word);
    awardPoints(word);
    showToast(`✅ ${word._answer}!`);
    const clueEl = document.getElementById(`clue-${word.direction}-${word.number}`);
    if (clueEl) clueEl.classList.add('solved-clue');
    checkPuzzleComplete();
  }
}

function markWordCorrect(word) {
  for (let i = 0; i < word._answer.length; i++) {
    const r = word.direction === 'across' ? word.row : word.row + i;
    const c = word.direction === 'across' ? word.col + i : word.col;
    const cell = grid[r][c];
    cell.el.classList.add('correct');
    cell.inputEl.classList.add('correct-letter');
    cell.inputEl.readOnly = true;
  }
}

function awardPoints(word) {
  const base   = word._answer.length * 10;
  const elapsed = (Date.now() - startTime) / 1000;
  const timeBonus = Math.max(0, Math.floor(300 - elapsed));
  score += base + timeBonus;
  document.getElementById('score-display').textContent = score;
}

function checkPuzzleComplete() {
  if (solvedWords.size < PUZZLE.words.length) return;
  // All words solved!
  gameComplete = true;
  clearInterval(timerInterval);
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  submitScore(elapsed);
  setTimeout(() => showCompleteScreen(elapsed), 800);
}

// ── Timer ─────────────────────────────────────────────────────
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const s = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').textContent = formatTime(s);
  }, 500);
}

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

// ── Firebase: submit score ────────────────────────────────────
async function submitScore(elapsed) {
  try {
    const payload = {
      name:      playerName,
      score:     score,
      time:      elapsed,
      timestamp: serverTimestamp(),
    };
    if (playerKey) {
      await set(ref(db, `leaderboard/${playerKey}`), payload);
    } else {
      const r = await push(ref(db, 'leaderboard'), payload);
      playerKey = r.key;
    }
  } catch (err) {
    console.warn('Firebase score submit failed:', err);
  }
}

// ── Firebase: player count ────────────────────────────────────
function listenPlayerCount() {
  onValue(ref(db, 'leaderboard'), (snap) => {
    const count = snap.exists() ? Object.keys(snap.val()).length : 0;
    document.getElementById('player-count').textContent = count;
  });
}

// ── Leaderboard ───────────────────────────────────────────────
async function loadLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '<div style="text-align:center;opacity:0.5;padding:1rem">Loading…</div>';

  try {
    const snap = await get(ref(db, 'leaderboard'));
    if (!snap.exists()) {
      list.innerHTML = '<div style="text-align:center;opacity:0.5;padding:1rem">No scores yet!</div>';
      return;
    }

    const entries = Object.entries(snap.val())
      .map(([key, val]) => ({ key, ...val }))
      .filter(e => e.score > 0)
      .sort((a, b) => b.score - a.score || a.time - b.time)
      .slice(0, 50);

    list.innerHTML = '';
    entries.forEach((e, i) => {
      const medals = ['🥇','🥈','🥉'];
      const div = document.createElement('div');
      div.className = 'lb-entry' + (e.key === playerKey ? ' me' : '');
      div.innerHTML = `
        <span class="lb-rank">${medals[i] || (i+1)}</span>
        <span class="lb-name">${escapeHtml(e.name)}${e.key === playerKey ? ' (you)' : ''}</span>
        <span class="lb-score">${e.score}</span>
        <span class="lb-time">${formatTime(e.time || 0)}</span>
      `;
      list.appendChild(div);
    });

    // Set rank on complete screen
    const myRank = entries.findIndex(e => e.key === playerKey) + 1;
    if (myRank > 0) document.getElementById('final-rank').textContent = `#${myRank}`;

  } catch (err) {
    console.warn('Leaderboard load failed:', err);
    list.innerHTML = '<div style="text-align:center;opacity:0.5;padding:1rem">Could not load scores.</div>';
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Complete screen ───────────────────────────────────────────
function showCompleteScreen(elapsed) {
  document.getElementById('game-screen').classList.remove('active');
  document.getElementById('complete-screen').classList.add('active');
  document.getElementById('final-score').textContent = score;
  document.getElementById('final-time').textContent  = formatTime(elapsed);
  spawnConfetti();
  loadLeaderboard();
}

function spawnConfetti() {
  const burst  = document.getElementById('confetti-burst');
  const colors = ['#FFD93D','#FF6B6B','#4ECDC4','#06D6A0','#7C3AED','#FFFFFF'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `
      left: ${Math.random()*100}%;
      background: ${colors[Math.floor(Math.random()*colors.length)]};
      animation-delay: ${Math.random()*0.8}s;
      animation-duration: ${1.2 + Math.random()*1.2}s;
      width: ${6 + Math.random()*8}px;
      height: ${6 + Math.random()*8}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    burst.appendChild(p);
  }
}

// ── Toast ─────────────────────────────────────────────────────
let toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 2000);
}

// ── Modal ─────────────────────────────────────────────────────
window.showLeaderboard = function() {
  document.getElementById('leaderboard-modal').classList.add('open');
  loadLeaderboard();
};
window.hideLeaderboard = function(e) {
  if (!e || e.target === document.getElementById('leaderboard-modal') || !e.target) {
    document.getElementById('leaderboard-modal').classList.remove('open');
  }
};

// ── Entry / start ─────────────────────────────────────────────
window.startGame = function() {
  const nameInput = document.getElementById('player-name');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.style.borderColor = 'var(--coral)';
    nameInput.focus();
    setTimeout(() => nameInput.style.borderColor = '', 1200);
    return;
  }
  playerName = name;

  // Register presence
  const presRef = push(ref(db, 'leaderboard'));
  playerKey = presRef.key;

  document.getElementById('entry-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');

  buildGrid();
  renderGrid();
  renderClues();
  startTimer();

  // Focus first cell
  const firstWord = PUZZLE.words.find(w => w.direction === 'across');
  if (firstWord) jumpToWord(firstWord);
};

// ── Init ──────────────────────────────────────────────────────
document.getElementById('player-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') window.startGame();
});

listenPlayerCount();
