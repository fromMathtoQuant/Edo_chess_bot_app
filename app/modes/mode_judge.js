
import { resetBoard, board } from "../core.js";
import { fixCanvasResolution, updateSquareSize, drawBoard, initUI, preloadImages } from "../ui.js";
import { enableInput } from "../input.js";

export function startMode() {
  console.log("Modalità JUDGE avviata");

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

  // Inserisci la Sentinella. Usiamo "S" (ma funziona anche "s": UI mappa entrambe).
  board[pick.y][pick.x] = "S";
  alert(`Sentinella posizionata in: x=${pick.x}, y=${pick.y}`);

  initUI();

  preloadImages(() => {
    fixCanvasResolution();
    updateSquareSize();
    drawBoard(null, [], false, null, 0, 0);
    enableInput();
    document.getElementById("turnIndicator").textContent = "Tocca al Bianco";
  });
}
