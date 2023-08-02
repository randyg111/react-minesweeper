import React, { useState } from "react";

// timer, graphics, snake
type Value = "💥" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | null;
type Grid = Value[][];

interface BoardProps {
  squares: Grid;
  onPlay: Function;
}

interface SquareProps {
  value: Value;
  onSquareClick: React.MouseEventHandler;
}

function Square({value, onSquareClick}: SquareProps) {
  return <button className="square" onClick={onSquareClick}>{value}</button>;
}

function Board({squares, onPlay}: BoardProps) {
  function handleClick(r: number, c: number) {
    // if (calculateWin(squares)) {
    //   return;
    // }
    const nextSquares = squares.map((arr: Value[]) => arr.slice());
    nextSquares[r][c] = "💥";
    onPlay(nextSquares);
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
  const rows = 8;
  const cols = 8;
  const [grid, setGrid] = useState<Grid>(Array(rows).fill(Array(cols).fill(null)));
  function handlePlay(nextGrid: Grid) {
    setGrid(nextGrid);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={grid} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        
      </div>
    </div>
  )
}
