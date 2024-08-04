import { Chess } from "chess.js";
import { evaluatePosition } from "./Evaluation";

function getComputerMove(game) {
    let possibleMoves = game.moves()
    if (possibleMoves.length === 0) return ""
    
    // Get initial evaluations
    let evals = new Map()
    for (let move of possibleMoves) {
        game.move(move)
        evals.set(move,evaluatePosition(game))
        game.undo()
    }

    // Pre-sort moves
    possibleMoves.sort((a,b) => (evals.get(a)-evals.get(b)))
    let bestScore = Number.MAX_VALUE
    let bestMove = ''
    for (let move of possibleMoves) {
        game.move(move)
        let score = minimax_alpha_beta(game,3,true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
        if (score <= bestScore) {
            bestScore = score
            bestMove = move
        }
        game.undo()
    }
    return bestMove;
}

function minimax_alpha_beta(game, depth, isMaximizer, alpha, beta) {
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

// Use self instead of ctx for better compatibility
self.onmessage = (event) => {
    const fen = event.data;
    const game = new Chess(fen);
    let bestMove = getComputerMove(game);
    self.postMessage(bestMove);
}

// Export an empty object as default
export default {};