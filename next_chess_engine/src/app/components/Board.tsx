'use client'

import React, {useState, useMemo, useEffect} from "react";
import { Chessboard as ReactChessboard} from "react-chessboard";
import { Chess,Square} from "chess.js";
import { evaluatePosition } from "./Evaluation";
import Engine from "./Engine";

export function Board() {
  const [game,setGame] = useState(new Chess());
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [engine, setEngine] = useState(new Engine());

  function makeComputerMove(game:Chess):void {
    let possibleMoves = game.moves()
    if (possibleMoves.length === 0) return
    
    // Get initial evaluations
    let evals = new Map()
    for (let move of possibleMoves) {
        game.move(move)
        evals.set(move,evaluatePosition(game))
        game.undo()
    }

    // Pre-sort moves
    possibleMoves.sort((a,b) => (evals.get(a)-evals.get(b)))
    let bestScore:number = Number.MAX_VALUE
    let bestMove:string = ''
    for (let move of possibleMoves) {
        game.move(move)
        let score = minimax_alpha_beta(game,3,true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
        if (score <= bestScore) {
            bestScore = score
            bestMove = move
        }
        game.undo()
    }
    game.move(bestMove);
}

function minimax_alpha_beta(game:Chess, depth:number, isMaximizer:boolean, alpha:number, beta:number):number {
    if (depth == 0) {
        return evaluatePosition(game)
    }

    let possibleMoves = game.moves()
    if (isMaximizer) {
        let bestScore = Number.NEGATIVE_INFINITY;
        for (let move of possibleMoves) {
            game.move(move)
            bestScore = Math.max(bestScore, minimax_alpha_beta(game,depth-1,!isMaximizer, alpha, beta))
            if (bestScore >= beta) {
                game.undo()
                return bestScore
            }
            alpha = Math.max(alpha, bestScore)
            game.undo()
        }
        return bestScore
    } else {
        let bestScore = Number.POSITIVE_INFINITY;
        for (let move of possibleMoves) {
            game.move(move)
            bestScore = Math.min(bestScore, minimax_alpha_beta(game,depth-1, !isMaximizer, alpha, beta))
            if (bestScore <= alpha) {
                game.undo()
                return bestScore
            }
            beta = Math.min(beta, bestScore)
            game.undo()
        }
        return bestScore
    }
}

  function findEngineMove(gameFEN:string) {
    engine.sendFEN(gameFEN);
    engine.setCallback((bestMove:string) => {
      let newGame:Chess = new Chess(game.fen());
      newGame.move(bestMove);
      setGame(newGame);
      setIsComputerThinking(false);
    })
  }

  useEffect(() => {
    if (isComputerThinking) {
      const timer = setTimeout(() => findEngineMove(game.fen()),100)
      return () => clearTimeout(timer);
    }
  },[game])


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
    setIsComputerThinking(true);
    setGame(newGame)
    return true;
  }

  return (
    <div className="mx-auto mt-10 w-fit">
      <ReactChessboard boardWidth={560} position={game.fen()} onPieceDrop={onDrop}/>
      <p>{isComputerThinking && "Computer Thinking"}</p>
    </div>
  )
}
    