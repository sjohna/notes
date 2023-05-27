import "@js-joda/timezone";
import {LoggedInContainerView} from "./ui/app/loggedInContainer";
import {div, flexColumn} from "./utility/element";
import {DocumentFilterService} from "./service/documentFilterService";
import {NoteService} from "./service/noteService";
import {TotalNotesOnDatesService} from "./service/totalNotesOnDatesService";
import {TagService} from "./service/tagService";
import {Services} from "./service/services";
import {GroupService} from "./service/groupService";
import {setInitialStateFromURL} from "./service/navigationService";
import {ContainerView} from "./ui/app/container";
import {AuthService} from "./service/authService";

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

const groups = new GroupService(notes);

const auth = new AuthService(tags, groups);

const services: Services = {
    documentFilterService: documentFilters,
    noteService: notes,
    tagService: tags,
    totalNotesOnDatesService: totalNotesOnDates,
    groupService: groups,
    authService: auth,
}

setInitialStateFromURL();

const view = new ContainerView(topLevelContainer, services);
view.setup();