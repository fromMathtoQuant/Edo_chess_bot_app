import { startMode as classic } from "./modes/mode_classic.js";
import { startMode as judge } from "./modes/mode_judge.js";
import { startMode as bot } from "./modes/mode_bot.js";
import { startMode as botjudge } from "./modes/mode_botjudge.js";

export function startGameMode(mode) {
    switch (mode) {
        case "classic": classic(); break;
        case "judge": judge(); break;
        case "bot": bot(); break;
        case "botjudge": botjudge(); break;
    }
}
