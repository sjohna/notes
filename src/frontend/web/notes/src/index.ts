import "@js-joda/timezone";
import {DocumentFilterService} from "./service/documentFilterService";
import {NoteService} from "./service/noteService";
import {TotalNotesOnDatesService} from "./service/totalNotesOnDatesService";
import {TagService} from "./service/tagService";
import {Services} from "./service/services";
import {GroupService} from "./service/groupService";
import {ContainerView} from "./ui/app/container";
import {AuthService} from "./service/authService";
import {NavigationService} from "./service/navigationService";
import {flexColumn} from "./utility/component";

document.body.style.height = '100%';
document.body.style.overflowY = 'hidden';

const topLevelContainer = flexColumn()
    .inElement(document.body)
    .height('100%');


const documentFilters = new DocumentFilterService();
documentFilters.filter.sortBy = 'document_time';
documentFilters.filter.sortDirection = 'descending';

const auth = new AuthService();

const notes = new NoteService(documentFilters, auth);

const totalNotesOnDates = new TotalNotesOnDatesService(auth);

const tags = new TagService(notes, auth);

const groups = new GroupService(notes, auth);

const nav = new NavigationService(auth);

window.onpopstate =  (event) => {
    nav.historyPopped(event.state);
};

const services: Services = {
    documentFilterService: documentFilters,
    noteService: notes,
    tagService: tags,
    totalNotesOnDatesService: totalNotesOnDates,
    groupService: groups,
    authService: auth,
    navService: nav,
}

nav.setInitialStateFromURL();

auth.loggedInChanged$.subscribe((loggedIn) => {
    if (loggedIn) {
        tags.get();
        groups.get();
    }
});

new ContainerView(services).in(topLevelContainer);