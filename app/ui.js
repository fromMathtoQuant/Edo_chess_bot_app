// ===============================
// UI — Disegno canvas
// ===============================

import { board, enPassantTarget, castlingRights, findKing, inCheck } from "./core.js";

export let canvas = null;
export let ctx = null;


export function initUI() {
    canvas = document.getElementById("board");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
}

export function fixCanvasResolution() {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    ctx.scale(ratio, ratio);
}

export let size = 0;
export function updateSquareSize() {
    const rect = canvas.getBoundingClientRect();
    size = rect.width / 8;
}

// Cache immagini
const pieces = {
  "r": "app/pieces/bR.png",
  "n": "app/pieces/bN.png",
  "b": "app/pieces/bB.png",
  "q": "app/pieces/bQ.png",
  "k": "app/pieces/bK.png",
  "p": "app/pieces/bP.png",
  "R": "app/pieces/wR.png",
  "N": "app/pieces/wN.png",
  "B": "app/pieces/wB.png",
  "Q": "app/pieces/wQ.png",
  "K": "app/pieces/wK.png",
  "P": "app/pieces/wP.png",
  "S": "app/pieces/sentinel.png",
  "s": "app/pieces/sentinel.png" 
};


const imageCache = {};
for (let key in pieces) {
    const img = new Image();
    img.src = pieces[key];
    img.decoding = "async";
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
