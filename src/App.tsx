import React, { useMemo, useState } from "react";

// timer, graphics, snake
type Value = "💥" | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null;
type Grid = Value[][];

const rows = 8;
const cols = 8;
const mines = 10;

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
  return <button className="square" onClick={onSquareClick}>{value}</button>;
}

function Board({squares, onPlay, hiddenSquares}: BoardProps) {
  function handleClick(r: number, c: number) {
    // if (calculateWin(squares)) {
    //   return;
    // }
    const nextSquares = squares.map(arr => arr.slice()) as Grid;
    recur(nextSquares, r, c);
    onPlay(nextSquares);
  }

  function recur(nextSquares: Grid, r: number, c: number) {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return;
    if (hiddenSquares[r][c] === 0) {
      hiddenSquares[r][c] = null;
      recur(nextSquares, r+1, c+1);
      recur(nextSquares, r+1, c);
      recur(nextSquares, r+1, c-1);
      recur(nextSquares, r, c+1);
      recur(nextSquares, r, c-1);
      recur(nextSquares, r-1, c+1);
      recur(nextSquares, r-1, c);
      recur(nextSquares, r-1, c-1);
    } else if (hiddenSquares[r][c] !== null) {
      nextSquares[r][c] = hiddenSquares[r][c];
    }
  }

  const board = squares.map((row, r) => {
    const boardRow = row.map((square, c) => {
      return <Square key={c} value={square} onSquareClick={() => handleClick(r, c)} />
    });
    return <div key={r} className="board-row">{boardRow}</div>
  })

  return (
    <>
      <div className="status"></div>
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
        increment(temp, r-1, c);
        colCheck(temp, r-1, c);
      }
      if (r < rows - 1) {
        increment(temp, r+1, c);
        colCheck(temp, r+1, c);
      }
    }
    return temp;
  }, []);

  function colCheck(grid: Grid, r: number, c: number) {
    if (c > 0) {
      increment(grid, r, c-1);
    }
    if (c < cols - 1) {
      increment(grid, r, c+1);
    }
  }

  function increment(grid: Grid, r: number, c: number) {
    const val = grid[r][c];
    if (val !== null && val !== "💥") {
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
