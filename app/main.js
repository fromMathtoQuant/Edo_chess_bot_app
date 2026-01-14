import { startMode as classic } from "./modes/mode_classic.js";
import { startMode as judge } from "./modes/mode_judge.js";
import { startMode as bot } from "./modes/mode_bot.js";
import { startMode as botjudge } from "./modes/mode_botjudge.js";

// Rileva se siamo in app/PWA/WebView e aggiunge classe app-mode
function isStandalone() {
  if (window.navigator.standalone) return true; // iOS PWA
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;

  const ua = navigator.userAgent || '';
  const isIOSWV = /\b(iPhone|iPad|iPod)\b/.test(ua) && !/Safari/i.test(ua);
  const isAndroidWV = /; wv\)/.test(ua) || /Version\/\d+\.\d+ Chrome\/\d+ Mobile/.test(ua);

  return isIOSWV || isAndroidWV;
}

// Applica classe app-mode se necessario
if (isStandalone()) {
  document.body.classList.add('app-mode');
} else {
  document.body.classList.remove('app-mode');
}

// Stub delle altre modalità se non ci sono ancora:
export function startGameMode(mode) {
  
  // Pulisci eventuali hook di modalità precedente
  window.onPlayerMove = null;

  //  rimuovi stile bot se presente
  const gameUI = document.getElementById("gameUI");
  if (gameUI) gameUI.classList.remove("bot-mode");

  switch (mode) {
    case "classic": classic(); break;
      
    case "judge": judge(); break;
      

    case "bot":
      // Attiva stile bot-mode per CSS dedicato
      if (gameUI) gameUI.classList.add("bot-mode");
      bot();
      break;
      
    case "botjudge":
    alert("Modalità Bot+Judge non ancora implementata."); 
    // Torna al menu principale
    document.getElementById("gameUI").style.display = "none";
    document.getElementById("startMenu").style.display = "flex";
    break;
    // case "botjudge": botjudge(); break;
      
    default:
      alert("Modalità non trovata: " + mode);
      console.error("Modalità sconosciuta:", mode);
  }
}
