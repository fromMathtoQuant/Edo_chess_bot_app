import { startMode as classic } from "./modes/mode_classic.js";
import { startMode as judge } from "./modes/mode_judge.js";
import { startMode as bot } from "./modes/mode_bot.js";
import { startMode as botjudge } from "./modes/mode_botjudge.js";


// Stub delle altre modalità se non ci sono ancora:
export function startGameMode(mode) {
  switch (mode) {
    case "classic": classic(); break;
    case "judge":   alert("Modalità Judge non ancora implementata."); break;
    // case "judge": judge(); break;
    case "bot":     alert("Modalità Bot non ancora implementata."); break;
    // case "bot": bot(); break;
    case "botjudge":alert("Modalità Bot+Judge non ancora implementata."); break;
    // case "botjudge": botjudge(); break;
    default:
      alert("Modalità non trovata: " + mode);
      console.error("Modalità sconosciuta:", mode);
  }
}
