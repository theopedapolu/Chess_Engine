function stringToHash(string) {
  let hash = 0;

  if (string.length == 0) return hash;

  for (i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
  }

  return hash;
}


// Piece values
const PIECE_VALUES = {
  'p': 100,
  'n': 320,
  'b': 330,
  'r': 500,
  'q': 900,
  'k': 20000
};

// Piece-square tables
const PIECE_TABLES = {
  'p': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [100, 100, 100, 100, 100, 100, 100, 100],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 20, 20, 10, 5, 5],
    [0, 0, 0, 15, 15, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -15, -15, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'n': [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ],
  'b': [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20]
  ],
  'r': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0]
  ],
  'q': [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20]
  ],
  'k': [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20]
  ]
};

function getAttackingPieces(game, square, color) {
  const attackers = [];
  for (let i = 0; i < game.SQUARES.length; i++) {
    const piece = game.get(game.SQUARES[i]);
    if (piece && piece.color !== color) {
      const moves = game.moves({ square: game.SQUARES[i], verbose: true });
      if (moves.some(move => move.indexOf(square) !== -1)) {
        attackers.push(piece);
      }
    }
  }
  return attackers;
}

function evaluatePawnStructure(pawnPositions) {
  let score = 0;
  const pawnFiles = {};

  for (const square of pawnPositions) {
    const file = String.fromCharCode('a'.charCodeAt(0) + (square % 8));
    pawnFiles[file] = (pawnFiles[file] || 0) + 1;
  }

  for (const file in pawnFiles) {
    const count = pawnFiles[file];
    if (count === 1) {
      score -= 10; // Isolated pawn penalty
    } else if (count >= 3) {
      score += 10; // Pawn majority bonus
    }
  }

  return score;
}



function evaluatePosition(game) {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
  } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
    return 0;
  }
  
  
  // Evaluate piece values and positions
  let totalScore = 0;
  let whiteKingSquare = null;
  let blackKingSquare = null;
  const whitePawnPositions = [];
  const blackPawnPositions = [];

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const square = game.SQUARES[i*8+j];
      const piece = game.get(square);
      if (piece) {
        let multiplier = piece.color === 'w' ? 1 : -1;
        let rowNum = piece.color === 'w' ? i : 7-i;
        const pieceValue = PIECE_VALUES[piece.type] * multiplier;
        const pieceSquareValue = PIECE_TABLES[piece.type][rowNum][j] * multiplier;
        totalScore += pieceValue + pieceSquareValue;

      // Store king positions
      if (piece.type === 'k') {
        if (piece.color === 'w') {
          whiteKingSquare = square;
        } else {
          blackKingSquare = square;
        }
      }

      // Store pawn positions
      if (piece.type === 'p') {
        if (piece.color === 'w') {
          whitePawnPositions.push(square);
        } else {
          blackPawnPositions.push(square);
        }
      }
      }
    }
  }

  // // King safety calculation
  // const kingAttackers = getAttackingPieces(game, whiteKingSquare, 'b');
  // totalScore -= kingAttackers.length * 10; // Penalty for each attacker on the white king

  // Pawn structure calculation
  const pawnStructureScore = evaluatePawnStructure(whitePawnPositions);
  totalScore += pawnStructureScore;

  return totalScore;
}