import { startMode as classic } from "./modes/mode_classic.js";
import { startMode as judge } from "./modes/mode_judge.js";
import { startMode as bot } from "./modes/mode_bot.js";
import { startMode as botjudge } from "./modes/mode_botjudge.js";


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
      
    // case "bot":
    // alert("Modalità Bot è in via di sviluppo.");
    // Torna al menu principale
    // document.getElementById("gameUI").style.display = "none";
    // document.getElementById("startMenu").style.display = "flex";
    // break;
    case "bot": bot(); break;
      
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
