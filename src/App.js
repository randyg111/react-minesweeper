import React, { useState } from "react";

function Square() {
  return <button className="square"></button>;
}

function Board({squares}) {
  // function handleClick(i) {
  //   if (calculateWin(squares)) {
  //     return;
  //   }
  // }

  const rows = squares.length;
  const cols = squares[0].length;
  const board = Array(rows);
  for (let r = 0; r < rows; r++) {
    let row = Array(cols);
    for (let c = 0; c < cols; c++) {
      row[c] = <Square key={c} />;
    }
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
  const rows = 3;
  const cols = 3;
  const [grid, setGrid] = useState([Array(rows).fill(Array(cols).fill(null))]);

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={grid}/>
      </div>
      <div className="game-info">
        
      </div>
    </div>
  )
}
