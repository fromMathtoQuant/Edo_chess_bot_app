
import { resetBoard, board } from "../core.js";
import { fixCanvasResolution, updateSquareSize, drawBoard, initUI, preloadImages } from "../ui.js";
import { enableInput } from "../input.js";

export function startMode() {
  console.log("Modalità JUDGE avviata");

  resetBoard();
  // Inserisci Sentinella
  board[3][3] = "S"; // esempio posizione

  initUI();
  fixCanvasResolution();
  updateSquareSize();

  preloadImages(() => {
    drawBoard(null, [], false, null, 0, 0);
    enableInput();
    document.getElementById("turnIndicator").textContent = "Tocca al Bianco";
  });
}
