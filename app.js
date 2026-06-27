
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const pvpBtn = document.getElementById("pvpBtn");
const easyBtn = document.getElementById("easyBtn");
const hardBtn = document.getElementById("hardBtn");
const difficultyDisplay = document.getElementById("currentDifficulty");
const muteBtn = document.getElementById("muteBtn");
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");

const STORAGE_KEY = "tictactoe_state";

let currentPlayer = "X";
let board = Array(9).fill("");
let isRunning = true;
let difficulty = null;
let isMuted = false;
let musicTimer = null;
let currentAudio = null;
let gameStats = {
  xWins: 0,
  oWins: 0,
  draws: 0
};


const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function saveGameState() {
  const state = {
    board,
    currentPlayer,
    isRunning,
    difficulty,
    gameStats
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadGameState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const state = JSON.parse(saved);
      board = state.board || Array(9).fill("");
      currentPlayer = state.currentPlayer || "X";
      isRunning = state.isRunning !== undefined ? state.isRunning : true;
      difficulty = state.difficulty || null;
      gameStats = state.gameStats || { xWins: 0, oWins: 0, draws: 0 };
      return true;
    } catch (e) {
      console.error("Error loading game state:", e);
      return false;
    }
  }
  return false;
}

function clearGameState() {
  localStorage.removeItem(STORAGE_KEY);
}

function stopTheme() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}

function playTheme(theme) {
  if (isMuted) return;

  stopTheme();

  const trackMap = {
    pvp: "Mortal Combat.mp3",
    easy: "bezumnyy-zabeg-krolikov-2-1e4752.mp3",
    hard: "veselyy-besporyadok-1-14d595.mp3"
  };

  const audioUrl = trackMap[theme] || trackMap.pvp;
  const audio = new Audio(audioUrl);
  audio.loop = true;
  audio.volume = 0.2;
  currentAudio = audio;

  const playAudio = () => {
    if (isMuted || !currentAudio) return;
    currentAudio.currentTime = 0;
    currentAudio.play().catch(() => {});
  };

  playAudio();
}

function toggleMusic() {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? "🔈 Музыка" : "🔊 Музыка";
  muteBtn.classList.toggle("muted", isMuted);

  if (isMuted) {
    stopTheme();
  } else if (difficulty) {
    playTheme(difficulty);
  }
}

function showStartScreen() {
  startScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
}

function showGameScreen() {
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
}

function initBoard() {
  boardEl.innerHTML = "";

  board.forEach((_, index) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = index;
    cell.textContent = board[index];
    cell.addEventListener("click", handleMove);
    boardEl.appendChild(cell);
  });
}


function handleMove(e) {
  const index = e.target.dataset.index;
  const isCorrectTurn = difficulty === "pvp" ? true : currentPlayer === "X";

  if (!isRunning || board[index] || !difficulty || !isCorrectTurn) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.style.pointerEvents = "none";

  const winningCells = checkWin();
  if (winningCells) {
    statusEl.textContent = `🎉 Победил: ${currentPlayer}`;
    isRunning = false;
    gameStats[currentPlayer === "X" ? "xWins" : "oWins"]++;
    updateStats();
    highlightWinningCells(winningCells);
    saveGameState();
    scheduleAutoRestart();
    return;
  }

  if (!board.includes("")) {
    statusEl.textContent = "🤝 Ничья!";
    isRunning = false;
    gameStats.draws++;
    updateStats();
    saveGameState();
    scheduleAutoRestart();
    return;
  }


  if (difficulty === "pvp") {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusEl.textContent = `Ход: ${currentPlayer}`;
    saveGameState();
    return;
  }

 
  currentPlayer = "O";
  statusEl.textContent = "Ход: O (бот думает...)";
  saveGameState();
  
  setTimeout(() => {
    makeBotMove();
  }, 500);
}


function checkWin() {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c]; 
    }
  }
  return null; 
}

function highlightWinningCells(winningIndices) {
  winningIndices.forEach(index => {
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.classList.add("winning-cell");
  });
}

function updateStats() {
  document.getElementById("xWins").textContent = gameStats.xWins;
  document.getElementById("oWins").textContent = gameStats.oWins;
  document.getElementById("draws").textContent = gameStats.draws;
}

function makeBotMove() {
  if (!isRunning) return;

  let bestMove;
  
  if (difficulty === "easy") {
    bestMove = getRandomMove();
  } else if (difficulty === "hard") {
    bestMove = getSmartMove();
  }

  if (bestMove !== null) {
    board[bestMove] = "O";
    const cell = document.querySelector(`[data-index="${bestMove}"]`);
    cell.textContent = "O";
    cell.style.pointerEvents = "none";

    const winningCells = checkWin();
    if (winningCells) {
      statusEl.textContent = `🎉 Победил: O (бот)`;
      isRunning = false;
      gameStats.oWins++;
      updateStats();
      highlightWinningCells(winningCells);
      saveGameState();
      scheduleAutoRestart();
      return;
    }

    if (!board.includes("")) {
      statusEl.textContent = "🤝 Ничья!";
      isRunning = false;
      gameStats.draws++;
      updateStats();
      saveGameState();
      scheduleAutoRestart();
      return;
    }

    currentPlayer = "X";
    statusEl.textContent = "Ход: X";
    saveGameState();
  }
}

function getRandomMove() {
  const emptyIndices = board
    .map((cell, index) => (cell === "" ? index : null))
    .filter(index => index !== null);
  
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

function getSmartMove() {

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [board[a], board[b], board[c]];
    const oCount = values.filter(v => v === "O").length;
    const emptyCount = values.filter(v => v === "").length;
    
    if (oCount === 2 && emptyCount === 1) {
      const emptyIndex = [a, b, c].find(idx => board[idx] === "");
      return emptyIndex;
    }
  }

 
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [board[a], board[b], board[c]];
    const xCount = values.filter(v => v === "X").length;
    const emptyCount = values.filter(v => v === "").length;
    
    if (xCount === 2 && emptyCount === 1) {
      const emptyIndex = [a, b, c].find(idx => board[idx] === "");
      return emptyIndex;
    }
  }


  if (board[4] === "") {
    return 4;
  }


  const corners = [0, 2, 6, 8];
  const emptyCorners = corners.filter(i => board[i] === "");
  if (emptyCorners.length > 0) {
    return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
  }


  return getRandomMove();
}

function setDifficulty(level) {
  difficulty = level;
  pvpBtn.classList.toggle("active", level === "pvp");
  easyBtn.classList.toggle("active", level === "easy");
  hardBtn.classList.toggle("active", level === "hard");
  
  if (level === "pvp") {
    difficultyDisplay.textContent = "👥 Выбран режим: PvP";
  } else if (level === "easy") {
    difficultyDisplay.textContent = "😊 Выбран режим: Легкий";
  } else {
    difficultyDisplay.textContent = "🤖 Выбран режим: Тяжелый";
  }
  
  statusEl.textContent = "Ход: X";
  saveGameState();
  playTheme(level);
}

function scheduleAutoRestart() {
  let countdown = 4;
  const originalStatus = statusEl.textContent;
  
  const countdownInterval = setInterval(() => {
    statusEl.innerHTML = `${originalStatus}<br><span style="font-size: 0.9rem; opacity: 0.8;">⏱ Новая игра через ${countdown}...</span>`;
    countdown--;
    
    if (countdown < 0) {
      clearInterval(countdownInterval);
      restart();
    }
  }, 1000);
}

function restart() {
  clearGameState();
  board = Array(9).fill("");
  currentPlayer = "X";
  isRunning = true;
  statusEl.textContent = `Ход: X`;
  initBoard();
  showGameScreen();
}

function goBackToMenu() {
  stopTheme();
  showStartScreen();
}


restartBtn.addEventListener("click", restart);
backBtn.addEventListener("click", goBackToMenu);
muteBtn.addEventListener("click", toggleMusic);
startBtn.addEventListener("click", () => {
  if (!difficulty) {
    difficultyDisplay.textContent = "⚠ Сначала выберите режим";
    return;
  }
  restart();
});

pvpBtn.addEventListener("click", () => setDifficulty("pvp"));
easyBtn.addEventListener("click", () => setDifficulty("easy"));
hardBtn.addEventListener("click", () => setDifficulty("hard"));

if (loadGameState()) {
  updateStats();
  if (difficulty === "pvp") {
    difficultyDisplay.textContent = "👥 Выбран режим: PvP";
  } else if (difficulty === "easy") {
    difficultyDisplay.textContent = "😊 Выбран режим: Легкий";
  } else if (difficulty === "hard") {
    difficultyDisplay.textContent = "🤖 Выбран режим: Тяжелый";
  }
  pvpBtn.classList.toggle("active", difficulty === "pvp");
  easyBtn.classList.toggle("active", difficulty === "easy");
  hardBtn.classList.toggle("active", difficulty === "hard");
  
  if (isRunning) {
    statusEl.textContent = `Ход: ${currentPlayer}`;
  }
  showGameScreen();
} else {
  showStartScreen();
}

initBoard();