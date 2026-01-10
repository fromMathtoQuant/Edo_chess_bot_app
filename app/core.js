// ===============================
// CORE — Motore scacchistico puro
// ===============================

// Stato scacchiera
export let board = [
    ["r","n","b","q","k","b","n","r"],
    ["p","p","p","p","p","p","p","p"],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["P","P","P","P","P","P","P","P"],
    ["R","N","B","Q","K","B","N","R"]
];

export let turn = "w";
export let castlingRights = { wK:true, wQ:true, bK:true, bQ:true };
export let enPassantTarget = null;

// Utility
export function isWhite(p) { return p === p.toUpperCase(); }
export function isEnemy(p1, p2) { return p1 && p2 && isWhite(p1) !== isWhite(p2); }
export function inBounds(x, y) { return x >= 0 && x < 8 && y >= 0 && y < 8; }
export function cloneBoard(b) { return b.map(r => r.slice()); }

// Trova il re
export function findKing(b, white) {
    const target = white ? "K" : "k";
    for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++)
            if (b[y][x] === target) return { x, y };
    return null;
}

// Movimento base
export function basicLegalMove(b, piece, x1, y1, x2, y2, turnColor, enPassant, castling, ignoreKingSpecial) {
    if (!inBounds(x2, y2)) return false;
    if (x1 === x2 && y1 === y2) return false;

    const target = b[y2][x2];
    const white = isWhite(piece);

    // Sentinella non può essere catturata
    if (target && target.toLowerCase() === "s") return false;

    // Non puoi catturare pezzi tuoi
    if (target && isWhite(target) === white) return false;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    switch (piece.toLowerCase()) {

        case "s": // SENTINELLA
            if (absDx <= 1 && absDy <= 1) {
                if (target) return false;
                return true;
            }
            return false;

        case "p": {
            const dir = white ? -1 : 1;
            const startRank = white ? 6 : 1;

            if (dx === 0 && dy === dir && !target) return true;

            if (dx === 0 && dy === 2 * dir && y1 === startRank && !target) {
                if (!b[y1 + dir][x1]) return true;
            }

            if (absDx === 1 && dy === dir && target && isEnemy(piece, target)) return true;

            if (absDx === 1 && dy === dir && !target && enPassant) {
                if (enPassant.x === x2 && enPassant.y === y2) return true;
            }

            return false;
        }

        case "n":
            return (absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1);

        case "b":
            if (absDx !== absDy) return false;
            return pathClear(b, x1, y1, x2, y2);

        case "r":
            if (dx !== 0 && dy !== 0) return false;
            return pathClear(b, x1, y1, x2, y2);

        case "q":
            if (dx === 0 || dy === 0 || absDx === absDy)
                return pathClear(b, x1, y1, x2, y2);
            return false;

        case "k":
            if (absDx <= 1 && absDy <= 1) return true;

            if (ignoreKingSpecial) return false;

            const rank = white ? 7 : 0;

            if (y1 === rank && x1 === 4 && y2 === rank) {
                if (x2 === 6) {
                    const key = white ? "wK" : "bK";
                    if (!castling[key]) return false;
                    if (b[rank][5] || b[rank][6]) return false;
                    if (squareAttacked(b, 4, rank, !white, enPassant, castling)) return false;
                    if (squareAttacked(b, 5, rank, !white, enPassant, castling)) return false;
                    if (squareAttacked(b, 6, rank, !white, enPassant, castling)) return false;
                    return true;
                }
                if (x2 === 2) {
                    const key = white ? "wQ" : "bQ";
                    if (!castling[key]) return false;
                    if (b[rank][1] || b[rank][2] || b[rank][3]) return false;
                    if (squareAttacked(b, 4, rank, !white, enPassant, castling)) return false;
                    if (squareAttacked(b, 3, rank, !white, enPassant, castling)) return false;
                    if (squareAttacked(b, 2, rank, !white, enPassant, castling)) return false;
                    return true;
                }
            }

            return false;
    }

    return false;
}

export function pathClear(b, x1, y1, x2, y2) {
    let dx = Math.sign(x2 - x1);
    let dy = Math.sign(y2 - y1);
    let x = x1 + dx;
    let y = y1 + dy;

    while (x !== x2 || y !== y2) {
        if (b[y][x]) {
            if (b[y][x].toLowerCase() === "s") return false;
            return false;
        }
        x += dx;
        y += dy;
    }
    return true;
}

// Casa attaccata
export function squareAttacked(b, x, y, byWhite, enPassant, castling) {
    for (let yy = 0; yy < 8; yy++) {
        for (let xx = 0; xx < 8; xx++) {
            const p = b[yy][xx];
            if (!p) continue;

            if (p.toLowerCase() === "s") continue;

            if (isWhite(p) !== byWhite) continue;

            if (basicLegalMove(b, p, xx, yy, x, y, byWhite ? "w" : "b", enPassant, castling, true)) {
                return true;
            }
        }
    }
    return false;
}

// Re in scacco
export function inCheck(b, color, enPassant, castling) {
    const white = color === "w";
    const k = findKing(b, white);
    if (!k) return false;
    return squareAttacked(b, k.x, k.y, !white, enPassant, castling);
}

// Simula mossa
export function makeMove(b, x1, y1, x2, y2, turnColor, enPassant, castling) {
    const newBoard = cloneBoard(b);
    const piece = newBoard[y1][x1];
    const white = isWhite(piece);

    let newEnPassant = null;
    let newCastling = { ...castling };

    if (b[y2][x2] && b[y2][x2].toLowerCase() === "s") {
        return { board: b, enPassant, castling };
    }
    
    // EN PASSANT
    if (piece.toLowerCase() === "p" && enPassant && x2 === enPassant.x && y2 === enPassant.y) {
        const dir = white ? 1 : -1;
        newBoard[y2 + dir][x2] = "";
    }
    
    // Sposta pezzo
    newBoard[y1][x1] = "";
    newBoard[y2][x2] = piece;

    // PROMOZIONE AUTOMATICA A DONNA
    if (piece.toLowerCase() === "p") {
        if (white && y2 === 0) newBoard[y2][x2] = "Q";
        if (!white && y2 === 7) newBoard[y2][x2] = "q";

        const startRank = white ? 6 : 1;
        const dir = white ? -1 : 1;

        if (y1 === startRank && y2 === y1 + 2 * dir) {
            newEnPassant = { x: x1, y: y1 + dir };
        }
    }

    
    // ARROCCO
    if (piece === "K") {
        newCastling.wK = false;
        newCastling.wQ = false;

        if (x1 === 4 && y1 === 7 && x2 === 6) {
            newBoard[7][5] = newBoard[7][7];
            newBoard[7][7] = "";
        }
        if (x1 === 4 && y1 === 7 && x2 === 2) {
            newBoard[7][3] = newBoard[7][0];
            newBoard[7][0] = "";
        }
    }

    if (piece === "k") {
        newCastling.bK = false;
        newCastling.bQ = false;

        if (x1 === 4 && y1 === 0 && x2 === 6) {
            newBoard[0][5] = newBoard[0][7];
            newBoard[0][7] = "";
        }
        if (x1 === 4 && y1 === 0 && x2 === 2) {
            newBoard[0][3] = newBoard[0][0];
            newBoard[0][0] = "";
        }
    }

    // Torri che si muovono
    if (piece === "R") {
        if (x1 === 0 && y1 === 7) newCastling.wQ = false;
        if (x1 === 7 && y1 === 7) newCastling.wK = false;
    }
    if (piece === "r") {
        if (x1 === 0 && y1 === 0) newCastling.bQ = false;
        if (x1 === 7 && y1 === 0) newCastling.bK = false;
    }

    // Torri catturate
    const captured = b[y2][x2];
    if (captured === "R") {
        if (x2 === 0 && y2 === 7) newCastling.wQ = false;
        if (x2 === 7 && y2 === 7) newCastling.wK = false;
    }
    if (captured === "r") {
        if (x2 === 0 && y2 === 0) newCastling.bQ = false;
        if (x2 === 7 && y2 === 0) newCastling.bK = false;
    }

    
    return { board: newBoard, enPassant: newEnPassant, castling: newCastling };
}

// Mossa reale
export function applyMove(x1, y1, x2, y2) {
    const piece = board[y1][x1];
    const color = isWhite(piece) ? "w" : "b";

    const result = makeMove(board, x1, y1, x2, y2, color, enPassantTarget, castlingRights);

    board = result.board;
    enPassantTarget = result.enPassant;
    castlingRights = result.castling;

    turn = turn === "w" ? "b" : "w";
}

// Mosse legali
export function getLegalMoves(x1, y1) {
    const piece = board[y1][x1];
    if (!piece) return [];

    const color = isWhite(piece) ? "w" : "b";
    if (color !== turn) return [];

    const moves = [];

    for (let y2 = 0; y2 < 8; y2++) {
        for (let x2 = 0; x2 < 8; x2++) {
            if (isLegalMove(piece, x1, y1, x2, y2)) {
                moves.push({ x: x2, y: y2 });
            }
        }
    }

    return moves;
}

export function isLegalMove(piece, x1, y1, x2, y2) {
    if (!piece) return false;

    const color = isWhite(piece) ? "w" : "b";
    if (color !== turn) return false;

    if (!basicLegalMove(board, piece, x1, y1, x2, y2, color, enPassantTarget, castlingRights, false)) {
        return false;
    }

    const { board: newBoard, enPassant: newEP, castling: newCastling } =
        makeMove(board, x1, y1, x2, y2, color, enPassantTarget, castlingRights);

    if (inCheck(newBoard, color, newEP, newCastling)) {
        return false;
    }

    return true;
}

export function hasAnyLegalMove(color) {
    for (let y1 = 0; y1 < 8; y1++) {
        for (let x1 = 0; x1 < 8; x1++) {
            const piece = board[y1][x1];
            if (!piece) continue;
            if (isWhite(piece) !== (color === "w")) continue;

            const moves = getLegalMoves(x1, y1);
            if (moves.length > 0) return true;
        }
    }
    return false;
}

// Reset board
export function resetBoard() {
    board = [
        ["r","n","b","q","k","b","n","r"],
        ["p","p","p","p","p","p","p","p"],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["P","P","P","P","P","P","P","P"],
        ["R","N","B","Q","K","B","N","R"]
    ];

    turn = "w";
    enPassantTarget = null;
    castlingRights = { wK:true, wQ:true, bK:true, bQ:true };
}
