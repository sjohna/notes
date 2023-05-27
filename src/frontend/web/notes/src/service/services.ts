import {DocumentFilterService} from "./documentFilterService";
import {NoteService} from "./noteService";
import {TagService} from "./tagService";
import {TotalNotesOnDatesService} from "./totalNotesOnDatesService";
import {GroupService} from "./groupService";
import {AuthService} from "./authService";

export interface Services {
    documentFilterService: DocumentFilterService;
    noteService: NoteService;
    tagService: TagService;
    totalNotesOnDatesService: TotalNotesOnDatesService;
    groupService: GroupService;
    authService: AuthService;
}