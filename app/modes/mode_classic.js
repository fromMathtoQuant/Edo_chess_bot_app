import { resetBoard } from "../core.js";
import { fixCanvasResolution, updateSquareSize, drawBoard, initUI, preloadImages, updateTurnIndicator } from "../ui.js";
import { enableInput } from "../input.js";



export function startMode() {    
    console.log("Modalità CLASSIC avviata");

    // Disattiva il bot per questa modalità
    window.onPlayerMove = null;
    
    resetBoard();
    initUI();

    // Carica immagini PRIMA di disegnare
    preloadImages(() => {
        fixCanvasResolution();
        updateSquareSize();
        
        drawBoard(null, [], false, null, 0, 0);
        enableInput();
        // Aggiorna indicatore al carico
        updateTurnIndicator();
    });
}
