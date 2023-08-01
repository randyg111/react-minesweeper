import { useState } from "react";

function Square({value, onSquareClick}) {
  return <button className="square" onClick={onSquareClick}>{value}</button>;
}

function Board({squares, onPlay}) {
  function handleClick(r, c) {
    // if (calculateWin(squares)) {
    //   return;
    // }
    const nextSquares = squares.map(arr => arr.slice());
    nextSquares[r][c] = "x";
    onPlay(nextSquares);
  }

  const rows = squares.length;
  const cols = squares[0].length;
  const board = Array(rows);
  for (let r = 0; r < rows; r++) {
    let row = Array(cols);
    for (let c = 0; c < cols; c++) {
        row[c] = <Square key={c} value={squares[r][c]} onSquareClick={() => handleClick(r, c)} />;
    }
    // const row = squares[r].map((square, c) => {
    //   <Square key={c} value={square} onSquareClick={() => handleClick(r, c)} />
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
  const [grid, setGrid] = useState(Array(rows).fill(Array(cols).fill(null)));
  function handlePlay(nextGrid) {
    setGrid(nextGrid);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={grid} onPlay={handlePlay}/>
      </div>
      <div className="game-info">
        
      </div>
    </div>
  )
}
