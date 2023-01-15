import "@js-joda/timezone";
import {fetchQuickNotes, fetchQuickNotesInDateRange} from "./service/quickNotes";
import {LocalDate} from "@js-joda/core";
import {ContainerView} from "./ui/container";
import {div} from "./utility/element";

const topLevelContainer = div().inElement(document.body);

const view = new ContainerView(topLevelContainer);
view.setup();

fetchQuickNotes();

const today = LocalDate.now();
const fourDaysAgo = today.minusDays(4);

fetchQuickNotesInDateRange(fourDaysAgo, today);