
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const easyBtn = document.getElementById("easyBtn");
const hardBtn = document.getElementById("hardBtn");
const difficultyDisplay = document.getElementById("currentDifficulty");


let currentPlayer = "X";
let board = Array(9).fill("");
let isRunning = true;
let difficulty = null;
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

  if (!isRunning || board[index] || !difficulty) return;

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
    return;
  }

  if (!board.includes("")) {
    statusEl.textContent = "🤝 Ничья!";
    isRunning = false;
    gameStats.draws++;
    updateStats();
    return;
  }

  currentPlayer = "O";
  statusEl.textContent = "Ход: O (бот думает...)";
  
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
      return;
    }

    if (!board.includes("")) {
      statusEl.textContent = "🤝 Ничья!";
      isRunning = false;
      gameStats.draws++;
      updateStats();
      return;
    }

    currentPlayer = "X";
    statusEl.textContent = "Ход: X";
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
  easyBtn.classList.toggle("active", level === "easy");
  hardBtn.classList.toggle("active", level === "hard");
  
  if (level === "easy") {
    difficultyDisplay.textContent = "😊 Выбран режим: Легкий";
  } else {
    difficultyDisplay.textContent = "🤖 Выбран режим: Тяжелый";
  }
  
  statusEl.textContent = "Ход: X";
}

function restart() {
  board = Array(9).fill("");
  currentPlayer = "X";
  isRunning = true;
  statusEl.textContent = `Ход: X`;
  initBoard();
}


restartBtn.addEventListener("click", restart);

easyBtn.addEventListener("click", () => setDifficulty("easy"));
hardBtn.addEventListener("click", () => setDifficulty("hard"));

initBoard();