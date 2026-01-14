
// ===============================
// MODE BOT — Giocatore vs Bot
// ===============================

import { resetBoard, board, turn, enPassantTarget, castlingRights, applyMove } from "../core.js";
import { enableInput, disableInput } from "../input.js";
import { drawBoard, updateTurnIndicator, preloadImages, initUI, fixCanvasResolution, updateSquareSize } from "../ui.js";

// Importiamo la logica del bot (evaluation + search)
import { chooseBestMoveFromGlobals } from "./mode_bot_engine.js"; // separiamo engine per pulizia

export function startMode() {

    // Attiva stile dedicato alla modalità Bot
    const gameUI = document.getElementById("gameUI");
    gameUI.classList.add("bot-mode");
    
    // Mostra UI di gioco
    document.getElementById("startMenu").style.display = "none";
    document.getElementById("gameUI").style.display = "flex";

    // Reset scacchiera
    resetBoard();
    // Inserisci Sentinella
    // Scegli una casella casuale tra le quattro centrali e inserisci la Sentinella
    const centers = [
       { x: 3, y: 3 }, // d4 (in notazione classica)
       { x: 4, y: 3 }, // e4
       { x: 3, y: 4 }, // d5
       { x: 4, y: 4 }  // e5
    ];
    const pick = centers[Math.floor(Math.random() * centers.length)];

    // Inserisci la Sentinella.
    board[pick.y][pick.x] = "s";

    // Inizializza UI
    initUI();
    fixCanvasResolution();
    updateSquareSize();

    preloadImages(() => {
        drawBoard(null, [], false, null, 0, 0);
    });

    // Abilita input utente
    enableInput();

    // Configura il bot
    const BOT_COLOR = "b"; // Bot gioca Nero

    // Callback dopo ogni mossa del giocatore
    window.onPlayerMove = function () {
        if (turn === BOT_COLOR) {
            // Calcola la mossa migliore
            const mv = chooseBestMoveFromGlobals({ board, turn, enPassantTarget, castlingRights }, { maxDepth: 4, timeMs: 1500 });
            if (mv) {
                applyMove(mv.x1, mv.y1, mv.x2, mv.y2);
                drawBoard(null, [], false, null, 0, 0);
            }
        }
    };
}
