import "@js-joda/timezone";
import {fetchQuickNotesInDateRange} from "./service/quickNotes";
import {LocalDate} from "@js-joda/core";
import {ContainerView} from "./ui/app/container";
import {div} from "./utility/element";

const topLevelContainer = div().inElement(document.body);

const view = new ContainerView(topLevelContainer);
view.setup();

const today = LocalDate.now();
const fourDaysAgo = today.minusDays(4);

fetchQuickNotesInDateRange(fourDaysAgo, today);