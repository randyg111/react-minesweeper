import React, { useCallback, useEffect, useMemo, useState } from "react";

// leaderboard, guarantee safe start
// optimize mine generation, win/lose calculation
// convert name, github page
// minesweeper icon, theme
type Value = "💥" | "🚩" | "⬜" | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null;
type Grid = Value[][];
type GridFunc = (grid: Grid, r: number, c: number) => number;

interface BoardProps {
  squares: Grid;
  hiddenSquares: Grid;
  onPlay: (nextGrid: Grid, nextFlags: number, nextClicks: number, nextRightClick: boolean) => void;
  flags: number;
  clicks: number;
  rightClick: boolean;
}

interface SquareProps {
  value: Value;
  onSquareClick: React.MouseEventHandler;
}

interface FormProps {
  onSubmit: (nextRows: number, nextCols: number, nextMines: number) => void;
  rows: number;
  cols: number;
  mines: number;
}

interface TimerProps {
  time: number;
}

function Square({value, onSquareClick}: SquareProps) {
  return <button className="square" onMouseDown={onSquareClick} onMouseUp={onSquareClick} onAuxClick={onSquareClick} 
    onClick={onSquareClick} onContextMenu={onSquareClick}>{value}</button>;
}

function Board({squares, hiddenSquares, onPlay, flags, clicks, rightClick}: BoardProps) {
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
      rightClick = false;
    } else if (e.type === "mouseup") {
      clicks--;
    }
    // console.log(e.type+" "+clicks);
  
    const nextSquares = squares.map(arr => arr.slice()) as Grid;
    if ((e.type === "auxclick" && !rightClick) || clicks >= 2) {
      handleChord(nextSquares, r, c);
    } else if (e.type === "click" && clicks === 0) {
      handleLeftClick(nextSquares, r, c);
    } else if (e.type === "contextmenu" && clicks === 1) {
      rightClick = true;
      handleRightClick(nextSquares, r, c);
    }

    onPlay(nextSquares, flags, clicks, rightClick);
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
      return <Square key={r * row.length + c} value={square} onSquareClick={(e: React.MouseEvent) => handleClick(e, r, c)} />
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
  const [rows, setRows] = useState(9);
  const [cols, setCols] = useState(9);
  const [mines, setMines] = useState(10);
  const [flags, setFlags] = useState(mines);
  const [clicks, setClicks] = useState(0);
  const [grid, setGrid] = useState<Grid>(Array(rows).fill(null).map(x => Array(cols).fill(null)));
  const [status, setStatus] = useState("Reveal all safe squares to win!");
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [rightClick, setRightClick] = useState(false);

  const createHidden = useCallback(() => {
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
  }, [rows, cols, mines]);

  const [hidden, setHidden] = useState(createHidden);

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

  useEffect(retry, [rows, cols, mines, createHidden]);

  function retry() {
    const status = (function() {
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
    })();
    setFlags(0);
    setIsRunning(false);
    setTime(0);
    setStatus(status);
    if (status !== "There are more mines than squares!" && status !== "Negative mines!") {
      setFlags(mines);
      setGrid(Array(rows).fill(null).map(x => Array(cols).fill(null)));
      setHidden(createHidden);
    }
  }

  function handlePlay(nextGrid: Grid, nextFlags: number, nextClicks: number, nextRightClick: boolean) {
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
    setFlags(nextFlags);
    setClicks(nextClicks);
    setRightClick(nextRightClick);
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

  function handleMouseLeave() {
    setClicks(0);
  }

  function handleSubmit(nextRows: number, nextCols: number, nextMines: number) {
    setRows(nextRows);
    setCols(nextCols);
    setMines(nextMines);
  }

  function handleBeginnerClick() {
    setRows(9);
    setCols(9);
    setMines(10);
  }

  function handleIntermediateClick() {
    setRows(16);
    setCols(16);
    setMines(40);
  }

  function handleExpertClick() {
    setRows(16);
    setCols(30);
    setMines(99);
  }

  return (
    <div className="game">
      <div className="game-display">
        <div className="status">{counter}</div>
        <div className="game-board" onMouseLeave={handleMouseLeave}>
          <Board squares={grid} onPlay={handlePlay} hiddenSquares={hidden} flags={flags} clicks={clicks} rightClick={rightClick} />
        </div>
      </div>
      <div className="game-info">
        <Timer time={time} />
        <button onClick={handleBeginnerClick}>Beginner</button>
        <button onClick={handleIntermediateClick}>Intermediate</button>
        <button onClick={handleExpertClick}>Expert</button>
        <CustomForm onSubmit={handleSubmit} rows={rows} cols={cols} mines={mines} />
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

function CustomForm({onSubmit, rows, cols, mines}: FormProps) {
  const [nextRows, setNextRows] = useState(rows);
  const [nextCols, setNextCols] = useState(cols);
  const [nextMines, setNextMines] = useState(mines);
  if (rows !== nextRows) {
    setNextRows(rows);
  }
  if (cols !== nextCols) {
    setNextCols(cols);
  }
  if (mines !== nextMines) {
    setNextMines(mines);
  }
  console.log(nextRows);
  return (
    <div>
      <label>
        Number of rows: <input value={nextRows} onChange={e => setNextRows(Number(e.target.value))} type="number" />
      </label>
      <br />
      <label>
        Number of columns: <input value={nextCols} onChange={e => setNextCols(Number(e.target.value))} type="number" />
      </label>
      <br />
      <label>
        Number of mines: <input value={nextMines} onChange={e => setNextMines(Number(e.target.value))} type="number" />
      </label>
      <br />
      <button onClick={() => onSubmit(nextRows, nextCols, nextMines)}>Submit</button>
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