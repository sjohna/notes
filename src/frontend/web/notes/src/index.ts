import "@js-joda/timezone";
import {ContainerView} from "./ui/app/container";
import {div, flexColumn} from "./utility/element";
import {DocumentFilterService} from "./service/documentFilterService";
import {NoteService} from "./service/noteService";
import {TotalNotesOnDatesService} from "./service/totalNotesOnDatesService";
import {TagService} from "./service/tagService";
import {Services} from "./service/services";
import {DocumentGroupService} from "./service/documentGroupService";
import {setInitialStateFromURL} from "./service/navigationService";

document.body.style.height = '100%';
document.body.style.overflowY = 'hidden';

const topLevelContainer = flexColumn()
    .inElement(document.body)
    .height('100%');


const documentFilters = new DocumentFilterService();
documentFilters.filter.sortBy = 'document_time';
documentFilters.filter.sortDirection = 'descending';

const notes = new NoteService(documentFilters);

const totalNotesOnDates = new TotalNotesOnDatesService();

const tags = new TagService(notes);

const documentGroups = new DocumentGroupService(notes);

const services: Services = {
    documentFilterService: documentFilters,
    noteService: notes,
    tagService: tags,
    totalNotesOnDatesService: totalNotesOnDates,
    documentGroupService: documentGroups,
}

setInitialStateFromURL();

const view = new ContainerView(topLevelContainer, services);
tags.get();
documentGroups.get();
view.setup();