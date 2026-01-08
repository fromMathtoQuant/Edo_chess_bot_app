const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const boardSize = 8;
canvas.width = 480;
canvas.height = 480;
const size = canvas.width / boardSize; // 480 / 8 = 60

let selected = null;
let turn = "w";

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

function drawBoard() {
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? "#f0d9b5" : "#b58863";
            ctx.fillRect(x * size, y * size, size, size);

            let piece = board[y][x];
            if (piece) {
                let img = new Image();
                img.src = pieces[piece];
                img.onload = () => {
                    ctx.drawImage(img, x * size, y * size, size, size);
                };
            }
        }
    }
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / size);
    const y = Math.floor((e.clientY - rect.top) / size);

    if (!selected) {
        if (board[y][x] && isWhite(board[y][x]) === (turn === "w")) {
            selected = { x, y };
        }
    } else {
        movePiece(selected.x, selected.y, x, y);
        selected = null;
    }

    drawBoard();
});
function movePiece(x1, y1, x2, y2) {
    let piece = board[y1][x1];
    if (!piece) return;

    // controllo colore turno
    if (isWhite(piece) !== (turn === "w")) return;

    // controllo mossa legale
    if (!isLegalMove(piece, x1, y1, x2, y2)) return;

    // impedisce di mangiare un pezzo dello stesso colore
    if (board[y2][x2] && isWhite(board[y2][x2]) === isWhite(piece)) return;

    // esegui mossa
    board[y1][x1] = "";
    board[y2][x2] = piece;

    // cambio turno
    turn = turn === "w" ? "b" : "w";
}

function isLegalMove(piece, x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;

    switch (piece.toLowerCase()) {

        case "p": // pedone
            let dir = isWhite(piece) ? -1 : 1;

            // movimento semplice
            if (dx === 0 && dy === dir && board[y2][x2] === "") return true;

            // prima mossa: due passi
            if (dx === 0 && dy === 2 * dir && board[y1 + dir][x1] === "" && board[y2][x2] === "") {
                if ((isWhite(piece) && y1 === 6) || (!isWhite(piece) && y1 === 1)) return true;
            }

            // cattura
            if (Math.abs(dx) === 1 && dy === dir && board[y2][x2] !== "" && isWhite(board[y2][x2]) !== isWhite(piece)) {
                return true;
            }

            return false;

        case "r": // torre
            if (dx !== 0 && dy !== 0) return false;
            return pathClear(x1, y1, x2, y2);

        case "b": // alfiere
            if (Math.abs(dx) !== Math.abs(dy)) return false;
            return pathClear(x1, y1, x2, y2);

        case "q": // regina
            if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
                return pathClear(x1, y1, x2, y2);
            }
            return false;

        case "n": // cavallo
            return (Math.abs(dx) === 1 && Math.abs(dy) === 2) ||
                   (Math.abs(dx) === 2 && Math.abs(dy) === 1);

        case "k": // re
            return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    }

    return false;
}

function pathClear(x1, y1, x2, y2) {
    let dx = Math.sign(x2 - x1);
    let dy = Math.sign(y2 - y1);

    let x = x1 + dx;
    let y = y1 + dy;

    while (x !== x2 || y !== y2) {
        if (board[y][x] !== "") return false;
        x += dx;
        y += dy;
    }
    return true;
}
function isWhite(p) {
    return p === p.toUpperCase();
}

drawBoard();

// Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");

}




