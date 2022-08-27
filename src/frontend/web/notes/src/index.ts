import "@js-joda/timezone";
import {renderQuickNotes} from "./ui/quickNotes";
import {fetchQuickNotes} from "./service/quickNotes";

const topLevelContainer = document.createElement('div') as HTMLDivElement;
document.body.appendChild(topLevelContainer);

renderQuickNotes(topLevelContainer);

fetchQuickNotes();