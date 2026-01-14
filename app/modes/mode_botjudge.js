
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
