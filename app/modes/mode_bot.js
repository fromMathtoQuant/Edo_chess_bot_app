import { resetBoard, turn, getLegalMoves, applyMove } from "../core.js";
import { fixCanvasResolution, updateSquareSize, drawBoard } from "../ui.js";
import { enableInput } from "../input.js";

export function startMode() {
    resetBoard();
    fixCanvasResolution();
    updateSquareSize();
    enableInput();
    drawBoard(null, [], false, null, 0, 0);

    document.getElementById("turnIndicator").textContent = "Tocca al Bianco";

    window.onPlayerMove = () => {
        if (turn === "b") {
            const moves = [];

            for (let y = 0; y < 8; y++)
                for (let x = 0; x < 8; x++)
                    for (let m of getLegalMoves(x, y))
                        moves.push({ x1: x, y1: y, x2: m.x, y2: m.y });

            if (moves.length > 0) {
                const m = moves[Math.floor(Math.random() * moves.length)];
                applyMove(m.x1, m.y1, m.x2, m.y2);
                drawBoard(null, [], false, null, 0, 0);
            }
        }
    };
}
