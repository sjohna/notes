import "@js-joda/timezone";
import {ContainerView} from "./ui/app/container";
import {div, flexColumn} from "./utility/element";
import {DocumentFilterService} from "./service/documentFilterService";
import {QuickNoteService} from "./service/quickNoteService";
import {TotalQuickNotesOnDatesService} from "./service/totalQuickNotesOnDatesService";
import {TagService} from "./service/tagService";
import {Services} from "./service/services";

document.body.style.height = '100%';
document.body.style.overflowY = 'hidden';

const topLevelContainer = flexColumn()
    .inElement(document.body)
    .height('100%');


const documentFilters = new DocumentFilterService();
documentFilters.filter.sortBy = 'document_time';
documentFilters.filter.sortDirection = 'descending';

const quickNotes = new QuickNoteService(documentFilters);

const totalQuickNotesOnDates = new TotalQuickNotesOnDatesService();

const tags = new TagService(quickNotes);

const services: Services = {
    documentFilterService: documentFilters,
    quickNoteService: quickNotes,
    tagService: tags,
    totalQuickNotesOnDatesService: totalQuickNotesOnDates,
}

const view = new ContainerView(topLevelContainer, services);
tags.get();
view.setup();