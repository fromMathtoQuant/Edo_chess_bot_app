import { resetBoard } from "../core.js";
import { fixCanvasResolution, updateSquareSize, drawBoard, initUI } from "../ui.js";
import { enableInput } from "../input.js";

export function startMode() {    
    console.log("Modalità CLASSIC avviata");

    resetBoard();
    initUI();
    fixCanvasResolution();
    updateSquareSize();

    enableInput();

    // Disegna solo quando tutto è pronto
    drawBoard(null, [], false, null, 0, 0);

    // Ridisegna se cambia la dimensione del canvas
    window.addEventListener("resize", () => {
        fixCanvasResolution();
        updateSquareSize();
        drawBoard(null, [], false, null, 0, 0);
    });

    document.getElementById("turnIndicator").textContent = "Tocca al Bianco";
}
