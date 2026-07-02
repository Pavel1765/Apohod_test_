/** Игра в шашки с ИИ ботом и локальной игрой */

import { soundSystem } from '../hike-game/sounds.js';

const BOARD_SIZE = 8;
const PLAYER_WHITE = 'white';
const PLAYER_BLACK = 'black';

let board = [];
let currentPlayer = PLAYER_WHITE;
let selectedPiece = null;
let possibleMoves = [];
let gameMode = null; // 'ai' или 'local'
let aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
let isAiThinking = false;
let onExitCallback = null;
let capturedWhite = 0;
let capturedBlack = 0;

export function renderCheckersGame(container, onExit) {
  onExitCallback = onExit;
  soundSystem.init();
  
  showModeSelection(container);
}

function loadStyles() {
  if (!document.querySelector('link[href*="checkers-styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/checkers-styles.css';
    document.head.appendChild(link);
  }
}

function showModeSelection(container) {
  container.innerHTML = `
    <div class="checkers-menu">
      <div class="checkers-menu-card">
        <button class="btn-back-small" id="backBtn">← В меню</button>
        <h1>🎲 Шашки</h1>
        <p class="checkers-subtitle">Выберите режим игры</p>
        
        <div class="mode-buttons">
          <div class="mode-card" id="aiMode">
            <div class="mode-icon">🤖</div>
            <div class="mode-title">Против компьютера</div>
            <div class="mode-desc">Сразитесь с ИИ</div>
          </div>
          
          <div class="mode-card" id="localMode">
            <div class="mode-icon">👥</div>
            <div class="mode-title">На одном устройстве</div>
            <div class="mode-desc">Играйте вдвоем</div>
          </div>
        </div>
        
        <div id="difficultySelect" style="display: none; margin-top: 24px;">
          <p class="checkers-subtitle">Сложность ИИ:</p>
          <div class="difficulty-buttons">
            <button class="btn-difficulty" data-difficulty="easy">😊 Легко</button>
            <button class="btn-difficulty active" data-difficulty="medium">🎯 Средне</button>
            <button class="btn-difficulty" data-difficulty="hard">🔥 Сложно</button>
          </div>
          <button class="btn-primary" id="startGame">Начать игру</button>
        </div>
      </div>
    </div>
  `;
  
  loadStyles();
  
  document.getElementById('backBtn').addEventListener('click', () => onExitCallback());
  
  document.getElementById('aiMode').addEventListener('click', () => {
    gameMode = 'ai';
    document.getElementById('difficultySelect').style.display = 'block';
    document.querySelectorAll('.mode-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('aiMode').classList.add('selected');
    soundSystem.click();
  });
  
  document.getElementById('localMode').addEventListener('click', () => {
    gameMode = 'local';
    soundSystem.click();
    initGame(container);
  });
  
  document.querySelectorAll('.btn-difficulty').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-difficulty').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aiDifficulty = btn.dataset.difficulty;
      soundSystem.click();
    });
  });
  
  document.getElementById('startGame').addEventListener('click', () => {
    soundSystem.click();
    initGame(container);
  });
}

function initGame(container) {
  board = createInitialBoard();
  currentPlayer = PLAYER_WHITE;
  selectedPiece = null;
  possibleMoves = [];
  isAiThinking = false;
  capturedWhite = 0;
  capturedBlack = 0;
  
  renderGame(container);
}

function createInitialBoard() {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: PLAYER_BLACK, isKing: false };
      }
    }
  }
  
  for (let row = 5; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: PLAYER_WHITE, isKing: false };
      }
    }
  }
  
  return board;
}

function renderGame(container) {
  const playerLabel = gameMode === 'ai' 
    ? (currentPlayer === PLAYER_WHITE ? 'Ваш ход' : 'Ход компьютера...')
    : (currentPlayer === PLAYER_WHITE ? 'Ход белых' : 'Ход черных');
    
  container.innerHTML = `
    <div class="checkers-game">
      <div class="checkers-header">
        <button class="btn-back" id="backBtn">← В меню</button>
        <div class="checkers-title">
          <h1>🎲 Шашки</h1>
          <p class="current-turn">${playerLabel}</p>
        </div>
      </div>
      
      <div class="checkers-info">
        <div class="player-info white">
          <div class="player-label">⚪ Белые</div>
          <div class="captured">Съедено: ${capturedBlack}</div>
        </div>
        
        <button class="btn-new-game" id="newGameBtn">Новая игра</button>
        
        <div class="player-info black">
          <div class="player-label">⚫ Черные</div>
          <div class="captured">Съедено: ${capturedWhite}</div>
        </div>
      </div>
      
      <div class="checkers-board" id="board"></div>
    </div>
  `;
  
  document.getElementById('backBtn').addEventListener('click', () => {
    container.innerHTML = '';
    showModeSelection(container);
  });
  
  document.getElementById('newGameBtn').addEventListener('click', () => initGame(container));
  
  renderBoard();
  
  if (gameMode === 'ai' && currentPlayer === PLAYER_BLACK) {
    setTimeout(() => makeAiMove(container), 800);
  }
}

function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement('div');
      cell.className = 'checkers-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      
      if ((row + col) % 2 === 0) {
        cell.classList.add('light');
      } else {
        cell.classList.add('dark');
      }
      
      const piece = board[row][col];
      if (piece) {
        const pieceEl = document.createElement('div');
        pieceEl.className = `checkers-piece ${piece.player}`;
        if (piece.isKing) pieceEl.classList.add('king');
        
        pieceEl.innerHTML = piece.isKing ? '👑' : '';
        
        if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
          pieceEl.classList.add('selected');
        }
        
        cell.appendChild(pieceEl);
      }
      
      if (isPossibleMove(row, col)) {
        const moveIndicator = document.createElement('div');
        moveIndicator.className = 'move-indicator';
        cell.appendChild(moveIndicator);
      }
      
      cell.addEventListener('click', () => onCellClick(row, col));
      boardEl.appendChild(cell);
    }
  }
}

function isPossibleMove(row, col) {
  return possibleMoves.some(move => move.to.row === row && move.to.col === col);
}

function onCellClick(row, col) {
  if (isAiThinking) return;
  if (gameMode === 'ai' && currentPlayer === PLAYER_BLACK) return;
  
  const piece = board[row][col];
  
  if (piece && piece.player === currentPlayer) {
    selectedPiece = { row, col };
    possibleMoves = getValidMoves(row, col);
    renderBoard();
    soundSystem.click();
  } else if (selectedPiece) {
    const move = possibleMoves.find(m => m.to.row === row && m.to.col === col);
    if (move) {
      executeMove(move);
      soundSystem.move();
      
      selectedPiece = null;
      possibleMoves = [];
      
      if (checkWinCondition()) return;
      
      currentPlayer = currentPlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
      renderGame(document.getElementById('board').closest('.checkers-game').parentElement);
    } else {
      soundSystem.error();
    }
  }
}

function getValidMoves(row, col) {
  const piece = board[row][col];
  if (!piece) return [];
  
  const moves = [];
  const directions = piece.isKing 
    ? [[1, 1], [1, -1], [-1, 1], [-1, -1]]
    : piece.player === PLAYER_WHITE 
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];
  
  const captures = [];
  
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    if (isValidCell(newRow, newCol) && !board[newRow][newCol]) {
      moves.push({
        from: { row, col },
        to: { row: newRow, col: newCol },
        captured: null
      });
    }
    
    const captureRow = row + dr * 2;
    const captureCol = col + dc * 2;
    const middleRow = row + dr;
    const middleCol = col + dc;
    
    if (isValidCell(captureRow, captureCol) && 
        isValidCell(middleRow, middleCol) &&
        !board[captureRow][captureCol] &&
        board[middleRow][middleCol] &&
        board[middleRow][middleCol].player !== piece.player) {
      captures.push({
        from: { row, col },
        to: { row: captureRow, col: captureCol },
        captured: { row: middleRow, col: middleCol }
      });
    }
  }
  
  return captures.length > 0 ? captures : moves;
}

function isValidCell(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function executeMove(move) {
  const piece = board[move.from.row][move.from.col];
  board[move.to.row][move.to.col] = piece;
  board[move.from.row][move.from.col] = null;
  
  if (move.captured) {
    const capturedPiece = board[move.captured.row][move.captured.col];
    if (capturedPiece.player === PLAYER_WHITE) {
      capturedWhite++;
    } else {
      capturedBlack++;
    }
    board[move.captured.row][move.captured.col] = null;
    soundSystem.artifact();
  }
  
  if ((piece.player === PLAYER_WHITE && move.to.row === 0) ||
      (piece.player === PLAYER_BLACK && move.to.row === BOARD_SIZE - 1)) {
    piece.isKing = true;
    soundSystem.ability();
  }
}

function checkWinCondition() {
  const whitePieces = [];
  const blackPieces = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.player === PLAYER_WHITE) whitePieces.push({ row, col });
        else blackPieces.push({ row, col });
      }
    }
  }
  
  if (whitePieces.length === 0) {
    soundSystem.victory();
    setTimeout(() => alert('Черные победили!'), 300);
    return true;
  }
  
  if (blackPieces.length === 0) {
    soundSystem.victory();
    setTimeout(() => alert('Белые победили!'), 300);
    return true;
  }
  
  return false;
}

function makeAiMove(container) {
  isAiThinking = true;
  
  setTimeout(() => {
    const allMoves = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece && piece.player === PLAYER_BLACK) {
          const moves = getValidMoves(row, col);
          allMoves.push(...moves);
        }
      }
    }
    
    if (allMoves.length === 0) {
      soundSystem.error();
      alert('Белые победили! У черных нет ходов.');
      return;
    }
    
    let bestMove;
    
    if (aiDifficulty === 'easy') {
      bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    } else if (aiDifficulty === 'medium') {
      const captureMoves = allMoves.filter(m => m.captured);
      if (captureMoves.length > 0) {
        bestMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
      } else {
        bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      }
    } else {
      bestMove = findBestMove(allMoves);
    }
    
    executeMove(bestMove);
    soundSystem.move();
    
    if (checkWinCondition()) return;
    
    currentPlayer = PLAYER_WHITE;
    isAiThinking = false;
    renderGame(container);
  }, aiDifficulty === 'hard' ? 1000 : aiDifficulty === 'medium' ? 700 : 400);
}

function findBestMove(moves) {
  let bestScore = -Infinity;
  let bestMove = moves[0];
  
  for (const move of moves) {
    let score = 0;
    
    if (move.captured) score += 10;
    
    const piece = board[move.from.row][move.from.col];
    if (move.to.row === BOARD_SIZE - 1) score += 5;
    if (piece.isKing) score += 3;
    
    score += (move.to.row - move.from.row);
    
    score += Math.random() * 2;
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}
