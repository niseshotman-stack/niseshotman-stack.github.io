
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");


let currentPlayer = "X";
let board = Array(9).fill("");
let isRunning = true;
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


  if (!isRunning || board[index]) return;


  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.style.pointerEvents = "none";

  const winningCells = checkWin();
  if (winningCells) {
    statusEl.textContent = `🎉 Победил: ${currentPlayer}`;
    isRunning = false;
    gameStats[currentPlayer === "X" ? "xWins" : "oWins"]++;
    highlightWinningCells(winningCells);
    return;
  }


  if (!board.includes("")) {
    statusEl.textContent = "🤝 Ничья!";
    isRunning = false;
    gameStats.draws++;
    return;
  }


  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusEl.textContent = `Ход: ${currentPlayer}`;
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

function restart() {
  board = Array(9).fill("");
  currentPlayer = "X";
  isRunning = true;
  statusEl.textContent = `Ход: X`;
  initBoard();
}


restartBtn.addEventListener("click", restart);


initBoard();