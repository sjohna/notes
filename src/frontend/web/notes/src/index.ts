import "@js-joda/timezone";
import {fetchQuickNotes} from "./service/quickNotes";
import {QuickNoteView} from "./ui/quickNoteView";

const topLevelContainer = document.createElement('div') as HTMLDivElement;
document.body.appendChild(topLevelContainer);

const view = new QuickNoteView(topLevelContainer);
view.setup();

fetchQuickNotes();