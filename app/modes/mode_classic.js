import { resetBoard } from "../core.js";
import { fixCanvasResolution, updateSquareSize, drawBoard, initUI, preloadImages } from "../ui.js";
import { enableInput } from "../input.js";

export function startMode() {    
    console.log("Modalità CLASSIC avviata");

    resetBoard();
    initUI();
    fixCanvasResolution();
    updateSquareSize();

    // Carica immagini PRIMA di disegnare
    preloadImages(() => {
        drawBoard(null, [], false, null, 0, 0);
        enableInput();
        document.getElementById("turnIndicator").textContent = "Tocca al Bianco";
    });
}
