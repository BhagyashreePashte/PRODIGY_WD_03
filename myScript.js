
/* ── State ── */
let board    = Array(9).fill(null);
let current  = 'X';
let gameOver = false;
let mode     = '2p';   // '2p' | 'ai'
let scores   = { X: 0, O: 0, D: 0 };

const WINS = [
  [0,1,2],[3,4,5],[6,7,8],   // rows
  [0,3,6],[1,4,7],[2,5,8],   // cols
  [0,4,8],[2,4,6]            // diags
];

/* ── SVG Marks ── */
function xSVG() {
  return `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="12" y1="12" x2="48" y2="48" stroke="#e63946" stroke-width="5" stroke-linecap="round"/>
    <line x1="48" y1="12" x2="12" y2="48" stroke="#e63946" stroke-width="5" stroke-linecap="round"/>
  </svg>`;
}

function oSVG() {
  return `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="18" stroke="#2196f3" stroke-width="5"/>
  </svg>`;
}

/* ── Board Render ── */
function renderBoard() {
  const el = document.getElementById('board');
  el.innerHTML = '';
  board.forEach((val, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell' + (val ? ' taken' : '');
    cell.dataset.i = i;
    if (val === 'X') cell.innerHTML = xSVG();
    if (val === 'O') cell.innerHTML = oSVG();
    cell.addEventListener('click', onCellClick);
    el.appendChild(cell);
  });
}

/* ── Click Handler ── */
function onCellClick(e) {
  const i = parseInt(e.currentTarget.dataset.i);
  if (gameOver || board[i]) return;
  if (mode === 'ai' && current === 'O') return;

  makeMove(i);

  if (!gameOver && mode === 'ai' && current === 'O') {
    setTimeout(aiMove, 380);
  }
}

/* ── Make Move ── */
function makeMove(i) {
  board[i] = current;
  renderBoard();

  const result = checkWin();
  if (result) {
    highlightWin(result.combo);
    gameOver = true;
    scores[current]++;
    updateScores();
    setStatus(current + ' Wins! 🎉');
    setTurn('');
    return;
  }

  if (board.every(c => c)) {
    gameOver = true;
    scores.D++;
    updateScores();
    setStatus("It's a Draw!");
    setTurn('');
    return;
  }

  current = current === 'X' ? 'O' : 'X';
  updateTurn();
}

/* ── Win Check ── */
function checkWin(b) {
  b = b || board;
  for (const combo of WINS) {
    const [a,c,d] = combo;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { player: b[a], combo };
  }
  return null;
}

/* ── Highlight winners ── */
function highlightWin(combo) {
  const cells = document.querySelectorAll('.cell');
  combo.forEach(i => cells[i].classList.add('winner'));
}

/* ── AI (Minimax) ── */
function aiMove() {
  const best = minimax(board, 'O');
  makeMove(best.idx);
}

function minimax(b, player, depth = 0) {
  const result = checkWin(b);
  if (result) return { score: result.player === 'O' ? 10 - depth : depth - 10 };
  if (b.every(c => c)) return { score: 0 };

  const moves = [];
  b.forEach((val, i) => {
    if (val) return;
    const nb = [...b];
    nb[i] = player;
    const res = minimax(nb, player === 'O' ? 'X' : 'O', depth + 1);
    moves.push({ idx: i, score: res.score });
  });

  if (player === 'O') {
    const best = moves.reduce((a,b) => b.score > a.score ? b : a);
    return best;
  } else {
    const best = moves.reduce((a,b) => b.score < a.score ? b : a);
    return best;
  }
}

/* ── UI Helpers ── */
function setStatus(msg) {
  document.getElementById('status').textContent = msg;
}

function setTurn(txt) {
  document.getElementById('turnIndicator').innerHTML = txt;
}

function updateTurn() {
  const who = mode === 'ai' && current === 'O' ? 'AI (O)' : current;
  const cls = current === 'X' ? 'turn-x' : 'turn-o';
  document.getElementById('turnIndicator').innerHTML =
    `<span class="${cls}">${who}'s</span> turn`;
}

function updateScores() {
  document.getElementById('xScore').textContent = scores.X;
  document.getElementById('oScore').textContent = scores.O;
  document.getElementById('dScore').textContent = scores.D;
}

/* ── Mode ── */
function setMode(m) {
  mode = m;
  document.getElementById('btn2p').classList.toggle('active', m === '2p');
  document.getElementById('btnAI').classList.toggle('active', m === 'ai');
  document.getElementById('oLabel').textContent = m === 'ai' ? 'AI (O)' : 'Player O';
  newGame();
}

/* ── New Game / Reset ── */
function newGame() {
  board    = Array(9).fill(null);
  current  = 'X';
  gameOver = false;
  renderBoard();
  setStatus('');
  updateTurn();
}

function resetScores() {
  scores = { X: 0, O: 0, D: 0 };
  updateScores();
  newGame();
}

/* ── Init ── */
renderBoard();
updateTurn();
