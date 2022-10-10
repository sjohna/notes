import "@js-joda/timezone";
import {fetchQuickNotes, fetchQuickNotesInDateRange} from "./service/quickNotes";
import {LocalDate} from "@js-joda/core";
import {ContainerView} from "./ui/container";

const topLevelContainer = document.createElement('div') as HTMLDivElement;
document.body.appendChild(topLevelContainer);

const view = new ContainerView(topLevelContainer);
view.setup();

fetchQuickNotes();

const today = LocalDate.now();
const fourDaysAgo = today.minusDays(4);

fetchQuickNotesInDateRange(fourDaysAgo, today);