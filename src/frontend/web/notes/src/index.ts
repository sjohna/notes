import "@js-joda/timezone";
import {ContainerView} from "./ui/app/container";
import {div} from "./utility/element";
import {DocumentFilterService} from "./service/documentFilterService";
import {QuickNoteService} from "./service/quickNoteService";
import {TotalQuickNotesOnDateService} from "./service/totalQuickNotesOnDateService";
import {TagService} from "./service/tagService";

document.body.style.height = '100%';

const topLevelContainer = div()
    .inElement(document.body);


const documentFilters = new DocumentFilterService();
documentFilters.filter.sortBy = 'document_time';
documentFilters.filter.sortDirection = 'descending';

const quickNotes = new QuickNoteService(documentFilters);

const totalQuickNotesOnDates = new TotalQuickNotesOnDateService();

const tags = new TagService(quickNotes);

const view = new ContainerView(topLevelContainer, quickNotes, totalQuickNotesOnDates, documentFilters, tags);
tags.get();
view.setup();