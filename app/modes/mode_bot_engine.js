
// ===============================
// BOT ENGINE — Valutazione + Ricerca (Negamax con Alpha-Beta)
// ===============================

import { isWhite, basicLegalMove, makeMove, inCheck, cloneBoard } from "../core.js";

// ---------------------------------
// Costanti e valori pezzi
// ---------------------------------
const INF = 1e9;
const MATE = 1e7;
const DRAW = 0;

const PIECE_VALUES = {
  "P": 100, "N": 320, "B": 330, "R": 500, "Q": 900, "K": 0,
  "p": -100, "n": -320, "b": -330, "r": -500, "q": -900, "k": 0,
  // Sentinella neutra: valore 0
};

// ---------------------------------
// Funzioni helper
// ---------------------------------
function makeState(board, turn, enPassant, castling) {
  return { board, turn, enPassant, castling };
}
function switchTurn(t) { return t === "w" ? "b" : "w"; }

function centerBonus(x, y) {
  const d = Math.abs(3.5 - x) + Math.abs(3.5 - y);
  return Math.max(0, 10 - d * 3);
}
function isPromotion(piece, y2) {
  return (piece === "P" && y2 === 0) || (piece === "p" && y2 === 7);
}
function pieceValue(p) {
  return p ? (PIECE_VALUES[p] || 0) : 0;
}

// ---------------------------------
// Generazione mosse legali
// - Sentinella muove sempre
// - Filtra mosse che lasciano il re del lato al move in scacco
// ---------------------------------
function generateLegalMoves(state) {
  const { board, turn, enPassant, castling } = state;
  const moves = [];

  for (let y1 = 0; y1 < 8; y1++) {
    for (let x1 = 0; x1 < 8; x1++) {
      const p = board[y1][x1];
      if (!p) continue;

      const sentinel = (p === "s");
      const pieceIsWhite = isWhite(p);

      if (!sentinel) {
        if ((turn === "w" && !pieceIsWhite) || (turn === "b" && pieceIsWhite)) continue;
      }

      for (let y2 = 0; y2 < 8; y2++) {
        for (let x2 = 0; x2 < 8; x2++) {
          if (x1 === x2 && y1 === y2) continue;

          if (!basicLegalMove(board, p, x1, y1, x2, y2, turn, enPassant, castling, false)) continue;

          const { board: nb, enPassant: newEP, castling: newCastling } =
            makeMove(board, x1, y1, x2, y2, turn, enPassant, castling);

          const movingColor = sentinel ? turn : (pieceIsWhite ? "w" : "b");
          if (inCheck(nb, movingColor, newEP, newCastling)) continue;

          moves.push({
            x1, y1, x2, y2, piece: p,
            captured: board[y2][x2] || null,
            promotion: isPromotion(p, y2)
          });
        }
      }
    }
  }
  return moves;
}

// ---------------------------------
// Ordinamento mosse (MVV-LVA + promozioni + centralità)
// ---------------------------------
function scoreMove(mv) {
  let s = 0;
  if (mv.captured) {
    const victim = Math.abs(pieceValue(mv.captured));
    const attacker = Math.abs(pieceValue(mv.piece));
    s += 10000 + (victim * 10) - attacker;
  }
  if (mv.promotion) s += 5000;
  s += centerBonus(mv.x2, mv.y2);
  return s;
}
function orderMoves(moves) {
  return moves.sort((a, b) => scoreMove(b) - scoreMove(a));
}

// ---------------------------------
// Valutazione posizione
// ---------------------------------
export function evaluate(state) {
  const { board, turn, enPassant, castling } = state;
  let score = 0;

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const p = board[y][x];
      if (!p || p === "s") continue;
      score += pieceValue(p);
      if ("PNBRQpnbrq".includes(p)) {
        const sign = isWhite(p) ? 1 : -1;
        score += sign * (centerBonus(x, y) / 2);
      }
    }
  }

  const ourMoves = generateLegalMoves(state).length;
  const theirMoves = generateLegalMoves(makeState(board, switchTurn(turn), enPassant, castling)).length;
  score += (ourMoves - theirMoves) * 2;

  if (inCheck(board, turn, enPassant, castling)) score -= 15;

  return (turn === "w") ? score : -score;
}

// ---------------------------------
// Applicazione mossa allo stato
// ---------------------------------
function applyMoveToState(state, mv) {
  const { board, enPassant, castling, turn } = state;
  const res = makeMove(board, mv.x1, mv.y1, mv.x2, mv.y2, turn, enPassant, castling);
  return makeState(res.board, switchTurn(turn), res.enPassant, res.castling);
}

// ---------------------------------
// Terminalità (mate/stallo)
// ---------------------------------
function isTerminal(state) {
  const moves = generateLegalMoves(state);
  if (moves.length > 0) return { terminal: false };

  const inChk = inCheck(state.board, state.turn, state.enPassant, state.castling);
  if (inChk) return { terminal: true, score: -MATE };
  return { terminal: true, score: DRAW };
}

// ---------------------------------
// Negamax con Alpha-Beta + timeout
// ---------------------------------
function negamax(state, depth, alpha, beta, ply, stopAt) {
  if (stopAt && Date.now() >= stopAt) {
    return { score: evaluate(state), move: null, cutoff: true };
  }

  const term = isTerminal(state);
  if (term.terminal) {
    return { score: term.score + (term.score < 0 ? ply : -ply), move: null };
  }

  if (depth === 0) return { score: evaluate(state), move: null };

  let bestScore = -INF;
  let bestMove = null;

  let moves = orderMoves(generateLegalMoves(state));

  for (const mv of moves) {
    const child = applyMoveToState(state, mv);
    const res = negamax(child, depth - 1, -beta, -alpha, ply + 1, stopAt);
    const score = -res.score;

    if (score > bestScore) {
      bestScore = score;
      bestMove = mv;
    }
    if (bestScore > alpha) alpha = bestScore;
    if (alpha >= beta) break;

    if (res.cutoff) return { score: bestScore, move: bestMove, cutoff: true };
  }

  return { score: bestScore, move: bestMove };
}

// ---------------------------------
// Scelta best move (iterative deepening)
// ---------------------------------
export function chooseBestMove(rootBoard, rootTurn, rootEnPassant, rootCastling, {
  maxDepth = 4,
  timeMs = 0
} = {}) {
  const rootState = makeState(cloneBoard(rootBoard), rootTurn, rootEnPassant, { ...rootCastling });
  let best = { score: -INF, move: null };
  const stopAt = timeMs > 0 ? Date.now() + timeMs : null;

  for (let depth = 1; depth <= maxDepth; depth++) {
    const res = negamax(rootState, depth, -INF, INF, 0, stopAt);
    if (res.cutoff) break;
    if (res.move) best = res;
    if (Math.abs(res.score) >= MATE - 100) break;
  }
  return best.move;
}

// Wrapper per stato globale
export function chooseBestMoveFromGlobals({ board, turn, enPassantTarget, castlingRights }, opts = {}) {
  return chooseBestMove(board, turn, enPassantTarget, castlingRights, opts);
}
