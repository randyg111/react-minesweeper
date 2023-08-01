import React, { useState } from "react";

// value type, timer, graphics, snake
// https://www.typescriptlang.org/docs/handbook/2/narrowing.html
// https://stackoverflow.com/questions/59988667/typescript-react-fcprops-confusion
type Value = number;
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
    nextSquares[r][c]++;
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
    board[r] = <div key={r} className="board-row">{row}</div>;
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
