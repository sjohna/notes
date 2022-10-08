import "@js-joda/timezone";
import {fetchQuickNotes, fetchQuickNotesInDateRange} from "./service/quickNotes";
import {QuickNoteView} from "./ui/quickNoteView";
import {LocalDate} from "@js-joda/core";

const topLevelContainer = document.createElement('div') as HTMLDivElement;
document.body.appendChild(topLevelContainer);

const view = new QuickNoteView(topLevelContainer);
view.setup();

fetchQuickNotes();

const today = LocalDate.now();
const fourDaysAgo = today.minusDays(4);

fetchQuickNotesInDateRange(fourDaysAgo, today);