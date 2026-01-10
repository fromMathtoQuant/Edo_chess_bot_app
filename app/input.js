// ===============================
// INPUT — Mouse + Touch
// ===============================

import { board, turn, isWhite, inBounds, getLegalMoves, applyMove, hasAnyLegalMove, inCheck } from "./core.js";
import { canvas, size, drawBoard } from "./ui.js";

export let selected = null;
export let legalMoves = [];
export let dragging = false;
export let dragPiece = null;
export let dragX = 0;
export let dragY = 0;

export function enableInput() {
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
}

export function disableInput() {
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mouseup", onMouseUp);

    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchmove", onTouchMove);
    canvas.removeEventListener("touchend", onTouchEnd);
}

function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / size);
    const y = Math.floor((e.clientY - rect.top) / size);

    handleSelectOrMove(x, y);

    dragX = e.clientX - rect.left;
    dragY = e.clientY - rect.top;

    drawBoard(selected, legalMoves, dragging, dragPiece, dragX, dragY);
}

function onMouseMove(e) {
    if (!dragging) return;

    const rect = canvas.getBoundingClientRect();
    dragX = e.clientX - rect.left;
    dragY = e.clientY - rect.top;

    drawBoard(selected, legalMoves, dragging, dragPiece, dragX, dragY);
}

function onMouseUp(e) {
    if (!dragging || !selected) return;

    const rect = canvas.getBoundingClientRect();
    const x2 = Math.floor((e.clientX - rect.left) / size);
    const y2 = Math.floor((e.clientY - rect.top) / size);

    tryMove(selected.x, selected.y, x2, y2);
}

function onTouchStart(e) {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    const x = Math.floor((touch.clientX - rect.left) / size);
    const y = Math.floor((touch.clientY - rect.top) / size);

    handleSelectOrMove(x, y);

    dragX = touch.clientX - rect.left;
    dragY = touch.clientY - rect.top;

    drawBoard(selected, legalMoves, dragging, dragPiece, dragX, dragY);
}

function onTouchMove(e) {
    e.preventDefault();
    if (!dragging) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    dragX = touch.clientX - rect.left;
    dragY = touch.clientY - rect.top;

    drawBoard(selected, legalMoves, dragging, dragPiece, dragX, dragY);
}

function onTouchEnd(e) {
    e.preventDefault();
    if (!dragging || !selected) return;

    const x2 = Math.floor(dragX / size);
    const y2 = Math.floor(dragY / size);

    tryMove(selected.x, selected.y, x2, y2);
}

function handleSelectOrMove(x, y) {
    if (!inBounds(x, y)) return;

    const piece = board[y][x];

    if (!piece || isWhite(piece) !== (turn === "w")) {
        if (selected) tryMove(selected.x, selected.y, x, y);
        return;
    }

    selected = { x, y };
    legalMoves = getLegalMoves(x, y);

    dragging = true;
    dragPiece = piece;
}

export function tryMove(x1, y1, x2, y2) {
    dragging = false;
    dragPiece = null;

    const moves = getLegalMoves(x1, y1);
    const isLegal = moves.some(m => m.x === x2 && m.y === y2);

    if (isLegal) {
        applyMove(x1, y1, x2, y2);

        const enemy = turn;

        if (inCheck(board, enemy) && !hasAnyLegalMove(enemy)) {
            setTimeout(() => {
                alert("SCACCO MATTERELLO!\nFine partita.");
                document.getElementById("gameUI").style.display = "none";
                document.getElementById("startMenu").style.display = "flex";
            }, 200);
        }

        // 🔥 IMPORTANTE: notifica bot o giudice
        if (window.onPlayerMove) window.onPlayerMove();
    }

    selected = null;
    legalMoves = [];

    drawBoard(selected, legalMoves, dragging, dragPiece, dragX, dragY);
}


document.getElementById("turnIndicator").textContent =
turn === "w" ? "Tocca al Bianco" : "Tocca al Nero";

