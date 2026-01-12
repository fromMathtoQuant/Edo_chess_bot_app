
import { startGameMode } from "./main.js";
import { initUI, fixCanvasResolution, updateSquareSize, preloadImages, drawBoard } from "./ui.js";
import { enableInput } from "./input.js";

window.startGameMode = (mode) => startGameMode(mode);

window.addEventListener("DOMContentLoaded", () => {
  // Se vuoi inizializzare qualcosa qui, fallo dopo il DOM ready
  };

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => setTimeout(resize, 250));

  preloadImages(resize);
  enableInput();
});
