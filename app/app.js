
import { startGameMode as startGameModeImpl } from "./main.js";
import { initUI, fixCanvasResolution, updateSquareSize, preloadImages, drawBoard } from "./ui.js";
import { enableInput } from "./input.js";

window.startGameMode = (mode) => startGameModeImpl(mode);

window.addEventListener("DOMContentLoaded", () => {
  initUI();

  const resize = () => {
    fixCanvasResolution();
    updateSquareSize();
    drawBoard(null, [], false, null, 0, 0);
  };

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => setTimeout(resize, 250));

  preloadImages(resize);
  enableInput();
});
