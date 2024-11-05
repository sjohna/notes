import {DocumentFilterService} from "./documentFilterService";
import {NoteService} from "./noteService";
import {TagService} from "./tagService";
import {TotalNotesOnDatesService} from "./totalNotesOnDatesService";
import {GroupService} from "./groupService";
import {AuthService} from "./authService";
import {NavigationService} from "./navigationService";

export interface Services {
    documentFilterService: DocumentFilterService;
    noteService: NoteService;
    tagService: TagService;
    groupService: GroupService;
    authService: AuthService;
    navService: NavigationService;
}

export let services: Services;

export function initServices(): void {
    const documentFilters = new DocumentFilterService();
    documentFilters.filter.sortBy = 'document_time';
    documentFilters.filter.sortDirection = 'descending';

    const auth = new AuthService();
    const notes = new NoteService(documentFilters, auth);
    const tags = new TagService(notes, auth);
    const groups = new GroupService(notes, auth);
    const nav = new NavigationService(auth);

    services = {
        documentFilterService: documentFilters,
        noteService: notes,
        tagService: tags,
        groupService: groups,
        authService: auth,
        navService: nav,
    }
}