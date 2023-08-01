import React, { useState } from "react";

type Grid = number[][];
interface BoardProps {
  squares: Grid;
  onPlay: Function;
}
interface SquareProps {
  value: number;
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
    const nextSquares = squares.map((arr: any[]) => arr.slice());
    nextSquares[r][c] = "x";
    onPlay(nextSquares);
  }

  const rows = squares.length;
  const cols = squares[0].length;
  const board = Array(rows);
  for (let r = 0; r < rows; r++) {
    const row = Array(cols);
    for (let c = 0; c < cols; c++) {
        row[c] = <Square key={c} value={squares[r][c]} onSquareClick={() => handleClick(r, c)} />
    }
    // const row = squares[r].map((square, c) => {
    //   <Square key={c} value={c} onSquareClick={() => handleClick(r, c)} />
    // });
    board[r] = <div key={r} className="board-row">{row}{row[0]}</div>;
  }

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
  const [grid, setGrid] = useState<Grid>(Array(rows).fill(Array(cols).fill(0)));
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
