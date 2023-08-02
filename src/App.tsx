import React, { useMemo, useState } from "react";

// chording, retry button, custom difficulty, timer, graphics, snake
type Value = "💥" | "🚩" | "⬜" | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null;
type Grid = Value[][];
type GridFunc = (grid: Grid, r: number, c: number) => number;

const rows = 8;
const cols = 8;
const mines = 10;
var flags = mines;
var status = "Reveal all safe squares to win!";
var clicks = 0;

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
  return <button className="square" onMouseDown={onSquareClick} onMouseUp={onSquareClick} onAuxClick={onSquareClick} 
    onClick={onSquareClick} onContextMenu={onSquareClick}>{value}</button>;
}

function Board({squares, onPlay, hiddenSquares}: BoardProps) {
  const handleClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (calculateWin(squares) || calculateLose()) {
      return;
    }
    if (e.type === "mousedown") {
      clicks++;
    }
    if (e.type === "mouseup") {
      clicks--;
    }
    const nextSquares = squares.map(arr => arr.slice()) as Grid;
    if (e.type === "auxclick" || clicks >= 2) {
      handleChord(nextSquares, r, c);
    } else if (e.type === "click") {
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

  function handleChord(nextSquares: Grid, r: number, c: number) {
    if (nextSquares[r][c] !== null && typeof nextSquares[r][c] !== "string") {
      const adjFlags = adjFunc(nextSquares, r, c, (grid, r, c) => {
        if (grid[r][c] === "🚩") return 1;
        return 0;
      });
      if (adjFlags === nextSquares[r][c]) {
        adjFunc(nextSquares, r, c, handleLeftClick);
      }
    }
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
    if (r < 0 || c < 0 || r >= rows || c >= cols || nextSquares[r][c] !== null) return 0;
    if (hiddenSquares[r][c] === 0) {
      hiddenSquares[r][c] = "⬜";
      nextSquares[r][c] = "⬜";
      adjFunc(nextSquares, r, c, handleLeftClick);
    } else {
      nextSquares[r][c] = hiddenSquares[r][c];
      if (nextSquares[r][c] === "💥") {
        status = "You lose!";
      }
    }
    if (calculateWin(nextSquares)) {
      status = "You win!";
    }
    return 0;
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
      <div className="status">{counter}</div>
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

      adjFunc(temp, r, c, (grid, r, c) => {
        const val = grid[r][c];
        if (val !== null && typeof val !== "string") {
          grid[r][c] = val + 1 as Value;
        }
        return 0;
      });
    }
    return temp;
  }, []);
  

  function handlePlay(nextGrid: Grid) {
    setGrid(nextGrid);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={grid} onPlay={handlePlay} hiddenSquares={hidden} />
      </div>
      <div className="game-info">
        {status}
      </div>
    </div>
  )
}

function adjFunc(grid: Grid, r: number, c: number, func: GridFunc) {
  let num = 0;
  num += colFunc(grid, r, c, func);
  if (r > 0) {
    num += colFunc(grid, r-1, c, func);
  }
  if (r < rows - 1) {
    num += colFunc(grid, r+1, c, func);
  }
  return num;
}

function colFunc(grid: Grid, r: number, c: number, func: GridFunc) {
  let num = 0;
  num += func(grid, r, c);
  if (c > 0) {
    num += func(grid, r, c-1);
  }
  if (c < cols - 1) {
    num += func(grid, r, c+1);
  }
  return num;
}