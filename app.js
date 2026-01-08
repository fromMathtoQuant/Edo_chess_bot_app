const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const boardSize = 8;
canvas.width = 480;
canvas.height = 480;
const size = canvas.width / boardSize;

// Stato di gioco
let board = [
    ["r","n","b","q","k","b","n","r"],
    ["p","p","p","p","p","p","p","p"],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["P","P","P","P","P","P","P","P"],
    ["R","N","B","Q","K","B","N","R"]
];

let turn = "w"; // "w" o "b"
let selected = null; // {x,y}
let legalMoves = []; // [{x,y}]
let dragging = false;
let dragPiece = null;
let dragX = 0;
let dragY = 0;

// diritti di arrocco
let castlingRights = {
    wK: true, // bianco lato re
    wQ: true, // bianco lato donna
    bK: true,
    bQ: true
};

// en passant target: {x,y} dove un pedone può catturare en passant
let enPassantTarget = null;

// immagini pezzi
const pieces = {
    "r": "pieces/bR.png",
    "n": "pieces/bN.png",
    "b": "pieces/bB.png",
    "q": "pieces/bQ.png",
    "k": "pieces/bK.png",
    "p": "pieces/bP.png",
    "R": "pieces/wR.png",
    "N": "pieces/wN.png",
    "B": "pieces/wB.png",
    "Q": "pieces/wQ.png",
    "K": "pieces/wK.png",
    "P": "pieces/wP.png"
};

// cache immagini per evitare flicker
const imageCache = {};
for (let key in pieces) {
    const img = new Image();
    img.src = pieces[key];
    imageCache[key] = img;
}

function isWhite(p) {
    return p === p.toUpperCase();
}

function isEnemy(p1, p2) {
    if (!p1 || !p2) return false;
    return isWhite(p1) !== isWhite(p2);
}

function inBounds(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}

// Trova la posizione del re di un certo colore
function findKing(b, white) {
    const target = white ? "K" : "k";
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (b[y][x] === target) return { x, y };
        }
    }
    return null;
}

// Controlla se una casa è attaccata da un colore
function squareAttacked(b, x, y, byWhite, enPassant, castling) {
    for (let yy = 0; yy < 8; yy++) {
        for (let xx = 0; xx < 8; xx++) {
            const p = b[yy][xx];
            if (!p) continue;
            if (isWhite(p) !== byWhite) continue;
            if (basicLegalMove(b, p, xx, yy, x, y, byWhite ? "w" : "b", enPassant, castling, true)) {
                return true;
            }
        }
    }
    return false;
}

// Clona la board
function cloneBoard(b) {
    return b.map(row => row.slice());
}

// Mossa base pezzo (non controlla scacco al re)
// ignoreSpecialKing: se true, il re non considera arrocco (utile per squareAttacked)
function basicLegalMove(b, piece, x1, y1, x2, y2, turnColor, enPassant, castling, ignoreSpecialKing) {
    if (x1 === x2 && y1 === y2) return false;
    if (!inBounds(x2, y2)) return false;

    const target = b[y2][x2];
    const white = isWhite(piece);

    // non mangiare pezzo stesso colore
    if (target && isWhite(target) === white) return false;

    const dx = x2 - x1;
    const dy = y2 - y1;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    switch (piece.toLowerCase()) {
        case "p": {
            const dir = white ? -1 : 1;
            const startRank = white ? 6 : 1;

            // movimento semplice
            if (dx === 0 && dy === dir && !target) return true;

            // doppio passo dalla posizione iniziale
            if (dx === 0 && dy === 2 * dir && y1 === startRank && !target) {
                const midY = y1 + dir;
                if (!b[midY][x1] && !b[y2][x2]) return true;
            }

            // cattura normale
            if (absDx === 1 && dy === dir && target && isEnemy(piece, target)) {
                return true;
            }

            // en passant
            if (absDx === 1 && dy === dir && !target && enPassant) {
                if (enPassant.x === x2 && enPassant.y === y2) {
                    return true;
                }
            }

            return false;
        }
        case "n": {
            return (absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1);
        }
        case "b": {
            if (absDx !== absDy) return false;
            return pathClear(b, x1, y1, x2, y2);
        }
        case "r": {
            if (dx !== 0 && dy !== 0) return false;
            return pathClear(b, x1, y1, x2, y2);
        }
        case "q": {
            if (dx === 0 || dy === 0 || absDx === absDy) {
                return pathClear(b, x1, y1, x2, y2);
            }
            return false;
        }
        case "k": {
            // movimento normale di un passo
            if (absDx <= 1 && absDy <= 1) return true;

            if (ignoreSpecialKing) return false;

            // arrocco
            // bianco: e1 (4,7) -> g1 (6,7) o c1 (2,7)
            // nero: e8 (4,0) -> g8 (6,0) o c8 (2,0)
            const rank = white ? 7 : 0;
            const kingStartX = 4;
            if (y1 === rank && x1 === kingStartX && y2 === rank) {
                // lato re
                if (x2 === 6) {
                    const rightKey = white ? "wK" : "bK";
                    if (!castling[rightKey]) return false;
                    if (b[rank][5] || b[rank][6]) return false;
                    // re non in scacco e non passa su case attaccate
                    if (squareAttacked(b, 4, rank, !white, enPassant, castling)) return false;
                    if (squareAttacked(b, 5, rank, !white, enPassant, castling)) return false;
                    if (squareAttacked(b, 6, rank, !white, enPassant, castling)) return false;
                    const rook = b[rank][7];
                    if (!rook || rook.toLowerCase() !== "r" || isWhite(rook) !== white) return false;
                    return true;
                }
                // lato donna
                if (x2 === 2) {
                    const leftKey = white ? "wQ" : "bQ";
                    if (!castling[leftKey]) return false;
                    if (b[rank][1] || b[rank][2] || b[rank][3]) return false;
                    if (squareAttacked(b, 4, rank, !white, enPassant, castling)) return false;
                    if (squareAttacked(b, 3, rank, !white, enPassant, castling)) return false;
                    if (squareAttacked(b, 2, rank, !white, enPassant, castling)) return false;
                    const rook = b[rank][0];
                    if (!rook || rook.toLowerCase() !== "r" || isWhite(rook) !== white) return false;
                    return true;
                }
            }

            return false;
        }
    }

    return false;
}

function pathClear(b, x1, y1, x2, y2) {
    let dx = Math.sign(x2 - x1);
    let dy = Math.sign(y2 - y1);
    let x = x1 + dx;
    let y = y1 + dy;
    while (x !== x2 || y !== y2) {
        if (b[y][x]) return false;
        x += dx;
        y += dy;
    }
    return true;
}

// Controlla se il re del colore specificato è in scacco
function inCheck(b, color, enPassant, castling) {
    const white = color === "w";
    const kingPos = findKing(b, white);
    if (!kingPos) return false;
    return squareAttacked(b, kingPos.x, kingPos.y, !white, enPassant, castling);
}

// Applica una mossa a una board clonata, restituisce nuovo stato
function makeMove(b, x1, y1, x2, y2, turnColor, enPassant, castling) {
    const newBoard = cloneBoard(b);
    const piece = newBoard[y1][x1];
    const white = isWhite(piece);
    const enemyColor = white ? "b" : "w";

    let newEnPassant = null;
    let newCastling = { ...castling };

    // en passant: se pedone cattura sulla casa enPassant
    if (piece.toLowerCase() === "p" && enPassant && x2 === enPassant.x && y2 === enPassant.y) {
        // rimuovi il pedone catturato
        const dir = white ? 1 : -1; // il pedone mangiato è dietro
        newBoard[y2 + dir][x2] = "";
    }

    // sposta pezzo
    newBoard[y1][x1] = "";
    newBoard[y2][x2] = piece;

    // promozione automatica a donna
    if (piece.toLowerCase() === "p") {
        if (white && y2 === 0) newBoard[y2][x2] = "Q";
        if (!white && y2 === 7) newBoard[y2][x2] = "q";

        // nuovo enPassant dopo doppio passo
        const startRank = white ? 6 : 1;
        const dir = white ? -1 : 1;
        if (y1 === startRank && y2 === y1 + 2 * dir) {
            newEnPassant = { x: x1, y: y1 + dir };
        }
    }

    // aggiorna diritti arrocco se re o torre si muovono o vengono catturati
    if (piece === "K") {
        newCastling.wK = false;
        newCastling.wQ = false;
        // arrocco eseguito: sposta torre
        if (x1 === 4 && y1 === 7 && x2 === 6 && y2 === 7) {
            // lato re
            newBoard[7][5] = newBoard[7][7];
            newBoard[7][7] = "";
        } else if (x1 === 4 && y1 === 7 && x2 === 2 && y2 === 7) {
            // lato donna
            newBoard[7][3] = newBoard[7][0];
            newBoard[7][0] = "";
        }
    }
    if (piece === "k") {
        newCastling.bK = false;
        newCastling.bQ = false;
        if (x1 === 4 && y1 === 0 && x2 === 6 && y2 === 0) {
            newBoard[0][5] = newBoard[0][7];
            newBoard[0][7] = "";
        } else if (x1 === 4 && y1 === 0 && x2 === 2 && y2 === 0) {
            newBoard[0][3] = newBoard[0][0];
            newBoard[0][0] = "";
        }
    }

    // torri che si muovono
    if (piece === "R") {
        if (x1 === 0 && y1 === 7) newCastling.wQ = false;
        if (x1 === 7 && y1 === 7) newCastling.wK = false;
    }
    if (piece === "r") {
        if (x1 === 0 && y1 === 0) newCastling.bQ = false;
        if (x1 === 7 && y1 === 0) newCastling.bK = false;
    }

    // se una torre viene catturata
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

// verifica mossa legale completa (incluso non lasciare il re in scacco)
function isLegalMove(piece, x1, y1, x2, y2) {
    if (!piece) return false;
    const color = isWhite(piece) ? "w" : "b";
    if (color !== turn) return false;

    if (!basicLegalMove(board, piece, x1, y1, x2, y2, color, enPassantTarget, castlingRights, false)) {
        return false;
    }

    // Simula la mossa e controlla se il re rimane in scacco
    const { board: newBoard, enPassant: newEP, castling: newCastling } =
        makeMove(board, x1, y1, x2, y2, color, enPassantTarget, castlingRights);

    if (inCheck(newBoard, color, newEP, newCastling)) {
        return false;
    }

    return true;
}

// tutte le mosse legali da una casa
function getLegalMoves(x1, y1) {
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

// Applica veramente la mossa (dopo che è stata verificata)
function applyMove(x1, y1, x2, y2) {
    const piece = board[y1][x1];
    const color = isWhite(piece) ? "w" : "b";

    const result = makeMove(board, x1, y1, x2, y2, color, enPassantTarget, castlingRights);
    board = result.board;
    enPassantTarget = result.enPassant;
    castlingRights = result.castling;

    // cambia turno
    turn = turn === "w" ? "b" : "w";
}

// Disegna la scacchiera
function drawBoard() {
    const whiteInCheck = inCheck(board, "w", enPassantTarget, castlingRights);
    const blackInCheck = inCheck(board, "b", enPassantTarget, castlingRights);

    // prima riempi sfondo
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            // colore base casella
            ctx.fillStyle = (x + y) % 2 === 0 ? "#f0d9b5" : "#b58863";
            ctx.fillRect(x * size, y * size, size, size);
        }
    }

    // evidenzia casella selezionata
    if (selected) {
        ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
        ctx.fillRect(selected.x * size, selected.y * size, size, size);
    }

    // evidenzia mosse legali
    for (let m of legalMoves) {
        const hasPiece = board[m.y][m.x] !== "";
        ctx.fillStyle = hasPiece ? "rgba(255,0,0,0.4)" : "rgba(0,255,0,0.4)";
        ctx.fillRect(m.x * size, m.y * size, size, size);
    }

    // evidenzia re in scacco
    if (whiteInCheck) {
        const k = findKing(board, true);
        if (k) {
            ctx.fillStyle = "rgba(255,0,0,0.5)";
            ctx.fillRect(k.x * size, k.y * size, size, size);
        }
    }
    if (blackInCheck) {
        const k = findKing(board, false);
        if (k) {
            ctx.fillStyle = "rgba(255,0,0,0.5)";
            ctx.fillRect(k.x * size, k.y * size, size, size);
        }
    }

    // disegna pezzi (tranne il pezzo in drag)
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            let piece = board[y][x];
            if (!piece) continue;

            if (dragging && dragPiece === piece && selected && selected.x === x && selected.y === y) {
                continue;
            }

            const img = imageCache[piece];
            if (img && img.complete) {
                ctx.drawImage(img, x * size, y * size, size, size);
            } else if (img) {
                img.onload = () => {
                    ctx.drawImage(img, x * size, y * size, size, size);
                };
            }
        }
    }

    // disegna pezzo trascinato
    if (dragging && dragPiece) {
        const img = imageCache[dragPiece];
        if (img && img.complete) {
            ctx.drawImage(img, dragX - size / 2, dragY - size / 2, size, size);
        } else if (img) {
            img.onload = () => {
                ctx.drawImage(img, dragX - size / 2, dragY - size / 2, size, size);
            };
        }
    }
}

// ----------------------
// INPUT: MOUSE
// ----------------------

canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / size);
    const y = Math.floor((e.clientY - rect.top) / size);

    if (!inBounds(x, y)) return;

    const piece = board[y][x];
    if (!piece || isWhite(piece) !== (turn === "w")) {
        // clic su casa vuota o pezzo avversario:
        // se c'era già un pezzo selezionato, proviamo a muovere lì
        if (selected) {
            tryMove(selected.x, selected.y, x, y);
        }
        return;
    }

    selected = { x, y };
    legalMoves = getLegalMoves(x, y);
    dragging = true;
    dragPiece = piece;
    dragX = e.clientX - rect.left;
    dragY = e.clientY - rect.top;

    drawBoard();
});

canvas.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    dragX = e.clientX - rect.left;
    dragY = e.clientY - rect.top;
    drawBoard();
});

canvas.addEventListener("mouseup", (e) => {
    if (!dragging || !selected) return;
    const rect = canvas.getBoundingClientRect();
    const x2 = Math.floor((e.clientX - rect.left) / size);
    const y2 = Math.floor((e.clientY - rect.top) / size);

    tryMove(selected.x, selected.y, x2, y2);
});

// ----------------------
// INPUT: TOUCH
// ----------------------

canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    const x = Math.floor((touch.clientX - rect.left) / size);
    const y = Math.floor((touch.clientY - rect.top) / size);

    if (!inBounds(x, y)) return;

    const piece = board[y][x];
    if (!piece || isWhite(piece) !== (turn === "w")) {
        if (selected) {
            tryMove(selected.x, selected.y, x, y);
        }
        return;
    }

    selected = { x, y };
    legalMoves = getLegalMoves(x, y);
    dragging = true;
    dragPiece = piece;
    dragX = touch.clientX - rect.left;
    dragY = touch.clientY - rect.top;

    drawBoard();
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    dragX = touch.clientX - rect.left;
    dragY = touch.clientY - rect.top;

    drawBoard();
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (!dragging || !selected) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];

    const x2 = Math.floor((touch.clientX - rect.left) / size);
    const y2 = Math.floor((touch.clientY - rect.top) / size);

    tryMove(selected.x, selected.y, x2, y2);
}, { passive: false });

// Prova a effettuare una mossa da (x1,y1) a (x2,y2)
function tryMove(x1, y1, x2, y2) {
    const piece = board[y1][x1];
    dragging = false;
    dragPiece = null;

    if (inBounds(x2, y2) && isLegalMove(piece, x1, y1, x2, y2)) {
        applyMove(x1, y1, x2, y2);
    }

    selected = null;
    legalMoves = [];
    drawBoard();
}

drawBoard();
