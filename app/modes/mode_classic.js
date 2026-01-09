import { resetBoard } from "../core.js";
import { fixCanvasResolution, updateSquareSize, drawBoard } from "../ui.js";
import { enableInput } from "../input.js";

export function startMode() {    
    console.log("Modalità CLASSIC avviata");

    resetBoard();
    initUI();              // <— IMPORTANTISSIMO
    fixCanvasResolution();
    updateSquareSize();

    enableInput();
    drawBoard(null, [], false, null, 0, 0);
    document.getElementById("turnIndicator").textContent = "Tocca al Bianco";
}
