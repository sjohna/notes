import "@js-joda/timezone";
import {ContainerView} from "./ui/app/container";
import {div, flexColumn} from "./utility/element";
import {DocumentFilterService} from "./service/documentFilterService";
import {QuickNoteService} from "./service/quickNoteService";
import {TotalQuickNotesOnDatesService} from "./service/totalQuickNotesOnDatesService";
import {TagService} from "./service/tagService";
import {Services} from "./service/services";
import {DocumentGroupService} from "./service/documentGroupService";

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

const documentGroups = new DocumentGroupService(quickNotes);

const services: Services = {
    documentFilterService: documentFilters,
    quickNoteService: quickNotes,
    tagService: tags,
    totalQuickNotesOnDatesService: totalQuickNotesOnDates,
    documentGroupService: documentGroups,
}

// routing, based on https://dev.to/thedevdrawer/single-page-application-routing-using-hash-or-url-9jh
const route = (event: any) => {
    event = event || window.event; // get window.event if event argument not provided
    event.preventDefault();
    // window.history.pushState(state, unused, target link);
    window.history.pushState({}, "", event.target.href);
    locationHandler();
};

const locationHandler = async () => {
    let location = window.location.pathname; // get the url path
    // if the path length is 0, set it to primary page route
    if (location.length == 0) {
        location = "/";
    }

    document.title = `Path: ${location}`;
    console.log(`location: ${location}`);
};

window.onpopstate = locationHandler;
locationHandler();

const view = new ContainerView(topLevelContainer, services);
tags.get();
documentGroups.get();
view.setup();