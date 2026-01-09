import { resetBoard } from "../core.js";
import { fixCanvasResolution, updateSquareSize, drawBoard } from "../ui.js";
import { enableInput } from "../input.js";

export function startMode() {
    resetBoard();
    fixCanvasResolution();
    updateSquareSize();
    enableInput();
    drawBoard(null, [], false, null, 0, 0);

    alert("Modalità Giudice attiva");
}
