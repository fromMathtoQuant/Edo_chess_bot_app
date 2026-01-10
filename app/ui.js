// ===============================
// UI — Disegno canvas
// ===============================

import { board, findKing, inCheck } from "./core.js";

export let canvas = null;
export let ctx = null;


export function initUI() {
    canvas = document.getElementById("board");
    ctx = canvas.getContext("2d");
}

export function fixCanvasResolution() {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    ctx.scale(ratio, ratio);
}

export function updateSquareSize() {
    const rect = canvas.getBoundingClientRect();
    size = rect.width / 8;
}

export let size = 0;

// Stato iniziale della scacchiera
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


// Cache immagini
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
    "P": "pieces/wP.png",
    "S": "pieces/sentinel.png"
};

const imageCache = {};
for (let key in pieces) {
    const img = new Image();
    img.src = pieces[key];
    img.decoding = "async";
    img.loading = "eager";
    imageCache[key] = img;
}

export function preloadImages(callback) {
    let loaded = 0;
    const total = Object.keys(imageCache).length;

    for (let key in imageCache) {
        const img = imageCache[key];

        if (img.complete) {
            loaded++;
            if (loaded === total) callback();
            continue;
        }

        img.onload = () => {
            loaded++;
            if (loaded === total) callback();
        };

        img.onerror = () => {
            console.warn("Errore nel caricare l'immagine:", pieces[key]);
            loaded++;
            if (loaded === total) callback();
        };
    }
}


export function drawBoard(selected, legalMoves, dragging, dragPiece, dragX, dragY) {
    const whiteInCheck = inCheck(board, "w", enPassantTarget, castlingRights);
    const blackInCheck = inCheck(board, "b", enPassantTarget, castlingRights);

    // Sfondo
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? "#f0d9b5" : "#b58863";
            ctx.fillRect(x * size, y * size, size, size);
        }
    }

    // Casella selezionata
    if (selected) {
        ctx.fillStyle = "rgba(255,255,0,0.5)";
        ctx.fillRect(selected.x * size, selected.y * size, size, size);
    }

    // Mosse legali
    for (let m of legalMoves) {
        ctx.fillStyle = board[m.y][m.x] ? "rgba(255,0,0,0.4)" : "rgba(0,255,0,0.4)";
        ctx.fillRect(m.x * size, m.y * size, size, size);
    }

    // Re in scacco
    if (whiteInCheck) {
        const k = findKing(board, true);
        ctx.fillStyle = "rgba(255,0,0,0.5)";
        ctx.fillRect(k.x * size, k.y * size, size, size);
    }
    if (blackInCheck) {
        const k = findKing(board, false);
        ctx.fillStyle = "rgba(255,0,0,0.5)";
        ctx.fillRect(k.x * size, k.y * size, size, size);
    }

    // Disegna pezzi (tranne quello trascinato)
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const piece = board[y][x];
            if (!piece) continue;

            if (dragging && dragPiece === piece && selected &&
                selected.x === x && selected.y === y) continue;

            const img = imageCache[piece];
            
            if (img.complete) {
                ctx.drawImage(img, x * size, y * size, size, size);
            }
        }
    }

    // Pezzo trascinato
    if (dragging && dragPiece) {
        const img = imageCache[dragPiece];
        if (img.complete) {
            ctx.drawImage(img, dragX - size / 2, dragY - size / 2, size, size);
        }
    }
}
