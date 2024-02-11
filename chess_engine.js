// State
var board = null
var game = new Chess()


function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false
    if ()
}

function onDrop(source, target) {

}

function onSnapEnd() {

}

var config = {
    pieceTheme: 'chesspieces/wikipedia/{piece}.png',
    draggable: true,
    position: 'start',
    onDragStart:onDragStart
}
var board = Chessboard('myBoard',config)