//import { evaluateBoard } from './evaluation_function.js';

var board = null
var game = new Chess()


function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false
    if (piece.search(/^b/) !== -1) {
        return false
    }
}

function makeComputerMove() {
    let possibleMoves = game.moves()
    if (possibleMoves.length === 0) return

    bestScore = Number.MAX_VALUE
    bestMove = null
    for (let move of possibleMoves) {
        game.move(move)
        let score = minimax_alpha_beta(2,true, Number.MIN_VALUE, Number.MAX_VALUE)
        if (score < bestScore) {
            bestScore = score
            bestMove = move
        }
        game.undo()
    }
    game.move(bestMove)
    board.position(game.fen())
}

function minimax_alpha_beta(depth, isMaximizer, alpha, beta) {
    if (depth == 0) {
        return evaluatePosition(game)
    }

    possibleMoves = game.moves()
    if (isMaximizer) {
        let bestScore = Number.MIN_VALUE;
        for (let move of possibleMoves) {
            game.move(move)
            bestScore = Math.max(bestScore, minimax_alpha_beta(depth-1,!isMaximizer))
            if (bestScore >= beta) return bestScore
            alpha = Math.max(alpha, bestScore)
            game.undo()
        }
        return bestScore
    } else {
        let bestScore = Number.MAX_VALUE;
        for (let move of possibleMoves) {
            game.move(move)
            bestScore = Math.min(bestScore, minimax_alpha_beta(depth-1,!isMaximizer))
            if (bestScore <= alpha) return bestScore
            beta = Math.min(beta, bestScore)
            game.undo()
        }
        return bestScore
    }
}

function onDrop(source, target) {
    var move = game.move({from:source, to:target, promotion:'q'})
    if (move == null) return 'snapback'
}

function onSnapEnd() {
    board.position(game.fen())
    makeComputerMove()
}

var config = {
    pieceTheme: 'chesspieces/wikipedia/{piece}.png',
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}
 
board = Chessboard('myBoard',config)