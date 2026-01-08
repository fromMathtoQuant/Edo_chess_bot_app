const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const size = 60;
const boardSize = 8;

let selected = null;
let turn = "w";

const pieces = {
    "r": "pieces/br.png",
    "n": "pieces/bn.png",
    "b": "pieces/bb.png",
    "q": "pieces/bq.png",
    "k": "pieces/bk.png",
    "p": "pieces/bp.png",
    "R": "pieces/wr.png",
    "N": "pieces/wn.png",
    "B": "pieces/wb.png",
    "Q": "pieces/wq.png",
    "K": "pieces/wk.png",
    "P": "pieces/wp.png"
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
    if (x1 === x2 && y1 === y2) return;

    let piece = board[y1][x1];
    board[y1][x1] = "";
    board[y2][x2] = piece;

    turn = turn === "w" ? "b" : "w";
}

function isWhite(p) {
    return p === p.toUpperCase();
}

drawBoard();

// Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}