import React, { useMemo, useState } from "react";

// chording, retry button, custom difficulty, timer, graphics, snake
type Value = "💥" | "🚩" | "⬜" | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null;
type Grid = Value[][];

const rows = 8;
const cols = 8;
const mines = 10;
var flags = mines;
var status = "";

interface BoardProps {
  squares: Grid;
  hiddenSquares: Grid;
  onPlay: Function;
}

interface SquareProps {
  value: Value;
  onSquareClick: React.MouseEventHandler;
}

function Square({value, onSquareClick}: SquareProps) {
  return <button className="square" onClick={onSquareClick} onContextMenu={onSquareClick}>{value}</button>;
}

function Board({squares, onPlay, hiddenSquares}: BoardProps) {
  const handleClick = (e: React.MouseEvent, r: number, c: number) => {
    if (e.type === "contextmenu") {
      e.preventDefault();
    }
    if (calculateWin(squares) || calculateLose()) {
      return;
    }
    const nextSquares = squares.map(arr => arr.slice()) as Grid;
    if (e.type === "click") {
      handleLeftClick(nextSquares, r, c);
    } else if (e.type === "contextmenu") {
      handleRightClick(nextSquares, r, c);
    }
    onPlay(nextSquares);
  };

  function calculateWin(squares: Grid) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (hiddenSquares[r][c] !== "💥" && hiddenSquares[r][c] !== squares[r][c]) {
          return false;
        }
      }
    }
    return true;
  }

  function calculateLose() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (squares[r][c] === "💥") {
          return true;
        }
      }
    }
    return false;
  }

  function handleRightClick(nextSquares: Grid, r: number, c: number) {
    if (nextSquares[r][c] === "🚩") {
      nextSquares[r][c] = null;
      flags++;
    } else if (nextSquares[r][c] === null) {
      nextSquares[r][c] = "🚩";
      flags--;
    }
  }

  function handleLeftClick(nextSquares: Grid, r: number, c: number) {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return;
    if (hiddenSquares[r][c] === 0) {
      hiddenSquares[r][c] = "⬜";
      nextSquares[r][c] = "⬜";
      handleLeftClick(nextSquares, r+1, c+1);
      handleLeftClick(nextSquares, r+1, c);
      handleLeftClick(nextSquares, r+1, c-1);
      handleLeftClick(nextSquares, r, c+1);
      handleLeftClick(nextSquares, r, c-1);
      handleLeftClick(nextSquares, r-1, c+1);
      handleLeftClick(nextSquares, r-1, c);
      handleLeftClick(nextSquares, r-1, c-1);
    } else {
      nextSquares[r][c] = hiddenSquares[r][c];
      if (nextSquares[r][c] === "💥") {
        status = "You lose!";
      }
    }
    if (calculateWin(nextSquares)) {
      status = "You win!";
    }
  }

  const board = squares.map((row, r) => {
    const boardRow = row.map((square, c) => {
      return <Square key={c} value={square} onSquareClick={(e: React.MouseEvent) => handleClick(e, r, c)} />
    });
    return <div key={r} className="board-row">{boardRow}</div>
  })

  let counter = useMemo(() => {
    return "🚩 Flag counter: " + flags;
  }, [flags]);

  return (
    <>
      <div className="status">{counter}{'    '}{status}</div>
      {board}
    </>
  );
}

export default function Game() {
  const [grid, setGrid] = useState<Grid>(Array(rows).fill(null).map(x => Array(cols).fill(null)));
  const hidden = useMemo(() => {
    const temp = Array(rows).fill(null).map(x => Array(cols).fill(0)) as Grid;
    const locs = new Set<number>();
    while (locs.size < mines) {
      locs.add(Math.floor(Math.random() * rows * cols));
    }
    const locsArr = Array.from(locs);
    for (let loc of locsArr) {
      const r = Math.floor(loc / rows);
      const c = loc % rows;
      temp[r][c] = "💥";

      colCheck(temp, r, c);
      if (r > 0) {
        colCheck(temp, r-1, c);
      }
      if (r < rows - 1) {
        colCheck(temp, r+1, c);
      }
    }
    return temp;
  }, []);

  function colCheck(grid: Grid, r: number, c: number) {
    increment(grid, r, c);
    if (c > 0) {
      increment(grid, r, c-1);
    }
    if (c < cols - 1) {
      increment(grid, r, c+1);
    }
  }

  function increment(grid: Grid, r: number, c: number) {
    const val = grid[r][c];
    if (val !== null && typeof val !== "string") {
      grid[r][c] = val + 1 as Value;
    }
  }
  

  function handlePlay(nextGrid: Grid) {
    setGrid(nextGrid);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={grid} onPlay={handlePlay} hiddenSquares={hidden} />
      </div>
      <div className="game-info">
        
      </div>
    </div>
  )
}
