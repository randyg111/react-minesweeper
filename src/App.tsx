import React, { useEffect, useMemo, useState } from "react";

// beginner/intermediate/expert difficulties, useEffect, mouse manipulation, timer, graphics, snake
type Value = "💥" | "🚩" | "⬜" | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null;
type Grid = Value[][];
type GridFunc = (grid: Grid, r: number, c: number) => number;

var rows = 8;
var cols = 8;
var mines = 10;
var flags = mines;
var clicks = 0;
var retries = 0;

interface BoardProps {
  squares: Grid;
  hiddenSquares: Grid;
  onPlay: (nextGrid: Grid) => void;
}

interface SquareProps {
  value: Value;
  onSquareClick: React.MouseEventHandler;
}

interface FormProps {
  refresh: () => void;
}

interface TimerProps {
  time: number;
}

function Square({value, onSquareClick}: SquareProps) {
  return <button className="square" onMouseDown={onSquareClick} onMouseUp={onSquareClick} onAuxClick={onSquareClick} 
    onClick={onSquareClick} onContextMenu={onSquareClick}>{value}</button>;
}

function Board({squares, onPlay, hiddenSquares}: BoardProps) {
  const handleClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (calculateWin(hiddenSquares, squares)) {
      return;
    } else if (calculateLose(squares)) {
      return;
    }
    if (clicks < 0) {
      clicks = 0;
    }
    if (e.type === "mousedown") {
      clicks++;
    } else if (e.type === "mouseup") {
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
    if (r < 0 || c < 0 || r >= nextSquares.length || c >= nextSquares[0].length || nextSquares[r][c] !== null) return 0;
    if (hiddenSquares[r][c] === 0) {
      hiddenSquares[r][c] = "⬜";
      nextSquares[r][c] = "⬜";
      adjFunc(nextSquares, r, c, handleLeftClick);
    } else {
      nextSquares[r][c] = hiddenSquares[r][c];
    }
    return 0;
  }

  const board = squares.map((row, r) => {
    const boardRow = row.map((square, c) => {
      return <Square key={c} value={square} onSquareClick={(e: React.MouseEvent) => handleClick(e, r, c)} />
    });
    return <div key={r} className="board-row">{boardRow}</div>
  })

  

  return (
    <>
      {board}
    </>
  );
}

export default function Game() {
  const [grid, setGrid] = useState<Grid>(Array(rows).fill(null).map(x => Array(cols).fill(null)));
  const [status, setStatus] = useState("Reveal all safe squares to win!");
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const hidden = useMemo(() => {
    const temp = Array(rows).fill(null).map(x => Array(cols).fill(0)) as Grid;
    const locs = new Set<number>();
    while (locs.size < mines) {
      locs.add(Math.floor(Math.random() * rows * cols));
    }
    const locsArr = Array.from(locs);
    for (let loc of locsArr) {
      const r = Math.floor(loc / cols);
      const c = loc % cols;
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
  }, [retries]);
  let counter = useMemo(() => {
    return "🚩 Flag counter: " + flags;
  }, [flags]);

  useEffect(() => {
    let intervalId: NodeJS.Timer;
    if (isRunning) {
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, time]);

  function retry() {
    const status = checkInput();
    flags = 0;
    setIsRunning(false);
    setTime(0);
    setStatus(status);
    if (status !== "There are more mines than squares!" && status !== "Negative mines!") {
      flags = mines;
      retries++;
      setGrid(Array(rows).fill(null).map(x => Array(cols).fill(null)));
    }
  }

  function checkInput() {
    if (mines < 0) {
      return "Negative mines!";
    }
    if (mines > rows * cols) {
      return "There are more mines than squares!";
    }
    if (mines === rows * cols) {
      return "You win?!";
    }
    return "Reveal all safe squares to win!";
  }

  function handlePlay(nextGrid: Grid) {
    console.log(clicks);
    if (!isRunning) {
      setIsRunning(true);
    }
    if (calculateWin(hidden, nextGrid)) {
      setStatus("You win!");
      setIsRunning(false);
    }
    if (calculateLose(nextGrid)) {
      setStatus("You lose!");
      revealMines(nextGrid);
      setIsRunning(false);
    }
    setGrid(nextGrid);
  }

  function revealMines(nextSquares: Grid) {
    for (let r = 0; r < nextSquares.length; r++) {
      for (let c = 0; c < nextSquares[0].length; c++) {
        if (hidden[r][c] === "💥") {
          nextSquares[r][c] = hidden[r][c];
        }
      }
    }
  }

  function handleMouseLeave(e: React.MouseEvent) {
    clicks = 0;
  }

  // optimize mine generation
  // 50/50
  return (
    <div className="game">
      <div className="game-display">
        <div className="status">{counter}</div>
        <div className="game-board" onMouseLeave={handleMouseLeave}>
          <Board squares={grid} onPlay={handlePlay} hiddenSquares={hidden} />
        </div>
      </div>
      <div className="game-info">
        <Timer time={time} />
        <CustomForm refresh={retry} />
        <button onClick={retry}>Retry</button>
        <p>{status}</p>
      </div>
    </div>
  )
}

function Timer({time}: TimerProps) {
  const seconds = Math.floor(time / 100);
  const milliseconds = time % 100;

  return (
    <div>
      {seconds}.{String(milliseconds).padStart(2, "0")}
    </div>
  );
}

function CustomForm({refresh}: FormProps) {
  const [rowNum, setRowNum] = useState(8);
  const [colNum, setColNum] = useState(8);
  const [mineNum, setMineNum] = useState(10);
  function handleSubmit(e: React.MouseEvent) {
    rows = rowNum;
    cols = colNum;
    mines = mineNum;
    refresh();
  }
  return (
    <div>
      <label>
        Number of rows: <input value={rowNum} onChange={e => setRowNum(Number(e.target.value))} type="number" />
      </label>
      <br />
      <label>
        Number of columns: <input value={colNum} onChange={e => setColNum(Number(e.target.value))} type="number" />
      </label>
      <br />
      <label>
        Number of mines: <input value={mineNum} onChange={e => setMineNum(Number(e.target.value))} type="number" />
      </label>
      <br />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

function calculateWin(hidden:Grid, squares: Grid) {
  for (let r = 0; r < squares.length; r++) {
    for (let c = 0; c < squares[0].length; c++) {
      if (hidden[r][c] !== "💥" && hidden[r][c] !== squares[r][c]) {
        return false;
      }
    }
  }
  return true;
}

function calculateLose(squares: Grid) {
  for (let r = 0; r < squares.length; r++) {
    for (let c = 0; c < squares[0].length; c++) {
      if (squares[r][c] === "💥") {
        return true;
      }
    }
  }
  return false;
}

function adjFunc(grid: Grid, r: number, c: number, func: GridFunc) {
  let num = 0;
  num += colFunc(grid, r, c, func);
  if (r > 0) {
    num += colFunc(grid, r-1, c, func);
  }
  if (r < grid.length - 1) {
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
  if (c < grid[0].length - 1) {
    num += func(grid, r, c+1);
  }
  return num;
}