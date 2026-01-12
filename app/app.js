
import { startGameMode as startGameModeImpl } from "./main.js";
import { initUI, fixCanvasResolution, updateSquareSize, preloadImages, drawBoard } from "./ui.js";
import { enableInput } from "./input.js";

window.startGameMode = (mode) => startGameModeImpl(mode);

window.addEventListener("DOMContentLoaded", () => {

  };

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => setTimeout(resize, 250));

  preloadImages(resize);
  enableInput();
});
