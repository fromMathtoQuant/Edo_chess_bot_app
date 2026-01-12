
import { startGameMode } from "./main.js";

// Espone l'API usata dallo script inline del menu
window.startGameMode = (mode) => startGameMode(mode);

// Non inizializziamo UI qui: lo fa la modalità scelta (classic/judge/bot,...)
