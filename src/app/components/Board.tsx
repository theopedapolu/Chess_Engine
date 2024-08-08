'use client'

import React, {useState, useMemo, useEffect} from "react";
import { Chessboard as ReactChessboard} from "react-chessboard";
import { Chess,Square} from "chess.js";
import Engine from "./Engine";

export function Board() {
  const [game,setGame] = useState(new Chess());
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [engine, setEngine] = useState(new Engine());

  function findEngineMove(gameFEN:string) {
    engine.sendFEN(gameFEN);
    engine.setCallback((bestMove:string) => {
      let newGame:Chess = new Chess(game.fen());
      if (bestMove) {
        newGame.move(bestMove);
      }
      setGame(newGame);
      setIsComputerThinking(false);
    })
  }

  useEffect(() => {
    if (isComputerThinking) {
      const timer = setTimeout(() => findEngineMove(game.fen()),50)
      return () => clearTimeout(timer);
    }
  })


  function onDrop(sourceSquare:Square, targetSquare:Square):boolean {
    if (game.isGameOver() || isComputerThinking) return false;
    let newGame:Chess = new Chess(game.fen());
    const userMove = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      }
    )
    if (userMove == null) return false;
    setIsComputerThinking(true)
    setGame(newGame)
    return true;
  }

  let message = <p></p>;
  if (game.isCheckmate() && game.turn() === 'w') {
    message = <p className="text-center text-sky-500 text-xl font-semibold">{"Checkmate -- Black wins!"}</p>
  }
  else if (game.isCheckmate() && game.turn() === 'b') {
    message = <p className="text-center text-sky-500 text-xl font-semibold">{"Checkmate -- White wins!"}</p>
  } 
  else if (game.isDraw()) {
    message = <p className="text-center text-sky-500 text-xl font-semibold">{"Draw"}</p>
  }
  else if (isComputerThinking) {
    message = <p className="text-center text-emerald-500 text-xl font-semibold">{"Computer is Thinking..."}</p>
  } 

  return (
    <div className="mx-auto mt-20 w-fit">
      <ReactChessboard boardWidth={560} position={game.fen()} onPieceDrop={onDrop}/>
      <div className="text-center mt-10">
        {message}
      </div>
    </div>
  )
}
    